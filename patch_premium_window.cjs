const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf-8');

code = code.replace(
  /if \(window\.AndroidBillingBridge\) \{/g,
  `if (('AndroidBillingBridge' in window)) {`
);

code = code.replace(
  /window\.AndroidBillingBridge\.startPurchase/g,
  `(window as any).AndroidBillingBridge.startPurchase`
);

fs.writeFileSync('src/components/Premium.tsx', code);
