const axios = require("axios");

async function run() {
  const token = process.env.GEMINI_API_KEY;
  if (!token) {
    console.error("No GEMINI_API_KEY");
    return;
  }

  try {
    const res = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
    console.log("Token Info:", JSON.stringify(res.data, null, 2));
  } catch (e) {
    if (e.response) {
      console.error("Token Info Error:", e.response.status, JSON.stringify(e.response.data));
    } else {
      console.error("Token Info Error:", e.message);
    }
  }
}
run();
