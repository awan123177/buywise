import { GoogleGenAI } from "@google/genai";
const key = "ya29.c.c0AY_VpZi...";
const ai = new GoogleGenAI({
  apiKey: "dummy",
});

const origFetch = globalThis.fetch;
globalThis.fetch = async (url: any, init: any) => {
  console.log("FETCH URL:", url);
  return origFetch(url, init);
};

(ai.apiClient as any).clientOptions.auth.addAuthHeaders = async (headers: any) => {};

try {
  await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "Hi" });
} catch (err: any) {
}
