const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/premiumPlan: 'buywise_premium_' \+ planId,/g, "premiumPlan: planId === 'lifetime' ? 'buywise_founder_forever' : 'buywise_premium_' + planId,");

fs.writeFileSync('server.ts', code, 'utf8');
