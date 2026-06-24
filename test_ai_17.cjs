const { GoogleGenAI } = require("@google/genai");
const axios = require("axios");

async function run() {
  let projectId;
  try {
    const res = await axios.get("http://metadata.google.internal/computeMetadata/v1/project/project-id", {
      headers: { "Metadata-Flavor": "Google" }
    });
    projectId = res.data;
    console.log("Metadata Project ID:", projectId);
  } catch (e) {
    console.error("Could not fetch from metadata server:", e.message);
    projectId = "ais-asia-east1-7f4152bfb94e4ec";
  }

  // Delete the environment variable so GoogleGenAI doesn't use it as an API key
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;

  const ai = new GoogleGenAI({
    project: projectId,
    location: "us-central1",
    vertexai: true
  });

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hello",
  });
  console.log("Success:", res.text);
}
run().catch(console.error);
