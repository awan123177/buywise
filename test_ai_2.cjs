const { GoogleGenAI } = require("@google/genai");

async function run() {
  const ai = new GoogleGenAI({
    apiKey: "dummy",
    httpOptions: {
      headers: {
        Authorization: `Bearer ${process.env.GEMINI_API_KEY}`,
      }
    }
  });

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Hello",
  });
  console.log(res.text);
}
run().catch(console.error);
