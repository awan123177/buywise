import { createClient } from '@supabase/supabase-js';

export const hasSupabase = !!(import.meta as any).env.VITE_SUPABASE_URL;
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


