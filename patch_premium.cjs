const fs = require('fs');
const file = 'src/components/PremiumSuccess.tsx';
let content = fs.readFileSync(file, 'utf-8');

const newCheckStatus = `
    const checkStatus = async () => {
      try {
        const verifyRes = await fetch('/api/gamification/premium/verify-test', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'x-user-id': user.uid,
             'x-user-email': user.email || ''
           }
        });
        const verifyData = await verifyRes.json();
        
        if (verifyData.success) {
           await refreshPremium();
           setStatus('success');
           clearInterval(interval);
        } else {
           // Also check if refreshPremium somehow became true
           const isPremium = await refreshPremium();
           if (isPremium) {
              setStatus('success');
              clearInterval(interval);
           } else {
              setAttempts(a => a + 1);
           }
        }
      } catch (err) {
        console.error(err);
      }
    };
`;

content = content.replace(/const checkStatus = async \(\) => \{[\s\S]*?\};/, newCheckStatus.trim());

fs.writeFileSync(file, content);
