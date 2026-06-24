const { GoogleGenAI } = require("@google/genai");

async function run() {
  const ai = new GoogleGenAI({
    // If we use vertexai, it doesn't send x-goog-api-key
    vertexai: {
      project: 'dummy',
      location: 'us-central1'
    },
    httpOptions: {
      headers: {
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      }
    }
  });

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello",
    });
    console.log(res.text);
  } catch (e) {
    console.error("vertex Error:", e.message);
  }
}
run().catch(console.error);
