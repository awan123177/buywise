const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf-8');

code = code.replace(
  /import \{ fetchGamificationProfile, deleteAccountAndData \} from '\.\.\/lib\/api';/,
  "import { fetchGamificationProfile, deleteAccountAndData } from '../lib/api';\nimport CouponRewardModal from './CouponRewardModal';"
);

code = code.replace(
  /const \[coins, setCoins\] = useState<number>\(0\);/,
  "const [coins, setCoins] = useState<number>(0);\n  const [showCouponModal, setShowCouponModal] = useState(false);"
);

// inside useEffect, after setting coins:
code = code.replace(
  /setCoins\(profile\.coins\);/,
  `setCoins(profile.coins);
          if (profile.hasReceived1000PointCoupon && !localStorage.getItem('1000_point_coupon_seen')) {
             setShowCouponModal(true);
             localStorage.setItem('1000_point_coupon_seen', 'true');
          }`
);

// add the modal before </nav>
code = code.replace(
  /<\/nav>/,
  `  {showCouponModal && <CouponRewardModal isOpen={showCouponModal} onClose={() => setShowCouponModal(false)} />}
    </nav>`
);

fs.writeFileSync('src/components/Navbar.tsx', code);
