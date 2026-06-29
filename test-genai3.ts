import { GoogleGenAI } from "@google/genai";
const key = "ya29.c.c0AY_VpZi..."
const ai = new GoogleGenAI({
  apiKey: key,
  httpOptions: {
    headers: {
      'Authorization': `Bearer ${key}`
    }
  }
});
console.log(ai.apiClient.clientOptions.apiKey);
console.log(ai.apiClient.clientOptions.httpOptions.headers);
