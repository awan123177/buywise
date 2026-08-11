const fs = require('fs');
let code = fs.readFileSync('src/components/Premium.tsx', 'utf-8');

// 1. imports
code = code.replace(
  /import TiltedCard from '.\/TiltedCard';/,
  "import TiltedCard from './TiltedCard';\nimport { fetchUserCoupons, validateCoupon } from '../lib/api';\nimport { Copy, Gift, ArrowRight } from 'lucide-react';"
);

// 2. state variables
code = code.replace(
  /const \[selectedPlan, setSelectedPlan\] = useState/,
  `const [coupons, setCoupons] = React.useState<any[]>([]);
  const [couponInput, setCouponInput] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = React.useState(false);
  
  React.useEffect(() => {
    if (user) {
      fetchUserCoupons().then(res => {
        if (res.success && res.coupons) setCoupons(res.coupons);
      }).catch(() => {});
    }
  }, [user]);
  
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await validateCoupon(couponInput.trim(), selectedPlan);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        toast.success(\`\${res.coupon.discountPercent}% discount applied!\`);
      } else {
        toast.error(res.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (e) {
      toast.error('Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };
  
  const [selectedPlan, setSelectedPlan] = useState`
);

// 3. update final price based on appliedCoupon
code = code.replace(
  /const planPrices = \{/,
  `const getDiscountedPrice = (price: number) => {
    if (appliedCoupon) {
      return price - (price * (appliedCoupon.discountPercent / 100));
    }
    return price;
  };
  const planPrices = {`
);

// Wait, the plan rendering uses planPrices directly. Let's make sure manual payment uses the discounted price.
// Replace planPrices[selectedPlan] with getDiscountedPrice(planPrices[selectedPlan]) in manual payment view
code = code.replace(
  /\$\{planPrices\[selectedPlan\]\}/g,
  "${getDiscountedPrice(planPrices[selectedPlan])}"
);
code = code.replace(
  /formatPrice\(planPrices\[selectedPlan\]\)/g,
  "formatPrice(getDiscountedPrice(planPrices[selectedPlan]))"
);

// 4. Add "My Coupons" section below the pricing grid.
// Find the end of the pricing grid:
const myCouponsJSX = `
        {/* My Coupons Section */}
        {user && coupons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto w-full mt-12 mb-8 p-8 border border-white/10 bg-[#0a0a0a] rounded-2xl"
          >
            <h3 className="text-xl font-black uppercase tracking-widest mb-6 text-yellow-500 flex items-center gap-3">
              <Gift className="text-yellow-500" /> My Coupons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c, idx) => (
                <div key={c.id} className={\`p-5 border rounded-xl space-y-3 \${c.status === 'active' ? 'border-[#FF3B30]/30 bg-[#FF3B30]/5' : 'border-white/10 bg-white/5 opacity-50'}\`}>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-sm font-bold tracking-widest bg-black px-2 py-1 rounded border border-white/10">{c.code}</span>
                    <span className={\`text-[10px] font-black uppercase px-2 py-1 rounded \${c.status === 'active' ? 'bg-green-500/20 text-green-400' : c.status === 'redeemed' ? 'bg-white/10 text-white/50' : 'bg-red-500/20 text-red-400'}\`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black text-white">{c.discountPercent}% OFF</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Expires: {new Date(c.expiresAt).toLocaleDateString()}</p>
                  </div>
                  {c.status === 'active' && (
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Copied!'); }} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex justify-center items-center gap-1">
                        <Copy size={12} /> Copy
                      </button>
                      <button onClick={() => { setCouponInput(c.code); window.scrollTo({top: 0, behavior: 'smooth'}); toast.success('Coupon applied to input, select a plan to continue'); }} className="flex-1 py-2 bg-[#FF3B30]/20 hover:bg-[#FF3B30]/30 text-[#FF3B30] text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex justify-center items-center gap-1">
                        Apply <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
`;

code = code.replace(
  /<\/div>\n\s*<\/div>\n\s*<\/>\n\s*\) : \(\n\s*<motion\.div/g,
  `</div>\n        </div>\n        ${myCouponsJSX}\n        </>\n      ) : (\n        <motion.div`
);

// 5. Add Coupon Input to the manual payment form
const couponInputJSX = `
            {/* Coupon Section */}
            <div className="border border-white/10 bg-white/5 p-5 rounded-lg space-y-4">
               <label className="block text-[10px] font-black uppercase tracking-widest text-white/50">Have a Coupon?</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={couponInput}
                   onChange={e => setCouponInput(e.target.value.toUpperCase())}
                   placeholder="Enter code"
                   className="flex-1 bg-black border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#FF3B30] font-mono tracking-widest uppercase transition-colors rounded"
                 />
                 <button
                   type="button"
                   onClick={handleApplyCoupon}
                   disabled={validatingCoupon || !couponInput.trim()}
                   className="px-6 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest transition-colors rounded disabled:opacity-50"
                 >
                   {validatingCoupon ? '...' : 'Apply'}
                 </button>
               </div>
               {appliedCoupon && (
                 <p className="text-xs text-green-400 font-bold uppercase tracking-wider flex items-center gap-2">
                   <Check size={14} /> Coupon Applied: {appliedCoupon.discountPercent}% OFF
                 </p>
               )}
            </div>
`;

// Insert it before the verification times box
code = code.replace(
  /\{\/\* Verification Times inside Payment Box \*\/\}/g,
  `${couponInputJSX}\n          {/* Verification Times inside Payment Box */}`
);

// 6. Handle Google Play Billing limitation logic
// In handlePlayBilling, add a check for appliedCoupon:
code = code.replace(
  /const handlePlayBilling = async \(planId: string\) => \{/,
  `const handlePlayBilling = async (planId: string) => {
    if (appliedCoupon) {
      toast.error('Coupons cannot be applied via Google Play Billing directly. Please use web checkout.', { duration: 5000 });
      // You could optionally redirect to web checkout here.
      return;
    }`
);

fs.writeFileSync('src/components/Premium.tsx', code);
