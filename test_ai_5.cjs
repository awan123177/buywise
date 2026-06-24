const { GoogleGenAI } = require("@google/genai");

async function run() {
  // Try to use Authorization header and prevent SDK from using it as apiKey
  const key = process.env.GEMINI_API_KEY;
  // delete it from env so SDK doesn't pick it up automatically
  delete process.env.GEMINI_API_KEY;

  const ai = new GoogleGenAI({
    // If we pass an empty object or apiKey: undefined, it might throw if it can't find credentials
    httpOptions: {
      headers: {
        Authorization: `Bearer ${key}`,
      }
    }
  });
  
  // manually hack the apiKey out if it's there
  ai.apiKey = undefined;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello",
    });
    console.log(res.text);
  } catch (e) {
    console.error("error:", e.message);
  }
}
run().catch(console.error);
