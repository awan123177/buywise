const { GoogleGenAI } = require("@google/genai");

async function run() {
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
