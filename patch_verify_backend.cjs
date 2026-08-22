const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(\!isSuccess\) \{[\s\S]*?return res\.json\(\{ verified: false, status: 'pending' \}\);[\s\S]*?\}/;
const match = code.match(regex);
if (match) {
   const replacement = `
    if (!isSuccess) {
       let currentStatus = 'pending';
       if (session_id) {
          const sess = await dodoClient.checkoutSessions.retrieve(session_id);
          currentStatus = sess.payment_status || 'pending';
       } else if (subId) {
          const sub = await dodoClient.subscriptions.retrieve(subId);
          currentStatus = sub.status || 'pending';
       } else if (payId) {
          const pay = await dodoClient.payments.retrieve(payId);
          currentStatus = pay.status || 'pending';
       }
       return res.json({ verified: false, status: currentStatus });
    }
   `.trim();
   code = code.replace(match[0], replacement);
   fs.writeFileSync('server.ts', code);
   console.log("Patched server verify");
} else {
   console.log("No match found");
}
