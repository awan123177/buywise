const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `const { session_id, payment_id, subscription_id } = req.body;
    if (!session_id && !payment_id && !subscription_id) {`;
       
const replacement = `let { session_id, payment_id, subscription_id } = req.body;
    session_id = session_id === 'null' ? null : session_id;
    payment_id = payment_id === 'null' ? null : payment_id;
    subscription_id = subscription_id === 'null' ? null : subscription_id;
    if (!session_id && !payment_id && !subscription_id) {`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
