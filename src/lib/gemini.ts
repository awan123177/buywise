import toast from "react-hot-toast";

export async function detectProduct(text: string): Promise<any> {
  try {
    const response = await fetch("/api/gemini/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    const errorStr = (error?.message || error).toString();
    console.error("Detect Product Error:", errorStr);
    
    if (errorStr.includes('403')) {
      toast.error("Gemini API Permission Denied. Please ensure server API key is valid.");
    } else {
      toast.error("AI Detection Error: " + errorStr);
    }
    return { result: text.substring(0, 100), minPrice: null, maxPrice: null, brand: null };
  }
}

export async function extractProductFeatures(productName: string): Promise<string[]> {
  try {
    const response = await fetch("/api/gemini/extract-features", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data.features || ["Tech Spec Alpha", "Performance Beta", "Design Gamma"];
  } catch (error: any) {
    console.error("Extract Features Error:", error);
    return ["Tech Spec Alpha", "Performance Beta", "Design Gamma"];
  }
}

export async function getShoppingAdvice(query: string, results: any[]): Promise<string> {
  try {
    const response = await fetch("/api/gemini/shopping-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, results }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data.advice || "Analyzing macro-economic market vectors...";
  } catch (error: any) {
    console.error("Shopping Advice Error:", error);
    toast.error("Unable to synthesize market advice at this moment.");
    return "Our intelligence matrix is currently reprocessing global market data. Awaiting uplink.";
  }
}

export async function predictPriceTrend(productTitle: string, currentPriceStr: string): Promise<any> {
  try {
    const response = await fetch("/api/gemini/predict-trend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productTitle, currentPriceStr }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Predict Price Trend Error:", error);
    return null;
  }
}


