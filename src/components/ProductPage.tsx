import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, ArrowLeft, Star, Heart, Share2, ShieldCheck, 
  Truck, Undo, Tag, AlertCircle, ShoppingCart, Activity,
  LineChart as LineChartIcon, Box, Image as ImageIcon,
  Zap, Info, CheckCircle2, ChevronDown
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';

const mockPriceHistory = [
  { name: 'Jan', price: 99990 },
  { name: 'Feb', price: 95000 },
  { name: 'Mar', price: 98000 },
  { name: 'Apr', price: 92000 },
  { name: 'May', price: 89000 },
  { name: 'Jun', price: 85000 },
];

const mockReviews = [
  { id: 1, user: "Alex M.", rating: 5, date: "2 weeks ago", text: "Incredible device. The titanium build is much lighter than my previous phone. Cameras are top notch." },
  { id: 2, user: "Sarah J.", rating: 4, date: "1 month ago", text: "Great phone but battery life could be slightly better. Love the action button!" },
  { id: 3, user: "Raj P.", rating: 5, date: "2 months ago", text: "Upgraded from 13 Pro. The screen and performance are noticeably better. Very happy with the purchase." },
];

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'gallery'>('gallery');
  const [activeImage, setActiveImage] = useState(0);
  
  const product = {
    id: id || 'iphone-15-pro',
    name: 'Apple iPhone 15 Pro (256GB) - Natural Titanium',
    brand: 'Apple',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system.',
    price: 85000,
    originalPrice: 134900,
    rating: 4.8,
    reviews: 1245,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    ],
    features: [
      'A17 Pro chip with 6-core GPU',
      'Titanium with textured matte glass back',
      'Action button',
      'Dynamic Island',
      '48MP Main | Ultra Wide | Telephoto',
    ],
    vendors: [
      { name: 'Amazon', price: 85000, logo: 'A', inStock: true, link: '#' },
      { name: 'Flipkart', price: 87500, logo: 'F', inStock: true, link: '#' },
      { name: 'Croma', price: 89900, logo: 'C', inStock: false, link: '#' },
    ]
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/50 mb-8">
        <button onClick={() => navigate(-1)} className="hover:text-white flex items-center gap-1 transition-colors">
          <ArrowLeft size={12} /> Back
        </button>
        <ChevronRight size={12} />
        <Link to="/deals" className="hover:text-white transition-colors">Electronics</Link>
        <ChevronRight size={12} />
        <Link to="/deals" className="hover:text-white transition-colors">Smartphones</Link>
        <ChevronRight size={12} />
        <span className="text-[#FF3B30] truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Visuals & Tech Specs (7 cols) */}
        <div className="xl:col-span-7 space-y-8">
          
          {/* Main Visualizer Container */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden p-2 relative h-[50vh] min-h-[400px] flex flex-col group">
            {/* Badges */}
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
              <div className="bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                Lowest Price
              </div>
              <div className="bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                Top Rated
              </div>
            </div>

            {/* Content Display */}
            <div className="flex-1 rounded-2xl overflow-hidden bg-black/20 flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                  <motion.img
                    key={`img-${activeImage}`}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={product.images[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-screen"
                  />
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-[#FF3B30] scale-105' : 'border-white/10 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

          </div>

          {/* AI Summary Card */}
          <div className="bg-gradient-to-br from-[#FF3B30]/10 to-transparent border border-[#FF3B30]/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B30]/10 blur-[40px] rounded-full group-hover:bg-[#FF3B30]/20 transition-all duration-500" />
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF3B30]/20 flex items-center justify-center shrink-0">
                <Zap size={20} className="text-[#FF3B30]" />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#FF3B30] uppercase tracking-widest mb-2">BuyWise AI Summary</h3>
                <p className="text-sm text-white/80 leading-relaxed font-medium">
                  This product is currently at its <span className="text-green-400 font-bold">lowest price in 6 months</span>. 
                  Reviews highly praise the camera and build quality. <span className="text-yellow-400 font-bold">Recommendation: BUY NOW.</span>
                </p>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4">
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">AI Deal Score</div>
                    <div className="text-2xl font-black text-white">96<span className="text-sm text-white/50">/100</span></div>
                  </div>
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={14} className="text-[#FF3B30] fill-[#FF3B30]" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scam Detection */}
          <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-4 flex items-center gap-3">
             <ShieldCheck size={24} className="text-green-400 shrink-0" />
             <div>
               <div className="text-xs font-black text-green-400 uppercase tracking-widest">Safe Purchase Verified</div>
               <div className="text-[10px] text-white/60">Seller is authorized. 0% fake reviews detected. Trusted return policy.</div>
             </div>
          </div>

          {/* Specifications & Features */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info size={18} className="text-[#FF3B30]" /> Key Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white/[0.01] rounded-lg border border-white/5">
                  <CheckCircle2 size={16} className="text-[#FF3B30] mt-0.5 shrink-0" />
                  <span className="text-sm text-white/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8">
             <div className="flex justify-between items-end mb-6 pb-4 border-b border-white/5">
               <div>
                  <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <Star size={18} className="text-[#FFD700] fill-[#FFD700]" /> Real Reviews
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-black text-white">{product.rating}</span>
                    <span className="text-xs text-white/50 uppercase tracking-widest">out of 5 ({product.reviews} reviews)</span>
                  </div>
               </div>
               <button className="text-xs font-black text-[#FF3B30] uppercase tracking-widest hover:text-white transition-colors">Write Review</button>
             </div>
             
             <div className="space-y-4">
                {mockReviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white/[0.01] rounded-xl border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-sm text-white">{rev.user}</div>
                        <div className="text-[10px] text-white/40 uppercase">{rev.date}</div>
                      </div>
                      <div className="flex gap-1 text-[#FFD700]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < rev.rating ? "fill-current" : "opacity-30"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-white/70">{rev.text}</p>
                  </div>
                ))}
             </div>
          </div>

        </div>

        {/* Right Column: Buying Options & Analytics (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Main Price Box */}
          <div className="bg-gradient-to-b from-[#111111] to-black border border-white/10 rounded-3xl p-6 md:p-8 sticky top-24 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white font-display leading-tight">{product.name}</h1>
                <p className="text-sm text-[#FF3B30] font-bold uppercase tracking-widest mt-2">{product.brand}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">
                  <Heart size={18} />
                </button>
                <button 
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: product.name,
                          text: `Check out ${product.name} on PriceVerse!`,
                          url: window.location.href,
                        });
                      } else {
                        await navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }
                    } catch (error) {
                      console.error("Error sharing:", error);
                    }
                  }}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <div className="my-6 pt-6 border-t border-white/10">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] font-mono">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-lg text-white/40 line-through font-mono mb-1">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                  Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Inclusive of all taxes</span>
              </div>
            </div>

            {/* Coupons & Cashback */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Tag size={16} className="text-green-400" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-green-400 uppercase tracking-wide">Bank Offer Applied</div>
                  <div className="text-[10px] text-white/60">Extra ₹2,500 off on ICICI Credit Cards</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <span className="text-lg">🪙</span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-yellow-500 uppercase tracking-wide">Earn BuyWise Coins</div>
                  <div className="text-[10px] text-white/60">Get +150 Coins on successful purchase</div>
                </div>
              </div>
            </div>

            {/* Vendor Comparison (Affiliate Links) */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Live Prices</h3>
              {product.vendors.map((vendor, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${idx === 0 ? 'bg-white/5 border-[#FF3B30]/50' : 'bg-transparent border-white/10'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-black">
                      {vendor.logo}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{vendor.name}</div>
                      <div className={`text-[10px] uppercase font-black tracking-widest ${vendor.inStock ? 'text-green-400' : 'text-red-400'}`}>
                        {vendor.inStock ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono">{formatPrice(vendor.price)}</div>
                    <a href={vendor.link} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded mt-1 inline-block ${idx === 0 ? 'bg-[#FF3B30] text-black hover:bg-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                      Buy Now
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-6">
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck size={20} className="text-[#FF3B30]" />
                <span className="text-[9px] uppercase font-bold text-white/50 tracking-widest">1 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={20} className="text-[#FF3B30]" />
                <span className="text-[9px] uppercase font-bold text-white/50 tracking-widest">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Undo size={20} className="text-[#FF3B30]" />
                <span className="text-[9px] uppercase font-bold text-white/50 tracking-widest">7 Day Return</span>
              </div>
            </div>

            {/* Global Shopping / Import Compare */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/60 mb-4">Global Prices (Import)</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                  <span className="text-white flex items-center gap-2"><span className="text-sm">🇺🇸</span> USA</span>
                  <span className="text-white/60">₹79,000 + ₹6,000 Tax</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                  <span className="text-white flex items-center gap-2"><span className="text-sm">🇦🇪</span> UAE</span>
                  <span className="text-white/60">₹81,000 + ₹3,000 Tax</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                  <span className="text-white flex items-center gap-2"><span className="text-sm">🇯🇵</span> Japan</span>
                  <span className="text-white/60">₹82,500 + ₹4,000 Tax</span>
                </div>
              </div>
            </div>

          </div>

          {/* Price History Chart */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <LineChartIcon size={16} className="text-[#FF3B30]" /> Price History (6 Months)
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPriceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,59,48,0.2)', borderRadius: '8px' }}
                    itemStyle={{ color: '#FF3B30', fontWeight: 'bold' }}
                    formatter={(value: number) => [formatPrice(value), 'Price']}
                  />
                  <Line type="monotone" dataKey="price" stroke="#FF3B30" strokeWidth={3} dot={{ fill: '#111111', stroke: '#FF3B30', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Price Prediction */}
            <div className="mt-4 p-4 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl flex items-start gap-3">
              <Activity size={18} className="text-[#FFD700] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-black text-[#FFD700] uppercase tracking-widest">Price Prediction</div>
                <div className="text-[10px] text-white/60 mt-1 leading-relaxed">
                  Our AI models predict the price will drop by 2-3% in the next 15 days due to an upcoming festive sale. Wait for the upcoming sale.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h3 className="text-xl font-black uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Related Products</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:border-[#FF3B30]/30 transition-all cursor-pointer group">
              <div className="aspect-square bg-white/5 rounded-xl mb-4 p-4 flex items-center justify-center overflow-hidden">
                <img src={`https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80`} alt="related" className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-500 mix-blend-screen" />
              </div>
              <h4 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-[#FF3B30] transition-colors">Apple iPhone 15 Plus</h4>
              <div className="text-lg font-black font-mono text-white">{formatPrice(89900)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
