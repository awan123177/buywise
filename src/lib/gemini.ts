import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function detectProduct(text: string) {
  try {
    const isUrl = text.startsWith('http');
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Identify the main product being described or linked: "${text}". 
      Return ONLY the concise product name with model number if applicable (no extra punctuation). 
      Example: "iPhone 15 Pro", "Sony WH-1000XM5". ${isUrl ? 'If it is a URL, parse the product name from the slug.' : ''}`,
    });
    const result = response.text?.trim().replace(/^"|"$/g, '') || text;
    return result.split('\n')[0].substring(0, 80);
  } catch (error: any) {
    const errorStr = (error?.message || error).toString();
    if (!errorStr.includes('429') && !errorStr.includes('RESOURCE_EXHAUSTED')) {
      console.error("Gemini Detection Error:", errorStr);
    }
    return text.substring(0, 100);
  }
}

export async function extractProductFeatures(productName: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an elite hardware/software analyst. Provide exactly 3 hyper-concise, highly technical features (max 5 words each) for the product: "${productName}". Example format: "A17 Pro Bionic Chip, Titanium Aerospace Frame, 120Hz ProMotion Display". Separate by commas.`,
    });
    const text = response.text?.trim() || "";
    return text.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
  } catch (error) {
    return ["Tech Spec Alpha", "Performance Beta", "Design Gamma"];
  }
}

export async function getShoppingAdvice(query: string, results: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are BuyWise INDIA Intelligence Assistant, an elite AI with unparalleled, genius-level market intelligence and predictive pricing models.
      Analyze these market results: ${JSON.stringify(results.slice(0, 5))}.
      Deliver a cutting-edge, ruthless 3-sentence market synthesis for "${query}". 
      Identify precise value arbitrage (price vs hardware specs), pinpoint the exact platform yielding maximum ROI, and cite actual Rupee (₹) figures from the data. Expose marketing gimmicks. Be hyper-intelligent, authoritative, and visionary.`,
    });
    return response.text?.trim() || "Analyzing macro-economic market vectors...";
  } catch (error: any) {
    const errorStr = (error?.message || error).toString();
    if (!errorStr.includes('429') && !errorStr.includes('RESOURCE_EXHAUSTED')) {
      console.error("Gemini Advice Error:", errorStr);
    }
    return "Our intelligence matrix is currently reprocessing global market data. Awaiting uplink.";
  }
}
