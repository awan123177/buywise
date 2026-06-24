const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rymqndkihibagvnmlsle.supabase.co', 'sb_publishable_HemiQ7Dam7pBIao2VnMxgw_cJqgx0jU');

const longName = "Test Name|||data:image/png;base64," + "A".repeat(10000);
supabase.from('premium_requests').insert([
  {
    userId: '6022454b-b82f-4478-927c-310f7964f4c1',
    email: 'test@example.com',
    plan: 'WEEK',
    status: 'pending',
    timestamp: new Date().toISOString(),
    name: longName,
    utr: '123456789012'
  }
]).then(res => {
  console.log("INSERT RESULT:", JSON.stringify(res));
  // Clean it up
  if (res.data && res.data[0]) {
    supabase.from('premium_requests').delete().eq('id', res.data[0].id).then(d => console.log("CLEANUP DONE"));
  } else {
    // try to query and delete
    supabase.from('premium_requests').select('*').eq('email', 'test@example.com').then(q => {
      if (q.data) {
        Promise.all(q.data.map(r => supabase.from('premium_requests').delete().eq('id', r.id))).then(() => console.log("CLEANED UP BY EMAIL"));
      }
    });
  }
}).catch(console.error);

