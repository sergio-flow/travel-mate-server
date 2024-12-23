import { getSupabase } from "../_extra";

const supabase = getSupabase();

export const config = {
    runtime: 'edge',
};

export default async function handler() {
    const { data, error } = await supabase.from("countries_cities_view").select()

    console.log(data, error)

    console.log(`${data.length} flights found.`);

    return new Response(
        JSON.stringify(data),
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        },
    );
}