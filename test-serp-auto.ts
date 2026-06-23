import axios from 'axios';

async function test() {
  const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";
  const params = {
    engine: "google_flights_autocomplete",
    q: "London",
    api_key: serpApiKey,
  };
  try {
      const res = await axios.get("https://serpapi.com/search", { params });
      console.log(JSON.stringify(res.data, null, 2));
  } catch(e: any) {
      console.error(e.response?.data || e.message);
  }
}
test();
