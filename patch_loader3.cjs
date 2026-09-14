const fs = require('fs');
let content = fs.readFileSync('src/components/Premium.tsx', 'utf8');
const start = content.indexOf('const loadRazorpayScript = () => {');
const end = content.indexOf('const handlePurchase = async', start);
if (start !== -1 && end !== -1) {
    const replacement = `const loadRazorpayScript = () => {
    console.log("[RazorpayLoader] [1] Payment button clicked");
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
      let existingScript = document.getElementById(scriptId) as HTMLScriptElement;

      if (existingScript) {
        console.log("[RazorpayLoader] [3] Existing script found with state:", existingScript.getAttribute('data-state'));
        if ((window as any).Razorpay) {
            console.log("[RazorpayLoader] [6] window.Razorpay exists (from existing script)");
            return resolve(true);
        }
        
        const state = existingScript.getAttribute('data-state');
        if (state === 'failed') {
            console.log("[RazorpayLoader] [3] Existing script failed previously. Removing it.");
            existingScript.remove();
            existingScript = null as any;
        } else if (state === 'loading') {
            console.log("[RazorpayLoader] [3] Existing script is loading. Waiting for events...");
            existingScript.addEventListener('load', () => {
                console.log("[RazorpayLoader] [5] checkout.js load event fired on existing script");
                resolve(!!(window as any).Razorpay);
            });
            existingScript.addEventListener('error', () => {
                console.log("[RazorpayLoader] Error loading existing script");
                reject(new Error("Failed to load Razorpay Checkout"));
            });
            return;
        } else {
            console.log("[RazorpayLoader] [3] Existing script in unknown state. Removing it.");
            existingScript.remove();
            existingScript = null as any;
        }
      }

      if (!existingScript) {
          console.log("[RazorpayLoader] [3] Creating new script...");
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.setAttribute('data-state', 'loading');
          
          script.onload = () => {
            console.log("[RazorpayLoader] [5] checkout.js load event fired");
            script.setAttribute('data-state', 'loaded');
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
            script.setAttribute('data-state', 'failed');
            reject(new Error("Failed to load Razorpay Checkout"));
          };
          
          console.log("[RazorpayLoader] [4] Script appended to document.body");
          document.body.appendChild(script);
      }
    });
  };

  `;
    content = content.substring(0, start) + replacement + content.substring(end);
    fs.writeFileSync('src/components/Premium.tsx', content);
    console.log("Patched loader 3 successfully");
} else {
    console.log("Could not find boundaries");
}
