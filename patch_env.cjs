const fs = require('fs');
let env = fs.readFileSync('.env.example', 'utf8');
env += `\nDODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_KEY=
DODO_PAYMENTS_ENVIRONMENT=
DODO_PAYMENTS_RETURN_URL=`;
fs.writeFileSync('.env.example', env, 'utf8');
