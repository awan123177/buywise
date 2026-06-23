import axios from 'axios';

async function test() {
  const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";
  const params = {
    engine: "google_flights",
    departure_id: "BOM",
    arrival_id: "DEL",
    outbound_date: "2026-06-30",
    type: "2",
    api_key: serpApiKey,
    hl: "en",
    gl: "in",
    currency: "INR"
  };
  try {
      const res = await axios.get("https://serpapi.com/search", { params });
      console.log(JSON.stringify(res.data.best_flights?.[0] || res.data.other_flights?.[0] || res.data || {}, null, 2));
  } catch(e: any) {
      console.error(e.response?.data || e.message);
  }
}
test();
