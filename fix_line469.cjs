const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/if \(!\(\(admin as any\)\.apps \|\| \(admin\.default as any\)\.apps\)\.length\) \{/g, `if (!(((admin as any).apps?.length) || ((admin.default as any)?.apps?.length))) {`);
fs.writeFileSync('server.ts', code);
