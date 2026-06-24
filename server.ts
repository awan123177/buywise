import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Helper function to safely process history for Gemini API multi-turn conversation
// It ensures that the sequence starts with a "user" message and strictly alternates.
function formatGeminiContents(messages: any[]) {
  const firstUserIdx = messages.findIndex((m: any) => m.sender === 'user');
  if (firstUserIdx === -1) {
    return [];
  }
  const processed = messages.slice(firstUserIdx);

  const contents: any[] = [];
  for (const msg of processed) {
    const role = msg.sender === 'user' ? 'user' : 'model';
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += "\n" + msg.text;
    } else {
      contents.push({
        role: role,
        parts: [{ text: msg.text }]
      });
    }
  }
  return contents;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI Proxies (Secure Server-Side Implementation)
  app.post("/api/gemini/detect", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Missing text parameter" });
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
      console.error("Gemini Detect Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to detect product" });
    }
  });

  app.post("/api/gemini/extract-features", async (req, res) => {
    try {
      const { productName } = req.body;
      if (!productName) return res.status(400).json({ error: "Missing productName parameter" });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: "You are an elite hardware/software analyst."
        },
        contents: `Provide exactly 3 hyper-concise, highly technical features (max 5 words each) for the product: "${productName}". Example format: "A17 Pro Bionic Chip, Titanium Aerospace Frame, 120Hz ProMotion Display". Separate by commas.`,
      });
      const text = response.text?.trim() || "";
      const features = text.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 3);
      res.json({ features });
    } catch (e: any) {
      console.error("Gemini Extract Features Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to extract features" });
    }
  });

  app.post("/api/gemini/shopping-advice", async (req, res) => {
    try {
      const { query, results } = req.body;
      const systemInstruction = `You are "BuyWise INDIA Intelligence Assistant", an elite AI with unparalleled, genius-level market intelligence and predictive pricing models.
     
Your core identity is to guide users to the best purchasing decisions using the BuyWise App features. You know everything about the BuyWise platform:
1. ABOUT THE BUYWISE APP:
   - It is a comprehensive AI-powered Shopping and Travel Super App.
   - Primary features: AI Product Search & Real-time Comparison, Interactive 3D Product Viewer (which renders real-time 3D textures/meshes for physical assessment), Price Radar & Trend Tracking, Google Flights Integration & Travel Route Builder, and real-time Premium user sync.
   - Created by: mohammdsaeed24 (with lead developer awanwarsi).

2. SUBSCRIPTION & PRICING PLANS:
   - We offer three premium tiers:
     - Weekly Pass: ₹30 (Provides Unlimited AI Insights, Price Drop Alerts, & Flight/Train scans)
     - Monthly Elite: ₹100 (Adds a Premium Badge, Ad-free Experience, & Priority Support)
     - Forever Founder (Lifetime): ₹700 (Includes all features, Early Access, Lifetime Support)
   - Users pay by scanning the QR code, entering the UTR transaction number, and submitting a premium request. Admin (mohammdsaeed24) approves requests from the Admin Panel. Once approved, the status is updated instantly in real-time. Admin can also revoke premium access if needed.

3. POWERFUL SECTIONS WITHIN THE APP:
   - PRODUCT SEARCH & COMPARE (Home): Searches Amazon, Flipkart, Croma, and Reliance Digital. It also uses Google Shopping (SerpApi) or falls back to mock intelligence. It displays rating, discount badge, delivery ETA, source, and a custom 3D viewer button.
   - 3D VIEW (Interactive Viewer): Let users inspect high-fidelity 3D renderings of products to check specifications.
   - PRICE RADAR (Wishlist): Allows tracking of prices with alerts and AI price-trend predictions.
   - TRAVEL ROUTE BUILDER: Under "/travel", users can search real-time flight routes, find prices in INR, check duration, and plan itineraries. It also has Google Flights autocomplete.
   - ADMIN PANEL: Under "/admin", accessible by email "mohammdsaeed24@gmail.com". Has real-time stats and allows managing premium requests.

Always respond professionally with genius-level insight. If analyzing product search results, deliver a cutting-edge, ruthless market synthesis for the user query. Identify precise value arbitrage (price vs hardware specs), pinpoint the exact platform yielding maximum ROI, and cite actual Rupee (₹) figures from the data. Expose marketing gimmicks. Be hyper-intelligent, authoritative, and visionary. Include details about BuyWise app features and plans whenever appropriate.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemInstruction,
        },
        contents: `User Query: "${query}"\n\nMarket Search Results Data: ${JSON.stringify(results?.slice(0, 5) || [])}`,
      });
      res.json({ advice: response.text?.trim() || "Analyzing macro-economic market vectors..." });
    } catch (e: any) {
      console.error("Gemini Shopping Advice Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to generate shopping advice" });
    }
  });

  app.post("/api/gemini/predict-trend", async (req, res) => {
    try {
      const { productTitle, currentPriceStr } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: "You are BuyWise Predictor, an elite AI market analyst."
        },
        contents: `Analyze the price trend for "${productTitle}" currently priced at "${currentPriceStr}".
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
      res.json(JSON.parse(jsonStr));
    } catch (e: any) {
      console.error("Gemini Predict Trend Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to predict price trend" });
    }
  });

  app.post("/api/support/chat", async (req, res) => {
    try {
      const { messages, userEmail } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing messages array" });
      }

      const systemInstruction = `You are "BuyWise Support Intelligence", the official virtual assistant for BuyWise, a futuristic shopping engine and travel super app designed for smart consumers in India and globally.

YOUR VITAL INFO & APP SPECS:
1. WHAT IS BUYWISE?
   - BuyWise is a high-tech shopping, tracking, and travel booking companion. It combines AI product search, price forecasting, interactive 3D product examination, and Google Flights integration into a single beautiful portal.
   - Built and owned solely by the visionary developer & creator awanwarsi.

2. KEY MODULES & FEATURES:
   - PRODUCT EXPLORER (Home): Instantly searches Amazon, Flipkart, Croma, and Reliance Digital. Provides smart pricing, discount comparisons, fast delivery ETAs, and detailed product specifications.
   - INTERACTIVE 3D VIEWER: Accessible from compared search items. Users inspect high-fidelity, interactive 3D product structures and aesthetics to judge physical build quality.
   - PRICE RADAR (Wishlist): Tracks item prices, provides smart drop alerts, and uses advanced Gemini AI predictive models to forecast whether prices will go UP, DOWN, or remain STABLE.
   - TRAVEL ROUTE FINDER (/travel): Under the Travel tab, users construct optimal flight paths in Indian Rupees (₹), analyze travel durations, search autocomplete routes with Google Flights, and build beautiful travel itineraries.
   - ADMIN PANEL (/admin): Run by the owner awanwarsi. Enables instant real-time oversight of premium status requests, stats telemetry, and subscription control (approving or revoking premium access in real-time).

3. PREMIUM TIERS & PAYMENT PROCESS:
   - Weekly Pass: ₹30 (Unlimited AI shopping insights, price-drop alerts, flight scans).
   - Monthly Elite: ₹100 (No Ads, Premium Profile Badge, Priority Support).
   - Forever Founder: ₹700 (Lifetime access, all current & beta features, direct developer access).
   - PAYMENT WORKFLOW: Go to the "Premium" tab, pick a plan, scan the custom UPI QR Code, enter your payment's Unique Transaction Reference (UTR) number, and submit.
   - APPROVAL SCHEDULE: Approved manually by owner awanwarsi. Approval takes only 5 to 10 minutes on Saturdays and Sundays, and between 9 AM to 3 PM on Monday to Friday. Once approved, the database updates in real-time instantly.

4. USER CORRESPONDENCE & ESCALATION:
   - If a user asks to contact human support, or wants direct human help with their payment approval/refund, let them know that:
     - Owner & Developer is awanwarsi
     - Support Channel is WhatsApp: +91 77604 49306
     - Say: "Let me open the Live Support Channels for you!" or mention they can click the direct links to WhatsApp.

REPLY STYLE:
- Be extremely polite, high-tech, and intelligent. Keep your responses crisp, scannable, and extremely helpful.
- Reference actual rupees (₹) when explaining plans.
- Give exact, direct answers to what the user asks.

Current user's email: ${userEmail || "anonymous / guest"}`;

      // Safely transform history to Gemini API format (ensuring first message is user and properly alternates)
      const contents = formatGeminiContents(messages);

      // If no valid user input can be found, return a fallback greeting
      if (contents.length === 0) {
        return res.json({ text: "Namaste! I am your BuyWise AI Support. How can I help you find products, track prices, or manage your Premium subscription today?" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemInstruction,
        },
        contents: contents,
      });

      res.json({ text: response.text?.trim() || "I am connected to the BuyWise brain. How can I guide your journey today?" });
    } catch (e: any) {
      console.error("Support Chat Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to process support chat" });
    }
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

  app.get("/api/airports", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";

    try {
      const params = {
        engine: "google_flights_autocomplete",
        q,
        api_key: serpApiKey,
        hl: "en",
        gl: "us"
      };
      const serpResponse = await axios.get("https://serpapi.com/search", { params });
      return res.json(serpResponse.data.suggestions || []);
    } catch (e: any) {
      console.error("Autocomplete API Error:", e.response?.data || e.message);
      res.status(500).json({ error: "Failed to fetch autocomplete" });
    }
  });

  app.get("/api/flights", async (req, res) => {
    const { departure_id, arrival_id, outbound_date, return_date, type, adults } = req.query;
    const serpApiKey = process.env.SERP_API_KEY || "542dce7198130662e8dd49b345591dec556b37394cc9a0e3dd0010d5f1354075";

    try {
      const params: any = {
        engine: "google_flights",
        departure_id: departure_id || "BOM",
        arrival_id: arrival_id || "DEL",
        outbound_date: outbound_date,
        type: type || "2", // default to one-way
        adults: adults || "1",
        api_key: serpApiKey,
        hl: "en",
        gl: "in",
        currency: "INR"
      };

      if (return_date && type === "1") {
        params.return_date = return_date;
      }

      const serpResponse = await axios.get("https://serpapi.com/search", { params });
      return res.json(serpResponse.data);
    } catch (e: any) {
      console.error("Flight API Error:", e.response?.data || e.message);
      res.status(500).json({ error: "Failed to fetch flights" });
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
