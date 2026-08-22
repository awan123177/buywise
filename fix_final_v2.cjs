const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The verified LIVE IDs
const liveMonthly = "pdt_0NlsfvmdNk8MOUZDAPwFC";
const liveYearly = "pdt_0NlsgR5lg7OyWQ7hPFPO9";
const liveForever = "pdt_0NlsgAgxtmImcGR7BFMmx";

// Correct map
const correctMap = `{
  monthly: '${liveMonthly}',
  yearly: '${liveYearly}',
  lifetime: '${liveForever}'
}`;

// The specific code block that is causing the problem:
// "},const dodoClient ... });"
// And then the getDodoPlanMap function.

code = code.replace(/},const dodoClient = new DodoPayments\(\{[\s\S]+?\}\);/, 
    `},\n\nconst dodoClient = new DodoPayments({\n  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",\n  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT as any) || "test_mode"\n});\n\nconst getDodoPlanMap = () => {\n  const isLive = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';\n  if (isLive) {\n    return ${correctMap};\n  }\n  return {\n    monthly: 'pdt_0Nlt1WQA2BzUbLbetJ4pm',\n    yearly: 'pdt_0Nlt1WS3rbm20BWDim4ZQ',\n    lifetime: 'pdt_0Nlt1WTtCUeiKeKnQRwsP'\n  };\n};`);

fs.writeFileSync('server.ts', code);
