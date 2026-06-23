import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://rymqndkihibagvnmlsle.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_HemiQ7Dam7pBIao2VnMxgw_cJqgx0jU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
