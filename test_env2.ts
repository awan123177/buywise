import 'dotenv/config';
console.log("Keys:", Object.keys(process.env).filter(k => k.includes('DODO')));
