import { createClient } from '@supabase/supabase-js'

// Is saying "Go read the database URL and key from the .env file.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Connects your website to your Supabase project by creating a variable called `supabase` that you can use to interact with your database.
export const supabase = createClient(supabaseUrl, supabaseKey)
