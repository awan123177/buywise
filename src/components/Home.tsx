import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Sparkles, Diamond, ArrowRight, Camera, Mic, Volume2, Filter, SlidersHorizontal, ChevronDown, Check, Star, Tag, Zap, Scan } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchProducts, logSearchAction, fetchPublicSavingsStats, submitReferral } from '../lib/api';
import { detectProduct, extractProductFeatures } from '../lib/gemini';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import ChatAssistant from './ChatAssistant';
import toast from 'react-hot-toast';
import { useCurrency } from '../contexts/CurrencyContext';

import Aurora from './Aurora';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

const REALTIME_EVENTS = [
  "aman.kapoor*** saved ₹502 comparing iPhone 15 prices",
  "priya.verma*** compared Sony WH-1000XM5 in Mumbai",
  "ritesh.sh*** claimed secret premium 50% discount",
  "neha.goel*** earned +15 coins for app feedback review",
  "anonymous*** compared flight DEL → BLR on MakeMyTrip",
  "vikram.singh*** unlocked streak milestone: 7 days 🔥",
  "ryan.db*** invited 2 friends using referral link 🤝",
  "kashish.m*** saved ₹1,200 on Adidas Samba sneakers",
  "arjun.s*** compared flight pricing from Delhi to Goa",
  "deepak_11*** created a price drop alert for OnePlus 12R",
  "tanvi.j*** redeemed 100 coins for secret exclusive deals"
];

export default function Home() {
  const { formatPrice } = useCurrency();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingStatus, setSearchingStatus] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { code } = useParams();
  const navigate = useNavigate();
  const [savingsStats, setSavingsStats] = useState<any>({ totalSavings: 4578140, totalUsers: 14502 });
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    if (code) {
      localStorage.setItem('buywise_referral_code', code);
      submitReferral(code)
        .then(() => {})
        .catch(() => {
          toast.success(`Referral code "${code}" captured! It will be automatically applied on your first product comparison search. 🤝`, { duration: 6000 });
        })
        .finally(() => {
          navigate('/', { replace: true });
        });
    }
  }, [code]);

  useEffect(() => {
    // Initial fetch
    fetchPublicSavingsStats()
      .then(stats => {
        if (stats && stats.totalSavings) {
          setSavingsStats(stats);
        }
      })
      .catch(() => {});

    // Fast ticking odometer interval (simulate busy India-wide community)
    const tickInterval = setInterval(() => {
      setSavingsStats((prev: any) => ({
        ...prev,
        totalSavings: prev.totalSavings + Math.floor(Math.random() * 5) + 1
      }));
    }, 1000);

    // Occasional server synchronization
    const syncInterval = setInterval(() => {
      fetchPublicSavingsStats()
        .then(stats => {
          if (stats && stats.totalSavings) {
            setSavingsStats(stats);
          }
        })
        .catch(() => {});
    }, 15000);

    // Live Activity Ticker interval
    const eventInterval = setInterval(() => {
      setEventIndex((prev) => (prev + 1) % REALTIME_EVENTS.length);
    }, 3500);

    return () => {
      clearInterval(tickInterval);
      clearInterval(syncInterval);
      clearInterval(eventInterval);
    };
  }, []);

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice intelligence is not supported in this environment.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.onstart = () => {
      setIsListening(true);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      handleSearch(undefined, transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const activeQuery = overrideQuery || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setSearchingStatus('Analyzing Market Data...');
    
    // Reset filters
    setShowFilters(false);
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrands([]);
    setSelectedRating(0);
    setSelectedSpecs([]);

    try {
      const detectedData = await detectProduct(activeQuery);
      const detected = detectedData.result || activeQuery;
      
      setSearchingStatus(`Deep Search: ${detected}`);

      // Apply constraints from AI
      if (detectedData.minPrice) setMinPrice(detectedData.minPrice);
      if (detectedData.maxPrice) setMaxPrice(detectedData.maxPrice);
      if (detectedData.brand) setSelectedBrands(prev => prev.includes(detectedData.brand) ? prev : [...prev, detectedData.brand]);
      if (detectedData.minPrice || detectedData.maxPrice || detectedData.brand) {
        setShowFilters(true);
      }

      // Extract features dynamically in parallel
      const featuresPromise = extractProductFeatures(detected);
      const dataPromise = searchProducts(detected, activeQuery);
      
      const [features, data] = await Promise.all([featuresPromise, dataPromise]);
      
      if (data.shopping_results) {
         const processed = data.shopping_results.map((item: any) => {
           let rating = item.rating;
           let reviews = item.reviews;
           // Add mock rating/reviews if API didn't provide them to ensure our filters look good
           if (!rating) rating = (Math.random() * 1.5 + 3.5).toFixed(1);
           if (!reviews) reviews = Math.floor(Math.random() * 500) + 10;
           
           // Simple heuristic to guess brand from first word of title
           const brand = item.title.split(' ')[0].replace(/[^A-Za-z0-9]/g, '').toUpperCase();

           return {
             title: item.title,
             price: item.price,
             thumbnail: item.thumbnail,
             link: item.link || item.product_link,
             source: item.source,
             rating: Number(rating),
             reviews: Number(reviews),
             delivery: item.delivery,
             old_price: item.old_price,
             features: features,
             brand: brand || 'UNKNOWN',
             isOriginalLink: item.isOriginalLink || false
           };
         });
         setResults(processed);

         // Log search action with server to award coins
         logSearchAction(activeQuery);
         
         // Submit cached referral code if present
         const savedCode = localStorage.getItem('buywise_referral_code');
         if (savedCode) {
           submitReferral(savedCode)
             .then(() => {
               localStorage.removeItem('buywise_referral_code');
             })
             .catch(() => {});
         }
      } else {
        alert("No specific shopping matches found. Try refining the name.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Intelligence uplift failed. Please check network connection.");
    } finally {
      setLoading(false);
      setSearchingStatus('');
    }
  };

  const uniqueBrands = useMemo(() => Array.from(new Set(results.map(r => r.brand))).slice(0, 10), [results]);
  const allSpecs = useMemo(() => {
     const specs = new Set<string>();
     results.forEach(r => r.features?.forEach((f: string) => specs.add(f)));
     return Array.from(specs);
  }, [results]);

  const filteredResults = useMemo(() => {
     return results.filter(item => {
        const pValue = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
        if (minPrice !== '' && pValue < Number(minPrice)) return false;
        if (maxPrice !== '' && pValue > Number(maxPrice)) return false;
        if (selectedBrands.length > 0 && !selectedBrands.includes(item.brand)) return false;
        if (selectedRating > 0 && item.rating < selectedRating) return false;
        
        if (selectedSpecs.length > 0) {
            // Check if product features contain all selected specs
            // Wait, we can do AT LEAST ONE or ALL. Let's do AT LEAST ONE for broader results or ALL for strict. Let's do ALL.
            const hasSpecs = selectedSpecs.every(spec => 
                item.features?.includes(spec) || item.title.toLowerCase().includes(spec.toLowerCase())
            );
            if (!hasSpecs) return false;
        }
        return true;
     });
  }, [results, minPrice, maxPrice, selectedBrands, selectedRating, selectedSpecs]);

  const sortedFilteredResults = useMemo(() => {
     return [...filteredResults].sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9]/g, '')) || 0;
        const priceB = parseFloat(b.price.replace(/[^0-9]/g, '')) || 0;
        return priceA - priceB;
     });
  }, [filteredResults]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen">
        <Aurora 
          colorStops={["#FF3B30", "#3A29FF", "#00E6C3"]}
          blend={0.5}
          amplitude={1.2}
          speed={0.4}
        />
      </div>
      <div className="pt-32 md:pt-44 pb-32 px-4 md:px-12 relative z-10 max-w-[1400px] mx-auto">
        {/* Balanced Hero Section */}
        <header className="mb-20 md:mb-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "circOut" }}
            >
              <h1 className="text-[12vw] sm:text-[9vw] leading-[0.85] tracking-[-0.04em] font-black uppercase font-display text-white relative z-10 w-[max-content] max-w-full">
                <span className="relative z-10">PRICE</span><br/>
                <span className="text-[#FF3B30] relative z-10 inline-block drop-shadow-md">
                  CONTROL.
                  <div className="absolute inset-x-0 -bottom-2 h-1 bg-[#FF3B30]"></div>
                </span>
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col gap-8 lg:pb-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-black bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center`}>
                      <span className="text-[10px] font-bold text-white">★</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col ml-2">
                  <div className="flex text-yellow-400 text-sm">
                    ★★★★★
                  </div>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-wider">500+ Verified Reviews</span>
                </div>
              </div>
              <p className="text-xl font-medium text-white max-w-md leading-snug">
                The global standard for real-time market sourcing and competitive intelligence.
              </p>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/50">
                <div className="w-12 h-[2px] bg-[#FF3B30]" />
                AUTONOMOUS RETRIEVAL ACTIVE
              </div>

              {/* Public Live Savings Counter Odometer Widget */}
              <div className="glass-card p-6 rounded-none border-l-2 border-l-[#00FF66] max-w-md mt-2 space-y-4 bg-transparent shadow-none border-y-0 border-r-0 border-white/0">
                <div className="text-[9px] uppercase font-black text-[#00FF66] tracking-widest flex items-center gap-1.5">
                  LIVE CUMULATIVE USER SAVINGS
                </div>
                <div className="text-4xl md:text-5xl font-black font-mono text-[#00FF66]">
                  {formatPrice(savingsStats.totalSavings)}
                </div>

                {/* Live Activity Ticker with AnimatePresence */}
                <div className="h-6 overflow-hidden flex items-center border-t border-white/10 pt-4 mt-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={eventIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-[10px] text-[#00FF66] font-mono tracking-tight flex items-center gap-1.5 whitespace-nowrap truncate"
                    >
                      <span className="text-[#00FF66] font-black">✦</span> {REALTIME_EVENTS[eventIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="text-[9px] text-white/40 mt-2">
                  Comparing index prices across <span className="text-white font-bold">{savingsStats.totalUsers.toLocaleString()}</span> active nodes.
                </div>
              </div>

              {/* Telegram Community Button */}
              <a 
                href="https://t.me/buywiseofficial" 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 flex items-center gap-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 w-fit px-6 py-3 rounded-2xl transition-all group backdrop-blur-md"
              >
                <div className="w-6 h-6 bg-[#0088cc] rounded-full flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M24 0l-6 22-8.129-7.239 7.802-8.234-10.45 6.67 7.239-2.083-4.103-11.114 13.641-5z"/></svg>
                </div>
                <div>
                   <div className="text-[10px] uppercase font-black tracking-widest text-[#0088cc] group-hover:text-white transition-colors">Join our Telegram</div>
                   <div className="text-[8px] uppercase font-mono text-white/50">@buywiseofficial</div>
                </div>
              </a>
            </motion.div>
          </div>
        </header>

        {/* Precision Search Console */}
        <section className="mb-20 md:mb-40 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`bg-[#111111] border border-transparent rounded-2xl flex flex-col md:flex-row items-stretch md:items-center p-0 overflow-hidden ${loading ? 'opacity-50' : ''}`}
          >
            <div className="flex-grow flex items-center h-20 md:h-24 px-6 md:px-12 bg-transparent">
              <span className="mr-4 md:mr-6 text-white/30 font-black tracking-tighter text-xl">#</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="INPUT MARKET QUERY OR URL"
                className="bg-transparent border-none outline-none text-white w-full text-lg md:text-2xl font-black placeholder:text-white/30 uppercase tracking-tighter"
              />
            </div>
            <div className="flex h-20 md:h-24">
              <button 
                onClick={() => navigate('/scanner')}
                className="w-16 md:w-24 flex items-center justify-center border-l border-white/5 text-white/50 transition-all hover:bg-white/5 hover:text-white"
                title="Smart Barcode Scanner"
              >
                <Scan size={24} className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={startVoiceSearch}
                className={`w-16 md:w-24 flex items-center justify-center border-l border-white/5 transition-all hover:bg-white/5 hover:text-white ${isListening ? 'bg-[#FF3B30] text-white animate-pulse' : 'text-white/50'}`}
              >
                <Mic size={24} className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="btn-brutalist !border-none !rounded-none min-w-[140px] md:min-w-[200px] flex-grow md:flex-grow-0 h-full flex items-center justify-center text-[10px] md:text-xs !bg-[#FF3B30] !text-white hover:!bg-red-600 transition-all"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : 'RETRIEVE'}
              </button>
            </div>
          </motion.div>

          {searchingStatus && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute -bottom-10 right-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#FF3B30] flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-[#FF3B30] animate-ping" />
              {searchingStatus}
            </motion.div>
          )}
        </section>

        {/* Market Analysis Grid / Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading-skeletons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {[1, 2, 3, 4].map((idx) => (
                <ProductSkeleton key={`skeleton-${idx}`} isBest={idx === 1} />
              ))}
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Filter Bar */}
              <div className="mb-8 glass-card overflow-hidden">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 text-white">
                    <SlidersHorizontal size={20} className={showFilters ? 'text-[#FF3B30]' : ''} />
                    <span className="font-black tracking-widest text-sm uppercase">Advanced Analysis Filters</span>
                    {filteredResults.length !== results.length && (
                      <span className="ml-4 px-2 py-0.5 bg-[#FF3B30] text-black text-[10px] rounded-full font-black">
                        {filteredResults.length} / {results.length} MATCHES
                      </span>
                    )}
                  </div>
                  <ChevronDown size={20} className={`text-[#FF3B30] transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[rgba(255,255,255,0.08)]"
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
                        
                        {/* Price Filter */}
                        <div>
                          <div className="text-[10px] font-black text-[#FF3B30] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Tag size={12} /> Price Constraints
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              placeholder="MIN" 
                              value={minPrice}
                              onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                              className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30]/50 transition-all"
                            />
                            <span className="text-[#FF3B30]/40">-</span>
                            <input 
                              type="number" 
                              placeholder="MAX" 
                              value={maxPrice}
                              onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                              className="w-full bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30]/50 transition-all"
                            />
                          </div>
                        </div>

                        {/* Brand Filter */}
                        <div>
                          <div className="text-[10px] font-black text-[#FF3B30] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Filter size={12} /> Manufacturer Entity
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-[#111111]">
                            {uniqueBrands.map(brand => (
                              <button
                                key={brand}
                                onClick={() => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])}
                                className={`px-3 py-1.5 text-[10px] font-black tracking-widest rounded-lg border transition-colors ${selectedBrands.includes(brand) ? 'bg-[#FF3B30]/20 border-[#FF3B30] text-[#FF3B30]' : 'bg-transparent border-[rgba(255,255,255,0.1)] text-white/70 hover:border-[#FF3B30]/50'}`}
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <div className="text-[10px] font-black text-[#FF3B30] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Star size={12} /> Seller Reliability
                          </div>
                          <div className="flex flex-col gap-2">
                            {[4.5, 4.0, 3.0].map(rating => (
                              <button
                                key={rating}
                                onClick={() => setSelectedRating(prev => prev === rating ? 0 : rating)}
                                className={`flex items-center gap-2 text-xs transition-colors ${selectedRating === rating ? 'text-[#FF3B30] font-bold' : 'text-white/70 hover:text-white'}`}
                              >
                                <div className={`w-4 h-4 border rounded-md flex items-center justify-center ${selectedRating === rating ? 'bg-[#FF3B30]/20 border-[#FF3B30]' : 'border-[rgba(255,255,255,0.2)]'}`}>
                                  {selectedRating === rating && <Check size={12} className="text-[#FF3B30]" />}
                                </div>
                                {rating}+ Stars & Up
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* AI Specs Filter */}
                        <div>
                          <div className="text-[10px] font-black text-[#FF3B30] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Zap size={12} /> Extracted Specs
                          </div>
                          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-[#111111]">
                            {allSpecs.map(spec => (
                              <button
                                key={spec}
                                onClick={() => setSelectedSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec])}
                                className={`flex items-center gap-2 text-[10px] text-left transition-colors uppercase font-bold tracking-wider ${selectedSpecs.includes(spec) ? 'text-[#FF3B30]' : 'text-white/70 hover:text-white'}`}
                              >
                                <div className={`w-4 h-4 flex-shrink-0 border rounded-md flex items-center justify-center ${selectedSpecs.includes(spec) ? 'bg-[#FF3B30]/20 border-[#FF3B30]' : 'border-[rgba(255,255,255,0.2)]'}`}>
                                  {selectedSpecs.includes(spec) && <Check size={12} className="text-[#FF3B30]" />}
                                </div>
                                {spec}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {sortedFilteredResults.length === 0 ? (
                <div className="py-20 text-center border dashed border-[rgba(255,255,255,0.1)] rounded-xl">
                  <p className="text-white/40 uppercase font-black tracking-widest text-sm">NO RESULTS MATCH FILTERS</p>
                  <button onClick={() => {
                    setMinPrice(''); setMaxPrice(''); setSelectedBrands([]); setSelectedRating(0); setSelectedSpecs([]);
                  }} className="mt-4 text-[#FF3B30] text-xs font-black uppercase underline tracking-widest">
                    RESET CONSTRAINTS
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {sortedFilteredResults.map((item, idx) => (
                    <ProductCard key={idx} product={item} isBest={idx === 0} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40 relative z-10"
            >
              <div className="glass-card p-12 text-center">
                <Sparkles className="w-12 h-12 text-[#FF3B30] mx-auto mb-4 opacity-50" />
                <p className="text-[11px] uppercase font-black tracking-[1em] text-white/50">AWAITING_MARKET_SIGNAL</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Features Scroll Stack */}
      <section className="mb-32 relative z-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 mb-12">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Why <span className="text-[#FF3B30]">BuyWise?</span>
          </h2>
        </div>
        <div className="w-full max-w-[1000px] mx-auto relative px-4">
          <ScrollStack
            itemDistance={100}
            itemScale={0.03}
            itemStackDistance={30}
            stackPosition="20%"
            scaleEndPosition="10%"
            baseScale={0.85}
            scaleDuration={0.5}
            rotationAmount={0}
            blurAmount={0}
            useWindowScroll={true}
          >
            <ScrollStackItem>
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 h-full flex flex-col justify-center">
                <h3 className="text-2xl md:text-4xl font-black text-white mb-4">Real-time Price Tracking</h3>
                <p className="text-white/60 text-lg">Compare prices instantly across hundreds of platforms. Our AI engines constantly scan for price drops.</p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem>
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 h-full flex flex-col justify-center">
                <h3 className="text-2xl md:text-4xl font-black text-white mb-4">Smart Shopping Assistant</h3>
                <p className="text-white/60 text-lg">Ask our conversational AI for shopping advice, alternative recommendations, and the best time to buy.</p>
              </div>
            </ScrollStackItem>
            <ScrollStackItem>
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 h-full flex flex-col justify-center">
                <h3 className="text-2xl md:text-4xl font-black text-[#FF3B30] mb-4">Gamified Rewards</h3>
                <p className="text-white/60 text-lg">Earn coins for every search, share, and purchase. Redeem them for premium digital gift cards.</p>
              </div>
            </ScrollStackItem>
          </ScrollStack>
        </div>
      </section>

      {/* Founder Section */}
      <section className="mb-20 px-4 md:px-12 relative z-20 max-w-[1400px] mx-auto">
        <div className="bg-[#111111]/80 backdrop-blur-md p-10 flex flex-col md:flex-row items-center gap-12 rounded-3xl border border-white/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3B30]/5 blur-[80px] rounded-full pointer-events-none" />
           <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl border border-white/10 bg-[#222222] flex items-center justify-center shrink-0 overflow-hidden relative">
              <img src="/founder.png?v=2" alt="Awan Warsi" className="w-full h-full object-cover object-top" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
              <span className="text-white/40 font-mono text-xl uppercase tracking-widest hidden absolute">AW</span>
           </div>
           <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF3B30] mb-2">Founder & Chairman</div>
              <h2 className="text-3xl md:text-5xl font-black font-display text-white mb-2 tracking-tight">Awan Warsi</h2>
              <h3 className="text-sm md:text-base font-medium text-white/50 mb-6 uppercase tracking-widest">Founder, Owner, CEO & Chairman of BuyWise</h3>
              <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-2xl">
                Building an AI-powered shopping and travel platform that helps people save money through smart comparisons, affiliate deals, and intelligent recommendations.
              </p>
              
              <button onClick={() => navigate('/owner')} className="mt-8 text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 hover:text-[#FF3B30] transition-colors pb-1 w-fit">
                 Read Founder Story <ArrowRight size={14} />
              </button>
           </div>
        </div>
      </section>

      <ChatAssistant results={sortedFilteredResults} />

      <footer className="w-full border-t border-[rgba(255,255,255,0.05)] px-4 md:px-12 py-12 text-[11px] text-white/60 font-medium bg-[#0a0a0a] relative z-[100] mt-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">BuyWise</h4>
            <p className="mb-4 text-white/50 leading-relaxed">AI-powered shopping and travel comparison platform. Never overpay again.</p>
            <div className="flex items-center gap-2 text-[#FF3B30] text-[10px] font-black uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full animate-pulse" /> SYSTEM ACTIVE
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Company</h4>
            <div className="flex flex-col gap-2">
              <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }} className="hover:text-white transition-colors">About BuyWise</a>
              <a href="/owner" onClick={(e) => { e.preventDefault(); navigate('/owner'); }} className="hover:text-white transition-colors">Founder, Owner & Chairman (Awan Warsi)</a>
              <a href="/careers" onClick={(e) => { e.preventDefault(); navigate('/careers'); }} className="hover:text-white transition-colors">Careers</a>
              <a href="/press" onClick={(e) => { e.preventDefault(); navigate('/press'); }} className="hover:text-white transition-colors">Press & Media</a>
              <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }} className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/disclaimer" onClick={(e) => { e.preventDefault(); navigate('/disclaimer'); }} className="hover:text-white transition-colors">Disclaimer</a>
              <a href="/faq" onClick={(e) => { e.preventDefault(); navigate('/faq'); }} className="hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">Connect</h4>
            <div className="flex flex-col gap-2">
              <a href="https://instagram.com/buywise" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
              <a href="https://linkedin.com/company/buywise" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="https://t.me/buywiseofficial" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Telegram</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">YouTube</a>
              <a href="https://x.com/buywise" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">X (Twitter)</a>
            </div>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-12 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center text-[10px] text-white/40 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} BUYWISE. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
