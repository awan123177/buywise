const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('const getDodoPlanMap = () => {'));
// Remove everything until a line that seems to start a new function or app.
// I will just construct the full correct content and replace the whole file.
const content = `const getDodoPlanMap = () => {
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

// This is getting too complex with regexes. I will just find the block and replace it.
let fullContent = fs.readFileSync('server.ts', 'utf8');
const regex = /const getDodoPlanMap = \(\) => \{[\s\S]+?\}\};/g;
fullContent = fullContent.replace(regex, content);

// Now there might be extra code leftover, I'll search for the extra lines and remove them.
// Actually, just find the first occurrence and take it, remove the rest.
// I will manually fix it by just replacing the whole file content if I can.
// But I don't want to risk that.
// Let's just find the first 'const getDodoPlanMap' and ensure only that exists.

fs.writeFileSync('server.ts', fullContent);
