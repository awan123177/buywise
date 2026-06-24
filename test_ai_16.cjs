const { GoogleGenAI } = require("@google/genai");

async function run() {
  // Delete the environment variable so GoogleGenAI doesn't use it as an API key
  delete process.env.GEMINI_API_KEY;
  delete process.env.GOOGLE_API_KEY;

  const ai = new GoogleGenAI({
    vertexai: true
  });

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hello",
  });
  console.log("Success:", res.text);
}
run().catch(console.error);
