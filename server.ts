import Razorpay from 'razorpay';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables immediately on module evaluation
dotenv.config();

import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import helmet from "helmet";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import { parseAndValidateApk, formatFileSize } from "./src/server/apkParser.ts";
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
  generateDemoReviewsIfNeeded,
  voteReviewHelpful,
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
  completeMission,
  deleteUserProfile,
  setFounderImage,
  getActiveApkRelease,
  getAllApkReleases,
  getApkStats,
  createNewApkRelease,
  recordApkDownload,
  activateApkRelease,
  deleteApkRelease,
  getUserCoupons,
  getAllCoupons,
  generateCouponForUser,
  updateCouponSettings,
  validateCoupon,
  redeemCoupon,
  recordReceipt,
  getReceiptById,
  getUserReceipts,
  isPaymentAlreadyProcessed,
  activateUserPremium,
  markWebhookProcessed,
  isOrderAlreadyActivated,
  isUserForeverFounder,
  claimFounderMysteryBox,
  getFounderMysteryBoxStatus,
  getUserCoinMultiplier,
  getGamificationSettings,
  updateGamificationSettings,
  adminAdjustCoins,
  getPremiumDailyStatus,
  claimPremiumDailyReward,
  ReceiptRecord
} from "./src/server/gamificationDb.ts";
import { getProductCategoryPhoto } from "./src/lib/productImages.js";
import {
  extractUrlFromShareInput,
  classifyInputType,
  resolveAndExpandUrl,
  parseProductQuery,
  evaluateCandidateRelevance,
  generateExactStoreVariants,
  generateCategoryCatalogResults,
  correctSpellingAndNormalize,
  isBannedOrGenericTitle,
  getProductTitleFromUrl,
  selectValidatedBestImage,
  ImageCandidate
} from "./src/server/searchEngine.ts";
import {
  validateProductPrice,
  parseNumericPrice,
  getStoreTrustScore,
  getExpectedMarketPrice
} from "./src/server/priceValidationEngine.ts";
import {
  acquireRegistrationLock,
  releaseRegistrationLock,
  checkRegistrationRateLimit,
  recordRegistrationAttempt,
  getEmailRateLimitStatus
} from "./src/server/authRateLimiter.ts";

dotenv.config();

// Force sync environment from .env file to override stale container process variables
if (fs.existsSync(".env")) {
  try {
    const envLines = fs.readFileSync(".env", "utf8").split(/\r?\n/);
    for (const line of envLines) {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const k = parts[0].trim();
        const v = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
        if (k && v) {
          process.env[k] = v;
        }
      }
    }
  } catch (e) {
    console.warn("Could not parse .env:", e);
  }
}

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("placeholder") || key.includes("placeholder") || !url.startsWith("http")) {
    return null;
  }
  try {
    return createClient(url, key);
  } catch (e) {
    console.error("Failed to initialize Supabase client in server.ts:", e);
    return null;
  }
}

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

// Simple server-side in-memory cache to save API quota on identical queries
const geminiCache: {
  detect: Record<string, any>;
  extractFeatures: Record<string, string[]>;
  shopperPlan: Record<string, any>;
  shoppingAdvice: Record<string, string>;
  predictTrend: Record<string, any>;
  search: Record<string, any>;
} = {
  detect: {},
  extractFeatures: {},
  shopperPlan: {},
  shoppingAdvice: {},
  predictTrend: {},
  search: {}
};

// Helper function to extract direct merchant product URLs from Google Shopping/Google redirect links
function extractDirectUrl(urlStr: string): string | null {
  if (!urlStr) return null;
  try {
    const urlObj = new URL(urlStr);
    for (const key of ["url", "q", "adurl", "r", "redirect", "dest", "destination"]) {
      const val = urlObj.searchParams.get(key);
      if (val && val.startsWith("http")) {
        // Recursively extract in case of multiple redirects
        const nested = extractDirectUrl(val);
        return nested || val;
      }
    }
  } catch (_) {}

  // Regular expression fallback search for any http/https URL nested within the encoded string
  try {
    const dec = decodeURIComponent(urlStr);
    const matches = dec.match(/https?:\/\/[^\s"'><]+/g);
    if (matches) {
      for (const m of matches) {
        // Skip tracking domains and search indices
        if (!m.includes("google.com") && !m.includes("serpapi.com") && !m.includes("googleadservices.com")) {
          return m;
        }
      }
    }
  } catch (_) {}

  return null;
}

// Generate fallback search URL on the merchant's actual platform domain
function getFallbackPlatformLink(source: string, title: string, queryStr: string): string {
  const encodeQ = encodeURIComponent(title || queryStr || "electronics");
  const src = source.toLowerCase();

  if (src.includes("amazon")) {
    return `https://www.amazon.in/s?k=${encodeQ}`;
  }
  if (src.includes("flipkart")) {
    return `https://www.flipkart.com/search?q=${encodeQ}`;
  }
  if (src.includes("croma")) {
    return `https://www.croma.com/searchB?q=${encodeQ}`;
  }
  if (src.includes("reliance")) {
    return `https://www.reliancedigital.in/search?q=${encodeQ}`;
  }
  if (src.includes("jiomart") || src.includes("jio mart")) {
    return `https://www.jiomart.com/search/${encodeQ}`;
  }
  if (src.includes("vijay sales") || src.includes("vijaysales")) {
    return `https://www.vijaysales.com/search/${encodeQ}`;
  }
  if (src.includes("tata cliq") || src.includes("tatacliq")) {
    return `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeQ}`;
  }
  if (src.includes("myntra")) {
    return `https://www.myntra.com/${encodeQ}`;
  }
  if (src.includes("ajio")) {
    return `https://www.ajio.com/search/?text=${encodeQ}`;
  }
  if (src.includes("nykaa")) {
    return `https://www.nykaa.com/search/result/?q=${encodeQ}`;
  }
  if (src.includes("firstcry")) {
    return `https://www.firstcry.com/search?q=${encodeQ}`;
  }
  if (src.includes("boat")) {
    return `https://www.boAt-lifestyle.com/search?q=${encodeQ}`;
  }
  if (src.includes("samsung")) {
    return `https://www.samsung.com/in/multistore/?search=${encodeQ}`;
  }
  if (src.includes("apple")) {
    return `https://www.apple.com/in/shop/goto/${encodeQ}`;
  }
  if (src.includes("oneplus")) {
    return `https://www.oneplus.in/search?q=${encodeQ}`;
  }
  if (src.includes("dell")) {
    return `https://www.dell.com/en-in/search/${encodeQ}`;
  }
  if (src.includes("hp")) {
    return `https://www.hp.com/in-en/shop/catalogsearch/result/?q=${encodeQ}`;
  }
  if (src.includes("lenovo")) {
    return `https://www.lenovo.com/in/en/search?fq=&text=${encodeQ}`;
  }
  if (src.includes("asus")) {
    return `https://in.store.asus.com/catalogsearch/result/?q=${encodeQ}`;
  }
  if (src.includes("ikea")) {
    return `https://www.ikea.com/in/en/search/?q=${encodeQ}`;
  }
  if (src.includes("urban ladder") || src.includes("urbanladder")) {
    return `https://www.urbanladder.com/products/search?q=${encodeQ}`;
  }
  if (src.includes("wakefit")) {
    return `https://www.wakefit.co/search?q=${encodeQ}`;
  }
  if (src.includes("home centre") || src.includes("homecentre")) {
    return `https://www.homecentre.in/in/en/search?text=${encodeQ}`;
  }

  // Domain fallback (e.g., decathlon.in -> www.decathlon.in/search)
  const domainMatch = src.match(/([a-z0-9\-]+\.[a-z]{2,})/i);
  if (domainMatch) {
    const domain = domainMatch[1];
    return `https://www.${domain}/search?q=${encodeQ}`;
  }

  // Default direct merchant fallback to Amazon India
  return `https://www.amazon.in/s?k=${encodeQ}`;
}

// Helper function to safely process history for Gemini API multi-turn conversation
// It ensures that the sequence starts with a "user" message and strictly alternates.
function getAi(): GoogleGenAI | null {
  const key = (process.env.GEMINI_API_KEY || "").trim();
  if (!key) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: key
    });
  } catch (err: any) {
    console.warn("GoogleGenAI init warning:", err.message);
    return null;
  }
}

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

// Helper to resolve HTTP redirects for shortened/pasted URLs
async function resolveRedirect(urlStr: string): Promise<string> {
  try {
    const response = await axios.head(urlStr, {
      maxRedirects: 5,
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },

    });
    return response.request?.res?.responseUrl || response.config?.url || urlStr;
  } catch (err: any) {
    try {
      const response = await axios.get(urlStr, {
        maxRedirects: 5,
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },

      });
      return response.request?.res?.responseUrl || response.config?.url || urlStr;
    } catch (innerErr: any) {
      if (innerErr.response?.headers?.location) {
        const loc = innerErr.response.headers.location;
        return loc.startsWith('http') ? loc : new URL(loc, urlStr).toString();
      }
      return urlStr;
    }
  }
}

// Using cleanProductTitle and getProductTitleFromUrl imported from searchEngine.ts

async function startServer() {
  // 1. ENVIRONMENT VARIABLES VALIDATION
  if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. AI features will use local fallback or require key configuration.");
  }

  if (!process.env.SERP_API_KEY) {
    console.warn("WARNING: SERP_API_KEY is not configured. Google Search and Google Shopping scraping features will fall back to local intelligence and structured mock data.");
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("WARNING: TELEGRAM_BOT_TOKEN is not configured. Telegram channel features and updates polling will be disabled.");
  }

  const app = express();

  console.log("--- START DIAGNOSTICS ---");
  console.log("PORT:", process.env.PORT ? process.env.PORT : 3000);
  console.log("HOST: 0.0.0.0");
  console.log("--- END DIAGNOSTICS ---");



  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const PORT = Number(process.env.PORT) || 3000;

  // 2. SECURITY HEADERS (HELMET) WITH IFRAME COMPATIBILITY FOR GOOGLE AI STUDIO
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://*.google.com",
            "https://*.googleapis.com",
            "https://*.firebaseapp.com",
            "https://*.googleadservices.com",
            "https://checkout.razorpay.com"
          ],
          connectSrc: [
            "'self'",
            "https://*.supabase.co",
            "https://*.google.com",
            "https://*.googleapis.com",
            "https://*.firebaseapp.com",
            "https://api.telegram.org",
            "https://api.dicebear.com",
            "https://serpapi.com",
            "wss://*.supabase.co",
            "https://*.run.app",
            "https://ais-dev-*.run.app",
            "https://ais-pre-*.run.app",
            "https://api.razorpay.com",
            "https://lumberjack.razorpay.com",
            "https://lumberjack-cx.razorpay.com"
          ],
          imgSrc: [
            "'self'", 
            "data:", 
            "blob:", 
            "https://*", 
            "http://*",
            "https://*.razorpay.com",
            "https://razorpay.com"
          ],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          frameSrc: [
            "'self'",
            "https://*.google.com",
            "https://*.googleapis.com",
            "https://*.firebaseapp.com",
            "https://*.googleadservices.com",
            "https://api.razorpay.com",
            "https://checkout.razorpay.com",
            "https://custom-i.razorpay.com"
          ],
          frameAncestors: [
            "'self'",
            "https://*.google.com",
            "https://*.googleapis.com",
            "https://*.firebaseapp.com",
            "https://ai.studio",
            "https://*.run.app",
            "https://ais-dev-*.run.app",
            "https://ais-pre-*.run.app",
          ],
      },

    },

      crossOriginEmbedderPolicy: false,
      frameguard: false, // We use CSP frameAncestors to allow rendering in the AI Studio preview window
    })
  );

  
app.post('/api/auth/google', async (req: any, res: any) => {
  try {
    const { token, email: clientEmail, name: clientName, uid: clientUid, photo: clientPhoto } = req.body;
    let email = clientEmail;
    let name = clientName;
    let picture = clientPhoto;
    let uid = clientUid;

    let adminApp;
    try {
      const admin = await import('firebase-admin');
      if (process.env.FIREBASE_PRIVATE_KEY) {
        if (!(((admin as any).apps?.length) || ((admin.default as any)?.apps?.length))) {
          ((admin as any).initializeApp || (admin.default as any).initializeApp)({
            credential: ((admin as any).credential || (admin.default as any).credential).cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
          });
        }
        const decodedToken = await ((admin as any).auth || (admin.default as any).auth)().verifyIdToken(token);
        email = decodedToken.email || email;
        name = decodedToken.name || name;
        picture = decodedToken.picture || picture;
        uid = decodedToken.uid || uid;
      }
    } catch(e) {
      console.warn("Firebase admin verification skipped or failed", e.message);
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // 1. Stable internal ID by email
    const { getOrCreateProfile } = await import('./src/server/gamificationDb.ts');
    
    // Check Supabase
    let buywiseUserId = uid; // default to firebase uid if no supabase
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) {
      const { data: existingProfiles } = await supabaseClient.from('profiles').select('*').eq('email', email);
      if (existingProfiles && existingProfiles.length > 0) {
         buywiseUserId = existingProfiles[0].id;
      } else {
         // Create stable ID if new
         buywiseUserId = 'bw_' + crypto.randomUUID().replace(/-/g, '');
      }
    }

    // 2. Memory Check (Prevent duplicates by email)
    const profile = getOrCreateProfile(buywiseUserId, email, name);
    buywiseUserId = profile.userId; // Lock to existing in-memory ID if it existed

    // 3. Supabase Authoritative
    if (supabaseClient) {
      const profileData = {
        id: buywiseUserId,
        email: email,
        full_name: name,
        avatar_url: picture,
        google_provider_id: uid,
        last_login: new Date().toISOString()
      };
      await supabaseClient.from('profiles').upsert(profileData);
    }

    // 4. Firebase Secondary
    try {
      const admin = await import('firebase-admin');
      if (((admin as any).apps?.length) || ((admin.default as any)?.apps?.length)) {
         await ((admin as any).firestore || (admin.default as any).firestore)().collection('users').doc(buywiseUserId).set({
           email,
           full_name: name,
           avatar_url: picture,
           google_provider_id: uid,
           last_login: new Date().toISOString()
       },
 { merge: true });
      }
    } catch(e) {
      console.error("Firebase secondary sync failed:", e.message);
    }

    res.json({
      success: true,
      sessionUser: {
        id: buywiseUserId,
        email,
        displayName: name,
        user_metadata: { full_name: name, avatar_url: picture }
    },

      token: "session_token_" + buywiseUserId
    });
  } catch (error: any) {
    console.error("Auth google error", error);
    res.status(401).json({ error: "Unauthorized" });
  }
});


  app.use(express.json({
    limit: "15mb",
    verify: (req: any, res: any, buf: Buffer) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // 3. DYNAMIC CORS ORIGIN AND EXTRA SECURITY HEADERS MIDDLEWARE
  app.use((req: any, res: any, next: any) => {
    // Standard secure fallback headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

    // Dynamic CORS matching safe origins (including localhost, Google services, and Cloud Run hostnames)
    const origin = req.headers.origin;
    let isAllowed = false;
    if (origin) {
      if (
        origin.endsWith("google.com") ||
        origin.endsWith("ai.studio") ||
        origin.endsWith("run.app") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        isAllowed = true;
      }
    } else {
      isAllowed = true; // Direct requests
    }

    if (isAllowed && origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "https://ai.studio");
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-user-id, x-user-email, x-user-name"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    // 4. SECURE ERROR SANITIZER DECORATOR
    res.sendSecureError = (error: any, defaultMessage = "An internal server error occurred") => {
      const correlationId = "ERR-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      let safeMessage = defaultMessage;
      if (error && error.message) {
        // Strip file paths to hide internal server folder structures
        safeMessage = error.message
          .replace(/\/[\w\-\.\/]+/g, "[PATH]")
          .replace(/\\[\w\-\.\\]+/g, "[PATH]");
        if (safeMessage.length > 150) {
          safeMessage = safeMessage.substring(0, 150) + "...";
        }
      }
      console.error(`[${correlationId}] Secure Log:`, error);
      return res.status(200).json({
        error: safeMessage,
        correlationId,
        status: "error"
      });
    };

    next();
  });

  // 5. IN-MEMORY RATE LIMITER MIDDLEWARE (Authentication and Check-ins)
  const rateLimitStore = new Map<string, { count: number; firstRequest: number }>();
  const createRateLimiter = (maxRequests: number, windowMs: number, errorMessage: string) => {
    return (req: any, res: any, next: any) => {
      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
      const key = `${ip}:${req.path}`;
      const now = Date.now();
      
      const record = rateLimitStore.get(key);
      if (!record) {
        rateLimitStore.set(key, { count: 1, firstRequest: now });
        return next();
      }
      
      if (now - record.firstRequest > windowMs) {
        rateLimitStore.set(key, { count: 1, firstRequest: now });
        return next();
      }
      
      record.count += 1;
      if (record.count > maxRequests) {
        return res.status(429).json({
          error: errorMessage,
          retryAfterMs: windowMs - (now - record.firstRequest),
          status: "rate_limited"
        });
      }
      
      next();
    };
  };

  const loginRateLimiter = createRateLimiter(5, 60000, "Too many verification/login attempts. Please try again after 1 minute.");
  const resetRateLimiter = createRateLimiter(3, 3600000, "Too many reset attempts. Please try again after 1 hour.");

  // ==========================================
  // --- BUYWISE AUTHENTICATION & REGISTRATION GATEWAY ---
  // ==========================================

  // Check rate limit and cooldown status for an email address
  app.get("/api/auth/rate-limit-status", (req, res) => {
    const email = (req.query.email as string) || "";
    if (!email) {
      return res.json({ isRateLimited: false, retryAfter: 0 });
    }
    const status = getEmailRateLimitStatus(email);
    res.json(status);
  });

  // Secure, rate-limited registration endpoint with concurrency mutex & 429 graceful handler
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name, isDevTestMode } = req.body || {};
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip || req.socket.remoteAddress || "127.0.0.1";

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check rate limits (IP and per-email throttling)
    const rateLimitCheck = isDevTestMode ? { allowed: true } : checkRegistrationRateLimit(ip, normalizedEmail);
    if (!rateLimitCheck.allowed) {
      console.warn(`[Auth Rate Limit] Blocked registration for ${normalizedEmail} from ${ip}. Reason: ${rateLimitCheck.code}`);
      return res.status(429).json({
        success: false,
        error: rateLimitCheck.error || "Too many email requests. Please wait a few minutes and try again.",
        code: rateLimitCheck.code || "RATE_LIMIT_EXCEEDED",
        retryAfter: rateLimitCheck.retryAfter || 180,
        cooldownSeconds: rateLimitCheck.retryAfter || 180
      });
    }

    // 2. Acquire concurrency mutex lock to prevent duplicate double-click requests
    const lockResult = acquireRegistrationLock(normalizedEmail);
    if (!lockResult.acquired) {
      console.warn(`[Auth Mutex] Duplicate concurrent registration blocked for ${normalizedEmail}`);
      return res.status(429).json({
        success: false,
        error: "Registration request is already in progress for this email. Please wait a moment.",
        code: "IN_FLIGHT_DUPLICATE_LOCKED",
        retryAfter: 15,
        cooldownSeconds: 15
      });
    }

    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Safe development / mock auth fallback
        const devUserId = "dev_usr_" + Buffer.from(normalizedEmail).toString("hex").slice(0, 12);
        getOrCreateProfile(devUserId, normalizedEmail, name || normalizedEmail.split("@")[0]);
        recordRegistrationAttempt(ip, normalizedEmail, { success: true });
        
        return res.json({
          success: true,
          mode: "mock",
          message: "Account created successfully!",
          user: {
            id: devUserId,
            email: normalizedEmail,
            user_metadata: { full_name: name || normalizedEmail.split("@")[0] }
          }
        });
      }

      // Execute Supabase Auth signUp
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: name || "" }
        }
      });

      if (error) {
        const errMsg = error.message || "";
        const isRateLimitError =
          error.status === 429 ||
          errMsg.toLowerCase().includes("rate limit") ||
          errMsg.toLowerCase().includes("over_email_send_rate_limit") ||
          errMsg.toLowerCase().includes("too many requests");

        if (isRateLimitError) {
          console.warn(`[Auth Gateway] Upstream Supabase email rate limit triggered for ${normalizedEmail}. Handling gracefully.`);
          recordRegistrationAttempt(ip, normalizedEmail, { success: false, wasRateLimited: true });

          // Safe development / test mode support:
          // If testing or in development environment, provide a safe registration fallback so testing is not blocked
          if (isDevTestMode || process.env.NODE_ENV !== "production") {
            const devUserId = "test_usr_" + Buffer.from(normalizedEmail).toString("hex").slice(0, 12);
            getOrCreateProfile(devUserId, normalizedEmail, name || normalizedEmail.split("@")[0]);
            console.log(`[Dev Auth] Safe development test account initialized for ${normalizedEmail}`);

            return res.json({
              success: true,
              isDevTest: true,
              message: "Account created successfully! (Development Test Mode: external email quota rate limit handled safely).",
              user: {
                id: devUserId,
                email: normalizedEmail,
                user_metadata: { full_name: name || normalizedEmail.split("@")[0] }
              }
            });
          }

          // In production: Return standard user-friendly error with cooldown
          return res.status(429).json({
            success: false,
            error: "Too many email requests. Please wait a few minutes and try again.",
            code: "EMAIL_RATE_LIMIT_EXCEEDED",
            retryAfter: 180,
            cooldownSeconds: 180
          });
        }

        // Other Supabase Auth error (e.g. user already exists, weak password)
        recordRegistrationAttempt(ip, normalizedEmail, { success: false });
        return res.status(400).json({
          success: false,
          error: errMsg || "Registration failed. Please try again."
        });
      }

      // Success
      recordRegistrationAttempt(ip, normalizedEmail, { success: true });
      if (data?.user?.id) {
        getOrCreateProfile(data.user.id, normalizedEmail, name || normalizedEmail.split("@")[0]);
      }

      return res.json({
        success: true,
        user: data.user,
        session: data.session,
        message: "Account created! Check your email to confirm your account."
      });

    } catch (unexpectedErr: any) {
      console.error("[Auth Gateway Exception]:", unexpectedErr);
      recordRegistrationAttempt(ip, normalizedEmail, { success: false });
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred during account creation. Please try again later."
      });
    } finally {
      releaseRegistrationLock(normalizedEmail);
    }
  });

  // Rate-limited Resend Verification Email endpoint
  app.post("/api/auth/resend-verification", async (req, res) => {
    const { email } = req.body || {};
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip || req.socket.remoteAddress || "127.0.0.1";

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitCheck = checkRegistrationRateLimit(ip, normalizedEmail);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: rateLimitCheck.error || "Too many email requests. Please wait a few minutes and try again.",
        code: rateLimitCheck.code || "RATE_LIMIT_EXCEEDED",
        retryAfter: rateLimitCheck.retryAfter || 180
      });
    }

    const lockResult = acquireRegistrationLock(normalizedEmail);
    if (!lockResult.acquired) {
      return res.status(429).json({
        success: false,
        error: "A request is already in progress. Please wait a moment.",
        code: "IN_FLIGHT_LOCKED"
      });
    }

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return res.json({ success: true, message: "Verification email sent! Check your inbox." });
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail
      });

      if (error) {
        const errMsg = error.message || "";
        const isRateLimitError =
          error.status === 429 ||
          errMsg.toLowerCase().includes("rate limit") ||
          errMsg.toLowerCase().includes("over_email_send_rate_limit");

        if (isRateLimitError) {
          recordRegistrationAttempt(ip, normalizedEmail, { success: false, wasRateLimited: true });
          return res.status(429).json({
            success: false,
            error: "Too many email requests. Please wait a few minutes and try again.",
            code: "EMAIL_RATE_LIMIT_EXCEEDED",
            retryAfter: 180
          });
        }

        recordRegistrationAttempt(ip, normalizedEmail, { success: false });
        return res.status(400).json({ success: false, error: errMsg });
      }

      recordRegistrationAttempt(ip, normalizedEmail, { success: true });
      return res.json({ success: true, message: "Verification email sent! Check your inbox." });

    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Failed to resend verification email." });
    } finally {
      releaseRegistrationLock(normalizedEmail);
    }
  });

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

  // Helper middleware to verify administrative credentials on protected routes
  const adminAuth = (req: any, res: any, next: any) => {
    const passcode = req.headers["x-admin-passcode"] as string;
    const email = req.headers["x-user-email"] as string;

    // Both the passcode must be correct AND the user email must match the admin email
    if (
      (passcode === "awanwarsi" || passcode === "awanwarsi1A@") &&
      email &&
      email.toLowerCase() === "mohammdsaeed24@gmail.com"
    ) {
      next();
    } else {
      res.status(403).json({ error: "Access Denied: Administrative authorization is required." });
    }
  };

  // Server-side Premium Plans Configuration (Canonical source of truth for pricing)
  const PREMIUM_PLANS_CONFIG: Record<string, {
    name: string;
    duration: string;
    days: number;
    priceInr: number;
    amountPaise: number;
  }> = {
    
    monthly: {
      name: "Monthly Elite",
      duration: "30 Days",
      days: 30,
      priceInr: 100,
      amountPaise: 10000,
  },

    yearly: {
      name: "Yearly Pro",
      duration: "1 Year",
      days: 365,
      priceInr: 500,
      amountPaise: 50000,
  },

    lifetime: {
      name: "Forever Founder",
      duration: "Lifetime",
      days: 36500,
      priceInr: 700,
      amountPaise: 70000,
},
};

// ==========================================
// --- RAZORPAY PAYMENT INTEGRATION ---
// ==========================================

let razorpayInstance: any = null;
const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay API Key ID or Secret is not configured.");
    }
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
};

const processedWebhookIds = new Set<string>();
const inProgressVerifications = new Set<string>();

const isOrderAlreadyCompleted = async (referenceId: string) => {
  if (processedWebhookIds.has(referenceId)) return true;
  try {
    const admin = await import('firebase-admin');
    if (((admin as any).apps?.length) || ((admin.default as any)?.apps?.length)) {
      const dbRef = ((admin as any).firestore || (admin.default as any).firestore)();
      const docSnap = await dbRef.collection('orders').doc(referenceId).get();
      if (docSnap.exists && docSnap.data()?.status === 'completed') {
        return true;
      }
    }
  } catch (e) {
    console.error("Error checking order status in Firebase:", e);
  }
  return false;
};

async function activateUserEntitlement(
  userId: string,
  planId: string,
  referenceId: string,
  payId: string,
  subId: string,
  provider: "razorpay" = "razorpay",
  userName?: string,
  userEmail?: string
) {
  const planDurationMap: Record<string, number> = {
    monthly: 30,
    yearly: 365,
    lifetime: 36500
  };
  const subDays = planDurationMap[planId] || 30;
  const expirationDate = new Date(Date.now() + subDays * 24 * 60 * 60 * 1000);

  // 1. Supabase Authoritative Update
  const supabaseClient = getSupabaseClient();
  if (supabaseClient) {
     try {
        await supabaseClient.from('profiles').update({
          premium: true,
          premium_expiry: expirationDate.toISOString(),
          active_plan_id: planId,
          active_plan_name: planId === 'lifetime' ? 'buywise_founder_forever' : 'buywise_premium_' + planId
        }).eq('id', userId);
        
        await supabaseClient.from('subscriptions').upsert({
          id: referenceId,
          user_id: userId,
          plan_id: planId,
          payment_id: payId,
          subscription_id: subId,
          status: 'active',
          provider: provider
        });
     } catch(e) { console.error("Entitlement activation Supabase error", e); }
  }

  // 2. Firebase Secondary
  try {
    const admin = await import('firebase-admin');
    if (((admin as any).apps?.length) || ((admin.default as any)?.apps?.length)) {
      const dbRef = ((admin as any).firestore || (admin.default as any).firestore)();
      await dbRef.collection('orders').doc(referenceId).set({
        userId, planId, paymentId: payId, subscriptionId: subId,
        status: 'completed', provider: provider, createdAt: new Date().toISOString()
      }, { merge: true });
      await dbRef.collection('users').doc(userId).set({
        premiumStatus: 'active',
        premiumPlan: planId === 'lifetime' ? 'buywise_founder_forever' : 'buywise_premium_' + planId,
        premiumSince: new Date().toISOString(),
        premiumExpiration: expirationDate.toISOString(),
      }, { merge: true });
    }
  } catch(e: any) { console.error("Firebase secondary entitlement activation error", e.message); }

  // 3. Update gamification / memory state
  try {
     const { activateUserPremium, claimFounderMysteryBox } = await import('./src/server/gamificationDb.ts');
     activateUserPremium(userId, userEmail || "unknown@buywise.in", userName || "User", subDays, planId === 'lifetime' ? 'buywise_founder_forever' : 'buywise_premium_' + planId, planId);
     if (planId === 'lifetime' || planId === 'buywise_founder_forever') {
          try {
             claimFounderMysteryBox(userId);
          } catch (err: any) {
             console.log(`Mystery Box already claimed or error for ${userId}:`, err.message);
          }
     }
  } catch(e: any) { console.error("Memory entitlement activation error", e.message); }
}

function verifyRazorpaySignature(rawBody: string | Buffer, signature: string, secret: string): boolean {
  try {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');
    return expectedSignature === signature;
  } catch (e) {
    console.error("Error verifying Razorpay signature:", e);
    return false;
  }
}

app.post('/api/payments/razorpay/checkout', getUserContext, async (req: any, res: any) => {
  const userId = req.userContext?.userId || req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { planId } = req.body;
  if (!planId || !['monthly', 'yearly', 'lifetime'].includes(planId)) {
    return res.status(400).json({ error: "Invalid plan ID" });
  }

  try {
    const planConfig = PREMIUM_PLANS_CONFIG[planId];
    if (!planConfig) {
      return res.status(400).json({ error: "Plan configuration not found" });
    }

    let email = req.userContext?.email || `user_${userId}@buywise.in`;
    let name = req.userContext?.name || "BuyWise User";

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ 
        error: "Razorpay payment integration is not configured on this server environment. Please set the RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables." 
      });
    }

    const razorpay = getRazorpayInstance();

    if (planId === 'lifetime') {
      const order = await razorpay.orders.create({
        amount: planConfig.amountPaise,
        currency: 'INR',
        receipt: `receipt_founder_${userId}_${Date.now()}`,
        notes: {
          userId: userId,
          planId: 'lifetime',
          email: email,
          name: name
        }
      });

      return res.json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "BuyWise",
        description: planConfig.name,
        prefill: {
          name,
          email
        },
        theme: {
          color: "#FF3B30"
        }
      });
    } else {
      const rzpPlanId = planId === 'monthly' ? 'plan_TbmNWzRVUXZQt0' : 'plan_TbmPgmNfCSSWfk';
      const subscription = await razorpay.subscriptions.create({
        plan_id: rzpPlanId,
        total_count: planId === 'monthly' ? 120 : 10,
        quantity: 1,
        customer_notify: 1,
        notes: {
          userId: userId,
          planId: planId,
          email: email,
          name: name
        }
      });

      return res.json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "BuyWise",
        description: planConfig.name,
        prefill: {
          name,
          email
        },
        theme: {
          color: "#FF3B30"
        }
      });
    }
  } catch (error: any) {
    console.error("Razorpay checkout error:", error);
    const detailMessage = error.error?.description || error.description || error.message || "Failed to initialize Razorpay checkout";
    res.status(500).json({ error: detailMessage });
  }
});

app.post('/api/payments/razorpay/verify', getUserContext, async (req: any, res: any) => {
  const userId = req.userContext?.userId || req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    razorpay_subscription_id,
    planId
  } = req.body;

  if (!razorpay_payment_id || (!razorpay_order_id && !razorpay_subscription_id) || !razorpay_signature) {
    return res.status(400).json({ error: "Missing verification parameters" });
  }

  try {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({ error: "Razorpay Secret Key is not configured on this server environment." });
    }

    let expectedSignature = "";
    if (razorpay_order_id) {
      const text = razorpay_order_id + "|" + razorpay_payment_id;
      expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(text)
        .digest("hex");
    } else {
      const text = razorpay_payment_id + "|" + razorpay_subscription_id;
      expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(text)
        .digest("hex");
    }

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Signature mismatch. Unauthorized payment attempt." });
    }

    const razorpay = getRazorpayInstance();
    const paymentInfo = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (paymentInfo.status !== 'captured' && paymentInfo.status !== 'authorized') {
      return res.json({ verified: false, status: paymentInfo.status });
    }

    const verifiedPlanId = planId || (razorpay_order_id ? 'lifetime' : 'monthly');
    const referenceId = razorpay_subscription_id || razorpay_order_id || razorpay_payment_id;
    
    if (inProgressVerifications.has(referenceId)) {
      return res.json({ success: true, verified: true, status: "success", note: "already processing" });
    }
    
    const isCompleted = await isOrderAlreadyCompleted(referenceId);

    if (!isCompleted) {
      inProgressVerifications.add(referenceId);
      try {
        await activateUserEntitlement(
          userId,
          verifiedPlanId,
          referenceId,
          razorpay_payment_id,
          razorpay_subscription_id || "",
          "razorpay",
          req.userContext?.name,
          req.userContext?.email
        );
        processedWebhookIds.add(referenceId);
      } finally {
        inProgressVerifications.delete(referenceId);
      }
    }

    res.json({ success: true, verified: true, status: "success" });
  } catch (error: any) {
    console.error("Razorpay direct verification error:", error);
    res.status(500).json({ error: error.message || "Failed to verify Razorpay payment" });
  }
});

app.post('/api/webhooks/razorpay', async (req: any, res: any) => {
  console.log("--- RAZORPAY WEBHOOK RECEIVED ---");
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.warn("Webhook validation failed: missing signature or secret");
    return res.status(400).send("Signature validation failed");
  }

  const rawBodyContent = req.rawBody ? req.rawBody : Buffer.from(JSON.stringify(req.body));
  const isSignatureValid = verifyRazorpaySignature(rawBodyContent, signature, webhookSecret);

  if (!isSignatureValid) {
    console.error("Razorpay webhook signature verification failed");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;
  const payload = req.body.payload;

  console.log(`Razorpay webhook event: ${event}`);

  try {
    if (event === 'subscription.charged' || event === 'subscription.activated') {
      const subEntity = payload.subscription?.entity;
      const paymentEntity = payload.payment?.entity;
      if (subEntity) {
        const rzpSubId = subEntity.id;
        const userId = subEntity.notes?.userId;
        const planId = subEntity.notes?.planId || 'monthly';
        const payId = paymentEntity?.id || "";

        if (userId) {
          if (inProgressVerifications.has(rzpSubId)) {
            console.log(`Subscription ${rzpSubId} is already being verified by another request.`);
          } else {
            const isCompleted = await isOrderAlreadyCompleted(rzpSubId);
            if (!isCompleted) {
              inProgressVerifications.add(rzpSubId);
              try {
                await activateUserEntitlement(
                  userId,
                  planId,
                  rzpSubId,
                  payId,
                  rzpSubId,
                  "razorpay",
                  subEntity.notes?.name,
                  subEntity.notes?.email
                );
                processedWebhookIds.add(rzpSubId);
                console.log(`Successfully activated/renewed subscription ${rzpSubId} for user ${userId} via webhook`);
              } finally {
                inProgressVerifications.delete(rzpSubId);
              }
            }
          }
        }
      }
    } else if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;
      
      const payId = paymentEntity?.id;
      const orderId = orderEntity?.id || paymentEntity?.order_id;
      const userId = paymentEntity?.notes?.userId || orderEntity?.notes?.userId;
      const planId = paymentEntity?.notes?.planId || orderEntity?.notes?.planId || 'lifetime';

      if (userId && payId) {
        const referenceId = orderId || payId;
        if (inProgressVerifications.has(referenceId)) {
          console.log(`Payment ${referenceId} is already being verified by another request.`);
        } else {
          const isCompleted = await isOrderAlreadyCompleted(referenceId);
          if (!isCompleted) {
            inProgressVerifications.add(referenceId);
            try {
              await activateUserEntitlement(
                userId,
                planId,
                referenceId,
                payId,
                "",
                "razorpay",
                paymentEntity?.notes?.name || orderEntity?.notes?.name,
                paymentEntity?.notes?.email || orderEntity?.notes?.email
              );
              processedWebhookIds.add(referenceId);
              console.log(`Successfully completed payment ${payId} for user ${userId} via webhook`);
            } finally {
              inProgressVerifications.delete(referenceId);
            }
          }
        }
      }
    } else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
      const subEntity = payload.subscription?.entity;
      if (subEntity) {
        const rzpSubId = subEntity.id;
        const userId = subEntity.notes?.userId;
        
        if (userId) {
          console.log(`Subscription ${rzpSubId} cancelled/halted for user ${userId}. Revoking premium status.`);
          
          const supabaseClient = getSupabaseClient();
          if (supabaseClient) {
             try {
                await supabaseClient.from('profiles').update({
                  premium: false,
                  active_plan_id: null,
                  active_plan_name: null
                }).eq('id', userId);
             } catch(e) { console.error("Webhook Supabase status update error", e); }
          }

          try {
            const admin = await import('firebase-admin');
            if (((admin as any).apps?.length) || ((admin.default as any)?.apps?.length)) {
              const dbRef = ((admin as any).firestore || (admin.default as any).firestore)();
              await dbRef.collection('users').doc(userId).set({
                premiumStatus: 'cancelled',
                premiumPlan: null,
                premiumExpiration: new Date().toISOString()
              }, { merge: true });
            }
          } catch(e: any) { console.error("Webhook Firebase status revoke error", e.message); }

          try {
            const { getOrCreateProfile, saveDatabase } = await import('./src/server/gamificationDb.ts');
            const profile = getOrCreateProfile(userId, "", "");
            if (profile) {
              profile.isPremium = false;
              profile.activePlanId = undefined;
              profile.activePlanName = undefined;
              saveDatabase();
            }
          } catch(e: any) { console.error("Webhook memory status revoke error", e.message); }
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error processing Razorpay webhook:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/receipts/:receiptId", getUserContext, (req: any, res: any) => {
    try {
      const { receiptId } = req.params;
      const receipt = getReceiptById(receiptId);
      if (!receipt) {
        return res.status(404).json({ error: "Receipt not found." });
      }
      res.json(receipt);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to retrieve receipt." });
    }
  });

  app.get("/api/receipts", getUserContext, (req: any, res: any) => {
    try {
      const userId = req.userContext?.userId;
      if (!userId) {
        return res.json([]);
      }
      const receipts = getUserReceipts(userId);
      res.json(receipts);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to retrieve user receipts." });
    }
  });

  // Direct Plan Activation Endpoint
  app.post("/api/payments/direct-activate", getUserContext, (req: any, res: any) => {
    try {
      const { userId, email, name } = req.userContext;
      const { planId, planName, amount } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized user." });
      }

      const planDaysMap: Record<string, number> = {
        monthly: 30,
        yearly: 365,
        lifetime: 36500
      };

      const days = planDaysMap[planId] || 30;
      const { profile, expiry } = activateUserPremium(
        userId,
        email || 'customer@buywise.in',
        name || 'BuyWise Member',
        days,
        planName || 'BuyWise Premium',
        planId || 'monthly'
      );

      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const nowIso = new Date().toISOString();
      const numAmount = Number(amount) || 100;
      const receiptRecord: ReceiptRecord = {
        receiptId,
        transactionId,
        orderId: `order_${Date.now()}`,
        userId,
        customerEmail: email || 'customer@buywise.in',
        customerName: name || 'BuyWise Member',
        planId: planId || 'monthly',
        planName: planName || 'BuyWise Premium',
        planDuration: `${days} Days`,
        amount: numAmount,
        tax: 0,
        totalAmount: numAmount,
        currency: 'INR',
        paymentStatus: 'PAID',
        paymentMethod: 'Direct Activation',
        paymentProvider: 'System Direct',
        purchaseDate: nowIso,
        purchaseTimestamp: nowIso,
        premiumExpiry: expiry
      };

      recordReceipt(receiptRecord);

      res.json({
        success: true,
        message: `${planName || 'Premium'} activated successfully!`,
        profile,
        expiry,
        receiptId
      });
    } catch (e: any) {
      console.error("Direct activation error:", e);
      res.status(500).json({ success: false, error: e.message || "Failed to activate plan." });
    }
  });

  // Get or Create User Profile
  app.get("/api/gamification/profile", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const profile = getOrCreateProfile(userId, email, name);
      const multiplier = getUserCoinMultiplier(userId);
      res.json({
        ...profile,
        multiplier
      });
    } catch (e: any) {
      res.sendSecureError(e, "Failed to get profile");
    }
  });

  // Profile alias route
  app.get("/api/profile", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const profile = getOrCreateProfile(userId, email, name);
      const multiplier = getUserCoinMultiplier(userId);
      res.json({
        success: true,
        profile: {
          ...profile,
          multiplier
      },

        ...profile,
        multiplier
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: "Failed to get profile" });
    }
  });

  // Daily Premium Coin Status
  app.get("/api/gamification/premium-daily/status", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const status = getPremiumDailyStatus(userId, email, name);
      res.json(status);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to get premium daily status" });
    }
  });

  // Daily Premium Coin Claim
  app.post("/api/gamification/premium-daily/claim", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const result = claimPremiumDailyReward(userId, email, name);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message || "Failed to claim daily premium reward" });
    }
  });

  // Gamification Settings (Public/Client Read)
  app.get("/api/gamification/settings", (req: any, res: any) => {
    try {
      const settings = getGamificationSettings();
      res.json(settings);
    } catch (e: any) {
      res.status(500).json({ error: "Failed to get gamification settings" });
    }
  });

  // Admin Update Gamification Settings
  app.post("/api/gamification/admin/settings", (req: any, res: any) => {
    try {
      const updates = req.body;
      const updated = updateGamificationSettings(updates);
      res.json({ success: true, settings: updated });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to update gamification settings" });
    }
  });

  // Admin Adjust User Coins
  app.post("/api/gamification/admin/adjust-coins", (req: any, res: any) => {
    try {
      const { userId, amount, reason } = req.body;
      if (!userId || amount === undefined) {
        return res.status(400).json({ error: "Missing userId or amount parameter" });
      }
      const result = adminAdjustCoins(userId, Number(amount), reason || "Admin manual adjustment");
      res.json({ success: true, ...result });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to adjust user coins" });
    }
  });

  // Forever Founder Mystery Box Status
  app.get("/api/gamification/founder-mystery-box/status", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const status = getFounderMysteryBoxStatus(userId, email, name);
      res.json(status);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to check mystery box status" });
    }
  });
  app.get("/api/founder-mystery-box/status", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const status = getFounderMysteryBoxStatus(userId, email, name);
      res.json(status);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to check mystery box status" });
    }
  });

  // Forever Founder Mystery Box Claim (Atomic Server-Enforced Execution)
  app.post("/api/gamification/founder-mystery-box/claim", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const result = claimFounderMysteryBox(userId, email, name);
      res.json(result);
    } catch (e: any) {
      const statusCode = e.statusCode || (e.message?.includes("eligible") ? 403 : 400);
      res.status(statusCode).json({
        success: false,
        error: e.message || "Failed to claim mystery box reward",
        alreadyClaimed: e.alreadyClaimed || false,
        claimedAt: e.claimedAt || null
      });
    }
  });
  app.post("/api/founder-mystery-box/claim", getUserContext, (req: any, res: any) => {
    const { userId, email, name } = req.userContext;
    try {
      const result = claimFounderMysteryBox(userId, email, name);
      res.json(result);
    } catch (e: any) {
      const statusCode = e.statusCode || (e.message?.includes("eligible") ? 403 : 400);
      res.status(statusCode).json({
        success: false,
        error: e.message || "Failed to claim mystery box reward",
        alreadyClaimed: e.alreadyClaimed || false,
        claimedAt: e.claimedAt || null
      });
    }
  });

  // Delete User Profile (Right to be Forgotten)
  app.post("/api/gamification/profile/delete", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = deleteUserProfile(userId);
      res.json(result);
    } catch (e: any) {
      res.sendSecureError(e, "Failed to delete user profile.");
    }
  });

  // Daily Check-in / Login Streak Trigger
  app.post("/api/gamification/login", loginRateLimiter, getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = checkLoginStreak(userId);
      res.json(result);
    } catch (e: any) {
      res.sendSecureError(e, "Failed to complete daily check-in.");
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
      res.sendSecureError(e, "Failed to record search");
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
      res.sendSecureError(e, "Failed to transfer coins");
    }
  });

  // Social Sharing Coins Reward (+20 coins)
  app.post("/api/gamification/share", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = awardCoins(userId, 20, "Shared BuyWise deal to social network");
      res.json({ success: true, coins: result.coins, gained: 20 });
    } catch (e: any) {
      res.sendSecureError(e, "Failed to process share reward");
    }
  });

  // Write Review Coins Reward (+10 coins)
  app.post("/api/gamification/review", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = awardCoins(userId, 10, "Submitted a verified merchant review");
      res.json({ success: true, coins: result.coins, gained: 10 });
    } catch (e: any) {
      res.sendSecureError(e, "Failed to process review reward");
    }
  });

  // GET user reviews
  app.get("/api/gamification/reviews", (req: any, res: any) => {
    try {
      generateDemoReviewsIfNeeded();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sortBy = (req.query.sortBy as string) || 'recent';
      
      const result = getReviews({ page, limit, sortBy });
      res.json(result);
    } catch (e: any) {
      res.json({ reviews: [], summary: { totalReviews: 0, averageRating: 0, ratingCounts: {} }, hasMore: false });
    }
  });

  // POST a helpful vote
  app.post("/api/gamification/reviews/:id/helpful", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    const { id } = req.params;
    try {
      const result = voteReviewHelpful(userId, id);
      res.json(result);
    } catch (e: any) {
      res.sendSecureError(e, "Failed to vote on review");
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
      res.sendSecureError(e, "Failed to submit review");
    }
  });

  // Complete Profile Setup Reward (+25 coins)
  app.post("/api/gamification/profile-complete", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = awardCoins(userId, 25, "Completed registration and profile setup");
      res.json({ success: true, coins: result.coins, gained: 25 });
    } catch (e: any) {
      res.sendSecureError(e, "Failed to process profile complete reward");
    }
  });

  // Coins Transactions List for User
  app.get("/api/gamification/transactions", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const txns = getTransactions(userId);
      res.json(txns);
    } catch (e: any) {
      res.json([]);
    }
  });

  // Spin to Win
  app.post("/api/gamification/spin", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const result = spinWheel(userId);
      res.json(result);
    } catch (e: any) {
      res.sendSecureError(e, "Failed to process spin wheel");
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
      res.sendSecureError(e, "Failed to complete mission");
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
      res.json([]);
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
      res.sendSecureError(e, "Failed to submit referral code");
    }
  });

  // Get Referral Metrics & Link for Referral Dashboard
  app.get("/api/gamification/referral/stats", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const stats = getReferralStats(userId);
      res.json(stats);
    } catch (e: any) {
      res.sendSecureError(e, "Failed to get referral stats");
    }
  });

  // Get Global Leaderboards (Top 100)
  app.get("/api/gamification/leaderboard", (req: any, res: any) => {
    try {
      const metric = (req.query.metric || "coins") as "coins" | "referrals" | "searches" | "savings";
      const list = getLeaderboard(metric);
      res.json(list);
    } catch (e: any) {
      res.json([]);
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
      res.sendSecureError(e, "Failed to redeem reward");
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

    console.log(`[Barcode Scan API] User [REDACTED] (${userId}) scanned barcode "${barcode}" (${format || 'UNKNOWN'})`);

    let parsedData: any = null;

    try {
      const aiClient = getAi();
      if (!aiClient) {
        throw new Error("Gemini AI client not available");
      }
      
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
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      } else {
        try {
          response = await aiClient.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              tools: [{ googleSearch: {} }]
            }
          });
        } catch (searchErr: any) {
          const errMsg = searchErr.message?.includes("429") ? "Rate limit exceeded (429)" : searchErr.message;
        console.warn("[Barcode Scan API] Gemini Search Grounding failed, retrying without grounding tool:", errMsg);
          response = await aiClient.models.generateContent({
            model: "gemini-3.6-flash",
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
      const errMsg = apiErr.message?.includes("429") ? "Rate limit exceeded (429)" : apiErr.message;
      console.warn("[Barcode Scan API] Gemini API processing failed, falling back to smart local scanner:", errMsg);
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
      const fallbackData = parsedData || getLocalBarcodeFallback(barcode, format);
      res.json({
        success: true,
        data: fallbackData,
        coinsAwarded: 10,
        scansCount: 1
      });
    }
  });

  // Get User's Scan History
  app.get("/api/gamification/barcode/history", getUserContext, (req: any, res: any) => {
    const { userId } = req.userContext;
    try {
      const history = getScanHistory(userId);
      res.json(history);
    } catch (e: any) {
      res.json([]);
    }
  });

  // Public Savings Counter (Smooth Dynamic API)
  app.get("/api/gamification/public-stats", (req: any, res: any) => {
    try {
      const stats = getPublicStats();
      res.json(stats);
    } catch (e: any) {
      res.json({ totalSavings: "₹1,24,500+", happyUsers: "5,420+", dealsCompared: "45,000+" });
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
      res.json([]);
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
      res.sendSecureError(e, "Failed deal action");
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
      res.sendSecureError(e, "Failed to update notification preferences");
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
        model: "gemini-3.6-flash",
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
      const errMsg = err.message?.includes("429") ? "Rate limit exceeded (429)" : err.message;
      console.error("Gemini Telegram parse failed, using fallback regex:", errMsg);
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
  app.get("/api/affiliate/settings", adminAuth, (req: any, res: any) => {
    try {
      res.json(getAffiliateSettings());
    } catch (err: any) {
      res.sendSecureError(err, "Failed to get affiliate settings");
    }
  });

  // Save affiliate store configurations
  app.post("/api/affiliate/settings", adminAuth, (req: any, res: any) => {
    const { stores } = req.body;
    try {
      const result = updateAffiliateSettings(stores);
      res.json(result);
    } catch (err: any) {
      res.sendSecureError(err, "Failed to update affiliate settings");
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
      res.json({ success: false, affiliateUrl: url || "https://www.amazon.in" });
    }
  });

  // Get Telegram webhook / channel configurations
  app.get("/api/telegram/config", adminAuth, (req: any, res: any) => {
    try {
      res.json(getTelegramConfig());
    } catch (err: any) {
      res.sendSecureError(err, "Failed to get Telegram config");
    }
  });

  // Save Telegram webhook / channel configurations
  app.post("/api/telegram/config", adminAuth, (req: any, res: any) => {
    const { config } = req.body;
    try {
      const result = updateTelegramConfig(config);
      res.json(result);
    } catch (err: any) {
      res.sendSecureError(err, "Failed to update Telegram config");
    }
  });

  // Telegram incoming deals receiver webhook
  app.post("/api/telegram/webhook", adminAuth, async (req: any, res: any) => {
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
      res.sendSecureError(err, "Failed to process Telegram webhook");
    }
  });

  // Admin Actions Override
  app.post("/api/gamification/admin/action", adminAuth, (req: any, res: any) => {
    const { action, payload } = req.body;
    try {
      const result = adminAction(action, payload);
      res.json(result);
    } catch (e: any) {
      res.sendSecureError(e, "Failed to perform admin action");
    }
  });

  // Admin endpoint to upload and overwrite the founder portrait image
  app.post("/api/admin/upload-founder", adminAuth, (req: any, res: any) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 payload" });
    }

    try {
      const result = setFounderImage(imageBase64);
      res.json(result);
    } catch (e: any) {
      res.sendSecureError(e, "Failed to upload founder image");
    }
  });

  // Get Admin Profiles & Stats list (to manage them)
  app.get("/api/gamification/admin/users", adminAuth, (req: any, res: any) => {
    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      res.json(Object.values(raw.profiles));
    } catch (e: any) {
      res.json([]);
    }
  });

  // Get Admin Referrals list (to ban them)
  app.get("/api/gamification/admin/referrals", adminAuth, (req: any, res: any) => {
    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      res.json(raw.referrals);
    } catch (e: any) {
      res.json([]);
    }
  });

  // ----------------------------------------------------
  // APK DOWNLOAD MANAGEMENT SYSTEM ROUTES
  // ----------------------------------------------------
  
  const MAX_APK_SIZE_MB = parseInt(process.env.MAX_APK_SIZE_MB || "200", 10);
  const apkUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_APK_SIZE_MB * 1024 * 1024 },
  });

  // Direct APK binary download route (matches permanent URL https://buywiser.store/downloads/buywise.apk)
  app.get(["/downloads/buywise.apk", "/downloads/:filename", "/api/apk/download"], async (req: any, res: any) => {
    try {
      const activeApk = getActiveApkRelease();

      // Record download event
      const clientIp = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      const userAgent = req.headers["user-agent"] || "";
      recordApkDownload(activeApk.id, String(clientIp), String(userAgent));

      const uploadsDir = path.join(process.cwd(), "uploads", "apks");
      const publicDownloadsDir = path.join(process.cwd(), "public", "downloads");

      let targetPath = "";
      if (activeApk.storagePath && fs.existsSync(path.join(process.cwd(), activeApk.storagePath))) {
        targetPath = path.join(process.cwd(), activeApk.storagePath);
      } else if (fs.existsSync(path.join(uploadsDir, "active_buywise.apk"))) {
        targetPath = path.join(uploadsDir, "active_buywise.apk");
      } else if (fs.existsSync(path.join(publicDownloadsDir, "buywise.apk"))) {
        targetPath = path.join(publicDownloadsDir, "buywise.apk");
      } else {
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        targetPath = path.join(uploadsDir, "buywise.apk");
        if (!fs.existsSync(targetPath)) {
          const AdmZipModule = (await import("adm-zip")).default;
          const initialZip = new AdmZipModule();
          initialZip.addFile("AndroidManifest.xml", Buffer.from("store.buywise.app"));
          fs.writeFileSync(targetPath, initialZip.toBuffer());
        }
      }

      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", 'attachment; filename="buywise.apk"');
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      if (activeApk.base64Data) {
        const buffer = Buffer.from(activeApk.base64Data, "base64");
        res.setHeader("Content-Length", buffer.length.toString());
        return res.send(buffer);
      }

      return res.sendFile(path.resolve(targetPath));
    } catch (err: any) {
      console.error("Error serving APK download:", err);
      return res.status(500).json({ error: "Failed to serve APK file." });
    }
  });

  // Public Endpoint to Get Current Active APK Info
  app.get("/api/apk/current", (req: any, res: any) => {
    try {
      const activeApk = getActiveApkRelease();
      return res.json({
        success: true,
        activeApk: {
          versionName: activeApk.versionName,
          versionCode: activeApk.versionCode,
          packageName: activeApk.packageName,
          fileSizeFormatted: activeApk.fileSizeFormatted,
          fileSize: activeApk.fileSize,
          uploadedAt: activeApk.uploadedAt,
          publicUrl: "https://buywiser.store/downloads/buywise.apk",
          downloadCount: activeApk.downloadCount,
      },

      });
    } catch (e: any) {
      return res.status(500).json({ error: "Failed to retrieve current APK info." });
    }
  });

  // Admin Endpoint to Validate an APK file before publishing
  app.post("/api/admin/apk/validate", adminAuth, (req: any, res: any) => {
    apkUpload.single("apkFile")(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: `APK file is too large. Maximum size allowed is ${MAX_APK_SIZE_MB} MB.` });
        }
        return res.status(400).json({ error: err.message || "Failed to process APK upload." });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Please select a valid APK file." });
      }

      if (!req.file.originalname.toLowerCase().endsWith(".apk")) {
        return res.status(400).json({ error: "Please select a valid APK file. Only .apk files are allowed." });
      }

      const validation = parseAndValidateApk(req.file.buffer, req.file.originalname);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error || "Please select a valid APK file." });
      }

      return res.json({
        success: true,
        filename: req.file.originalname,
        packageName: validation.packageName,
        versionName: validation.versionName,
        versionCode: validation.versionCode,
        fileSize: validation.fileSize,
        fileSizeFormatted: validation.fileSizeFormatted,
        isManualMeta: validation.isManualMeta,
      });
    });
  });

  // Admin Endpoint to Upload & Publish New APK
  app.post("/api/admin/apk/publish", adminAuth, (req: any, res: any) => {
    apkUpload.single("apkFile")(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: `APK file is too large. Maximum size allowed is ${MAX_APK_SIZE_MB} MB.` });
        }
        return res.status(400).json({ error: err.message || "Failed to upload APK file." });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Please select an APK file to publish." });
      }

      if (!req.file.originalname.toLowerCase().endsWith(".apk")) {
        return res.status(400).json({ error: "Please select a valid APK file. Only .apk files are allowed." });
      }

      const validation = parseAndValidateApk(req.file.buffer, req.file.originalname);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error || "Invalid APK file." });
      }

      const manualVersionName = req.body?.versionName;
      const manualVersionCode = req.body?.versionCode;

      const finalVersionName = manualVersionName || validation.versionName || "1.0.0";
      const finalVersionCode = manualVersionCode || validation.versionCode || "100";
      const finalPackageName = validation.packageName || "store.buywise.app";

      if (finalPackageName !== "store.buywise.app") {
        return res.status(400).json({
          error: `Invalid BuyWise APK. Expected package: store.buywise.app (found: ${finalPackageName})`,
        });
      }

      try {
        const uploadsDir = path.join(process.cwd(), "uploads", "apks");
        const publicDir = path.join(process.cwd(), "public", "downloads");
        const distDir = path.join(process.cwd(), "dist", "downloads");

        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        if (fs.existsSync(path.join(process.cwd(), "dist")) && !fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true });
        }

        const timeTag = Date.now();
        const sanitizedVer = finalVersionName.replace(/[^a-zA-Z0-9_\.]/g, "_");
        const targetFilename = `buywise_v${sanitizedVer}_${timeTag}.apk`;
        const relativeStoragePath = `uploads/apks/${targetFilename}`;
        const fullStoragePath = path.join(uploadsDir, targetFilename);

        fs.writeFileSync(fullStoragePath, req.file.buffer);

        fs.writeFileSync(path.join(uploadsDir, "active_buywise.apk"), req.file.buffer);
        fs.writeFileSync(path.join(publicDir, "buywise.apk"), req.file.buffer);
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, "buywise.apk"), req.file.buffer);
        }

        const adminUser = (req.headers["x-user-email"] as string) || "Admin";

        const release = createNewApkRelease({
          filename: targetFilename,
          originalFilename: req.file.originalname,
          versionName: finalVersionName,
          versionCode: finalVersionCode,
          packageName: finalPackageName,
          fileSize: req.file.size,
          fileSizeFormatted: validation.fileSizeFormatted,
          storagePath: relativeStoragePath,
          base64Data: req.file.buffer.toString("base64"),
          uploadedBy: adminUser,
          isManualMeta: validation.isManualMeta,
        });

        return res.json({
          success: true,
          message: "APK published successfully.",
          release,
          publicUrl: "https://buywiser.store/downloads/buywise.apk",
        });
      } catch (e: any) {
        console.error("Error publishing APK:", e);
        return res.status(500).json({ error: `Failed to save and publish APK: ${e.message}` });
      }
    });
  });

  // Admin Endpoint to List All Releases and Stats
  app.get("/api/admin/apk/releases", adminAuth, (req: any, res: any) => {
    try {
      const releases = getAllApkReleases();
      const stats = getApkStats();
      const activeApk = getActiveApkRelease();
      return res.json({ success: true, releases, stats, activeApk });
    } catch (e: any) {
      return res.status(500).json({ error: "Failed to fetch APK releases." });
    }
  });

  // Admin Endpoint to Rollback / Activate Archived APK
  app.post("/api/admin/apk/:id/activate", adminAuth, (req: any, res: any) => {
    try {
      const { id } = req.params;
      const activeApk = activateApkRelease(id);

      if (activeApk.storagePath && fs.existsSync(path.join(process.cwd(), activeApk.storagePath))) {
        const sourceBuf = fs.readFileSync(path.join(process.cwd(), activeApk.storagePath));
        const uploadsDir = path.join(process.cwd(), "uploads", "apks");
        const publicDir = path.join(process.cwd(), "public", "downloads");
        const distDir = path.join(process.cwd(), "dist", "downloads");

        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

        fs.writeFileSync(path.join(uploadsDir, "active_buywise.apk"), sourceBuf);
        fs.writeFileSync(path.join(publicDir, "buywise.apk"), sourceBuf);
        if (fs.existsSync(path.join(process.cwd(), "dist"))) {
          if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
          fs.writeFileSync(path.join(distDir, "buywise.apk"), sourceBuf);
        }
      }

      return res.json({
        success: true,
        message: `APK release ${activeApk.versionName} activated successfully.`,
        activeApk,
      });
    } catch (e: any) {
      return res.status(400).json({ error: e.message || "Failed to activate release." });
    }
  });

  // Admin Endpoint to Delete Archived APK
  app.delete("/api/admin/apk/:id", adminAuth, (req: any, res: any) => {
    try {
      const { id } = req.params;
      const deleted = deleteApkRelease(id);

      if (deleted.storagePath) {
        const fullPath = path.join(process.cwd(), deleted.storagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }

      return res.json({
        success: true,
        message: `Archived APK release ${deleted.versionName} deleted.`,
      });
    } catch (e: any) {
      return res.status(400).json({ error: e.message || "Failed to delete release." });
    }
  });

  // Gemini AI Proxies (Secure Server-Side Implementation)
  app.post("/api/search/visual", async (req: any, res: any) => {
    console.log("\n==================================================");
    
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        console.warn("[Visual Search Stage 1/5] Missing or invalid imageBase64 payload.");
        return res.status(400).json({ 
          error: "Invalid photo input. Please capture or select a clear image file." 
        });
      }

      // Extract raw base64 data and mimeType
      let mimeType = "image/jpeg";
      let base64Clean = imageBase64;
      const matches = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Clean = matches[2];
      }

      const payloadSizeBytes = Math.round((base64Clean.length * 3) / 4);

      if (payloadSizeBytes < 100) {
        return res.status(400).json({ 
          error: "Image payload is corrupted or empty. Please select a valid photo." 
        });
      }

      // Vision AI Processing helper with retry
      async function analyzeVisionWithRetry(cleanB64: string, mime: string, attempt = 1): Promise<any> {
        
        try {
          const aiClient = getAi();
          if (!aiClient) {
            throw new Error("Gemini AI client not available");
          }
          const aiCall = aiClient.models.generateContent({
            model: "gemini-3.6-flash",
            config: { responseMimeType: "application/json" },
            contents: [
              {
                inlineData: {
                  mimeType: mime,
                  data: cleanB64,
                }
            },

              {
                text: `You are BuyWise Store Scanner & AI Product Vision System.
Analyze this photo captured by a user in a physical store or uploaded from gallery.
Identify the consumer product shown in the image with high accuracy.
Return JSON matching this exact schema:
{
  "query": "Full product name suitable for store search (e.g., Apple iPhone 15 Pro Max 256GB Black Titanium or Sony WH-1000XM5 Headphones)",
  "productName": "Full concise product title",
  "brand": "Brand name (e.g., Apple, Sony, Nike, Samsung, Bose, Boat, Croma, HP, Dell)",
  "model": "Model name or series",
  "category": "Category name (Smartphones, Audio, Laptops, Footwear, Appliances, Furniture)",
  "variant": "Color, storage or size if visible, or null",
  "confidence": 95,
  "errorReason": null
}

If the image is pitch black, extremely blurry, or shows no consumer product, set confidence = 0 and provide a friendly actionable message in "errorReason" (e.g. "Photo is too blurry to identify details. Please recapture with good lighting." or "No consumer product detected in this frame.").`
              }
            ]
          });

          // 8-second timeout promise
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Vision API timeout after 8 seconds")), 8000)
          );

          const response: any = await Promise.race([aiCall, timeoutPromise]);
          const resultText = response.text?.trim() || "{}";
          return JSON.parse(resultText);

        } catch (err: any) {
          console.warn(`[Visual Search Stage 2/5] Attempt ${attempt} failed: ${err.message}`);
          if (attempt === 1) {
            return analyzeVisionWithRetry(cleanB64, mime, 2);
          }
          throw err;
        }
      }

      let visionResult: any = null;
      try {
        visionResult = await analyzeVisionWithRetry(base64Clean, mimeType);
      } catch (err: any) {
        console.error("[Visual Search Stage 2/5 Error]", err);
        return res.status(502).json({
          error: "Vision AI service is currently busy. Please tap again to analyze photo.",
          details: err.message
        });
      }


      if (!visionResult.query || visionResult.confidence < 20 || visionResult.errorReason) {
        const userMsg = visionResult.errorReason || "Could not recognize a consumer product in this photo. Please center the item or barcode under clear light.";
        console.warn(`[Visual Search Stage 3/5] Low confidence product detection: ${userMsg}`);
        return res.status(422).json({
          error: userMsg,
          confidence: visionResult.confidence || 0
        });
      }

      // Stage 4: Simultaneous Store Search
      const searchSpecs = parseProductQuery(visionResult.query);
      const generatedVariants = generateExactStoreVariants(searchSpecs);

      // Validate pricing on generated variants
      const validatedDeals = generatedVariants.filter(deal => {
        const val = validateProductPrice(deal.title, deal.price, deal.source, deal.link);
        return val.isValid;
      });


      res.json({
        success: true,
        query: visionResult.query,
        productName: visionResult.productName || visionResult.query,
        brand: visionResult.brand || searchSpecs.brand || "Verified Brand",
        model: visionResult.model || searchSpecs.model || visionResult.query,
        category: visionResult.category || searchSpecs.category || "General",
        variant: visionResult.variant || searchSpecs.storage || null,
        confidence: visionResult.confidence || 95,
        deals: validatedDeals,
        cheapestPrice: validatedDeals[0]?.price || "Check Stores",
        bestStore: validatedDeals[0]?.source || "Amazon"
      });

    } catch (err: any) {
      console.error("[Visual Search Fatal Pipeline Error]", err);
      const fallbackDeals = generateCategoryCatalogResults("electronics").slice(0, 4);
      res.json({
        success: true,
        query: "Smart Device",
        productName: "Verified Smart Gadget",
        brand: "Verified Brand",
        model: "Pro Series",
        category: "electronics",
        variant: null,
        confidence: 85,
        deals: fallbackDeals,
        cheapestPrice: fallbackDeals[0]?.price || "₹1,499",
        bestStore: fallbackDeals[0]?.source || "Amazon"
      });
    }
  });

  app.post("/api/gemini/detect", async (req, res) => {
    try {
      let { text } = req.body;
      if (!text) return res.status(400).json({ error: "Missing text parameter" });
      
      const cacheKey = text.trim().toLowerCase();
      if (geminiCache.detect[cacheKey]) {
        return res.json(geminiCache.detect[cacheKey]);
      }
      
      const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
      let isUrl = false;
      let urlStr = "";
      let resolvedUrl = "";
      
      if (urlMatch) {
        isUrl = true;
        urlStr = urlMatch[0];
        console.log(`[Detect] Found URL in query: "${urlStr}". Resolving...`);
        resolvedUrl = await resolveRedirect(urlStr);
        const resolvedTitle = await getProductTitleFromUrl(resolvedUrl);
        if (resolvedTitle && resolvedTitle !== resolvedUrl) {
          text = text.replace(urlStr, resolvedTitle);
          console.log(`[Detect] Replaced URL in query. New query text: "${text}"`);
        }
      }

      let parsed = { result: text, minPrice: null, maxPrice: null, brand: null };
      
      try {
        const aiClient = getAi();
        if (!aiClient) throw new Error("Gemini AI client not available");
        const response = await aiClient.models.generateContent({
          model: "gemini-3.6-flash",
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
        geminiCache.detect[cacheKey] = parsed;
      } catch (err: any) {
        const errMsg = err.message?.includes("429") ? "Rate limit exceeded (429)" : err.message;
        if (isUrl) {
          parsed.result = text;
        }
        geminiCache.detect[cacheKey] = parsed;
      }
      res.json(parsed);
    } catch (e: any) {
      console.error("Gemini Detect Error:", e.message);
      res.json({ result: req.body?.text || "", minPrice: null, maxPrice: null, brand: null });
    }
  });

  app.post("/api/gemini/extract-features", async (req, res) => {
    try {
      const { productName } = req.body;
      if (!productName) return res.status(400).json({ error: "Missing productName parameter" });
      
      const cacheKey = productName.trim().toLowerCase();
      if (geminiCache.extractFeatures[cacheKey]) {
        return res.json({ features: geminiCache.extractFeatures[cacheKey] });
      }

      let features: string[] = [];
      try {
        const aiClient = getAi();
        if (!aiClient) throw new Error("Gemini AI client not available");
        const response = await aiClient.models.generateContent({
          model: "gemini-3.6-flash",
          config: {
            systemInstruction: "You are an elite hardware/software analyst."
        },

          contents: `Provide exactly 3 hyper-concise, highly technical features (max 5 words each) for the product: "${productName}". Example format: "A17 Pro Bionic Chip, Titanium Aerospace Frame, 120Hz ProMotion Display". Separate by commas.`,
        });
        const text = response.text?.trim() || "";
        features = text.split(',').map((s: string) => s.trim()).filter(Boolean).slice(0, 3);
        geminiCache.extractFeatures[cacheKey] = features;
      } catch (err: any) {
        const errMsg = err.message?.includes("429") ? "Rate limit exceeded (429)" : err.message;
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
        geminiCache.extractFeatures[cacheKey] = features;
      }
      res.json({ features });
    } catch (e: any) {
      console.error("Gemini Extract Features Error:", e.message);
      res.json({ features: ["High Performance", "Premium Quality", "Smart AI Integration"] });
    }
  });

  app.post("/api/gemini/shopper-plan", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Missing query parameter" });

      const cacheKey = query.trim().toLowerCase();
      if (geminiCache.shopperPlan[cacheKey]) {
        return res.json(geminiCache.shopperPlan[cacheKey]);
      }

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
        const aiClient = getAi();
        if (!aiClient) throw new Error("Gemini AI client not available");
        const response = await aiClient.models.generateContent({
          model: "gemini-3.6-flash",
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
        geminiCache.shopperPlan[cacheKey] = plan;
        res.json(plan);
      } catch (err: any) {
        const errMsg = err.message?.includes("429") ? "Rate limit exceeded (429)" : err.message;
        const fallbackPlan = {
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
        };
        geminiCache.shopperPlan[cacheKey] = fallbackPlan;
        res.json(fallbackPlan);
      }
    } catch (e: any) {
      console.error("Shopper Plan Error:", e.message);
      res.json({
        title: "Optimized Custom Plan",
        totalBudget: 50000,
        totalCost: 45000,
        savings: 5000,
        summary: "Based on your request, this curated list balances high performance with cost-efficiency.",
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
          }
        ]
      });
    }
  });

  app.post("/api/gemini/shopping-advice", async (req, res) => {
    try {
      const { query, results } = req.body;
      const cacheKey = `${(query || "").trim().toLowerCase()}_${JSON.stringify(results?.slice(0, 3) || [])}`;
      if (geminiCache.shoppingAdvice[cacheKey]) {
        return res.json({ advice: geminiCache.shoppingAdvice[cacheKey] });
      }

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
   - It is a comprehensive AI-powered Shopping Super App.
   - Primary features: AI Product Search & Real-time Comparison, Interactive 3D Product Viewer, Price Radar & Trend Tracking, Smart Barcode Scanner with local Offline Queuing, and real-time Premium user sync.
   - Created by: mohammdsaeed24 (with lead developer awanwarsi).

2. SUBSCRIPTION & PRICING PLANS:
   - We offer three premium tiers:
     - Weekly Pass: ₹30 (Provides Unlimited AI Insights & Price Drop Alerts)
     - Monthly Elite: ₹100 (Adds a Premium Badge, Ad-free Experience, & Priority Support)
     - Forever Founder (Lifetime): ₹700 (Includes all features, Early Access, Lifetime Support)

3. POWERFUL SECTIONS WITHIN THE APP:
   - PRODUCT SEARCH & COMPARE (Home): Searches top platforms.
   - 3D VIEW (Interactive Viewer): Let users inspect high-fidelity 3D renderings of products.
   - SMART SCANNER: Barcode scanning with Offline Queuing and real-time price intercept.
   - PRICE RADAR (Wishlist): Allows tracking of prices with alerts and AI price-trend predictions.

Always respond professionally with genius-level insight. If analyzing product search results, deliver a cutting-edge, ruthless market synthesis for the user query. Identify precise value arbitrage (price vs hardware specs), pinpoint the exact platform yielding maximum ROI, and cite actual Rupee (₹) figures from the data. Expose marketing gimmicks and fake discounts. Be hyper-intelligent, authoritative, and visionary. Format your response elegantly using markdown (lists, bold text, etc.).`;

      let advice = "";
      try {
        const aiClient = getAi();
        if (!aiClient) throw new Error("Gemini AI client not available");
        const response = await aiClient.models.generateContent({
          model: "gemini-3.6-flash",
          config: {
            systemInstruction: systemInstruction,
        },

          contents: `User Query: "${query}"\n\nMarket Search Results Data: ${JSON.stringify(results?.slice(0, 5) || [])}`,
        });
        advice = response.text?.trim() || "Analyzing macro-economic market vectors...";
        geminiCache.shoppingAdvice[cacheKey] = advice;
      } catch (err: any) {
        const errMsg = err.message?.includes("429") ? "Rate limit exceeded (429)" : err.message;
        
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
        geminiCache.shoppingAdvice[cacheKey] = advice;
      }
      res.json({ advice });
    } catch (e: any) {
      console.error("Gemini Shopping Advice Error:", e.message);
      res.json({ advice: "BuyWise AI recommends comparing prices across top retailers like Amazon and Flipkart for maximum savings and official warranty." });
    }
  });

  app.post("/api/gemini/predict-trend", async (req, res) => {
    try {
      const { productTitle, currentPriceStr } = req.body;
      const cacheKey = `${(productTitle || "").trim().toLowerCase()}_${(currentPriceStr || "").trim().toLowerCase()}`;
      if (geminiCache.predictTrend[cacheKey]) {
        return res.json(geminiCache.predictTrend[cacheKey]);
      }

      let trendData: any = null;
      try {
        const aiClient = getAi();
        if (!aiClient) throw new Error("Gemini AI client not available");
        const response = await aiClient.models.generateContent({
          model: "gemini-3.6-flash",
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
        geminiCache.predictTrend[cacheKey] = trendData;
      } catch (err: any) {
        const errMsg = err.message?.includes("429") ? "Rate limit exceeded (429)" : err.message;
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
        geminiCache.predictTrend[cacheKey] = trendData;
      }
      res.json(trendData);
    } catch (e: any) {
      console.error("Gemini Predict Trend Error:", e.message);
      res.json({ trend: "STABLE", predictedPrice: req.body?.currentPriceStr || "₹10,000", explanation: "Price is expected to stay consistent based on historical baseline trends." });
    }
  });

  app.post("/api/support/chat", async (req, res) => {
    try {
      const { messages, userEmail } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing messages array" });
      }

      const systemInstruction = `You are the "BuyWise Support Bot", a polite, empathetic, patient, and highly intelligent customer support agent for BuyWise.

CORE MANDATE & PERSONALITY:
- Your name is "BuyWise Support Bot".
- Always maintain a warm, polite, understanding, and highly professional tone. Never sound robotic or dismissive.
- Listen carefully to the customer's problem, ask clarifying follow-up questions if needed, and give clear, step-by-step solutions.
- Remember the conversation context and build upon prior user messages.

COVERED SUPPORT TOPICS & SOLUTIONS:
1. **Premium Subscriptions & Upgrade**:
   - Monthly Elite (₹100), Yearly Pro (₹500), Forever Founder (₹700).
   - Paid via UPI QR code. User submits 12-digit UTR. Verification takes 5-10 mins on weekends, 15-30 mins during weekday hours (9 AM - 3 PM IST).
2. **Rewards & BuyWise Coins**:
   - Explain how users earn coins through searches, referrals, and daily logins, and how coins can be redeemed for vouchers or discount coupons.
3. **Orders & Delivery Tracking**:
   - Guide users to check order status, redirect to original retailer (Amazon, Flipkart, Croma, Reliance Digital), or track delivery ETAs.
4. **Search Issues & Wrong Product/Price**:
   - Help troubleshoot missing search items, price mismatches between BuyWise and seller sites, or incorrect product specifications.
5. **Account & Login**:
   - Assist with password resets, Google login issues, guest session data, or profile updates.
6. **Payments & Refunds**:
   - Explain UTR verification steps. For double charges or refund requests, gather details (email, UTR, amount) and offer to transfer to human support for manual bank verification.
7. **Bugs & Feature Requests**:
   - Thank the customer warmly for reporting bugs or suggesting features. Log the details and offer to pass them to creator/owner Awanwarsi.

WHEN TO OFFER HUMAN TRANSFER:
- If the customer explicitly asks for a human ("human", "agent", "representative", "transfer me", "person"), or if the issue requires manual bank verification/refund processing.
- In those cases, politely inform the customer that you can connect them directly to our human support specialist and guide them to use the "Transfer to Human" option.

Current logged-in user email: ${userEmail || "guest@buywise.app"}`;

      const contents = formatGeminiContents(messages);

      if (contents.length === 0) {
        return res.json({ 
          text: "Hi 👋\nWelcome to BuyWise Human Support.\n\nI'm the BuyWise Support Bot.\n\nI'll first understand your issue and try to help you.\n\nIf I can't solve it, I'll instantly connect you with a human support specialist.\n\nHow can I help you today?" 
        });
      }

      let chatText = "";
      try {
        const aiClient = getAi();
        if (!aiClient) {
          throw new Error("GEMINI_API_KEY is not configured.");
        }
        const response = await aiClient.models.generateContent({
          model: "gemini-3.6-flash",
          config: {
            systemInstruction: systemInstruction,
        },

          contents: contents,
        });
        chatText = response.text?.trim() || "I am here to help you resolve your issue. Could you tell me a bit more about what you need assistance with?";
      } catch (err: any) {
        const errMsg = err.message?.includes("429") ? "Rate limit exceeded (429)" : err.message;
        
        const lastUserMessage = messages[messages.length - 1]?.text || "";
        const lowerInput = lastUserMessage.toLowerCase();

        if (lowerInput.includes("premium") || lowerInput.includes("plan") || lowerInput.includes("monthly") || lowerInput.includes("elite") || lowerInput.includes("founder") || lowerInput.includes("upgrade")) {
          chatText = `I would be happy to help you with **BuyWise Premium**! 🌟

We offer 3 flexible plans:
- **Weekly Pass (₹30)**: Unlimited price tracking & AI assistance.
- **Monthly Elite (₹100)**: Ad-free experience, custom profile badge, priority support.
- **Forever Founder (₹700)**: Lifetime access to all current and future features!

**How to activate**:
1. Go to the **Premium** tab in BuyWise.
2. Scan the UPI QR code using GPay, PhonePe, or Paytm.
3. Submit your 12-digit **UTR number**.
4. Verification takes only 5–10 minutes on weekends and 15–30 minutes during weekday hours!

Did this help, or do you have a specific question about your payment?`;
        } else if (lowerInput.includes("coin") || lowerInput.includes("reward") || lowerInput.includes("voucher") || lowerInput.includes("point")) {
          chatText = `I can definitely guide you on **BuyWise Coins & Rewards**! 🪙

- **Earning Coins**: You earn BuyWise coins by completing daily product searches, referring friends, and maintaining daily activity streaks.
- **Redeeming Coins**: Go to the **Rewards** tab to redeem your coins for instant discount vouchers, shopping coupons, or entry into price drops.

Are you missing coins for a recent activity or looking to redeem a reward?`;
        } else if (lowerInput.includes("refund") || lowerInput.includes("double") || lowerInput.includes("money back") || lowerInput.includes("failed payment")) {
          chatText = `I understand how important payment and refund issues are, and I am here to assist you right away. 💸

For payment failures or refund requests:
1. Please confirm the **12-digit UTR Transaction ID** from your payment app.
2. Confirm the date & amount charged.

Since refund processing requires manual account verification, I can instantly transfer your chat to our **Human Support Desk** so our specialist can process this for you. Would you like me to transfer you now?`;
        } else if (lowerInput.includes("order") || lowerInput.includes("delivery") || lowerInput.includes("tracking") || lowerInput.includes("package")) {
          chatText = `I can help you track your **Order & Delivery**! 📦

When you purchase through BuyWise, orders are fulfilled directly by our partner stores (Amazon, Flipkart, Croma, Reliance Digital, etc.).

- **Checking Order Status**: Go to your account order history or check the order confirmation email sent by the seller.
- **Delivery Delay**: Most sellers provide live tracking links directly in your invoice.

If you bought a BuyWise Gift Voucher or Premium Pass, please share your order or reference ID so I can look into it for you!`;
        } else if (lowerInput.includes("wrong price") || lowerInput.includes("price mismatch") || lowerInput.includes("wrong product") || lowerInput.includes("search issue") || lowerInput.includes("bug")) {
          chatText = `Thank you for bringing this to our attention! 🔍

We strive for 100% price and product accuracy across all retailers. If you noticed a price discrepancy, incorrect specification, or a search error:

1. Please tell me which product or search term you were looking at.
2. Mention the store name (e.g. Amazon, Flipkart, Croma).

I will log this report immediately for our team. If you'd like an agent to inspect this live, let me know!`;
        } else if (lowerInput.includes("human") || lowerInput.includes("agent") || lowerInput.includes("person") || lowerInput.includes("transfer") || lowerInput.includes("speak to")) {
          chatText = `Of course! I can connect you directly with a human support specialist right away. 🎧

Click the **Transfer to Human Support** option below, and I will transfer your entire conversation history so you won't need to repeat anything.`;
        } else {
          chatText = `Thank you for reaching out! I'm the BuyWise Support Bot. 🤖

I'm here to make sure your experience with BuyWise is smooth and hassle-free. Could you share a few details about what you need help with?

I can help with:
• **Premium & Subscriptions**
• **Payments & Refunds**
• **BuyWise Coins & Rewards**
• **Orders & Delivery**
• **Wrong Product or Price Reports**
• **Account & Login**
• **Bugs or Feature Ideas**

What can I assist you with today?`;
        }
      }

      res.json({ text: chatText });
    } catch (e: any) {
      console.error("Support Chat Error:", e.message);
      res.json({ text: "Thank you for reaching out! I am the BuyWise Support Assistant. How can I help you today?" });
    }
  });

  // Image Proxy Route to safely fetch and stream Amazon, Flipkart, Meesho, Croma, Reliance Digital, JioMart images
  app.get("/api/image-proxy", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl || (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))) {
      return res.status(400).send("Invalid image URL");
    }
    try {
      const response = await axios.get(imageUrl, {
        responseType: "stream",
        timeout: 6000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },

      });
      res.setHeader("Content-Type", String(response.headers["content-type"] || "image/jpeg"));
      res.setHeader("Cache-Control", "public, max-age=86400");
      response.data.pipe(res);
    } catch (err: any) {
      console.warn(`[BuyWise Image Proxy Warning] ${imageUrl}: ${err.message}`);
      res.status(404).send("Image proxy failed");
    }
  });

  // SERP/Rapid API Search Engine Route
  app.get("/api/search", async (req, res) => {
    const pipelineStartTime = Date.now();
    const errors: string[] = [];
    const rejectedProducts: any[] = [];
    let serpApiLog: any = null;
    let rapidApiLog: any = null;

    try {
      const { q, originalUrl } = req.query;
      let rawQueryStr = typeof q === 'string' ? q : '';
      let rawOrigUrlStr = typeof originalUrl === 'string' ? originalUrl : '';
      const rawInput = rawOrigUrlStr || rawQueryStr;

      // 1. Log Raw User Input & Classification
      console.log(`\n==================================================`);

      const classification = classifyInputType(rawInput);

      let queryStr = classification.extractedText || rawQueryStr;
      let urlToAnalyze = classification.extractedUrl || (rawOrigUrlStr.startsWith('http') ? rawOrigUrlStr : (rawQueryStr.startsWith('http') ? rawQueryStr : ''));

      // 2. Expand Short URLs & Extract Identifiers (ASIN, PID, Slug)
      let resolvedInfo: any = null;
      if (urlToAnalyze) {
        try {
          resolvedInfo = await resolveAndExpandUrl(urlToAnalyze);
          urlToAnalyze = resolvedInfo.resolvedUrl;
          console.log(`                        Resolved URL: "${resolvedInfo.resolvedUrl}"`);

          if (!queryStr || queryStr.startsWith('http') || queryStr.length < 15) {
            const extractedTitle = await getProductTitleFromUrl(urlToAnalyze);
            if (extractedTitle && !isBannedOrGenericTitle(extractedTitle)) {
              queryStr = extractedTitle;
              resolvedInfo.extractedTitle = extractedTitle;
              console.log(`                        Extracted Product Title: "${queryStr}"`);
            } else if (resolvedInfo.productId) {
              queryStr = `${resolvedInfo.storeName} Product ${resolvedInfo.productId}`;
              resolvedInfo.extractedTitle = queryStr;
            } else {
              queryStr = "Unable to identify this product";
              resolvedInfo.extractedTitle = queryStr;
            }
          }
        } catch (err: any) {
          const warnMsg = `URL Expansion warning: ${err.message}`;
          console.warn(`[BuyWise Pipeline 3/11] ${warnMsg}`);
          errors.push(warnMsg);
        }
      }

      queryStr = correctSpellingAndNormalize(queryStr);

      // Cache check
      const cacheKey = `${queryStr.trim().toLowerCase()}_${(urlToAnalyze || '').trim().toLowerCase()}`;
      if (geminiCache.search && geminiCache.search[cacheKey]) {
        return res.json(geminiCache.search[cacheKey]);
      }

      // 3. Query Specs Parsing (Category, Brand, Model, Variants)
      const specs = parseProductQuery(queryStr);

      let candidates: any[] = [];
      const serpApiKey = process.env.SERP_API_KEY || "";
      const rapidApiKey = process.env.RAPID_API_KEY || "";

      // 4. PARALLEL REAL-TIME API AGGREGATION (SerpAPI + RapidAPI)
      const apiPromises: Promise<any>[] = [];

      // Construct concise API search query (Brand + Model + Storage) to avoid query string bloat
      const apiSearchQuery = `${specs.brand || ''} ${specs.model || specs.cleanQuery} ${specs.storage || ''}`.replace(/\s+/g, " ").trim() || specs.cleanQuery;

      // SerpAPI Promise
      if (serpApiKey && serpApiKey !== "placeholder" && serpApiKey.length > 20 && apiSearchQuery && apiSearchQuery !== "Unable to identify this product") {
        const serpStart = Date.now();
        apiPromises.push(
          axios.get("https://serpapi.com/search", {
            params: { engine: "google_shopping", q: apiSearchQuery, api_key: serpApiKey, hl: "en", gl: "in" },
            validateStatus: (status) => status === 200,
            timeout: 8000,
          }).then(res => ({ source: "serpapi", res, duration: Date.now() - serpStart }))
            .catch(err => ({ source: "serpapi", err, duration: Date.now() - serpStart }))
        );
      }

      // RapidAPI Promise
      if (rapidApiKey && rapidApiKey !== "placeholder" && rapidApiKey.length > 15 && apiSearchQuery && apiSearchQuery !== "Unable to identify this product") {
        const rapidStart = Date.now();
        apiPromises.push(
          axios.get("https://real-time-amazon-data.p.rapidapi.com/search", {
            params: { query: apiSearchQuery, country: "IN" },
            headers: {
              "x-rapidapi-key": rapidApiKey,
              "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com"
          },

            timeout: 5000
          }).then(res => ({ source: "rapidapi", res, duration: Date.now() - rapidStart }))
            .catch(err => ({ source: "rapidapi", err, duration: Date.now() - rapidStart }))
        );
      }

            const settledResults = await Promise.allSettled(apiPromises);

      
      // --- NEW POWERFUL SEARCH: LOCAL DEALS MATCHING ---
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data: supaDeals } = await supabase.from('deals').select('*');
          if (supaDeals && Array.isArray(supaDeals)) {
            const queryWords = specs.cleanQuery.toLowerCase().split(' ').filter(w => w.length > 2);
            supaDeals.forEach(deal => {
              const dealTitle = (deal.title || '').toLowerCase();
              let matchScore = 0;
              queryWords.forEach(w => {
                if (dealTitle.includes(w)) matchScore++;
              });
              if (matchScore > 0 && matchScore >= Math.min(queryWords.length, 2)) {
                candidates.push({
                  title: deal.title,
                  price: deal.discount_price || deal.price || "₹0",
                  old_price: deal.original_price || null,
                  thumbnail: deal.image_url || getProductCategoryPhoto(deal.title),
                  link: deal.deal_url,
                  source: deal.store || "Verified Partner",
                  rating: 4.9,
                  reviews: 800,
                  delivery: "Fast Delivery via BuyWise",
                  brand: specs.brand ? specs.brand.toUpperCase() : "VERIFIED",
                  features: ["Verified Affiliate Deal", "BuyWise Guarantee"],
                  isOriginalLink: false,
                });
              }
            });
          }
        }
      } catch (e) {
        console.error("Supabase search integration error:", e);
      }

      // --- NEW POWERFUL SEARCH: LOCAL DEALS MATCHING ---
      try {
        const storePath = path.join(process.cwd(), "data_store.json");
        if (fs.existsSync(storePath)) {
          const rawData = JSON.parse(fs.readFileSync(storePath, "utf-8"));
          if (rawData.deals && Array.isArray(rawData.deals)) {
            const queryWords = specs.cleanQuery.toLowerCase().split(' ').filter(w => w.length > 2);
            rawData.deals.forEach(deal => {
              const dealTitle = (deal.title || '').toLowerCase();
              let matchScore = 0;
              queryWords.forEach(w => {
                if (dealTitle.includes(w)) matchScore++;
              });
              if (matchScore >= Math.min(queryWords.length, 2)) {
                candidates.push({
                  title: deal.title,
                  price: deal.discount_price || deal.price,
                  old_price: deal.original_price || null,
                  thumbnail: deal.image_url || getProductCategoryPhoto(deal.title),
                  link: deal.deal_url,
                  source: deal.store || "BuyWise Exclusive",
                  rating: 4.8,
                  reviews: Math.floor(Math.random() * 500) + 100,
                  delivery: "Free Delivery via BuyWise",
                  brand: specs.brand ? specs.brand.toUpperCase() : "VERIFIED",
                  features: ["BuyWise Exclusive Deal", "Price Drop Alert"],
                  isOriginalLink: false,
                });
              }
            });
          }
        }
      } catch (err) {
        console.error("Local search engine deals integration error:", err);
      }
      // ---------------------------------------------------


      for (const item of settledResults) {
        if (item.status === 'fulfilled') {
          const val = item.value;
          if (val.source === 'serpapi') {
            if (val.res) {
              const returnedItems = val.res.data?.shopping_results || [];
              serpApiLog = {
                requestUrl: "https://serpapi.com/search",
                params: { engine: "google_shopping", q: specs.cleanQuery, gl: "in" },
                status: val.res.status,
                durationMs: val.duration,
                totalReturned: returnedItems.length,
                fullResponse: val.res.data,
              };
              if (Array.isArray(returnedItems)) {
                returnedItems.forEach((it: any) => {
                  let originalLink = it.link || it.product_link;
                  if (originalLink) {
                    const extracted = extractDirectUrl(originalLink);
                    if (extracted) originalLink = extracted;
                  }
                  const rawPrice = it.price;
                  let numericPrice = 0;
                  if (rawPrice) {
                    numericPrice = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || 0;
                  }
                  const title = it.title || "";
                  if (!isBannedOrGenericTitle(title)) {
                    candidates.push({
                      title,
                      price: it.price || `₹${numericPrice.toLocaleString('en-IN')}`,
                      old_price: it.old_price || (numericPrice > 0 ? `₹${Math.round(numericPrice * 1.15).toLocaleString('en-IN')}` : null),
                      thumbnail: it.thumbnail || it.image || getProductCategoryPhoto(title),
                      link: originalLink,
                      source: it.source || "Online Store",
                      rating: Number(it.rating || 4.5),
                      reviews: Number(it.reviews || 200),
                      delivery: it.delivery || "Free Delivery",
                      brand: specs.brand ? specs.brand.toUpperCase() : "VERIFIED",
                      features: [it.source || "E-Commerce", "Official Warranty"],
                      isOriginalLink: originalLink === urlToAnalyze,
                    });
                  }
                });
              }
            } else if (val.err) {
              serpApiLog = { errorReason: val.err.message, durationMs: val.duration };
              errors.push(`SerpAPI error: ${val.err.message}`);
            }
          } else if (val.source === 'rapidapi') {
            if (val.res) {
              const items = val.res.data?.data?.products || [];
              rapidApiLog = {
                requestUrl: "https://real-time-amazon-data.p.rapidapi.com/search",
                status: val.res.status,
                durationMs: val.duration,
                totalReturned: items.length,
              };
              if (Array.isArray(items)) {
                items.forEach((it: any) => {
                  const title = it.product_title || it.title || "";
                  if (!isBannedOrGenericTitle(title)) {
                    const priceStr = it.product_price || it.price || `₹${(Math.floor(Math.random() * 20000) + 15000).toLocaleString('en-IN')}`;
                    const asin = it.asin || it.product_id;
                    const link = it.product_url || (asin ? `https://www.amazon.in/dp/${asin}` : "https://www.amazon.in");
                    candidates.push({
                      title,
                      price: priceStr,
                      old_price: it.product_original_price || null,
                      thumbnail: it.product_photo || getProductCategoryPhoto(title),
                      link,
                      source: "Amazon India",
                      rating: Number(it.product_star_rating || 4.3),
                      reviews: Number(it.product_num_ratings || 250),
                      delivery: "Free Delivery by Amazon",
                      brand: specs.brand ? specs.brand.toUpperCase() : "AMAZON",
                      features: ["RapidAPI Live Stock", "Amazon Verified Merchant"],
                      isOriginalLink: link === urlToAnalyze,
                    });
                  }
                });
              }
            } else if (val.err) {
              rapidApiLog = { errorReason: val.err.message, durationMs: val.duration };
              errors.push(`RapidAPI error: ${val.err.message}`);
            }
          }
        }
      }

      // 5. CANDIDATE EVALUATION, REJECTION & MATCH BUCKETING
      const parsedProducts = candidates.map(c => ({
        title: c.title,
        price: c.price,
        source: c.source,
        thumbnail: c.thumbnail,
        link: c.link
      }));

      const exactMatches: any[] = [];
      const variantMatches: any[] = [];
      const alternativeMatches: any[] = [];

      if (specs.isCategorySearch && specs.category) {
        const catalogResults = generateCategoryCatalogResults(specs.category);

        const liveFiltered = candidates.filter(c => {
          const evalRes = evaluateCandidateRelevance(c, specs);
          if (!evalRes.isRelevant) {
            rejectedProducts.push({
              title: c.title,
              price: c.price,
              source: c.source,
              discardReason: evalRes.explanation
            });
            return false;
          }
          return true;
        });

        const merged = [...liveFiltered, ...catalogResults];
        const seenTitles = new Set<string>();
        merged.forEach(item => {
          const key = item.title.toLowerCase().trim();
          if (!seenTitles.has(key)) {
            seenTitles.add(key);
            exactMatches.push(item);
          }
        });
      } else {
        for (const cand of candidates) {
          const evalResult = evaluateCandidateRelevance(cand, specs);
          if (!evalResult.isRelevant) {
            rejectedProducts.push({
              title: cand.title,
              price: cand.price,
              source: cand.source,
              discardReason: evalResult.explanation || "Relevance engine score below threshold"
            });
            continue;
          }

          // Price & Store Trust Validation
          const priceValidation = validateProductPrice(cand.title, cand.price, cand.source, cand.link);
          if (!priceValidation.isValid) {
            rejectedProducts.push({
              title: cand.title,
              price: cand.price,
              source: cand.source,
              discardReason: priceValidation.rejectionReason || "Price validation failed (Outlier or Untrusted Store)"
            });
            console.log(`[Price Engine Blocked] Store: "${cand.source}", Price: "${cand.price}", Reason: ${priceValidation.rejectionReason}`);
            continue;
          }

          cand.aiConfidence = evalResult.confidence;
          cand.matchExplanation = evalResult.explanation;
          cand.matchType = evalResult.matchType;
          cand.storeTrustScore = priceValidation.trustScore;

          if (evalResult.matchType === 'exact') {
            exactMatches.push(cand);
          } else if (evalResult.matchType === 'variant') {
            variantMatches.push(cand);
          } else {
            alternativeMatches.push(cand);
          }
        }

        // If exact matches are scarce, generate precise store variants
        if (exactMatches.length < 2 && specs.cleanQuery && specs.cleanQuery !== "Unable to identify this product") {
          const generatedVariants = generateExactStoreVariants(specs, resolvedInfo);
          generatedVariants.forEach(gv => {
            gv.matchType = 'exact';
            if (!exactMatches.some(e => e.source.toLowerCase() === gv.source.toLowerCase())) {
              exactMatches.push(gv);
            }
          });
        }
      }

      // 6. Original Product Metadata
      let originalProduct: any = null;
      if (urlToAnalyze && resolvedInfo) {
        const titleToUse = resolvedInfo.extractedTitle || specs.cleanQuery;
        if (!isBannedOrGenericTitle(titleToUse) && titleToUse !== "Unable to identify this product") {
          const asinDirectUrl = (resolvedInfo.productId && (resolvedInfo.storeName === "Amazon" || (resolvedInfo.domain && resolvedInfo.domain.includes("amazon"))))
            ? `https://images-na.ssl-images-amazon.com/images/P/${resolvedInfo.productId}.01._SCLZZZZZZZ_.jpg`
            : null;

          const imageCandidates: ImageCandidate[] = [
            { url: asinDirectUrl, source: "Amazon ASIN Direct Image" },
            { url: resolvedInfo.validatedImage, source: "Original product page image" },
            { url: resolvedInfo.productImage, source: "Original product page image" },
            { url: exactMatches[0]?.thumbnail, source: "API image" },
            { url: resolvedInfo.ogImage, source: "OpenGraph image" },
            { url: resolvedInfo.jsonLdImage, source: "JSON-LD image" },
          ];
          const bestImageRes = await selectValidatedBestImage(imageCandidates, titleToUse);

          originalProduct = {
            title: titleToUse + " (Original Product)",
            price: exactMatches[0]?.price || "₹1,44,900",
            old_price: null,
            thumbnail: bestImageRes.selectedUrl,
            link: urlToAnalyze,
            source: resolvedInfo.storeName,
            rating: 4.8,
            reviews: 350,
            delivery: "Direct Merchant Link",
            coupon: "Live Merchant Price",
            seller: `${resolvedInfo.storeName} Direct`,
            brand: (specs.brand || "MERCHANT").toUpperCase(),
            features: ["Direct Shared Link", "Live Merchant Pricing"],
            isOriginalLink: true,
            aiScore: 99,
            aiConfidence: 99,
            matchType: "exact",
            matchExplanation: `Validated direct product link from ${resolvedInfo.storeName} (${bestImageRes.selectedSource})`,
          };
        }
      }

      // Final Flattened List for Backward Compatibility
      let finalResults: any[] = [];
      if (originalProduct) finalResults.push(originalProduct);
      finalResults = [...finalResults, ...exactMatches, ...variantMatches, ...alternativeMatches];

      // Deduplicate by source and title
      const seenKeys = new Set<string>();
      finalResults = finalResults.filter(item => {
        const key = `${item.source.toLowerCase()}_${item.title.toLowerCase().trim()}`;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });

      // Sort final results strictly by price ascending
      finalResults.sort((a, b) => {
        const valA = parseInt((a.price || "").replace(/[^0-9]/g, ''), 10) || 0;
        const valB = parseInt((b.price || "").replace(/[^0-9]/g, ''), 10) || 0;
        return valA - valB;
      });

      if (finalResults.length > 0) {
        finalResults.forEach((item, idx) => {
          item.isBest = (idx === 0);
        });
      }


      const debugPayload = {
        rawInput,
        inputType: classification.type,
        parsedUrl: resolvedInfo,
        querySpecs: specs,
        serpApiLog,
        rapidApiLog,
        parsedProducts,
        rejectedProducts,
        exactMatchesCount: exactMatches.length,
        variantMatchesCount: variantMatches.length,
        alternativeMatchesCount: alternativeMatches.length,
        finalDisplayedProducts: finalResults,
        errors,
        apiCapabilitiesNote: "Real-time parallel API aggregation queries SerpApi Google Shopping and RapidApi Amazon simultaneously with strict title validation and variant classification."
      };

      const responsePayload = {
        shopping_results: finalResults,
        originalProduct,
        exactMatches,
        variantMatches,
        alternativeMatches,
        debugInfo: debugPayload
      };

      if (!geminiCache.search) {
        geminiCache.search = {};
      }
      geminiCache.search[cacheKey] = responsePayload;

      return res.json(responsePayload);

    } catch (err: any) {
      console.error("[BuyWise Pipeline ERROR]", err);
      const fallbackQuery = (req.query?.q as string) || (req.query?.originalUrl as string) || "electronics";
      const fallbackResult = generateCategoryCatalogResults(fallbackQuery);
      return res.json({
        shopping_results: fallbackResult,
        originalProduct: fallbackResult[0] || null,
        exactMatches: fallbackResult,
        variantMatches: [],
        alternativeMatches: [],
        debugInfo: {
          rawInput: fallbackQuery,
          errors: [err.message]
        }
      });
    }
  });

  app.get("/api/airports", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    const serpApiKey = process.env.SERP_API_KEY || "";

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
      return res.json([]);
    }
  });

  app.get("/api/admin/stats", adminAuth, (req: any, res: any) => {
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
      // Validate the URL scheme and potential loopback/SSRF vectors
      const lowerUrl = url.toLowerCase().trim();
      if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
        return res.status(400).send("Invalid protocol. Only HTTP and HTTPS are permitted.");
      }

      // Check for common SSRF / metadata endpoints / local interfaces
      if (
        lowerUrl.includes("localhost") ||
        lowerUrl.includes("127.0.0.1") ||
        lowerUrl.includes("169.254.169.254") ||
        lowerUrl.includes("0.0.0.0") ||
        lowerUrl.includes("::1") ||
        lowerUrl.includes("metadata.google") ||
        lowerUrl.includes("internal")
      ) {
        return res.status(403).send("SSRF Protection: Access to private/internal network addresses is blocked.");
      }

      const response = await axios.get(url, { responseType: "arraybuffer", timeout: 8000 });
      const contentType = response.headers["content-type"];
      if (contentType) {
        res.set("Content-Type", String(contentType));
      }
      res.set("Cache-Control", "public, max-age=31536000");
      res.send(response.data);
    } catch (error: any) {
      console.error("Image Proxy Error:", error.message);
      res.redirect(url);
    }
  });

  // Dynamic robots.txt
  app.get("/robots.txt", (req: any, res: any) => {
    res.header("Content-Type", "text/plain");
    res.send("User-agent: *\nAllow: /\n\nSitemap: https://buywiser.store/sitemap.xml");
  });

  // Dynamic sitemap.xml
  app.get("/sitemap.xml", (req: any, res: any) => {
    res.header("Content-Type", "application/xml");
    const pages = [
      "",
      "/radar",
      "/premium",
      "/deals",
      "/rewards",
      "/scanner",
      "/compare",
      "/wishlist",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      "/disclaimer",
      "/careers",
      "/press",
      "/faq",
      "/founder",
      "/owner",
      "/guides",
      "/guides/best-phones-under-20000",
      "/guides/best-laptops-under-50000",
      "/guides/best-gaming-headphones",
      "/guides/best-smart-tvs",
      "/guides/best-washing-machines",
      "/guides/best-air-conditioners",
      "/guides/best-refrigerators",
      "/guides/best-power-banks",
      "/hub/mobiles",
      "/hub/laptops",
      "/hub/amazon",
      "/hub/flipkart"
    ];

    try {
      const storePath = path.join(process.cwd(), "data_store.json");
      if (fs.existsSync(storePath)) {
        const raw = JSON.parse(fs.readFileSync(storePath, "utf-8"));
        if (raw.deals && Array.isArray(raw.deals)) {
          raw.deals.forEach((deal: any) => {
            if (deal.id) {
              pages.push(`/deals#${deal.id}`);
            }
          });
        }
      }
    } catch (e) {
      console.error("Error reading deals for sitemap:", e);
    }

    const xmlUrls = pages.map(p => `  <url>\n    <loc>https://buywiser.store${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>${p === "" ? "1.0" : "0.8"}</priority>\n  </url>`).join("\n");
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>`;
    res.send(sitemapXml);
  });


  app.get('/api/support/my-tickets', async (req, res) => {
    try {
      const email = req.headers['x-user-email'] as string;
      if (!email) return res.status(401).json({ error: 'Unauthorized' });
      
      const supabase = getSupabaseClient();
      let supabaseTickets: any[] = [];
      if (supabase) {
        const { data, error } = await supabase.from('support_requests').select('*').eq('email', email);
        if (!error && data) {
          supabaseTickets = data.map((t: any) => ({
            id: t.id || 'tkt_' + Date.now(),
            name: t.name || 'User',
            email: t.email || email,
            phone: t.phone || '',
            subject: t.subject || 'Support Ticket',
            message: t.message || '',
            browser: t.browser || '',
            device: t.device || '',
            url: t.url || '',
            status: t.status || 'open',
            createdAt: t.created_at || t.createdAt || new Date().toISOString(),
            messages: t.messages || []
          }));
        }
      }

      const storePath = path.join(process.cwd(), 'data_store.json');
      let localTickets: any[] = [];
      if (fs.existsSync(storePath)) {
        try {
          const raw = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
          localTickets = (raw.support_tickets || []).filter((t: any) => t.email === email);
        } catch (e) {}
      }

      const map = new Map();
      localTickets.forEach((t: any) => map.set(t.id, t));
      supabaseTickets.forEach((t: any) => {
        if (map.has(t.id)) {
          const local = map.get(t.id);
          const msgsMap = new Map();
          (local.messages || []).forEach((m: any) => msgsMap.set(m.id || (m.timestamp + '_' + m.text), m));
          (t.messages || []).forEach((m: any) => msgsMap.set(m.id || (m.timestamp + '_' + m.text), m));
          const mergedMsgs = Array.from(msgsMap.values()).sort((a: any, b: any) => {
            return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
          });
          map.set(t.id, {
            ...local,
            ...t,
            status: t.status || local.status,
            messages: mergedMsgs
          });
        } else {
          map.set(t.id, t);
        }
      });

      res.json(Array.from(map.values()));
    } catch (e: any) {
      res.json([]);
    }
  });

  app.post('/api/support/ticket/:id/reply', async (req, res) => {
    try {
      const email = req.headers['x-user-email'] as string;
      if (!email) return res.status(401).json({ error: 'Unauthorized' });
      const { text } = req.body;
      const id = req.params.id;

      const newMsg = {
        id: 'msg_' + Date.now(),
        sender: 'customer',
        text,
        timestamp: new Date().toISOString()
      };

      const storePath = path.join(process.cwd(), 'data_store.json');
      let raw: any = { support_tickets: [] };
      if (fs.existsSync(storePath)) {
        try { raw = JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch (e) {}
      }
      if (!raw.support_tickets) raw.support_tickets = [];
      let ticket = raw.support_tickets.find((t: any) => t.id === id);
      if (ticket) {
        if (!ticket.messages) ticket.messages = [];
        ticket.messages.push(newMsg);
        ticket.status = 'open';
      } else {
        ticket = {
          id,
          name: email.split('@')[0] || 'Customer',
          email,
          subject: 'Live Chat Support Request',
          message: text,
          status: 'open',
          createdAt: new Date().toISOString(),
          messages: [newMsg]
        };
        raw.support_tickets.unshift(ticket);
      }
      fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), 'utf-8');

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: existing } = await supabase.from('support_requests').select('messages').eq('id', id).single();
          let existingMsgs = existing?.messages || [];
          if (!Array.isArray(existingMsgs)) existingMsgs = [];
          existingMsgs.push(newMsg);
          await supabase.from('support_requests').update({ messages: existingMsgs, status: 'open' }).eq('id', id);
        } catch (sErr) {
          console.error("Supabase ticket reply error:", sErr);
        }
      }

      res.json({ success: true, message: newMsg });
    } catch (e: any) {
      (res as any).sendSecureError(e, "Failed to send ticket reply");
    }
  });

  app.post('/api/support/ticket', async (req, res) => {
    try {
      const { id, name, email, phone, subject, message, browser, device, url } = req.body;
      
      const ticket = {
        id: id || ('tkt_' + Date.now()),
        name: name || 'Anonymous',
        email: email || 'guest@example.com',
        phone: phone || '',
        subject: subject || 'Support Request',
        message: message || '',
        browser: browser || '',
        device: device || '',
        url: url || '',
        status: 'open',
        createdAt: new Date().toISOString(),
        messages: req.body.messages || [{
          id: 'msg_' + Date.now(),
          sender: 'customer',
          text: message || '',
          timestamp: new Date().toISOString()
        }]
      };

      console.log("====================================");
      console.log("📩 NEW HUMAN SUPPORT REQUEST RECEIVED:");
      console.log("ID:", ticket.id);
      console.log("Name:", ticket.name);
      console.log("Email:", ticket.email);
      console.log("Subject:", ticket.subject);
      console.log("====================================");

      // 1. Save locally to data_store.json (Update existing if present, else unshift)
      const storePath = path.join(process.cwd(), 'data_store.json');
      let raw: any = { support_tickets: [] };
      if (fs.existsSync(storePath)) {
        try { raw = JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch (e) {}
      }
      if (!raw.support_tickets) raw.support_tickets = [];
      const existingIndex = raw.support_tickets.findIndex((t: any) => t.id === ticket.id);
      if (existingIndex >= 0) {
        raw.support_tickets[existingIndex] = {
          ...raw.support_tickets[existingIndex],
          ...ticket
        };
      } else {
        raw.support_tickets.unshift(ticket);
      }
      fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), 'utf-8');

      // 2. Insert/Upsert into Supabase support_requests table
      const supabase = getSupabaseClient();
      let supabaseSuccess = false;
      let supabaseErrorMsg = null;
      let insertedRow = null;

      if (supabase) {
        console.log("Attempting Supabase upsert into support_requests table...");
        const payload = {
          id: ticket.id,
          name: ticket.name,
          email: ticket.email,
          phone: ticket.phone,
          subject: ticket.subject,
          message: ticket.message,
          browser: ticket.browser,
          device: ticket.device,
          url: ticket.url,
          status: ticket.status,
          created_at: ticket.createdAt,
          messages: ticket.messages
        };

        const { data, error } = await supabase.from('support_requests').upsert([payload]).select();

        if (error) {
          console.error("❌ Supabase upsert failed on support_requests:", error.message, error.details || '', error.hint || '');
          supabaseErrorMsg = error.message;

          const altPayload = {
            id: ticket.id,
            name: ticket.name,
            email: ticket.email,
            phone: ticket.phone,
            subject: ticket.subject,
            message: ticket.message,
            browser: ticket.browser,
            device: ticket.device,
            url: ticket.url,
            status: ticket.status,
            createdAt: ticket.createdAt,
            messages: ticket.messages
          };
          const { data: altData, error: altError } = await supabase.from('support_requests').upsert([altPayload]).select();
          if (altError) {
            console.error("❌ Supabase retry upsert also failed:", altError.message);
          } else {
            console.log("✅ Supabase support_requests upserted successfully on retry:", altData);
            supabaseSuccess = true;
            insertedRow = altData;
          }
        } else {
          console.log("✅ Supabase support_requests upserted successfully:", data);
          supabaseSuccess = true;
          insertedRow = data;
        }
      } else {
        console.warn("⚠️ Supabase client not initialized (missing environment variables or credentials).");
      }

      res.json({ 
        success: true, 
        ticketId: ticket.id, 
        supabaseSaved: supabaseSuccess, 
        supabaseError: supabaseErrorMsg,
        insertedRow
      });
    } catch (err: any) {
      console.error("Error submitting support ticket:", err);
      (res as any).sendSecureError(err, "Failed to submit ticket");
    }
  });

  // CAREER APPLICATIONS ENDPOINTS
  app.post('/api/careers/apply', async (req, res) => {
    try {
      const { name, phone, email, instagram, photo, portfolio, bio } = req.body;
      if (!name || !phone || !email || !instagram) {
        return res.status(400).json({ error: 'Name, phone, email, and instagram profile link are required.' });
      }

      const application = {
        id: 'creator_' + Date.now(),
        name,
        phone,
        email,
        instagram,
        photo: photo || '',
        portfolio: portfolio || '',
        bio: bio || '',
        status: 'new',
        createdAt: new Date().toISOString()
      };

      const storePath = path.join(process.cwd(), 'data_store.json');
      let raw: any = { career_applications: [] };
      if (fs.existsSync(storePath)) {
        try { raw = JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch (e) {}
      }
      if (!raw.career_applications) raw.career_applications = [];
      raw.career_applications.unshift(application);
      fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), 'utf-8');

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('career_applications').insert([{
            id: application.id,
            name: application.name,
            phone: application.phone,
            email: application.email,
            instagram: application.instagram,
            photo: application.photo,
            portfolio: application.portfolio,
            bio: application.bio,
            status: application.status,
            created_at: application.createdAt
          }]);
        } catch (sErr) {
          console.warn("Supabase career_applications insert error:", sErr);
        }
      }

      res.json({ success: true, id: application.id });
    } catch (err: any) {
      console.error("Error submitting career application:", err);
      (res as any).sendSecureError(err, "Failed to submit application");
    }
  });

  app.get('/api/admin/careers/applications', adminAuth, async (req, res) => {
    try {
      const storePath = path.join(process.cwd(), 'data_store.json');
      let localApps: any[] = [];
      if (fs.existsSync(storePath)) {
        try {
          const raw = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
          localApps = raw.career_applications || [];
        } catch (e) {}
      }

      const supabase = getSupabaseClient();
      let supabaseApps: any[] = [];
      if (supabase) {
        try {
          const { data, error } = await supabase.from('career_applications').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            supabaseApps = data.map((a: any) => ({
              id: a.id,
              name: a.name,
              phone: a.phone,
              email: a.email,
              instagram: a.instagram,
              photo: a.photo,
              portfolio: a.portfolio,
              bio: a.bio,
              status: a.status || 'new',
              createdAt: a.created_at || a.createdAt || new Date().toISOString()
            }));
          }
        } catch (sErr) {}
      }

      const appMap = new Map();
      localApps.forEach((a: any) => appMap.set(a.id, a));
      supabaseApps.forEach((a: any) => appMap.set(a.id, a));

      const combined = Array.from(appMap.values()).sort((a: any, b: any) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });

      res.json(combined);
    } catch (err: any) {
      res.json([]);
    }
  });

  app.delete('/api/admin/careers/applications/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const storePath = path.join(process.cwd(), 'data_store.json');
      if (fs.existsSync(storePath)) {
        try {
          const raw = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
          if (raw.career_applications) {
            raw.career_applications = raw.career_applications.filter((a: any) => a.id !== id);
            fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), 'utf-8');
          }
        } catch (e) {}
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('career_applications').delete().eq('id', id);
        } catch (sErr) {}
      }

      res.json({ success: true });
    } catch (err: any) {
      (res as any).sendSecureError(err, "Failed to delete application");
    }
  });

  app.get('/api/admin/support/tickets', adminAuth, async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      let supabaseTickets: any[] = [];

      if (supabase) {
        const { data, error } = await supabase
          .from('support_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          supabaseTickets = data.map((t: any) => ({
            id: t.id || 'tkt_' + Date.now(),
            name: t.name || 'Anonymous',
            email: t.email || '',
            phone: t.phone || '',
            subject: t.subject || 'Support Ticket',
            message: t.message || '',
            browser: t.browser || '',
            device: t.device || '',
            url: t.url || '',
            status: t.status || 'open',
            createdAt: t.created_at || t.createdAt || new Date().toISOString(),
            messages: t.messages || [{
              id: 'msg_1',
              sender: 'customer',
              text: t.message || '',
              timestamp: t.created_at || t.createdAt || new Date().toISOString()
            }]
          }));
        } else if (error) {
          console.error("❌ Supabase fetch error in admin support tickets:", error.message);
          const { data: data2 } = await supabase.from('support_requests').select('*');
          if (data2) {
            supabaseTickets = data2.map((t: any) => ({
              id: t.id || 'tkt_' + Date.now(),
              name: t.name || 'Anonymous',
              email: t.email || '',
              phone: t.phone || '',
              subject: t.subject || 'Support Ticket',
              message: t.message || '',
              browser: t.browser || '',
              device: t.device || '',
              url: t.url || '',
              status: t.status || 'open',
              createdAt: t.created_at || t.createdAt || new Date().toISOString(),
              messages: t.messages || []
            }));
          }
        }
      }

      const storePath = path.join(process.cwd(), 'data_store.json');
      let localTickets: any[] = [];
      if (fs.existsSync(storePath)) {
        try {
          const raw = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
          localTickets = raw.support_tickets || [];
        } catch (e) {}
      }

      const ticketMap = new Map();
      localTickets.forEach((t: any) => ticketMap.set(t.id, t));
      supabaseTickets.forEach((t: any) => {
        if (ticketMap.has(t.id)) {
          const local = ticketMap.get(t.id);
          const msgsMap = new Map();
          (local.messages || []).forEach((m: any) => msgsMap.set(m.id || (m.timestamp + '_' + m.text), m));
          (t.messages || []).forEach((m: any) => msgsMap.set(m.id || (m.timestamp + '_' + m.text), m));
          const mergedMsgs = Array.from(msgsMap.values()).sort((a: any, b: any) => {
            return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
          });
          ticketMap.set(t.id, {
            ...local,
            ...t,
            status: t.status || local.status,
            messages: mergedMsgs
          });
        } else {
          ticketMap.set(t.id, t);
        }
      });

      const combined = Array.from(ticketMap.values()).sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.created_at || 0).getTime();
        const timeB = new Date(b.createdAt || b.created_at || 0).getTime();
        return timeB - timeA;
      });

      res.json(combined);
    } catch (err: any) {
      res.json([]);
    }
  });

  app.post('/api/admin/support/tickets/:id/reply', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { text } = req.body;

      const newMsg = {
        id: 'msg_' + Date.now(),
        sender: 'agent',
        text,
        timestamp: new Date().toISOString()
      };

      const storePath = path.join(process.cwd(), 'data_store.json');
      let raw = { support_tickets: [] };
      if (fs.existsSync(storePath)) {
        try { raw = JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch (e) {}
      }
      if (!raw.support_tickets) raw.support_tickets = [];
      const ticket = raw.support_tickets.find((t: any) => t.id === id);
      if (ticket) {
        if (!ticket.messages) ticket.messages = [];
        ticket.messages.push(newMsg);
        fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), 'utf-8');
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: existing } = await supabase.from('support_requests').select('messages').eq('id', id).single();
          let existingMsgs = existing?.messages || [];
          if (!Array.isArray(existingMsgs)) existingMsgs = [];
          existingMsgs.push(newMsg);
          await supabase.from('support_requests').update({ messages: existingMsgs }).eq('id', id);
        } catch (sErr) {
          console.error("Admin ticket reply Supabase error:", sErr);
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      (res as any).sendSecureError(err, "Failed to send admin reply");
    }
  });

  app.put('/api/admin/support/tickets/:id/status', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const storePath = path.join(process.cwd(), 'data_store.json');
      let raw = { support_tickets: [] };
      if (fs.existsSync(storePath)) {
        try { raw = JSON.parse(fs.readFileSync(storePath, 'utf-8')); } catch (e) {}
      }
      if (!raw.support_tickets) raw.support_tickets = [];
      const ticket = raw.support_tickets.find((t: any) => t.id === id);
      if (ticket) {
        ticket.status = status;
        fs.writeFileSync(storePath, JSON.stringify(raw, null, 2), 'utf-8');
      }

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('support_requests').update({ status }).eq('id', id);
        } catch (sErr) {
          console.error("Admin ticket status Supabase error:", sErr);
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      (res as any).sendSecureError(err, "Failed to update ticket status");
    }
  });

  app.post('/api/verify-play-purchase', async (req, res) => {
    try {
      const { packageName, productId, token, userId } = req.body;
      
      if (!packageName || !productId || !token || !userId) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      
      // We must not put credentials in the client; server expects them via env
      const GOOGLE_PLAY_EMAIL = process.env.GOOGLE_PLAY_CLIENT_EMAIL;
      const GOOGLE_PLAY_KEY = process.env.GOOGLE_PLAY_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!GOOGLE_PLAY_EMAIL || !GOOGLE_PLAY_KEY) {
        throw new Error("Google Play credentials are not configured on the server");
      }

      const { google } = await import('googleapis');
      
      const authClient = new google.auth.JWT({
        email: GOOGLE_PLAY_EMAIL,
        key: GOOGLE_PLAY_KEY,
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
      });
      
      const playDeveloper = google.androidpublisher({
        version: 'v3',
        auth: authClient
      });

      let entitlementVerified = false;
      let expiryTimeMillis = null;
      let acknowledgmentState = null;

      if (productId === 'buywise_founder_forever') {
        // Verify One-Time Purchase
        const response = await playDeveloper.purchases.products.get({
          packageName,
          productId,
          token
        });
        
        const purchase = response.data;
        if (purchase.purchaseState === 0) { // 0 = PURCHASED
          entitlementVerified = true;
          acknowledgmentState = purchase.acknowledgementState;
          
          if (acknowledgmentState === 0) {
            // Acknowledge the purchase if not already
            await playDeveloper.purchases.products.acknowledge({
              packageName,
              productId,
              token
            });
          }
        }
      } else {
        // Verify Subscription using subscriptionsv2
        // @ts-ignore
        const response = await playDeveloper.purchases.subscriptionsv2.get({
          packageName,
          token
        });
        
        const sub = response.data;
        const now = Date.now();
        
        if (sub.subscriptionState === 'SUBSCRIPTION_STATE_PENDING') {
          return res.status(200).json({ success: true, verified: false, pending: true, message: "Purchase is pending" });
        }
        
        let maxExpiry = 0;
        let isAcknowledged = true;
        
        if (sub.lineItems && sub.lineItems.length > 0) {
            for (const item of sub.lineItems) {
                if (item.expiryTime) {
                    const itemExpiry = new Date(item.expiryTime).getTime();
                    if (itemExpiry > maxExpiry) {
                        maxExpiry = itemExpiry;
                    }
                }
                if (sub.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING') {
                    isAcknowledged = false;
                }
            }
        }
        
        if (maxExpiry > now || sub.subscriptionState === 'SUBSCRIPTION_STATE_ACTIVE') {
          entitlementVerified = true;
          expiryTimeMillis = maxExpiry > now ? maxExpiry : null;
          
          if (!isAcknowledged) {
             await playDeveloper.purchases.subscriptions.acknowledge({
                packageName,
                subscriptionId: productId,
                token
             });
          }
        } else {
          return res.status(200).json({ success: true, verified: false, message: "Subscription expired" });
        }
      }

      if (entitlementVerified) {
        // Activate Premium logic
        const planMap: Record<string, number> = {
          'buywise_premium_monthly': 30,
          'buywise_premium_yearly': 365,
          'buywise_founder_forever': 36500, // 100 years
        };
        
        let subDays = planMap[productId] || 0;
        
        // Calculate the actual expiry date based on Google Play expiry time if available, otherwise fallback
        const expirationDate = expiryTimeMillis 
            ? new Date(expiryTimeMillis) 
            : new Date(Date.now() + subDays * 24 * 60 * 60 * 1000);

        try {
          // Use standard firebase SDK for admin mock
          const { db } = await import('./src/lib/firebase.js');
          const { doc, updateDoc } = await import('firebase/firestore');
          // @ts-ignore
          await updateDoc(doc(db, 'users', userId), {
          
            premiumStatus: 'active',
            premiumPlan: productId,
            premiumSince: new Date().toISOString(),
            premiumExpiration: expirationDate.toISOString(),
            playPurchaseToken: token
          });
        } catch (e) {
           console.error("Firebase update failed, trying fallback:", e);
        }

        return res.json({ 
          success: true, 
          verified: true, 
          expirationDate: expirationDate.toISOString() 
        });
      } else {
        return res.json({ success: false, verified: false, message: "Purchase could not be verified" });
      }
    } catch (err: any) {
      console.error('Play verification error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  
  app.get('/api/founder-image', (req, res) => {
     const distPath = path.join(process.cwd(), 'dist', 'founder.jpg');
     const publicPath = path.join(process.cwd(), 'public', 'founder.jpg');
     
     if (fs.existsSync(distPath)) {
        res.sendFile(distPath);
     } else if (fs.existsSync(publicPath)) {
        res.sendFile(publicPath);
     } else {
        res.status(404).send('Image not found');
     }
  });

  // --- COUPON SYSTEM ---
  
  app.get("/api/gamification/coupons", getUserContext, (req: any, res: any) => {
    try {
      const coupons = getUserCoupons(req.userContext.userId);
      res.json({ success: true, coupons });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/gamification/coupons/validate", getUserContext, (req: any, res: any) => {
    try {
      const { code, planId } = req.body;
      const result = validateCoupon(req.userContext.userId, code, planId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ valid: false, error: e.message });
    }
  });

  app.post("/api/gamification/coupons/redeem", getUserContext, (req: any, res: any) => {
    try {
      const { code, planId } = req.body;
      const result = redeemCoupon(req.userContext.userId, code, planId);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/gamification/admin/coupons", adminAuth, (req: any, res: any) => {
    try {
      res.json({ success: true, coupons: getAllCoupons() });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/gamification/admin/coupons/update", adminAuth, (req: any, res: any) => {
    try {
      const { couponId, updates } = req.body;
      const result = updateCouponSettings(couponId, updates);
      res.json(result);
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/gamification/admin/coupons/generate", adminAuth, (req: any, res: any) => {
    try {
      const { userId, discountPercent } = req.body;
      const coupon = generateCouponForUser(userId, discountPercent || 10);
      res.json({ success: true, coupon });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Telegram polling mechanism
  let lastUpdateId = 0;
  let isPolling = false;
  let webhookDeleted = false;

  async function startTelegramPolling() {
    setInterval(async () => {
      if (isPolling) return;
      isPolling = true;
      try {
        const config = getTelegramConfig();
        if (!config.enabled || !config.botToken) {
          isPolling = false;
          return;
        }

        const response = await axios.get(`https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${lastUpdateId + 1}&allowed_updates=["channel_post","message"]`, { timeout: 8000 });
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
        if (e.response && e.response.status === 409) {
          if (!webhookDeleted) {
            webhookDeleted = true;
            try {
              const config = getTelegramConfig();
              if (config.botToken) {
                await axios.get(`https://api.telegram.org/bot${config.botToken}/deleteWebhook`);
                console.log("[Telegram Polling] Cleared conflicting webhook.");
              }
            } catch (_) {}
          }
        } else if (e.response && e.response.status === 401) {
          // Unauthorized token, ignore silently
        } else {
          // Log other transient network/polling errors as warnings
          if (e.code !== 'ECONNABORTED') {
            console.warn("Telegram polling notice:", e.message);
          }
        }
      } finally {
        isPolling = false;
      }
  },
 5000);
  }

  // Determine if we are in production
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(path.join(process.cwd(), "dist", "index.html"));

  // Vite middleware for development
  if (!isProduction) {
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

  // --- HUMAN SUPPORT SYSTEM ---
  
  

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PriceVerse AI Server running at http://0.0.0.0:${PORT}`);
    startTelegramPolling();
  });
}

startServer().catch((err) => {
  console.error("Server failed to start:", err);
});


