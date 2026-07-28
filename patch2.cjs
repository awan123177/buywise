const fs = require('fs');
let code = fs.readFileSync('src/server/searchEngine.ts', 'utf-8');
code = code.replace(
  /if \(\!specs\.isAccessorySearch \&\& specs\.negativeTerms\.length > 0\) \{/g,
  'if (!specs.isAccessorySearch) {'
);
fs.writeFileSync('src/server/searchEngine.ts', code);
