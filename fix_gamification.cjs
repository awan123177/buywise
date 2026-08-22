const fs = require('fs');
let code = fs.readFileSync('src/server/gamificationDb.ts', 'utf8');

code = code.replace(/\["daily", "weekly", "monthly", "yearly", "lifetime"\]/g, 
`["monthly", "yearly", "lifetime"]`);

fs.writeFileSync('src/server/gamificationDb.ts', code, 'utf8');
