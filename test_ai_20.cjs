const axios = require("axios");

async function run() {
  const token = process.env.GEMINI_API_KEY;
  if (!token) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const projectId = "ais-asia-east1-7f4152bfb94e4ec";

  try {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: "Hello, say test success!" }] }]
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-goog-user-project": projectId,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Success REST API with user project:", res.data.candidates[0].content.parts[0].text);
  } catch (e) {
    if (e.response) {
      console.error("Error REST API:", e.response.status, JSON.stringify(e.response.data));
    } else {
      console.error("Error REST API:", e.message);
    }
  }
}
run();
