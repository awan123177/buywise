import axios from 'axios';
function cleanProductTitle(rawTitle: string): string {
  let cleaned = rawTitle.replace(/ - .*?$/, '');
  cleaned = cleaned.replace(/ \| .*?$/, '');
  cleaned = cleaned.replace(/Amazon\.in.*?$/, '');
  cleaned = cleaned.replace(/Amazon\.com.*?$/, '');
  cleaned = cleaned.replace(/Buy .*? Online at.*?$/, '');
  cleaned = cleaned.replace(/: .*?$/, '');
  return cleaned.trim();
}

async function getProductTitleFromUrl(urlStr: string): Promise<string> {
  const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";
  try {
    const response = await axios.get("https://serpapi.com/search", {
      params: { engine: "google", q: urlStr, api_key: serpApiKey, hl: "en", gl: "in" }
    });
    
    if (response.data && Array.isArray(response.data.organic_results) && response.data.organic_results.length > 0) {
      const rawTitle = response.data.organic_results[0].title;
      const cleaned = cleanProductTitle(rawTitle);
      return cleaned;
    }
  } catch (err: any) {}
  
  // Fallback to URL path extraction if SerpApi query fails or has no results
  try {
    const urlObj = new URL(urlStr);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;
    const title = lastPart.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return title;
  } catch {
    return urlStr;
  }
}

getProductTitleFromUrl("https://www.amazon.in/gp/product/B0H7JS5HP2/ref=ox_sc_act_image_1?smid=AUHUIAHGSR283&psc=1").then(console.log);
