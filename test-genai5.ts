import { GoogleGenAI } from "@google/genai";
const key = "ya29.c.c0AY_VpZi..."
const ai = new GoogleGenAI({
  apiKey: "dummy",
});
(ai.apiClient as any).clientOptions.auth.apiKey = undefined;
(ai.apiClient as any).clientOptions.apiKey = undefined;
console.log(ai.apiClient.clientOptions);
