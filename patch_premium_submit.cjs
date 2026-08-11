const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf-8');

code = code.replace(
  /const message = \`\\n\\[PREMIUM MANUAL PAYMENT\\]\\nPlan: \$\{selectedPlan\}\\nAmount: \$\{planPrices\[selectedPlan\]\}\\nName: \$\{name\}\\nUTR: \$\{utr\}\\n\`;/,
  `const message = \`\\n\\[PREMIUM MANUAL PAYMENT\\]\\nPlan: \${selectedPlan}\\nAmount: \${getDiscountedPrice(planPrices[selectedPlan])}\\nCoupon Applied: \${appliedCoupon ? appliedCoupon.code : 'None'}\\nName: \${name}\\nUTR: \${utr}\\n\`;`
);

fs.writeFileSync('src/components/Premium.tsx', code);
