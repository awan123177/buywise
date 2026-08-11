const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');
console.log(code.includes('showPayment'));
