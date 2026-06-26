import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "data_store.json");

// Types for the Gamification Database
export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  coins: number;
  referralCode: string;
  referredBy: string | null;
  searchesCount: number;
  totalSaved: number;
  lastSearchDate: string | null; // YYYY-MM-DD
  lastLoginDate: string | null; // YYYY-MM-DD
  streakCount: number;
  lastStreakCheckDate: string | null; // YYYY-MM-DD
  achievements: string[]; // unlocked achievement IDs
  notificationsEnabled: boolean;
  notificationPreferences: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  bannedReferrals: boolean;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredEmail: string;
  referredName: string;
  status: "pending" | "successful" | "banned";
  timestamp: string;
}

export interface Deal {
  id: string;
  title: string;
  category: "electronics" | "fashion" | "home" | "grocery" | "gaming" | "mobiles" | "laptops";
  oldPrice: number;
  newPrice: number;
  discountPercent: number;
  thumbnail: string;
  source: string;
  link: string;
  isBestSeller: boolean;
  isEditorPick: boolean;
  isFlashDeal: boolean;
  views: number;
  saves: number;
  purchases: number;
  createdAt: string;
  timeRemaining?: string; // e.g. "04h 21m"
}

export interface PublicStats {
  totalSearches: number;
  totalUsers: number;
  productsCompared: number;
  priceAlertsTriggered: number;
  dealsFoundToday: number;
  activePremiumUsers: number;
  totalSavedAmount: number;
}

export interface UserReview {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  coinsEarned: number;
  timestamp: string;
}

export interface DatabaseSchema {
  profiles: { [userId: string]: UserProfile };
  transactions: CoinTransaction[];
  referrals: Referral[];
  deals: Deal[];
  publicStats: PublicStats;
  bannedUsers: string[];
  reviews?: UserReview[];
}

// High-quality real product images from Unsplash to display beautiful photos of the products
export const PRODUCT_IMAGES: { [id: string]: string } = {
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

// Initial Mock Deals
const INITIAL_DEALS: Deal[] = [
  {
    id: "deal_iphone_15",
    title: "Apple iPhone 15 (128 GB) - Black",
    category: "mobiles",
    oldPrice: 79900,
    newPrice: 65999,
    discountPercent: 17,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=iphone15",
    source: "Amazon.in",
    link: "https://amazon.in/dp/B0CHX1W18X",
    isBestSeller: true,
    isEditorPick: false,
    isFlashDeal: true,
    views: 1840,
    saves: 345,
    purchases: 120,
    createdAt: new Date().toISOString(),
    timeRemaining: "05h 12m"
  },
  {
    id: "deal_macbook_air",
    title: "Apple MacBook Air Laptop M3 (13.6-inch, 8GB RAM, 256GB SSD)",
    category: "laptops",
    oldPrice: 114900,
    newPrice: 94990,
    discountPercent: 17,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=macbookm3",
    source: "Flipkart.com",
    link: "https://flipkart.com",
    isBestSeller: false,
    isEditorPick: true,
    isFlashDeal: false,
    views: 1250,
    saves: 420,
    purchases: 85,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_sony_xm5",
    title: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
    category: "electronics",
    oldPrice: 34990,
    newPrice: 25990,
    discountPercent: 26,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=sonyxm5",
    source: "Croma.com",
    link: "https://croma.com",
    isBestSeller: true,
    isEditorPick: true,
    isFlashDeal: false,
    views: 920,
    saves: 185,
    purchases: 54,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_rog_ally",
    title: "ASUS ROG Ally RC71L Handheld Gaming Console (AMD Ryzen Z1)",
    category: "gaming",
    oldPrice: 69990,
    newPrice: 44990,
    discountPercent: 36,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=rogally",
    source: "VijaySales.com",
    link: "https://vijaysales.com",
    isBestSeller: false,
    isEditorPick: true,
    isFlashDeal: true,
    views: 1480,
    saves: 310,
    purchases: 72,
    createdAt: new Date().toISOString(),
    timeRemaining: "02h 45m"
  },
  {
    id: "deal_oneplus_ce4",
    title: "OnePlus Nord CE4 (8GB RAM, 128GB Storage)",
    category: "mobiles",
    oldPrice: 24990,
    newPrice: 21999,
    discountPercent: 12,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=nordce4",
    source: "RelianceDigital.in",
    link: "https://reliancedigital.in",
    isBestSeller: true,
    isEditorPick: false,
    isFlashDeal: false,
    views: 2200,
    saves: 560,
    purchases: 198,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_nike_air",
    title: "Nike Air Max Pulse Mens Running Shoes/Sneakers",
    category: "fashion",
    oldPrice: 13995,
    newPrice: 8990,
    discountPercent: 36,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=nikepulse",
    source: "TataCliq.com",
    link: "https://tatacliq.com",
    isBestSeller: false,
    isEditorPick: false,
    isFlashDeal: false,
    views: 750,
    saves: 112,
    purchases: 43,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_boat_ion",
    title: "boAt Nirvana Ion True Wireless Earbuds with 120H Playback",
    category: "electronics",
    oldPrice: 7990,
    newPrice: 1999,
    discountPercent: 75,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=boation",
    source: "Amazon.in",
    link: "https://amazon.in",
    isBestSeller: true,
    isEditorPick: false,
    isFlashDeal: true,
    views: 3100,
    saves: 850,
    purchases: 450,
    createdAt: new Date().toISOString(),
    timeRemaining: "11h 05m"
  },
  {
    id: "deal_dyson_v12",
    title: "Dyson V12 Detect Slim Cordless Vacuum Cleaner",
    category: "home",
    oldPrice: 55900,
    newPrice: 45900,
    discountPercent: 18,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=dysonv12",
    source: "Croma.com",
    link: "https://croma.com",
    isBestSeller: false,
    isEditorPick: true,
    isFlashDeal: false,
    views: 610,
    saves: 95,
    purchases: 28,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_prestige_kettle",
    title: "Prestige Electric Kettle PKOSS 1.5 Litre 1500W",
    category: "home",
    oldPrice: 1895,
    newPrice: 899,
    discountPercent: 52,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=prestigekettle",
    source: "Flipkart.com",
    link: "https://flipkart.com",
    isBestSeller: true,
    isEditorPick: false,
    isFlashDeal: false,
    views: 1100,
    saves: 190,
    purchases: 135,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_tea_gold",
    title: "Tata Tea Gold Leaf Premium Black Tea (1kg)",
    category: "grocery",
    oldPrice: 620,
    newPrice: 489,
    discountPercent: 21,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=tatateagold",
    source: "JioMart.com",
    link: "https://jiomart.com",
    isBestSeller: false,
    isEditorPick: false,
    isFlashDeal: false,
    views: 450,
    saves: 45,
    purchases: 62,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_ps5_slim",
    title: "Sony PlayStation 5 Slim (PS5) Disc Edition Console",
    category: "gaming",
    oldPrice: 54990,
    newPrice: 49490,
    discountPercent: 10,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=ps5slim",
    source: "Amazon.in",
    link: "https://amazon.in",
    isBestSeller: true,
    isEditorPick: false,
    isFlashDeal: false,
    views: 1950,
    saves: 480,
    purchases: 105,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_casio_watch",
    title: "Casio Vintage Digital Dial Unisex Metal Watch - A158WA",
    category: "fashion",
    oldPrice: 1695,
    newPrice: 1355,
    discountPercent: 20,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=casiowatch",
    source: "Flipkart.com",
    link: "https://flipkart.com",
    isBestSeller: false,
    isEditorPick: true,
    isFlashDeal: false,
    views: 840,
    saves: 120,
    purchases: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_under_500_bottle",
    title: "Milton Thermosteel Duo Deluxe 500ml Water Bottle",
    category: "home",
    oldPrice: 790,
    newPrice: 449,
    discountPercent: 43,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=miltonduo",
    source: "Amazon.in",
    link: "https://amazon.in",
    isBestSeller: true,
    isEditorPick: false,
    isFlashDeal: false,
    views: 1200,
    saves: 220,
    purchases: 154,
    createdAt: new Date().toISOString()
  },
  {
    id: "deal_under_1000_tshirt",
    title: "Puma Classic Regular Fit Men's Sports Polo T-Shirt",
    category: "fashion",
    oldPrice: 1999,
    newPrice: 949,
    discountPercent: 53,
    thumbnail: "https://api.dicebear.com/7.x/identicon/svg?seed=pumatshirt",
    source: "Myntra.com",
    link: "https://myntra.com",
    isBestSeller: false,
    isEditorPick: true,
    isFlashDeal: false,
    views: 640,
    saves: 95,
    purchases: 32,
    createdAt: new Date().toISOString()
  }
];

// Initial Leaderboard Profiles (Mock Top Users to make leaderboard feel premium)
const INITIAL_PROFILES: { [userId: string]: UserProfile } = {
  "user_top_1": {
    userId: "user_top_1",
    email: "aman.kapoor@gmail.com",
    name: "Aman Kapoor",
    coins: 1450,
    referralCode: "AMAN145",
    referredBy: null,
    searchesCount: 452,
    totalSaved: 48900,
    lastSearchDate: new Date().toISOString().split("T")[0],
    lastLoginDate: new Date().toISOString().split("T")[0],
    streakCount: 42,
    lastStreakCheckDate: new Date().toISOString().split("T")[0],
    achievements: ["first_search", "first_referral", "100_searches", "premium_purchase", "saved_1000", "saved_10000", "streak_3", "streak_7", "streak_30"],
    notificationsEnabled: true,
    notificationPreferences: { morning: true, afternoon: false, evening: true },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
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
    lastSearchDate: new Date().toISOString().split("T")[0],
    lastLoginDate: new Date().toISOString().split("T")[0],
    streakCount: 25,
    lastStreakCheckDate: new Date().toISOString().split("T")[0],
    achievements: ["first_search", "first_referral", "100_searches", "saved_1000", "saved_10000", "streak_3", "streak_7"],
    notificationsEnabled: true,
    notificationPreferences: { morning: true, afternoon: true, evening: true },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
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
    lastSearchDate: new Date().toISOString().split("T")[0],
    lastLoginDate: new Date().toISOString().split("T")[0],
    streakCount: 18,
    lastStreakCheckDate: new Date().toISOString().split("T")[0],
    achievements: ["first_search", "first_referral", "100_searches", "saved_1000", "saved_10000", "streak_3", "streak_7"],
    notificationsEnabled: false,
    notificationPreferences: { morning: false, afternoon: false, evening: false },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
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
    lastSearchDate: new Date().toISOString().split("T")[0],
    lastLoginDate: new Date().toISOString().split("T")[0],
    streakCount: 14,
    lastStreakCheckDate: new Date().toISOString().split("T")[0],
    achievements: ["first_search", "first_referral", "100_searches", "saved_1000", "saved_10000", "streak_3", "streak_7"],
    notificationsEnabled: true,
    notificationPreferences: { morning: true, afternoon: false, evening: true },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
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
    lastSearchDate: new Date().toISOString().split("T")[0],
    lastLoginDate: new Date().toISOString().split("T")[0],
    streakCount: 9,
    lastStreakCheckDate: new Date().toISOString().split("T")[0],
    achievements: ["first_search", "saved_1000", "streak_3", "streak_7"],
    notificationsEnabled: true,
    notificationPreferences: { morning: true, afternoon: false, evening: false },
    bannedReferrals: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
};

// Initial Mock Reviews
const INITIAL_REVIEWS: UserReview[] = [
  {
    id: "rev_1",
    userId: "user_top_1",
    userName: "Aman Kapoor",
    userEmail: "aman.kapoor@gmail.com",
    rating: 5,
    comment: "Absolutely game-changing shopping app! I saved nearly ₹4,500 on my iPhone 15 using the real-time competitor price comparison. Highly recommended!",
    coinsEarned: 15,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rev_2",
    userId: "user_top_2",
    userName: "Priya Verma",
    userEmail: "priya.verma@yahoo.com",
    rating: 5,
    comment: "The interactive 3D product viewer is incredible! It let me inspect the camera bump and port alignments of the phone before purchasing. Unbelievably high fidelity.",
    coinsEarned: 15,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "rev_3",
    userId: "user_top_3",
    userName: "Ritesh Sharma",
    userEmail: "ritesh.sharma@gmail.com",
    rating: 4,
    comment: "Using the flight tracking tool, I planned my trip from Delhi to Mumbai and snagged flights at the lowest rate in INR. Excellent utility integrations.",
    coinsEarned: 15,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Default DB instance
let dbData: DatabaseSchema = {
  profiles: { ...INITIAL_PROFILES },
  transactions: [],
  referrals: [],
  deals: INITIAL_DEALS.map(deal => ({
    ...deal,
    thumbnail: PRODUCT_IMAGES[deal.id] || deal.thumbnail
  })),
  publicStats: {
    totalSearches: 24590,
    totalUsers: 1420,
    productsCompared: 48900,
    priceAlertsTriggered: 1240,
    dealsFoundToday: 240,
    activePremiumUsers: 125,
    totalSavedAmount: 1842590
  },
  bannedUsers: [],
  reviews: [...INITIAL_REVIEWS]
};

// Load database from file
export function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const loaded = JSON.parse(content);
      
      const loadedDeals = loaded.deals && loaded.deals.length > 0 ? loaded.deals : [...INITIAL_DEALS];
      const mappedDeals = loadedDeals.map((deal: any) => ({
        ...deal,
        thumbnail: PRODUCT_IMAGES[deal.id] || deal.thumbnail
      }));

      // Merge with initial deals and profiles in case structure changed
      dbData = {
        profiles: { ...INITIAL_PROFILES, ...loaded.profiles },
        transactions: loaded.transactions || [],
        referrals: loaded.referrals || [],
        deals: mappedDeals,
        publicStats: loaded.publicStats || { ...dbData.publicStats },
        bannedUsers: loaded.bannedUsers || [],
        reviews: loaded.reviews || [...INITIAL_REVIEWS]
      };
      console.log("Database successfully loaded from with product photos mapped,", DB_FILE);
    } else {
      saveDatabase();
    }
  } catch (e: any) {
    console.error("Failed to load gamification database:", e.message);
  }
}

// Save database to file
export function saveDatabase() {
  try {
    // Ensure dir exists
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf-8");
  } catch (e: any) {
    console.error("Failed to save gamification database:", e.message);
  }
}

// Automatically load database on startup
loadDatabase();

// ---------------------- DATABASE ACTIONS ----------------------

// Get Public Stats (with random real-time tiny increments to simulate active usage!)
export function getPublicStats(): PublicStats {
  const currentHour = new Date().getHours();
  // Simulate active community saving money
  const incrementSaved = Math.floor(Math.random() * 8) + 2; // ₹2 - ₹10
  const incrementSearches = Math.random() > 0.7 ? 1 : 0;
  
  dbData.publicStats.totalSavedAmount += incrementSaved;
  dbData.publicStats.totalSearches += incrementSearches;
  dbData.publicStats.productsCompared += incrementSearches * (Math.floor(Math.random() * 3) + 2);

  if (Math.random() > 0.95) {
    dbData.publicStats.priceAlertsTriggered += 1;
    dbData.publicStats.totalUsers += Math.random() > 0.9 ? 1 : 0;
  }
  
  // Throttle saving frequency
  if (incrementSaved > 0 || incrementSearches > 0) {
    saveDatabase();
  }
  
  return dbData.publicStats;
}

// Get User Profile or Initialize
export function getOrCreateProfile(userId: string, email: string, name: string): UserProfile {
  let profile = dbData.profiles[userId];
  
  if (!profile) {
    // Generate unique referral code (e.g. AMAN145 or USER_123)
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
      createdAt: new Date().toISOString()
    };
    dbData.profiles[userId] = profile;
    dbData.publicStats.totalUsers += 1;
    saveDatabase();
  } else {
    // Update name if changed
    if (name && profile.name !== name) {
      profile.name = name;
      saveDatabase();
    }
  }

  return profile;
}

// Record Coin Transaction
export function awardCoins(userId: string, amount: number, reason: string): { coins: number; gained: number; transaction: CoinTransaction } {
  const profile = dbData.profiles[userId];
  if (!profile) throw new Error("Profile not found");

  profile.coins += amount;
  if (profile.coins < 0) profile.coins = 0; // Prevent negative coins

  const transaction: CoinTransaction = {
    id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    amount,
    reason,
    timestamp: new Date().toISOString()
  };

  dbData.transactions.unshift(transaction);
  
  // Check for streak and saving achievements!
  saveDatabase();

  return { coins: profile.coins, gained: amount, transaction };
}

// Get Transactions List for User
export function getTransactions(userId: string): CoinTransaction[] {
  return dbData.transactions.filter(t => t.userId === userId);
}

// Record User Daily Login Streak Check
export function checkLoginStreak(userId: string): { coinsAwarded: number; streak: number; triggeredAchievements: string[] } {
  const profile = dbData.profiles[userId];
  if (!profile) return { coinsAwarded: 0, streak: 0, triggeredAchievements: [] };

  const todayStr = new Date().toISOString().split("T")[0];
  const lastLogin = profile.lastLoginDate;
  
  let coinsAwarded = 0;
  let triggeredAchievements: string[] = [];

  if (lastLogin === todayStr) {
    // Already checked in today
    return { coinsAwarded: 0, streak: profile.streakCount, triggeredAchievements: [] };
  }

  // Update last login
  profile.lastLoginDate = todayStr;

  if (!lastLogin) {
    // Brand new login
    profile.streakCount = 1;
    profile.lastStreakCheckDate = todayStr;
    // Award 5 coins for login
    const result = awardCoins(userId, 5, "Daily login reward");
    coinsAwarded += 5;
  } else {
    const lastLoginDate = new Date(lastLogin);
    const todayDate = new Date(todayStr);
    const diffTime = Math.abs(todayDate.getTime() - lastLoginDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive login!
      profile.streakCount += 1;
      profile.lastStreakCheckDate = todayStr;
      
      let streakBonus = 5; // standard daily login
      let streakReason = `Daily login (Streak: ${profile.streakCount} days)`;

      // Milestone bonuses
      if (profile.streakCount === 3) {
        streakBonus += 15;
        streakReason += " + 3-Day Streak bonus!";
        triggeredAchievements.push("streak_3");
      } else if (profile.streakCount === 7) {
        streakBonus += 100; // 7-day milestone
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
        streakBonus += 1000;
        streakReason += " + 365-Day Streak legendary bonus!";
        triggeredAchievements.push("streak_365");
      }

      awardCoins(userId, streakBonus, streakReason);
      coinsAwarded += streakBonus;
    } else if (diffDays > 1) {
      // Streak broken!
      profile.streakCount = 1;
      profile.lastStreakCheckDate = todayStr;
      awardCoins(userId, 5, "Daily login reward (Streak reset)");
      coinsAwarded += 5;
    } else {
      // Same day login, no extra coins
    }
  }

  // Check achievements unlock
  triggeredAchievements.forEach(achId => {
    unlockAchievement(userId, achId);
  });

  saveDatabase();
  return { coinsAwarded, streak: profile.streakCount, triggeredAchievements };
}

// Record Search & Award Coins
export function recordSearch(userId: string, queryText: string): { coinsAwarded: number; searchesCount: number; savedAmount: number; unlockedAchievements: string[] } {
  const profile = dbData.profiles[userId];
  if (!profile) return { coinsAwarded: 0, searchesCount: 0, savedAmount: 0, unlockedAchievements: [] };

  const todayStr = new Date().toISOString().split("T")[0];
  let coinsAwarded = 0;
  let unlockedAchievements: string[] = [];

  // Update searches counts
  profile.searchesCount += 1;
  
  // Simulate money saved on this comparison (₹50 - ₹450)
  const savedThisTime = Math.floor(50 + Math.random() * 400);
  profile.totalSaved += savedThisTime;

  // First search of the day
  if (profile.lastSearchDate !== todayStr) {
    profile.lastSearchDate = todayStr;
    awardCoins(userId, 2, "First search of the day bonus");
    coinsAwarded += 2;
  }

  // Every 10 product searches (+5 coins)
  if (profile.searchesCount % 10 === 0) {
    awardCoins(userId, 5, `10 Searches milestone bonus (${profile.searchesCount} searches completed)`);
    coinsAwarded += 5;
  }

  // Check achievement unlocks
  if (profile.searchesCount === 1) {
    if (unlockAchievement(userId, "first_search")) unlockedAchievements.push("first_search");
  }
  if (profile.searchesCount >= 100) {
    if (unlockAchievement(userId, "100_searches")) unlockedAchievements.push("100_searches");
  }
  if (profile.searchesCount >= 1000) {
    if (unlockAchievement(userId, "1000_searches")) unlockedAchievements.push("1000_searches");
  }
  if (profile.totalSaved >= 1000) {
    if (unlockAchievement(userId, "saved_1000")) unlockedAchievements.push("saved_1000");
  }
  if (profile.totalSaved >= 10000) {
    if (unlockAchievement(userId, "saved_10000")) unlockedAchievements.push("saved_10000");
  }

  // Sync public stats
  dbData.publicStats.totalSearches += 1;
  dbData.publicStats.productsCompared += 3;
  dbData.publicStats.totalSavedAmount += savedThisTime;

  saveDatabase();
  return { coinsAwarded, searchesCount: profile.searchesCount, savedAmount: savedThisTime, unlockedAchievements };
}

// Submit Referral Code (By Friend)
export function submitReferralCode(friendId: string, referralCode: string): { success: boolean; message: string; referrerName?: string } {
  const friendProfile = dbData.profiles[friendId];
  if (!friendProfile) return { success: false, message: "Friend profile not found" };

  if (friendProfile.referredBy) {
    return { success: false, message: "You have already been referred." };
  }

  // Find Referrer
  const referrerProfile = Object.values(dbData.profiles).find(p => p.referralCode.toUpperCase() === referralCode.toUpperCase());
  if (!referrerProfile) {
    return { success: false, message: "Invalid referral code." };
  }

  if (referrerProfile.userId === friendId) {
    return { success: false, message: "Self-referrals are strictly prohibited." };
  }

  // Check duplicate referral (same email or IP check, email is reliable)
  const isDuplicate = dbData.referrals.some(r => r.referredEmail === friendProfile.email && r.referrerId === referrerProfile.userId);
  if (isDuplicate) {
    return { success: false, message: "This email has already been referred." };
  }

  // Create Pending Referral
  const referral: Referral = {
    id: `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    referrerId: referrerProfile.userId,
    referredId: friendId,
    referredEmail: friendProfile.email,
    referredName: friendProfile.name,
    status: "pending",
    timestamp: new Date().toISOString()
  };

  friendProfile.referredBy = referrerProfile.userId;
  dbData.referrals.push(referral);

  saveDatabase();
  return { success: true, message: "Referral code applied successfully! Coins will activate after your first search.", referrerName: referrerProfile.name };
}

// Complete Referral (After Friend's First Search)
export function checkAndCompleteReferral(friendId: string): { triggered: boolean; referrerName?: string; coinsEarned?: number } {
  const referral = dbData.referrals.find(r => r.referredId === friendId && r.status === "pending");
  if (!referral) return { triggered: false };

  // Check if referrer or friend is banned
  const referrerProfile = dbData.profiles[referral.referrerId];
  const friendProfile = dbData.profiles[friendId];
  if (!referrerProfile || !friendProfile) return { triggered: false };

  if (referrerProfile.bannedReferrals || dbData.bannedUsers.includes(referral.referrerId)) {
    referral.status = "banned";
    saveDatabase();
    return { triggered: false };
  }

  // Complete Referral
  referral.status = "successful";

  // Award Referrer (+50 coins)
  awardCoins(referral.referrerId, 50, `Referral bonus for inviting ${friendProfile.name}`);
  // Award Friend (+20 coins)
  awardCoins(friendId, 20, `Referral bonus for joining via ${referrerProfile.name}'s link`);

  // Unlock Referrer Achievements
  unlockAchievement(referral.referrerId, "first_referral");
  
  // Count total successful referrals for referrer
  const succCount = dbData.referrals.filter(r => r.referrerId === referral.referrerId && r.status === "successful").length;
  if (succCount >= 5) {
    unlockAchievement(referral.referrerId, "referral_master");
  }

  saveDatabase();
  return { triggered: true, referrerName: referrerProfile.name, coinsEarned: 20 };
}

// Get Referral Dashboard Stats
export function getReferralStats(userId: string) {
  const profile = dbData.profiles[userId];
  if (!profile) return null;

  const userRefs = dbData.referrals.filter(r => r.referrerId === userId);
  const total = userRefs.length;
  const successful = userRefs.filter(r => r.status === "successful").length;
  const pending = userRefs.filter(r => r.status === "pending").length;
  const coinsEarned = successful * 50;

  return {
    referralCode: profile.referralCode,
    referralLink: `https://buywise.app/ref/${profile.referralCode}`,
    total,
    successful,
    pending,
    coinsEarned,
    history: userRefs.map(r => ({
      name: r.referredName,
      email: r.referredEmail,
      status: r.status,
      timestamp: r.timestamp,
      reward: r.status === "successful" ? "+50 Coins" : r.status === "pending" ? "Pending Search" : "No Reward (Banned)"
    }))
  };
}

// Get Leaderboard (Top 100 Ranked dynamically)
export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  coins: number;
  referralsCount: number;
  searchesCount: number;
  savingsCount: number;
  badge: string | null;
  userId: string;
}

export function getLeaderboard(metric: "coins" | "referrals" | "searches" | "savings"): LeaderboardUser[] {
  const list = Object.values(dbData.profiles).map(p => {
    const refsCount = dbData.referrals.filter(r => r.referrerId === p.userId && r.status === "successful").length;
    return {
      userId: p.userId,
      name: p.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.email}`,
      coins: p.coins,
      referralsCount: refsCount,
      searchesCount: p.searchesCount,
      savingsCount: p.totalSaved,
    };
  });

  // Sort based on metric
  list.sort((a, b) => {
    if (metric === "coins") return b.coins - a.coins;
    if (metric === "referrals") return b.referralsCount - a.referralsCount;
    if (metric === "searches") return b.searchesCount - a.searchesCount;
    return b.savingsCount - a.savingsCount;
  });

  return list.slice(0, 100).map((user, idx) => {
    const rank = idx + 1;
    let badge = null;
    if (rank === 1) badge = "🏆 Champion";
    else if (rank === 2) badge = "🥈 Elite Tracker";
    else if (rank === 3) badge = "🥉 Deal Sniper";
    else if (rank <= 10) badge = "💎 Platinum Tracker";
    else if (rank <= 25) badge = "⭐ Gold Hunter";
    else if (rank <= 50) badge = "🎖️ Price Master";

    return {
      rank,
      ...user,
      badge
    };
  });
}

// Achievements Definitions
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  coinsReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_search", title: "First Search", description: "Completed your first price comparison search", icon: "🔍", coinsReward: 10 },
  { id: "first_referral", title: "First Referral", description: "Successfully invited your first friend to BuyWise", icon: "🤝", coinsReward: 50 },
  { id: "100_searches", title: "Centurion Explorer", description: "Completed 100 price comparison searches", icon: "💯", coinsReward: 150 },
  { id: "1000_searches", title: "Millennium Legend", description: "Completed 1000 price comparison searches", icon: "🚀", coinsReward: 500 },
  { id: "premium_purchase", title: "Premium Pioneer", description: "Subscribed to a BuyWise Premium Membership", icon: "👑", coinsReward: 100 },
  { id: "saved_1000", title: "Thrifty Saver", description: "Saved ₹1,000 on purchase price comparisons", icon: "💰", coinsReward: 50 },
  { id: "saved_10000", title: "Arbitrage Maestro", description: "Saved ₹10,000 on purchase price comparisons", icon: "🏦", coinsReward: 250 },
  { id: "streak_3", title: "3-Day Fire", description: "Used BuyWise for 3 consecutive days", icon: "🔥", coinsReward: 15 },
  { id: "streak_7", title: "7-Day Week Warrior", description: "Used BuyWise for 7 consecutive days", icon: "⚡", coinsReward: 100 },
  { id: "streak_30", title: "Monthly Devotee", description: "Used BuyWise for 30 consecutive days", icon: "📅", coinsReward: 300 },
  { id: "referral_master", title: "Referral Master", description: "Invited 5 or more friends who completed searches", icon: "🌟", coinsReward: 250 },
  { id: "deal_hunter", title: "Deal Hunter", description: "Saved or shared 10 trending or daily deals", icon: "🎯", coinsReward: 50 }
];

// Unlock Achievement
export function unlockAchievement(userId: string, achievementId: string): boolean {
  const profile = dbData.profiles[userId];
  if (!profile) return false;

  if (profile.achievements.includes(achievementId)) {
    return false; // Already unlocked
  }

  const def = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!def) return false;

  profile.achievements.push(achievementId);
  awardCoins(userId, def.coinsReward, `Unlocked achievement: ${def.title}`);
  
  saveDatabase();
  return true;
}

// Redeem Coins for Rewards
export function redeemReward(userId: string, rewardType: string): { success: boolean; message: string; coinsRemaining: number } {
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
    // Mock premium activation
    // We can insert a premium request in Supabase if needed, or simply unlock in profile.
    // Let's grant immediate mock premium status by registering a mock approved request!
  } else if (rewardType === "deal") {
    cost = 50;
    rewardMessage = "Unlocked Exclusive Secret Deal! Check your email for details.";
  } else if (rewardType === "badge") {
    cost = 150;
    rewardMessage = "Coins Legend custom profile badge unlocked!";
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

// ---------------------- ADMIN METHODS ----------------------

export function adminAction(action: string, payload: any) {
  const { userId, amount, reason, referralId, dealId, stats, notification } = payload;

  if (action === "add_coins") {
    return awardCoins(userId, Number(amount), reason || "Admin discretionary bonus");
  }

  if (action === "remove_coins") {
    return awardCoins(userId, -Number(amount), reason || "Admin adjustment");
  }

  if (action === "ban_referral") {
    const ref = dbData.referrals.find(r => r.id === referralId);
    if (ref) {
      ref.status = "banned";
      // Dock coins if already approved
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
    const deal = dbData.deals.find(d => d.id === dealId);
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
    return { success: true, message: `Broadcast notification successfully pushed to users: "${notification?.title || 'Daily Best Deal'}"` };
  }

  return { success: false, message: "Unknown admin action" };
}

// ---------------------- REVIEWS OPERATIONS ----------------------

export function getReviews(): UserReview[] {
  return dbData.reviews || [];
}

export function submitReview(userId: string, email: string, name: string, rating: number, comment: string): { success: boolean; review: UserReview; coinsAwarded: number } {
  const profile = getOrCreateProfile(userId, email, name);
  const rewardCoinsAmount = 15; // Earn 15 coins for submitting a detailed review!
  
  const review: UserReview = {
    id: `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    userName: name || "Anonymous User",
    userEmail: email,
    rating,
    comment: comment.trim(),
    coinsEarned: rewardCoinsAmount,
    timestamp: new Date().toISOString()
  };

  if (!dbData.reviews) {
    dbData.reviews = [];
  }
  
  dbData.reviews.unshift(review);

  // Award user the review coins
  awardCoins(userId, rewardCoinsAmount, "Submitted a detailed user review and app feedback");

  // Unlock 'deal_hunter' achievement if they submit a review
  unlockAchievement(userId, "deal_hunter");

  saveDatabase();

  return {
    success: true,
    review,
    coinsAwarded: rewardCoinsAmount
  };
}
