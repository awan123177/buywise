const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const getUserContextPos = code.indexOf('const getUserContext =');
const receiptPos = code.indexOf('app.get("/api/receipts/:receiptId"');
console.log('getUserContext:', getUserContextPos);
console.log('receiptPos:', receiptPos);
