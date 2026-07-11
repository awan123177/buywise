const fs = require('fs');
let code = fs.readFileSync('src/components/OwnerPage.tsx', 'utf8');

// Fix ease
code = code.replace(
  'ease: "easeOut"',
  'ease: "easeOut" as const'
);

fs.writeFileSync('src/components/OwnerPage.tsx', code);
