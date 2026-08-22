const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix Dodo initialization
code = code.replace(
/const dodoApiKey = process\.env\.DODO_PAYMENTS_API_KEY;[\s\S]*?const dodoClient = new DodoPayments\(dodoApiKey, dodoEnv\);/,
`const dodoApiKey = process.env.DODO_PAYMENTS_API_KEY;
  const dodoEnv = process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode';
  
  console.log("--- START DIAGNOSTICS ---");
  console.log("DODO_PAYMENTS_API_KEY:", process.env.DODO_PAYMENTS_API_KEY ? "PRESENT" : (process.env.DODO_PAYMENTS_API_KEY === "" ? "EMPTY" : "MISSING"));
  console.log("DODO_PAYMENTS_WEBHOOK_KEY:", process.env.DODO_PAYMENTS_WEBHOOK_KEY ? "PRESENT" : (process.env.DODO_PAYMENTS_WEBHOOK_KEY === "" ? "EMPTY" : "MISSING"));
  console.log("DODO_PAYMENTS_ENVIRONMENT:", dodoEnv);
  console.log("DODO_PAYMENTS_RETURN_URL:", process.env.DODO_PAYMENTS_RETURN_URL ? "PRESENT" : (process.env.DODO_PAYMENTS_RETURN_URL === "" ? "EMPTY" : "MISSING"));
  console.log("PORT:", process.env.PORT ? process.env.PORT : 3000);
  console.log("HOST: 0.0.0.0");
  console.log("--- END DIAGNOSTICS ---");

  const dodoClient = new DodoPayments({ 
    bearerToken: process.env.DODO_PAYMENTS_API_KEY, 
    environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode')
  });`
);

// Fix PORT
code = code.replace(
/const PORT = 3000;/,
`const PORT = process.env.PORT || 3000;`
);

fs.writeFileSync('server.ts', code);
