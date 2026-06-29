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
  transferCoins,
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
  submitReview,
  recordBarcodeScan,
  getScanHistory,
  getAllScans,
  getAffiliateSettings,
  getTelegramConfig,
  updateAffiliateSettings,
  updateTelegramConfig,
  recordAffiliateClick,
  addDealDirectly,
  spinWheel,
  completeMission
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

// Global fetch interceptor to handle Google OAuth and Federated access tokens correctly,
// stripping key query params and x-goog-api-key headers that get appended by the SDK.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let urlStr = "";
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (input && typeof input === "object" && "url" in input) {
    urlStr = (input as any).url;
  }

  if (urlStr.includes("googleapis.com") && process.env.GEMINI_API_KEY) {
    const key = process.env.GEMINI_API_KEY.trim();
    const isAccessToken = key.startsWith("ya29.") || key.startsWith("AQ.");
    
    if (isAccessToken) {
      const url = new URL(urlStr);
      if (url.searchParams.has("key")) {
        url.searchParams.delete("key");
      }
      urlStr = url.toString();
      
      const newInit: any = { ...init };
      const newHeaders = new Headers();

      // Extract existing headers from input Request object if it is one
      if (input && typeof input === 'object' && 'headers' in input && input.headers) {
        if (typeof (input.headers as any).forEach === 'function') {
          (input.headers as any).forEach((val: string, k: string) => {
            newHeaders.set(k, val);
          });
        } else {
          for (const [k, val] of Object.entries(input.headers)) {
            newHeaders.set(k, val as string);
          }
        }
      }

      // Merge headers from init
      if (init && init.headers) {
        const initHeaders = new Headers(init.headers);
        initHeaders.forEach((val, k) => {
          newHeaders.set(k, val);
        });
      }
      
      newHeaders.delete("x-goog-api-key");
      newHeaders.set("Authorization", `Bearer ${key}`);
      newHeaders.set("x-goog-user-project", cloudProjectId || "ais-asia-east1-7f4152bfb94e4ec");
      newInit.headers = newHeaders;
      
      if (input && typeof input === 'object' && input.constructor.name === 'Request') {
        const reqObj = input as any;
        newInit.method = reqObj.method;
        newInit.credentials = reqObj.credentials;
        newInit.mode = reqObj.mode;
        newInit.referrer = reqObj.referrer;
        newInit.signal = reqObj.signal;
        if (reqObj.method !== 'GET' && reqObj.method !== 'HEAD' && !newInit.body) {
          try {
            newInit.body = reqObj.clone().body;
          } catch (e) {
            // Ignore clone error
          }
        }
        return originalFetch(new Request(urlStr, newInit));
      } else {
        return originalFetch(urlStr, newInit);
      }
    }
  }
  
  return originalFetch(input, init);
};

function getAi() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  const key = process.env.GEMINI_API_KEY.trim();
  const isAccessToken = key.startsWith("ya29.") || key.startsWith("AQ.");
  
  const headers: Record<string, string> = {
    'User-Agent': 'aistudio-build',
  };
  
  if (isAccessToken) {
    headers['Authorization'] = `Bearer ${key}`;
    headers['x-goog-user-project'] = cloudProjectId || "ais-asia-east1-7f4152bfb94e4ec";
  }

  const ai = new GoogleGenAI({
    apiKey: isAccessToken ? "dummy" : key,
    httpOptions: {
      headers
    }
  });

  if (isAccessToken) {
    const anyAi = ai as any;
    const patchAuth = (authObj: any) => {
      if (authObj && typeof authObj.addAuthHeaders === "function") {
        authObj.addAuthHeaders = async (reqHeaders: any) => {
          // Do not call the original to prevent x-goog-api-key injection
          reqHeaders.set("Authorization", `Bearer ${key}`);
          const pId = cloudProjectId || "ais-asia-east1-7f4152bfb94e4ec";
          reqHeaders.set("x-goog-user-project", pId);
        };
        // The SDK checks for `googleAuth` to be truthy, or else throws "Trying to set google-auth headers but googleAuth is unset"
        // if apiKey is missing, so we must set it to a dummy object.
        authObj.googleAuth = {};
      }
    };
    
    if (anyAi.apiClient && anyAi.apiClient.clientOptions) {
      if (anyAi.apiClient.clientOptions.auth) {
        anyAi.apiClient.clientOptions.auth.apiKey = undefined;
      }
      anyAi.apiClient.clientOptions.apiKey = undefined;
      patchAuth(anyAi.apiClient.clientOptions.auth);
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

  // Transfer Coins
  app.post("/api/gamification/transfer", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    const { toUserId, amount } = req.body;
    try {
      const result = transferCoins(userId, toUserId, amount);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json({ error: result.message });
      }
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

  // Spin to Win
  app.post("/api/gamification/spin", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = spinWheel(userId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Complete Mission
  app.post("/api/gamification/mission", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    const { missionId } = req.body;
    try {
      if (!missionId) return res.status(400).json({ error: "Missing missionId" });
      const result = completeMission(userId, missionId);
      res.json(result);
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

  // Deterministic local fallback generator for physical barcodes
  const getLocalBarcodeFallback = (barcode: string, format?: string) => {
    let seed = 0;
    for (let i = 0; i < barcode.length; i++) {
      seed += barcode.charCodeAt(i);
    }

    const fallbacks = [
      {
        productName: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        brand: "Sony",
        category: "electronics",
        thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        description: "Industry-leading noise canceling headphones with dual processors, 8 microphones, and Auto NC Optimizer.",
        lowestPrice: 24990,
        highestPrice: 29990,
        discountPercent: 17,
        bestSellerStore: "Amazon",
        deliveryEstimate: "Delivery by tomorrow",
        availability: true,
        recommendation: "Recommended Purchase: We highly recommend buying from Amazon as you save ₹5,000 compared to other premium retailers, plus they offer free next-day Prime delivery.",
        lowestPriceEver: 23990,
        highestPriceEver: 29990,
        shopping_results: [
          { source: "Amazon", price: "₹24,990", old_price: "₹29,990", link: "https://www.amazon.in/", rating: 4.6, delivery: "Free delivery", isCheapest: true },
          { source: "Croma", price: "₹26,490", old_price: "₹29,990", link: "https://www.croma.com/", rating: 4.5, delivery: "Express store pickup", isCheapest: false },
          { source: "Reliance Digital", price: "₹27,990", old_price: "₹29,990", link: "https://www.reliancedigital.in/", rating: 4.4, delivery: "Delivery in 2 days", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 27000 },
          { date: "Feb", price: 26500 },
          { date: "Mar", price: 25800 },
          { date: "Apr", price: 26200 },
          { date: "May", price: 24990 },
          { date: "Jun", price: 24990 }
        ]
      },
      {
        productName: "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
        brand: "Apple",
        category: "mobiles",
        thumbnail: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&q=80",
        description: "Forged in titanium, featuring the groundbreaking A17 Pro chip, a customizable Action button, and a powerful iPhone camera system.",
        lowestPrice: 124900,
        highestPrice: 134900,
        discountPercent: 7,
        bestSellerStore: "Flipkart",
        deliveryEstimate: "Delivery by Wednesday",
        availability: true,
        recommendation: "Recommended Purchase: Flipkart is offering a direct discount of ₹10,000 with additional HDFC Bank card benefits making it the best option.",
        lowestPriceEver: 121900,
        highestPriceEver: 134900,
        shopping_results: [
          { source: "Flipkart", price: "₹1,24,900", old_price: "₹1,34,900", link: "https://www.flipkart.com/", rating: 4.7, delivery: "Free delivery", isCheapest: true },
          { source: "Apple Store Online", price: "₹1,34,900", old_price: "₹1,34,900", link: "https://www.apple.com/in/", rating: 4.9, delivery: "Free express delivery", isCheapest: false },
          { source: "Croma", price: "₹1,27,900", old_price: "₹1,34,900", link: "https://www.croma.com/", rating: 4.6, delivery: "Next-day delivery", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 134900 },
          { date: "Feb", price: 132000 },
          { date: "Mar", price: 129900 },
          { date: "Apr", price: 128900 },
          { date: "May", price: 124900 },
          { date: "Jun", price: 124900 }
        ]
      },
      {
        productName: "boAt Nirvana Ion True Wireless Earbuds",
        brand: "boAt",
        category: "electronics",
        thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
        description: "Immerse in pure sound with boAt Signature Sound, massive 120 hours total playback, and ASAP Charge.",
        lowestPrice: 1999,
        highestPrice: 3490,
        discountPercent: 42,
        bestSellerStore: "Amazon",
        deliveryEstimate: "Delivery by tomorrow",
        availability: true,
        recommendation: "Recommended Purchase: We highly recommend buying from Amazon as you save ₹1,491 compared to retail price, and it includes free next-day express shipping.",
        lowestPriceEver: 1799,
        highestPriceEver: 3490,
        shopping_results: [
          { source: "Amazon", price: "₹1,999", old_price: "₹3,490", link: "https://www.amazon.in/", rating: 4.2, delivery: "Free delivery", isCheapest: true },
          { source: "boAt Website", price: "₹2,299", old_price: "₹3,490", link: "https://www.boat-lifestyle.com/", rating: 4.5, delivery: "Free shipping", isCheapest: false },
          { source: "Flipkart", price: "₹2,099", old_price: "₹3,490", link: "https://www.flipkart.com/", rating: 4.1, delivery: "Delivery in 3 days", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 2499 },
          { date: "Feb", price: 2299 },
          { date: "Mar", price: 1999 },
          { date: "Apr", price: 2099 },
          { date: "May", price: 1999 },
          { date: "Jun", price: 1999 }
        ]
      },
      {
        productName: "Bose QuietComfort Ultra Wireless Headphones",
        brand: "Bose",
        category: "electronics",
        thumbnail: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80",
        description: "World-class noise cancellation, breakthrough spatialized audio for more immersive listening, and premium materials.",
        lowestPrice: 35900,
        highestPrice: 39900,
        discountPercent: 10,
        bestSellerStore: "Croma",
        deliveryEstimate: "Delivery by tomorrow",
        availability: true,
        recommendation: "Recommended Purchase: Buy from Croma as they have an ongoing brand tie-up offering instant card discounts and cashbacks up to ₹3,000.",
        lowestPriceEver: 34900,
        highestPriceEver: 39900,
        shopping_results: [
          { source: "Croma", price: "₹35,900", old_price: "₹39,900", link: "https://www.croma.com/", rating: 4.7, delivery: "Free shipping", isCheapest: true },
          { source: "Amazon", price: "₹36,490", old_price: "₹39,900", link: "https://www.amazon.in/", rating: 4.6, delivery: "Free delivery", isCheapest: false },
          { source: "Reliance Digital", price: "₹37,900", old_price: "₹39,900", link: "https://www.reliancedigital.in/", rating: 4.5, delivery: "Delivery in 2 days", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 39900 },
          { date: "Feb", price: 38500 },
          { date: "Mar", price: 37000 },
          { date: "Apr", price: 36500 },
          { date: "May", price: 35900 },
          { date: "Jun", price: 35900 }
        ]
      },
      {
        productName: "Sony PlayStation 5 Slim Console",
        brand: "Sony",
        category: "gaming",
        thumbnail: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80",
        description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.",
        lowestPrice: 44990,
        highestPrice: 54990,
        discountPercent: 18,
        bestSellerStore: "ShopatSC",
        deliveryEstimate: "Delivery in 2 days",
        availability: true,
        recommendation: "Recommended Purchase: Buy from ShopatSC (Sony Center) to guarantee standard official warranty and bundle options at zero markup.",
        lowestPriceEver: 42990,
        highestPriceEver: 54990,
        shopping_results: [
          { source: "ShopatSC", price: "₹44,990", old_price: "₹54,990", link: "https://www.shopatsc.com/", rating: 4.8, delivery: "Free shipping", isCheapest: true },
          { source: "Amazon", price: "₹49,990", old_price: "₹54,990", link: "https://www.amazon.in/", rating: 4.6, delivery: "Free delivery", isCheapest: false },
          { source: "Flipkart", price: "₹45,990", old_price: "₹54,990", link: "https://www.flipkart.com/", rating: 4.5, delivery: "Free shipping", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 54990 },
          { date: "Feb", price: 52000 },
          { date: "Mar", price: 49990 },
          { date: "Apr", price: 45990 },
          { date: "May", price: 44990 },
          { date: "Jun", price: 44990 }
        ]
      },
      {
        productName: "MacBook Air 13-inch M3 Chip (8GB Unified, 256GB SSD)",
        brand: "Apple",
        category: "laptops",
        thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
        description: "The incredibly thin MacBook Air with M3 chip breezes through work and play, featuring up to 18 hours of battery life.",
        lowestPrice: 104900,
        highestPrice: 114900,
        discountPercent: 8,
        bestSellerStore: "Croma",
        deliveryEstimate: "Delivery by tomorrow",
        availability: true,
        recommendation: "Recommended Purchase: Croma has student card discounts and corporate partnership cashbacks bringing the price down to ₹1,04,900.",
        lowestPriceEver: 101900,
        highestPriceEver: 114900,
        shopping_results: [
          { source: "Croma", price: "₹1,04,900", old_price: "₹1,14,900", link: "https://www.croma.com/", rating: 4.8, delivery: "Free shipping", isCheapest: true },
          { source: "Amazon", price: "₹1,09,900", old_price: "₹1,14,900", link: "https://www.amazon.in/", rating: 4.7, delivery: "Free delivery", isCheapest: false },
          { source: "Apple Store Online", price: "₹1,14,900", old_price: "₹1,14,900", link: "https://www.apple.com/in/", rating: 4.9, delivery: "Free express delivery", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 114900 },
          { date: "Feb", price: 112000 },
          { date: "Mar", price: 109900 },
          { date: "Apr", price: 106900 },
          { date: "May", price: 104900 },
          { date: "Jun", price: 104900 }
        ]
      }
    ];

    const chosen = fallbacks[seed % fallbacks.length];
    return {
      ...chosen,
      barcode
    };
  };

  // Barcode Scan Processing & AI Price Comparison
  app.post("/api/gamification/barcode/scan", getUserContext, async (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    const { barcode, format } = req.body;
    
    if (!barcode) {
      return res.status(400).json({ error: "Missing barcode parameter" });
    }

    console.log(`[Barcode Scan API] User "${name}" (${userId}) scanned barcode "${barcode}" (${format || 'UNKNOWN'})`);

    let parsedData: any = null;

    try {
      const aiClient = getAi();
      
      const prompt = `You are "BuyWise INDIA Intelligence Barcode Engine".
The user has scanned a physical product barcode: "${barcode}" (Format: "${format || 'EAN_13/UPC_A'}").

Your tasks:
1. Identify the exact product details (Product Name, Brand, Category, Short Description, and a matching High-Quality Product Image URL) associated with this barcode. You MUST use your googleSearch tool to lookup this barcode or identify what product is mapped to it.
2. Search top Indian online stores (Amazon.in, Flipkart.com, Croma.com, RelianceDigital.in, VijaySales.com, TataCliq.com, JioMart.com, Myntra, Ajio) for the live cheapest prices.
3. If this barcode is a demo/unrecognized or has no exact matches, look up the digits or creatively map it to a highly popular electronic gadget, fashion item, or appliance so the user has a spectacular, functional demo experience!
4. Compare all available prices side-by-side. Highlight the cheapest option.
5. Create a professional, smart "AI Recommendation" explaining why that store is the best purchase option (considering price, trust, shipping, etc.).

Return a JSON object exactly matching this schema:
{
  "productName": "Exact full name of the identified product",
  "brand": "Brand name (e.g., Sony, Apple, Bose, Samsung, Nike)",
  "category": "electronics / fashion / home / grocery / gaming / mobiles / laptops",
  "barcode": "${barcode}",
  "thumbnail": "High-quality product image URL from Unsplash or a real product image found",
  "description": "Short 1-2 sentence description of the product and its key specs",
  "lowestPrice": 24990,
  "highestPrice": 29990,
  "discountPercent": 17,
  "bestSellerStore": "Amazon",
  "deliveryEstimate": "Delivery by tomorrow / 2 days / etc.",
  "availability": true,
  "shopping_results": [
    {
      "source": "Amazon",
      "price": "₹24,990",
      "old_price": "₹29,990",
      "link": "https://www.amazon.in/",
      "rating": 4.5,
      "delivery": "Free delivery",
      "isCheapest": true
    }
  ],
  "recommendation": "Recommended Purchase: We highly recommend buying from Flipkart as you save ₹1,000 compared to Amazon, and it includes free next-day express delivery.",
  "priceHistory": [
    {"date": "Jan", "price": 27000},
    {"date": "Feb", "price": 26500},
    {"date": "Mar", "price": 25800},
    {"date": "Apr", "price": 26200},
    {"date": "May", "price": 24990},
    {"date": "Jun", "price": 24990}
  ],
  "alternatives": [
    { "name": "Similar Product Name", "price": "₹22,990", "reason": "Better value for money" }
  ],
  "coupons": [
    { "code": "SAVE500", "discount": "₹500", "description": "Flat ₹500 off on Axis Bank cards" }
  ],
  "lowestPriceEver": 23990,
  "highestPriceEver": 29990
}`;

      const isAccessToken = process.env.GEMINI_API_KEY?.trim().startsWith("ya29.") || process.env.GEMINI_API_KEY?.trim().startsWith("AQ.");
      let response;
      
      if (isAccessToken) {
        console.log("[Barcode Scan API] OAuth token detected. Bypassing Google Search grounding tool to avoid auth issues.");
        response = await aiClient.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      } else {
        try {
          response = await aiClient.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              tools: [{ googleSearch: {} }]
            }
          });
        } catch (searchErr: any) {
          console.warn("[Barcode Scan API] Gemini Search Grounding failed, retrying without grounding tool:", searchErr.message);
          response = await aiClient.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });
        }
      }

      const resultText = response.text?.trim() || "{}";
      parsedData = JSON.parse(resultText);

    } catch (apiErr: any) {
      console.warn("[Barcode Scan API] Gemini API processing failed, falling back to smart local scanner:", apiErr.message);
      parsedData = getLocalBarcodeFallback(barcode, format);
    }

    try {
      // Record this scan in our database scan history
      const recordResult = recordBarcodeScan({
        userId,
        userEmail: email,
        userName: name || "Anonymous User",
        barcode,
        productName: parsedData.productName || "Unknown Product",
        category: parsedData.category || "electronics",
        brand: parsedData.brand || "Unknown",
        lowestPrice: parsedData.lowestPrice || 0,
        highestPrice: parsedData.highestPrice || 0
      });

      res.json({
        success: true,
        data: parsedData,
        coinsAwarded: recordResult.coinsAwarded,
        scansCount: recordResult.scansCount
      });

    } catch (e: any) {
      console.error("[Barcode Scan Error]", e);
      res.status(500).json({ error: "Failed to process barcode scan via AI. " + e.message });
    }
  });

  // Get User's Scan History
  app.get("/api/gamification/barcode/history", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const history = getScanHistory(userId);
      res.json(history);
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

  // --- AFFILIATE & TELEGRAM APIS ---

  async function parseTelegramPost(text: string): Promise<any> {
    try {
      const ai = getAi();
      const prompt = `You are an elite, highly accurate shopping deal parser. Parse the following Telegram deal post. Extract pricing and link accurately.

Categories MUST be one of: "electronics" | "fashion" | "home" | "grocery" | "gaming" | "mobiles" | "laptops".
Source MUST be one of: "amazon" | "flipkart" | "croma" | "reliance" | "vijaysales" | "tatacliq" | "myntra" | "ajio". If not matching, map to "amazon".
If prices are found, convert them to raw numbers (remove commas, currency symbols like ₹, Rs, etc.).
CRITICAL PRICE EXTRACTION: 
- The price mentioned in the text (e.g., "At Rs.399", "Only ₹500") is the newPrice.
- If an original price is mentioned (e.g. crossed out or "was 1000"), that is the oldPrice.
- If a discount percentage is mentioned (e.g., "93% Off") and no oldPrice is explicitly stated, you MUST calculate the oldPrice mathematically: oldPrice = newPrice / (1 - discount/100). (e.g., 93% off Rs.399 -> oldPrice is 5700).
- If neither oldPrice nor discount is mentioned, calculate oldPrice as 15-30% higher than newPrice.
If no link is found, default to "https://www.amazon.in".
If thumbnail is needed, select a high-quality product photo URL from Unsplash.

Telegram Message:
"${text}"`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [prompt],
        config: {
          responseMimeType: "application/json"
        }
      });

      let textRes = response.text || "{}";
      textRes = textRes.trim();
      if (textRes.startsWith("```json")) {
        textRes = textRes.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      } else if (textRes.startsWith("```")) {
        textRes = textRes.replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
      }
      const parsed = JSON.parse(textRes);
      return parsed;
    } catch (err: any) {
      console.error("Gemini Telegram parse failed, using fallback regex:", err.message);
      let source = "amazon";
      if (text.toLowerCase().includes("flipkart")) source = "flipkart";
      else if (text.toLowerCase().includes("croma")) source = "croma";
      else if (text.toLowerCase().includes("reliance")) source = "reliance";
      
      let link = "https://www.amazon.in";
      const linkMatch = text.match(/https?:\/\/[^\s]+/);
      if (linkMatch) link = linkMatch[0];

      // Better fallback pricing
      let newPrice = 999;
      let oldPrice = 1499;
      let discountPercent = 33;

      // Extract discount if explicitly mentioned
      let explicitDiscount = 0;
      const potentialDiscounts = text.match(/(\d+)%/);
      if (potentialDiscounts) {
         explicitDiscount = parseInt(potentialDiscounts[1]);
      }

      // Extract prices (ignore numbers followed immediately by % or small numbers under 50 unless it's the only one)
      // Match numbers optionally preceded by Rs, ₹, INR etc. We'll just look for numbers > 50 to avoid confusing with % or quantities, unless there's only one.
      const priceMatches = text.match(/\d+(?:,\d+)?/g);
      if (priceMatches && priceMatches.length > 0) {
        // filter out the discount number if we found one
        let numbers = priceMatches.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => !isNaN(n) && n > 0);
        if (explicitDiscount > 0) {
           numbers = numbers.filter(n => n !== explicitDiscount);
        }

        if (numbers.length > 0) {
           newPrice = numbers.reduce((a, b) => Math.min(a, b));
           oldPrice = numbers.reduce((a, b) => Math.max(a, b));
           
           if (oldPrice <= newPrice || oldPrice === newPrice) {
               if (explicitDiscount > 0 && explicitDiscount < 100) {
                   oldPrice = Math.round(newPrice / (1 - explicitDiscount / 100));
               } else {
                   oldPrice = Math.round(newPrice * 1.3);
               }
           }
           discountPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
        }
      }

      return {
        title: (text.length > 60 ? text.substring(0, 60) + "..." : text).replace(/\n/g, ' '),
        category: "electronics",
        oldPrice,
        newPrice,
        discountPercent,
        thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
        source,
        link,
        isBestSeller: false,
        isEditorPick: true,
        isFlashDeal: false
      };
    }
  }

  // Get affiliate settings and click analytics
  app.get("/api/affiliate/settings", (req: any, res: any) => {
    try {
      res.json(getAffiliateSettings());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Save affiliate store configurations
  app.post("/api/affiliate/settings", (req: any, res: any) => {
    const { stores } = req.body;
    try {
      const result = updateAffiliateSettings(stores);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Track affiliate click and return redirection link
  app.post("/api/affiliate/click", (req: any, res: any) => {
    const { store, productId, productTitle, category, url } = req.body;
    try {
      // Record click analytics
      recordAffiliateClick({ store, productId, productTitle, category });

      // Generate the secure affiliate URL
      const settings = getAffiliateSettings();
      const storeName = store ? store.toLowerCase() : "amazon";
      const config = settings.stores[storeName];
      
      let affiliateUrl = url || "https://www.amazon.in";
      if (config && config.enabled && config.tag) {
        try {
          const u = new URL(affiliateUrl);
          u.searchParams.set(config.paramName || "tag", config.tag);
          affiliateUrl = u.toString();
        } catch {
          const separator = affiliateUrl.includes("?") ? "&" : "?";
          affiliateUrl = `${affiliateUrl}${separator}${config.paramName || "tag"}=${encodeURIComponent(config.tag)}`;
        }
      }
      
      res.json({ success: true, affiliateUrl });
    } catch (err: any) {
      res.status(500).json({ error: err.message, affiliateUrl: url });
    }
  });

  // Get Telegram webhook / channel configurations
  app.get("/api/telegram/config", (req: any, res: any) => {
    try {
      res.json(getTelegramConfig());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Save Telegram webhook / channel configurations
  app.post("/api/telegram/config", (req: any, res: any) => {
    const { config } = req.body;
    try {
      const result = updateTelegramConfig(config);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Telegram incoming deals receiver webhook
  app.post("/api/telegram/webhook", async (req: any, res: any) => {
    try {
      const update = req.body;
      console.log("Telegram webhook update received:", JSON.stringify(update));
      
      // Support Telegram bot channel_post update
      const message = update.channel_post || update.message || update;
      const text = message.text || message.caption || "";
      const customPhotoUrl = message.photo_url || "";
      
      if (!text) {
        return res.json({ success: false, message: "No text content found in Telegram payload." });
      }

      // Parse with Gemini!
      const parsedDeal = await parseTelegramPost(text);
      if (customPhotoUrl) {
        parsedDeal.thumbnail = customPhotoUrl;
      }
      
      // Save directly to raw deals list so it shows in deals section
      const createdDeal = addDealDirectly(parsedDeal);

      // Append to the direct data_store file
      const storePath = path.join(process.cwd(), "data_store.json");
      if (fs.existsSync(storePath)) {
        const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
        if (!raw.deals) raw.deals = [];
        raw.deals.unshift(createdDeal);
        fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), "utf-8");
      }
      
      res.json({ success: true, message: "Deal parsed and added to BuyWise live deals section", deal: createdDeal });
    } catch (err: any) {
      console.error("Telegram webhook parse error:", err.message);
      res.status(500).json({ error: err.message });
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
      
      let parsed = { result: text, minPrice: null, maxPrice: null, brand: null };
      
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-2.0-flash",
          config: { responseMimeType: "application/json" },
          contents: `Analyze the user's shopping search query: "${text}".
          1. Identify the core product name (e.g. "iPhone 15 Pro", "Sony WH-1000XM5"). ${isUrl ? 'Parse it from the URL slug if needed.' : ''}
          2. Detect any price constraints (e.g. "under 60000", "below 500", "between 1000 and 2000"). If mentioned in rupees or dollars, just output the numeric value.
          3. Detect any specific brand mentioned.
          
          Return JSON matching:
          {
            "result": "Concise product name",
            "minPrice": number or null,
            "maxPrice": number or null,
            "brand": "Brand name" or null
          }`,
        });
        
        const resultText = response.text?.trim() || "{}";
        const json = JSON.parse(resultText);
        parsed.result = json.result || text;
        parsed.minPrice = json.minPrice;
        parsed.maxPrice = json.maxPrice;
        parsed.brand = json.brand;
      } catch (err: any) {
        console.warn("Gemini Detect failed, using local parser:", err.message);
        if (isUrl) {
          try {
            const urlObj = new URL(text);
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;
            parsed.result = lastPart.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          } catch {
            parsed.result = text;
          }
        }
      }
      res.json(parsed);
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
          model: "gemini-2.0-flash",
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

  app.post("/api/gemini/shopper-plan", async (req, res) => {
    try {
      const { query } = req.body;
      const systemInstruction = `You are the BuyWise AI Personal Shopper. You receive natural language queries like "I have ₹30,000. Build me the best gaming setup."
You must output ONLY valid JSON representing a complete shopping plan. Do NOT output markdown code blocks.
The JSON must follow this exact structure:
{
  "title": "Title of the plan",
  "totalBudget": number,
  "totalCost": number,
  "savings": number,
  "summary": "A brief explanation of why you chose these products and how it fits the budget.",
  "products": [
    {
      "id": "unique-string",
      "name": "Product Name",
      "brand": "Brand",
      "price": number,
      "originalPrice": number,
      "store": "Amazon",
      "rating": 4.5,
      "imageUrl": "https://example.com/image.jpg",
      "discount": "10% OFF",
      "delivery": "Tomorrow",
      "recommendation": "Why you picked this specific item",
      "link": "https://amazon.in/dp/example"
    }
  ]
}

- Use realistic mock products if you don't have live internet access.
- Make prices in INR (₹). Use numbers for prices (e.g. 5000, not "5,000").
- Use placeholder images from Unsplash or clear image URLs.
- Ensure the totalCost does not exceed the totalBudget (infer budget from the prompt if possible).
- ALWAYS output ONLY raw JSON. No markdown. No text outside JSON.`;

      let planJsonStr = "";
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-2.0-flash",
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json"
          },
          contents: `User Query: "${query}"`,
        });
        planJsonStr = response.text?.trim() || "";
        // Clean up markdown block if the model accidentally included it
        if (planJsonStr.startsWith("```json")) {
           planJsonStr = planJsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
        }
        const plan = JSON.parse(planJsonStr);
        res.json(plan);
      } catch (err: any) {
        console.warn("Gemini Shopper Plan failed:", err.message);
        res.json({
          title: "Optimized Custom Plan",
          totalBudget: 50000,
          totalCost: 45000,
          savings: 5000,
          summary: "Based on your request, this curated list balances high performance with cost-efficiency. (Fallback AI active due to rate limits)",
          products: [
            {
              id: "fallback_1",
              name: "High-Performance Workstation Monitor",
              brand: "Samsung",
              price: 15000,
              originalPrice: 20000,
              store: "Amazon",
              rating: 4.6,
              imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60",
              discount: "25% OFF",
              delivery: "Tomorrow",
              recommendation: "Perfect screen real estate and color accuracy for your budget.",
              link: "https://amazon.in/"
            },
            {
              id: "fallback_2",
              name: "Ergonomic Office Chair",
              brand: "GreenSoul",
              price: 8000,
              originalPrice: 12000,
              store: "Flipkart",
              rating: 4.8,
              imageUrl: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&auto=format&fit=crop&q=60",
              discount: "33% OFF",
              delivery: "2 Days",
              recommendation: "Excellent lumbar support for long hours.",
              link: "https://flipkart.com/"
            }
          ]
        });
      }
    } catch (e: any) {
      console.error("Shopper Plan Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to generate plan" });
    }
  });

  app.post("/api/gemini/shopping-advice", async (req, res) => {
    try {
      const { query, results } = req.body;
      const systemInstruction = `You are "BuyWise INDIA Intelligence Assistant", an elite AI with unparalleled, genius-level market intelligence and predictive pricing models.
     
Your core identity is to act as the world's smartest AI shopping assistant (like ChatGPT combined with Google Shopping). You must guide users to the best purchasing decisions.
You have the ability to:
- Compare products (price, specifications, pros, cons, overall winner).
- Explain technical specifications in simple terms.
- Suggest better or cheaper alternatives.
- Detect fake discounts (warn the user if a price drop seems artificially inflated).
- Provide budget shopping advice and comprehensive buying guides.
- Give daily shopping tips and recommendations.

1. ABOUT THE BUYWISE APP:
   - It is a comprehensive AI-powered Shopping and Travel Super App.
   - Primary features: AI Product Search & Real-time Comparison, Interactive 3D Product Viewer, Price Radar & Trend Tracking, Smart Barcode Scanner with local Offline Queuing, Google Flights Integration, and real-time Premium user sync.
   - Created by: mohammdsaeed24 (with lead developer awanwarsi).

2. SUBSCRIPTION & PRICING PLANS:
   - We offer three premium tiers:
     - Weekly Pass: ₹30 (Provides Unlimited AI Insights, Price Drop Alerts, & Flight/Train scans)
     - Monthly Elite: ₹100 (Adds a Premium Badge, Ad-free Experience, & Priority Support)
     - Forever Founder (Lifetime): ₹700 (Includes all features, Early Access, Lifetime Support)

3. POWERFUL SECTIONS WITHIN THE APP:
   - PRODUCT SEARCH & COMPARE (Home): Searches top platforms.
   - 3D VIEW (Interactive Viewer): Let users inspect high-fidelity 3D renderings of products.
   - SMART SCANNER: Barcode scanning with Offline Queuing and real-time price intercept.
   - PRICE RADAR (Wishlist): Allows tracking of prices with alerts and AI price-trend predictions.
   - TRAVEL ROUTE BUILDER: Under "/travel".

Always respond professionally with genius-level insight. If analyzing product search results, deliver a cutting-edge, ruthless market synthesis for the user query. Identify precise value arbitrage (price vs hardware specs), pinpoint the exact platform yielding maximum ROI, and cite actual Rupee (₹) figures from the data. Expose marketing gimmicks and fake discounts. Be hyper-intelligent, authoritative, and visionary. Format your response elegantly using markdown (lists, bold text, etc.).`;

      let advice = "";
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-2.0-flash",
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
          model: "gemini-2.0-flash",
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
          model: "gemini-2.0-flash",
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
      const isAccessToken = process.env.GEMINI_API_KEY?.trim().startsWith("ya29.") || process.env.GEMINI_API_KEY?.trim().startsWith("AQ.");
      let response;
      
      if (isAccessToken) {
        console.log("[API Search] OAuth token detected. Bypassing Google Search grounding tool to avoid auth issues.");
        response = await aiClient.models.generateContent({
          model: "gemini-2.0-flash",
          contents: contentsPrompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      } else {
        try {
          response = await aiClient.models.generateContent({
            model: "gemini-2.0-flash",
            contents: contentsPrompt,
            config: {
              responseMimeType: "application/json",
              tools: [{ googleSearch: {} }]
            }
          });
        } catch (searchErr: any) {
          console.warn("[API Search] Gemini Search Grounding failed, retrying without grounding tool:", searchErr.message);
          response = await aiClient.models.generateContent({
            model: "gemini-2.0-flash",
            contents: contentsPrompt,
            config: {
              responseMimeType: "application/json"
            }
          });
        }
      }

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

  // Travelpayouts Integration
  app.get("/api/travelpayouts/search", async (req, res) => {
    const { origin, destination, depart_date, return_date, adults, cabin_class, type } = req.query;
    const travelPayoutsMarker = process.env.TRAVELPAYOUTS_MARKER || "543965"; // Example affiliate ID

    try {
      // In a production environment, this would call the official Aviasales/Travelpayouts API
      // Since API keys require user registration, we'll generate realistic mock data 
      // but return properly formatted Travelpayouts Deep Links for bookings to track conversions.

      const mockFlights = [
        {
          id: "tp-1",
          airline: "IndiGo",
          airline_logo: "https://images.kiwi.com/airlines/64/6E.png",
          price: 4500,
          original_price: 5200,
          flight_number: "6E-234",
          departure_time: "06:00",
          arrival_time: "08:15",
          departure_airport: (origin as string)?.toUpperCase() || "BOM",
          arrival_airport: (destination as string)?.toUpperCase() || "DEL",
          duration: "2h 15m",
          layovers: 0,
          cabin_class: cabin_class || "Economy",
          baggage: "15kg Check-in, 7kg Cabin",
          refundable: false,
          booking_link: `https://kiwi.tpo.lu/bybnqDEf`
        },
        {
          id: "tp-2",
          airline: "Air India",
          airline_logo: "https://images.kiwi.com/airlines/64/AI.png",
          price: 5100,
          original_price: 6000,
          flight_number: "AI-112",
          departure_time: "09:30",
          arrival_time: "11:50",
          departure_airport: (origin as string)?.toUpperCase() || "BOM",
          arrival_airport: (destination as string)?.toUpperCase() || "DEL",
          duration: "2h 20m",
          layovers: 0,
          cabin_class: cabin_class || "Economy",
          baggage: "20kg Check-in, 7kg Cabin",
          refundable: true,
          booking_link: `https://kiwi.tpo.lu/bybnqDEf`
        },
        {
          id: "tp-3",
          airline: "Vistara",
          airline_logo: "https://images.kiwi.com/airlines/64/UK.png",
          price: 6800,
          original_price: 7500,
          flight_number: "UK-899",
          departure_time: "17:45",
          arrival_time: "20:00",
          departure_airport: (origin as string)?.toUpperCase() || "BOM",
          arrival_airport: (destination as string)?.toUpperCase() || "DEL",
          duration: "2h 15m",
          layovers: 0,
          cabin_class: cabin_class || "Economy",
          baggage: "15kg Check-in, 7kg Cabin",
          refundable: true,
          booking_link: `https://kiwi.tpo.lu/bybnqDEf`
        }
      ];

      return res.json({ flights: mockFlights, marker: travelPayoutsMarker });
    } catch (e: any) {
      console.error("Travelpayouts API Error:", e.message);
      res.status(500).json({ error: "Failed to fetch flights from Travelpayouts" });
    }
  });

  // Admin Dashboard Mock Data
  app.get("/api/admin/stats", (req, res) => {
    try {
      const scans = getAllScans();
      const totalScans = scans.length;
      
      // Calculate most scanned products
      const productFreq: { [name: string]: number } = {};
      scans.forEach(s => {
        productFreq[s.productName] = (productFreq[s.productName] || 0) + 1;
      });
      const mostScannedProducts = Object.entries(productFreq)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate popular categories
      const categoryFreq: { [cat: string]: number } = {};
      scans.forEach(s => {
        const cat = s.category || "electronics";
        categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
      });
      const popularCategories = Object.entries(categoryFreq)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      const publicStats = getPublicStats();

      res.json({
        totalSearches: publicStats.totalSearches,
        trendingProducts: [
          { name: "iPhone 15 Pro", searches: 1200 },
          { name: "MacBook Air M3", searches: 850 },
          { name: "Sony WH-1000XM5", searches: 640 },
        ],
        activeUsers: 342,
        barcodeStats: {
          totalScans,
          mostScannedProducts,
          popularCategories,
          recentScans: scans.slice(0, 30),
          priceAlertCount: publicStats.priceAlertsTriggered
        }
      });
    } catch (e: any) {
      console.error("Admin stats compiling error:", e);
      res.json({
        totalSearches: 12450,
        trendingProducts: [
          { name: "iPhone 15 Pro", searches: 1200 },
          { name: "MacBook Air M3", searches: 850 },
          { name: "Sony WH-1000XM5", searches: 640 },
        ],
        activeUsers: 342,
        barcodeStats: {
          totalScans: 0,
          mostScannedProducts: [],
          popularCategories: [],
          recentScans: [],
          priceAlertCount: 1240
        }
      });
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

  // Telegram polling mechanism
  let lastUpdateId = 0;
  async function startTelegramPolling() {
    setInterval(async () => {
      try {
        const config = getTelegramConfig();
        if (!config.enabled || !config.botToken) return;

        const response = await axios.get(`https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${lastUpdateId + 1}&allowed_updates=["channel_post","message"]`);
        const updates = response.data.result;

        if (updates && updates.length > 0) {
          for (const update of updates) {
            lastUpdateId = update.update_id;
            const message = update.channel_post || update.message;
            if (!message) continue;
            
            const text = message.text || message.caption || "";
            if (!text) continue;

            console.log("Telegram polled update received:", text);
            try {
              const parsedDeal = await parseTelegramPost(text);
              const createdDeal = addDealDirectly(parsedDeal);

              const storePath = path.join(process.cwd(), "data_store.json");
              if (fs.existsSync(storePath)) {
                const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
                if (!raw.deals) raw.deals = [];
                raw.deals.unshift(createdDeal);
                fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), "utf-8");
              }
            } catch (e) {
              console.error("Error processing polled Telegram update:", e);
            }
          }
        }
      } catch (e: any) {
        if (e.response && e.response.status === 401) {
          // Unauthorized, wait silently
        } else {
          console.error("Telegram polling error:", e.message);
        }
      }
    }, 5000);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PriceVerse AI Server running at http://0.0.0.0:${PORT}`);
    startTelegramPolling();
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
});

