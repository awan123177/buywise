const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rymqndkihibagvnmlsle.supabase.co', 'sb_publishable_HemiQ7Dam7pBIao2VnMxgw_cJqgx0jU');
supabase.from('premium_requests').select('*').then(res => console.log(JSON.stringify(res))).catch(console.error);
