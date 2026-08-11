const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');

// replace variables
code = code.replace(/const \[showPayment[\s\S]*?useState\(false\);/, '');
code = code.replace(/const \[name[\s\S]*?useState\(''\);/, '');
code = code.replace(/const \[utr[\s\S]*?useState\(''\);/, '');
code = code.replace(/const \[screenshot[\s\S]*?useState<string \| null>\(null\);/, '');
code = code.replace(/const \[uploading[\s\S]*?useState\(false\);/, '');
code = code.replace(/const \[dragActive[\s\S]*?useState\(false\);/, '');

code = code.replace(/const processFile = \([\s\S]*?reader\.readAsDataURL\(file\);\s*\};/m, '');
code = code.replace(/const handleFileChange = \([\s\S]*?\};/m, '');
code = code.replace(/const handleDrag = \([\s\S]*?\};/m, '');
code = code.replace(/const handleDrop = \([\s\S]*?\};/m, '');

code = code.replace(/const handleSupport = async \([\s\S]*?\};/m, `const handlePurchase = async () => {
    if (!user) return;
    
    // Convert generic plan names to Google Play Billing product IDs
    const planToProductId: Record<string, string> = {
      daily: 'buywise_premium_daily',
      weekly: 'buywise_premium_weekly',
      monthly: 'buywise_premium_monthly',
      yearly: 'buywise_premium_yearly',
      lifetime: 'buywise_founder_forever'
    };
    
    const productId = planToProductId[selectedPlan];
    
    // Call Android Billing Bridge if it exists
    if ((window as any).AndroidBillingBridge) {
      (window as any).AndroidBillingBridge.startPurchase(productId);
    } else {
      toast.error("Google Play Billing is not available in this environment. Proceeding with Web checkout...");
    }
  };`);

// Replace UI
// Let's find {!showPayment ? (
let idx = code.indexOf('{!showPayment ? (');
if (idx !== -1) {
    let endIdx = code.lastIndexOf('</motion.div>');
    // The </motion.div> is the end of the manual payment block.
    // wait, where is the end of the manual payment block? It is `</motion.div>\n      )}`
    let endOfBlock = code.indexOf(')}', endIdx);
    
    let innerJSX = code.substring(idx + '{!showPayment ? ('.length, endIdx);
    // actually, `{!showPayment ? (` is followed by `<>`.
    let startInner = innerJSX.indexOf('<>');
    let endInner = innerJSX.indexOf('</>');
    let realInner = innerJSX.substring(startInner + 2, endInner);
    
    // replace `onClick={() => setShowPayment(true)}` with `onClick={handlePurchase}`
    realInner = realInner.replace(/onClick=\{\(\) => setShowPayment\(true\)\}/g, 'onClick={handlePurchase}');
    
    code = code.substring(0, idx) + realInner + '\n    </div>\n  );\n}';
    fs.writeFileSync('src/components/Premium.tsx', code);
    console.log("Patched Premium.tsx successfully with precise strings");
} else {
    console.log("Could not find {!showPayment ? (");
}

