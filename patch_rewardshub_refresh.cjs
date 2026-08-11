const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsHub.tsx', 'utf-8');

const refreshCode = `
  const refreshProfileAndCoupons = async () => {
    try {
      const p = await fetchGamificationProfile();
      setProfile(p);
      setCoins(p.coins);
      const cRes = await fetchUserCoupons();
      if (cRes.success && cRes.coupons) setCoupons(cRes.coupons);
    } catch(e) {}
  };
`;

code = code.replace(
  /const \[tipAmount, setTipAmount\] = useState<string>\('50'\);/,
  `const [tipAmount, setTipAmount] = useState<string>('50');\n${refreshCode}`
);

// after spin celebration is dismissed
code = code.replace(
  /setIsSpinning\(false\);\n\s*setShowWinCelebration\(true\);/,
  `setIsSpinning(false);\n          setShowWinCelebration(true);\n          refreshProfileAndCoupons();`
);

// after handleRedeem
code = code.replace(
  /const result = await redeemCoinReward\(rewardType\);/,
  `const result = await redeemCoinReward(rewardType);\n      refreshProfileAndCoupons();`
);

// after mission claim
code = code.replace(
  /const result = await submitMission\(missionId\);/,
  `const result = await submitMission(missionId);\n      refreshProfileAndCoupons();`
);

fs.writeFileSync('src/components/RewardsHub.tsx', code);
