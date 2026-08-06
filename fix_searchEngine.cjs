const fs = require('fs');

let code = fs.readFileSync('src/server/searchEngine.ts', 'utf8');

code = code.replace(/} as any\);/g, '});');

// Now apply only the single intended change at generateExactStoreVariants call:
const target = `  return generateExactStoreVariants({
    cleanQuery: categoryName,
    isAccessorySearch: false
  });`;

const replacement = `  return generateExactStoreVariants({
    cleanQuery: categoryName,
    isAccessorySearch: false
  } as any);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/server/searchEngine.ts', code);
