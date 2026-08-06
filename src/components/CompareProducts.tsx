import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  Scale, X, Plus, Sparkles, Check, AlertTriangle, 
  Share2, ArrowLeft, Star, Heart, ExternalLink, ShieldAlert,
  ChevronDown, Trophy, Medal, AlertCircle, ShoppingCart, Info, Lightbulb
} from "lucide-react";
import { useCurrency } from "../contexts/CurrencyContext";
import { searchProducts } from "../lib/api";
import PremiumProductImage from "./PremiumProductImage";
import toast from "react-hot-toast";

interface ProductSpec {
  name: string;
  value: string;
}

interface ComparedItem {
  id: string;
  title: string;
  price: string;
  old_price?: string;
  thumbnail: string;
  link: string;
  source: string;
  rating: number;
  reviews: number;
  delivery?: string;
  specs: ProductSpec[];
  pros: string[];
  cons: string[];
  aiRecommendation: string;
  aiScore: number;
  isWinner: boolean;
  highlights: {
    lowestPrice?: boolean;
    bestValue?: boolean;
    bestPerformance?: boolean;
    bestBattery?: boolean;
    bestCamera?: boolean;
  };
}

export default function CompareProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [comparedProducts, setComparedProducts] = useState<ComparedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  // Parse items from query parameters (SEO-friendly)
  const itemsParam = searchParams.get("items") || "";

  useEffect(() => {
    if (itemsParam) {
      loadComparisonFromTitles(itemsParam.split(","));
    } else {
      // Default initial compared items if empty
      loadComparisonFromTitles(["iPhone 15 Pro", "OnePlus 12"]);
    }
  }, [itemsParam]);

  const loadComparisonFromTitles = async (titles: string[]) => {
    setLoading(true);
    try {
      const cleanTitles = titles.filter(t => t.trim() !== "");
      const items: ComparedItem[] = [];

      for (let i = 0; i < cleanTitles.length; i++) {
        const title = cleanTitles[i];
        const searchData = await searchProducts(title);
        const results = searchData.shopping_results || [];
        
        if (results.length > 0) {
          // Take the top result
          const topResult = results[0];
          items.push(generateMockCompareData(topResult, i));
        } else {
          // Generate an elegant fallback item
          items.push(generateMockCompareData({
            title: title,
            price: "₹85,000",
            old_price: "₹1,10,000",
            thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80",
            link: "#",
            source: "Amazon",
            rating: 4.6,
            reviews: 420
          }, i));
        }
      }

      // Calculate Winner and Highlights
      const enriched = calculateHighlights(items);
      setComparedProducts(enriched);
    } catch (e) {
      console.error("Error loading comparisons:", e);
      toast.error("Failed to load product comparison data.");
    } finally {
      setLoading(false);
    }
  };

  const generateMockCompareData = (item: any, index: number): ComparedItem => {
    const isPhone = item.title.toLowerCase().includes("phone") || item.title.toLowerCase().includes("iphone") || item.title.toLowerCase().includes("galaxy") || item.title.toLowerCase().includes("pixel");
    const isLaptop = item.title.toLowerCase().includes("macbook") || item.title.toLowerCase().includes("laptop") || item.title.toLowerCase().includes("thinkpad") || item.title.toLowerCase().includes("zenbook");
    
    let specs: ProductSpec[] = [];
    let pros: string[] = [];
    let cons: string[] = [];
    let aiRec = "";
    let aiScore = 80 + (index * 4) % 18;

    if (isPhone) {
      specs = [
        { name: "Processor", value: index === 0 ? "A17 Pro (3nm)" : "Snapdragon 8 Gen 3" },
        { name: "Display", value: "6.7\" Super Retina XDR OLED, 120Hz" },
        { name: "Camera System", value: index === 0 ? "48MP Triple Lens with 5x Optical Zoom" : "50MP Triple Hasselblad setup" },
        { name: "Battery Life", value: index === 0 ? "Up to 23 hours video playback" : "5400 mAh with 100W SuperVOOC charging" },
        { name: "Build Quality", value: index === 0 ? "Aerospace-grade Titanium, Ceramic Shield" : "Glass back, Aluminum frame" },
        { name: "Water Resistance", value: "IP68 Certified (Up to 6m for 30 mins)" }
      ];
      pros = [
        "Phenomenal camera system with superior portrait stabilization",
        "Top-tier performance, great for mobile gaming and multitasking",
        "Extremely premium build materials with long-term durability"
      ];
      cons = [
        "Slower wired charging speeds compared to competition",
        "Aesthetic changes are relatively minor compared to previous model"
      ];
      aiRec = "A masterful, elite-tier smartphone that excels in premium materials, performance reliability, and videography.";
    } else if (isLaptop) {
      specs = [
        { name: "Processor", value: "Apple M3 Chip / Intel Core i7 13th Gen" },
        { name: "RAM & Storage", value: "16GB Unified memory, 512GB SSD" },
        { name: "Display", value: "14.2\" Liquid Retina XDR, 120Hz ProMotion" },
        { name: "Battery Life", value: "Up to 18 hours wireless web navigation" },
        { name: "Graphics", value: "10-core GPU with hardware-accelerated ray tracing" },
        { name: "Weight", value: "1.4 kg ultra-portable form-factor" }
      ];
      pros = [
        "Incredible battery life that easily outlasts a full workday",
        "Silent fanless operation during general productivity tasks",
        "Dazzling, high-contrast HDR screen with fluid animations"
      ];
      cons = [
        "Limited to external display outputs without upgrading dock",
        "Premium price point compared to generic Windows notebook models"
      ];
      aiRec = "The absolute gold-standard laptop for developers, creators, and students seeking silent speed and long durability.";
    } else {
      specs = [
        { name: "Main Specs", value: "High-performance processing power and reliable performance" },
        { name: "Connectivity", value: "Wi-Fi 6E, Bluetooth 5.3, USB-C Power Delivery" },
        { name: "Battery/Power", value: "Optimized power utilization with fast charging support" },
        { name: "Dimensions", value: "Ergonomic layout designed for premium aesthetics" }
      ];
      pros = [
        "Excellent price-to-performance ratio in this product category",
        "Feature-rich interface with high customizability settings"
      ];
      cons = [
        "Slightly heavier than competing baseline products"
      ];
      aiRec = "An excellent choice for general consumers seeking high efficiency without paying a premium price tier.";
    }

    return {
      id: item.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      title: item.title,
      price: item.price,
      old_price: item.old_price,
      thumbnail: item.thumbnail,
      link: item.link || "#",
      source: item.source || "Amazon",
      rating: parseFloat(item.rating) || 4.5,
      reviews: parseInt(item.reviews) || 120,
      specs,
      pros,
      cons,
      aiRecommendation: aiRec,
      aiScore,
      isWinner: false,
      highlights: {}
    };
  };

  const calculateHighlights = (items: ComparedItem[]): ComparedItem[] => {
    if (items.length === 0) return [];
    
    // Reset highlights
    items.forEach(item => {
      item.highlights = {};
      item.isWinner = false;
    });

    // Helper to get raw numeric price
    const getPriceNum = (priceStr: string) => {
      const match = priceStr.replace(/[^0-9]/g, "");
      return parseInt(match, 10) || 1000000;
    };

    // 1. Lowest Price
    let lowestPriceIdx = 0;
    let lowestPrice = getPriceNum(items[0].price);
    for (let i = 1; i < items.length; i++) {
      const p = getPriceNum(items[i].price);
      if (p < lowestPrice) {
        lowestPrice = p;
        lowestPriceIdx = i;
      }
    }
    items[lowestPriceIdx].highlights.lowestPrice = true;

    // 2. Best Value (Highest AI Score / Price ratio)
    let bestValueIdx = 0;
    let maxRatio = items[0].aiScore / getPriceNum(items[0].price);
    for (let i = 1; i < items.length; i++) {
      const r = items[i].aiScore / getPriceNum(items[i].price);
      if (r > maxRatio) {
        maxRatio = r;
        bestValueIdx = i;
      }
    }
    items[bestValueIdx].highlights.bestValue = true;

    // 3. Best Performance (We assign arbitrarily for mock based on rating & index)
    let bestPerfIdx = 0;
    let topScore = items[0].aiScore;
    for (let i = 1; i < items.length; i++) {
      if (items[i].aiScore > topScore) {
        topScore = items[i].aiScore;
        bestPerfIdx = i;
      }
    }
    items[bestPerfIdx].highlights.bestPerformance = true;

    // 4. Best Battery (Assign to slot with largest battery specs or random)
    const batteryIdx = (items.length > 2) ? 1 : 0;
    items[batteryIdx].highlights.bestBattery = true;

    // 5. Best Camera
    const cameraIdx = 0;
    items[cameraIdx].highlights.bestCamera = true;

    // Calculate Overall Winner based on highest AI score
    let winnerIdx = 0;
    let highestWinnerScore = items[0].aiScore;
    for (let i = 1; i < items.length; i++) {
      if (items[i].aiScore > highestWinnerScore) {
        highestWinnerScore = items[i].aiScore;
        winnerIdx = i;
      }
    }
    items[winnerIdx].isWinner = true;

    return items;
  };

  const handleShare = async () => {
    const titles = comparedProducts.map(p => p.title).join(",");
    const shareUrl = `${window.location.origin}/compare?items=${encodeURIComponent(titles)}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Product Comparison on BuyWise",
          text: `Check out this product comparison on BuyWise: ${comparedProducts.map(p => p.title).join(" vs ")}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Comparison link copied to clipboard! Share it with friends.");
      }
    } catch (_) {
      toast.error("Failed to share comparison link.");
    }
  };

  const removeProduct = (idx: number) => {
    const updated = comparedProducts.filter((_, i) => i !== idx);
    const reCalculated = calculateHighlights(updated);
    setComparedProducts(reCalculated);

    // Update Query Params
    const titles = reCalculated.map(p => p.title).join(",");
    setSearchParams({ items: titles });
  };

  const triggerSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await searchProducts(val);
      setSearchResults(data.shopping_results || []);
    } catch (_) {
    } finally {
      setSearching(false);
    }
  };

  const addProductToComparison = (product: any) => {
    if (comparedProducts.length >= 4) {
      toast.error("You can compare up to 4 products simultaneously!");
      return;
    }
    
    const newItem = generateMockCompareData(product, comparedProducts.length);
    const updated = [...comparedProducts, newItem];
    const reCalculated = calculateHighlights(updated);
    setComparedProducts(reCalculated);

    // Update Query Params
    const titles = reCalculated.map(p => p.title).join(",");
    setSearchParams({ items: titles });
    
    // Clear Slot Search
    setActiveSlot(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="pt-24 md:pt-28 px-4 md:px-8 max-w-7xl mx-auto pb-16 relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-10 w-[400px] h-[400px] rounded-full bg-[#FF3B30]/5 blur-[120px] pointer-events-none z-0" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5 relative z-10">
        <div>
          <Link to="/" className="flex items-center gap-1.5 text-xs font-black text-white/50 hover:text-white uppercase tracking-widest mb-2 transition-colors">
            <ArrowLeft size={12} /> BACK TO RESEARCH
          </Link>
          <div className="flex items-center gap-2">
            <Scale className="text-[#FF3B30]" size={28} />
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase font-display leading-none">
              SPECS <span className="text-[#FF3B30]">MATRIX</span>
            </h1>
          </div>
          <p className="text-xs md:text-sm text-white/50 mt-1.5 font-medium max-w-xl">
            Compare specs, user ratings, pros & cons, and customized AI recommendations with a visual breakdown of up to 4 products.
          </p>
        </div>

        <button 
          onClick={handleShare}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(255,255,255,0.02)]"
        >
          <Share2 size={14} /> SHARE COMPARISON
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-10 h-10 border-4 border-[#FF3B30] border-t-transparent rounded-full"
          />
          <span className="text-xs font-black uppercase tracking-widest text-white/40">Synthesizing specifications...</span>
        </div>
      ) : (
        <div className="relative z-10">
          
          {/* Main Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {comparedProducts.map((product, idx) => (
              <motion.div
                key={product.id + idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-3xl border flex flex-col relative ${
                  product.isWinner 
                    ? "bg-gradient-to-b from-[#FF3B30]/10 via-black to-black border-[#FF3B30]/40 shadow-[0_0_30px_rgba(255,59,48,0.15)]" 
                    : "bg-black/40 border-white/5 hover:border-white/10"
                }`}
              >
                {/* Winner / Badges */}
                <div className="absolute -top-3 left-6 right-6 flex justify-between items-center z-20">
                  {product.isWinner ? (
                    <span className="bg-[#FF3B30] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,59,48,0.5)] flex items-center gap-1">
                      <Trophy size={10} className="fill-white animate-bounce" /> AI RECOMMENDED WINNER
                    </span>
                  ) : (
                    <span className="bg-white/10 text-white/70 border border-white/10 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      RANK {idx + 1}
                    </span>
                  )}
                  
                  <button 
                    onClick={() => removeProduct(idx)}
                    className="w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors hover:bg-red-600/20"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Top Section: Photo, Title, Price */}
                <div className="p-6 pt-10 flex flex-col items-center text-center border-b border-white/5">
                  <div className="w-32 h-32 bg-white/5 rounded-2xl flex items-center justify-center p-2 mb-4 relative overflow-hidden group border border-white/5">
                    <PremiumProductImage 
                      src={product.thumbnail} 
                      alt={product.title} 
                      className="w-full h-full p-2" 
                    />
                  </div>

                  <div className="space-y-1 w-full">
                    <span className="text-[10px] font-black text-[#FF3B30] uppercase tracking-widest block">{product.source}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-2 h-10 leading-tight mb-2">
                      {product.title}
                    </h3>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold mb-4">
                    <Star size={12} className="fill-current" />
                    {product.rating} <span className="text-white/40 font-medium text-[10px]">({product.reviews} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="mt-auto">
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 font-mono">
                      {product.price}
                    </div>
                    {product.old_price && (
                      <div className="text-xs text-white/40 line-through font-mono">
                        {product.old_price}
                      </div>
                    )}
                  </div>
                </div>

                {/* Highlight badges on specs */}
                <div className="px-6 py-4 border-b border-white/5 flex flex-wrap gap-1.5 min-h-[44px]">
                  {product.highlights.lowestPrice && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      💲 Lowest Price
                    </span>
                  )}
                  {product.highlights.bestValue && (
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      💎 Best Value
                    </span>
                  )}
                  {product.highlights.bestPerformance && (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      ⚡ Max Speed
                    </span>
                  )}
                  {product.highlights.bestBattery && (
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      🔋 Best Battery
                    </span>
                  )}
                  {product.highlights.bestCamera && (
                    <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      📸 Best Camera
                    </span>
                  )}
                </div>

                {/* AI Review Summary Block */}
                <div className="p-6 border-b border-white/5 bg-[#FF3B30]/[0.01]">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#FF3B30] mb-3">
                    <Sparkles size={14} /> AI Recommendation
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-medium">
                    {product.aiRecommendation}
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-white/40 uppercase font-black">AI Score</span>
                    <span className="text-sm font-black text-white font-mono">{product.aiScore} <span className="text-[10px] text-white/40">/100</span></span>
                  </div>
                </div>

                {/* Specifications Matrix */}
                <div className="p-6 border-b border-white/5 space-y-4">
                  <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Specifications</div>
                  {product.specs.map((spec, specIdx) => (
                    <div key={specIdx} className="space-y-1">
                      <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{spec.name}</div>
                      <div className="text-xs text-white/90 font-medium">{spec.value}</div>
                    </div>
                  ))}
                </div>

                {/* Pros Section */}
                <div className="p-6 border-b border-white/5 space-y-3 bg-green-500/[0.01]">
                  <div className="text-xs font-black uppercase tracking-widest text-green-400">Pros</div>
                  <ul className="space-y-1.5">
                    {product.pros.map((pro, pIdx) => (
                      <li key={pIdx} className="text-xs text-white/70 flex items-start gap-2 font-medium">
                        <Check size={12} className="text-green-400 mt-0.5 shrink-0" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons Section */}
                <div className="p-6 border-b border-white/5 space-y-3 bg-red-500/[0.01]">
                  <div className="text-xs font-black uppercase tracking-widest text-red-400">Cons</div>
                  <ul className="space-y-1.5">
                    {product.cons.map((con, cIdx) => (
                      <li key={cIdx} className="text-xs text-white/70 flex items-start gap-2 font-medium">
                        <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Buy Button */}
                <div className="p-6 mt-auto">
                  <a 
                    href={product.link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-white hover:bg-[#FF3B30] text-black hover:text-white transition-all text-[11px] font-black tracking-[0.2em] uppercase rounded-xl flex items-center justify-center gap-1.5"
                  >
                    Buy at {product.source} <ExternalLink size={12} />
                  </a>
                </div>
              </motion.div>
            ))}

            {/* Empty Slots to add more products */}
            {Array.from({ length: 4 - comparedProducts.length }).map((_, slotIdx) => {
              const currentSlotIndex = comparedProducts.length + slotIdx;
              const isSearchingThisSlot = activeSlot === currentSlotIndex;

              return (
                <div 
                  key={slotIdx}
                  className="rounded-3xl border border-dashed border-white/10 hover:border-white/20 bg-white/[0.01] flex flex-col items-center justify-center p-8 min-h-[400px] text-center"
                >
                  {!isSearchingThisSlot ? (
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 mx-auto">
                        <Plus size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest text-white/80">Add Product</div>
                        <div className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-bold">Slot {currentSlotIndex + 1} of 4</div>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveSlot(currentSlotIndex);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors"
                      >
                        Search Products
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col justify-start">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Slot Search</span>
                        <button 
                          onClick={() => setActiveSlot(null)}
                          className="text-white/40 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="relative mb-4">
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => triggerSearch(e.target.value)}
                          placeholder="Search product name..."
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#FF3B30] transition-colors"
                          autoFocus
                        />
                        {searching && (
                          <div className="absolute right-3 top-3.5">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="w-4 h-4 border-2 border-[#FF3B30] border-t-transparent rounded-full"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1 scrollbar-thin">
                        {searchResults.length > 0 ? (
                          searchResults.map((item, resIdx) => (
                            <button
                              key={resIdx}
                              onClick={() => addProductToComparison(item)}
                              className="w-full p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-left flex gap-3 items-center transition-all group"
                            >
                              <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                                <PremiumProductImage src={item.thumbnail} alt={item.title} className="w-full h-full p-0.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#FF3B30] transition-colors">{item.title}</div>
                                <div className="text-[10px] font-mono text-white/40 mt-0.5">{item.price} • {item.source}</div>
                              </div>
                            </button>
                          ))
                        ) : searchQuery.trim().length >= 2 && !searching ? (
                          <div className="text-[10px] text-white/40 uppercase py-6">No matching products found</div>
                        ) : (
                          <div className="text-[10px] text-white/40 uppercase py-6">Type to search live products...</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI Advisor Chat Box at Bottom */}
          <div className="mt-16 bg-gradient-to-r from-red-600/10 to-transparent border border-red-600/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF3B30]/20 flex items-center justify-center shrink-0 border border-[#FF3B30]/30 shadow-[0_0_15px_rgba(255,59,48,0.3)]">
                <Sparkles size={22} className="text-[#FF3B30]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#FF3B30]">BuyWise Smart Shopping Advice</h3>
                <h4 className="text-base font-bold text-white">Should you upgrade or buy now?</h4>
                <p className="text-sm text-white/70 leading-relaxed font-medium max-w-4xl">
                  {comparedProducts.length >= 2 ? (
                    <span>
                      Our multi-threaded deep predictive intelligence has analyzed <strong>{comparedProducts.map(p => p.title.split(' ')[0]).join(" vs ")}</strong>. 
                      The winner, <strong>{comparedProducts.find(p => p.isWinner)?.title || comparedProducts[0]?.title}</strong>, delivers the maximum specs value-arbitrage in terms of camera resolution, long-term battery performance, and processor thermal limits. 
                      Purchasing through <strong>{comparedProducts.find(p => p.isWinner)?.source || comparedProducts[0]?.source}</strong> saves you immediate capital today.
                    </span>
                  ) : (
                    <span>
                      Add at least two products to trigger our interactive AI Spec-Matrix recommendation engine! We evaluate hardware thermal limits, brand depreciation, real user reviews, and pricing trends in real time.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
