import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

console.log("GEMINI_API_KEY IS:", process.env.GEMINI_API_KEY ? "SET" : "UNDEFINED");


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/debug-key", (req, res) => {
    res.json({ key_is_set: !!process.env.GEMINI_API_KEY });
  });

  // SERP/Rapid API Search
  app.get("/api/search", async (req, res) => {
    const { q } = req.query;
    const rapidApiKey = process.env.RAPID_API_KEY;

    if (!rapidApiKey) {
      console.warn("RAPID_API_KEY is missing, using fallback dummy data.");
    }

    try {
      let results: any[] = [];
      const queryStr = typeof q === 'string' ? q : '';

      if (rapidApiKey) {
        // Attempt Amazon API
        try {
          const amazonRes = await axios.get("https://amazon-product-search-api1.p.rapidapi.com/search", {
            params: { q: queryStr, country: "in" },
            headers: {
              "X-RapidAPI-Key": rapidApiKey,
              "X-RapidAPI-Host": "amazon-product-search-api1.p.rapidapi.com"
            }
          });
          if (amazonRes.data?.results) {
            results = [...results, ...amazonRes.data.results.map((r: any) => ({ ...r, source: "Amazon" }))];
          }
        } catch (e: any) {
          console.error("Amazon RapidAPI Error:", e.message);
        }

        // Attempt Flipkart API
        try {
          const flipkartRes = await axios.get("https://flipkart-api1.p.rapidapi.com/search", {
            params: { q: queryStr },
            headers: {
              "X-RapidAPI-Key": rapidApiKey,
              "X-RapidAPI-Host": "flipkart-api1.p.rapidapi.com"
            }
          });
          if (flipkartRes.data?.results) {
            results = [...results, ...flipkartRes.data.results.map((r: any) => ({ ...r, source: "Flipkart" }))];
          }
        } catch (e: any) {
          console.error("Flipkart RapidAPI Error:", e.message);
        }
      }

      // If both fail or rapidApiKey is missing, use Google Shopping SerpApi if available, or fallback data
      if (results.length === 0) {
          const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";
          if (serpApiKey) {
            try {
              const serpResponse = await axios.get("https://serpapi.com/search", {
                params: { engine: "google_shopping", q: queryStr, api_key: serpApiKey, hl: "en", gl: "in" }
              });
              
              if (serpResponse.data && serpResponse.data.shopping_results) {
                serpResponse.data.shopping_results = serpResponse.data.shopping_results.map((item: any) => {
                    let originalLink = item.link || item.product_link;
                    if (item.source && originalLink && originalLink.includes("google.com")) {
                        const encodeQ = encodeURIComponent(item.title || queryStr);
                        if (item.source.toLowerCase().includes("amazon")) {
                            originalLink = `https://www.amazon.in/s?k=${encodeQ}`;
                        } else if (item.source.toLowerCase().includes("flipkart")) {
                            originalLink = `https://www.flipkart.com/search?q=${encodeQ}`;
                        } else if (item.source.toLowerCase().includes("croma")) {
                            originalLink = `https://www.croma.com/searchB?q=${encodeQ}`;
                        } else if (item.source.toLowerCase().includes("reliance")) {
                            originalLink = `https://www.reliancedigital.in/search?q=${encodeQ}`;
                        }
                    }
                    return {
                        ...item,
                        link: originalLink
                    };
                });
              }

              return res.json(serpResponse.data);
            } catch (e: any) {
              console.warn("SERP API failed (quota exceeded?), falling back to mock data.", e.message);
              // Fallback below
            }
          }
          
          // Mock Data if no API key is provided or if api fails
          return res.json({
            shopping_results: [
                {
                  title: `${queryStr} - (Amazon Official)`,
                  price: "₹84,999",
                  old_price: "₹99,999",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://amazon.in",
                  source: "Amazon",
                  rating: 4.8,
                  delivery: "Tomorrow by 9 PM"
                },
                {
                  title: `${queryStr} - Pro Edition`,
                  price: "₹82,499",
                  old_price: "₹102,000",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://flipkart.com",
                  source: "Flipkart",
                  rating: 4.6,
                  delivery: "In 2 Days"
                },
                {
                  title: `${queryStr} (Store Pickup Available)`,
                  price: "₹86,990",
                  old_price: "₹99,990",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://croma.com",
                  source: "Croma",
                  rating: 4.5,
                  delivery: "Store Pickup"
                },
                {
                  title: `${queryStr} Base Variant`,
                  price: "₹88,000",
                  old_price: "₹95,000",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://reliancedigital.in",
                  source: "Reliance Digital",
                  rating: 4.7,
                  delivery: "Tomorrow"
                }
              ]
            });
      }

      res.json({ shopping_results: results });
    } catch (error: any) {
      console.error("Search Gateway Error:", error.message);
      res.status(500).json({ error: "Failed to fetch product data" });
    }
  });

  // Admin Dashboard Mock Data
  app.get("/api/admin/stats", (req, res) => {
    res.json({
      totalSearches: 12450,
      trendingProducts: [
        { name: "iPhone 15 Pro", searches: 1200 },
        { name: "MacBook Air M3", searches: 850 },
        { name: "Sony WH-1000XM5", searches: 640 },
      ],
      activeUsers: 342,
    });
  });

  // --- GEMINI ROUTES ---
  app.post("/api/gemini/detect", async (req, res) => {
    const { text } = req.body;
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const isUrl = text.startsWith('http');
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Identify the main product being described or linked: "${text}". 
        Return ONLY the concise product name with model number if applicable (no extra punctuation). 
        Example: "iPhone 15 Pro", "Sony WH-1000XM5". ${isUrl ? 'If it is a URL, parse the product name from the slug.' : ''}`,
      });
      const result = response.text?.trim().replace(/^"|"$/g, '') || text;
      res.json({ result: result.split('\n')[0].substring(0, 80) });
    } catch (e: any) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.post("/api/gemini/features", async (req, res) => {
    const { productName } = req.body;
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an elite hardware/software analyst. Provide exactly 3 hyper-concise, highly technical features (max 5 words each) for the product: "${productName}". Example format: "A17 Pro Bionic Chip, Titanium Aerospace Frame, 120Hz ProMotion Display". Separate by commas.`,
      });
      const text = response.text?.trim() || "";
      const features = text.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 3);
      res.json({ features });
    } catch (e: any) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.post("/api/gemini/advice", async (req, res) => {
    const { query, results } = req.body;
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are BuyWise INDIA Intelligence Assistant, an elite AI with unparalleled, genius-level market intelligence and predictive pricing models.
        Analyze these market results: ${JSON.stringify(results.slice(0, 5))}.
        Deliver a cutting-edge, ruthless 3-sentence market synthesis for "${query}". 
        Identify precise value arbitrage (price vs hardware specs), pinpoint the exact platform yielding maximum ROI, and cite actual Rupee (₹) figures from the data. Expose marketing gimmicks. Be hyper-intelligent, authoritative, and visionary.`,
      });
      res.json({ advice: response.text?.trim() || "Analyzing macro-economic market vectors..." });
    } catch (e: any) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  app.post("/api/gemini/predict", async (req, res) => {
    const { productTitle, currentPriceStr } = req.body;
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
      res.json({ prediction: JSON.parse(jsonStr) });
    } catch (e: any) {
      res.status(500).json({ error: String(e.message || e) });
    }
  });

  // Image proxy to bypass CORS for 3D textures
  app.get("/api/proxy-image", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).send("Missing url parameter");
    }
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const contentType = response.headers["content-type"];
      if (contentType) {
        res.set("Content-Type", String(contentType));
      }
      res.set("Cache-Control", "public, max-age=31536000");
      res.send(response.data);
    } catch (error: any) {
      console.error("Image Proxy Error:", error.message);
      res.status(500).send("Failed to proxy image");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PriceVerse AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
});
