const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldInit = `  const dodoClient = new DodoPayments({ 
    bearerToken: process.env.DODO_PAYMENTS_API_KEY, 
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode')
  });`;

const newInit = `  let _dodoClientInstance = null;
  const dodoClient = new Proxy({}, {
    get(target, prop) {
      if (!_dodoClientInstance) {
        const apiKey = process.env.DODO_PAYMENTS_API_KEY;
        if (!apiKey) {
          throw new Error("DODO_PAYMENTS_API_KEY environment variable is missing or empty");
        }
        _dodoClientInstance = new DodoPayments({
          bearerToken: apiKey,
          environment: process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode'
        });
      }
      return _dodoClientInstance[prop];
    }
  });`;

code = code.replace(oldInit, newInit);
fs.writeFileSync('server.ts', code);
