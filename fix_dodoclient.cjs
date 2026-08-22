const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The original import might already exist, so let's just reuse dodoClient!
code = code.replace(/const dodoClient = new \(require\('dodopayments'\).default\)\(\{[^{}]*\}\);/g, '');

fs.writeFileSync('server.ts', code);
