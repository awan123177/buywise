import { createClient } from '@supabase/supabase-js';

const getEnvUrl = () => {
  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return 'https://placeholder.supabase.co';
  }
  return url;
};

const getEnvKey = () => {
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return 'placeholder_anon_key';
  }
  return key;
};

export const hasSupabase = getEnvUrl() !== 'https://placeholder.supabase.co';
export const supabase = createClient(getEnvUrl(), getEnvKey());
