const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const oldFallback = `        if (isUrl) {
          try {
            const urlObj = new URL(resolvedUrl || urlStr);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;
            parsed.result = lastPart.replace(/[-_]/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase());
          } catch {
            parsed.result = text;
          }
        }`;

const newFallback = `        if (isUrl) {
          // Fallback to the resolved text (which might be the product title)
          // Avoid re-parsing the URL poorly if we already resolved a title
          parsed.result = text;
        }`;

code = code.replace(oldFallback, newFallback);
fs.writeFileSync('server.ts', code);
