import axios from 'axios';
async function test() {
  const serpApiKey = "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";
  const res = await axios.get("https://serpapi.com/search", {
    params: { engine: "google", q: "https://www.amazon.in/gp/product/B0H7JS5HP2/ref=ox_sc_act_image_1?smid=AUHUIAHGSR283&psc=1", api_key: serpApiKey, hl: "en", gl: "in" }
  });
  console.log(JSON.stringify(res.data.organic_results, null, 2));
}
test();
