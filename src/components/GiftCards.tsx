import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Gift, ShieldCheck, Flame, Star, Wallet, Zap, ExternalLink, Activity, Play, ChevronRight, X, Clock, CheckCircle2, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from './SEO';

const CATEGORIES = ["All", "Shopping", "Food", "Gaming", "Entertainment", "Travel"];

const MOCK_GIFT_CARDS = [
  { id: 1, brand: "Amazon", category: "Shopping", color: "from-orange-500 to-yellow-400", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", discount: 2, featured: true },
  { id: 2, brand: "Flipkart", category: "Shopping", color: "from-blue-600 to-blue-400", logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg", discount: 1.5 },
  { id: 3, brand: "Swiggy", category: "Food", color: "from-orange-600 to-orange-400", logo: "https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg", discount: 5, bestValue: true },
  { id: 4, brand: "Zomato", category: "Food", color: "from-red-600 to-red-400", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Zomato_Logo.svg", discount: 4, featured: true },
  { id: 5, brand: "PlayStation", category: "Gaming", color: "from-blue-800 to-blue-600", logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg", discount: 0, featured: true },
  { id: 6, brand: "Xbox", category: "Gaming", color: "from-green-600 to-green-400", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_%282019%29.svg", discount: 0 },
  { id: 7, brand: "Netflix", category: "Entertainment", color: "from-red-700 to-red-500", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", discount: 0, featured: true },
  { id: 8, brand: "Spotify", category: "Entertainment", color: "from-green-500 to-green-400", logo: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg", discount: 1 },
  { id: 9, brand: "MakeMyTrip", category: "Travel", color: "from-blue-500 to-cyan-400", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/MakeMyTrip_Logo.svg", discount: 10, bestValue: true },
  { id: 10, brand: "Uber", category: "Travel", color: "from-gray-900 to-gray-700", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png", discount: 2 },
  { id: 11, brand: "Nykaa", category: "Shopping", color: "from-pink-600 to-pink-400", logo: "https://upload.wikimedia.org/wikipedia/en/9/97/Nykaa_logo.svg", discount: 3 },
  { id: 12, brand: "Myntra", category: "Shopping", color: "from-fuchsia-600 to-pink-500", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png", discount: 4 },
];

const DENOMINATIONS = [100, 250, 500, 1000, 2000, 5000];

export default function GiftCards() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderStatus, setOrderStatus] = useState<"idle" | "processing" | "success">("idle");

  const filteredCards = MOCK_GIFT_CARDS.filter(card => {
    const matchesCat = activeCategory === "All" || card.category === activeCategory;
    const matchesSearch = card.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredCards = MOCK_GIFT_CARDS.filter(card => card.featured);
  const bestValueCards = MOCK_GIFT_CARDS.filter(card => card.bestValue);

  const handlePurchase = () => {
    if (!selectedAmount && !customAmount) return;
    setIsCheckingOut(true);
    setOrderStatus("processing");
    
    // Mock purchase flow
    setTimeout(() => {
      setOrderStatus("success");
      toast.success(`Successfully purchased ${selectedCard.brand} Gift Card!`);
      setTimeout(() => {
        closeCheckout();
      }, 2000);
    }, 2000);
  };

  const closeCheckout = () => {
    setIsCheckingOut(false);
    setOrderStatus("idle");
    setSelectedCard(null);
    setSelectedAmount(null);
    setCustomAmount("");
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 xl:px-12 max-w-[1600px] mx-auto relative h-screen overflow-hidden">
      <SEO title="Digital Gift Cards & E-Vouchers - BuyWise Premium" description="Purchase premium digital gift cards from top brands instantly. Earn cashback and rewards on every purchase." />
      
      {/* Under Working Overlay to "fully close" the page */}
      <div className="fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
        <div className="bg-[#111] border border-yellow-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500 to-yellow-500/0"></div>
          <Activity size={48} className="text-yellow-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2 text-white">Under Working</h2>
          <p className="text-white/50 text-sm mb-6">
            The Premium Gifts module is currently undergoing infrastructure upgrades. Check back soon for instant digital delivery and massive cashbacks!
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-yellow-500/10 text-yellow-500 font-bold uppercase tracking-widest text-xs rounded-xl border border-yellow-500/20 w-full hover:bg-yellow-500/20 transition-colors">
              Notify Me When Live
            </button>
          </div>
        </div>
      </div>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#FF3B30]/10 blur-[100px] -z-10 rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10 rounded-full" />
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Gift className="text-[#FF3B30]" size={24} />
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter flex flex-wrap items-center gap-2 md:gap-4">
              Premium <span className="text-[#FF3B30]">Gifts</span>
              <span className="text-[10px] md:text-sm bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-2 py-0.5 md:px-3 md:py-1 rounded-full tracking-widest uppercase flex items-center gap-1 md:gap-2">
                <Activity size={12} className="animate-pulse md:w-3.5 md:h-3.5 w-3 h-3" /> Under Working
              </span>
            </h1>
          </div>
          <p className="text-white/50 max-w-xl text-sm md:text-base">
            Instant digital delivery. Zero markup. Earn reward points on every purchase. Supported by leading global fulfillment nodes.
          </p>
        </div>
        
        <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
          <div className="px-4 py-3 md:py-2 bg-white/5 border border-white/10 rounded-xl flex justify-between md:justify-start items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <Wallet size={16} className="text-white/50" />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Available Balance</span>
                <span className="text-sm font-mono font-bold text-white">₹0.00</span>
              </div>
            </div>
            <button className="md:ml-4 px-4 py-2 md:py-1 bg-[#FF3B30]/20 text-[#FF3B30] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#FF3B30] hover:text-white transition-colors">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-20 z-40 bg-[#111111]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl mb-12 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search brands (e.g., Amazon, Swiggy)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#FF3B30] transition-colors font-mono text-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main Grid */}
        <div className="xl:col-span-3 space-y-12">
          
          {/* Best Value / Featured Row if no search */}
          {!searchQuery && activeCategory === "All" && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                    <Flame className="text-orange-500" size={20} /> Hot Deals
                  </h2>
                  <p className="text-white/40 text-xs">Maximum cashback and highest value</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bestValueCards.map(card => (
                  <GiftCardItem key={card.id} card={card} onClick={() => setSelectedCard(card)} />
                ))}
              </div>
            </div>
          )}

          {/* Catalog */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} /> All Brands
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCards.length > 0 ? (
                filteredCards.map(card => (
                  <GiftCardItem key={card.id} card={card} onClick={() => setSelectedCard(card)} />
                ))
              ) : (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/30 border border-white/5 rounded-2xl border-dashed">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p>No brands found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute -top-10 -right-10 text-white/5 rotate-12">
               <Activity size={120} />
             </div>
             <h3 className="font-bold text-sm uppercase tracking-widest text-white/80 mb-6 relative z-10">Purchase History</h3>
             
             <div className="space-y-4 relative z-10">
               {[
                 { brand: 'Amazon', amount: 1000, date: '2 hrs ago', status: 'delivered' },
                 { brand: 'Swiggy', amount: 250, date: 'Yesterday', status: 'delivered' },
                 { brand: 'Netflix', amount: 500, date: 'Last week', status: 'delivered' },
               ].map((purchase, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Gift size={16} className="text-white/50" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{purchase.brand}</span>
                        <span className="text-[10px] text-white/40">{purchase.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-sm">₹{purchase.amount}</span>
                      <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider">{purchase.status}</span>
                    </div>
                 </div>
               ))}
               <button className="w-full py-3 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                 View All Records
               </button>
             </div>
          </div>

          <div className="bg-gradient-to-br from-[#FF3B30]/20 to-orange-500/20 border border-[#FF3B30]/30 rounded-2xl p-6 text-center">
             <Star className="text-yellow-400 mx-auto mb-4" size={32} />
             <h3 className="font-bold text-lg mb-2 text-white">BuyWise Pro Rewards</h3>
             <p className="text-white/70 text-sm mb-6">Earn up to 10% instant cashback on all gift card purchases when you upgrade to Pro.</p>
             <button className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-gray-200 transition-colors">
               Upgrade Now
             </button>
          </div>
        </div>
      </div>

      {/* Selected Card Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar relative flex flex-col md:flex-row gap-8"
            >
              <button 
                onClick={closeCheckout}
                className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 rounded-full p-2"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 space-y-6">
                <div className={`aspect-[1.58] rounded-2xl bg-gradient-to-br ${selectedCard.color} p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group`}>
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="flex justify-between items-start relative z-10">
                     <span className="text-white/80 font-mono text-xs uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">
                       E-Gift Card
                     </span>
                     {selectedCard.discount > 0 && (
                       <span className="bg-green-500 text-black font-black text-xs px-2 py-1 rounded">
                         {selectedCard.discount}% OFF
                       </span>
                     )}
                   </div>
                   <div className="relative z-10">
                     <h2 className="text-3xl font-black text-white drop-shadow-lg">{selectedCard.brand}</h2>
                     <p className="text-white/80 font-mono mt-2 flex items-center gap-2">
                       <ShieldCheck size={14} /> Valid in India
                     </p>
                   </div>
                </div>

                <div>
                  <h3 className="font-bold uppercase tracking-widest text-sm text-white/50 mb-3">Description & Terms</h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-4">
                    This is a digital gift card for {selectedCard.brand}. It will be delivered instantly to your registered email address and can be redeemed on the {selectedCard.brand} app or website.
                  </p>
                  <ul className="text-xs text-white/50 space-y-2 list-disc pl-4 font-mono">
                    <li>Valid for 1 year from the date of purchase.</li>
                    <li>Cannot be exchanged for cash.</li>
                    <li>Usable across all categories on {selectedCard.brand}.</li>
                  </ul>
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col">
                <h3 className="text-2xl font-black mb-6">Select Amount</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {DENOMINATIONS.map(amount => (
                    <button
                      key={amount}
                      onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
                      className={`py-3 rounded-xl font-mono text-sm font-bold border transition-all ${
                        selectedAmount === amount 
                          ? 'border-[#FF3B30] bg-[#FF3B30]/10 text-[#FF3B30]' 
                          : 'border-white/10 bg-white/5 text-white hover:border-white/30'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>

                <div className="relative mb-8">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-mono">₹</span>
                  <input 
                    type="number" 
                    placeholder="Custom Amount"
                    value={customAmount}
                    onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#FF3B30]"
                  />
                </div>

                <div className="mt-auto bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/50">Subtotal</span>
                    <span className="font-mono">₹{selectedAmount || customAmount || 0}</span>
                  </div>
                  {selectedCard.discount > 0 && (
                    <div className="flex justify-between text-sm mb-2 text-green-400">
                      <span>Discount ({selectedCard.discount}%)</span>
                      <span className="font-mono">-₹{((selectedAmount || Number(customAmount) || 0) * (selectedCard.discount / 100)).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-white/10 my-3" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Payable</span>
                    <span className="text-2xl font-black font-mono text-[#FF3B30]">
                      ₹{((selectedAmount || Number(customAmount) || 0) * (1 - selectedCard.discount / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-yellow-400 font-mono text-right flex items-center justify-end gap-1">
                    <Zap size={12} />
                    Earn {Math.floor((selectedAmount || Number(customAmount) || 0) * 0.05)} Points
                  </div>
                </div>

                {isCheckingOut ? (
                  <div className="w-full bg-[#1a1a1a] border border-white/10 p-4 rounded-xl flex items-center justify-center h-14">
                    {orderStatus === "processing" ? (
                      <div className="flex items-center gap-3 text-white/70">
                        <div className="w-4 h-4 border-2 border-[#FF3B30] border-t-transparent rounded-full animate-spin" />
                        <span className="font-mono text-sm uppercase tracking-widest">Processing Transaction...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-green-400">
                        <CheckCircle2 size={18} />
                        <span className="font-bold uppercase tracking-widest text-sm">Purchase Successful!</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={handlePurchase}
                    disabled={!selectedAmount && !customAmount}
                    className="w-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Pay <ChevronRight size={18} />
                  </button>
                )}
                
                <p className="text-[10px] text-white/30 text-center mt-4 uppercase tracking-widest">
                  Secure encrypted checkout via PineLabs
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GiftCardItem({ card, onClick }: { card: any, onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#1a1a1a] border border-white/5 hover:border-white/20 rounded-2xl p-3 transition-all text-left group overflow-hidden relative flex flex-col cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {card.bestValue && (
        <div className="absolute top-4 left-4 z-20 bg-[#FF3B30] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg shadow-red-500/20">
          Best Value
        </div>
      )}

      <button 
        onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
        className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isWishlisted || isHovered ? 'bg-black/40 backdrop-blur-md border border-white/10 opacity-100' : 'opacity-0'
        }`}
      >
        <Heart size={14} className={`${isWishlisted ? 'fill-[#FF3B30] text-[#FF3B30]' : 'text-white'}`} />
      </button>
      
      <div className={`aspect-[1.58] w-full rounded-xl bg-gradient-to-br ${card.color} mb-4 relative overflow-hidden flex items-center justify-center p-6 shadow-inner`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        {/* Placeholder for actual logos, using text for now if logo fails */}
        <h3 className="text-2xl font-black text-white relative z-10 drop-shadow-md">{card.brand}</h3>
      </div>
      
      <div className="flex justify-between items-start mb-2 px-1">
        <div>
          <h4 className="font-bold text-white group-hover:text-[#FF3B30] transition-colors">{card.brand} E-Gift Card</h4>
          <span className="text-xs text-white/40 uppercase tracking-wider">{card.category}</span>
        </div>
        {card.discount > 0 && (
          <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
            Up to {card.discount}% OFF
          </span>
        )}
      </div>
      
      <div className="mt-auto pt-4 flex items-center justify-between px-1 text-white/30 text-xs font-mono">
        <span className="flex items-center gap-1">
          <Clock size={12} /> Instant Delivery
        </span>
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}
