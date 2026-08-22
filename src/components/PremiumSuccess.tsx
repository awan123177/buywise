import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, XCircle, ChevronRight, Crown, RefreshCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PremiumSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshPremium } = useAuth();
  
  const urlStatus = searchParams.get('status');

  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'cancelled'>(() => {
    if (urlStatus === 'failed') return 'failed';
    if (urlStatus === 'cancelled') return 'cancelled';
    return 'pending';
  });
  const [failureReason, setFailureReason] = useState(() => {
    if (urlStatus === 'cancelled') return "Payment was cancelled.";
    if (urlStatus === 'failed') return "Payment failed. No Premium access was activated.";
    return '';
  });
  
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (hasVerified.current) return;

    // 1. Immediately handle terminal status from URL (already initialized in state)
    if (status === 'failed' || status === 'cancelled') {
        hasVerified.current = true;
        return;
    }

    let isMounted = true;
    let timeoutId: any;
    let attemptCount = 0;
    
    // Max verification time = 30 seconds
    const maxTime = 30 * 1000;
    const startTime = Date.now();

    const checkStatus = async () => {
      if (!isMounted || hasVerified.current) return;
      
      const timeElapsed = Date.now() - startTime;
      if (timeElapsed >= maxTime) {
          if (isMounted) {
              setStatus('failed');
              setFailureReason("Payment verification is taking longer than expected. Please try again shortly.");
              hasVerified.current = true;
          }
          return;
      }

      attemptCount++;
      
      try {
        const verifyRes = await fetch('/api/payments/verify', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'x-user-id': user.uid,
             'x-user-email': user.email || '',
             'x-user-name': encodeURIComponent(user.displayName || 'BuyWise User')
           },
           body: JSON.stringify({
              session_id: searchParams.get('session_id'),
              subscription_id: searchParams.get('subscription_id'),
              payment_id: searchParams.get('payment_id')
           })
        });
        
        if (!verifyRes.ok) {
            throw new Error(`HTTP error! status: ${verifyRes.status}`);
        }
        
        const verifyData = await verifyRes.json();
        
        if (verifyData.verified || verifyData.status === 'success' || verifyData.status === 'succeeded' || verifyData.status === 'active') {
           await refreshPremium();
           if (isMounted) {
               setStatus('success');
               hasVerified.current = true;
           }
           return;
        } else {
           const currentStatus = verifyData.status;
           
           if (currentStatus === 'failed' || currentStatus === 'cancelled') {
               if (isMounted) {
                   setStatus(currentStatus);
                   setFailureReason(verifyData.error || (currentStatus === 'cancelled' ? "Payment was cancelled." : "Payment failed. No Premium access was activated."));
                   hasVerified.current = true;
               }
               return;
           } else {
               const isPremium = await refreshPremium();
               if (isPremium) {
                  if (isMounted) {
                      setStatus('success');
                      hasVerified.current = true;
                  }
                  return;
               }
           }
        }
      } catch (err: any) {
        console.error("Verification fetch error:", err);
      }
      
      if (!hasVerified.current && isMounted) {
          let nextDelay = 3000;
          if (attemptCount === 1) nextDelay = 500;
          else if (attemptCount >= 2 && attemptCount <= 4) nextDelay = 1000;
          
          timeoutId = setTimeout(checkStatus, nextDelay);
      }
    };
    
    checkStatus();
    
    return () => {
        isMounted = false;
        clearTimeout(timeoutId);
    };
  }, [user, searchParams, refreshPremium]);

  return (
    <div className="pt-32 px-6 max-w-2xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0a0a0a]/80 border border-white/10 p-10 rounded-3xl backdrop-blur-xl w-full"
      >
        {status === 'pending' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#FF3B30]/10 rounded-full flex items-center justify-center">
              <Loader2 className="animate-spin text-[#FF3B30]" size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-white">Confirming your payment...</h2>
              <p className="text-white/60 text-sm">Please wait while we confirm your transaction securely...</p>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-24 h-24 bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-200 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.4)]">
              <Crown className="text-black" size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500">Payment successful!</h2>
              <p className="text-white/80 text-sm">Your BuyWise Premium is now active.</p>
            </div>
            
            <button 
              onClick={() => navigate('/premium')}
              className="mt-4 px-8 py-4 bg-white text-black font-black uppercase text-sm rounded-xl flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              Go to Premium Dashboard <ChevronRight size={18} />
            </button>
          </motion.div>
        )}
        
        {(status === 'failed' || status === 'cancelled') && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-20 h-20 bg-red-900/40 rounded-full flex items-center justify-center border border-red-500/50">
              <XCircle className="text-red-500" size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-white">
                 {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
              </h2>
              <p className="text-white/60 text-sm max-w-md mx-auto">
                {failureReason || "We couldn't verify your payment. Please try again."}
              </p>
            </div>
            
            <div className="flex gap-4 mt-4 w-full justify-center">
                <button 
                  onClick={() => navigate('/premium')}
                  className="px-6 py-4 border border-white/20 text-white font-bold uppercase text-sm rounded-xl hover:bg-white/5 transition-colors"
                >
                  Return
                </button>
                <button 
                  onClick={() => navigate('/premium')}
                  className="px-6 py-4 bg-[#FF3B30] text-white font-bold uppercase text-sm rounded-xl hover:bg-[#FF3B30]/90 transition-colors flex items-center gap-2"
                >
                  <RefreshCcw size={16} /> Retry Payment
                </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
