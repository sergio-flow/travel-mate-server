import moment from "moment";
import { getSupabase } from "../_extra";
import overview from './../../../utils/overview';
import { slugify } from "../../../utils/slugify";

const slugifyKeys = (obj) => {
    const slugifiedObj = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const slugifiedKey = slugify(key);

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                slugifiedObj[slugifiedKey] = slugifyKeys(obj[key]);
            } else {
                slugifiedObj[slugifiedKey] = obj[key];
            }
        }
    }

    return slugifiedObj;
};

const overviewSlugified = slugifyKeys(overview);

const supabase = getSupabase();

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    const urlParams = new URL(request.url).searchParams;
    const query = Object.fromEntries(urlParams);

    const cityId = overviewSlugified[query.country][query.city]

    const flights = await getFlights({
        cityId,
        week: query.week,
        dayFrom: query.dayFrom,
        dayTo: query.dayTo,
        priceLte: query.priceLte
    });

    return new Response(
        JSON.stringify({ flights }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        },
    );
}

const getFlights = async (query) => {
    const { cityId, week, dayFrom, dayTo, priceLte } = query;

    const weekStart = moment().add(week, 'weeks').startOf('week').toISOString();

    const dateTo = moment(weekStart).add(7, 'days').format('DD/MM/YYYY');

    const params = {
        date_from: moment(weekStart).add(4, 'days').format("DD/MM/YYYY"), // Thu-Fri-Sat
        date_to: moment(weekStart).add(6, 'days').format("DD/MM/YYYY"), // Sunday
        return_from: dateTo,
        return_to: dateTo,
        fly_from: `city:${cityId}`,
        fly_to: "",
        max_stopovers: 0,
        sort: "price",
        limit: 1000,
        adults: 1,
        max_fly_duration: 3,
        price_from: 0,
        price_to: parseInt(priceLte),
        curr: "EUR",
        locale: "en",
        ret_from_diff_city: false,
        ret_to_diff_city: false,
    }

    console.log(params)

    const url = "https://api.tequila.kiwi.com/v2/search";
    const headers = {
        accept: "application/json",
        apikey: process.env.KIWI_API_KEY
    };

    const queryParams = new URLSearchParams(params);
    const fullUrl = `${url}?${queryParams.toString()}`;

    try {
        const response = await fetch(fullUrl, { headers });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return filterFlights(data.data);
    } catch (error) {
        console.error("Error:", error.message);

        throw error;
    }
};

const filterFlights = async (data) => {
    return data.filter(o => o['route'].length === 2).filter(o => {
        const flight1 = o['route'][0];
        const flight2 = o['route'][1];

        const flight1ArrivalEH = moment(flight1.local_departure).format("EH")
        const flight2ArrivalEH = moment(flight2.local_arrival).format("EH")
        // E - day of week (1-7) H - Hour (00-23)
        const flight1Passed = [
            "406", "407", "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418",
            "506", "507", "508", "509", "510", "511", "512", "513", "514", "515", "516", "517", "518",
            "606", "607", "608", "609", "610", "611", "612", "613", "614", "615", "616", "617", "618"
        ].includes(flight1ArrivalEH)
        const flight2Passed = [
            "718", "719", "720", "721", "722", "723",
            "118", "119", "120", "121", "122", "123"
        ].includes(flight2ArrivalEH)

        return flight1Passed && flight2Passed;
    })
    // .map(o => ({
    //     ...o,
    //     flight1_airline_logo_url: getAirlineLogo(o.flight1_airline),
    //     flight2_airline_logo_url: getAirlineLogo(o.flight2_airline)
    // }))
};

const getAirlineLogo = (airline) => {
    return `https://images.kiwi.com/airlines/32x32/${airline}.png?default=airline.png`;
};

