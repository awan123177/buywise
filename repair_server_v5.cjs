const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The mess starts after the last `},` in the object declaration.
// Let's find the object ending.

const target = `    lifetime: {
      name: "Forever Founder",
      duration: "Lifetime",
      days: 36500,
      priceInr: 700,
      amountPaise: 70000,
},`;

const startIndex = code.indexOf(target) + target.length;
const nextPart = code.substring(startIndex);

// The mess ends around a certain point.
// I will just replace everything between the `},` and `app.post` with the correct function.

const appPostIndex = nextPart.indexOf('app.post');
const cleanPart = nextPart.substring(appPostIndex);

const correctFunction = `
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
};
`;

code = code.substring(0, startIndex) + correctFunction + '\n\n' + cleanPart;

fs.writeFileSync('server.ts', code);
