const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the verify-test endpoint we inserted
const verifyStart = code.indexOf('app.post("/api/gamification/premium/verify-test"');
if (verifyStart !== -1) {
  // Find where it ends. 
  // It ends at `// Helper middleware to extract user context` or before `app.get("/api/receipts/:receiptId"`
  const receiptStart = code.indexOf('app.get("/api/receipts/:receiptId"');
  if (receiptStart !== -1) {
     // Remove it from its current position
     const before = code.substring(0, verifyStart);
     const after = code.substring(receiptStart);
     const extracted = code.substring(verifyStart, receiptStart);
     
     code = before + after;
     
     // Now find a safe place to insert it AFTER `const getUserContext = `
     const getUserContextPos = code.indexOf('const getUserContext =');
     // Find the end of getUserContext block
     const adminAuthPos = code.indexOf('const adminAuth =', getUserContextPos);
     if (adminAuthPos !== -1) {
         code = code.substring(0, adminAuthPos) + extracted + "\n  " + code.substring(adminAuthPos);
         fs.writeFileSync('server.ts', code);
         console.log("Successfully moved verify-test endpoint");
     } else {
         console.log("Could not find adminAuth block");
     }
  } else {
     console.log("Could not find receiptStart");
  }
} else {
  console.log("Could not find verifyStart");
}
