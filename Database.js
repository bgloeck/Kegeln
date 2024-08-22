import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js'
import { DB_URL, API_KEY } from "@env";

// Create a single supabase client for interacting with your database
const supabase = createClient(
    DB_URL,
    API_KEY
)

export default supabase
