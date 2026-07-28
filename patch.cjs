const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(
  /title: \`\$\{specs\.cleanQuery\} \(Shared Product Link\)\`,/g,
  'title: (resolvedInfo.extractedTitle && resolvedInfo.extractedTitle !== urlToAnalyze ? resolvedInfo.extractedTitle : specs.cleanQuery) + " (Shared Link)",'
);
fs.writeFileSync('server.ts', code);
