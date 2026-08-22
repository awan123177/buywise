const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The verified LIVE IDs
const liveMonthly = "pdt_0NlsfvmdNk8MOUZDAPwFC";
const liveYearly = "pdt_0NlsgR5lg7OyWQ7hPFPO9";
const liveForever = "pdt_0NlsgAgxtmImcGR7BFMmx";

const newMapStr = `const getDodoPlanMap = () => {
  const isLive = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode';
  if (isLive) {
    return {
      monthly: '${liveMonthly}',
      yearly: '${liveYearly}',
      lifetime: '${liveForever}'
    };
  }
  return {
    monthly: 'pdt_0Nlt1WQA2BzUbLbetJ4pm',
    yearly: 'pdt_0Nlt1WS3rbm20BWDim4ZQ',
    lifetime: 'pdt_0Nlt1WTtCUeiKeKnQRwsP'
  };
};`;

// Use a more robust replacement that matches the whole function body
code = code.replace(/const getDodoPlanMap = \(\) => \{.*?\};/gs, newMapStr);

fs.writeFileSync('server.ts', code);
