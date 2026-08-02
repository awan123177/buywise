import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

function formatGeminiContents(messages: any[]) {
  const firstUserIdx = messages.findIndex((m: any) => m.sender === 'user');
  if (firstUserIdx === -1) {
    return [];
  }
  const processed = messages.slice(firstUserIdx);

  const contents: any[] = [];
  for (const msg of processed) {
    const role = msg.sender === 'user' ? 'user' : 'model';
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += "\n" + msg.text;
    } else {
      contents.push({
        role: role,
        parts: [{ text: msg.text }]
      });
    }
  }
  return contents;
}

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const contents = formatGeminiContents([{sender: "user", text: "hi"}]);
    console.log("Contents:", JSON.stringify(contents, null, 2));
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      config: { systemInstruction: "Be polite" },
      contents: contents
    });
    console.log("Success:", response.text);
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
test();
