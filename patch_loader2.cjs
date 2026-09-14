const fs = require('fs');
let content = fs.readFileSync('src/components/Premium.tsx', 'utf8');
const start = content.indexOf('const loadRazorpayScript = () => {');
const end = content.indexOf('const handlePurchase = async', start);
if (start !== -1 && end !== -1) {
    const replacement = `const loadRazorpayScript = () => {
    console.log("[RazorpayLoader] [1] Payment button clicked (or script load initiated)");
    return new Promise<boolean>((resolve, reject) => {
      console.log("[RazorpayLoader] [2] loadRazorpayScript started");
      if (typeof window === 'undefined') {
        return resolve(false);
      }
      
      if ((window as any).Razorpay) {
        console.log("[RazorpayLoader] [6] window.Razorpay already exists");
        return resolve(true);
      }

      const scriptId = 'razorpay-checkout-js';
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement;

      if (existingScript) {
        console.log("[RazorpayLoader] [3] Existing Razorpay script found, loading: " + existingScript.src);
        if ((window as any).Razorpay) {
            console.log("[RazorpayLoader] [6] window.Razorpay exists (from existing script)");
            return resolve(true);
        }
        existingScript.addEventListener('load', () => {
            console.log("[RazorpayLoader] [5] checkout.js load event fired on existing script");
            resolve(!!(window as any).Razorpay);
        });
        existingScript.addEventListener('error', () => {
            console.log("[RazorpayLoader] Error loading existing script");
            reject(new Error("Failed to load Razorpay Checkout"));
        });
        return;
      }

      console.log("[RazorpayLoader] [3] Existing Razorpay script not found. Creating new script...");
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log("[RazorpayLoader] [5] checkout.js load event fired");
        if ((window as any).Razorpay) {
          console.log("[RazorpayLoader] [6] window.Razorpay exists!");
          resolve(true);
        } else {
          console.log("[RazorpayLoader] [6] window.Razorpay doesn't exist despite script onload");
          reject(new Error("Razorpay loaded but window.Razorpay is unavailable"));
        }
      };
      
      script.onerror = (e) => {
        console.log("[RazorpayLoader] Script onerror fired", e);
        reject(new Error("Failed to load Razorpay Checkout"));
      };
      
      console.log("[RazorpayLoader] [4] Script appended to document.body");
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
