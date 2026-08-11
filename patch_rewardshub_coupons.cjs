const fs = require('fs');
let code = fs.readFileSync('src/components/RewardsHub.tsx', 'utf-8');

// 1. imports
code = code.replace(
  /import \{ fetchGamificationProfile, triggerDailyCheckIn, transferCoins \} from '\.\.\/lib\/api';/,
  "import { fetchGamificationProfile, triggerDailyCheckIn, transferCoins, fetchUserCoupons } from '../lib/api';\nimport { Link } from 'react-router-dom';"
);

// 2. state
code = code.replace(
  /const \[transferAmount, setTransferAmount\] = useState\(0\);/,
  "const [transferAmount, setTransferAmount] = useState(0);\n  const [coupons, setCoupons] = useState<any[]>([]);\n  const [copiedCoupon, setCopiedCoupon] = useState<string|null>(null);"
);

// 3. fetch coupons alongside profile
code = code.replace(
  /fetchGamificationProfile\(\)\.then\(\(res\) => \{/,
  `fetchGamificationProfile().then((res) => {
        fetchUserCoupons().then(cRes => {
          if (cRes.success && cRes.coupons) setCoupons(cRes.coupons);
        }).catch(() => {});`
);

// 4. Add "My Premium Coupons" section
const couponsJSX = `
        {/* My Premium Coupons */}
        <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[40px] rounded-full pointer-events-none" />
          <h2 className="text-lg font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <Gift className="text-yellow-500" /> My Premium Coupons
          </h2>
          
          {coupons.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {coupons.map(c => (
                <div key={c.id} className={\`p-4 border rounded-xl space-y-3 \${c.status === 'active' ? 'border-[#FF3B30]/30 bg-[#FF3B30]/5' : 'border-white/10 bg-white/5 opacity-50'}\`}>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest">Coupon Code</span>
                    <span className={\`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded \${c.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}\`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="bg-black border border-white/10 p-3 rounded text-center font-mono font-bold text-white tracking-widest">
                    {c.code}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#FF3B30] font-black uppercase">{c.discountPercent}% OFF Premium</span>
                    <span className="text-white/40">Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>
                  </div>
                  {c.status === 'active' && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button 
                        onClick={() => { navigator.clipboard.writeText(c.code); setCopiedCoupon(c.code); setTimeout(() => setCopiedCoupon(null), 2000); }} 
                        className="py-2 text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white rounded transition-colors"
                      >
                        {copiedCoupon === c.code ? 'Copied!' : 'Copy Code'}
                      </button>
                      <Link 
                        to="/premium"
                        className="py-2 text-[10px] font-black uppercase tracking-widest bg-[#FF3B30] hover:bg-red-600 text-white text-center rounded transition-colors"
                      >
                        Use Coupon
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 border border-dashed border-white/10 rounded-xl bg-black/40">
              <Gift className="mx-auto mb-3 text-white/20" size={24} />
              <p className="text-sm font-bold text-white mb-1">No Premium coupons available yet.</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">
                Progress: {coins} / 1,000 points
              </p>
            </div>
          )}
        </div>
`;

code = code.replace(
  /\{\/\* Recent Transactions \*\/\}/,
  `${couponsJSX}\n\n        {/* Recent Transactions */}`
);

fs.writeFileSync('src/components/RewardsHub.tsx', code);
console.log("Patched RewardsHub");
