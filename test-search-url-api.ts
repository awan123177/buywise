import axios from 'axios';
async function test() {
  try {
    const searchUrl = "https://www.amazon.in/gp/product/B0H7JS5HP2?smid=AUHUIAHGSR283&psc=1&linkCode=ll2&tag=buywiseind0f8-21&linkId=5446649d81e1fa2ea9f549a1783aad99&ref_=as_li_ss_tl";
    const res = await axios.post("http://localhost:3000/api/gemini/detect", { text: searchUrl });
    console.log("DETECT RESULT:", res.data);
    
    const searchRes = await axios.get("http://localhost:3000/api/search", {
      params: { q: res.data.result, originalUrl: searchUrl }
    });
    console.log("SEARCH RESULTS COUNT:", searchRes.data.shopping_results?.length);
    console.log("SEARCH RESULT 1:", searchRes.data.shopping_results?.[0]?.title);
    console.log("SEARCH RESULT 1 LINK:", searchRes.data.shopping_results?.[0]?.link);
    console.log("SEARCH RESULT 1 SOURCE:", searchRes.data.shopping_results?.[0]?.source);
  } catch (err: any) {
    console.error(err.message);
  }
}
test();
