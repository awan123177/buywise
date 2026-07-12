import fs from 'fs';
const data = JSON.parse(fs.readFileSync('data_store.json', 'utf8'));
console.log(JSON.stringify(data.affiliateSettings, null, 2));
