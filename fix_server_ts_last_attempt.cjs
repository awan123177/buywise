const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const correctCode = `  },

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || "test_mode"
});

const getDodoPlanMap = () => {
  const isLive = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
  if (isLive) {
    return {
      monthly: "pdt_0NlsfvmdNk8MOUZDAPwFC",
      yearly: "pdt_0NlsgR5lg7OyWQ7hPFPO9",
      lifetime: "pdt_0NlsgAgxtmImcGR7BFMmx"
    };
  }
  return {
    monthly: "pdt_0Nlt1WQA2BzUbLbetJ4pm",
    yearly: "pdt_0Nlt1WS3rbm20BWDim4ZQ",
    lifetime: "pdt_0Nlt1WTtCUeiKeKnQRwsP"
  };
};`;

// Find the block and replace it.
// The broken block starts at '},const dodoClient'
const start = code.indexOf('},const dodoClient');
const end = code.indexOf('};', start + 100);

if (start !== -1 && end !== -1) {
    code = code.substring(0, start) + correctCode + code.substring(end + 2);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed!");
} else {
    console.log("Not found!");
}
