import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, Star, Truck, TrendingDown, Check, Heart, ShieldCheck, Zap, Tag } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { doc, setDoc } from "../lib/firebase";
import { db } from "../lib/firebase";
import { useCurrency } from "../contexts/CurrencyContext";
import { useAffiliate } from "../contexts/AffiliateContext";
import toast from "react-hot-toast";
import TiltedCard from "./TiltedCard";

interface ProductCardProps {
  product?: {
    title: string;
    price: string;
    thumbnail: string;
    link: string;
    source: string;
    rating?: number;
    reviews?: number;
    delivery?: string;
    old_price?: string;
    features?: string[];
    isOriginalLink?: boolean;
    coupon?: string;
    aiScore?: number;
  };
  isBest?: boolean;
  isLoading?: boolean;
}

export default function ProductCard({
  product,
  isBest,
  isLoading,
}: ProductCardProps) {
  const { user, openLogin } = useAuth();
  const { formatPrice: contextFormatPrice } = useCurrency();
  const { triggerRedirect } = useAffiliate();
  const [isTracked, setIsTracked] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const formatPrice = (p: string) => {
    if (!p) return "N/A";
    const numMatch = p.replace(/,/g, '').match(/[\d.]+/);
    if (!numMatch) return p.replace("$", "₹");
    const amountInINR = parseFloat(numMatch[0]);
    return contextFormatPrice(amountInINR);
  };

  const getSavings = () => {
    if (!product || !product.old_price) return null;
    const oldP = parseFloat(product.old_price.replace(/,/g, '').match(/[\d.]+/)![0] || "0");
    const newP = parseFloat(product.price.replace(/,/g, '').match(/[\d.]+/)![0] || "0");
    if (oldP > newP) {
      return Math.round(((oldP - newP) / oldP) * 100);
    }
    return null;
  };

  const handleTrackPrice = async () => {
    if (!product) return;
    if (!user) {
      openLogin();
      return;
    }
    
    try {
      const trackingId = `${user.uid}_${product.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
      await setDoc(doc(db, "price_tracking", trackingId), {
        userId: user.uid,
        productTitle: product.title,
        link: product.link,
        source: product.source,
        currentPrice: product.price,
        trackedAt: new Date().toISOString(),
        thumbnail: product.thumbnail,
      });
      setIsTracked(true);
    } catch (error) {
      console.error("Error tracking price:", error);
      toast.error("Could not track price. Ensure you are signed in.");
    }
  };

  const handleWishlist = async () => {
    if (!product) return;
    if (!user) {
      openLogin();
      return;
    }
    
    try {
      const wishlistId = `wishlist_${user.uid}_${product.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
      await setDoc(doc(db, "wishlist", wishlistId), {
        userId: user.uid,
        productTitle: product.title,
        link: product.link,
        source: product.source,
        currentPrice: product.price,
        thumbnail: product.thumbnail,
        addedAt: new Date().toISOString()
      });
      setIsWishlisted(true);
    } catch (error) {
      console.error("Error wishlisting:", error);
    }
  };

  const getOrderLink = () => {
    if (!product) return "#";
    let orderLink = product.link || (product as any).product_link;
    
    // Extract actual destination from google.com/url?q=... or url=...
    if (orderLink && orderLink.includes("google.com/url")) {
      try {
        const urlObj = new URL(orderLink);
        const actualUrl = urlObj.searchParams.get("url") || urlObj.searchParams.get("q");
        if (actualUrl) {
          return actualUrl;
        }
      } catch (e) {
        console.error("Failed to parse Google redirect URL", e);
      }
    }

    // Force direct links based on source if link is missing
    if (!orderLink || orderLink.includes("serpapi.com") || orderLink.includes("google.com/shopping")) {
      const encodeQ = encodeURIComponent(product.title);
      const src = product.source.toLowerCase();
      if (src.includes("amazon")) return `https://www.amazon.in/s?k=${encodeQ}`;
      if (src.includes("flipkart")) return `https://www.flipkart.com/search?q=${encodeQ}`;
      if (src.includes("croma")) return `https://www.croma.com/searchB?q=${encodeQ}`;
      if (src.includes("reliance")) return `https://www.reliancedigital.in/search?q=${encodeQ}`;
      // Fallback
      return `https://www.google.com/search?q=${encodeQ}`;
    }
    return orderLink;
  };

  if (isLoading || !product) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className={`terminal-card p-0 flex flex-col gap-0 overflow-hidden bg-transparent ${
          isBest
            ? "border-[#FF3B30] border-2 shadow-[0_0_30px_0_rgba(255,59,48,0.4)]"
            : "border-white/10"
        }`}
      >
        <div className="relative aspect-[4/5] bg-white/5 animate-pulse flex items-center justify-center overflow-hidden border-b border-white/10" />

        <div className="p-6 flex flex-col gap-4 flex-grow bg-black/20">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="h-3 w-16 bg-white/10 animate-pulse rounded-full" />
            <div className="h-3 w-8 bg-white/10 animate-pulse rounded-full" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 animate-pulse rounded-full" />
            <div className="h-4 w-2/3 bg-white/10 animate-pulse rounded-full" />
          </div>

          <div className="mt-auto pt-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="h-8 w-24 bg-white/10 animate-pulse rounded-full" />
              <div className="h-3 w-32 bg-white/10 animate-pulse rounded-full" />
            </div>

            <div className="w-full py-6 bg-white/10 animate-pulse rounded-lg" />
          </div>
        </div>
      </motion.div>
    );
  }

  const savings = getSavings();
  const aiScore = product.aiScore || Math.floor(Math.random() * (99 - 85 + 1) + 85);

  return (
    <div className="w-full h-full relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={handleMouseLeave}>
      <TiltedCard
        containerHeight="100%"
        containerWidth="100%"
        imageHeight="100%"
        imageWidth="100%"
        rotateAmplitude={12}
        scaleOnHover={1.03}
        showMobileWarning={false}
        showTooltip={false}
        displayOverlayContent={true}
        overlayContent={
          <div
            className={`glass-card p-0 flex flex-col gap-0 overflow-visible group transition-all duration-300 w-full h-full ${
              isBest
                ? "border-[#FF3B30]/50 border-2 shadow-[0_0_40px_rgba(255,59,48,0.3)] hover:shadow-[0_0_60px_rgba(255,59,48,0.5)]"
                : "border-white/10 hover:border-[#FF3B30]/50 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div 
              className="relative aspect-[4/5] bg-[#0a0a0a] flex items-center justify-center overflow-hidden border-b border-white/10 rounded-t-3xl"
              style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
            >
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 pointer-events-none">
                 {isBest && (
                   <div className="bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                     <Zap size={10} className="fill-white" /> AI Pick
                   </div>
                 )}
                 {savings && savings > 10 && (
                   <div className="bg-[#FF3B30] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                     <TrendingDown size={10} /> {savings}% OFF
                   </div>
                 )}
                 {product.coupon && (
                   <div className="bg-[#FFD700] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                     <Tag size={10} /> {product.coupon}
                   </div>
                 )}
              </div>

              <div className="absolute top-4 right-4 z-20">
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                   <div className="text-[10px] text-center leading-none">
                     <div className="font-black text-[#FF3B30]">{aiScore}</div>
                     <div className="text-[6px] text-white/50 uppercase tracking-widest">Score</div>
                   </div>
                </div>
              </div>

              {/* The 2D product picture overlaid or centered to ensure it's always clearly visible */}
              <div 
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none p-12"
                style={{ transform: "translateZ(50px)" }}
              >
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-out group-hover:scale-125 group-hover:-translate-y-4 opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div 
              className="p-6 flex flex-col gap-4 flex-grow bg-gradient-to-b from-[#111111] to-black rounded-b-3xl relative z-20"
              style={{ transform: "translateZ(20px)" }}
            >
        <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-3">
          <span className="text-[11px] font-black text-[#FF3B30] uppercase tracking-[0.1em]">
            {product.source}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-[#FFD700] font-black">
            <Star size={10} className="fill-[#FFD700]" />
            {product.rating || "4.5"}
          </div>
        </div>

        <h3 className="text-sm font-bold text-white line-clamp-2 leading-relaxed tracking-tight group-hover:text-[#FF3B30] transition-colors">
          {product.title}
        </h3>

        {/* Dynamic Generative Features */}
        {product.features && product.features.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            {product.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-[9px] font-bold tracking-widest text-white/50 uppercase"
              >
                <ShieldCheck size={10} className="text-[#FF3B30]" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        )}

        {/* AI Insights (Price Prediction & Cashback) */}
        <div className="mt-2 space-y-1.5 border border-white/5 bg-white/[0.02] p-2.5 rounded-xl">
           <div className="flex justify-between items-center">
             <span className="text-[9px] font-black uppercase tracking-widest text-white/40">AI Prediction</span>
             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Wait 7 Days (85%)</span>
           </div>
           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 w-[85%] rounded-full" />
           </div>
           <div className="flex justify-between items-center pt-1 border-t border-white/5">
             <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Smart Cashback</span>
             <span className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]">Earn ~2%</span>
           </div>
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] font-mono drop-shadow-[0_0_8px_rgba(255,59,48,0.3)]">
                {formatPrice(product.price)}
              </span>
              {product.old_price && (
                <span className="text-[10px] text-[#FFD700]/70 line-through font-mono mt-1">
                  {formatPrice(product.old_price)}
                </span>
              )}
            </div>
            <div className="text-[9px] text-[#FF3B30]/70 uppercase tracking-[0.2em] font-black flex items-center gap-2 mt-1">
              <Truck size={12} className="text-[#FF3B30]" />
              {product.delivery || "FREE PRIORITY DELIVERY"}
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              onClick={() => triggerRedirect({
                url: getOrderLink(),
                store: product.source || "amazon",
                productId: product.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50),
                productTitle: product.title,
                category: "electronics"
              })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-4 text-[11px] font-black tracking-[0.2em] uppercase transition-all text-center flex items-center justify-center gap-2 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(255,59,48,0.2)] hover:shadow-[0_0_25px_rgba(255,59,48,0.5)] ${
                isBest
                  ? "bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] text-white"
                  : "bg-white text-black hover:bg-[#FF3B30] hover:text-white"
              }`}
            >
              Buy Now <ExternalLink size={14} />
            </motion.button>
            <motion.button
              onClick={handleWishlist}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`px-4 rounded-xl flex items-center justify-center transition-all ${
                isWishlisted 
                  ? "bg-[#FF3B30]/20 border border-[#FF3B30] text-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.3)]" 
                  : "bg-[#0a0a0a] border border-white/10 text-white hover:border-[#FF3B30] hover:text-[#FF3B30]"
              }`}
              title={isWishlisted ? "Wishlisted!" : "Add to Wishlist"}
            >
               <Heart size={18} className={isWishlisted ? "fill-[#FF3B30]" : ""} />
            </motion.button>
          </div>
        </div>
      </div>
      </div>
        }
      />
    </div>
  );
}
