import axios from 'axios';
async function test() {
  const serpApiKey = "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";
  try {
      const res = await axios.get("https://serpapi.com/search", { 
        params: {
          engine: "google",
          q: "B0H7JS5HP2",
          api_key: serpApiKey
        } 
      });
      console.log(JSON.stringify(res.data.organic_results, null, 2));
  } catch(e: any) {
      console.error(e.response?.data || e.message);
  }
}
test();
