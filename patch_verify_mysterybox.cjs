const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
const target = `const { activateUserPremium } = await import('./src/server/gamificationDb.ts');
       activateUserPremium(userId, "unknown@buywise.in", req.userContext?.name || "User", subDays, planId);`;
const replacement = `const { activateUserPremium, claimFounderMysteryBox } = await import('./src/server/gamificationDb.ts');
       activateUserPremium(userId, "unknown@buywise.in", req.userContext?.name || "User", subDays, planId);
       if (planId === 'lifetime' || planId === 'buywise_founder_forever') {
            try {
               claimFounderMysteryBox(userId);
            } catch (err: any) {
               console.log(\`Mystery Box already claimed or error for \${userId}:\`, err.message);
            }
       }`;
if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Patched successfully.");
} else {
  console.log("Target not found!");
}
