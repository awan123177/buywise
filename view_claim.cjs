const fs = require('fs');
const lines = fs.readFileSync('src/server/gamificationDb.ts', 'utf8').split('\n');
let start = lines.findIndex(l => l.includes('export function claimFounderMysteryBox'));
for (let i = start; i < start + 50; i++) {
  console.log(lines[i]);
}
