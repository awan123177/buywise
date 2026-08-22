const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/environment:\s*process\.env\.DODO_PAYMENTS_ENVIRONMENT \|\| 'test_mode'/g, "environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || 'test_mode'");

fs.writeFileSync('server.ts', code, 'utf8');
