const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
let lines = code.split('\n');
console.log("Lines 820-880:");
console.log(lines.slice(820, 880).join('\n'));
