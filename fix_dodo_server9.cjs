const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /\/\/ Optional: save to local db to track initiated sessions[\s\S]*?\{ merge: true \}\);/g,
  `// Tracking disabled due to localStorage mock`
);

fs.writeFileSync('server.ts', code, 'utf8');
