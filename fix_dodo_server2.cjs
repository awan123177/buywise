const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importRegex = /import DodoPayments from 'dodopayments';\n/g;
code = code.replace(importRegex, "");
code = "import DodoPayments from 'dodopayments';\n" + code;

fs.writeFileSync('server.ts', code, 'utf8');
