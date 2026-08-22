const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I will look for any `getDodoPlanMap` definition and ensure it is correct.
// Replace all `const getDodoPlanMap` with the correct definition.
const correctDefinition = `
const getDodoPlanMap = () => {
  const isLive = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
  if (isLive) {
    return {
      monthly: 'pdt_0NlsfvmdNk8MOUZDAPwFC',
      yearly: 'pdt_0NlsgR5lg7OyWQ7hPFPO9',
      lifetime: 'pdt_0NlsgAgxtmImcGR7BFMmx'
    };
  }
  return {
    monthly: 'pdt_0Nlt1WQA2BzUbLbetJ4pm',
    yearly: 'pdt_0Nlt1WS3rbm20BWDim4ZQ',
    lifetime: 'pdt_0Nlt1WTtCUeiKeKnQRwsP'
  };
};`;

// Remove all existing `getDodoPlanMap` definitions.
// I will split by `const getDodoPlanMap`.
const parts = code.split(/const getDodoPlanMap =.*?\};/s);
// This is not quite right because I have multiple ways it's declared.
// I will just search for `const getDodoPlanMap` and replace up to the next semicolon.

// Actually, I'll use a regex to replace everything that looks like `const getDodoPlanMap = ...`
code = code.replace(/const getDodoPlanMap =.*?\};/sg, '');
code += correctDefinition;

fs.writeFileSync('server.ts', code);
