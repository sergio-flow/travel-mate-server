import moment from 'moment';
import cheerio from 'cheerio';

import { getSupabase } from "../_extra";

const supabase = getSupabase();

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    try {
        const urlParams = new URL(request.url).searchParams;
        const { query } = Object.fromEntries(urlParams);

        // Fetch HTML content from the web page using fetch
        let response = await fetch(`https://www.accuweather.com/en/search-locations?query=${query}`);
        let html = await response.text();

        // Extract data using cheerio
        let $ = cheerio.load(html);

        const link = $('.locations-list a:first').attr('href');


        response = await fetch(`https://www.accuweather.com${link}`);
        response = await fetch(response.url);
        html = await response.text();

        $ = cheerio.load(html);

        const monthlyLink = $('a.subnav-item:nth-of-type(6)').attr('href');

        const currentMonthLink = `https://www.accuweather.com${monthlyLink}`;

        response = await fetch(currentMonthLink);
        html = await response.text();

        $ = cheerio.load(html);

        const otherLinks = [currentMonthLink]
        $('.more-cta-links a').each((i, o) => {
            const href = $(o).attr('href');

            if (href.includes("?year")) {
                otherLinks.push(`https://www.accuweather.com${href}`)
            }
        })

        console.log(otherLinks)

        const location = $('.header-loc').text().trim().split(',')[0];
        const month = $('.map-dropdown:nth-of-type(1) h2').text().trim();
        const year = $('.map-dropdown:nth-of-type(2) h2').text().trim();

        const dayPanelObjects = [];

        $('.monthly-daypanel').each((index, dayPanel) => {
            const day = parseInt($(dayPanel).find('.date').text().trim());
            const high = parseInt($(dayPanel).find('.high').text().trim());
            const low = parseInt($(dayPanel).find('.low').text().trim());
            const svg = $(dayPanel).find('svg');
            const description = svg ? svg.attr('alt') : '';
            const icon = svg && svg.attr('data-src') ? svg.attr('data-src').replace('/images', '') : '';

            if (index < 10 && day > 20) {
                return;
            }

            if (index > 20 && day < 10) {
                return;
            }

            const panelObject = {
                city_name: location,
                date: moment(`${day}/${month}/${year}`, "D/MMMM/YYYY").format("YYYY-MM-DD"),
                high,
                low,
                description,
                icon,
            };

            dayPanelObjects.push(panelObject);
        });

        const data = {};

        dayPanelObjects.forEach((item) => {
            const { date, ...rest } = item;
            data[date] = rest;
        });

        const dates = Object.keys(data);

        await supabase
            .from("weather")
            .delete()
            .eq("city_name", location)
            .in("date", dates)

        await supabase
            .from("weather")
            .insert(dayPanelObjects)

        return new Response(
            JSON.stringify({
                location,
                month,
                year,
                data
            }),
            {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                },
            },
        );
    } catch (error) {
        console.error('Error:', error.message, error);

        return new Response(
            "Something went wrong.",
            {
                status: 500,
                headers: {
                    'content-type': 'application/json',
                },
            },
        );
    }
}
