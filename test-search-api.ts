import axios from 'axios';
async function test() {
  try {
    const res = await axios.post("http://localhost:3000/api/gemini/detect", {
      text: "https://www.amazon.in/gp/product/B0H7JS5HP2/ref=ox_sc_act_image_1?smid=AUHUIAHGSR283&psc=1"
    });
    console.log("DETECT RESULT:", res.data);
    
    const searchRes = await axios.get("http://localhost:3000/api/search", {
      params: { q: res.data.result, originalUrl: "https://www.amazon.in/gp/product/B0H7JS5HP2/ref=ox_sc_act_image_1?smid=AUHUIAHGSR283&psc=1" }
    });
    console.log("SEARCH RESULTS COUNT:", searchRes.data.shopping_results?.length);
    console.log("SEARCH RESULT 1:", searchRes.data.shopping_results?.[0]?.title);
  } catch (err: any) {
    console.error(err.message);
  }
}
test();
