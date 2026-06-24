import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Check, QrCode as QrCodeIcon, Upload, IndianRupee, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { db, doc, setDoc } from '../lib/firebase';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

export default function Premium() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'lifetime'>('monthly');
  const [showPayment, setShowPayment] = useState(false);
  
  const [name, setName] = useState('');
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.5); // Very lightweight JPEG
          setScreenshot(dataUrl);
        }
        setUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
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
      const compositeName = screenshot ? `${name}|||${screenshot}` : name;
      const { error } = await supabase.from('premium_requests').insert([
        {
          userId: user.uid,
          email: user.email,
          name: compositeName,
          utr: utr,
          plan: selectedPlan,
          status: 'pending',
          timestamp: new Date().toISOString()
        }
      ]);
      
      if (error) throw error;
      
      toast.success('Payment submitted with screenshot! Awaiting admin approval.');
      setShowPayment(false);
      setUtr('');
      setScreenshot(null);
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
        <>
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

        {/* Manual Verification Schedule */}
        <div className="max-w-2xl mx-auto w-full border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#FF3B30]">
            <Clock size={16} />
            Premium Approval & Verification Schedule
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-black/40 p-4 border border-white/5 rounded-lg space-y-2">
              <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
                <Calendar size={14} className="text-[#FF3B30]" />
                Saturdays & Sundays
              </div>
              <p className="text-white/70">
                Real-time validation! Approved manually by owner <strong className="text-white font-semibold">Awanwarsi</strong> in <span className="text-[#FF3B30] font-black">5 to 10 minutes</span>.
              </p>
            </div>
            <div className="bg-black/40 p-4 border border-white/5 rounded-lg space-y-2">
              <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
                <Calendar size={14} className="text-[#FF3B30]" />
                Mondays to Fridays
              </div>
              <p className="text-white/70">
                Verification active from <span className="text-white font-bold">9:00 AM to 3:00 PM</span>. Submissions outside this window are verified the next morning.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            ℹ️ Once our developer matches your submitted <strong className="text-white font-medium">UTR Transaction Number</strong>, your profile immediately transitions to Premium status.
          </p>
        </div>
        </>
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

          {/* Verification Times inside Payment Box */}
          <div className="border border-white/10 bg-white/5 p-5 mb-8 space-y-3 rounded-lg text-xs">
            <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[#FF3B30]">
              <Clock size={14} />
              Manual Verification Times
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="font-bold text-white uppercase text-[10px] tracking-wide flex items-center gap-1">
                  <Calendar size={11} className="text-[#FF3B30]" /> Saturdays & Sundays
                </p>
                <p className="text-white/60 text-[11px]">Approved manually by owner in 5 to 10 minutes.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white uppercase text-[10px] tracking-wide flex items-center gap-1">
                  <Calendar size={11} className="text-[#FF3B30]" /> Mondays to Fridays
                </p>
                <p className="text-white/60 text-[11px]">Verification active from 9:00 AM to 3:00 PM.</p>
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

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Payment Screenshot (Recommended)</label>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 transition-colors text-center ${
                  dragActive ? 'border-[#FF3B30] bg-[#FF3B30]/5' : 'border-white/10 hover:border-white/20 bg-black'
                }`}
              >
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                {screenshot ? (
                  <div className="space-y-3 relative z-20">
                    <img 
                      src={screenshot} 
                      alt="Payment Screenshot Preview" 
                      className="mx-auto max-h-48 rounded border border-white/10 object-contain"
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScreenshot(null)}
                        className="text-[10px] text-red-500 font-bold uppercase tracking-wider hover:underline"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto text-white/40" size={24} />
                    <p className="text-xs text-white/70">
                      Drag & Drop your payment screenshot here, or <span className="text-[#FF3B30] font-bold">Browse</span>
                    </p>
                    <p className="text-[10px] text-white/40">PNG, JPG or JPEG (Max 5MB)</p>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl z-30">
                    <p className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest animate-pulse">Processing image...</p>
                  </div>
                )}
              </div>
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
