import dotenv from 'dotenv';
import fs from 'fs';
process.env.MY_VAR = "real_value";
fs.writeFileSync('.env', 'MY_VAR=\n');
dotenv.config({ override: true });
console.log("MY_VAR is now:", process.env.MY_VAR);
