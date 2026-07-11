var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_path2 = __toESM(require("path"), 1);
var import_axios = __toESM(require("axios"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_fs2 = __toESM(require("fs"), 1);
var import_helmet = __toESM(require("helmet"), 1);

// src/server/gamificationDb.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DB_FILE = import_path.default.join(process.cwd(), "data_store.json");
var PRODUCT_IMAGES = {
  "deal_iphone_15": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60",
  "deal_macbook_air": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60",
  "deal_sony_xm5": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60",
  "deal_rog_ally": "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=500&auto=format&fit=crop&q=60",
  "deal_oneplus_ce4": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60",
  "deal_nike_air": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
  "deal_boat_ion": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60",
  "deal_dyson_v12": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&auto=format&fit=crop&q=60",
  "deal_prestige_kettle": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60",
  "deal_tea_gold": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&auto=format&fit=crop&q=60",
  "deal_ps5_slim": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=60",
  "deal_casio_watch": "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&auto=format&fit=crop&q=60",
  "deal_under_500_bottle": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60",
  "deal_under_1000_tshirt": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60"
};
var INITIAL_DEALS = [
  {
    id: "deal_samsung_s24_ultra",
    title: "Samsung S24 Ultra",
    category: "mobiles",
    oldPrice: 129999,
    newPrice: 99999,
    discountPercent: 23,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=samsungs24",
    source: "Amazon.in",
    link: "https://amazon.in/dp/B0CSYF8Z98",
    isBestSeller: true,
    isEditorPick: true,
    isFlashDeal: true,
    views: 125,
    saves: 45,
    purchases: 12,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    timeRemaining: "12h 00m"
  }
];
var INITIAL_PROFILES = {
  "user_top_1": {
    userId: "user_top_1",
    email: "aman.kapoor@gmail.com",
    name: "Aman Kapoor",
    coins: 1450,
    referralCode: "AMAN145",
    referredBy: null,
    searchesCount: 452,
    totalSaved: 48900,
    lastSearchDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    lastLoginDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    streakCount: 42,
    lastStreakCheckDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    achievements: ["first_search", "first_referral", "100_searches", "premium_purchase", "saved_1000", "saved_10000", "streak_3", "streak_7", "streak_30"],
    notificationsEnabled: true,
    notificationPreferences: { morning: true, afternoon: false, evening: true },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1e3).toISOString()
  },
  "user_top_2": {
    userId: "user_top_2",
    email: "priya.verma@yahoo.com",
    name: "Priya Verma",
    coins: 1120,
    referralCode: "PRIYA88",
    referredBy: null,
    searchesCount: 321,
    totalSaved: 32100,
    lastSearchDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    lastLoginDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    streakCount: 25,
    lastStreakCheckDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    achievements: ["first_search", "first_referral", "100_searches", "saved_1000", "saved_10000", "streak_3", "streak_7"],
    notificationsEnabled: true,
    notificationPreferences: { morning: true, afternoon: true, evening: true },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString()
  },
  "user_top_3": {
    userId: "user_top_3",
    email: "ritesh.sharma@gmail.com",
    name: "Ritesh Sharma",
    coins: 980,
    referralCode: "RITESH3",
    referredBy: null,
    searchesCount: 210,
    totalSaved: 21400,
    lastSearchDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    lastLoginDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    streakCount: 18,
    lastStreakCheckDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    achievements: ["first_search", "first_referral", "100_searches", "saved_1000", "saved_10000", "streak_3", "streak_7"],
    notificationsEnabled: false,
    notificationPreferences: { morning: false, afternoon: false, evening: false },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1e3).toISOString()
  },
  "user_top_4": {
    userId: "user_top_4",
    email: "neha.goel@rediffmail.com",
    name: "Neha Goel",
    coins: 740,
    referralCode: "NEHA740",
    referredBy: null,
    searchesCount: 154,
    totalSaved: 14200,
    lastSearchDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    lastLoginDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    streakCount: 14,
    lastStreakCheckDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    achievements: ["first_search", "first_referral", "100_searches", "saved_1000", "saved_10000", "streak_3", "streak_7"],
    notificationsEnabled: true,
    notificationPreferences: { morning: true, afternoon: false, evening: true },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1e3).toISOString()
  },
  "user_top_5": {
    userId: "user_top_5",
    email: "vikram.singh@gmail.com",
    name: "Vikram Singh",
    coins: 520,
    referralCode: "VIKRAM5",
    referredBy: null,
    searchesCount: 95,
    totalSaved: 8500,
    lastSearchDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    lastLoginDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    streakCount: 9,
    lastStreakCheckDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    achievements: ["first_search", "saved_1000", "streak_3", "streak_7"],
    notificationsEnabled: true,
    notificationPreferences: { morning: true, afternoon: false, evening: false },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1e3).toISOString()
  }
};
var INITIAL_REVIEWS = (() => {
  const base = [];
  const firstNames = ["Rahul", "Sneha", "Vikram", "Pooja", "Arjun", "Tanya", "Rohan", "Meera", "Kavya", "Deepika", "Suresh", "Aditya", "Nisha", "Aman", "Priya"];
  const lastNames = ["Sharma", "Verma", "Patel", "Singh", "Reddy", "Nair", "Das", "Rao", "Iyer", "Chawla", "Kapoor"];
  const comments = [
    "Absolutely game-changing shopping app! I saved nearly \u20B94,500 on my iPhone 15 using the real-time competitor price comparison. Highly recommended!",
    "The interactive 3D product viewer is incredible! It let me inspect the camera bump and port alignments of the phone before purchasing. Unbelievably high fidelity.",
    "Using the flight tracking tool, I planned my trip from Delhi to Mumbai and snagged flights at the lowest rate in INR. Excellent utility integrations.",
    "The interface is gorgeous! Extremely seamless search engine. Love how the gamified system rewards coins for just scanning barcodes of local groceries.",
    "A magnificent super app! Handled my trip route building from Bengaluru to Goa with custom hotel trackers. Fully offline-capable database is so fast.",
    "The barcode scanner works instantly! Scanned a detergent bottle and saved \u20B980 comparing Amazon and Reliance Digital prices. Fantastic stuff.",
    "Excellent deal updates in the trending feed. Secured a kettle for \u20B9650 less than the standard market retail price.",
    "I used the dynamic price history tracker to see if the Sony headphones discount was genuine or inflated. Turns out, it's at its lowest-ever price!",
    "Redeemed the Coins Legend custom profile badge today! It looks exceptionally clean next to my name. Incredible UI work.",
    "As a budget traveler, the integrated route finder combined with smart local price scanner saves me hours of manual search. Highly efficient app.",
    "The dark mode slate theme is so comfortable for night-time comparison shopping. Found an amazing tablet discount within 2 minutes.",
    "Highly interactive! Sending coins to my friend was instant. Looking forward to hitting a 30-day streak to claim the major coin bonus.",
    "BuyWise has replaced multiple shopping apps on my phone. The real-time flight tracking comparison operates very fast and accurately.",
    "Amazing super-app that does it all. Sourcing real-time prices makes sure I am never overpaying at retail counters ever again.",
    "Using the price drop alerts has been a lifesaver. Saved \u20B91,200 on an air purifier. Truly a masterpiece of utility design.",
    "Very accurate barcode scanner database. Instantly detects most FMCG goods sold in supermarkets. Saves serious money.",
    "I love the clean typography, intuitive menus, and instantaneous response. The best price-tracking ecosystem available in India.",
    "Verified prices at three physical malls versus this app and saved thousands. Real-time sourcing operates accurately.",
    "The support assistant resolved my query immediately. Love the premium membership features, totally ads-free, elite performance.",
    "Dynamic price tracker is extremely reliable. Got automated alerts on telegram/discord setup, very well thought-out developer API.",
    "Premium service at its best! Sourcing prices from Amazon, Flipkart, and Croma simultaneously in milliseconds is an incredible engineering feat.",
    "Saved money on standard electronics easily. The clean UX makes comparison a pleasure rather than a chore.",
    "Excellent gamification logic! Daily login rewards are exciting and encourage regular price Sniping.",
    "The offline capability was handy during my trip. Truly robust architecture and lightning-fast searching.",
    "Splendid experience! The customer support works extremely fast. Totally recommended."
  ];
  for (let i = 1; i <= 200; i++) {
    const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    const rating = Math.random() > 0.85 ? 4 : 5;
    base.push({
      id: "rev_" + i,
      userId: "user_rev_" + i,
      userName: fname + " " + lname,
      userEmail: fname.toLowerCase() + "." + lname.toLowerCase() + "@gmail.com",
      rating,
      comment,
      coinsEarned: 15,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1e3)).toISOString()
    });
  }
  return base;
})();
var dbData = {
  profiles: { ...INITIAL_PROFILES },
  transactions: [],
  referrals: [],
  deals: INITIAL_DEALS.map((deal) => ({
    ...deal,
    thumbnail: PRODUCT_IMAGES[deal.id] || deal.thumbnail
  })),
  publicStats: {
    totalSearches: 41258,
    totalUsers: 14502,
    productsCompared: 92450,
    priceAlertsTriggered: 3512,
    dealsFoundToday: 485,
    activePremiumUsers: 242,
    totalSavedAmount: 4598140
  },
  bannedUsers: [],
  reviews: [...INITIAL_REVIEWS],
  scans: [
    {
      id: "scan_init_1",
      userId: "user_top_1",
      userEmail: "aman.kapoor@gmail.com",
      userName: "Aman Kapoor",
      barcode: "8901058002418",
      productName: "Sony WH-1000XM5 Noise Cancelling Headphones",
      category: "electronics",
      brand: "Sony",
      lowestPrice: 24990,
      highestPrice: 29990,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1e3).toISOString()
    },
    {
      id: "scan_init_2",
      userId: "user_top_2",
      userEmail: "priya.verma@gmail.com",
      userName: "Priya Verma",
      barcode: "194253388741",
      productName: "Apple iPhone 15 Pro (128GB)",
      category: "electronics",
      brand: "Apple",
      lowestPrice: 119900,
      highestPrice: 134900,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1e3).toISOString()
    }
  ]
};
function loadDatabase() {
  try {
    if (import_fs.default.existsSync(DB_FILE)) {
      const content = import_fs.default.readFileSync(DB_FILE, "utf-8");
      const loaded = JSON.parse(content);
      const loadedDeals = loaded.deals && loaded.deals.length > 0 ? loaded.deals : [...INITIAL_DEALS];
      const mappedDeals = loadedDeals.map((deal) => ({
        ...deal,
        thumbnail: PRODUCT_IMAGES[deal.id] || deal.thumbnail
      }));
      dbData = {
        profiles: { ...INITIAL_PROFILES, ...loaded.profiles },
        transactions: loaded.transactions || [],
        referrals: loaded.referrals || [],
        deals: mappedDeals,
        publicStats: loaded.publicStats || { ...dbData.publicStats },
        bannedUsers: loaded.bannedUsers || [],
        reviews: loaded.reviews && loaded.reviews.length >= INITIAL_REVIEWS.length ? loaded.reviews : [...loaded.reviews || [], ...INITIAL_REVIEWS.filter((ir) => !(loaded.reviews || []).find((r) => r.id === ir.id))],
        scans: loaded.scans || [],
        affiliateSettings: loaded.affiliateSettings || void 0,
        telegramConfig: loaded.telegramConfig || void 0
      };
      if (dbData.affiliateSettings && dbData.affiliateSettings.stores && dbData.affiliateSettings.stores.amazon) {
        dbData.affiliateSettings.stores.amazon.tag = "buywiseind0f8-21";
      }
      console.log("Database successfully loaded from with product photos mapped,", DB_FILE);
    } else {
      saveDatabase();
    }
  } catch (e) {
    console.error("Failed to load gamification database:", e.message);
  }
}
function saveDatabase() {
  try {
    const dir = import_path.default.dirname(DB_FILE);
    if (!import_fs.default.existsSync(dir)) {
      import_fs.default.mkdirSync(dir, { recursive: true });
    }
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save gamification database:", e.message);
  }
}
loadDatabase();
function getPublicStats() {
  const currentHour = (/* @__PURE__ */ new Date()).getHours();
  const incrementSaved = Math.floor(Math.random() * 8) + 2;
  const incrementSearches = Math.random() > 0.7 ? 1 : 0;
  dbData.publicStats.totalSavedAmount += incrementSaved;
  dbData.publicStats.totalSearches += incrementSearches;
  dbData.publicStats.productsCompared += incrementSearches * (Math.floor(Math.random() * 3) + 2);
  if (Math.random() > 0.95) {
    dbData.publicStats.priceAlertsTriggered += 1;
    dbData.publicStats.totalUsers += Math.random() > 0.9 ? 1 : 0;
  }
  if (incrementSaved > 0 || incrementSearches > 0) {
    saveDatabase();
  }
  return {
    ...dbData.publicStats,
    totalSavings: dbData.publicStats.totalSavedAmount
  };
}
function getOrCreateProfile(userId, email, name) {
  let profile = dbData.profiles[userId];
  if (!profile) {
    const prefix = name ? name.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "BW";
    const randNum = Math.floor(100 + Math.random() * 900);
    const referralCode = `${prefix}${randNum}`;
    profile = {
      userId,
      email,
      name: name || "Anonymous User",
      coins: 0,
      referralCode,
      referredBy: null,
      searchesCount: 0,
      totalSaved: 0,
      lastSearchDate: null,
      lastLoginDate: null,
      streakCount: 0,
      lastStreakCheckDate: null,
      achievements: [],
      notificationsEnabled: true,
      notificationPreferences: { morning: true, afternoon: true, evening: true },
      bannedReferrals: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      activeBadge: null,
      lastSpinDate: null,
      completedMissions: []
    };
    dbData.profiles[userId] = profile;
    dbData.publicStats.totalUsers += 1;
    saveDatabase();
  } else {
    if (name && profile.name !== name) {
      profile.name = name;
      saveDatabase();
    }
  }
  if (!profile.isPremium && !profile.premiumExpiry) {
    profile.isPremium = true;
    const now = /* @__PURE__ */ new Date();
    now.setDate(now.getDate() + 3);
    profile.premiumExpiry = now.toISOString();
    saveDatabase();
    console.log("Granted 3-day premium trial to [REDACTED]");
  }
  return profile;
}
function awardCoins(userId, amount, reason) {
  const profile = dbData.profiles[userId];
  if (!profile) throw new Error("Profile not found");
  profile.coins += amount;
  if (profile.coins < 0) profile.coins = 0;
  const transaction = {
    id: `txn_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
    userId,
    amount,
    reason,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbData.transactions.unshift(transaction);
  saveDatabase();
  return { coins: profile.coins, gained: amount, transaction };
}
function transferCoins(fromUserId, toUserId, amount) {
  if (fromUserId === toUserId) {
    return { success: false, message: "Self-transfers are not allowed" };
  }
  const fromProfile = dbData.profiles[fromUserId];
  const toProfile = dbData.profiles[toUserId];
  if (!fromProfile) return { success: false, message: "Sender profile not found" };
  if (!toProfile) return { success: false, message: "Recipient profile not found" };
  if (amount <= 0) return { success: false, message: "Transfer amount must be positive" };
  if (fromProfile.coins < amount) return { success: false, message: "Insufficient coins" };
  fromProfile.coins -= amount;
  toProfile.coins += amount;
  const txnId = `txn_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
  dbData.transactions.unshift({
    id: `${txnId}_out`,
    userId: fromUserId,
    amount: -amount,
    reason: `Transferred ${amount} coins to ${toProfile.name}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  dbData.transactions.unshift({
    id: `${txnId}_in`,
    userId: toUserId,
    amount,
    reason: `Received ${amount} coins from ${fromProfile.name}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  saveDatabase();
  return { success: true, message: `Successfully transferred ${amount} coins to ${toProfile.name}` };
}
function getTransactions(userId) {
  return dbData.transactions.filter((t) => t.userId === userId);
}
function checkLoginStreak(userId) {
  const profile = dbData.profiles[userId];
  if (!profile) return { coinsAwarded: 0, streak: 0, triggeredAchievements: [] };
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const lastLogin = profile.lastLoginDate;
  let coinsAwarded = 0;
  let triggeredAchievements = [];
  if (lastLogin === todayStr) {
    return { coinsAwarded: 0, streak: profile.streakCount, triggeredAchievements: [] };
  }
  profile.lastLoginDate = todayStr;
  if (!lastLogin) {
    profile.streakCount = 1;
    profile.lastStreakCheckDate = todayStr;
    const result = awardCoins(userId, 5, "Daily login reward");
    coinsAwarded += 5;
  } else {
    const lastLoginDate = new Date(lastLogin);
    const todayDate = new Date(todayStr);
    const diffTime = Math.abs(todayDate.getTime() - lastLoginDate.getTime());
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    if (diffDays === 1) {
      profile.streakCount += 1;
      profile.lastStreakCheckDate = todayStr;
      let streakBonus = 5;
      let streakReason = `Daily login (Streak: ${profile.streakCount} days)`;
      if (profile.streakCount === 3) {
        streakBonus += 15;
        streakReason += " + 3-Day Streak bonus!";
        triggeredAchievements.push("streak_3");
      } else if (profile.streakCount === 7) {
        streakBonus += 100;
        streakReason += " + 7-Day Streak mega bonus!";
        triggeredAchievements.push("streak_7");
      } else if (profile.streakCount === 15) {
        streakBonus += 50;
        streakReason += " + 15-Day Streak bonus!";
        triggeredAchievements.push("streak_15");
      } else if (profile.streakCount === 30) {
        streakBonus += 150;
        streakReason += " + 30-Day Streak elite bonus!";
        triggeredAchievements.push("streak_30");
      } else if (profile.streakCount === 90) {
        streakBonus += 300;
        streakReason += " + 90-Day Streak master bonus!";
        triggeredAchievements.push("streak_90");
      } else if (profile.streakCount === 365) {
        streakBonus += 1e3;
        streakReason += " + 365-Day Streak legendary bonus!";
        triggeredAchievements.push("streak_365");
      }
      awardCoins(userId, streakBonus, streakReason);
      coinsAwarded += streakBonus;
    } else if (diffDays > 1) {
      profile.streakCount = 1;
      profile.lastStreakCheckDate = todayStr;
      awardCoins(userId, 5, "Daily login reward (Streak reset)");
      coinsAwarded += 5;
    } else {
    }
  }
  triggeredAchievements.forEach((achId) => {
    unlockAchievement(userId, achId);
  });
  saveDatabase();
  return { coinsAwarded, streak: profile.streakCount, triggeredAchievements };
}
function recordSearch(userId, queryText) {
  const profile = dbData.profiles[userId];
  if (!profile) return { coinsAwarded: 0, searchesCount: 0, savedAmount: 0, unlockedAchievements: [] };
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let coinsAwarded = 0;
  let unlockedAchievements = [];
  profile.searchesCount += 1;
  const savedThisTime = Math.floor(50 + Math.random() * 400);
  profile.totalSaved += savedThisTime;
  if (profile.lastSearchDate !== todayStr) {
    profile.lastSearchDate = todayStr;
    awardCoins(userId, 2, "First search of the day bonus");
    coinsAwarded += 2;
  }
  if (profile.searchesCount % 10 === 0) {
    awardCoins(userId, 5, `10 Searches milestone bonus (${profile.searchesCount} searches completed)`);
    coinsAwarded += 5;
  }
  if (profile.searchesCount === 1) {
    if (unlockAchievement(userId, "first_search")) unlockedAchievements.push("first_search");
  }
  if (profile.searchesCount >= 100) {
    if (unlockAchievement(userId, "100_searches")) unlockedAchievements.push("100_searches");
  }
  if (profile.searchesCount >= 1e3) {
    if (unlockAchievement(userId, "1000_searches")) unlockedAchievements.push("1000_searches");
  }
  if (profile.totalSaved >= 1e3) {
    if (unlockAchievement(userId, "saved_1000")) unlockedAchievements.push("saved_1000");
  }
  if (profile.totalSaved >= 1e4) {
    if (unlockAchievement(userId, "saved_10000")) unlockedAchievements.push("saved_10000");
  }
  dbData.publicStats.totalSearches += 1;
  dbData.publicStats.productsCompared += 3;
  dbData.publicStats.totalSavedAmount += savedThisTime;
  saveDatabase();
  return { coinsAwarded, searchesCount: profile.searchesCount, savedAmount: savedThisTime, unlockedAchievements };
}
function submitReferralCode(friendId, referralCode) {
  const friendProfile = dbData.profiles[friendId];
  if (!friendProfile) return { success: false, message: "Friend profile not found" };
  if (friendProfile.referredBy) {
    return { success: false, message: "You have already been referred." };
  }
  const referrerProfile = Object.values(dbData.profiles).find((p) => p.referralCode.toUpperCase() === referralCode.toUpperCase());
  if (!referrerProfile) {
    return { success: false, message: "Invalid referral code." };
  }
  if (referrerProfile.userId === friendId) {
    return { success: false, message: "Self-referrals are strictly prohibited." };
  }
  const isDuplicate = dbData.referrals.some((r) => r.referredEmail === friendProfile.email && r.referrerId === referrerProfile.userId);
  if (isDuplicate) {
    return { success: false, message: "This email has already been referred." };
  }
  const referral = {
    id: `ref_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
    referrerId: referrerProfile.userId,
    referredId: friendId,
    referredEmail: friendProfile.email,
    referredName: friendProfile.name,
    status: "pending",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  friendProfile.referredBy = referrerProfile.userId;
  dbData.referrals.push(referral);
  saveDatabase();
  return { success: true, message: "Referral code applied successfully! Coins will activate after your first search.", referrerName: referrerProfile.name };
}
function checkAndCompleteReferral(friendId) {
  const referral = dbData.referrals.find((r) => r.referredId === friendId && r.status === "pending");
  if (!referral) return { triggered: false };
  const referrerProfile = dbData.profiles[referral.referrerId];
  const friendProfile = dbData.profiles[friendId];
  if (!referrerProfile || !friendProfile) return { triggered: false };
  if (referrerProfile.bannedReferrals || dbData.bannedUsers.includes(referral.referrerId)) {
    referral.status = "banned";
    saveDatabase();
    return { triggered: false };
  }
  referral.status = "successful";
  awardCoins(referral.referrerId, 50, `Referral bonus for inviting ${friendProfile.name}`);
  awardCoins(friendId, 20, `Referral bonus for joining via ${referrerProfile.name}'s link`);
  unlockAchievement(referral.referrerId, "first_referral");
  const succCount = dbData.referrals.filter((r) => r.referrerId === referral.referrerId && r.status === "successful").length;
  if (succCount >= 5) {
    unlockAchievement(referral.referrerId, "referral_master");
  }
  saveDatabase();
  return { triggered: true, referrerName: referrerProfile.name, coinsEarned: 20 };
}
function getReferralStats(userId) {
  const profile = dbData.profiles[userId];
  if (!profile) return null;
  const userRefs = dbData.referrals.filter((r) => r.referrerId === userId);
  const total = userRefs.length;
  const successful = userRefs.filter((r) => r.status === "successful").length;
  const pending = userRefs.filter((r) => r.status === "pending").length;
  const coinsEarned = successful * 50;
  return {
    referralCode: profile.referralCode,
    referralLink: `https://buywise.app/ref/${profile.referralCode}`,
    total,
    successful,
    pending,
    coinsEarned,
    history: userRefs.map((r) => ({
      name: r.referredName,
      email: r.referredEmail,
      status: r.status,
      timestamp: r.timestamp,
      reward: r.status === "successful" ? "+50 Coins" : r.status === "pending" ? "Pending Search" : "No Reward (Banned)"
    }))
  };
}
function getLeaderboard(metric) {
  const list = Object.values(dbData.profiles).map((p) => {
    const refsCount = dbData.referrals.filter((r) => r.referrerId === p.userId && r.status === "successful").length;
    return {
      userId: p.userId,
      name: p.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`,
      coins: p.coins,
      referralsCount: refsCount,
      searchesCount: p.searchesCount,
      savingsCount: p.totalSaved
    };
  });
  list.sort((a, b) => {
    if (metric === "coins") return b.coins - a.coins;
    if (metric === "referrals") return b.referralsCount - a.referralsCount;
    if (metric === "searches") return b.searchesCount - a.searchesCount;
    return b.savingsCount - a.savingsCount;
  });
  return list.slice(0, 100).map((user, idx) => {
    const rank = idx + 1;
    let badge = null;
    if (rank === 1) badge = "\u{1F3C6} Champion";
    else if (rank === 2) badge = "\u{1F948} Elite Tracker";
    else if (rank === 3) badge = "\u{1F949} Deal Sniper";
    else if (rank <= 10) badge = "\u{1F48E} Platinum Tracker";
    else if (rank <= 25) badge = "\u2B50 Gold Hunter";
    else if (rank <= 50) badge = "\u{1F396}\uFE0F Price Master";
    const fullProfile = dbData.profiles[user.userId];
    if (fullProfile && fullProfile.activeBadge) {
      badge = badge ? `${badge} | ${fullProfile.activeBadge}` : fullProfile.activeBadge;
    }
    return {
      rank,
      ...user,
      badge
    };
  });
}
var ACHIEVEMENTS = [
  { id: "first_search", title: "First Search", description: "Completed your first price comparison search", icon: "\u{1F50D}", coinsReward: 10 },
  { id: "first_referral", title: "First Referral", description: "Successfully invited your first friend to BuyWise", icon: "\u{1F91D}", coinsReward: 50 },
  { id: "100_searches", title: "Centurion Explorer", description: "Completed 100 price comparison searches", icon: "\u{1F4AF}", coinsReward: 150 },
  { id: "1000_searches", title: "Millennium Legend", description: "Completed 1000 price comparison searches", icon: "\u{1F680}", coinsReward: 500 },
  { id: "premium_purchase", title: "Premium Pioneer", description: "Subscribed to a BuyWise Premium Membership", icon: "\u{1F451}", coinsReward: 100 },
  { id: "saved_1000", title: "Thrifty Saver", description: "Saved \u20B91,000 on purchase price comparisons", icon: "\u{1F4B0}", coinsReward: 50 },
  { id: "saved_10000", title: "Arbitrage Maestro", description: "Saved \u20B910,000 on purchase price comparisons", icon: "\u{1F3E6}", coinsReward: 250 },
  { id: "streak_3", title: "3-Day Fire", description: "Used BuyWise for 3 consecutive days", icon: "\u{1F525}", coinsReward: 15 },
  { id: "streak_7", title: "7-Day Week Warrior", description: "Used BuyWise for 7 consecutive days", icon: "\u26A1", coinsReward: 100 },
  { id: "streak_30", title: "Monthly Devotee", description: "Used BuyWise for 30 consecutive days", icon: "\u{1F4C5}", coinsReward: 300 },
  { id: "referral_master", title: "Referral Master", description: "Invited 5 or more friends who completed searches", icon: "\u{1F31F}", coinsReward: 250 },
  { id: "deal_hunter", title: "Deal Hunter", description: "Saved or shared 10 trending or daily deals", icon: "\u{1F3AF}", coinsReward: 50 }
];
function unlockAchievement(userId, achievementId) {
  const profile = dbData.profiles[userId];
  if (!profile) return false;
  if (profile.achievements.includes(achievementId)) {
    return false;
  }
  const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!def) return false;
  profile.achievements.push(achievementId);
  awardCoins(userId, def.coinsReward, `Unlocked achievement: ${def.title}`);
  saveDatabase();
  return true;
}
function redeemReward(userId, rewardType) {
  const profile = dbData.profiles[userId];
  if (!profile) return { success: false, message: "Profile not found", coinsRemaining: 0 };
  let cost = 0;
  let rewardMessage = "";
  if (rewardType === "discount") {
    cost = 100;
    rewardMessage = "Premium 50% discount coupon: BUYWISE50. Paste in Support chat to apply!";
  } else if (rewardType === "trial") {
    cost = 250;
    rewardMessage = "3-Day Premium Free Trial activated! Go to /premium to see status.";
  } else if (rewardType === "deal") {
    cost = 50;
    rewardMessage = "Unlocked Exclusive Secret Deal! Check your email for details.";
  } else if (rewardType === "badge") {
    cost = 150;
    rewardMessage = "Coins Legend custom profile badge unlocked!";
    profile.activeBadge = "\u{1F48E} COINS LEGEND";
  } else if (rewardType === "mystery") {
    cost = 200;
    const isJackpot = Math.random() > 0.9;
    if (isJackpot) {
      profile.isPremium = true;
      profile.premiumExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
      rewardMessage = "JACKPOT! You won 1-Month Premium from the Mystery Box!";
    } else {
      const bonusCoins = Math.floor(Math.random() * 300);
      profile.coins += bonusCoins;
      rewardMessage = `Mystery Box opened! You found ${bonusCoins} coins inside.`;
    }
  } else if (rewardType === "avatar") {
    cost = 300;
    rewardMessage = "Premium Animated Avatar unlocked! Go to profile to equip.";
  } else {
    return { success: false, message: "Invalid reward type", coinsRemaining: profile.coins };
  }
  if (profile.coins < cost) {
    return { success: false, message: `Insufficient coins. This reward costs ${cost} coins.`, coinsRemaining: profile.coins };
  }
  awardCoins(userId, -cost, `Redeemed reward: ${rewardType}`);
  saveDatabase();
  return { success: true, message: rewardMessage, coinsRemaining: profile.coins };
}
function adminAction(action, payload) {
  const { userId, amount, reason, referralId, dealId, stats, notification } = payload;
  if (action === "add_coins") {
    return awardCoins(userId, Number(amount), reason || "Admin discretionary bonus");
  }
  if (action === "remove_coins") {
    return awardCoins(userId, -Number(amount), reason || "Admin adjustment");
  }
  if (action === "ban_referral") {
    const ref = dbData.referrals.find((r) => r.id === referralId);
    if (ref) {
      ref.status = "banned";
      const referrer = dbData.profiles[ref.referrerId];
      if (referrer) {
        referrer.bannedReferrals = true;
        awardCoins(ref.referrerId, -50, `Banned fake referral docking`);
      }
      saveDatabase();
      return { success: true, message: "Referral banned and coins docked." };
    }
    return { success: false, message: "Referral not found." };
  }
  if (action === "feature_deal") {
    const deal = dbData.deals.find((d) => d.id === dealId);
    if (deal) {
      deal.isEditorPick = !deal.isEditorPick;
      saveDatabase();
      return { success: true, message: `Deal feature status toggled.` };
    }
    return { success: false, message: "Deal not found." };
  }
  if (action === "update_counter") {
    if (stats) {
      dbData.publicStats = { ...dbData.publicStats, ...stats };
      saveDatabase();
      return { success: true, message: "Public counter statistics updated successfully." };
    }
    return { success: false, message: "Missing stats payload." };
  }
  if (action === "trigger_notification") {
    return { success: true, message: `Broadcast notification successfully pushed to users: "${notification?.title || "Daily Best Deal"}"` };
  }
  return { success: false, message: "Unknown admin action" };
}
function getReviews() {
  return dbData.reviews || [];
}
function submitReview(userId, email, name, rating, comment) {
  const profile = getOrCreateProfile(userId, email, name);
  const rewardCoinsAmount = 15;
  const review = {
    id: `rev_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
    userId,
    userName: name || "Anonymous User",
    userEmail: email,
    rating,
    comment: comment.trim(),
    coinsEarned: rewardCoinsAmount,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (!dbData.reviews) {
    dbData.reviews = [];
  }
  dbData.reviews.unshift(review);
  awardCoins(userId, rewardCoinsAmount, "Submitted a detailed user review and app feedback");
  unlockAchievement(userId, "deal_hunter");
  saveDatabase();
  return {
    success: true,
    review,
    coinsAwarded: rewardCoinsAmount
  };
}
function recordBarcodeScan(scan) {
  if (!dbData.scans) {
    dbData.scans = [];
  }
  const profile = dbData.profiles[scan.userId];
  const scanCount = dbData.scans.filter((s) => s.userId === scan.userId).length;
  const coinsAwarded = 2;
  if (profile) {
    awardCoins(scan.userId, coinsAwarded, `Scanned barcode ${scan.barcode}: ${scan.productName}`);
  }
  const newScan = {
    id: `scan_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
    ...scan,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  dbData.scans.unshift(newScan);
  saveDatabase();
  return { coinsAwarded, scansCount: scanCount + 1 };
}
function getScanHistory(userId) {
  if (!dbData.scans) return [];
  return dbData.scans.filter((s) => s.userId === userId);
}
function getAllScans() {
  return dbData.scans || [];
}
function getDefaultAffiliateSettings() {
  return {
    stores: {
      amazon: { tag: process.env.AMAZON_ASSOCIATE_TAG || "buywiseind0f8-21", enabled: true, paramName: "tag" },
      flipkart: { tag: process.env.FLIPKART_AFFILIATE_ID || "buywise-flipkart-21", enabled: true, paramName: "affid" },
      croma: { tag: process.env.CROMA_TRACKING_ID || "buywise-croma-21", enabled: true, paramName: "clickId" },
      reliance: { tag: process.env.RELIANCE_TRACKING_ID || "buywise-reliance-21", enabled: true, paramName: "aff_id" },
      vijaysales: { tag: process.env.VIJAY_SALES_TRACKING_ID || "buywise-vijaysales-21", enabled: true, paramName: "vs_tag" },
      tatacliq: { tag: process.env.TATA_CLIQ_TRACKING_ID || "buywise-tatacliq-21", enabled: true, paramName: "tc_tag" },
      myntra: { tag: process.env.MYNTRA_TRACKING_ID || "buywise-myntra-21", enabled: true, paramName: "myntra_tag" },
      ajio: { tag: process.env.AJIO_TRACKING_ID || "buywise-ajio-21", enabled: true, paramName: "ajio_tag" }
    },
    clicks: {
      total: 350,
      byStore: { amazon: 154, flipkart: 112, croma: 34, reliance: 22, vijaysales: 12, tatacliq: 8, myntra: 5, ajio: 3 },
      byProduct: {
        "deal_iphone_15": { title: "Apple iPhone 15 Pro", clicks: 120 },
        "deal_macbook_air": { title: "Apple MacBook Air M3", clicks: 84 },
        "deal_sony_xm5": { title: "Sony WH-1000XM5 Headphones", clicks: 65 }
      },
      byCategory: { electronics: 210, mobiles: 80, laptops: 35, fashion: 15, home: 10 },
      dailyClicks: {
        "2026-06-21": 42,
        "2026-06-22": 48,
        "2026-06-23": 55,
        "2026-06-24": 62,
        "2026-06-25": 70,
        "2026-06-26": 68,
        "2026-06-27": 5
      },
      monthlyClicks: {
        "2026-05": 1120,
        "2026-06": 350
      }
    }
  };
}
function getDefaultTelegramConfig() {
  return {
    channelUsername: process.env.TELEGRAM_CHANNEL_USERNAME || "@buywiseofficial",
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    enabled: true
  };
}
function getAffiliateSettings() {
  if (!dbData.affiliateSettings) {
    dbData.affiliateSettings = getDefaultAffiliateSettings();
    saveDatabase();
  }
  return dbData.affiliateSettings;
}
function getTelegramConfig() {
  if (!dbData.telegramConfig) {
    dbData.telegramConfig = getDefaultTelegramConfig();
    saveDatabase();
  }
  return dbData.telegramConfig;
}
function updateAffiliateSettings(stores) {
  const current = getAffiliateSettings();
  for (const storeName in stores) {
    if (current.stores[storeName]) {
      current.stores[storeName].tag = stores[storeName].tag;
      current.stores[storeName].enabled = stores[storeName].enabled;
      if (stores[storeName].paramName !== void 0) {
        current.stores[storeName].paramName = stores[storeName].paramName;
      }
    } else {
      current.stores[storeName] = {
        tag: stores[storeName].tag,
        enabled: stores[storeName].enabled,
        paramName: stores[storeName].paramName || "tag"
      };
    }
  }
  saveDatabase();
  return { success: true, settings: current };
}
function updateTelegramConfig(config) {
  const current = getTelegramConfig();
  current.channelUsername = config.channelUsername;
  current.botToken = config.botToken;
  current.enabled = config.enabled;
  saveDatabase();
  return { success: true, config: current };
}
function recordAffiliateClick(payload) {
  const settings = getAffiliateSettings();
  const storeName = payload.store.toLowerCase();
  settings.clicks.total += 1;
  if (!settings.clicks.byStore[storeName]) {
    settings.clicks.byStore[storeName] = 0;
  }
  settings.clicks.byStore[storeName] += 1;
  if (payload.productId) {
    const pId = payload.productId;
    if (!settings.clicks.byProduct[pId]) {
      settings.clicks.byProduct[pId] = { title: payload.productTitle || pId, clicks: 0 };
    }
    settings.clicks.byProduct[pId].clicks += 1;
  }
  const cat = payload.category || "electronics";
  if (!settings.clicks.byCategory[cat]) {
    settings.clicks.byCategory[cat] = 0;
  }
  settings.clicks.byCategory[cat] += 1;
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (!settings.clicks.dailyClicks[todayStr]) {
    settings.clicks.dailyClicks[todayStr] = 0;
  }
  settings.clicks.dailyClicks[todayStr] += 1;
  const currentMonth = todayStr.substring(0, 7);
  if (!settings.clicks.monthlyClicks[currentMonth]) {
    settings.clicks.monthlyClicks[currentMonth] = 0;
  }
  settings.clicks.monthlyClicks[currentMonth] += 1;
  saveDatabase();
  return { success: true, url: "" };
}
function addDealDirectly(deal) {
  const newDeal = {
    id: `deal_tele_${Date.now()}`,
    views: 0,
    saves: 0,
    purchases: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    ...deal
  };
  dbData.deals.unshift(newDeal);
  saveDatabase();
  return newDeal;
}
function spinWheel(userId) {
  const profile = dbData.profiles[userId];
  if (!profile) return { success: false, reward: "", coinsAwarded: 0, message: "Profile not found" };
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  if (profile.lastSpinDate === todayStr) {
    return { success: false, reward: "", coinsAwarded: 0, message: "You have already spun the wheel today!" };
  }
  profile.lastSpinDate = todayStr;
  const outcomes = [
    { type: "coins", amount: 10, label: "10 Coins", chance: 30 },
    { type: "coins", amount: 50, label: "50 Coins", chance: 30 },
    { type: "coins", amount: 100, label: "100 Coins", chance: 15 },
    { type: "coins", amount: 500, label: "500 Coins", chance: 5 },
    { type: "trial", amount: 0, label: "Premium Trial", chance: 5 },
    { type: "badge", amount: 0, label: "Lucky Badge", chance: 5 },
    { type: "coins", amount: 0, label: "Better Luck Tomorrow", chance: 10 }
  ];
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedReward = outcomes[outcomes.length - 1];
  for (const outcome of outcomes) {
    cumulative += outcome.chance;
    if (rand <= cumulative) {
      selectedReward = outcome;
      break;
    }
  }
  let message = "";
  if (selectedReward.type === "coins" && selectedReward.amount > 0) {
    awardCoins(userId, selectedReward.amount, "Spin to Win daily reward");
    message = `Congratulations! You won ${selectedReward.amount} Coins!`;
  } else if (selectedReward.type === "trial") {
    profile.isPremium = true;
    const now = /* @__PURE__ */ new Date();
    now.setDate(now.getDate() + 3);
    profile.premiumExpiry = now.toISOString();
    message = "Jackpot! You won a 3-Day Premium Trial!";
  } else if (selectedReward.type === "badge") {
    profile.activeBadge = "\u{1F340} LUCKY SPINNER";
    message = "Awesome! You won the exclusive Lucky Spinner badge!";
  } else {
    message = "Ah, no reward this time. Spin again tomorrow!";
  }
  saveDatabase();
  return {
    success: true,
    reward: selectedReward.label,
    coinsAwarded: selectedReward.amount,
    message
  };
}
function completeMission(userId, missionId) {
  const profile = dbData.profiles[userId];
  if (!profile) return { success: false, message: "Profile not found", coinsAwarded: 0 };
  if (!profile.completedMissions) {
    profile.completedMissions = [];
  }
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const uniqueMissionId = `${todayStr}_${missionId}`;
  if (profile.completedMissions.includes(uniqueMissionId)) {
    return { success: false, message: "Mission already completed today!", coinsAwarded: 0 };
  }
  let reward = 20;
  if (missionId.includes("weekly")) reward = 100;
  if (missionId.includes("monthly")) reward = 500;
  profile.completedMissions.push(uniqueMissionId);
  awardCoins(userId, reward, `Mission Completed: ${missionId.replace(/_/g, " ").toUpperCase()}`);
  saveDatabase();
  return {
    success: true,
    message: `Mission completed! You earned ${reward} Coins.`,
    coinsAwarded: reward
  };
}
function deleteUserProfile(userId) {
  if (!dbData.profiles[userId]) {
    return { success: false, message: "Profile not found" };
  }
  delete dbData.profiles[userId];
  if (dbData.transactions) {
    dbData.transactions = dbData.transactions.filter((t) => t.userId !== userId);
  }
  if (dbData.referrals) {
    dbData.referrals = dbData.referrals.filter((r) => r.referrerId !== userId && r.referredId !== userId);
  }
  if (dbData.scans) {
    dbData.scans = dbData.scans.filter((s) => s.userId !== userId);
  }
  if (dbData.reviews) {
    dbData.reviews = dbData.reviews.filter((r) => r.userId !== userId);
  }
  saveDatabase();
  return {
    success: true,
    message: "User gamification profile and all associated data deleted successfully."
  };
}

// server.ts
import_dotenv.default.config();
var cloudProjectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || "";
async function fetchMetadataProjectId() {
  if (!cloudProjectId) {
    try {
      const res = await import_axios.default.get("http://metadata.google.internal/computeMetadata/v1/project/project-id", {
        headers: { "Metadata-Flavor": "Google" },
        timeout: 1e3
      });
      if (res.data && typeof res.data === "string") {
        cloudProjectId = res.data.trim();
        console.log("Fetched Cloud Project ID from metadata server:", cloudProjectId);
      }
    } catch (e) {
      console.log("Could not fetch Project ID from metadata server (using fallback):", e.message);
    }
  }
}
fetchMetadataProjectId();
var geminiCache = {
  detect: {},
  extractFeatures: {},
  shopperPlan: {},
  shoppingAdvice: {},
  predictTrend: {},
  search: {}
};
function extractDirectUrl(urlStr) {
  if (!urlStr) return null;
  try {
    const urlObj = new URL(urlStr);
    for (const key of ["url", "q", "adurl", "r", "redirect", "dest", "destination"]) {
      const val = urlObj.searchParams.get(key);
      if (val && val.startsWith("http")) {
        const nested = extractDirectUrl(val);
        return nested || val;
      }
    }
  } catch (_) {
  }
  try {
    const dec = decodeURIComponent(urlStr);
    const matches = dec.match(/https?:\/\/[^\s"'><]+/g);
    if (matches) {
      for (const m of matches) {
        if (!m.includes("google.com") && !m.includes("serpapi.com") && !m.includes("googleadservices.com")) {
          return m;
        }
      }
    }
  } catch (_) {
  }
  return null;
}
function getAi() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }
  return new import_genai.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY.trim()
  });
}
function formatGeminiContents(messages) {
  const firstUserIdx = messages.findIndex((m) => m.sender === "user");
  if (firstUserIdx === -1) {
    return [];
  }
  const processed = messages.slice(firstUserIdx);
  const contents = [];
  for (const msg of processed) {
    const role = msg.sender === "user" ? "user" : "model";
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += "\n" + msg.text;
    } else {
      contents.push({
        role,
        parts: [{ text: msg.text }]
      });
    }
  }
  return contents;
}
async function resolveRedirect(urlStr) {
  try {
    const response = await import_axios.default.head(urlStr, {
      maxRedirects: 5,
      timeout: 5e3,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    return response.request?.res?.responseUrl || response.config?.url || urlStr;
  } catch (err) {
    try {
      const response = await import_axios.default.get(urlStr, {
        maxRedirects: 5,
        timeout: 5e3,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      return response.request?.res?.responseUrl || response.config?.url || urlStr;
    } catch (innerErr) {
      if (innerErr.response?.headers?.location) {
        const loc = innerErr.response.headers.location;
        return loc.startsWith("http") ? loc : new URL(loc, urlStr).toString();
      }
      return urlStr;
    }
  }
}
function cleanProductTitle(rawTitle) {
  let title = rawTitle;
  if (title.toLowerCase().startsWith("buy ")) {
    title = title.substring(4);
  }
  const suffixes = [
    /Online at Low Prices in India/i,
    /Online at Best Prices/i,
    /at Amazon\.in/i,
    /:\s*Amazon\.in/i,
    /-\s*Amazon\.in/i,
    /\|\s*Amazon\.in/i,
    /-\s*Flipkart\.com/i,
    /\|\s*Flipkart\.com/i,
    /Online at Flipkart/i
  ];
  for (const suffix of suffixes) {
    title = title.replace(suffix, "");
  }
  return title.trim();
}
async function getProductTitleFromUrl(urlStr) {
  const serpApiKey = process.env.SERP_API_KEY || "";
  try {
    console.log(`[URL Resolver] Querying SerpApi Google for URL: "${urlStr}"`);
    const response = await import_axios.default.get("https://serpapi.com/search", {
      params: { engine: "google", q: urlStr, api_key: serpApiKey, hl: "en", gl: "in" }
    });
    if (response.data && Array.isArray(response.data.organic_results) && response.data.organic_results.length > 0) {
      const rawTitle = response.data.organic_results[0].title;
      const cleaned = cleanProductTitle(rawTitle);
      console.log(`[URL Resolver] Successfully resolved URL to title: "${cleaned}" (raw: "${rawTitle}")`);
      return cleaned;
    }
  } catch (err) {
    console.warn(`[URL Resolver] SerpApi Google search failed for URL:`, err.message);
  }
  try {
    const urlObj = new URL(urlStr);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;
    const title = lastPart.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return title;
  } catch {
    return urlStr;
  }
}
async function startServer() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in the environment variables!");
    console.error("Please configure your GEMINI_API_KEY inside the .env file.");
    process.exit(1);
  }
  if (!process.env.SERP_API_KEY) {
    console.warn("WARNING: SERP_API_KEY is not configured. Google Search and Google Shopping scraping features will fall back to local intelligence and structured mock data.");
  }
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("WARNING: TELEGRAM_BOT_TOKEN is not configured. Telegram channel features and updates polling will be disabled.");
  }
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(
    (0, import_helmet.default)({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://*.google.com",
            "https://*.googleadservices.com"
          ],
          connectSrc: [
            "'self'",
            "https://*.supabase.co",
            "https://*.google.com",
            "https://api.telegram.org",
            "https://api.dicebear.com",
            "https://serpapi.com",
            "wss://*.supabase.co",
            "https://*.run.app",
            "https://ais-dev-*.run.app",
            "https://ais-pre-*.run.app"
          ],
          imgSrc: ["'self'", "data:", "blob:", "https://*", "http://*"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          frameSrc: ["'self'", "https://*.google.com", "https://*.googleadservices.com"],
          frameAncestors: [
            "'self'",
            "https://*.google.com",
            "https://ai.studio",
            "https://*.run.app",
            "https://ais-dev-*.run.app",
            "https://ais-pre-*.run.app"
          ]
        }
      },
      crossOriginEmbedderPolicy: false,
      frameguard: false
      // We use CSP frameAncestors to allow rendering in the AI Studio preview window
    })
  );
  app.use(import_express.default.json({ limit: "15mb" }));
  app.use(import_express.default.urlencoded({ limit: "15mb", extended: true }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    const origin = req.headers.origin;
    let isAllowed = false;
    if (origin) {
      if (origin.endsWith("google.com") || origin.endsWith("ai.studio") || origin.endsWith("run.app") || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        isAllowed = true;
      }
    } else {
      isAllowed = true;
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
    res.sendSecureError = (error, defaultMessage = "An internal server error occurred") => {
      const correlationId = "ERR-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      let safeMessage = defaultMessage;
      if (error && error.message) {
        safeMessage = error.message.replace(/\/[\w\-\.\/]+/g, "[PATH]").replace(/\\[\w\-\.\\]+/g, "[PATH]");
        if (safeMessage.length > 150) {
          safeMessage = safeMessage.substring(0, 150) + "...";
        }
      }
      console.error(`[${correlationId}] Secure Log:`, error);
      return res.status(500).json({
        error: safeMessage,
        correlationId,
        status: "error"
      });
    };
    next();
  });
  const rateLimitStore = /* @__PURE__ */ new Map();
  const createRateLimiter = (maxRequests, windowMs, errorMessage) => {
    return (req, res, next) => {
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
  const loginRateLimiter = createRateLimiter(5, 6e4, "Too many verification/login attempts. Please try again after 1 minute.");
  const resetRateLimiter = createRateLimiter(3, 36e5, "Too many reset attempts. Please try again after 1 hour.");
  const getUserContext = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    const email = req.headers["x-user-email"];
    const name = req.headers["x-user-name"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Missing user context headers." });
    }
    req.userContext = { userId, email: email || "", name: name || "Anonymous User" };
    next();
  };
  const adminAuth = (req, res, next) => {
    const passcode = req.headers["x-admin-passcode"];
    const email = req.headers["x-user-email"];
    if ((passcode === "awanwarsi" || passcode === "awanwarsi1A@") && email && email.toLowerCase() === "mohammdsaeed24@gmail.com") {
      next();
    } else {
      res.status(403).json({ error: "Access Denied: Administrative authorization is required." });
    }
  };
  app.get("/api/gamification/profile", getUserContext, (req, res) => {
    const { userId, email, name } = req.userContext;
    try {
      const profile = getOrCreateProfile(userId, email, name);
      res.json(profile);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/profile/delete", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    try {
      const result = deleteUserProfile(userId);
      res.json(result);
    } catch (e) {
      res.sendSecureError(e, "Failed to delete user profile.");
    }
  });
  app.post("/api/gamification/login", loginRateLimiter, getUserContext, (req, res) => {
    const { userId } = req.userContext;
    try {
      const result = checkLoginStreak(userId);
      res.json(result);
    } catch (e) {
      res.sendSecureError(e, "Failed to complete daily check-in.");
    }
  });
  app.post("/api/gamification/search", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    const { query: queryText } = req.body;
    try {
      const result = recordSearch(userId, queryText || "");
      if (result.searchesCount === 1) {
        const refResult = checkAndCompleteReferral(userId);
        if (refResult.triggered) {
          result.referralReward = refResult;
        }
      }
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/transfer", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    const { toUserId, amount } = req.body;
    try {
      const result = transferCoins(userId, toUserId, amount);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json({ error: result.message });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/share", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    try {
      const result = awardCoins(userId, 20, "Shared BuyWise deal to social network");
      res.json({ success: true, coins: result.coins, gained: 20 });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/review", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    try {
      const result = awardCoins(userId, 10, "Submitted a verified merchant review");
      res.json({ success: true, coins: result.coins, gained: 10 });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/gamification/reviews", (req, res) => {
    try {
      const reviewsList = getReviews();
      res.json(reviewsList);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/reviews", getUserContext, (req, res) => {
    const { userId, email, name } = req.userContext;
    const { rating, comment } = req.body;
    if (rating === void 0 || !comment) {
      return res.status(400).json({ error: "Missing rating or comment parameters" });
    }
    try {
      const result = submitReview(userId, email, name, Number(rating), comment);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/profile-complete", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    try {
      const result = awardCoins(userId, 25, "Completed registration and profile setup");
      res.json({ success: true, coins: result.coins, gained: 25 });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/gamification/transactions", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    try {
      const txns = getTransactions(userId);
      res.json(txns);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/spin", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    try {
      const result = spinWheel(userId);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/mission", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    const { missionId } = req.body;
    try {
      if (!missionId) return res.status(400).json({ error: "Missing missionId" });
      const result = completeMission(userId, missionId);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/gamification/achievements", getUserContext, (req, res) => {
    const { userId, email, name } = req.userContext;
    try {
      const profile = getOrCreateProfile(userId, email, name);
      const result = ACHIEVEMENTS.map((ach) => ({
        ...ach,
        unlocked: profile.achievements.includes(ach.id)
      }));
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/referral/join", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    const { referralCode } = req.body;
    if (!referralCode) return res.status(400).json({ error: "Missing referralCode parameter" });
    try {
      const result = submitReferralCode(userId, referralCode);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/gamification/referral/stats", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    try {
      const stats = getReferralStats(userId);
      res.json(stats);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/gamification/leaderboard", (req, res) => {
    try {
      const metric = req.query.metric || "coins";
      const list = getLeaderboard(metric);
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/redeem", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    const { rewardType } = req.body;
    if (!rewardType) return res.status(400).json({ error: "Missing rewardType parameter" });
    try {
      const result = redeemReward(userId, rewardType);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  const getLocalBarcodeFallback = (barcode, format) => {
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
        recommendation: "Recommended Purchase: We highly recommend buying from Amazon as you save \u20B95,000 compared to other premium retailers, plus they offer free next-day Prime delivery.",
        lowestPriceEver: 23990,
        highestPriceEver: 29990,
        shopping_results: [
          { source: "Amazon", price: "\u20B924,990", old_price: "\u20B929,990", link: "https://www.amazon.in/", rating: 4.6, delivery: "Free delivery", isCheapest: true },
          { source: "Croma", price: "\u20B926,490", old_price: "\u20B929,990", link: "https://www.croma.com/", rating: 4.5, delivery: "Express store pickup", isCheapest: false },
          { source: "Reliance Digital", price: "\u20B927,990", old_price: "\u20B929,990", link: "https://www.reliancedigital.in/", rating: 4.4, delivery: "Delivery in 2 days", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 27e3 },
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
        recommendation: "Recommended Purchase: Flipkart is offering a direct discount of \u20B910,000 with additional HDFC Bank card benefits making it the best option.",
        lowestPriceEver: 121900,
        highestPriceEver: 134900,
        shopping_results: [
          { source: "Flipkart", price: "\u20B91,24,900", old_price: "\u20B91,34,900", link: "https://www.flipkart.com/", rating: 4.7, delivery: "Free delivery", isCheapest: true },
          { source: "Apple Store Online", price: "\u20B91,34,900", old_price: "\u20B91,34,900", link: "https://www.apple.com/in/", rating: 4.9, delivery: "Free express delivery", isCheapest: false },
          { source: "Croma", price: "\u20B91,27,900", old_price: "\u20B91,34,900", link: "https://www.croma.com/", rating: 4.6, delivery: "Next-day delivery", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 134900 },
          { date: "Feb", price: 132e3 },
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
        recommendation: "Recommended Purchase: We highly recommend buying from Amazon as you save \u20B91,491 compared to retail price, and it includes free next-day express shipping.",
        lowestPriceEver: 1799,
        highestPriceEver: 3490,
        shopping_results: [
          { source: "Amazon", price: "\u20B91,999", old_price: "\u20B93,490", link: "https://www.amazon.in/", rating: 4.2, delivery: "Free delivery", isCheapest: true },
          { source: "boAt Website", price: "\u20B92,299", old_price: "\u20B93,490", link: "https://www.boat-lifestyle.com/", rating: 4.5, delivery: "Free shipping", isCheapest: false },
          { source: "Flipkart", price: "\u20B92,099", old_price: "\u20B93,490", link: "https://www.flipkart.com/", rating: 4.1, delivery: "Delivery in 3 days", isCheapest: false }
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
        recommendation: "Recommended Purchase: Buy from Croma as they have an ongoing brand tie-up offering instant card discounts and cashbacks up to \u20B93,000.",
        lowestPriceEver: 34900,
        highestPriceEver: 39900,
        shopping_results: [
          { source: "Croma", price: "\u20B935,900", old_price: "\u20B939,900", link: "https://www.croma.com/", rating: 4.7, delivery: "Free shipping", isCheapest: true },
          { source: "Amazon", price: "\u20B936,490", old_price: "\u20B939,900", link: "https://www.amazon.in/", rating: 4.6, delivery: "Free delivery", isCheapest: false },
          { source: "Reliance Digital", price: "\u20B937,900", old_price: "\u20B939,900", link: "https://www.reliancedigital.in/", rating: 4.5, delivery: "Delivery in 2 days", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 39900 },
          { date: "Feb", price: 38500 },
          { date: "Mar", price: 37e3 },
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
          { source: "ShopatSC", price: "\u20B944,990", old_price: "\u20B954,990", link: "https://www.shopatsc.com/", rating: 4.8, delivery: "Free shipping", isCheapest: true },
          { source: "Amazon", price: "\u20B949,990", old_price: "\u20B954,990", link: "https://www.amazon.in/", rating: 4.6, delivery: "Free delivery", isCheapest: false },
          { source: "Flipkart", price: "\u20B945,990", old_price: "\u20B954,990", link: "https://www.flipkart.com/", rating: 4.5, delivery: "Free shipping", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 54990 },
          { date: "Feb", price: 52e3 },
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
        recommendation: "Recommended Purchase: Croma has student card discounts and corporate partnership cashbacks bringing the price down to \u20B91,04,900.",
        lowestPriceEver: 101900,
        highestPriceEver: 114900,
        shopping_results: [
          { source: "Croma", price: "\u20B91,04,900", old_price: "\u20B91,14,900", link: "https://www.croma.com/", rating: 4.8, delivery: "Free shipping", isCheapest: true },
          { source: "Amazon", price: "\u20B91,09,900", old_price: "\u20B91,14,900", link: "https://www.amazon.in/", rating: 4.7, delivery: "Free delivery", isCheapest: false },
          { source: "Apple Store Online", price: "\u20B91,14,900", old_price: "\u20B91,14,900", link: "https://www.apple.com/in/", rating: 4.9, delivery: "Free express delivery", isCheapest: false }
        ],
        priceHistory: [
          { date: "Jan", price: 114900 },
          { date: "Feb", price: 112e3 },
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
  app.post("/api/gamification/barcode/scan", getUserContext, async (req, res) => {
    const { userId, email, name } = req.userContext;
    const { barcode, format } = req.body;
    if (!barcode) {
      return res.status(400).json({ error: "Missing barcode parameter" });
    }
    console.log(`[Barcode Scan API] User [REDACTED] (${userId}) scanned barcode "${barcode}" (${format || "UNKNOWN"})`);
    let parsedData = null;
    try {
      const aiClient = getAi();
      const prompt = `You are "BuyWise INDIA Intelligence Barcode Engine".
The user has scanned a physical product barcode: "${barcode}" (Format: "${format || "EAN_13/UPC_A"}").

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
      "price": "\u20B924,990",
      "old_price": "\u20B929,990",
      "link": "https://www.amazon.in/",
      "rating": 4.5,
      "delivery": "Free delivery",
      "isCheapest": true
    }
  ],
  "recommendation": "Recommended Purchase: We highly recommend buying from Flipkart as you save \u20B91,000 compared to Amazon, and it includes free next-day express delivery.",
  "priceHistory": [
    {"date": "Jan", "price": 27000},
    {"date": "Feb", "price": 26500},
    {"date": "Mar", "price": 25800},
    {"date": "Apr", "price": 26200},
    {"date": "May", "price": 24990},
    {"date": "Jun", "price": 24990}
  ],
  "alternatives": [
    { "name": "Similar Product Name", "price": "\u20B922,990", "reason": "Better value for money" }
  ],
  "coupons": [
    { "code": "SAVE500", "discount": "\u20B9500", "description": "Flat \u20B9500 off on Axis Bank cards" }
  ],
  "lowestPriceEver": 23990,
  "highestPriceEver": 29990
}`;
      const isAccessToken = process.env.GEMINI_API_KEY?.trim().startsWith("ya29.") || process.env.GEMINI_API_KEY?.trim().startsWith("AQ.");
      let response;
      if (isAccessToken) {
        console.log("[Barcode Scan API] OAuth token detected. Bypassing Google Search grounding tool to avoid auth issues.");
        response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
      } else {
        try {
          response = await aiClient.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              tools: [{ googleSearch: {} }]
            }
          });
        } catch (searchErr) {
          console.warn("[Barcode Scan API] Gemini Search Grounding failed, retrying without grounding tool:", searchErr.message);
          response = await aiClient.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });
        }
      }
      const resultText = response.text?.trim() || "{}";
      parsedData = JSON.parse(resultText);
    } catch (apiErr) {
      console.warn("[Barcode Scan API] Gemini API processing failed, falling back to smart local scanner:", apiErr.message);
      parsedData = getLocalBarcodeFallback(barcode, format);
    }
    try {
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
    } catch (e) {
      console.error("[Barcode Scan Error]", e);
      res.status(500).json({ error: "Failed to process barcode scan via AI. " + e.message });
    }
  });
  app.get("/api/gamification/barcode/history", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    try {
      const history = getScanHistory(userId);
      res.json(history);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/gamification/public-stats", (req, res) => {
    try {
      const stats = getPublicStats();
      res.json(stats);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/gamification/deals", (req, res) => {
    const { category, type, limit } = req.query;
    try {
      const storePath = import_path2.default.join(process.cwd(), "data_store.json");
      if (!import_fs2.default.existsSync(storePath)) {
        return res.json([]);
      }
      const raw = JSON.parse(import_fs2.default.readFileSync(storePath, "utf-8"));
      let filtered = [...raw.deals];
      if (category && category !== "all") {
        filtered = filtered.filter((d) => d.category === category);
      }
      if (type === "best") {
        filtered.sort((a, b) => b.discountPercent - a.discountPercent);
      } else if (type === "trending") {
        filtered.sort((a, b) => b.views - a.views);
      } else if (type === "flash") {
        filtered = filtered.filter((d) => d.isFlashDeal);
      } else if (type === "editor") {
        filtered = filtered.filter((d) => d.isEditorPick);
      } else if (type === "under500") {
        filtered = filtered.filter((d) => d.newPrice < 500);
      } else if (type === "under1000") {
        filtered = filtered.filter((d) => d.newPrice < 1e3);
      } else if (type === "under5000") {
        filtered = filtered.filter((d) => d.newPrice < 5e3);
      }
      if (limit) {
        filtered = filtered.slice(0, Number(limit));
      }
      res.json(filtered);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/deals/action", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    const { dealId, action } = req.body;
    if (!dealId || !action) return res.status(400).json({ error: "Missing parameters" });
    try {
      const storePath = import_path2.default.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(import_fs2.default.readFileSync(storePath, "utf-8"));
      const dealIndex = raw.deals.findIndex((d) => d.id === dealId);
      if (dealIndex >= 0) {
        const deal = raw.deals[dealIndex];
        if (action === "save") {
          deal.saves = (deal.saves || 0) + 1;
        } else if (action === "share") {
          deal.purchases = (deal.purchases || 0) + 1;
          awardCoins(userId, 2, `Shared deal: ${deal.title}`);
        } else if (action === "view") {
          deal.views = (deal.views || 0) + 1;
        }
        import_fs2.default.writeFileSync(storePath, JSON.stringify(raw, null, 2), "utf-8");
        return res.json({ success: true, deal });
      }
      res.status(404).json({ error: "Deal not found" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gamification/notifications/preferences", getUserContext, (req, res) => {
    const { userId } = req.userContext;
    const { preferences, enabled } = req.body;
    try {
      const storePath = import_path2.default.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(import_fs2.default.readFileSync(storePath, "utf-8"));
      const profile = raw.profiles[userId];
      if (profile) {
        if (enabled !== void 0) profile.notificationsEnabled = enabled;
        if (preferences) profile.notificationPreferences = preferences;
        import_fs2.default.writeFileSync(storePath, JSON.stringify(raw, null, 2), "utf-8");
        return res.json({ success: true, profile });
      }
      res.status(404).json({ error: "Profile not found" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  async function parseTelegramPost(text) {
    try {
      const ai = getAi();
      const prompt = `You are an elite, highly accurate shopping deal parser. Parse the following Telegram deal post. Extract pricing and link accurately.

Categories MUST be one of: "electronics" | "fashion" | "home" | "grocery" | "gaming" | "mobiles" | "laptops".
Source MUST be one of: "amazon" | "flipkart" | "croma" | "reliance" | "vijaysales" | "tatacliq" | "myntra" | "ajio". If not matching, map to "amazon".
If prices are found, convert them to raw numbers (remove commas, currency symbols like \u20B9, Rs, etc.).
CRITICAL PRICE EXTRACTION: 
- The price mentioned in the text (e.g., "At Rs.399", "Only \u20B9500") is the newPrice.
- If an original price is mentioned (e.g. crossed out or "was 1000"), that is the oldPrice.
- If a discount percentage is mentioned (e.g., "93% Off") and no oldPrice is explicitly stated, you MUST calculate the oldPrice mathematically: oldPrice = newPrice / (1 - discount/100). (e.g., 93% off Rs.399 -> oldPrice is 5700).
- If neither oldPrice nor discount is mentioned, calculate oldPrice as 15-30% higher than newPrice.
If no link is found, default to "https://www.amazon.in".
If thumbnail is needed, select a high-quality product photo URL from Unsplash.

Telegram Message:
"${text}"`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
    } catch (err) {
      console.error("Gemini Telegram parse failed, using fallback regex:", err.message);
      let source = "amazon";
      if (text.toLowerCase().includes("flipkart")) source = "flipkart";
      else if (text.toLowerCase().includes("croma")) source = "croma";
      else if (text.toLowerCase().includes("reliance")) source = "reliance";
      let link = "https://www.amazon.in";
      const linkMatch = text.match(/https?:\/\/[^\s]+/);
      if (linkMatch) link = linkMatch[0];
      let newPrice = 999;
      let oldPrice = 1499;
      let discountPercent = 33;
      let explicitDiscount = 0;
      const potentialDiscounts = text.match(/(\d+)%/);
      if (potentialDiscounts) {
        explicitDiscount = parseInt(potentialDiscounts[1]);
      }
      const priceMatches = text.match(/\d+(?:,\d+)?/g);
      if (priceMatches && priceMatches.length > 0) {
        let numbers = priceMatches.map((n) => parseInt(n.replace(/,/g, ""), 10)).filter((n) => !isNaN(n) && n > 0);
        if (explicitDiscount > 0) {
          numbers = numbers.filter((n) => n !== explicitDiscount);
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
          discountPercent = Math.round((oldPrice - newPrice) / oldPrice * 100);
        }
      }
      return {
        title: (text.length > 60 ? text.substring(0, 60) + "..." : text).replace(/\n/g, " "),
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
  app.get("/api/affiliate/settings", adminAuth, (req, res) => {
    try {
      res.json(getAffiliateSettings());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/affiliate/settings", adminAuth, (req, res) => {
    const { stores } = req.body;
    try {
      const result = updateAffiliateSettings(stores);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/affiliate/click", (req, res) => {
    const { store, productId, productTitle, category, url } = req.body;
    try {
      recordAffiliateClick({ store, productId, productTitle, category });
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
    } catch (err) {
      res.status(500).json({ error: err.message, affiliateUrl: url });
    }
  });
  app.get("/api/telegram/config", adminAuth, (req, res) => {
    try {
      res.json(getTelegramConfig());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/telegram/config", adminAuth, (req, res) => {
    const { config } = req.body;
    try {
      const result = updateTelegramConfig(config);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/telegram/webhook", adminAuth, async (req, res) => {
    try {
      const update = req.body;
      console.log("Telegram webhook update received:", JSON.stringify(update));
      const message = update.channel_post || update.message || update;
      const text = message.text || message.caption || "";
      const customPhotoUrl = message.photo_url || "";
      if (!text) {
        return res.json({ success: false, message: "No text content found in Telegram payload." });
      }
      const parsedDeal = await parseTelegramPost(text);
      if (customPhotoUrl) {
        parsedDeal.thumbnail = customPhotoUrl;
      }
      const createdDeal = addDealDirectly(parsedDeal);
      const storePath = import_path2.default.join(process.cwd(), "data_store.json");
      if (import_fs2.default.existsSync(storePath)) {
        const raw = JSON.parse(import_fs2.default.readFileSync(storePath, "utf-8"));
        if (!raw.deals) raw.deals = [];
        raw.deals.unshift(createdDeal);
        import_fs2.default.writeFileSync(storePath, JSON.stringify(raw, null, 2), "utf-8");
      }
      res.json({ success: true, message: "Deal parsed and added to BuyWise live deals section", deal: createdDeal });
    } catch (err) {
      console.error("Telegram webhook parse error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/gamification/admin/action", adminAuth, (req, res) => {
    const { action, payload } = req.body;
    try {
      const result = adminAction(action, payload);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/admin/upload-founder", adminAuth, (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 payload" });
    }
    try {
      const matches = imageBase64.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      let base64Data = imageBase64;
      if (matches && matches.length === 3) {
        base64Data = matches[2];
      }
      const buffer = Buffer.from(base64Data, "base64");
      const publicPath = import_path2.default.join(process.cwd(), "public", "founder.png");
      import_fs2.default.writeFileSync(publicPath, buffer);
      const distPath = import_path2.default.join(process.cwd(), "dist", "founder.png");
      if (import_fs2.default.existsSync(import_path2.default.join(process.cwd(), "dist"))) {
        import_fs2.default.writeFileSync(distPath, buffer);
      }
      console.log("Successfully overwrote founder.png in public/ and dist/");
      res.json({ success: true, message: "Founder portrait updated successfully!" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/gamification/admin/users", adminAuth, (req, res) => {
    try {
      const storePath = import_path2.default.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(import_fs2.default.readFileSync(storePath, "utf-8"));
      res.json(Object.values(raw.profiles));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/gamification/admin/referrals", adminAuth, (req, res) => {
    try {
      const storePath = import_path2.default.join(process.cwd(), "data_store.json");
      const raw = JSON.parse(import_fs2.default.readFileSync(storePath, "utf-8"));
      res.json(raw.referrals);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  app.post("/api/gemini/detect", async (req, res) => {
    try {
      let { text } = req.body;
      if (!text) return res.status(400).json({ error: "Missing text parameter" });
      const cacheKey = text.trim().toLowerCase();
      if (geminiCache.detect[cacheKey]) {
        console.log(`[Detect Cache Hit] Returning cached results for query: "${text}"`);
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
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          config: { responseMimeType: "application/json" },
          contents: `Analyze the user's shopping search query: "${text}".
          1. Identify the core product name (e.g. "iPhone 15 Pro", "Sony WH-1000XM5"). ${isUrl ? "Parse it from the URL slug if needed." : ""}
          2. Detect any price constraints (e.g. "under 60000", "below 500", "between 1000 and 2000"). If mentioned in rupees or dollars, just output the numeric value.
          3. Detect any specific brand mentioned.
          
          Return JSON matching:
          {
            "result": "Concise product name",
            "minPrice": number or null,
            "maxPrice": number or null,
            "brand": "Brand name" or null
          }`
        });
        const resultText = response.text?.trim() || "{}";
        const json = JSON.parse(resultText);
        parsed.result = json.result || text;
        parsed.minPrice = json.minPrice;
        parsed.maxPrice = json.maxPrice;
        parsed.brand = json.brand;
        geminiCache.detect[cacheKey] = parsed;
      } catch (err) {
        console.warn("Gemini Detect failed, using local parser:", err.message);
        if (isUrl) {
          try {
            const urlObj = new URL(resolvedUrl || urlStr);
            const pathParts = urlObj.pathname.split("/").filter(Boolean);
            const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;
            parsed.result = lastPart.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          } catch {
            parsed.result = text;
          }
        }
        geminiCache.detect[cacheKey] = parsed;
      }
      res.json(parsed);
    } catch (e) {
      console.error("Gemini Detect Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to detect product" });
    }
  });
  app.post("/api/gemini/extract-features", async (req, res) => {
    try {
      const { productName } = req.body;
      if (!productName) return res.status(400).json({ error: "Missing productName parameter" });
      const cacheKey = productName.trim().toLowerCase();
      if (geminiCache.extractFeatures[cacheKey]) {
        console.log(`[Features Cache Hit] Returning cached specs for: "${productName}"`);
        return res.json({ features: geminiCache.extractFeatures[cacheKey] });
      }
      let features = [];
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: "You are an elite hardware/software analyst."
          },
          contents: `Provide exactly 3 hyper-concise, highly technical features (max 5 words each) for the product: "${productName}". Example format: "A17 Pro Bionic Chip, Titanium Aerospace Frame, 120Hz ProMotion Display". Separate by commas.`
        });
        const text = response.text?.trim() || "";
        features = text.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
        geminiCache.extractFeatures[cacheKey] = features;
      } catch (err) {
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
        geminiCache.extractFeatures[cacheKey] = features;
      }
      res.json({ features });
    } catch (e) {
      console.error("Gemini Extract Features Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to extract features" });
    }
  });
  app.post("/api/gemini/shopper-plan", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: "Missing query parameter" });
      const cacheKey = query.trim().toLowerCase();
      if (geminiCache.shopperPlan[cacheKey]) {
        console.log(`[Shopper Plan Cache Hit] Returning cached plan for: "${query}"`);
        return res.json(geminiCache.shopperPlan[cacheKey]);
      }
      const systemInstruction = `You are the BuyWise AI Personal Shopper. You receive natural language queries like "I have \u20B930,000. Build me the best gaming setup."
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
- Make prices in INR (\u20B9). Use numbers for prices (e.g. 5000, not "5,000").
- Use placeholder images from Unsplash or clear image URLs.
- Ensure the totalCost does not exceed the totalBudget (infer budget from the prompt if possible).
- ALWAYS output ONLY raw JSON. No markdown. No text outside JSON.`;
      let planJsonStr = "";
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json"
          },
          contents: `User Query: "${query}"`
        });
        planJsonStr = response.text?.trim() || "";
        if (planJsonStr.startsWith("```json")) {
          planJsonStr = planJsonStr.replace(/^```json\n/, "").replace(/\n```$/, "");
        }
        const plan = JSON.parse(planJsonStr);
        geminiCache.shopperPlan[cacheKey] = plan;
        res.json(plan);
      } catch (err) {
        console.warn("Gemini Shopper Plan failed:", err.message);
        const fallbackPlan = {
          title: "Optimized Custom Plan",
          totalBudget: 5e4,
          totalCost: 45e3,
          savings: 5e3,
          summary: "Based on your request, this curated list balances high performance with cost-efficiency. (Fallback AI active due to rate limits)",
          products: [
            {
              id: "fallback_1",
              name: "High-Performance Workstation Monitor",
              brand: "Samsung",
              price: 15e3,
              originalPrice: 2e4,
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
              price: 8e3,
              originalPrice: 12e3,
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
    } catch (e) {
      console.error("Shopper Plan Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to generate plan" });
    }
  });
  app.post("/api/gemini/shopping-advice", async (req, res) => {
    try {
      const { query, results } = req.body;
      const cacheKey = `${(query || "").trim().toLowerCase()}_${JSON.stringify(results?.slice(0, 3) || [])}`;
      if (geminiCache.shoppingAdvice[cacheKey]) {
        console.log(`[Advice Cache Hit] Returning cached advice for: "${query}"`);
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
   - It is a comprehensive AI-powered Shopping and Travel Super App.
   - Primary features: AI Product Search & Real-time Comparison, Interactive 3D Product Viewer, Price Radar & Trend Tracking, Smart Barcode Scanner with local Offline Queuing, Google Flights Integration, and real-time Premium user sync.
   - Created by: mohammdsaeed24 (with lead developer awanwarsi).

2. SUBSCRIPTION & PRICING PLANS:
   - We offer three premium tiers:
     - Weekly Pass: \u20B930 (Provides Unlimited AI Insights, Price Drop Alerts, & Flight/Train scans)
     - Monthly Elite: \u20B9100 (Adds a Premium Badge, Ad-free Experience, & Priority Support)
     - Forever Founder (Lifetime): \u20B9700 (Includes all features, Early Access, Lifetime Support)

3. POWERFUL SECTIONS WITHIN THE APP:
   - PRODUCT SEARCH & COMPARE (Home): Searches top platforms.
   - 3D VIEW (Interactive Viewer): Let users inspect high-fidelity 3D renderings of products.
   - SMART SCANNER: Barcode scanning with Offline Queuing and real-time price intercept.
   - PRICE RADAR (Wishlist): Allows tracking of prices with alerts and AI price-trend predictions.
   - TRAVEL ROUTE BUILDER: Under "/travel".

Always respond professionally with genius-level insight. If analyzing product search results, deliver a cutting-edge, ruthless market synthesis for the user query. Identify precise value arbitrage (price vs hardware specs), pinpoint the exact platform yielding maximum ROI, and cite actual Rupee (\u20B9) figures from the data. Expose marketing gimmicks and fake discounts. Be hyper-intelligent, authoritative, and visionary. Format your response elegantly using markdown (lists, bold text, etc.).`;
      let advice = "";
      try {
        const response = await getAi().models.generateContent({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction
          },
          contents: `User Query: "${query}"

Market Search Results Data: ${JSON.stringify(results?.slice(0, 5) || [])}`
        });
        advice = response.text?.trim() || "Analyzing macro-economic market vectors...";
        geminiCache.shoppingAdvice[cacheKey] = advice;
      } catch (err) {
        console.warn("Gemini Shopping Advice failed, using local intelligence engine:", err.message);
        const list = results || [];
        let lowestPrice = 999999;
        let lowestItem = null;
        let highestRating = 0;
        let highestRatedItem = null;
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
        advice = `### \u{1F31F} BuyWise Market Intelligence Analysis

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
     - **Weekly Pass**: Only \u20B930 (Perfect for immediate shopping sprints)
     - **Monthly Elite**: \u20B9100 (Unlocks premium status, priority developer support, and zero ads)
     - **Forever Founder (Lifetime)**: \u20B9700 (Direct lifetime updates, lifetime developer contact, and ultimate status)`;
        geminiCache.shoppingAdvice[cacheKey] = advice;
      }
      res.json({ advice });
    } catch (e) {
      console.error("Gemini Shopping Advice Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to generate shopping advice" });
    }
  });
  app.post("/api/gemini/predict-trend", async (req, res) => {
    try {
      const { productTitle, currentPriceStr } = req.body;
      const cacheKey = `${(productTitle || "").trim().toLowerCase()}_${(currentPriceStr || "").trim().toLowerCase()}`;
      if (geminiCache.predictTrend[cacheKey]) {
        console.log(`[Trend Cache Hit] Returning cached trend for: "${productTitle}"`);
        return res.json(geminiCache.predictTrend[cacheKey]);
      }
      let trendData = null;
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
            "predictedPrice": "\u20B9X,XXX",
            "explanation": "Short 1-sentence explanation."
          }`
        });
        const text = response.text?.trim() || "";
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        trendData = JSON.parse(jsonStr);
        geminiCache.predictTrend[cacheKey] = trendData;
      } catch (err) {
        console.warn("Gemini Predict Trend failed, using local predictor:", err.message);
        const priceNum = parseInt((currentPriceStr || "\u20B945,000").replace(/[^0-9]/g, "")) || 45e3;
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
        const formattedPrice = "\u20B9" + predictedPrice.toLocaleString("en-IN");
        trendData = {
          trend,
          predictedPrice: formattedPrice,
          explanation
        };
        geminiCache.predictTrend[cacheKey] = trendData;
      }
      res.json(trendData);
    } catch (e) {
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
   - Searches routes in Indian Rupees (\u20B9) and builds optimal multi-city or single-leg flight paths and elegant trip itineraries.
5. **ADMIN CONTROLS (/admin)**:
   - Restricted to the owner, **Awanwarsi**. Allows him to approve premium subscriptions in real-time, inspect telemetry logs, view payment UTR entries, and manage site parameters.

PREMIUM USERS, PRICING & PAYMENT WORKFLOW:
- Premium unlocks the **Cognitive Assistant (Red floating bot)** on the home explorer, which gives personalized shopping suggestions, compares specs, and acts as an AI shopping companion.
- **Premium Subscription Plans**:
  - **Weekly Pass (\u20B930)**: Unlimited AI shopping, continuous price tracking, flight scans.
  - **Monthly Elite (\u20B9100)**: No ads, premium custom profile badge, priority support queue.
  - **Forever Founder (\u20B9700)**: All premium features for life, priority direct chat access to Awanwarsi, and future beta releases.
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
            systemInstruction
          },
          contents
        });
        chatText = response.text?.trim() || "I am connected to the BuyWise brain. How can I guide your journey today?";
      } catch (err) {
        console.warn("Gemini Support Chat failed, using smart local FAQs parser:", err.message);
        const lastUserMessage = messages[messages.length - 1]?.text || "";
        const lowerInput = lastUserMessage.toLowerCase();
        if (lowerInput.includes("premium") || lowerInput.includes("plan") || lowerInput.includes("weekly") || lowerInput.includes("monthly") || lowerInput.includes("elite") || lowerInput.includes("founder") || lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("payment")) {
          chatText = `### \u{1F31F} BuyWise Premium Plans & Payment Workflow

We offer three premium, high-octane plans to elevate your shopping & travel intelligence:

- **Weekly Pass (\u20B930)**: Perfect for instant shopping runs. Includes unlimited AI shopping advice, price drop alerts, and Google Flight autocomplete scans.
- **Monthly Elite (\u20B9100)**: Our most popular plan. Adds a shiny **Premium Profile Badge**, entirely ad-free experience, and priority support.
- **Forever Founder (\u20B9700)**: True VIP status. Lifetime access to all modules, including future beta releases, and direct support.

**To Upgrade**:
1. Navigate to the **Premium** tab in the top navigation bar.
2. Select your desired plan, scan the displayed **UPI QR Code** to pay.
3. Enter your payment's 12-digit **Unique Transaction Reference (UTR)** number and submit the form. 
4. The owner **Awanwarsi** will verify your payment manually and approve!`;
        } else if (lowerInput.includes("approve") || lowerInput.includes("approval") || lowerInput.includes("time") || lowerInput.includes("how long") || lowerInput.includes("wait") || lowerInput.includes("pending") || lowerInput.includes("utr")) {
          chatText = `### \u{1F552} Premium Approval & Verification Schedule

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
          chatText = `### \u{1F3AF} Price Radar & Trend Tracking

The **Price Radar** (Wishlist tab) is your powerful tool for pricing arbitrage:

- **Continuous Tracking**: Add any product from the Home screen. We scan Amazon, Flipkart, Croma, and Reliance Digital to monitor prices.
- **AI Trend Forecasting**: Click on any tracked item to see advanced AI forecasts (UP, DOWN, or STABLE) with a detailed analytical explanation of market trends.
- **Instant Drop Alerts**: You will receive notifications the moment prices drop, ensuring you buy at the absolute minimum.`;
        } else if (lowerInput.includes("3d") || lowerInput.includes("viewer") || lowerInput.includes("mesh") || lowerInput.includes("inspect")) {
          chatText = `### \u{1F4E6} Interactive 3D Product Viewer

Our **3D Viewer** sets BuyWise apart from standard search lists:

- **Physical Assessment**: Inspect product structural proportions, port alignments, camera bumps, and visual texture aesthetics interactively in a high-fidelity 3D workspace.
- **Accessing 3D View**: Search for a product on the Home explorer. Any compared result card features a dedicated **3D View** button. Click it to launch the immersive rendering stage instantly!`;
        } else if (lowerInput.includes("flight") || lowerInput.includes("travel") || lowerInput.includes("route") || lowerInput.includes("itinerary")) {
          chatText = `### \u2708\uFE0F Travel Route Finder & Flights

Construct beautiful travels effortlessly using the **Travel** module:

- **Google Flights Autocomplete**: Simply start typing to search for airports by airport code or city name (e.g., BOM for Mumbai, DEL for Delhi) with rapid autocompletion.
- **Optimal Route Optimization**: Enter your outbound dates, passenger count, and route details to receive flight options displayed clearly in Indian Rupees (\u20B9) with flight durations, departure schedules, and booking paths.`;
        } else if (lowerInput.includes("contact") || lowerInput.includes("human") || lowerInput.includes("help") || lowerInput.includes("whatsapp") || lowerInput.includes("email") || lowerInput.includes("refund") || lowerInput.includes("owner") || lowerInput.includes("developer")) {
          chatText = `### \u{1F4DE} Live Human Escalation Channels

I am happy to connect you directly to our human support desk! 

- **Developer & Owner**: Awanwarsi
- **Direct Support Channel (WhatsApp)**: **+91 77604 49306**
- **Support Email**: **mohammdsaeed24@gmail.com** or **awanwarsi790@gmail.com**

Please click the WhatsApp button on the support panel or send a message mentioning your registered email address and UTR reference. Let me open the Live Support Channels for you!`;
        } else {
          chatText = `### \u{1F30C} Namaste! Welcome to BuyWise Intelligent Support

I am your unified assistant for BuyWise, the ultimate shopping and travel super app built by Awanwarsi. 

I can assist you with any questions regarding:
- **Price Radar & Forecasting**: Predicting price movements on Amazon & Flipkart.
- **Interactive 3D View**: Physically assessing device build qualities.
- **Google Flights Tracker**: Searching and finding flight options in INR.
- **Premium Subscriptions**: Details on the Weekly (\u20B930), Monthly (\u20B9100), or Forever (\u20B9700) tiers.
- **Payment Verification**: UTR approvals and manual schedule.

Please feel free to ask a specific question, or select one of our suggested questions below!`;
        }
      }
      res.json({ text: chatText });
    } catch (e) {
      console.error("Support Chat Error:", e.message);
      res.status(500).json({ error: e.message || "Failed to process support chat" });
    }
  });
  app.get("/api/search", async (req, res) => {
    const { q, originalUrl } = req.query;
    const rapidApiKey = process.env.RAPID_API_KEY;
    let queryStr = typeof q === "string" ? q : "";
    const origUrlStr = typeof originalUrl === "string" ? originalUrl : "";
    const cacheKey = `${queryStr.trim().toLowerCase()}_${origUrlStr.trim().toLowerCase()}`;
    if (geminiCache.search && geminiCache.search[cacheKey]) {
      console.log(`[Search Cache Hit] Returning cached results for: "${queryStr}"`);
      return res.json({ shopping_results: geminiCache.search[cacheKey] });
    }
    console.log(`[API Search] Product name: "${queryStr}", originalUrl: "${origUrlStr}"`);
    let urlToAnalyze = origUrlStr.startsWith("http") ? origUrlStr : queryStr.startsWith("http") ? queryStr : "";
    if (urlToAnalyze) {
      try {
        console.log(`[API Search] urlToAnalyze detected: "${urlToAnalyze}". Resolving...`);
        const resolved = await resolveRedirect(urlToAnalyze);
        urlToAnalyze = resolved;
        const isQueryUrl = queryStr.startsWith("http");
        const isQuerySlug = queryStr.length < 15 && /^[a-z0-9-_]+$/i.test(queryStr);
        if (isQueryUrl || isQuerySlug || !queryStr.trim()) {
          console.log(`[API Search] Query "${queryStr}" is URL or slug/ASIN. Looking up descriptive product title...`);
          const extractedTitle = await getProductTitleFromUrl(resolved);
          if (extractedTitle && extractedTitle !== resolved) {
            queryStr = extractedTitle;
            console.log(`[API Search] Resolved query to descriptive title: "${queryStr}"`);
          }
        }
      } catch (err) {
        console.warn(`[API Search] Error resolving urlToAnalyze:`, err.message);
      }
    } else if (queryStr.startsWith("http")) {
      try {
        console.log(`[API Search] queryStr starts with http: "${queryStr}". Resolving...`);
        const resolved = await resolveRedirect(queryStr);
        urlToAnalyze = resolved;
        const extractedTitle = await getProductTitleFromUrl(resolved);
        if (extractedTitle && extractedTitle !== resolved) {
          queryStr = extractedTitle;
          console.log(`[API Search] Resolved query URL to title: "${queryStr}"`);
        }
      } catch (err) {
        console.warn(`[API Search] Error resolving queryStr URL:`, err.message);
      }
    }
    let results = [];
    let sourceUsed = "";
    const serpApiKey = process.env.SERP_API_KEY || "";
    if (serpApiKey && queryStr) {
      try {
        console.log(`[API Search] Attempting SerpApi Google Shopping search for: "${queryStr}"`);
        const serpResponse = await import_axios.default.get("https://serpapi.com/search", {
          params: { engine: "google_shopping", q: queryStr, api_key: serpApiKey, hl: "en", gl: "in" }
        });
        if (serpResponse.data && Array.isArray(serpResponse.data.shopping_results) && serpResponse.data.shopping_results.length > 0) {
          results = serpResponse.data.shopping_results.map((item) => {
            let originalLink = item.link || item.product_link;
            if (originalLink) {
              const extracted = extractDirectUrl(originalLink);
              if (extracted) {
                originalLink = extracted;
              }
            }
            const src = (item.source || "").toLowerCase();
            let asin = item.asin || item.product_id;
            if (!asin || !/^[A-Z0-9]{10}$/i.test(asin)) {
              asin = null;
              const linksToSearch = [originalLink, item.thumbnail, item.title].filter(Boolean);
              for (const l of linksToSearch) {
                const match = l.match(/\b(B[A-Z0-9]{9})\b/i);
                if (match && match[1]) {
                  asin = match[1];
                  break;
                }
              }
            }
            if (src.includes("amazon") && asin) {
              originalLink = `https://www.amazon.in/dp/${asin}`;
            }
            if (originalLink && (originalLink.includes("google.com") || originalLink.includes("serpapi.com") || originalLink.includes("googleadservices.com"))) {
            }
            let rawPrice = item.price;
            let numericPrice = 0;
            if (rawPrice) {
              const match = rawPrice.replace(/[^0-9]/g, "");
              numericPrice = parseInt(match, 10) || 0;
            }
            let oldPriceStr = item.old_price || null;
            if (!oldPriceStr && numericPrice > 0) {
              const discountPercent = 0.1 + Math.random() * 0.15;
              const oldPriceNum = Math.round(numericPrice / (1 - discountPercent));
              oldPriceStr = `\u20B9${oldPriceNum.toLocaleString("en-IN")}`;
            }
            const rating = item.rating || (Math.random() * 1.5 + 3.5).toFixed(1);
            const reviews = item.reviews || Math.floor(Math.random() * 500) + 10;
            return {
              title: item.title,
              price: item.price || `\u20B9${numericPrice.toLocaleString("en-IN")}`,
              old_price: oldPriceStr,
              thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
              link: originalLink,
              source: item.source || "Web Retailer",
              rating: Number(rating),
              reviews: Number(reviews),
              delivery: item.delivery || item.shipping || "Free delivery",
              isOriginalLink: originalLink === urlToAnalyze
            };
          });
          sourceUsed = "SerpApi";
          console.log(`[API Search] SerpApi successfully found ${results.length} correct shopping items.`);
        }
      } catch (e) {
        console.warn("[API Search] SerpApi search failed, continuing to next fallback:", e.message);
      }
    }
    if (results.length === 0) {
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
- Ensure all prices are in INR format with Rupee symbol, e.g., "\u20B924,990".
- Ensure the results are sorted by price in ascending order (cheapest overall listing at the very top of the list).

Format each item exactly like this:
{
  "title": "Concise product title",
  "price": "\u20B924,990",
  "old_price": "\u20B929,990" (or null if no discount),
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
  "price": "\u20B924,990",
  "old_price": "\u20B929,990" (or null if no discount),
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
            model: "gemini-3.5-flash",
            contents: contentsPrompt,
            config: {
              responseMimeType: "application/json"
            }
          });
        } else {
          try {
            response = await aiClient.models.generateContent({
              model: "gemini-3.5-flash",
              contents: contentsPrompt,
              config: {
                responseMimeType: "application/json",
                tools: [{ googleSearch: {} }]
              }
            });
          } catch (searchErr) {
            console.warn("[API Search] Gemini Search Grounding failed, retrying without grounding tool:", searchErr.message);
            response = await aiClient.models.generateContent({
              model: "gemini-3.5-flash",
              contents: contentsPrompt,
              config: {
                responseMimeType: "application/json"
              }
            });
          }
        }
        const parsed = JSON.parse(response.text?.trim() || "{}");
        if (parsed && Array.isArray(parsed.shopping_results) && parsed.shopping_results.length > 0) {
          results = parsed.shopping_results.map((item) => {
            let originalLink = item.link || item.product_link;
            return {
              title: item.title || `${queryStr} Offer`,
              price: item.price || "\u20B924,990",
              old_price: item.old_price || null,
              thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
              link: originalLink,
              source: item.source || "Online Retailer",
              rating: Number(item.rating || 4.5),
              reviews: Number(item.reviews || Math.floor(Math.random() * 500) + 10),
              delivery: item.delivery || "Free delivery",
              isOriginalLink: !!item.isOriginalLink || originalLink === urlToAnalyze
            };
          });
          sourceUsed = "GeminiGrounding";
          console.log(`[API Search] Success! Gemini Grounding returned ${results.length} results.`);
        }
      } catch (geminiErr) {
        console.error("[API Search] Gemini Grounding failed, falling back to legacy/RapidAPIs:", geminiErr.message);
      }
    }
    if (results.length === 0) {
      try {
        if (rapidApiKey) {
          try {
            const amazonRes = await import_axios.default.get("https://amazon-product-search-api1.p.rapidapi.com/search", {
              params: { query: queryStr, country: "in" },
              headers: {
                "X-RapidAPI-Key": rapidApiKey,
                "X-RapidAPI-Host": "amazon-product-search-api1.p.rapidapi.com"
              }
            });
            if (amazonRes.data?.results) {
              const mapped = amazonRes.data.results.map((r) => {
                let numericPrice = r.price || r.product_price || 0;
                let priceStr = typeof numericPrice === "number" ? `\u20B9${numericPrice.toLocaleString("en-IN")}` : numericPrice || "\u20B924,990";
                return {
                  title: r.title || r.product_title || `${queryStr} on Amazon`,
                  price: priceStr,
                  old_price: r.old_price || r.product_original_price || null,
                  thumbnail: r.thumbnail || r.product_photo || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: r.link || r.product_link || r.product_url || "",
                  source: "Amazon",
                  rating: Number(r.rating || r.product_star_rating || 4.5),
                  reviews: Number(r.reviews || Math.floor(Math.random() * 500) + 10),
                  delivery: r.delivery || "Free delivery",
                  isOriginalLink: false
                };
              });
              results = [...results, ...mapped];
            }
          } catch (e) {
            console.error("Amazon RapidAPI Error:", e.message);
          }
          try {
            const flipkartRes = await import_axios.default.get("https://flipkart-api1.p.rapidapi.com/search", {
              params: { q: queryStr },
              headers: {
                "X-RapidAPI-Key": rapidApiKey,
                "X-RapidAPI-Host": "flipkart-api1.p.rapidapi.com"
              }
            });
            if (flipkartRes.data?.results) {
              const mapped = flipkartRes.data.results.map((r) => {
                let numericPrice = r.price || 0;
                let priceStr = typeof numericPrice === "number" ? `\u20B9${numericPrice.toLocaleString("en-IN")}` : numericPrice || "\u20B924,990";
                return {
                  title: r.title || r.product_title || `${queryStr} on Flipkart`,
                  price: priceStr,
                  old_price: r.old_price || null,
                  thumbnail: r.thumbnail || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
                  link: r.link || r.product_link || `https://www.flipkart.com/search?q=${encodeURIComponent(queryStr)}`,
                  source: "Flipkart",
                  rating: Number(r.rating || 4.5),
                  reviews: Number(r.reviews || Math.floor(Math.random() * 500) + 10),
                  delivery: r.delivery || "Free delivery",
                  isOriginalLink: false
                };
              });
              results = [...results, ...mapped];
            }
          } catch (e) {
            console.error("Flipkart RapidAPI Error:", e.message);
          }
        }
      } catch (err) {
        console.error("RapidAPI Fallback Error:", err.message);
      }
    }
    if (results.length > 0 && urlToAnalyze) {
      const hasOriginal = results.some((item) => item.link === urlToAnalyze || item.isOriginalLink);
      if (!hasOriginal) {
        let sourceName = "Original Retailer";
        try {
          const sourceDomain = new URL(urlToAnalyze).hostname.replace("www.", "").split(".")[0];
          sourceName = sourceDomain.charAt(0).toUpperCase() + sourceDomain.slice(1);
        } catch (_) {
        }
        const cheapestPrice = results[0]?.price || "\u20B924,990";
        const originalItem = {
          title: `${queryStr} (Pasted Product Link)`,
          price: cheapestPrice,
          old_price: null,
          thumbnail: results[0]?.thumbnail || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
          link: urlToAnalyze,
          source: sourceName,
          rating: 4.7,
          reviews: 235,
          delivery: "Standard delivery",
          isOriginalLink: true
        };
        results.unshift(originalItem);
      }
    }
    if (results.length === 0) {
      console.log("[API Search] No API results found. Returning structured mock results.");
      results = [
        {
          title: `${queryStr} - (Amazon Official)`,
          price: "\u20B984,999",
          old_price: "\u20B999,999",
          thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
          link: urlToAnalyze || "",
          source: "Amazon",
          rating: 4.8,
          reviews: 1420,
          delivery: "Tomorrow by 9 PM",
          isOriginalLink: !!urlToAnalyze
        },
        {
          title: `${queryStr} - Pro Edition`,
          price: "\u20B982,499",
          old_price: "\u20B9102,000",
          thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
          link: "",
          source: "Flipkart",
          rating: 4.6,
          reviews: 840,
          delivery: "In 2 Days",
          isOriginalLink: false
        },
        {
          title: `${queryStr} (Store Pickup Available)`,
          price: "\u20B986,990",
          old_price: "\u20B999,990",
          thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
          link: "",
          source: "Croma",
          rating: 4.5,
          reviews: 310,
          delivery: "Store Pickup",
          isOriginalLink: false
        },
        {
          title: `${queryStr} Base Variant`,
          price: "\u20B988,000",
          old_price: "\u20B995,000",
          thumbnail: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60",
          link: "",
          source: "Reliance Digital",
          rating: 4.7,
          reviews: 980,
          delivery: "Tomorrow",
          isOriginalLink: false
        }
      ];
    }
    results.sort((a, b) => {
      const getVal = (item) => {
        const match = (item.price || "").replace(/[^0-9]/g, "");
        return parseInt(match, 10) || 0;
      };
      return getVal(a) - getVal(b);
    });
    if (!geminiCache.search) {
      geminiCache.search = {};
    }
    geminiCache.search[cacheKey] = results;
    res.json({ shopping_results: results });
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
      const serpResponse = await import_axios.default.get("https://serpapi.com/search", { params });
      return res.json(serpResponse.data.suggestions || []);
    } catch (e) {
      console.error("Autocomplete API Error:", e.response?.data || e.message);
      res.status(500).json({ error: "Failed to fetch autocomplete" });
    }
  });
  app.get("/api/travelpayouts/search", async (req, res) => {
    const { origin, destination, depart_date, return_date, adults, cabin_class, type } = req.query;
    const travelPayoutsMarker = process.env.TRAVELPAYOUTS_MARKER || "543965";
    try {
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
          departure_airport: origin?.toUpperCase() || "BOM",
          arrival_airport: destination?.toUpperCase() || "DEL",
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
          original_price: 6e3,
          flight_number: "AI-112",
          departure_time: "09:30",
          arrival_time: "11:50",
          departure_airport: origin?.toUpperCase() || "BOM",
          arrival_airport: destination?.toUpperCase() || "DEL",
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
          departure_airport: origin?.toUpperCase() || "BOM",
          arrival_airport: destination?.toUpperCase() || "DEL",
          duration: "2h 15m",
          layovers: 0,
          cabin_class: cabin_class || "Economy",
          baggage: "15kg Check-in, 7kg Cabin",
          refundable: true,
          booking_link: `https://kiwi.tpo.lu/bybnqDEf`
        }
      ];
      return res.json({ flights: mockFlights, marker: travelPayoutsMarker });
    } catch (e) {
      console.error("Travelpayouts API Error:", e.message);
      res.status(500).json({ error: "Failed to fetch flights from Travelpayouts" });
    }
  });
  app.get("/api/admin/stats", adminAuth, (req, res) => {
    try {
      const scans = getAllScans();
      const totalScans = scans.length;
      const productFreq = {};
      scans.forEach((s) => {
        productFreq[s.productName] = (productFreq[s.productName] || 0) + 1;
      });
      const mostScannedProducts = Object.entries(productFreq).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
      const categoryFreq = {};
      scans.forEach((s) => {
        const cat = s.category || "electronics";
        categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
      });
      const popularCategories = Object.entries(categoryFreq).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);
      const publicStats = getPublicStats();
      res.json({
        totalSearches: publicStats.totalSearches,
        trendingProducts: [
          { name: "iPhone 15 Pro", searches: 1200 },
          { name: "MacBook Air M3", searches: 850 },
          { name: "Sony WH-1000XM5", searches: 640 }
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
    } catch (e) {
      console.error("Admin stats compiling error:", e);
      res.json({
        totalSearches: 12450,
        trendingProducts: [
          { name: "iPhone 15 Pro", searches: 1200 },
          { name: "MacBook Air M3", searches: 850 },
          { name: "Sony WH-1000XM5", searches: 640 }
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
  app.get("/api/proxy-image", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).send("Missing url parameter");
    }
    try {
      const lowerUrl = url.toLowerCase().trim();
      if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
        return res.status(400).send("Invalid protocol. Only HTTP and HTTPS are permitted.");
      }
      if (lowerUrl.includes("localhost") || lowerUrl.includes("127.0.0.1") || lowerUrl.includes("169.254.169.254") || lowerUrl.includes("0.0.0.0") || lowerUrl.includes("::1") || lowerUrl.includes("metadata.google") || lowerUrl.includes("internal")) {
        return res.status(403).send("SSRF Protection: Access to private/internal network addresses is blocked.");
      }
      const response = await import_axios.default.get(url, { responseType: "arraybuffer", timeout: 8e3 });
      const contentType = response.headers["content-type"];
      if (contentType) {
        res.set("Content-Type", String(contentType));
      }
      res.set("Cache-Control", "public, max-age=31536000");
      res.send(response.data);
    } catch (error) {
      console.error("Image Proxy Error:", error.message);
      res.status(500).send("Failed to proxy image");
    }
  });
  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain");
    res.send("User-agent: *\nAllow: /\n\nSitemap: https://buywiser.store/sitemap.xml");
  });
  app.get("/sitemap.xml", (req, res) => {
    res.header("Content-Type", "application/xml");
    const pages = [
      "",
      "/radar",
      "/travel",
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
      const storePath = import_path2.default.join(process.cwd(), "data_store.json");
      if (import_fs2.default.existsSync(storePath)) {
        const raw = JSON.parse(import_fs2.default.readFileSync(storePath, "utf-8"));
        if (raw.deals && Array.isArray(raw.deals)) {
          raw.deals.forEach((deal) => {
            if (deal.id) {
              pages.push(`/deals#${deal.id}`);
            }
          });
        }
      }
    } catch (e) {
      console.error("Error reading deals for sitemap:", e);
    }
    const xmlUrls = pages.map((p) => `  <url>
    <loc>https://buywiser.store${p}</loc>
    <changefreq>daily</changefreq>
    <priority>${p === "" ? "1.0" : "0.8"}</priority>
  </url>`).join("\n");
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
    res.send(sitemapXml);
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  let lastUpdateId = 0;
  async function startTelegramPolling() {
    setInterval(async () => {
      try {
        const config = getTelegramConfig();
        if (!config.enabled || !config.botToken) return;
        const response = await import_axios.default.get(`https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${lastUpdateId + 1}&allowed_updates=["channel_post","message"]`);
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
              const storePath = import_path2.default.join(process.cwd(), "data_store.json");
              if (import_fs2.default.existsSync(storePath)) {
                const raw = JSON.parse(import_fs2.default.readFileSync(storePath, "utf-8"));
                if (!raw.deals) raw.deals = [];
                raw.deals.unshift(createdDeal);
                import_fs2.default.writeFileSync(storePath, JSON.stringify(raw, null, 2), "utf-8");
              }
            } catch (e) {
              console.error("Error processing polled Telegram update:", e);
            }
          }
        }
      } catch (e) {
        if (e.response && e.response.status === 401) {
        } else {
          console.error("Telegram polling error:", e.message);
        }
      }
    }, 5e3);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PriceVerse AI Server running at http://0.0.0.0:${PORT}`);
    startTelegramPolling();
  });
}
startServer().catch((err) => {
  console.error("Server failed to start:", err);
});
//# sourceMappingURL=server.cjs.map
