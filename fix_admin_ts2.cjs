const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// replace `if (data)` when followed by nothing or `}` with `{}`
code = code.replace(/if\s*\(data\)\s*\n\s*\};/g, 'if (data) {}\n      };');

fs.writeFileSync('src/components/AdminPanel.tsx', code);
