import moment from "moment";
import { getSupabase } from "../_extra";

const supabase = getSupabase();

const _search = async (countryCode, cityName, priceFrom, priceTo) => {
    const result = await supabase.from("flights")
        .select()
        .eq("country_from_code", countryCode)
        .gte("price_eur", priceFrom)
        .lte("price_eur", priceTo)
        .gt("flight1_departure_time", moment().add(1, 'day').startOf('day').toISOString())

    const data = result.data

    console.log(`${data.length} flights found.`);

    return data.filter(o => {
        const flight1ArrivalEH = moment(o.flight1_arrival_time).format("EH")
        const flight2ArrivalEH = moment(o.flight2_arrival_time).format("EH")
        // E - day of week (1-7) H - Hour (00-23)
        const flight1Passed = [
            "506", "507", "508", "509", "510", "511", "512", "513", "514", "515", "516", "517", "518", "519", "520",
            "606", "607", "608", "609", "610", "611", "612", "613", "614", "615", "616", "617", "618", "619", "620"
        ].includes(flight1ArrivalEH)
        const flight2Passed = [
            "718", "719", "720", "721", "722", "723",
            "118", "119", "120", "121", "122", "123"
        ].includes(flight2ArrivalEH)

        return flight2Passed;
    }).map(o => ({
        ...o,
        flight1_airline_logo_url: getAirlineLogo(o.flight1_airline),
        flight2_airline_logo_url: getAirlineLogo(o.flight2_airline)
    }))
};

const getAirlineLogo = (airline) => {
    return `https://images.kiwi.com/airlines/32x32/${airline}.png?default=airline.png`;
};

export default _search;