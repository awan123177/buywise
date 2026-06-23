import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rymqndkihibagvnmlsle.supabase.co';
const supabaseAnonKey = 'sb_publishable_HemiQ7Dam7pBIao2VnMxgw_cJqgx0jU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
