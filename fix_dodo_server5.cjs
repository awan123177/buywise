const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `console.error("Dodo checkout error details:", {`,
  `require('fs').writeFileSync('dodo_error.json', JSON.stringify({
      status: error.status,
      message: error.message,
      dodoError: error.error,
      planId: req.body?.planId,
      env: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode'
    }, null, 2));
    console.error("Dodo checkout error details:", {`
);

fs.writeFileSync('server.ts', code, 'utf8');
