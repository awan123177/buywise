const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `try {
         const { activateUserPremium } = await import('./src/server/gamificationDb.ts');
         activateUserPremium(userId, "unknown@buywise.in", "User", subDays, planId);
      } catch(e) {
         console.error("Memory update failed", e.message);
      }`;

const replacement = `try {
         const { activateUserPremium, claimFounderMysteryBox } = await import('./src/server/gamificationDb.ts');
         activateUserPremium(userId, "unknown@buywise.in", "User", subDays, planId);
         if (planId === 'lifetime' || planId === 'buywise_founder_forever') {
            try {
               claimFounderMysteryBox(userId);
               console.log(\`Successfully triggered Forever Founder Mystery Box for \${userId}\`);
            } catch (err: any) {
               console.log(\`Mystery Box already claimed or error for \${userId}:\`, err.message);
            }
         }
      } catch(e: any) {
         console.error("Memory update failed", e.message);
      }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('server.ts', code);
  console.log("Patched successfully.");
} else {
  console.log("Target not found!");
}
