const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `if (payId && !isSuccess) {
       const pay = await dodoClient.payments.retrieve(payId);
       if (pay.status === 'succeeded') {`;
       
const replacement = `if (payId && !isSuccess) {
       console.log("Retrieving payment with payId:", payId);
       const pay = await dodoClient.payments.retrieve(payId);
       console.log("Retrieved payment status:", pay.status);
       if (pay.status === 'succeeded') {`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
