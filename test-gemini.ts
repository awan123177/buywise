import { GoogleGenAI } from "@google/genai";
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: "What product is Amazon ASIN B0H7JS5HP2? If you don't know, just guess based on recent releases."
  });
  console.log(res.text);
}
test();
