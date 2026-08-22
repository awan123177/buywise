const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const correctFunction = `const getDodoPlanMap = () => {
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

// Use a strict replacement targeting the specific broken lines
const brokenPattern = /const getDodoPlanMap = \(\) => \{[\s\S]+?\}\};[\s\S]+?\}\};[\s\S]+?\}\};/g;

code = code.replace(brokenPattern, correctFunction);
fs.writeFileSync('server.ts', code);
