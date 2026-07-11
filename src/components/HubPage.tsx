import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ShoppingBag, Tag, Star, ArrowRight, ShieldCheck, 
  HelpCircle, Sparkles, Award, Percent, Globe, ChevronRight,
  TrendingUp, Clock, Zap, MessageSquare, AlertCircle
} from "lucide-react";
import { useCurrency } from "../contexts/CurrencyContext";
import SEO from "./SEO";
import toast from "react-hot-toast";

interface FAQ {
  q: string;
  a: string;
}

interface HubData {
  title: string;
  description: string;
  type: "category" | "merchant";
  bannerTitle: string;
  bannerSub: string;
  deals: {
    title: string;
    price: string;
    oldPrice: string;
    discount: number;
    source: string;
    thumbnail: string;
    badge?: string;
  }[];
  coupons?: {
    code: string;
    discount: string;
    desc: string;
    expiry: string;
  }[];
  faqs: FAQ[];
  buyingTips: string[];
  seoContent: string;
}

const HUB_DATA: Record<string, HubData> = {
  // --- Categories ---
  mobiles: {
    title: "Best Mobile Phone Deals & Pricing",
    description: "Compare smartphone prices across Amazon, Flipkart, and Croma. View price histories, real-time coupons, and AI predictions.",
    type: "category",
    bannerTitle: "MOBILE PHONES",
    bannerSub: "AI price index for flagships, mid-rangers, and budget phones.",
    deals: [
      { title: "OnePlus 12 5G (Flowy Emerald, 16GB RAM)", price: "₹64,999", oldPrice: "₹69,999", discount: 7, source: "Amazon", thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300", badge: "Price Drop" },
      { title: "Apple iPhone 15 Pro (128GB, Natural Titanium)", price: "₹1,24,900", oldPrice: "₹1,34,900", discount: 7, source: "Vijay Sales", thumbnail: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300", badge: "Best Value" },
      { title: "Samsung Galaxy S24 Ultra (256GB)", price: "₹1,19,999", oldPrice: "₹1,29,999", discount: 8, source: "Reliance Digital", thumbnail: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300", badge: "Trending" },
    ],
    buyingTips: [
      "Check the Price History Chart: Flagship phones drop up to 15% during festive sales.",
      "Look for Bank Offers: Major credit cards often provide flat ₹3,000 to ₹5,000 instant discount."
    ],
    seoContent: "Smartphones are among the most price-volatile categories online. By tracking real-time deals across Amazon and Flipkart, BuyWise provides the highest discount opportunities. Utilize our visual AI specs metrics matrix to choose the ideal hardware balance.",
    faqs: [
      { q: "Which store has the cheapest iPhone pricing in India?", a: "iPhones fluctuate across Flipkart and Vijay Sales daily. We recommend checking our active price drop alerts to catch liquidation prices." },
      { q: "Is the OnePlus 12 worth buying now?", a: "Yes, our AI trend prediction shows OnePlus 12 prices are stable with negligible room for further sudden discounts." }
    ]
  },
  laptops: {
    title: "Best Laptop Deals & Specs Comparison",
    description: "Compare developer laptops, creator notebooks, and student PCs across top merchants.",
    type: "category",
    bannerTitle: "LAPTOPS",
    bannerSub: "High-performance setups with real-time merchant pricing indexes.",
    deals: [
      { title: "MacBook Air M3 (13-inch, 16GB RAM)", price: "₹1,04,900", oldPrice: "₹1,14,900", discount: 9, source: "Amazon", thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300", badge: "Best Seller" },
      { title: "ASUS ROG Zephyrus G14 Gaming", price: "₹1,34,990", oldPrice: "₹1,49,990", discount: 10, source: "Croma", thumbnail: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300", badge: "Best Perf" }
    ],
    buyingTips: [
      "Unified Memory: Avoid 8GB RAM for programming or heavy design.",
      "Check the launch cycles: Older models drop up to 25% when M-series or Intel Core Ultra iterations launch."
    ],
    seoContent: "Laptops represent substantial investments. Finding the best student and creator notebook pricing requires constant scanning. Let BuyWise index multiple catalogs automatically.",
    faqs: [
      { q: "Should I buy a MacBook or Windows laptop for coding?", a: "MacBooks generally lead in overall battery efficiency and Unix-based toolchain support, whereas Windows is optimal for gaming and CAD applications." }
    ]
  },

  // --- Merchants ---
  amazon: {
    title: "Amazon India Promo Codes, Deals & Coupons",
    description: "Get verified Amazon discount codes, flash sales, and automated coin rewards on BuyWise.",
    type: "merchant",
    bannerTitle: "AMAZON INDIA",
    bannerSub: "Prime deals, dynamic shipping rates, and immediate cashbacks.",
    coupons: [
      { code: "AMZNCARD3000", discount: "Flat ₹3,000 Off", desc: "Instant discount on purchases above ₹50,000 using SBI Credit Cards.", expiry: "Exp. 30 July" },
      { code: "AMZNSMART10", discount: "10% Cashback", desc: "On select home appliances using Amazon Pay Balance.", expiry: "Exp. 25 July" }
    ],
    deals: [
      { title: "Sony WH-1000XM5 Noise Cancelling Headphones", price: "₹26,990", oldPrice: "₹29,990", discount: 10, source: "Amazon", thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", badge: "Lowest Price" }
    ],
    faqs: [
      { q: "How do I claim Amazon coupon discounts automatically?", a: "Click 'Buy Now' to copy our exclusive discount codes instantly to your clipboard before navigating to Amazon." }
    ],
    buyingTips: [
      "Keep an eye out for lightning deals which run for as short as 2 hours with immense savings."
    ],
    seoContent: "As India's largest marketplace, Amazon runs dynamic pricing algorithms every hour. BuyWise indexes Amazon lists constantly to fetch accurate price alerts."
  },
  flipkart: {
    title: "Flipkart Coupons, Sale Dates & Price Drop Alerts",
    description: "Find verified Flipkart discount deals, SuperCoin offers, and Big Billion Days price drops.",
    type: "merchant",
    bannerTitle: "FLIPKART",
    bannerSub: "Home of the largest electronic liquidations and smart brand catalogs.",
    coupons: [
      { code: "FKVIP10", discount: "Extra 10% OFF", desc: "Applicable on select apparel and footwear purchases.", expiry: "Exp. 18 Aug" }
    ],
    deals: [
      { title: "Samsung Galaxy Buds2 Pro Wireless", price: "₹9,999", oldPrice: "₹15,999", discount: 37, source: "Flipkart", thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300", badge: "Mega Deal" }
    ],
    faqs: [
      { q: "When is the next big Flipkart Sale?", a: "Flipkart's premium Big Billion Days sale runs in October, but monthly electronic sales provide steady 10-15% drops." }
    ],
    buyingTips: [
      "Exchange bonuses on old phones are often boosted during major Flipkart events."
    ],
    seoContent: "Flipkart is the premium destination for exclusive smartphone launches and large electronic appliances."
  }
};

export default function HubPage() {
  const { slug } = useParams<{ slug: string }>();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<"deals" | "coupons" | "faq">("deals");

  const cleanSlug = (slug || "").toLowerCase();
  const data = HUB_DATA[cleanSlug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!data) {
    return (
      <div className="pt-32 text-center pb-20">
        <AlertCircle className="mx-auto text-white/30 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Hub Node Not Found</h2>
        <p className="text-white/50 text-xs mb-6">The requested landing page could not be located in our index directory.</p>
        <Link to="/" className="px-5 py-2.5 bg-[#FF3B30] text-white text-xs font-black uppercase tracking-widest rounded-lg">
          Return Home
        </Link>
      </div>
    );
  }

  // Generate dynamic JSON-LD Schema markup for the category/merchant
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": data.type === "merchant" ? "Brand" : "WebPage",
    "name": data.title,
    "description": data.description,
    "url": window.location.href,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": data.deals.map((deal, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": deal.title,
        "offers": {
          "@type": "Offer",
          "price": deal.price.replace(/[^0-9]/g, ""),
          "priceCurrency": "INR"
        }
      }))
    }
  };

  return (
    <div className="pt-24 md:pt-28 pb-16 relative">
      {/* Dynamic SEO Tags */}
      <SEO 
        title={data.title}
        description={data.description}
        canonicalUrl={window.location.href}
      />

      {/* JSON-LD Script */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#111111] via-black to-black border-b border-white/5 py-12 md:py-20 px-4 md:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/10 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF3B30] bg-[#FF3B30]/10 px-3 py-1 rounded-full border border-[#FF3B30]/20">
              {data.type === "category" ? "Product Category" : "E-Commerce Merchant"}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-none font-display">
            {data.bannerTitle} <span className="text-[#FF3B30]">INDEX</span>
          </h1>
          <p className="text-sm md:text-base text-white/50 mt-4 max-w-2xl font-medium leading-relaxed">
            {data.bannerSub} Fully synced with our real-time price tracker pipeline.
          </p>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mt-8 text-[10px] font-black tracking-wider uppercase text-white/40">
            <Link to="/" className="hover:text-white transition-colors">HOME</Link>
            <ChevronRight size={10} />
            <span className="text-white">{data.bannerTitle}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Internal Links & Meta */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Smart Hubs</h3>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#FF3B30] block uppercase tracking-wider">// CATEGORIES</span>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <Link to="/hub/mobiles" className="text-xs font-medium text-white/60 hover:text-[#FF3B30] transition-colors block">Mobiles & Phones</Link>
                <Link to="/hub/laptops" className="text-xs font-medium text-white/60 hover:text-[#FF3B30] transition-colors block">Creator Laptops</Link>
              </div>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-bold text-[#FF3B30] block uppercase tracking-wider">// MERCHANTS</span>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <Link to="/hub/amazon" className="text-xs font-medium text-white/60 hover:text-[#FF3B30] transition-colors block">Amazon India</Link>
                <Link to="/hub/flipkart" className="text-xs font-medium text-white/60 hover:text-[#FF3B30] transition-colors block">Flipkart Store</Link>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-green-500" /> BUYWISE ASSURED
            </h3>
            <p className="text-[10px] text-white/50 leading-relaxed font-medium">
              We check prices continuously. All coupon combinations are programmatically verified and crowd-voted.
            </p>
          </div>
        </div>

        {/* Right Side: Active Content Tabs */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Tab Selector */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 max-w-sm">
            <button
              onClick={() => setActiveTab("deals")}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === "deals" ? "bg-[#FF3B30] text-white shadow-lg" : "text-white/50 hover:text-white"
              }`}
            >
              Latest Deals
            </button>
            {data.coupons && (
              <button
                onClick={() => setActiveTab("coupons")}
                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === "coupons" ? "bg-[#FF3B30] text-white shadow-lg" : "text-white/50 hover:text-white"
                }`}
              >
                Coupons
              </button>
            )}
            <button
              onClick={() => setActiveTab("faq")}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === "faq" ? "bg-[#FF3B30] text-white shadow-lg" : "text-white/50 hover:text-white"
              }`}
            >
              FAQs
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "deals" && (
            <div className="space-y-6">
              <h2 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Clock size={16} className="text-[#FF3B30] animate-pulse" /> LIVE PRICE TRACKS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.deals.map((deal, idx) => (
                  <div key={idx} className="bg-[#111111] border border-white/5 p-4 rounded-2xl flex gap-4 hover:border-white/15 transition-all">
                    <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center p-2 shrink-0">
                      <img src={deal.thumbnail} alt="" className="w-full h-full object-contain filter drop-shadow-md" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {deal.badge && (
                          <span className="text-[8px] font-black uppercase bg-[#FF3B30]/10 text-[#FF3B30] px-2 py-0.5 rounded border border-[#FF3B30]/20 inline-block mb-1">
                            {deal.badge}
                          </span>
                        )}
                        <h3 className="text-xs font-bold text-white line-clamp-2 h-8 leading-tight">{deal.title}</h3>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-base font-black text-white font-mono">{deal.price}</span>
                        <span className="text-[10px] text-white/40 line-through font-mono">{deal.oldPrice}</span>
                        <span className="text-[10px] text-green-400 font-bold">({deal.discount}% OFF)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "coupons" && data.coupons && (
            <div className="space-y-4">
              <h2 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Percent size={16} className="text-yellow-500" /> ACTIVE COUPONS
              </h2>
              <div className="space-y-3">
                {data.coupons.map((c, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-black text-yellow-400 uppercase tracking-wide">{c.discount}</div>
                      <div className="text-xs text-white/70 font-medium">{c.desc}</div>
                      <div className="text-[10px] text-white/40 font-mono">{c.expiry}</div>
                    </div>

                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(c.code);
                        toast.success(`Coupon code ${c.code} copied!`);
                      }}
                      className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"
                    >
                      CODE: {c.code}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-4">
              <h2 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
                <HelpCircle size={16} className="text-[#FF3B30]" /> HELP & DIRECTORIES
              </h2>
              <div className="space-y-4">
                {data.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full shrink-0"></span>
                      {faq.q}
                    </h3>
                    <p className="text-xs text-white/55 leading-relaxed font-medium pl-3.5">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Strategy Advice Block */}
          <div className="bg-gradient-to-b from-[#111111] to-black border border-white/5 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#FF3B30]" size={16} />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">AI Buying Advice & Strategic Insight</h3>
            </div>
            
            <ul className="space-y-2">
              {data.buyingTips.map((tip, idx) => (
                <li key={idx} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                  <span className="text-[#FF3B30] font-black font-mono">0{idx + 1}.</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Content Block */}
          <div className="prose prose-invert max-w-none text-xs text-white/40 leading-relaxed font-medium pt-4 border-t border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-2">SEO Hub Editorial</h4>
            <p>{data.seoContent}</p>
          </div>

        </div>

      </div>

    </div>
  );
}
