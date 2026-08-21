import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Check, ReceiptText, Gift, Crown, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { db, doc, setDoc } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useCurrency } from '../contexts/CurrencyContext';
import TiltedCard from './TiltedCard';
import FounderMysteryBox from './FounderMysteryBox';

export default function Premium() {
  const { user, refreshPremium } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime'>('lifetime');
  const [isFounder, setIsFounder] = useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const userId = user?.uid || (user as any)?.id;
      if (userId) {
        try {
          const res = await fetch('/api/gamification/profile', {
            headers: {
              'x-user-id': userId,
              'x-user-email': user?.email || '',
              'x-user-name': user?.displayName || user?.email?.split('@')[0] || 'User'
            }
          });
          if (res.ok) {
            const data = await res.json();
            const planId = data.activePlanId || data.profile?.activePlanId;
            const planName = data.activePlanName || data.profile?.activePlanName || '';
            const isSuperFounder = data.superEnhancedFounderBadge || data.profile?.superEnhancedFounderBadge;
            if (planId === 'lifetime' || planId === 'buywise_founder_forever' || planName.toLowerCase().includes('founder') || isSuperFounder) {
              setIsFounder(true);
            }
          }
        } catch (err) {
          console.warn("Could not fetch user profile details:", err);
        }
      }
    };
    fetchProfile();
  }, [user]);

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
        
        const contentType = res.headers.get('content-type') || '';
        let data: any = {};
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          data = { success: false, message: `Server error (${res.status})` };
        }
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
      features: ['Unlimited comparisons', 'Unlimited barcode scans', 'Premium Support']
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
        'Advanced price tracking',
      ]
    },
    {
      id: 'lifetime',
      name: 'Forever Founder',
      price: formatPrice(planPrices.lifetime),
      period: '/forever',
      features: [
        '🎁 Guaranteed Forever Founder Mystery Box (10,000 Coins)',
        '🏆 Super Enhanced Founder Badge — Lifetime ♾️',
        '⚡ 2x Daily Check-in Coin Multiplier 🪙',
        'All Yearly Pro Features',
        'Unlimited AI Market Intelligence',
        'Exclusive VIP Liquidation Drops',
        'Lifetime Referral Boost (+100 Coins/user)',
        '20% Lifetime Discount across partner stores'
      ]
    }
  ];

  // Removed PayU redirect status effect and submitPayuForm function

  const [isProcessing, setIsProcessing] = useState(false);
  const handlePurchase = async (planToPurchase: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime' = selectedPlan) => {
    if (isProcessing) return;
    if (!user) {
      toast.error("Please login to view premium options.");
      return;
    }
    
    setIsProcessing(true);

    // Call Android Billing Bridge if it exists in WebView
    if (typeof window !== 'undefined' && (window as any).AndroidBillingBridge) {
      const planToProductId: Record<string, string> = {
        daily: 'buywise_premium_daily',
        weekly: 'buywise_premium_weekly',
        monthly: 'buywise_premium_monthly',
        yearly: 'buywise_premium_yearly',
        lifetime: 'buywise_founder_forever'
      };
      
      const productId = planToProductId[planToPurchase];
      (window as any).AndroidBillingBridge.startPurchase(productId);
      setIsProcessing(false);
    } else {
      toast.info("Payment gateway integration is coming soon! Online purchases will be enabled shortly.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen text-white flex flex-col gap-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4"><span className="text-[#FF3B30]">BuyWise</span> Premium</h1>
        <p className="text-white/50 tracking-widest uppercase text-xs">Unlock Unparalleled Market Intelligence</p>
      </div>

      
          
      {/* FOREVER FOUNDER SUPER ENHANCED BAR FOR ACTIVE FOUNDERS */}
      {isFounder && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full relative rounded-2xl overflow-hidden border border-yellow-400 bg-gradient-to-r from-yellow-900/40 via-black/80 to-yellow-950/40 shadow-[0_0_50px_rgba(250,204,21,0.15)] p-8 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl founder-glowing-container"
        >
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.15),transparent_70%)]" />
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="text-yellow-400" size={24} />
              <span className="text-yellow-400 font-black tracking-widest text-sm uppercase">FOREVER FOUNDER 👑</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 mb-2">
              Lifetime BuyWise Premium
            </h2>
            <p className="text-white/80 font-medium tracking-wide">
              Thank you for being one of our earliest supporters. You have unlocked unlimited lifetime access.
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <div className="px-6 py-3 rounded-xl bg-yellow-500/20 border border-yellow-400/50 flex flex-col items-center justify-center">
              <Sparkles className="text-yellow-400 mb-1" size={20} />
              <span className="text-yellow-400 font-black uppercase tracking-widest text-[10px]">Status Active</span>
              <span className="text-white font-bold text-sm uppercase">Founder Privileges Unlocked</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            id={plan.id === 'lifetime' ? 'forever-founder-plan-card' : undefined}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => setSelectedPlan(plan.id as any)}
            className={`p-5 border cursor-pointer transition-all duration-300 relative rounded-2xl overflow-hidden flex flex-col justify-between backdrop-blur-xl h-full ${
              plan.id === 'lifetime' ? 'founder-glowing-container ' : ''
            }${
              selectedPlan === plan.id 
                ? plan.id === 'lifetime'
                  ? 'border-yellow-400 bg-yellow-900/20 shadow-[0_0_40px_rgba(250,204,21,0.2)]'
                  : 'border-[#FF3B30] bg-[#FF3B30]/10 shadow-[0_0_30px_rgba(255,59,48,0.2)]' 
                : plan.id === 'lifetime'
                  ? 'border-yellow-500/40 bg-gradient-to-b from-yellow-950/20 to-black/60 shadow-[0_0_25px_rgba(234,179,8,0.1)] hover:border-yellow-400'
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
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-500 text-black text-[8px] font-black tracking-widest px-3 py-1 rounded-bl-xl uppercase shadow-lg flex items-center gap-1">
                    <Crown size={10} /> SUPER PRESTIGE
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
                    <h3 className={`text-lg md:text-xl font-black uppercase tracking-tight ${plan.id === 'lifetime' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500' : 'text-white'}`}>{plan.name}</h3>
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

                {/* Lifetime Mystery Box Bonus Ribbon */}
                {plan.id === 'lifetime' && (
                  <div className="mb-4 p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-[10px] text-yellow-300 font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <Gift size={13} className="text-yellow-400 shrink-0" />
                    <span>INCLUDES 10,000 COINS MYSTERY BOX</span>
                  </div>
                )}

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2.5 text-[11px] font-medium text-white/80 leading-normal items-start">
                      <Check size={14} className={`mt-0.5 shrink-0 ${plan.id === 'lifetime' ? 'text-yellow-400' : 'text-[#FF3B30]'}`} /> 
                      <span className={f.includes('Mystery Box') || f.includes('Multiplier') || f.includes('Badge') ? 'font-bold text-yellow-300' : ''}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id as any);
                    handlePurchase(plan.id as any);
                  }}
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                    plan.id === 'lifetime'
                      ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-black hover:scale-105 hover:shadow-[0_0_25px_rgba(250,204,21,0.4)]'
                      : plan.id === 'yearly'
                        ? 'bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 hover:scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 border border-white/10'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Clock size={13} className="shrink-0" />
                  <span>BUY NOW — COMING SOON</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        
        {/* FOREVER FOUNDER EXCLUSIVE MYSTERY BOX SECTION */}
        <FounderMysteryBox 
          onSelectFounderPlan={() => {
            setSelectedPlan('lifetime');
            handlePurchase('lifetime');
          }}
          onPlanPurchased={() => {
            refreshPremium();
          }}
        />

        <div className="max-w-2xl mx-auto w-full pt-4 flex flex-col items-center gap-4">
          <button
            onClick={() => navigate('/my-receipts')}
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
          >
            <ReceiptText size={14} className="text-[#FF3B30]" />
            <span>View My Purchase Receipts & Invoices</span>
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