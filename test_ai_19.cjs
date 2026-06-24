const axios = require("axios");

async function run() {
  const token = process.env.GEMINI_API_KEY;
  if (!token) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  try {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: "Hello" }] }]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Success REST API:", res.data.candidates[0].content.parts[0].text);
  } catch (e) {
    if (e.response) {
      console.error("Error REST API:", e.response.status, JSON.stringify(e.response.data));
    } else {
      console.error("Error REST API:", e.message);
    }
  }
}
run();
