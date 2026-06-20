import { GoogleGenAI } from "@google/genai";
import toast from "react-hot-toast";

// Initialize the Gemini AI client
// According to AI Studio guidelines, we call this from the frontend.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function detectProduct(text: string) {
  try {
    const isUrl = text.startsWith('http');
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Identify the main product being described or linked: "${text}". 
      Return ONLY the concise product name with model number if applicable (no extra punctuation). 
      Example: "iPhone 15 Pro", "Sony WH-1000XM5". ${isUrl ? 'If it is a URL, parse the product name from the slug.' : ''}`,
    });
    const result = response.text?.trim().replace(/^"|"$/g, '') || text;
    return result.split('\n')[0].substring(0, 80);
  } catch (error: any) {
    const errorStr = (error?.message || error).toString();
    console.error("Gemini Detection Error:", errorStr);
    
    if (errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED')) {
        toast.error("Gemini API Permission Denied. Please ensure your API key in Settings > Secrets is valid and has the correct permissions.");
    } else if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      toast.error("AI bandwidth limit reached. Falling back to local heuristics.");
    } else {
      toast.error("AI Detection Error: " + errorStr);
    }
    
    return text.substring(0, 100);
  }
}

export async function extractProductFeatures(productName: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an elite hardware/software analyst. Provide exactly 3 hyper-concise, highly technical features (max 5 words each) for the product: "${productName}". Example format: "A17 Pro Bionic Chip, Titanium Aerospace Frame, 120Hz ProMotion Display". Separate by commas.`,
    });
    const text = response.text?.trim() || "";
    return text.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
  } catch (error: any) {
    const errorStr = (error?.message || error).toString();
    console.error("Gemini Feature Extraction Error:", errorStr);
    
    if (errorStr.includes('403') || errorStr.includes('PERMISSION_DENIED')) {
        // Already handled in detectProduct or another toast if necessary
    } else if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      toast.error("AI rate limit exceeded during feature extraction.");
    } else {
      toast.error("AI Feature Error: " + errorStr);
    }
    
    return ["Tech Spec Alpha", "Performance Beta", "Design Gamma"];
  }
}

export async function getShoppingAdvice(query: string, results: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are BuyWise INDIA Intelligence Assistant, an elite AI with unparalleled, genius-level market intelligence and predictive pricing models.
      Analyze these market results: ${JSON.stringify(results.slice(0, 5))}.
      Deliver a cutting-edge, ruthless 3-sentence market synthesis for "${query}". 
      Identify precise value arbitrage (price vs hardware specs), pinpoint the exact platform yielding maximum ROI, and cite actual Rupee (₹) figures from the data. Expose marketing gimmicks. Be hyper-intelligent, authoritative, and visionary.`,
    });
    return response.text?.trim() || "Analyzing macro-economic market vectors...";
  } catch (error: any) {
    const errorStr = (error?.message || error).toString();
    console.error("Gemini Advice Error:", errorStr);
    
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      toast.error("AI Quota Exceeded. Unable to synthesize market advice.");
    } else {
      toast.error("AI Advice Error: " + errorStr);
    }
    
    return "Our intelligence matrix is currently reprocessing global market data. Awaiting uplink.";
  }
}

export async function predictPriceTrend(productTitle: string, currentPriceStr: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are BuyWise Predictor, an elite AI market analyst.
      Analyze the price trend for "${productTitle}" currently priced at "${currentPriceStr}".
      Predict its future price trend and give a 1-sentence explanation.
      Return EXACTLY IN THIS JSON FORMAT, NO MARKDOWN, JUST RAW JSON:
      {
        "trend": "UP" | "DOWN" | "STABLE",
        "predictedPrice": "₹X,XXX",
        "explanation": "Short 1-sentence explanation."
      }`,
    });
    
    const text = response.text?.trim() || "";
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error: any) {
    const errorStr = (error?.message || error).toString();
    console.error("Gemini Prediction Error:", errorStr);
    
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      toast.error("AI Prediction failed: Rate limit exceeded.");
    } else {
      toast.error("AI Prediction Error: " + errorStr);
    }
    
    return null;
  }
}

