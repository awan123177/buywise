const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf-8');

code = code.replace(
  /const request = new PaymentRequest\(\[\{\s*supportedMethods: 'https:\/\/play\.google\.com\/billing',\s*data: \{\s*sku: productId\s*\}\s*\}\]\);/g,
  `const request = new PaymentRequest([{
          supportedMethods: 'https://play.google.com/billing',
          data: {
            sku: productId
          }
        }], {
          total: {
            label: 'Premium Subscription',
            amount: { currency: 'INR', value: '10.00' }
          }
        });`
);

fs.writeFileSync('src/components/Premium.tsx', code);
