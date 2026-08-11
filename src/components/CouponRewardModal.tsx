import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, X, Copy, Check } from 'lucide-react';
import { fetchUserCoupons } from '../lib/api';
import toast from 'react-hot-toast';

export default function CouponRewardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(10);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUserCoupons().then(res => {
        if (res.success && res.coupons && res.coupons.length > 0) {
          // Find active coupon
          const active = res.coupons.find((c: any) => c.status === 'active');
          if (active) {
             setCouponCode(active.code);
             setDiscount(active.discountPercent);
          }
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-sm w-full relative overflow-hidden"
        >
          {/* Confetti / Glow effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#FF3B30]/20 blur-[60px] pointer-events-none" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col items-center text-center space-y-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)]">
              <Gift size={32} className="text-black" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-widest text-yellow-500">CONGRATULATIONS!</h2>
              <p className="text-sm text-white/70">You've reached 1,000 points.</p>
            </div>

            <div className="w-full bg-black/50 border border-white/10 p-6 rounded-xl space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#FF3B30]">Premium Reward</p>
               <p className="text-xs text-white/60">Your exclusive coupon is ready.</p>
               
               <div className="bg-white/5 border border-white/10 p-4 rounded-lg font-mono text-lg font-bold tracking-widest text-white">
                  {couponCode || "LOADING..."}
               </div>

               <p className="text-lg font-black text-yellow-500">{discount}% OFF PREMIUM</p>
            </div>

            <button
              onClick={() => {
                if (couponCode) {
                   navigator.clipboard.writeText(couponCode);
                   setCopied(true);
                   toast.success("Coupon code copied!");
                   setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? "COPIED!" : "COPY CODE"}
            </button>
            
            
            <button
              onClick={() => {
                onClose();
                window.location.href = '/premium';
              }}
              className="w-full py-4 bg-[#FF3B30] hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              USE COUPON
            </button>
            <button
              onClick={onClose}
              className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition-colors font-bold"
            >
              Close
            </button>
  
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
