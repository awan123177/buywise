const axios = require("axios");

async function run() {
  let freshToken;
  try {
    const res = await axios.get(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      { headers: { "Metadata-Flavor": "Google" } }
    );
    freshToken = res.data.access_token;
    console.log("Fetched fresh token from metadata server. Length:", freshToken.length);
  } catch (e) {
    console.error("Could not fetch fresh token from metadata server:", e.message);
    return;
  }

  // 1. Try Google AI with fresh Bearer token
  try {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: "Hello" }] }]
      },
      {
        headers: {
          Authorization: `Bearer ${freshToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Google AI Success:", res.data.candidates[0].content.parts[0].text);
  } catch (e) {
    if (e.response) {
      console.error("Google AI Error:", e.response.status, JSON.stringify(e.response.data));
    } else {
      console.error("Google AI Error:", e.message);
    }
  }

  // 2. Try Vertex AI with fresh Bearer token and detected project
  let projectId = "ais-asia-east1-7f4152bfb94e4ec";
  try {
    const res = await axios.post(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-2.5-flash:generateContent`,
      {
        contents: [{ role: "user", parts: [{ text: "Hello" }] }]
      },
      {
        headers: {
          Authorization: `Bearer ${freshToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Vertex AI Success:", JSON.stringify(res.data));
  } catch (e) {
    if (e.response) {
      console.error("Vertex AI Error:", e.response.status, JSON.stringify(e.response.data));
    } else {
      console.error("Vertex AI Error:", e.message);
    }
  }
}
run();
