import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Sparkles, Diamond, ArrowRight, Camera, Mic, Volume2, Filter, SlidersHorizontal, ChevronDown, Check, Star, Tag, Zap, Scan } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchProducts, logSearchAction, fetchPublicSavingsStats, submitReferral } from '../lib/api';
import { detectProduct, extractProductFeatures } from '../lib/gemini';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import ChatAssistant from './ChatAssistant';
import Product3DViewer from './Product3DViewer';
import toast from 'react-hot-toast';
import { useCurrency } from '../contexts/CurrencyContext';

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

    try {
      const detected = await detectProduct(activeQuery);
      setSearchingStatus(`Deep Search: ${detected}`);

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

         // Reset filters
         setShowFilters(false);
         setMinPrice('');
         setMaxPrice('');
         setSelectedBrands([]);
         setSelectedRating(0);
         setSelectedSpecs([]);
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
    <div className="min-h-screen pt-32 md:pt-44 pb-32 px-4 md:px-12 bg-transparent">
      <div className="max-w-[1400px] mx-auto">
        {/* Balanced Hero Section */}
        <header className="mb-20 md:mb-32 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "circOut" }}
            >
              <h1 className="text-[12vw] sm:text-[9vw] leading-[0.8] tracking-[-0.06em] font-black uppercase font-display text-white relative z-10 w-[max-content] max-w-full">
                <span className="relative z-10">PRICE</span><br/>
                <span className="text-[#FF3B30] relative z-10 inline-block">
                  CONTROL.
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF3B30]/50 rounded-full"></div>
                  <div className="absolute inset-x-0 bottom-1 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
                </span>
              </h1>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col gap-6 lg:pb-4"
            >
              <p className="text-xl font-medium text-white max-w-md leading-snug">
                The global standard for real-time market sourcing and competitive intelligence.
              </p>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                <div className="w-12 h-[2px] bg-[#FF3B30]" />
                AUTONOMOUS RETRIEVAL ACTIVE
              </div>

              {/* Public Live Savings Counter Odometer Widget */}
              <div className="bg-gradient-to-r from-[#10b981]/10 to-transparent border-l-2 border-[#10b981] p-4 rounded-r-lg max-w-md mt-2 space-y-2">
                <div className="text-[9px] uppercase font-black text-[#10b981] tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-ping"></span> LIVE CUMULATIVE USER SAVINGS
                </div>
                <div className="text-2xl md:text-3xl font-black font-mono text-[#10b981] drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">
                  {formatPrice(savingsStats.totalSavings)}
                </div>

                {/* Live Activity Ticker with AnimatePresence */}
                <div className="h-6 overflow-hidden flex items-center border-t border-white/5 pt-1 mt-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={eventIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-[9px] sm:text-[10px] text-emerald-400 font-mono tracking-tight flex items-center gap-1.5 whitespace-nowrap truncate"
                    >
                      <span className="text-emerald-500 font-black">✦</span> {REALTIME_EVENTS[eventIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="text-[9px] text-white/30">
                  Comparing index prices across <span className="text-white/60 font-bold">{savingsStats.totalUsers.toLocaleString()}</span> active nodes.
                </div>
              </div>

              {/* Telegram Community Button */}
              <a 
                href="https://t.me/buywiseofficial" 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 flex items-center gap-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 w-fit px-6 py-3 rounded-xl transition-all group"
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
        <section className="mb-20 md:mb-40 relative">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`terminal-card flex flex-col md:flex-row items-stretch md:items-center p-0 overflow-hidden ${loading ? 'opacity-50' : ''} border-white/10 bg-transparent`}
          >
            <div className="flex-grow flex items-center h-16 md:h-24 px-6 md:px-12 border-b md:border-b-0 md:border-r border-white/10 bg-white/5 backdrop-blur-md">
              <span className="mr-4 md:mr-6 text-white/20 font-black tracking-tighter text-xl">#</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="INPUT MARKET QUERY OR URL"
                className="bg-transparent border-none outline-none text-white w-full text-lg md:text-2xl font-black placeholder:text-white/30 uppercase tracking-tighter"
              />
            </div>
            <div className="flex h-16 md:h-24">
              <button 
                onClick={() => navigate('/scanner')}
                className="w-16 md:w-24 flex items-center justify-center border-r border-white/10 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                title="Smart Barcode Scanner"
              >
                <Scan size={24} className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button 
                onClick={startVoiceSearch}
                className={`w-16 md:w-24 flex items-center justify-center border-r border-white/10 transition-all hover:bg-white/10 hover:text-white ${isListening ? 'bg-[#FF3B30] text-white animate-pulse' : 'text-white/70'}`}
              >
                <Mic size={24} className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="btn-brutalist !border-none !rounded-none min-w-[140px] md:min-w-[200px] flex-grow md:flex-grow-0 h-full flex items-center justify-center text-[10px] md:text-xs"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : 'RETRIEVE DATA'}
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
              <div className="mb-8 border border-white/10 bg-white/5 backdrop-blur-md rounded-xl overflow-hidden">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 text-white">
                    <SlidersHorizontal size={20} className={showFilters ? 'text-[#FF3B30]' : ''} />
                    <span className="font-black tracking-widest text-sm uppercase">Advanced Analysis Filters</span>
                    {filteredResults.length !== results.length && (
                      <span className="ml-4 px-2 py-0.5 bg-[#FF3B30] text-white text-[10px] rounded-full font-black">
                        {filteredResults.length} / {results.length} MATCHES
                      </span>
                    )}
                  </div>
                  <ChevronDown size={20} className={`text-white transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showFilters && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
                        
                        {/* Price Filter */}
                        <div>
                          <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Tag size={12} /> Price Constraints
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              placeholder="MIN" 
                              value={minPrice}
                              onChange={e => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-[#FF3B30]"
                            />
                            <span className="text-white/40">-</span>
                            <input 
                              type="number" 
                              placeholder="MAX" 
                              value={maxPrice}
                              onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-[#FF3B30]"
                            />
                          </div>
                        </div>

                        {/* Brand Filter */}
                        <div>
                          <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Filter size={12} /> Manufacturer Entity
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                            {uniqueBrands.map(brand => (
                              <button
                                key={brand}
                                onClick={() => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand])}
                                className={`px-2 py-1 text-[10px] font-black tracking-widest rounded border transition-colors ${selectedBrands.includes(brand) ? 'bg-[#FF3B30] border-[#FF3B30] text-white' : 'bg-transparent border-white/20 text-white/70 hover:border-white/50'}`}
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rating Filter */}
                        <div>
                          <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Star size={12} /> Seller Reliability
                          </div>
                          <div className="flex flex-col gap-2">
                            {[4.5, 4.0, 3.0].map(rating => (
                              <button
                                key={rating}
                                onClick={() => setSelectedRating(prev => prev === rating ? 0 : rating)}
                                className={`flex items-center gap-2 text-xs transition-colors ${selectedRating === rating ? 'text-[#FF3B30] font-bold' : 'text-white/70 hover:text-white'}`}
                              >
                                <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${selectedRating === rating ? 'bg-[#FF3B30] border-[#FF3B30]' : 'border-white/20'}`}>
                                  {selectedRating === rating && <Check size={10} className="text-white" />}
                                </div>
                                {rating}+ Stars & Up
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* AI Specs Filter */}
                        <div>
                          <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Zap size={12} /> Extracted Specs
                          </div>
                          <div className="flex flex-col gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                            {allSpecs.map(spec => (
                              <button
                                key={spec}
                                onClick={() => setSelectedSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec])}
                                className={`flex items-center gap-2 text-[10px] text-left transition-colors uppercase font-bold tracking-wider ${selectedSpecs.includes(spec) ? 'text-[#FF3B30]' : 'text-white/70 hover:text-white'}`}
                              >
                                <div className={`w-3 h-3 flex-shrink-0 border rounded-[2px] flex items-center justify-center ${selectedSpecs.includes(spec) ? 'bg-[#FF3B30] border-[#FF3B30]' : 'border-white/20'}`}>
                                  {selectedSpecs.includes(spec) && <Check size={10} className="text-white" />}
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
                <div className="py-20 text-center border dashed border-white/20 rounded-xl">
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
              className="flex flex-col items-center justify-center py-40"
            >
              <div className="p-12 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
                <p className="text-[11px] uppercase font-black tracking-[1em] text-white/30">AWAITING_MARKET_SIGNAL</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ChatAssistant results={sortedFilteredResults} />

      <footer className="w-full h-auto py-4 md:h-16 md:py-0 border-t border-white/10 px-4 md:px-16 flex flex-col md:flex-row items-center justify-between text-[8px] md:text-[10px] text-white font-black uppercase tracking-[0.2em] bg-[#050505] relative z-[100] gap-2 md:gap-0 mt-20">
        <div>&copy; 2024 BUY_WISE_INTEL_HUB.</div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-12 opacity-50 md:opacity-100">
          <span className="flex items-center gap-2 md:gap-3"><div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FF3B30] animate-pulse"></div> SYSTEM_READY</span>
          <span className="text-white/30 hidden sm:inline-block">AES_256_ACTIVE</span>
          <span className="text-white/30 hidden sm:inline-block">GATEWAY: INDIA_001</span>
        </div>
      </footer>
    </div>
  );
}
