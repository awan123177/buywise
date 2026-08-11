const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf8');

code = code.replace(
  /<span className="relative z-10">Select Plan<\/span>/g,
  '<span className="relative z-10">{typeof window !== \'undefined\' && (window as any).AndroidBillingBridge ? "Select Plan" : "COMING SOON"}</span>'
);

fs.writeFileSync('src/components/Premium.tsx', code);
