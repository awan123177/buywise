import axios from "axios";
import toast from "react-hot-toast";

export const api = axios.create({
  baseURL: "/api",
});

export async function searchProducts(query: string, originalUrl?: string) {
  try {
    const response = await api.get("/search", { params: { q: query, originalUrl } });
    return response.data;
  } catch (error: any) {
    console.error("API search error:", error);
    toast.error(error?.response?.data?.error || "Network error. Failed to retrieve market data.");
    throw error;
  }
}

export async function fetchAdminStats() {
  try {
    const response = await api.get("/admin/stats");
    return response.data;
  } catch (error: any) {
    console.error("API admin stats error:", error);
    toast.error("Failed to load admin statistics.");
    throw error;
  }
}

// ---------------- BUYWISE GAMIFICATION CLIENT SERVICES ----------------

// 1. User Profile Setup / Retrieval
export async function fetchGamificationProfile() {
  try {
    const response = await api.get("/gamification/profile");
    return response.data;
  } catch (e: any) {
    console.error("fetchGamificationProfile error:", e);
    throw e;
  }
}

// 2. Trigger Daily Login check and check streak
export async function triggerDailyCheckIn() {
  try {
    const response = await api.post("/gamification/login");
    const { coinsAwarded, streak } = response.data;
    if (coinsAwarded > 0) {
      toast.success(`Daily Login: +${coinsAwarded} BuyWise Coins earned! Streak: ${streak} days 🔥`);
    }
    return response.data;
  } catch (e: any) {
    console.error("triggerDailyCheckIn error:", e);
    throw e;
  }
}

// 3. Log a Product Search to earn coins and check achievements
export async function logSearchAction(queryText: string) {
  try {
    const response = await api.post("/gamification/search", { query: queryText });
    const { coinsAwarded, savedAmount, referralReward } = response.data;
    if (coinsAwarded > 0) {
      toast.success(`Price Search! +${coinsAwarded} BuyWise Coins earned! 🔍`);
    }
    if (savedAmount > 0) {
      toast.success(`You saved ₹${savedAmount} comparing prices on this item! 💰`, {
        icon: "💡"
      });
    }
    if (referralReward && referralReward.triggered) {
      toast.success(`Referral Activated! Both you and your friend earned bonus Coins! 🤝`, {
        duration: 5000
      });
    }
    return response.data;
  } catch (e: any) {
    console.error("logSearchAction error:", e);
  }
}

// 4. Social Sharing Coins Reward
export async function logSocialShare() {
  try {
    const response = await api.post("/gamification/share");
    const { gained } = response.data;
    toast.success(`Shared successfully! +${gained} BuyWise Coins earned! 📲`);
    return response.data;
  } catch (e: any) {
    toast.error("Failed to register share bonus.");
    throw e;
  }
}

// 5. Merchant Review Coins Reward
export async function logReviewAction() {
  try {
    const response = await api.post("/gamification/review");
    const { gained } = response.data;
    toast.success(`Review submitted! +${gained} BuyWise Coins earned! ⭐`);
    return response.data;
  } catch (e: any) {
    toast.error("Failed to register review bonus.");
    throw e;
  }
}

// 5a. Fetch All Application/Community Reviews
export async function fetchReviews() {
  try {
    const response = await api.get("/gamification/reviews");
    return response.data;
  } catch (e: any) {
    console.error("fetchReviews error:", e);
    throw e;
  }
}

// 5b. Submit Application/Community Review
export async function submitUserReview(rating: number, comment: string) {
  try {
    const response = await api.post("/gamification/reviews", { rating, comment });
    const { success, coinsAwarded } = response.data;
    if (success) {
      toast.success(`Review posted successfully! +${coinsAwarded} BuyWise Coins awarded! ⭐`, {
        icon: "💎",
        duration: 5000
      });
    }
    return response.data;
  } catch (e: any) {
    const errMsg = e.response?.data?.error || "Failed to submit review.";
    toast.error(errMsg);
    throw e;
  }
}

// 6. Complete Profile Reward
export async function logProfileComplete() {
  try {
    const response = await api.post("/gamification/profile-complete");
    const { gained } = response.data;
    toast.success(`Profile updated! +${gained} BuyWise Coins earned! 🎉`);
    return response.data;
  } catch (e: any) {
    console.error("logProfileComplete error:", e);
  }
}

// 7. Get Transaction history
export async function fetchCoinTransactions() {
  try {
    const response = await api.get("/gamification/transactions");
    return response.data;
  } catch (e: any) {
    console.error("fetchCoinTransactions error:", e);
    throw e;
  }
}

// 8. Fetch Achievements with completion flags
export async function fetchAchievements() {
  try {
    const response = await api.get("/gamification/achievements");
    return response.data;
  } catch (e: any) {
    console.error("fetchAchievements error:", e);
    throw e;
  }
}

// 9. Enter Referral Code
export async function submitReferral(referralCode: string) {
  try {
    const response = await api.post("/gamification/referral/join", { referralCode });
    const { success, message, referrerName } = response.data;
    if (success) {
      toast.success(message || `Referral code verified! Referrer: ${referrerName}`);
    } else {
      toast.error(message || "Failed to apply referral code.");
    }
    return response.data;
  } catch (e: any) {
    const errMsg = e.response?.data?.error || "Network error while submitting referral code.";
    toast.error(errMsg);
    throw e;
  }
}

// 10. Fetch Referral Metrics & History for Referral Dashboard
export async function fetchReferralsDashboard() {
  try {
    const response = await api.get("/gamification/referral/stats");
    return response.data;
  } catch (e: any) {
    console.error("fetchReferralsDashboard error:", e);
    throw e;
  }
}

// 11. Fetch Leaderboard ranked top 100 users
export async function fetchLeaderboard(metric: "coins" | "referrals" | "searches" | "savings" = "coins") {
  try {
    const response = await api.get(`/gamification/leaderboard`, { params: { metric } });
    return response.data;
  } catch (e: any) {
    console.error("fetchLeaderboard error:", e);
    throw e;
  }
}

// 12. Redeem Coins for Rewards
export async function redeemCoinReward(rewardType: "discount" | "trial" | "deal" | "badge") {
  try {
    const response = await api.post("/gamification/redeem", { rewardType });
    const { success, message } = response.data;
    if (success) {
      toast.success(`Redemption Successful!`, { icon: "🎁" });
    } else {
      toast.error(message || "Failed to redeem reward.");
    }
    return response.data;
  } catch (e: any) {
    const errMsg = e.response?.data?.error || "Failed to process redemption.";
    toast.error(errMsg);
    throw e;
  }
}

// 12.5. Transfer Coins
export async function transferCoins(toUserId: string, amount: number) {
  try {
    const response = await api.post("/gamification/transfer", { toUserId, amount });
    const { success, message } = response.data;
    if (success) {
      toast.success(message);
    } else {
      toast.error(message || "Failed to transfer coins.");
    }
    return response.data;
  } catch (e: any) {
    const errMsg = e.response?.data?.error || "Failed to transfer coins.";
    toast.error(errMsg);
    throw e;
  }
}

// 13. Public Savings Counter (Smooth Dynamic Live Counter)
export async function fetchPublicSavingsStats() {
  try {
    const response = await api.get("/gamification/public-stats");
    return response.data;
  } catch (e: any) {
    console.error("fetchPublicSavingsStats error:", e);
    throw e;
  }
}

// 14. Fetch Curated Deals
export async function fetchCuratedDeals(params: { category?: string; type?: string; limit?: number }) {
  try {
    const response = await api.get("/gamification/deals", { params });
    return response.data;
  } catch (e: any) {
    console.error("fetchCuratedDeals error:", e);
    throw e;
  }
}

// 15. Record interaction on Deal (Save / Share / View)
export async function triggerDealAction(dealId: string, action: "save" | "share" | "view") {
  try {
    const response = await api.post("/gamification/deals/action", { dealId, action });
    return response.data;
  } catch (e: any) {
    console.error("triggerDealAction error:", e);
  }
}

// 16. Update Notification Toggles & Preferences
export async function updateNotificationSettings(enabled: boolean, preferences?: { morning: boolean; afternoon: boolean; evening: boolean }) {
  try {
    const response = await api.post("/gamification/notifications/preferences", { enabled, preferences });
    if (response.data.success) {
      toast.success("Notification preferences updated!");
    }
    return response.data;
  } catch (e: any) {
    toast.error("Failed to update notification settings.");
    throw e;
  }
}

// 17. Admin Dashboard Gamification Actions
export async function runAdminGamificationAction(action: string, payload: any) {
  try {
    const response = await api.post("/gamification/admin/action", { action, payload });
    if (response.data.success || response.data.coins !== undefined) {
      toast.success("Admin action completed successfully!");
    } else {
      toast.error(response.data.message || "Admin action failed.");
    }
    return response.data;
  } catch (e: any) {
    toast.error("Admin operation failed.");
    throw e;
  }
}

// 18. Admin Get Users list
export async function adminFetchUsers() {
  try {
    const response = await api.get("/gamification/admin/users");
    return response.data;
  } catch (e: any) {
    console.error("adminFetchUsers error:", e);
    throw e;
  }
}

// 19. Admin Get Referrals list
export async function adminFetchReferrals() {
  try {
    const response = await api.get("/gamification/admin/referrals");
    return response.data;
  } catch (e: any) {
    console.error("adminFetchReferrals error:", e);
    throw e;
  }
}
