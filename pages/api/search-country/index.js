import _search from "./_search.js"

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    const urlParams = new URL(request.url).searchParams;
    const query = Object.fromEntries(urlParams);

    const flights = await _search(query.countryCode);

    return new Response(
        JSON.stringify(flights),
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        },
    );
}