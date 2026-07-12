const https = require('https');
https.get('https://www.amazon.in/gp/product/B0H7JS5HP2', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
    if(titleMatch) console.log(titleMatch[1]);
  });
});
