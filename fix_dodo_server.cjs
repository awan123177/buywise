const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /import DodoPayments from 'dodopayments';[\s\S]*?res\.status\(500\)\.json\({ error: "Internal server error" }\);\n  }\n}\);\n/g;

const match = code.match(regex);
if (match) {
  code = code.replace(regex, "");
  
  // Find getUserContext
  const getContextIdx = code.indexOf("const getUserContext = (req: any, res: any, next: any) => {");
  // Find where it ends
  const nextAppMethod = code.indexOf("app.get", getContextIdx);
  
  code = code.substring(0, nextAppMethod) + "\n" + match[0] + "\n" + code.substring(nextAppMethod);
  fs.writeFileSync('server.ts', code, 'utf8');
} else {
  console.log("No match found");
}

