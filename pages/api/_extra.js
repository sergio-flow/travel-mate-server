// import 'dotenv/config'
// import axios from 'axios';

import { createClient } from "@supabase/supabase-js";

export const getSupabase = () => {
    const supabaseUrl = `https://${process.env.SUPA_ID}.supabase.co`;
    const supabaseKey = process.env.SUPA_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    return supabase;
}




