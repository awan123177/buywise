const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf-8');

const newApiFunctions = `
// 22. Fetch user coupons
export async function fetchUserCoupons() {
  try {
    const response = await api.get("/gamification/coupons");
    return response.data;
  } catch (e: any) {
    console.error("fetchUserCoupons error:", e);
    throw e;
  }
}

// 23. Validate Coupon
export async function validateCoupon(code: string, planId: string) {
  try {
    const response = await api.post("/gamification/coupons/validate", { code, planId });
    return response.data;
  } catch (e: any) {
    console.error("validateCoupon error:", e);
    throw e;
  }
}

// 24. Redeem Coupon (Admin/Internal use, or pre-verification)
export async function redeemCoupon(code: string, planId: string) {
  try {
    const response = await api.post("/gamification/coupons/redeem", { code, planId });
    return response.data;
  } catch (e: any) {
    console.error("redeemCoupon error:", e);
    throw e;
  }
}

// 25. Admin Fetch Coupons
export async function adminFetchCoupons() {
  try {
    const response = await api.get("/gamification/admin/coupons");
    return response.data;
  } catch (e: any) {
    console.error("adminFetchCoupons error:", e);
    throw e;
  }
}

// 26. Admin Generate Coupon
export async function adminGenerateCoupon(userId: string, discountPercent: number) {
  try {
    const response = await api.post("/gamification/admin/coupons/generate", { userId, discountPercent });
    return response.data;
  } catch (e: any) {
    console.error("adminGenerateCoupon error:", e);
    throw e;
  }
}

// 27. Admin Update Coupon
export async function adminUpdateCoupon(couponId: string, updates: any) {
  try {
    const response = await api.post("/gamification/admin/coupons/update", { couponId, updates });
    return response.data;
  } catch (e: any) {
    console.error("adminUpdateCoupon error:", e);
    throw e;
  }
}
`;

code += newApiFunctions;
fs.writeFileSync('src/lib/api.ts', code);
