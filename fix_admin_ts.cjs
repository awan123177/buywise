const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// I replaced `setPremiumRequests(...)` with `// setPremiumRequests(...)` which left lines like:
// await getDocs(q);
// // setPremiumRequests(data);
// Let's just remove the comment line entirely if it's causing issues.
code = code.replace(/\/\/ setPremiumRequests\([\s\S]*?\);/g, '');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
