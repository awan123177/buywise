const fs = require('fs');
let content = fs.readFileSync('src/components/Premium.tsx', 'utf8');
const start = content.indexOf('const loadRazorpayScript = () => {');
const end = content.indexOf('const handlePurchase = async', start);
if (start !== -1 && end !== -1) {
    const replacement = `const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve, reject) => {
      if (typeof window === 'undefined') {
        return resolve(false);
      }
      
      if ((window as any).Razorpay) {
        return resolve(true);
      }

      const scriptId = 'razorpay-checkout-js';
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement;

      if (existingScript) {
        if ((window as any).Razorpay) return resolve(true);
        existingScript.addEventListener('load', () => resolve(!!(window as any).Razorpay));
        existingScript.addEventListener('error', () => reject(new Error("Failed to load Razorpay Checkout")));
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        if ((window as any).Razorpay) {
          resolve(true);
        } else {
          reject(new Error("Razorpay loaded but window.Razorpay is unavailable"));
        }
      };
      
      script.onerror = () => {
        reject(new Error("Failed to load Razorpay Checkout"));
      };
      
      document.body.appendChild(script);
    });
  };

  `;
    content = content.substring(0, start) + replacement + content.substring(end);
    fs.writeFileSync('src/components/Premium.tsx', content);
    console.log("Patched successfully");
} else {
    console.log("Could not find boundaries");
}
