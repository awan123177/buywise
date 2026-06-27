import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Sparkles, TrendingDown, Target, ShoppingBag, ExternalLink, RefreshCw, BookmarkPlus, ShoppingCart, Info, Star, Lock, Diamond } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  store: string;
  rating: number;
  imageUrl: string;
  discount: string;
  delivery: string;
  recommendation: string;
  link: string;
}

interface ShoppingPlan {
  title: string;
  totalBudget: number;
  totalCost: number;
  savings: number;
  summary: string;
  products: Product[];
}

export default function PersonalShopper() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ShoppingPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<ShoppingPlan[]>([]);
  const { user, openLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !user.isPremium) {
      const timer = setTimeout(() => {
         toast.error('AI Personal Shopper requires Premium access.');
         navigate('/premium');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (!user) {
      toast.error('Please login to use AI Personal Shopper.');
      return openLogin();
    }
    
    if (!user.isPremium) {
       navigate('/premium');
       return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/api/gemini/shopper-plan', { query });
      setPlan(data);
    } catch (err: any) {
      toast.error('Failed to generate shopping plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!user) return openLogin();
    if (!plan) return;
    setSavedPlans([...savedPlans, plan]);
    toast.success('Shopping plan saved to your profile!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 lg:pb-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center mt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-xs font-black tracking-widest mb-6 uppercase"
        >
          <Sparkles size={14} className="animate-pulse" /> AI Personal Shopper
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 uppercase">
          Build Your Perfect <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-orange-500">
            Shopping Plan
          </span>
        </h1>
        
        <p className="text-white/40 max-w-2xl mx-auto font-mono text-sm uppercase tracking-wider leading-relaxed">
          Tell our AI what you need and your budget. We'll instantly curate a complete list of the best products, find the lowest prices, and optimize your spending.
        </p>
      </div>

      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto mb-16 relative"
      >
        {!user?.isPremium && (
          <div className="absolute inset-0 z-20 backdrop-blur-sm bg-black/40 rounded-2xl flex flex-col items-center justify-center border border-[#FF3B30]/30 shadow-[0_0_50px_rgba(255,59,48,0.1)]">
            <div className="bg-[#FF3B30] text-white p-3 rounded-full mb-4 shadow-lg shadow-[#FF3B30]/20">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Premium Feature</h3>
            <p className="text-white/60 text-sm font-mono text-center max-w-sm mb-6">
              Unlock the AI Personal Shopper to curate custom shopping plans and maximize your savings.
            </p>
            <button 
              onClick={() => navigate('/premium')}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-[#FF3B30] text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
            >
              <Diamond size={16} /> Upgrade to Premium
            </button>
          </div>
        )}

        <div className={`transition-all duration-300 ${!user?.isPremium ? 'opacity-30 pointer-events-none filter blur-sm select-none' : ''}`}>
          <form onSubmit={handleGeneratePlan} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF3B30] to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-[#0A0A0A] border border-white/10 rounded-2xl p-2 shadow-2xl">
              <div className="p-3 text-[#FF3B30]">
                <Bot size={24} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. I have ₹50,000. Build me a complete home office setup..."
                className="flex-1 bg-transparent border-none text-white placeholder-white/20 px-2 py-4 focus:outline-none focus:ring-0 text-sm md:text-base font-medium"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-[#FF3B30] hover:bg-red-600 text-white px-6 py-4 rounded-xl font-black tracking-wider uppercase text-xs transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                <span className="hidden sm:inline">{loading ? 'Curating...' : 'Generate Plan'}</span>
              </button>
            </div>
          </form>
          
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {["Gaming PC under ₹80k", "College Essentials", "Smart Kitchen Setup", "Wedding Gift Ideas"].map((suggestion) => (
              <button 
                key={suggestion}
                onClick={() => setQuery(`I need a ${suggestion}`)}
                className="text-[10px] uppercase font-mono tracking-wider px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {plan && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="space-y-8"
          >
            {/* Plan Header */}
            <div className="bg-gradient-to-br from-[#0A0A0A] to-[#111111] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3B30] blur-[120px] opacity-10 rounded-full" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
                <div className="space-y-4 max-w-2xl">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    {plan.title}
                  </h2>
                  <div className="flex items-start gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                    <Info className="text-blue-400 mt-0.5 shrink-0" size={18} />
                    <p className="text-sm text-white/70 leading-relaxed">
                      {plan.summary}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 min-w-[240px]">
                  <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/20 p-4 rounded-xl">
                    <span className="text-[10px] text-[#FF3B30] font-black uppercase tracking-widest block mb-1">Total Optimized Cost</span>
                    <span className="text-3xl font-black text-white">{formatPrice(plan.totalCost)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-[9px] text-white/40 font-mono uppercase block mb-1">Target Budget</span>
                      <span className="text-sm font-bold text-white">{formatPrice(plan.totalBudget)}</span>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                      <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest block mb-1 flex items-center gap-1"><TrendingDown size={10} /> Saved</span>
                      <span className="text-sm font-bold text-emerald-400">{formatPrice(plan.savings)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={handleSavePlan}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl flex justify-center items-center gap-2 transition-colors border border-white/5"
                    >
                      <BookmarkPlus size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Save</span>
                    </button>
                    <button className="flex-[2] bg-white text-black hover:bg-gray-200 p-3 rounded-xl flex justify-center items-center gap-2 transition-colors font-black uppercase tracking-widest text-[10px]">
                      <ShoppingCart size={16} /> Buy Bundle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {plan.products.map((product, idx) => (
                <motion.div
                  key={product.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden hover:border-[#FF3B30]/50 transition-colors group flex flex-col"
                >
                  {/* Image Area */}
                  <div className="h-48 bg-white/5 relative p-4 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[9px] font-mono uppercase text-white/60">
                      {product.brand}
                    </div>
                    {product.discount && (
                      <div className="absolute top-3 right-3 bg-[#FF3B30] text-white px-2 py-1 rounded text-[10px] font-black tracking-widest">
                        {product.discount}
                      </div>
                    )}
                    <img src={product.imageUrl} alt={product.name} className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500" onError={(e) => {
                       (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80`;
                    }}/>
                  </div>

                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight pr-4">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        <Star size={10} className="fill-yellow-500" />
                        {product.rating}
                      </div>
                    </div>

                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-xl font-black text-white">{formatPrice(product.price)}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-white/30 line-through font-mono mb-1">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>

                    <div className="bg-[#FF3B30]/5 border border-[#FF3B30]/20 rounded-lg p-3 mb-4 flex-grow">
                      <span className="text-[9px] text-[#FF3B30] font-black uppercase tracking-widest block mb-1 flex items-center gap-1">
                        <Target size={10} /> AI Reason
                      </span>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {product.recommendation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <img src={`https://logo.clearbit.com/${product.store.toLowerCase().replace(' ', '')}.com`} alt={product.store} className="w-4 h-4 rounded-full bg-white" onError={(e) => (e.target as any).style.display = 'none'} />
                        <span className="text-[10px] font-bold uppercase text-white/60">{product.store}</span>
                      </div>
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white text-white hover:text-black px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                      >
                        Buy Now <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
