const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const newMap = `const getDodoPlanMap = () => {
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

// This regex targets the entire function body based on the known start/end,
// ensuring I catch the duplicate garbage.
code = code.replace(/const getDodoPlanMap = \(\) => \{[\s\S]+?\}\};/s, newMap);

fs.writeFileSync('server.ts', code);
