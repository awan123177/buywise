import { GoogleGenAI } from "@google/genai";
const key = "ya29.c.c0AY_VpZi...";
const ai = new GoogleGenAI({
  apiKey: "dummy",
  httpOptions: {
    headers: {
      Authorization: `Bearer ${key}`
    }
  }
});

// Monkey patch auth
(ai.apiClient as any).clientOptions.auth.addAuthHeaders = async (headers: any) => {
  // do not add x-goog-api-key
};

try {
  await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "Hi" });
} catch (err: any) {
  console.log(err.message);
}
