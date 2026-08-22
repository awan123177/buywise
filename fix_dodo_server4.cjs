const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `dodoError: error.error,
      planId,
      env:`,
  `dodoError: error.error,
      planId: req.body?.planId,
      env:`
);

fs.writeFileSync('server.ts', code, 'utf8');
