const fs = require('fs');
let code = fs.readFileSync('src/components/PremiumSuccess.tsx', 'utf8');

const target = `'x-user-name': user.displayName || 'BuyWise User'`;
const replacement = `'x-user-name': encodeURIComponent(user.displayName || 'BuyWise User')`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/PremiumSuccess.tsx', code);
