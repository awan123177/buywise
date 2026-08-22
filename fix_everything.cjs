const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Construct the known good block
const goodBlock = `  },

const dodoClient = new DodoPayments({
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

// The broken part starts at '},const dodoClient' and ends at the first '};' after 'getDodoPlanMap'
// Actually I see '},const dodoClient ... });' 
// followed by 'monthly: "pdt_0NlsfvmdNk8MOUZDAPwFC"' etc.
// This means the function body is merged into the end of dodoClient.

// I will just find the whole area and replace it with goodBlock.
// The area starts at '},const dodoClient' and ends at the '};' of the function.
// This is not easy to find the end.
// I'll just search for the start and replace up to a reasonable point.

const start = code.indexOf('},const dodoClient');
const end = code.indexOf('monthly: "pdt_0NlsfvmdNk8MOUZDAPwFC"');
const end2 = code.indexOf('};', end + 100);

if (start !== -1 && end2 !== -1) {
    code = code.substring(0, start) + goodBlock + code.substring(end2 + 2);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed!");
} else {
    console.log("Not found!");
}
