import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: { systemInstruction: "Be polite" },
      contents: [{ role: "user", parts: [{ text: "hi" }] }]
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
