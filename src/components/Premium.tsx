import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { db, doc, setDoc } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useCurrency } from '../contexts/CurrencyContext';
import TiltedCard from './TiltedCard';

export default function Premium() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime'>('monthly');

  React.useEffect(() => {
    const handleSuccess = async (e: any) => {
      const { productId, token, couponCode } = e.detail;
      try {
        const loadingToast = toast.loading("Verifying purchase...");
        const res = await fetch('/api/verify-play-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            packageName: 'store.buywise.app',
            productId, 
            token, 
            userId: user?.uid 
          })
        });
        
        const data = await res.json();
        toast.dismiss(loadingToast);
        
        if (data.success && data.verified) {
          toast.success("Premium activated successfully!");
          setTimeout(() => window.location.reload(), 1500);
        } else if (data.pending) {
          toast.loading("Purchase is pending Google Play confirmation...");
        } else {
          toast.error(data.message || "Could not verify purchase");
        }
      } catch (err: any) {
        toast.error("Error verifying purchase");
      }
    };
    
    const handleError = (e: any) => {
      toast.error(e.detail?.message || "Purchase failed");
    };
    
    const handlePending = () => {
      toast.loading("Purchase is pending...");
    };

    window.addEventListener('buywisePurchaseSuccess', handleSuccess);
    window.addEventListener('buywisePurchaseError', handleError);
    window.addEventListener('buywisePurchasePending', handlePending);
    
    return () => {
      window.removeEventListener('buywisePurchaseSuccess', handleSuccess);
      window.removeEventListener('buywisePurchaseError', handleError);
      window.removeEventListener('buywisePurchasePending', handlePending);
    };
  }, [user]);

  
  
  
  
  
  
  

  

  

  

  
  
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
      name: 'Daily Pass',
      price: formatPrice(planPrices.daily),
      period: '/day',
      features: ['Unlimited basic comparisons', 'Limited barcode scans', 'Premium badge', 'Ad-free experience']
    },
    {
      id: 'weekly',
      name: 'Weekly Pass',
      price: formatPrice(planPrices.weekly),
      period: '/week',
      features: ['Unlimited comparisons', 'Unlimited barcode scans', 'Flight & Train Scans']
    },
    {
      id: 'monthly',
      name: 'Monthly Elite',
      price: formatPrice(planPrices.monthly),
      period: '/mo',
      features: ['All Weekly Features', 'Premium Badge', 'Ad free', 'Priority support', 'Price prediction']
    },
    {
      id: 'yearly',
      name: 'Yearly Pro',
      price: formatPrice(planPrices.yearly),
      period: '/year',
      features: [
        'All Monthly Elite Features',
        'Early deals',
        'Exclusive coupons',
        '1.5x Daily Check-in Coin Multiplier 🪙',
        'Zero Commission Flight tracking',
      ]
    },
    {
      id: 'lifetime',
      name: 'Forever Founder',
      price: formatPrice(planPrices.lifetime),
      period: '/forever',
      features: [
        'All Yearly Pro Features',
        'Unlimited AI',
        'Super Premium Verified Badge 👑',
        '2x Daily Check-in Coin Multiplier 🪙',
        'Exclusive VIP Liquidation Drops',
        'Lifetime Referral Boost (+100 Coins/user)',
        '20% discount'
      ]
    }
  ];

  const handlePurchase = async () => {
    if (!user) return;
    
    // Convert generic plan names to Google Play Billing product IDs
    const planToProductId: Record<string, string> = {
      daily: 'buywise_premium_daily',
      weekly: 'buywise_premium_weekly',
      monthly: 'buywise_premium_monthly',
      yearly: 'buywise_premium_yearly',
      lifetime: 'buywise_founder_forever'
    };
    
    const productId = planToProductId[selectedPlan];
    
    // Call Android Billing Bridge if it exists
    if (typeof window !== 'undefined' && (window as any).AndroidBillingBridge) {
      (window as any).AndroidBillingBridge.startPurchase(productId);
    } else {
      toast.error("Premium payments are currently under development.\nGoogle Play payment integration is being completed.\nPremium purchases will be available soon.", { icon: '🚧', duration: 6000 });
    }
  };

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen text-white flex flex-col gap-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4"><span className="text-[#FF3B30]">BuyWise</span> Premium</h1>
        <p className="text-white/50 tracking-widest uppercase text-xs">Unlock Unparalleled Market Intelligence</p>
      </div>

      
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={`p-5 border cursor-pointer transition-all duration-300 relative rounded-2xl overflow-hidden flex flex-col justify-between backdrop-blur-xl h-full ${
                selectedPlan === plan.id 
                  ? plan.id === 'lifetime'
                    ? 'border-yellow-400 bg-yellow-900/20 shadow-[0_0_40px_rgba(250,204,21,0.2)]'
                    : 'border-[#FF3B30] bg-[#FF3B30]/10 shadow-[0_0_30px_rgba(255,59,48,0.2)]' 
                  : plan.id === 'lifetime'
                    ? 'border-yellow-500/30 bg-black/40 shadow-[0_0_20px_rgba(234,179,8,0.05)] hover:border-yellow-400/60'
                    : 'border-white/10 bg-black/40 hover:border-white/20'
              }`}
            >
              {/* Luxury Lighting Overlay */}
              <div className={`absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300 ${
                  selectedPlan === plan.id || plan.id === 'lifetime' ? 'opacity-40' : 'opacity-0 hover:opacity-20'
                }`} 
                style={{
                  background: plan.id === 'lifetime' ? 'radial-gradient(circle at top right, rgba(250,204,21,0.4), transparent 70%)' : 'radial-gradient(circle at top right, rgba(255,255,255,0.1), transparent 70%)'
                }}
              />
              
              <div className="relative z-10">
                {plan.id === 'lifetime' && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-[8px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase shadow-lg">
                    👑 SUPER PREMIUM
                  </div>
                )}
                {plan.id === 'yearly' && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-red-600 to-[#FF3B30] text-white text-[8px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase shadow-lg">
                    ⭐ POPULAR
                  </div>
                )}
                {plan.id === 'daily' && (
                  <div className="absolute top-0 right-0 bg-white/20 text-white text-[8px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase shadow-lg">
                    QUICK ACCESS
                  </div>
                )}
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div>
                    <h3 className={`text-lg md:text-xl font-black uppercase tracking-tight ${plan.id === 'lifetime' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500' : 'text-white'}`}>{plan.name}</h3>
                    <motion.div 
                      key={plan.price}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-black text-white mt-2 drop-shadow-md"
                    >
                      {plan.price}
                      <span className="text-[10px] text-white/50 lowercase font-normal ml-1">{plan.period}</span>
                    </motion.div>
                  </div>
                  {selectedPlan === plan.id && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <ShieldCheck className={plan.id === 'lifetime' ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-[#FF3B30] drop-shadow-[0_0_10px_rgba(255,59,48,0.5)]'} size={24} />
                    </motion.div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-[11px] font-medium text-white/80 leading-normal items-start">
                      <Check size={14} className={`mt-0.5 shrink-0 ${plan.id === 'lifetime' ? 'text-yellow-400' : 'text-[#FF3B30]'}`} /> 
                      <span className={f.includes('Multiplier') || f.includes('Badge') ? 'font-bold text-white' : ''}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={(e) => {
                   e.stopPropagation();
                   setSelectedPlan(plan.id as any);
                   // setShowPayment(true);
                }}
                className={`w-full py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl relative z-10 overflow-hidden group ${
                  selectedPlan === plan.id 
                    ? plan.id === 'lifetime' 
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black shadow-lg shadow-yellow-500/20' 
                      : 'bg-gradient-to-r from-red-600 to-[#FF3B30] text-white shadow-lg shadow-red-500/20' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="relative z-10">{typeof window !== 'undefined' && (window as any).AndroidBillingBridge ? "Select Plan" : "COMING SOON"}</span>
                {selectedPlan === plan.id && (
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                )}
              </button>
            </motion.div>
          ))}
        </div>

        
        <div className="max-w-2xl mx-auto w-full pt-8">
          <button
            onClick={handlePurchase}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-[#FF3B30] text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform flex flex-col items-center justify-center gap-1"
          >
             <span>{typeof window !== 'undefined' && (window as any).AndroidBillingBridge ? "Proceed to Purchase via Google Play" : "PREMIUM PAYMENTS COMING SOON"}</span>
             {typeof window !== 'undefined' && !(window as any).AndroidBillingBridge && (
               <span className="text-[9px] text-white/70 normal-case tracking-normal font-medium mt-1">Google Play Billing integration is currently being completed.</span>
             )}
          </button>
        </div>

        

        {/* Why Choose Forever Founder Promo Section */}
        <div className="max-w-2xl mx-auto w-full border border-yellow-500/10 bg-yellow-500/[0.01] p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-500 font-mono">
            <span>👑</span> WHY_CHOOSE_FOREVER_FOUNDER?
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-black/30 p-4 border border-white/5 rounded-lg space-y-1.5">
              <h4 className="font-black uppercase text-yellow-500 text-[10px] tracking-wider">Instant Lifetime ROI</h4>
              <p className="text-white/60 leading-relaxed text-[11px]">
                Save an estimated {formatPrice(15000)}+ annually with automated real-time alerts. Zero subscription renewal fatigue ever.
              </p>
            </div>
            <div className="bg-black/30 p-4 border border-white/5 rounded-lg space-y-1.5">
              <h4 className="font-black uppercase text-yellow-500 text-[10px] tracking-wider">Double Coins Perk</h4>
              <p className="text-white/60 leading-relaxed text-[11px]">
                Unlock a massive 2x coin multiplier on Daily Check-ins, refer-a-friend bonuses, and community feedback stories!
              </p>
            </div>
            <div className="bg-black/30 p-4 border border-white/5 rounded-lg space-y-1.5">
              <h4 className="font-black uppercase text-yellow-500 text-[10px] tracking-wider">VIP Support Circle</h4>
              <p className="text-white/60 leading-relaxed text-[11px]">
                Direct priority communication loop with Awan Warsi for immediate deal verification and troubleshooting.
              </p>
            </div>
          </div>
        </div>
        
    </div>
  );
}