import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import {
  getOrCreateProfile,
  awardCoins,
  getTransactions,
  checkLoginStreak,
  recordSearch,
  submitReferralCode,
  checkAndCompleteReferral,
  getReferralStats,
  getLeaderboard,
  redeemReward,
  getPublicStats,
  adminAction,
  ACHIEVEMENTS,
  getReviews,
  submitReview
} from "./src/server/gamificationDb.js";

dotenv.config();

let cloudProjectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || "";

// Fetch project ID from metadata server on startup if not already set
async function fetchMetadataProjectId() {
  if (!cloudProjectId) {
    try {
      const res = await axios.get("http://metadata.google.internal/computeMetadata/v1/project/project-id", {
        headers: { "Metadata-Flavor": "Google" },
        timeout: 1000
      });
      if (res.data && typeof res.data === 'string') {
        cloudProjectId = res.data.trim();
        console.log("Fetched Cloud Project ID from metadata server:", cloudProjectId);
      }
    } catch (e: any) {
      console.log("Could not fetch Project ID from metadata server (using fallback):", e.message);
    }
  }
}
fetchMetadataProjectId();

function getAi() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  const key = process.env.GEMINI_API_KEY.trim();
  const isAccessToken = key.startsWith("ya29.");
  
  const ai = new GoogleGenAI({
    apiKey: isAccessToken ? "ya29_OAUTH_DUMMY" : key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  if (isAccessToken) {
    const anyAi = ai as any;
    const patchAuth = (authObj: any) => {
      if (authObj && typeof authObj.addAuthHeaders === "function") {
        authObj.addAuthHeaders = async (headers: any) => {
          headers.set("Authorization", `Bearer ${key}`);
          const pId = cloudProjectId || "ais-asia-east1-7f4152bfb94e4ec";
          headers.set("x-goog-user-project", pId);
        };
      }
    };
    
    if (anyAi.apiClient && anyAi.apiClient.clientOptions) {
      patchAuth(anyAi.apiClient.clientOptions.auth);
    }
    if (anyAi.live) {
      patchAuth(anyAi.live.auth);
    }
  }

  return ai;
}

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

  // ==========================================
  // --- BUYWISE GAMIFICATION API ENDPOINTS ---
  // ==========================================

  // Helper middleware to extract user context from custom headers passed by the client
  const getUserContext = (req: any, res: any, next: any) => {
    const userId = req.headers["x-user-id"] as string;
    const email = req.headers["x-user-email"] as string;
    const name = req.headers["x-user-name"] as string;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Missing user context headers." });
    }
    req.userContext = { userId, email: email || "", name: name || "Anonymous User" };
    next();
  };

  // Get or Create User Profile
  app.get("/api/gamification/profile", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const profile = getOrCreateProfile(userId, email, name);
      res.json(profile);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Daily Check-in / Login Streak Trigger
  app.post("/api/gamification/login", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = checkLoginStreak(userId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Record Search and Award Coins
  app.post("/api/gamification/search", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    const { query: queryText } = req.body;
    try {
      const result = recordSearch(userId, queryText || "");
      // Check if referral should complete on first search
      if (result.searchesCount === 1) {
        const refResult = checkAndCompleteReferral(userId);
        if (refResult.triggered) {
          (result as any).referralReward = refResult;
        }
      }
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Social Sharing Coins Reward (+20 coins)
  app.post("/api/gamification/share", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = awardCoins(userId, 20, "Shared BuyWise deal to social network");
      res.json({ success: true, coins: result.coins, gained: 20 });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Write Review Coins Reward (+10 coins)
  app.post("/api/gamification/review", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = awardCoins(userId, 10, "Submitted a verified merchant review");
      res.json({ success: true, coins: result.coins, gained: 10 });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET user reviews
  app.get("/api/gamification/reviews", (req: any, res: any) => {
    try {
      const reviewsList = getReviews();
      res.json(reviewsList);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST a new user review and earn coins
  app.post("/api/gamification/reviews", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    const { rating, comment } = req.body;
    if (rating === undefined || !comment) {
      return res.status(400).json({ error: "Missing rating or comment parameters" });
    }
    try {
      const result = submitReview(userId, email, name, Number(rating), comment);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Complete Profile Setup Reward (+25 coins)
  app.post("/api/gamification/profile-complete", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = awardCoins(userId, 25, "Completed registration and profile setup");
      res.json({ success: true, coins: result.coins, gained: 25 });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Coins Transactions List for User
  app.get("/api/gamification/transactions", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const txns = getTransactions(userId);
      res.json(txns);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Achievements List with Completion Flag
  app.get("/api/gamification/achievements", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const profile = getOrCreateProfile(userId, email, name);
      const result = ACHIEVEMENTS.map(ach => ({
        ...ach,
        unlocked: profile.achievements.includes(ach.id)
      }));
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Enter Referral Code (By referred friend)
  app.post("/api/gamification/referral/join", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    const { referralCode } = req.body;
    if (!referralCode) return res.status(400).json({ error: "Missing referralCode parameter" });
    try {
      const result = submitReferralCode(userId, referralCode);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get Referral Metrics & Link for Referral Dashboard
  app.get("/api/gamification/referral/stats", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const stats = getReferralStats(userId);
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get Global Leaderboards (Top 100)
  app.get("/api/gamification/leaderboard", (req: any, res: any) => {
    try {
      const metric = (req.query.metric || "coins") as "coins" | "referrals" | "searches" | "savings";
      const list = getLeaderboard(metric);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Redeem Coins for Premium discounts or trials
  app.post("/api/gamification/redeem", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    const { rewardType } = req.body;
    if (!rewardType) return res.status(400).json({ error: "Missing rewardType parameter" });
    try {
      const result = redeemReward(userId, rewardType);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Public Savings Counter (Smooth Dynamic API)
  app.get("/api/gamification/public-stats", (req: any, res: any) => {
    try {
      const stats = getPublicStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Trending & Daily Deals Feed
  app.get("/api/gamification/deals", (req: any, res: any) => {
    const { category, type, limit } = req.query;
    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      if (!fs.existsSync(storePath)) {
        return res.json([]);
      }
      const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      let filtered = [...raw.deals];

      if (category && category !== "all") {
        filtered = filtered.filter((d: any) => d.category === category);
      }

      if (type === "best") {
        filtered.sort((a: any, b: any) => b.discountPercent - a.discountPercent);
      } else if (type === "trending") {
        filtered.sort((a: any, b: any) => b.views - a.views);
      } else if (type === "flash") {
        filtered = filtered.filter((d: any) => d.isFlashDeal);
      } else if (type === "editor") {
        filtered = filtered.filter((d: any) => d.isEditorPick);
      } else if (type === "under500") {
        filtered = filtered.filter((d: any) => d.newPrice < 500);
      } else if (type === "under1000") {
        filtered = filtered.filter((d: any) => d.newPrice < 1000);
      } else if (type === "under5000") {
        filtered = filtered.filter((d: any) => d.newPrice < 5000);
      }

      if (limit) {
        filtered = filtered.slice(0, Number(limit));
      }

      res.json(filtered);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Save / Share / View actions on curated Deals
  app.post("/api/gamification/deals/action", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    const { dealId, action } = req.body;
    if (!dealId || !action) return res.status(400).json({ error: "Missing parameters" });
    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      const dealIndex = raw.deals.findIndex((d: any) => d.id === dealId);
      
      if (dealIndex >= 0) {
        const deal = raw.deals[dealIndex];
        if (action === "save") {
          deal.saves = (deal.saves || 0) + 1;
        } else if (action === "share") {
          deal.purchases = (deal.purchases || 0) + 1;
          // Award 2 coins for sharing a curated deal!
          awardCoins(userId, 2, `Shared deal: ${deal.title}`);
        } else if (action === "view") {
          deal.views = (deal.views || 0) + 1;
        }
        
        fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), "utf-8");
        return res.json({ success: true, deal });
      }
      res.status(404).json({ error: "Deal not found" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update User Notification Preferences
  app.post("/api/gamification/notifications/preferences", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    const { preferences, enabled } = req.body;
    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      const profile = raw.profiles[userId];
      if (profile) {
        if (enabled !== undefined) profile.notificationsEnabled = enabled;
        if (preferences) profile.notificationPreferences = preferences;
        fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), "utf-8");
        return res.json({ success: true, profile });
      }
      res.status(404).json({ error: "Profile not found" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin Actions Override
  app.post("/api/gamification/admin/action", (req: any, res: any) => {
    const { action, payload } = req.body;
    try {
      const result = adminAction(action, payload);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get Admin Profiles & Stats list (to manage them)
  app.get("/api/gamification/admin/users", (req: any, res: any) => {
    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      res.json(Object.values(raw.profiles));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get Admin Referrals list (to ban them)
  app.get("/api/gamification/admin/referrals", (req: any, res: any) => {
    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      res.json(raw.referrals);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Gemini AI Proxies (Secure Server-Side Implementation)
  app.post("/api/gemini/detect", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Missing text parameter" });
      const isUrl = text.startsWith('http');
      let result = text;
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Identify the main product being described or linked: "${text}". 
          Return ONLY the concise product name with model number if applicable (no extra punctuation). 
          Example: "iPhone 15 Pro", "Sony WH-1000XM5". ${isUrl ? 'If it is a URL, parse the product name from the slug.' : ''}`,
        });
        result = response.text?.trim().replace(/^"|"$/g, '') || text;
      } catch (err: any) {
        console.warn("Gemini Detect failed, using local parser:", err.message);
        if (isUrl) {
          try {
            const urlObj = new URL(text);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;
            result = lastPart.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          } catch {
            result = text;
          }
        } else {
          result = text;
        }
      }
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
      let features: string[] = [];
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: "You are an elite hardware/software analyst."
          },
          contents: `Provide exactly 3 hyper-concise, highly technical features (max 5 words each) for the product: "${productName}". Example format: "A17 Pro Bionic Chip, Titanium Aerospace Frame, 120Hz ProMotion Display". Separate by commas.`,
        });
        const text = response.text?.trim() || "";
        features = text.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 3);
      } catch (err: any) {
        console.warn("Gemini Extract Features failed, using local database:", err.message);
        const lowerName = productName.toLowerCase();
        if (lowerName.includes("iphone") || lowerName.includes("apple") || lowerName.includes("phone") || lowerName.includes("samsung") || lowerName.includes("pixel")) {
          features = ["Super Retina XDR OLED", "Next-Gen Pro Processor", "High-Resolution Pro Camera"];
        } else if (lowerName.includes("macbook") || lowerName.includes("laptop") || lowerName.includes("computer") || lowerName.includes("dell") || lowerName.includes("hp")) {
          features = ["Elite Ultra Silicon Chip", "Liquid Retina Pro Display", "All-Day Battery Backup"];
        } else if (lowerName.includes("sony") || lowerName.includes("headphone") || lowerName.includes("buds") || lowerName.includes("ear") || lowerName.includes("audio")) {
          features = ["Active Noise Cancellation", "High-Res Wireless Audio", "Comfortable Ergonomic Fit"];
        } else {
          features = ["Premium Industrial Build", "Optimized Custom Performance", "Smart AI Super Integration"];
        }
      }
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

      let advice = "";
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: systemInstruction,
          },
          contents: `User Query: "${query}"\n\nMarket Search Results Data: ${JSON.stringify(results?.slice(0, 5) || [])}`,
        });
        advice = response.text?.trim() || "Analyzing macro-economic market vectors...";
      } catch (err: any) {
        console.warn("Gemini Shopping Advice failed, using local intelligence engine:", err.message);
        
        // Dynamic smart fallback matching the guidelines exactly
        const list = results || [];
        let lowestPrice = 999999;
        let lowestItem: any = null;
        let highestRating = 0;
        let highestRatedItem: any = null;

        for (const item of list) {
          const cleanPrice = parseInt((item.price || "").replace(/[^0-9]/g, "")) || 0;
          if (cleanPrice > 0 && cleanPrice < lowestPrice) {
            lowestPrice = cleanPrice;
            lowestItem = item;
          }
          const cleanRating = parseFloat(item.rating) || 0;
          if (cleanRating > highestRating) {
            highestRating = cleanRating;
            highestRatedItem = item;
          }
        }

        const lowestPriceStr = lowestItem ? lowestItem.price : "competitive pricing";
        const lowestSource = lowestItem ? lowestItem.source : "online retailers";
        const lowestTitle = lowestItem ? lowestItem.title : query;

        advice = `### 🌟 BuyWise Market Intelligence Analysis

After running our multi-threaded analysis on your search for **"${query}"**, our predictive pricing engine has synthesized the following core insights:

1. **Optimal Platform Selection (Maximum ROI)**:
   - The absolute best price point currently identified is **${lowestPriceStr}** available on **${lowestSource}** for the **${lowestTitle}**.
   - Purchasing through this channel delivers maximum immediate savings compared to retail standard pricing.

2. **Market Value Arbitrage & Gimmick Exposure**:
   - Always double-check "delivery fees" or "shipping delays" which some platforms use to inflate the final transaction value. 
   - We highly recommend checking our interactive **3D View** on BuyWise to physically inspect build quality, aesthetics, and hardware proportions before finalizing your transaction.

3. **Strategic Recommendations**:
   - Add this product to your BuyWise **Price Radar** (Wishlist) immediately. Our system tracks this item continuously and sends instant price drop alerts directly to you.
   - For complete unrestricted access to all our high-frequency AI deal comparison models, flights/train scans, and real-time custom notifications, upgrade to **BuyWise Premium**:
     - **Weekly Pass**: Only ₹30 (Perfect for immediate shopping sprints)
     - **Monthly Elite**: ₹100 (Unlocks premium status, priority developer support, and zero ads)
     - **Forever Founder (Lifetime)**: ₹700 (Direct lifetime updates, lifetime developer contact, and ultimate status)`;
      }
      res.json({ advice });
    } catch (e: any) {
      console.error("Gemini Shopping Advice Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to generate shopping advice" });
    }
  });

  app.post("/api/gemini/predict-trend", async (req, res) => {
    try {
      const { productTitle, currentPriceStr } = req.body;
      let trendData: any = null;
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
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
        trendData = JSON.parse(jsonStr);
      } catch (err: any) {
        console.warn("Gemini Predict Trend failed, using local predictor:", err.message);
        const priceNum = parseInt((currentPriceStr || "₹45,000").replace(/[^0-9]/g, "")) || 45000;
        const rand = (productTitle || "").length % 3;
        let trend = "STABLE";
        let predictedPrice = priceNum;
        let explanation = "";

        if (rand === 0) {
          trend = "DOWN";
          predictedPrice = Math.round(priceNum * 0.94);
          explanation = "Expected to drop by 6% due to imminent competitor stock updates and seasonal vendor discount allocations.";
        } else if (rand === 1) {
          trend = "UP";
          predictedPrice = Math.round(priceNum * 1.03);
          explanation = "Slight 3% rise forecasted because of high global demand vectors and diminishing component supplies.";
        } else {
          trend = "STABLE";
          predictedPrice = priceNum;
          explanation = "Price remains robust and highly stable with zero immediate supplier adjustments forecasted.";
        }

        const formattedPrice = "₹" + predictedPrice.toLocaleString("en-IN");
        trendData = {
          trend,
          predictedPrice: formattedPrice,
          explanation
        };
      }
      res.json(trendData);
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

      const systemInstruction = `You are "BuyWise Support Intelligence", the highly sophisticated, super-intelligent virtual support brain for BuyWise (formerly PriceVerse AI), the ultimate futuristic price-arbitrage shopping engine, 3D product examination hub, and flight tracker built exclusively for smart consumers.

OWNERSHIP & CORE MISSION:
- This app is built and solely owned by the brilliant developer and creator: **Awanwarsi**.
- Your mission is to provide deeply detailed, highly intelligent, and extremely helpful support. Under no circumstances should you provide generic or robotic replies. Understand the user's intent fully and provide clear, contextual, and accurate solutions.

DETAILED APP CAPABILITIES & MODULES:
1. **PRODUCT EXPLORER (Home Tab)**: 
   - Dynamically searches major e-commerce platforms in real-time (Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales, etc.).
   - Employs live web-grounding to identify and present the absolute lowest price variant (including discounts, coupons, bank card offers).
   - Shows specifications, specs radar chart, delivery ETAs, and comparison matrices.
2. **INTERACTIVE 3D VIEWER (3D Stage)**:
   - Allows users to interactively rotate, zoom, and inspect devices (such as mobile phones, laptops, and accessories) in high-fidelity 3D to check structural proportions, camera bumps, and premium aesthetics.
   - Accessed directly via the "3D View" action button on product cards from the Home explorer search results.
3. **PRICE RADAR (Wishlist Tab)**:
   - Tracks saved items continuously.
   - Integrates Gemini AI models to run deep trend analysis and forecast whether the price will go UP, DOWN, or remain STABLE, offering explicit analytical justifications.
4. **TRAVEL ROUTE FINDER (Travel Tab)**:
   - A complete travel assistant using Google Flights auto-completion.
   - Searches routes in Indian Rupees (₹) and builds optimal multi-city or single-leg flight paths and elegant trip itineraries.
5. **ADMIN CONTROLS (/admin)**:
   - Restricted to the owner, **Awanwarsi**. Allows him to approve premium subscriptions in real-time, inspect telemetry logs, view payment UTR entries, and manage site parameters.

PREMIUM USERS, PRICING & PAYMENT WORKFLOW:
- Premium unlocks the **Cognitive Assistant (Red floating bot)** on the home explorer, which gives personalized shopping suggestions, compares specs, and acts as an AI shopping companion.
- **Premium Subscription Plans**:
  - **Weekly Pass (₹30)**: Unlimited AI shopping, continuous price tracking, flight scans.
  - **Monthly Elite (₹100)**: No ads, premium custom profile badge, priority support queue.
  - **Forever Founder (₹700)**: All premium features for life, priority direct chat access to Awanwarsi, and future beta releases.
- **UPI QR Code payment**:
  1. The user navigates to the **Premium** tab.
  2. Selects their preferred plan and scans the custom UPI QR Code displayed on-screen.
  3. Completes payment through any UPI app (GPay, PhonePe, Paytm, BHIM, etc.).
  4. Copies the 12-digit **Unique Transaction Reference (UTR)** or transaction ID from their payment app.
  5. Pastes the UTR into our form and submits it.

 manual PAYMENT APPROVAL & VERIFICATION TIMES (CRITICAL):
- Once a user submits their UTR, the developer **Awanwarsi** manually verifies the payment in our bank account before approving.
- **HOW MUCH TIME WILL IT TAKE TO BE APPROVED?** Tell the user clearly:
  - **Saturdays & Sundays (Weekends)**: Manual verification is active and super-fast! It takes only **5 to 10 minutes** to get approved and activated.
  - **Mondays to Fridays (Weekdays)**: Verification and approval are processed between **9 AM and 3 PM (IST)**. Submissions outside this weekday window are approved early the next morning.
- Remind users that entering an accurate 12-digit UTR is essential for instant approval.

ESCALATING TO HUMAN SUPPORT:
- If the user has a complex billing issue, refund request, or their payment isn't approved, provide the following contact info:
  - **Developer/Owner**: Awanwarsi
  - **Official WhatsApp Support**: **+91 77604 49306** (Direct instant link: https://wa.me/917760449306)
  - **Support Email**: **mohammdsaeed24@gmail.com** or **awanwarsi790@gmail.com**
  - Inform them that clicking the "Headset" icon on the support header or asking to speak with an agent will open the support links directly in the UI.

TONE & BEHAVIOR:
- Sound super-intelligent, respectful, highly skilled, and professional.
- Always address the user warmly. Use beautiful Markdown styling (headers, bolding, clean bullet points, code blocks where appropriate) to render answers elegantly.
- If they ask about approval times, outline the schedule in a highly reassuring, neat table or clear list format.
- Let the user know we value their presence on BuyWise!

Current logged-in user email: ${userEmail || "anonymous / guest"}`;

      const contents = formatGeminiContents(messages);

      if (contents.length === 0) {
        return res.json({ text: "Namaste! I am the BuyWise Support Intelligence. I can help you with anything regarding our 3D product view, price radar trend forecasts, travel flights tracking, billing, or UPI Premium verification. What's on your mind today?" });
      }

      let chatText = "";
      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error("GEMINI_API_KEY is not configured.");
        }
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: systemInstruction,
          },
          contents: contents,
        });
        chatText = response.text?.trim() || "I am connected to the BuyWise brain. How can I guide your journey today?";
      } catch (err: any) {
        console.warn("Gemini Support Chat failed, using smart local FAQs parser:", err.message);
        
        // Intelligent rules-based chatbot response mapping keywords to perfect answers
        const lastUserMessage = messages[messages.length - 1]?.text || "";
        const lowerInput = lastUserMessage.toLowerCase();

        if (lowerInput.includes("premium") || lowerInput.includes("plan") || lowerInput.includes("weekly") || lowerInput.includes("monthly") || lowerInput.includes("elite") || lowerInput.includes("founder") || lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("payment")) {
          chatText = `### 🌟 BuyWise Premium Plans & Payment Workflow

We offer three premium, high-octane plans to elevate your shopping & travel intelligence:

- **Weekly Pass (₹30)**: Perfect for instant shopping runs. Includes unlimited AI shopping advice, price drop alerts, and Google Flight autocomplete scans.
- **Monthly Elite (₹100)**: Our most popular plan. Adds a shiny **Premium Profile Badge**, entirely ad-free experience, and priority support.
- **Forever Founder (₹700)**: True VIP status. Lifetime access to all modules, including future beta releases, and direct support.

**To Upgrade**:
1. Navigate to the **Premium** tab in the top navigation bar.
2. Select your desired plan, scan the displayed **UPI QR Code** to pay.
3. Enter your payment's 12-digit **Unique Transaction Reference (UTR)** number and submit the form. 
4. The owner **Awanwarsi** will verify your payment manually and approve!`;
        } else if (lowerInput.includes("approve") || lowerInput.includes("approval") || lowerInput.includes("time") || lowerInput.includes("how long") || lowerInput.includes("wait") || lowerInput.includes("pending") || lowerInput.includes("utr")) {
          chatText = `### 🕒 Premium Approval & Verification Schedule

Manual payment verifications are handled with absolute priority by our creator, **Awanwarsi**:

| Day of Week | Verification Window (IST) | Expected Approval Time |
| :--- | :--- | :--- |
| **Saturdays & Sundays** | **Active 24/7** | **Only 5 to 10 Minutes!** |
| **Mondays to Fridays** | **9:00 AM to 3:00 PM** | **Within 15 to 30 Minutes** |

*Note: Weekday submissions made after 3:00 PM are approved early the next morning.*

**To ensure instant approval**:
1. Double-check your 12-digit UPI UTR Transaction Number in the receipt.
2. Submit it accurately on the Premium page. 
3. The moment Awanwarsi matches the UTR, your account becomes Premium instantly in real-time!`;
        } else if (lowerInput.includes("radar") || lowerInput.includes("track") || lowerInput.includes("trend") || lowerInput.includes("wishlist")) {
          chatText = `### 🎯 Price Radar & Trend Tracking

The **Price Radar** (Wishlist tab) is your powerful tool for pricing arbitrage:

- **Continuous Tracking**: Add any product from the Home screen. We scan Amazon, Flipkart, Croma, and Reliance Digital to monitor prices.
- **AI Trend Forecasting**: Click on any tracked item to see advanced AI forecasts (UP, DOWN, or STABLE) with a detailed analytical explanation of market trends.
- **Instant Drop Alerts**: You will receive notifications the moment prices drop, ensuring you buy at the absolute minimum.`;
        } else if (lowerInput.includes("3d") || lowerInput.includes("viewer") || lowerInput.includes("mesh") || lowerInput.includes("inspect")) {
          chatText = `### 📦 Interactive 3D Product Viewer

Our **3D Viewer** sets BuyWise apart from standard search lists:

- **Physical Assessment**: Inspect product structural proportions, port alignments, camera bumps, and visual texture aesthetics interactively in a high-fidelity 3D workspace.
- **Accessing 3D View**: Search for a product on the Home explorer. Any compared result card features a dedicated **3D View** button. Click it to launch the immersive rendering stage instantly!`;
        } else if (lowerInput.includes("flight") || lowerInput.includes("travel") || lowerInput.includes("route") || lowerInput.includes("itinerary")) {
          chatText = `### ✈️ Travel Route Finder & Flights

Construct beautiful travels effortlessly using the **Travel** module:

- **Google Flights Autocomplete**: Simply start typing to search for airports by airport code or city name (e.g., BOM for Mumbai, DEL for Delhi) with rapid autocompletion.
- **Optimal Route Optimization**: Enter your outbound dates, passenger count, and route details to receive flight options displayed clearly in Indian Rupees (₹) with flight durations, departure schedules, and booking paths.`;
        } else if (lowerInput.includes("contact") || lowerInput.includes("human") || lowerInput.includes("help") || lowerInput.includes("whatsapp") || lowerInput.includes("email") || lowerInput.includes("refund") || lowerInput.includes("owner") || lowerInput.includes("developer")) {
          chatText = `### 📞 Live Human Escalation Channels

I am happy to connect you directly to our human support desk! 

- **Developer & Owner**: Awanwarsi
- **Direct Support Channel (WhatsApp)**: **+91 77604 49306**
- **Support Email**: **mohammdsaeed24@gmail.com** or **awanwarsi790@gmail.com**

Please click the WhatsApp button on the support panel or send a message mentioning your registered email address and UTR reference. Let me open the Live Support Channels for you!`;
        } else {
          chatText = `### 🌌 Namaste! Welcome to BuyWise Intelligent Support

I am your unified assistant for BuyWise, the ultimate shopping and travel super app built by Awanwarsi. 

I can assist you with any questions regarding:
- **Price Radar & Forecasting**: Predicting price movements on Amazon & Flipkart.
- **Interactive 3D View**: Physically assessing device build qualities.
- **Google Flights Tracker**: Searching and finding flight options in INR.
- **Premium Subscriptions**: Details on the Weekly (₹30), Monthly (₹100), or Forever (₹700) tiers.
- **Payment Verification**: UTR approvals and manual schedule.

Please feel free to ask a specific question, or select one of our suggested questions below!`;
        }
      }

      res.json({ text: chatText });
    } catch (e: any) {
      console.error("Support Chat Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to process support chat" });
    }
  });

  // SERP/Rapid API Search
  app.get("/api/search", async (req, res) => {
    const { q, originalUrl } = req.query;
    const rapidApiKey = process.env.RAPID_API_KEY;
    const queryStr = typeof q === 'string' ? q : '';
    const origUrlStr = typeof originalUrl === 'string' ? originalUrl : '';

    console.log(`[API Search] Product name: "${queryStr}", originalUrl: "${origUrlStr}"`);

    const urlToAnalyze = (origUrlStr.startsWith('http') ? origUrlStr : (queryStr.startsWith('http') ? queryStr : ''));

    // Try Gemini Google Search Grounding first for best real-time results
    try {
      const aiClient = getAi();
      let contentsPrompt = "";

      if (urlToAnalyze) {
        contentsPrompt = `You are "BuyWise INDIA Intelligence", a genius price comparison engine designed to locate the absolute CHEAPEST possible deal across the web.
The user provided a product URL: "${urlToAnalyze}" (Product Name/Detected query: "${queryStr}").

Your CRITICAL tasks:
1. Thoroughly analyze and search for the product on "${urlToAnalyze}". Find the absolute CHEAPEST option, seller, or variant (e.g., color, storage, renewed, or bundled offers) available ON THAT SPECIFIC PAGE/LINK. Take into account any live coupons, card discounts, or price drops on that link to get the absolute lowest price.
2. Execute searches using your googleSearch tool on other top Indian e-commerce platforms: Amazon.in, Flipkart.com, Croma.com, RelianceDigital.in, VijaySales.com, TataCliq.com, JioMart.com.
3. For EACH of these competitor websites, locate the absolute lowest/cheapest live price of the exact same product model (not generic/unrelated models). Ensure you are matching the exact same item.
4. Compare all prices side-by-side.

CRITICAL INSTRUCTION ON TRUSTED SOURCES:
- Only retrieve results from highly trusted, major e-commerce websites and apps in India. These are strictly: Amazon.in, Flipkart.com, Croma.com, RelianceDigital.in, VijaySales.com, TataCliq.com, JioMart.com, Samsung.com, Apple.com, or official manufacturer stores in India.
- DO NOT include untrusted third-party sites, blogs, random deals websites, or unverified stores. Every result must lead to a real, trusted portal.

Return a JSON object with a single key "shopping_results" which is an array of objects.
The array must have 6-8 items:
- One of the items MUST represent the cheapest option/seller found on the user's original link ("${urlToAnalyze}"). For this item, set "isOriginalLink" to true, "link" to "${urlToAnalyze}", and "source" to the retailer name (e.g., "Amazon", "Flipkart", "Croma").
- The subsequent items must be the cheapest matching deals found on OTHER competitor websites for comparison. For these, set "isOriginalLink" to false.
- Ensure all prices are in INR format with Rupee symbol, e.g., "₹24,990".
- Ensure the results are sorted by price in ascending order (cheapest overall listing at the very top of the list).

Format each item exactly like this:
{
  "title": "Concise product title",
  "price": "₹24,990",
  "old_price": "₹29,990" (or null if no discount),
  "thumbnail": "Product image URL",
  "link": "Direct product/search link",
  "source": "Store name (e.g. Amazon, Flipkart, Croma, Reliance Digital)",
  "rating": 4.5,
  "delivery": "Free delivery / ETA",
  "isOriginalLink": true/false
}`;
      } else {
        contentsPrompt = `You are "BuyWise INDIA Intelligence", a genius price comparison engine designed to locate the absolute CHEAPEST possible deal across the web.
The user is searching for: "${queryStr}".

Your CRITICAL tasks:
1. Execute searches using your googleSearch tool on all top Indian e-commerce platforms: Amazon.in, Flipkart.com, Croma.com, RelianceDigital.in, VijaySales.com, TataCliq.com, JioMart.com.
2. Search for the absolute lowest, cheapest live prices for the exact product query: "${queryStr}". Look for any live coupons, credit card bank offers, sale drops, or seller discounts to find the absolute minimum pricing.
3. Compare all prices side-by-side.

CRITICAL INSTRUCTION ON TRUSTED SOURCES:
- Only retrieve results from highly trusted, major e-commerce websites and apps in India. These are strictly: Amazon.in, Flipkart.com, Croma.com, RelianceDigital.in, VijaySales.com, TataCliq.com, JioMart.com, Samsung.com, Apple.com, or official manufacturer stores in India.
- DO NOT include untrusted third-party sites, blogs, random deals websites, or unverified stores. Every result must lead to a real, trusted portal.

Return a JSON object with a single key "shopping_results" which is an array of 6-8 objects, sorted strictly by price in ascending order (cheapest overall listing at the very top of the list!).

Format each item exactly like this:
{
  "title": "Concise product title",
  "price": "₹24,990",
  "old_price": "₹29,990" (or null if no discount),
  "thumbnail": "Product image URL",
  "link": "Direct product/search link",
  "source": "Store name (e.g. Amazon, Flipkart, Croma, Reliance Digital)",
  "rating": 4.5,
  "delivery": "Free delivery",
  "isOriginalLink": false
}`;
      }

      console.log(`[API Search] Fetching real-time grounding search results for "${queryStr}"`);
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsPrompt,
        config: {
          responseMimeType: "application/json",
          tools: [{ googleSearch: {} }]
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed && Array.isArray(parsed.shopping_results) && parsed.shopping_results.length > 0) {
        console.log(`[API Search] Success! Gemini Grounding returned ${parsed.shopping_results.length} results.`);
        return res.json(parsed);
      }
    } catch (geminiErr: any) {
      console.error("[API Search] Gemini Grounding failed, falling back to legacy APIs:", geminiErr.message);
    }

    // Traditional/Legacy fallback search starts here
    try {
      let results: any[] = [];

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
            results = [...results, ...amazonRes.data.results.map((r: any) => ({ ...r, source: "Amazon", isOriginalLink: false }))];
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
            results = [...results, ...flipkartRes.data.results.map((r: any) => ({ ...r, source: "Flipkart", isOriginalLink: false }))];
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
                        link: originalLink,
                        isOriginalLink: originalLink === urlToAnalyze
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
                  link: urlToAnalyze || "https://amazon.in",
                  source: "Amazon",
                  rating: 4.8,
                  delivery: "Tomorrow by 9 PM",
                  isOriginalLink: !!urlToAnalyze
                },
                {
                  title: `${queryStr} - Pro Edition`,
                  price: "₹82,499",
                  old_price: "₹102,000",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://flipkart.com",
                  source: "Flipkart",
                  rating: 4.6,
                  delivery: "In 2 Days",
                  isOriginalLink: false
                },
                {
                  title: `${queryStr} (Store Pickup Available)`,
                  price: "₹86,990",
                  old_price: "₹99,990",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://croma.com",
                  source: "Croma",
                  rating: 4.5,
                  delivery: "Store Pickup",
                  isOriginalLink: false
                },
                {
                  title: `${queryStr} Base Variant`,
                  price: "₹88,000",
                  old_price: "₹95,000",
                  thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: "https://reliancedigital.in",
                  source: "Reliance Digital",
                  rating: 4.7,
                  delivery: "Tomorrow",
                  isOriginalLink: false
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
