const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsHub.tsx', 'utf-8');

code = code.replace(
  /fetchGamificationProfile\(\),/,
  `fetchGamificationProfile(), fetchUserCoupons(),`
);

code = code.replace(
  /const \[profData, txnData, achData, refData, lBoardData, reviewsData\] = await Promise\.all\(\[/,
  `const [profData, couponsData, txnData, achData, refData, lBoardData, reviewsData] = await Promise.all([`
);

code = code.replace(
  /setProfile\(profData\);/,
  `setProfile(profData);
      if (couponsData && couponsData.success) {
        setCoupons(couponsData.coupons || []);
      }`
);

fs.writeFileSync('src/components/RewardsHub.tsx', code);
