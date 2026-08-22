const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The verified LIVE IDs
const liveMonthly = "pdt_0NlsfvmdNk8MOUZDAPwFC";
const liveYearly = "pdt_0NlsgR5lg7OyWQ7hPFPO9";
const liveForever = "pdt_0NlsgAgxtmImcGR7BFMmx";

// The corrected function
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

// Use a more specific replacement that covers all the malformed content
// It seems the patching script repeatedly inserted the same function. 
// I'll replace everything from 'const getDodoPlanMap' up to the first '};' that is followed by 'const' or the end of the file.
// Or just replace all occurrences.

// Actually, let's just use string replace to find the whole malformed block and replace it.
const malformedPattern = /const getDodoPlanMap = \(\) => \{.*?return \{.*?\};?\};?\};?\};?\};?/s;
code = code.replace(malformedPattern, newMapStr);

fs.writeFileSync('server.ts', code);
