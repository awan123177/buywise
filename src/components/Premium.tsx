import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Check, QrCode as QrCodeIcon, Upload, IndianRupee } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

export default function Premium() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'lifetime'>('monthly');
  const [showPayment, setShowPayment] = useState(false);
  
  const [name, setName] = useState('');
  const [utr, setUtr] = useState('');
  
  const plans = [
    {
      id: 'weekly',
      name: 'Weekly Pass',
      price: '₹30',
      period: '/week',
      features: ['Unlimited AI Insights', 'Price Drop Alerts', 'Flight & Train Scans']
    },
    {
      id: 'monthly',
      name: 'Monthly Elite',
      price: '₹100',
      period: '/mo',
      features: ['All Weekly Features', 'Premium Badge', 'No Ads', 'Priority Support']
    },
    {
      id: 'lifetime',
      name: 'Forever Founder',
      price: '₹700',
      period: '/forever',
      features: ['All Monthly Features', 'Early Access', 'Lifetime Premium Support']
    }
  ];

  const handleSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!user) {
      toast.error('Please login to activate Premium.');
      return;
    }
    if(utr.length < 6) {
      toast.error('Please enter a valid Transaction ID.');
      return;
    }
    
    try {
      await setDoc(doc(db, "premium_requests", user.uid), {
        userId: user.uid,
        userEmail: user.email,
        name,
        utr,
        plan: selectedPlan,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      toast.success('Payment submitted! Awaiting admin approval (ETA 2-4 hours).');
      setShowPayment(false);
      setUtr('');
    } catch (err) {
       toast.error("Failed to submit request.");
    }
  };

  return (
    <div className="pt-32 px-6 max-w-5xl mx-auto min-h-screen text-white flex flex-col gap-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4"><span className="text-[#FF3B30]">BuyWise</span> Premium</h1>
        <p className="text-white/50 tracking-widest uppercase text-xs">Unlock Unparalleled Market Intelligence</p>
      </div>

      {!showPayment ? (
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <motion.div 
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={`p-8 border cursor-pointer transition-all duration-300 ${selectedPlan === plan.id ? 'border-[#FF3B30] bg-[#FF3B30]/10' : 'border-white/10 bg-white/5'}`}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{plan.name}</h3>
                  <div className="text-3xl font-black text-[#FF3B30] mt-2">{plan.price}<span className="text-sm text-white/50">{plan.period}</span></div>
                </div>
                {selectedPlan === plan.id && <ShieldCheck className="text-[#FF3B30]" size={32} />}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm font-bold text-white/70">
                    <Check size={18} className="text-[#FF3B30]" /> {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setShowPayment(true)}
                className={`w-full py-4 text-xs font-black uppercase tracking-[0.2em] transition-colors ${selectedPlan === plan.id ? 'bg-[#FF3B30] text-white hover:bg-red-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                Select Plan
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="max-w-2xl mx-auto w-full p-8 border border-white/10 bg-[#0a0a0a]"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
             <IndianRupee className="text-[#FF3B30]" /> Manual UPI Payment
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-center bg-white/5 p-6 rounded-xl border border-white/10 mb-8">
            <div className="w-48 h-48 bg-white p-2 rounded-xl flex items-center justify-center">
               <QRCode 
                 value={`upi://pay?pa=7760449306@nyes&pn=BuyWise&am=${selectedPlan === 'monthly' ? '100' : selectedPlan === 'lifetime' ? '700' : '30'}&cu=INR`} 
                 size={160}
                 level="H" 
                 className="w-full h-full"
               />
            </div>
            <div className="flex-1 space-y-4">
               <div>
                 <p className="text-xs text-white/50 uppercase tracking-widest">Pay to UPI ID</p>
                 <p className="text-lg font-black tracking-widest text-[#FF3B30]">7760449306@nyes</p>
               </div>
               <div>
                 <p className="text-xs text-white/50 uppercase tracking-widest">Amount to Pay</p>
                 <p className="text-xl font-black">{selectedPlan === 'monthly' ? '₹100' : selectedPlan === 'lifetime' ? '₹700' : '₹30'}</p>
               </div>
            </div>
          </div>

          <form onSubmit={handleSupport} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Sender Name</label>
              <input 
                type="text" required
                value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#FF3B30] transition-colors"
                placeholder="Enter your name on UPI app"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Transaction ID (UTR / Ref Number)</label>
              <input 
                type="text" required
                value={utr} onChange={e => setUtr(e.target.value)}
                className="w-full bg-black border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#FF3B30] transition-colors"
                placeholder="12-digit UTR Number"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="button" onClick={() => setShowPayment(false)}
                className="flex-1 border border-white/10 bg-transparent text-white text-xs font-black uppercase tracking-[0.2em] py-4 hover:bg-white/5"
              >
                Back
              </button>
              <button 
                type="submit"
                className="flex-1 bg-[#FF3B30] text-white text-xs font-black uppercase tracking-[0.2em] py-4 hover:bg-red-600"
              >
                Submit Payment
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
