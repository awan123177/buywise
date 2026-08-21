const fs = require('fs');
const dbPath = 'data_store.json';
if (!fs.existsSync(dbPath)) {
  console.log("DB not found");
  process.exit(0);
}
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
let found = false;

for (const userId in db.profiles) {
  if (db.profiles[userId].email === 'mohammdsaeed24@gmail.com') {
    found = true;
    const profile = db.profiles[userId];
    profile.isPremium = true;
    profile.premiumExpiry = new Date(Date.now() + 36500 * 24 * 60 * 60 * 1000).toISOString();
    profile.activePlanName = 'Forever Founder';
    profile.activePlanId = 'lifetime';
    profile.coins = (profile.coins || 0) + 10000; // Add 10k coins
    console.log("Upgraded user:", userId);
  }
}

if (found) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log("Database updated");
} else {
  console.log("User not found in data_store.json. Creating profile...");
  const dummyId = "lifetime_user_" + Date.now();
  db.profiles[dummyId] = {
      userId: dummyId,
      email: "mohammdsaeed24@gmail.com",
      name: "Mohammd Saeed",
      coins: 10000,
      referralCode: "SAEED999",
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
      isPremium: true,
      premiumExpiry: new Date(Date.now() + 36500 * 24 * 60 * 60 * 1000).toISOString(),
      activePlanName: 'Forever Founder',
      activePlanId: 'lifetime'
  };
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log("Created user and upgraded.");
}
