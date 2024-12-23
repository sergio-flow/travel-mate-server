import _scrape from "./_scrape.js"

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    const urlParams = new URL(request.url).searchParams;
    const query = Object.fromEntries(urlParams);

    const dayFrom = query.dayFrom ? parseInt(query.dayFrom) : 6
    const dayTo = query.dayFrom ? parseInt(query.dayTo) : 7

    const flightsAdded = await _scrape(dayFrom, dayTo);

    return new Response(
        JSON.stringify(flightsAdded),
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        },
    );
}