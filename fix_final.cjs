const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/},const dodoClient/g, '},\n\nconst dodoClient');
fs.writeFileSync('server.ts', code);
