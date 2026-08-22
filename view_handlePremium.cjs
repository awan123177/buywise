const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf8').split('\n');
let start = lines.findIndex(l => l.includes('const handlePremiumActivation ='));
for (let i = start; i < start + 90; i++) {
  console.log(lines[i]);
}
