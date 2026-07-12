import axios from 'axios';
async function test() {
  const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";
  const res = await axios.get("https://serpapi.com/search", {
    params: { engine: "google", q: "amazon B0H7JS5HP2", api_key: serpApiKey, hl: "en", gl: "in" }
  });
  console.log(JSON.stringify(res.data.organic_results?.slice(0, 2), null, 2));
}
test();
