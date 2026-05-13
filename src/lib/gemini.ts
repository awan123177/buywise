import axios from "axios";
import toast from "react-hot-toast";
import { api } from "./api"; // we can use the existing api axios instance

export async function detectProduct(text: string) {
  try {
    const { data } = await api.post("/gemini/detect", { text });
    return data.result;
  } catch (error: any) {
    const errorStr = (error?.response?.data?.error || error?.message || error).toString();
    console.error("Gemini Detection Error:", errorStr);
    toast.error("AI Detection Error: " + errorStr);
    return text.substring(0, 100);
  }
}

export async function extractProductFeatures(productName: string): Promise<string[]> {
  try {
    const { data } = await api.post("/gemini/features", { productName });
    return data.features;
  } catch (error: any) {
    const errorStr = (error?.response?.data?.error || error?.message || error).toString();
    console.error("Gemini Feature Extraction Error:", errorStr);
    toast.error("AI Feature Error: " + errorStr);
    return ["Tech Spec Alpha", "Performance Beta", "Design Gamma"];
  }
}

export async function getShoppingAdvice(query: string, results: any[]) {
  try {
    const { data } = await api.post("/gemini/advice", { query, results });
    return data.advice;
  } catch (error: any) {
    const errorStr = (error?.response?.data?.error || error?.message || error).toString();
    console.error("Gemini Advice Error:", errorStr);
    toast.error("AI Advice Error: " + errorStr);
    return "Our intelligence matrix is currently reprocessing global market data. Awaiting uplink.";
  }
}

export async function predictPriceTrend(productTitle: string, currentPriceStr: string) {
  try {
    const { data } = await api.post("/gemini/predict", { productTitle, currentPriceStr });
    return data.prediction;
  } catch (error: any) {
    const errorStr = (error?.response?.data?.error || error?.message || error).toString();
    console.error("Gemini Prediction Error:", errorStr);
    // Don't toast here as it's handled gracefully in the radar component
    return null;
  }
}

