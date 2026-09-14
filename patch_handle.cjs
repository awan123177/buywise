const fs = require('fs');
let content = fs.readFileSync('src/components/Premium.tsx', 'utf8');

// Replace new Razorpay with logs
const targetStr = `const rzp = new (window as any).Razorpay(options);`;
const replacementStr = `console.log("[RazorpayLoader] [7] Razorpay instance created");
        const rzp = new (window as any).Razorpay(options);`;

content = content.replace(targetStr, replacementStr);

const targetStr2 = `rzp.open();`;
const replacementStr2 = `console.log("[RazorpayLoader] [8] checkout.open() called");
        rzp.open();
        console.log("[RazorpayLoader] [9] checkout opened");`;
        
content = content.replace(targetStr2, replacementStr2);

fs.writeFileSync('src/components/Premium.tsx', content);
console.log("Patched handler successfully");
