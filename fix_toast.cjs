const fs = require('fs');
let code = fs.readFileSync('src/components/FounderMysteryBox.tsx', 'utf8');
code = code.replace(/toast\("Forever Founder purchases are coming soon!"\);/g, 'toast("Forever Founder purchases are coming soon!", { icon: "ℹ️" });');
fs.writeFileSync('src/components/FounderMysteryBox.tsx', code);
