const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// Find the part where we check if urlToAnalyze
const oldCode = `    if (urlToAnalyze) {
      try {
        console.log(\`[API Search] urlToAnalyze detected: "\${urlToAnalyze}". Resolving...\`);
        const resolved = await resolveRedirect(urlToAnalyze);
        urlToAnalyze = resolved;
        
        // If queryStr is a URL, or looks like a URL, or is very short (like a slug/ASIN)
        const isQueryUrl = queryStr.startsWith('http');
        const isQuerySlug = queryStr.length < 15 && /^[a-z0-9-_]+$/i.test(queryStr);
        
        if (isQueryUrl || isQuerySlug || !queryStr.trim()) {
          console.log(\`[API Search] Query "\${queryStr}" is URL or slug/ASIN. Looking up descriptive product title...\`);
          const extractedTitle = await getProductTitleFromUrl(resolved);
          if (extractedTitle && extractedTitle !== resolved) {
            queryStr = extractedTitle;
            console.log(\`[API Search] Resolved query to descriptive title: "\${queryStr}"\`);
          }
        }
      } catch (err: any) {
        console.warn(\`[API Search] Error resolving urlToAnalyze:\`, err.message);
      }
    } else if (queryStr.startsWith('http')) {
      // If no urlToAnalyze is set but queryStr itself is a URL
      try {
        console.log(\`[API Search] queryStr starts with http: "\${queryStr}". Resolving...\`);
        const resolved = await resolveRedirect(queryStr);
        urlToAnalyze = resolved;
        const extractedTitle = await getProductTitleFromUrl(resolved);
        if (extractedTitle && extractedTitle !== resolved) {
          queryStr = extractedTitle;
          console.log(\`[API Search] Resolved query URL to title: "\${queryStr}"\`);
        }
      } catch (err: any) {
        console.warn(\`[API Search] Error resolving queryStr URL:\`, err.message);
      }
    }`;

const newCode = `    // If queryStr is just an ASIN, let's lookup its real name
    if (!urlToAnalyze && queryStr.match(/^B[0-9A-Z]{9}$/i)) {
      try {
        console.log(\`[API Search] Query is a raw ASIN: "\${queryStr}". Looking up real name...\`);
        const extractedTitle = await getProductTitleFromUrl("https://www.amazon.in/dp/" + queryStr);
        if (extractedTitle && !extractedTitle.includes(queryStr)) {
          queryStr = extractedTitle;
          console.log(\`[API Search] Resolved ASIN to descriptive title: "\${queryStr}"\`);
        }
      } catch(err: any) {
        console.warn(\`[API Search] Error resolving ASIN:\`, err.message);
      }
    }

    if (urlToAnalyze) {
      try {
        console.log(\`[API Search] urlToAnalyze detected: "\${urlToAnalyze}". Resolving...\`);
        const resolved = await resolveRedirect(urlToAnalyze);
        urlToAnalyze = resolved;
        
        // If queryStr is a URL, or looks like a URL, or is very short (like a slug/ASIN)
        const isQueryUrl = queryStr.startsWith('http');
        const isQuerySlug = queryStr.length < 15 && /^[a-z0-9-_]+$/i.test(queryStr);
        
        if (isQueryUrl || isQuerySlug || !queryStr.trim()) {
          console.log(\`[API Search] Query "\${queryStr}" is URL or slug/ASIN. Looking up descriptive product title...\`);
          const extractedTitle = await getProductTitleFromUrl(resolved);
          if (extractedTitle && extractedTitle !== resolved) {
            queryStr = extractedTitle;
            console.log(\`[API Search] Resolved query to descriptive title: "\${queryStr}"\`);
          }
        }
      } catch (err: any) {
        console.warn(\`[API Search] Error resolving urlToAnalyze:\`, err.message);
      }
    } else if (queryStr.startsWith('http')) {
      // If no urlToAnalyze is set but queryStr itself is a URL
      try {
        console.log(\`[API Search] queryStr starts with http: "\${queryStr}". Resolving...\`);
        const resolved = await resolveRedirect(queryStr);
        urlToAnalyze = resolved;
        const extractedTitle = await getProductTitleFromUrl(resolved);
        if (extractedTitle && extractedTitle !== resolved) {
          queryStr = extractedTitle;
          console.log(\`[API Search] Resolved query URL to title: "\${queryStr}"\`);
        }
      } catch (err: any) {
        console.warn(\`[API Search] Error resolving queryStr URL:\`, err.message);
      }
    }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
