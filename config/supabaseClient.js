import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.DATABASE_URL_GENERAL;
const supabaseAnonKey = process.env.DATABASE_ANON;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
