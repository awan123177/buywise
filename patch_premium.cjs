const fs = require('fs');

const premiumCode = `import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Check, Clock, Gift, Copy, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { useCurrency } from '../contexts/CurrencyContext';
import TiltedCard from './TiltedCard';
import { fetchUserCoupons, validateCoupon } from '../lib/api';

export default function Premium() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('monthly');

  React.useEffect(() => {
    if (user) {
      fetchUserCoupons().then(res => {
        if (res.success && res.coupons) setCoupons(res.coupons);
      }).catch(() => {});
    }
  }, [user]);

  const handleApplyCoupon = async (planId: string) => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await validateCoupon(couponInput.trim(), planId);
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

  const getDiscountedPrice = (price: number) => {
    if (appliedCoupon) {
      return price - (price * (appliedCoupon.discountPercent / 100));
    }
    return price;
  };

  const planPrices = {
    daily: 10,
    weekly: 30,
    monthly: 100,
    yearly: 500,
    lifetime: 700
  };

  const plans = [
    {
      id: 'daily',
      name: 'DAILY PREMIUM',
      price: planPrices.daily,
      duration: '1 day',
      renew: 'No automatic renewal',
      color: 'from-gray-500 to-gray-400',
      productId: 'buywise_premium_daily',
      features: [
        'Half of Weekly features',
        'Unlimited comparisons',
        'Basic barcode scanning',
        'Basic Premium badge',
      ]
    },
    {
      id: 'weekly',
      name: 'WEEKLY PASS',
      price: planPrices.weekly,
      duration: '7 days',
      renew: 'No automatic renewal',
      color: 'from-blue-600 to-blue-400',
      productId: 'buywise_premium_weekly',
      features: [
        'All Core Premium features',
        'Unlimited scans & comparisons',
        'Ad-free experience',
        'Standard Premium Badge',
      ]
    },
    {
      id: 'monthly',
      name: 'MONTHLY ELITE',
      price: planPrices.monthly,
      duration: '1 month',
      renew: 'No automatic renewal',
      color: 'from-purple-600 to-[#FF3B30]',
      productId: 'buywise_premium_monthly',
      popular: true,
      features: [
        'All Weekly features',
        'Priority price alerts',
        'Elite Gold Badge',
        'Early access to deals',
        'Enhanced AI Analytics'
      ]
    },
    {
      id: 'yearly',
      name: 'YEARLY PRO',
      price: planPrices.yearly,
      duration: '1 year',
      renew: 'No automatic renewal',
      color: 'from-[#FF3B30] to-orange-500',
      productId: 'buywise_premium_yearly',
      features: [
        'All Monthly Elite features',
        'Maximum price alerts',
        'Pro Diamond Badge',
        'Dedicated VIP Support',
        'Max Savings Mode'
      ]
    },
    {
      id: 'lifetime',
      name: 'FOREVER FOUNDER',
      price: planPrices.lifetime,
      duration: 'Lifetime',
      renew: 'One-time purchase',
      color: 'from-yellow-600 to-yellow-500',
      productId: 'buywise_founder_forever',
      features: [
        'Never expires',
        'All Yearly Pro features forever',
        'Exclusive Founder Badge',
        'Direct access to Founder',
        'Permanent VIP status'
      ]
    }
  ];

  const handlePlayBilling = async (productId: string, planId: string) => {
    if (!user) {
      toast.error('Please login to activate Premium.');
      return;
    }

    try {
      // 1. Check if Digital Goods API is available (for web TWA)
      if ('getDigitalGoodsService' in window) {
        // @ts-ignore
        const service = await window.getDigitalGoodsService('https://play.google.com/billing');
        const details = await service.getDetails([productId]);
        if (details.length === 0) {
          toast.error('Product not found on Play Store');
          return;
        }

        // Web Payments Request API
        const request = new PaymentRequest([{
          supportedMethods: 'https://play.google.com/billing',
          data: { sku: productId }
        }], {
          total: {
            label: 'Total',
            amount: { currency: 'INR', value: getDiscountedPrice(planPrices[planId as keyof typeof planPrices]).toString() }
          }
        });

        const paymentResponse = await request.show();
        
        // 2. Send purchase token to backend for verification
        const res = await fetch('/api/google-play/verify-purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
             productId: productId,
             purchaseToken: paymentResponse.details.token,
             couponCode: appliedCoupon ? appliedCoupon.code : undefined
          })
        });

        const verificationResult = await res.json();
        
        if (verificationResult.success) {
          await paymentResponse.complete('success');
          toast.success('Premium activated successfully!');
          window.location.href = '/premium/success';
        } else {
          await paymentResponse.complete('fail');
          toast.error(verificationResult.error || 'Failed to verify purchase with backend.');
        }

      } else {
        // For local development or non-TWA web, show a mock dialog if explicitly allowed, 
        // but since this is production Android flow, we should fail or bridge to native.
        // If wrapped in a native flutter/capacitor app, they would inject a JS interface here.
        if (window.AndroidBillingBridge) {
             // @ts-ignore
             window.AndroidBillingBridge.startPurchase(productId, appliedCoupon ? appliedCoupon.code : null);
        } else {
             toast.error('Google Play Billing is not available in this environment.');
        }
      }
    } catch (error: any) {
      console.error('Play Billing error:', error);
      toast.error('Payment cancelled or failed.');
    }
  };

  const handleRestorePurchases = async () => {
    toast('Checking Google Play for previous purchases...', { icon: '🔄' });
    try {
       const res = await fetch('/api/google-play/restore-purchases', { method: 'POST' });
       const data = await res.json();
       if (data.success) {
          toast.success('Purchases restored! Premium is active.');
       } else {
          toast.error('No active subscriptions found.');
       }
    } catch(e) {
       toast.error('Failed to restore purchases.');
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <ShieldCheck size={14} /> BuyWise Premium
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
          Unlock the Ultimate <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-orange-500">
            Shopping Power
          </span>
        </h1>
        
        <p className="text-white/60 text-sm md:text-base leading-relaxed font-medium max-w-2xl mx-auto">
          No automatic renewals. Pay once for your selected period and enjoy Premium access until it expires.
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
         <button onClick={handleRestorePurchases} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-full transition-colors border border-white/10 flex items-center gap-2">
            <Clock size={12} /> Restore Purchases
         </button>
      </div>

      {user && coupons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto w-full mb-8 p-6 border border-[#FF3B30]/20 bg-[#FF3B30]/5 rounded-2xl"
        >
          <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-[#FF3B30] flex items-center gap-2">
            <Gift size={16} /> Available Coupons
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map((c, idx) => (
              <div key={c.id} className={\`p-4 border rounded-xl flex items-center justify-between \${c.status === 'active' ? 'border-[#FF3B30]/30 bg-black/50' : 'border-white/10 bg-white/5 opacity-50'}\`}>
                 <div>
                    <span className="font-mono text-xs font-bold tracking-widest text-white">{c.code}</span>
                    <p className="text-[#FF3B30] font-black text-sm">{c.discountPercent}% OFF</p>
                 </div>
                 {c.status === 'active' && (
                    <button onClick={() => { setCouponInput(c.code); toast.success('Coupon applied to input, select a plan to apply'); }} className="px-3 py-1.5 bg-[#FF3B30]/20 hover:bg-[#FF3B30]/30 text-[#FF3B30] text-[10px] font-bold uppercase tracking-widest rounded transition-colors">
                      Use Code
                    </button>
                 )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-black/50 border border-white/10 rounded-xl space-y-3">
             <label className="block text-[10px] font-black uppercase tracking-widest text-white/50">Have a Coupon?</label>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={couponInput}
                 onChange={e => setCouponInput(e.target.value.toUpperCase())}
                 placeholder="Enter code"
                 className="flex-1 bg-black border border-white/10 px-4 py-2 text-xs outline-none focus:border-[#FF3B30] font-mono tracking-widest uppercase transition-colors rounded"
               />
               <button
                 type="button"
                 onClick={() => handleApplyCoupon(selectedPlanId)}
                 disabled={validatingCoupon || !couponInput.trim()}
                 className="px-6 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest transition-colors rounded disabled:opacity-50"
               >
                 {validatingCoupon ? '...' : 'Apply'}
               </button>
             </div>
             {appliedCoupon && (
               <p className="text-xs text-green-400 font-bold uppercase tracking-wider flex items-center gap-2">
                 <Check size={14} /> Coupon Applied: {appliedCoupon.discountPercent}% OFF selected plan
               </p>
             )}
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedPlanId(plan.id)}
            className={\`relative p-6 rounded-3xl border \${selectedPlanId === plan.id ? 'border-[#FF3B30] bg-[#FF3B30]/5 scale-[1.02]' : 'border-white/10 bg-[#0a0a0a]'} transition-all cursor-pointer flex flex-col h-full\`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-red-600 to-[#FF3B30] rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-500/20 whitespace-nowrap">
                Most Popular
              </div>
            )}
            
            <div className="space-y-4 flex-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                {plan.name}
              </h3>
              
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-medium text-white/50">₹</span>
                  <span className="text-4xl font-black text-white">
                     {getDiscountedPrice(plan.price)}
                  </span>
                </div>
                {appliedCoupon && (
                  <p className="text-[10px] text-green-400 font-bold line-through mt-1">₹{plan.price}</p>
                )}
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">{plan.duration}</p>
                <p className="text-[9px] font-bold text-[#FF3B30] uppercase tracking-wider mt-1">{plan.renew}</p>
              </div>

              <div className="h-px w-full bg-white/10" />
              
              <ul className="space-y-3 py-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                    <Check size={14} className="text-[#FF3B30] shrink-0 mt-0.5" />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedPlanId(plan.id);
                handlePlayBilling(plan.productId, plan.id); 
              }}
              className={\`w-full mt-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl relative overflow-hidden group \${
                selectedPlanId === plan.id 
                  ? plan.id === 'lifetime' 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                    : 'bg-gradient-to-r from-red-600 to-[#FF3B30] text-white shadow-lg shadow-red-500/20' 
                  : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
              }\`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">BUY WITH GOOGLE PLAY</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
`

fs.writeFileSync('src/components/Premium.tsx', premiumCode);
console.log('Replaced Premium.tsx');
