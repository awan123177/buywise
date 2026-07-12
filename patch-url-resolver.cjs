const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `async function getProductTitleFromUrl(urlStr: string): Promise<string> {
  const serpApiKey = process.env.SERP_API_KEY || "";
  let query = urlStr;
  
  // Try to extract Amazon ASIN
  const asinMatch = urlStr.match(/\\/(?:dp|product|asin|o\\/ASIN)\\/(B[0-9A-Z]{9})/i) || urlStr.match(/\\b(B[0-9A-Z]{9})\\b/i);
  if (asinMatch) {
    query = \`amazon \${asinMatch[1]}\`;
    console.log(\`[URL Resolver] Extracted ASIN \${asinMatch[1]} from URL. Using query: "\${query}"\`);
  }

  try {
    console.log(\`[URL Resolver] Querying SerpApi Google for: "\${query}"\`);
    const response = await axios.get("https://serpapi.com/search", {
      params: { engine: "google", q: query, api_key: serpApiKey, hl: "en", gl: "in" }
    });
    
    if (response.data && Array.isArray(response.data.organic_results) && response.data.organic_results.length > 0) {
      const rawTitle = response.data.organic_results[0].title;
      const cleaned = cleanProductTitle(rawTitle);
      console.log(\`[URL Resolver] Successfully resolved to title: "\${cleaned}" (raw: "\${rawTitle}")\`);
      return cleaned;
    }
  } catch (err: any) {
    console.warn(\`[URL Resolver] SerpApi Google search failed:\`, err.message);
  }
  
  // Fallback to URL path extraction if SerpApi query fails or has no results
  try {
    if (asinMatch) return \`Amazon Product \${asinMatch[1]}\`;
    const urlObj = new URL(urlStr);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    // Find the longest path part that might be a product slug
    let bestPart = pathParts[pathParts.length - 1] || urlObj.hostname;
    for (const part of pathParts) {
      if (part.includes('-') && part.length > bestPart.length) {
        bestPart = part;
      }
    }
    const title = bestPart.replace(/[-_]/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase());
    return title;
  } catch {
    return urlStr;
  }
}`;

const oldFuncRegex = /async function getProductTitleFromUrl\(urlStr: string\): Promise<string> \{[\s\S]*?catch \{\s*return urlStr;\s*\}\s*\}/;
code = code.replace(oldFuncRegex, replacement);

fs.writeFileSync('server.ts', code);
