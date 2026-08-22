const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I'll search for the *entire* problematic block, starting from the `dodoClient` definition
// and ending at the last `};` of `getDodoPlanMap`.
// This is more reliable.

const startMarker = 'const dodoClient = new DodoPayments({';
const endMarker = '};';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex + 500);

if (startIndex !== -1 && endIndex !== -1) {
    const goodBlock = `const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || "test_mode"
});

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
    code = code.substring(0, startIndex) + goodBlock + code.substring(endIndex + 2);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed!");
} else {
    console.log("Markers not found!");
}
