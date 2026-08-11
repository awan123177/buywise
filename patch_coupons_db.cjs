const fs = require('fs');
let code = fs.readFileSync('src/server/gamificationDb.ts', 'utf-8');

// 1. Add Coupon Interface
const couponInterface = `
export interface Coupon {
  id: string;
  code: string;
  userId: string;
  discountPercent: number;
  status: "active" | "redeemed" | "expired" | "disabled";
  createdAt: string;
  expiresAt: string;
  redeemedAt?: string;
  eligiblePlans: string[];
}
`;
code = code.replace(/export interface UserProfile \{/, couponInterface + "\nexport interface UserProfile {");

// 2. Add hasReceived1000PointCoupon to UserProfile
code = code.replace(/notificationsEnabled: boolean;/, "notificationsEnabled: boolean;\n  hasReceived1000PointCoupon?: boolean;");

// 3. Add coupons to DatabaseSchema
code = code.replace(/telegramConfig\?: TelegramConfig;/, "telegramConfig?: TelegramConfig;\n  coupons?: Coupon[];");

// 4. Initialize coupons in dbData
code = code.replace(/telegramConfig: getDefaultTelegramConfig\(\)/, "telegramConfig: getDefaultTelegramConfig(),\n  coupons: []");

// 5. In awardCoins, check if user hit 1000 coins and unlock coupon
const awardCoinsLogic = `
  if (profile.coins >= 1000 && !profile.hasReceived1000PointCoupon) {
    profile.hasReceived1000PointCoupon = true;
    const newCoupon: Coupon = {
      id: "coup_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      code: "BUYWISE-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId,
      discountPercent: 10, // Default 10%
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      eligiblePlans: ["daily", "weekly", "monthly", "yearly", "lifetime"]
    };
    if (!dbData.coupons) dbData.coupons = [];
    dbData.coupons.push(newCoupon);
  }
  
  saveDatabase();
`;
code = code.replace(/saveDatabase\(\);/g, (match, offset, fullString) => {
  // We only want to replace it inside awardCoins.
  return match;
});

// Since awardCoins has saveDatabase(); let's do a more specific replace.
code = code.replace(
  /(\s*\/\/ Check for streak and saving achievements!\s*)saveDatabase\(\);/,
  `$1
  if (profile.coins >= 1000 && !profile.hasReceived1000PointCoupon) {
    profile.hasReceived1000PointCoupon = true;
    const newCoupon: Coupon = {
      id: "coup_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      code: "BUYWISE-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      userId,
      discountPercent: 10,
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      eligiblePlans: ["daily", "weekly", "monthly", "yearly", "lifetime"]
    };
    if (!dbData.coupons) dbData.coupons = [];
    dbData.coupons.push(newCoupon);
  }
  saveDatabase();`
);

// Add export functions for coupons
const couponExports = `

export function getUserCoupons(userId: string): Coupon[] {
  if (!dbData.coupons) return [];
  return dbData.coupons.filter(c => c.userId === userId);
}

export function getAllCoupons(): Coupon[] {
  return dbData.coupons || [];
}

export function generateCouponForUser(userId: string, discountPercent: number, eligiblePlans?: string[]): Coupon {
  const newCoupon: Coupon = {
    id: "coup_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    code: "BUYWISE-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    userId,
    discountPercent,
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    eligiblePlans: eligiblePlans || ["daily", "weekly", "monthly", "yearly", "lifetime"]
  };
  if (!dbData.coupons) dbData.coupons = [];
  dbData.coupons.push(newCoupon);
  saveDatabase();
  return newCoupon;
}

export function updateCouponSettings(couponId: string, updates: Partial<Coupon>): { success: boolean; message: string } {
  if (!dbData.coupons) return { success: false, message: "No coupons" };
  const coupon = dbData.coupons.find(c => c.id === couponId);
  if (!coupon) return { success: false, message: "Coupon not found" };
  Object.assign(coupon, updates);
  saveDatabase();
  return { success: true, message: "Updated successfully" };
}

export function validateCoupon(userId: string, code: string, planId: string): { valid: boolean; coupon?: Coupon; error?: string } {
  if (!dbData.coupons) return { valid: false, error: "Invalid code" };
  const coupon = dbData.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (!coupon) return { valid: false, error: "Invalid coupon code" };
  if (coupon.userId !== userId) return { valid: false, error: "This coupon is registered to another account." };
  if (coupon.status === "redeemed") return { valid: false, error: "Coupon already redeemed." };
  if (coupon.status !== "active") return { valid: false, error: "Coupon is not active." };
  if (new Date(coupon.expiresAt).getTime() < Date.now()) return { valid: false, error: "Coupon expired." };
  if (!coupon.eligiblePlans.includes(planId)) return { valid: false, error: "Coupon not valid for this plan." };
  
  return { valid: true, coupon };
}

export function redeemCoupon(userId: string, code: string, planId: string): { success: boolean; error?: string } {
  const validation = validateCoupon(userId, code, planId);
  if (!validation.valid || !validation.coupon) return { success: false, error: validation.error };
  
  validation.coupon.status = "redeemed";
  validation.coupon.redeemedAt = new Date().toISOString();
  saveDatabase();
  return { success: true };
}
`;

code += couponExports;
fs.writeFileSync('src/server/gamificationDb.ts', code);
