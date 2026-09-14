const fs = require('fs');
let content = fs.readFileSync('src/components/Premium.tsx', 'utf8');

const targetStr = `const response = await fetch('/api/payments/razorpay/checkout', {`;
const replacementStr = `console.log("[RazorpayLoader] Calling /api/payments/razorpay/checkout with plan:", planToPurchase);
      const response = await fetch('/api/payments/razorpay/checkout', {`;

content = content.replace(targetStr, replacementStr);

const targetStr2 = `const checkoutData = await response.json();`;
const replacementStr2 = `const checkoutData = await response.json();
        console.log("[RazorpayLoader] Received checkoutData from server:", checkoutData);`;
        
content = content.replace(targetStr2, replacementStr2);

const targetStr3 = `console.error("Razorpay flow error:", rzpErr.message || rzpErr);`;
const replacementStr3 = `console.error("[RazorpayLoader] Razorpay flow error caught:", rzpErr.message, rzpErr.stack, rzpErr);`;
        
content = content.replace(targetStr3, replacementStr3);

fs.writeFileSync('src/components/Premium.tsx', content);
console.log("Patched handler2 successfully");
