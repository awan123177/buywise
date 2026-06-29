import { GoogleGenAI } from "@google/genai";
const key = "ya29.c.c0AY_VpZi...";
const ai = new GoogleGenAI({
  apiKey: "dummy",
});

(ai.apiClient as any).clientOptions.auth.addAuthHeaders = async (headers: any) => {
  console.log("headers constructor name:", headers.constructor.name);
  console.log("has set?", typeof headers.set === "function");
};

try {
  await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "Hi" });
} catch (err: any) {
}
