const fs = require('fs');
try {
  let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
  let lines = code.split('\n');
  console.log("Lines 730-800:");
  console.log(lines.slice(730, 800).join('\n'));
} catch (e) {
  console.error(e);
}
