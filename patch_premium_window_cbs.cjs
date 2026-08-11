const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf-8');

const callbacks = `
  React.useEffect(() => {
    (window as any).onAndroidPurchaseSuccess = async (productId: string, purchaseToken: string, couponCode: string) => {
       toast('Verifying Play Store purchase...');
       try {
         const res = await fetch('/api/google-play/verify-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, purchaseToken, couponCode })
         });
         const verificationResult = await res.json();
         if (verificationResult.success) {
            toast.success('Premium activated successfully!');
            window.location.href = '/premium/success';
         } else {
            toast.error(verificationResult.error || 'Failed to verify purchase.');
         }
       } catch (e) {
         toast.error('Failed to verify purchase.');
       }
    };
    (window as any).onAndroidPurchaseError = (errorMsg: string) => {
       toast.error(errorMsg || 'Payment cancelled or failed.');
    };
    
    return () => {
      delete (window as any).onAndroidPurchaseSuccess;
      delete (window as any).onAndroidPurchaseError;
    };
  }, []);
`;

code = code.replace(
  /const handleApplyCoupon = async \(planId: string\) => \{/,
  `${callbacks}\n\n  const handleApplyCoupon = async (planId: string) => {`
);

fs.writeFileSync('src/components/Premium.tsx', code);
