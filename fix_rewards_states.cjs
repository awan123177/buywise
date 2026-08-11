const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsHub.tsx', 'utf-8');

// Ensure import has fetchUserCoupons
if (!code.includes('fetchUserCoupons')) {
  code = code.replace(/spinWheelDaily, submitMission\n\} from '\.\.\/lib\/api';/, `spinWheelDaily, submitMission, fetchUserCoupons\n} from '../lib/api';`);
}

// Ensure states are defined
if (!code.includes('const [coupons')) {
  code = code.replace(/const \[submittingReview, setSubmittingReview\] = useState<boolean>\(false\);/, `const [submittingReview, setSubmittingReview] = useState<boolean>(false);\n  const [coupons, setCoupons] = useState<any[]>([]);\n  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);`);
}

// Remove setCoins calls because it's derived from profile
code = code.replace(/setCoins\(p\.coins\);/g, ``);

fs.writeFileSync('src/components/RewardsHub.tsx', code);
