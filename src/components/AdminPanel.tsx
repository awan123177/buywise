import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, Globe, ExternalLink, ShieldCheck, 
  Trash2, Plus, TrendingUp, AlertTriangle, Search, Activity, Heart, Check, X,
  Award, Gift, Bell, ShieldAlert, Sparkles, Scan, History, Tag, Barcode
} from 'lucide-react';
import { fetchAdminStats, runAdminGamificationAction } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db, collection, getDocs, deleteDoc, doc, query, orderBy, limit, onSnapshot, updateDoc } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [trackLogs, setTrackLogs] = useState<any[]>([]);
  const [wishLogs, setWishLogs] = useState<any[]>([]);
  const [premiumRequests, setPremiumRequests] = useState<any[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  // Gamification admin states
  const [adminUserEmail, setAdminUserEmail] = useState('');
  const [adminCoinsAmount, setAdminCoinsAmount] = useState<number>(50);
  const [adminCoinsReason, setAdminCoinsReason] = useState('Admin manual adjustments');
  
  const [adminBanEmail, setAdminBanEmail] = useState('');
  
  const [adminSavingsInc, setAdminSavingsInc] = useState<number>(5000);

  // Featured Deal Form States
  const [dealTitle, setDealTitle] = useState('');
  const [dealOldPrice, setDealOldPrice] = useState<number>(499);
  const [dealNewPrice, setDealNewPrice] = useState<number>(299);
  const [dealDiscount, setDealDiscount] = useState<number>(40);
  const [dealSource, setDealSource] = useState('Amazon');
  const [dealCategory, setDealCategory] = useState('electronics');
  const [dealThumbnail, setDealThumbnail] = useState('https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150');

  // Push Broadcast
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Affiliate & Telegram States
  const [affiliateSettings, setAffiliateSettings] = useState<any>(null);
  const [telegramConfig, setTelegramConfig] = useState<any>(null);
  const [mockTelegramText, setMockTelegramText] = useState("");
  const [mockTelegramPhotoUrl, setMockTelegramPhotoUrl] = useState("");
  const [isParsingDeal, setIsParsingDeal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'flights'>('dashboard');

  const parseNameField = (nameStr: string) => {
    if (!nameStr) return { displayName: 'Unknown', screenshot: null };
    const parts = nameStr.split('|||');
    return {
      displayName: parts[0] || 'Unknown',
      screenshot: parts[1] || null
    };
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchAdminStats().then(data => {
        setStats(data);
        setLoading(false);
      });

      // Load Affiliate Settings
      fetch("/api/affiliate/settings")
        .then(res => res.json())
        .then(data => setAffiliateSettings(data))
        .catch(err => console.error("Error loading affiliate settings:", err));

      // Load Telegram Config
      fetch("/api/telegram/config")
        .then(res => res.json())
        .then(data => setTelegramConfig(data))
        .catch(err => console.error("Error loading telegram config:", err));

      const qTrack = query(collection(db, "price_tracking"), orderBy("trackedAt", "desc"), limit(20));
      const unsubTrack = onSnapshot(qTrack, (snap) => {
         const data: any[] = [];
         snap.forEach(d => data.push({ id: d.id, type: "TRK", ...d.data() }));
         setTrackLogs(data);
      });

      const qWish = query(collection(db, "wishlist"), orderBy("addedAt", "desc"), limit(20));
      const unsubWish = onSnapshot(qWish, (snap) => {
         const data: any[] = [];
         snap.forEach(d => data.push({ id: d.id, type: "WSH", ...d.data() }));
         setWishLogs(data);
      });
      
      // Fetch premium requests from supabase
      const fetchPremium = async () => {
         const { data } = await supabase.from('premium_requests').select('*').order('timestamp', { ascending: false });
         if (data) setPremiumRequests(data);
      };
      fetchPremium();

      const channelId = Math.random().toString(36).substring(2, 15);
      const premiumSub = supabase.channel(`premium_reqs_${channelId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'premium_requests' }, () => {
           fetchPremium();
        })
        .subscribe();


      return () => {
        unsubTrack();
        unsubWish();
        supabase.removeChannel(premiumSub);
      };
    }
  }, [isAuthorized]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'mohammdsaeed24@gmail.com' && (passcode === 'awanwarsi' || passcode === 'awanwarsi1A@')) { 
      setIsAuthorized(true);
    } else {
      alert('INVALID ACCESS CREDENTIALS');
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("WARNING: This will permanently delete all tracked prices and wishlists. Proceed?")) return;
    setIsClearing(true);
    try {
      const getP = getDocs(collection(db, "price_tracking"));
      const getW = getDocs(collection(db, "wishlist"));
      const [pSnap, wSnap] = await Promise.all([getP, getW]);
      
      const deletePromises: any[] = [];
      pSnap.forEach(d => deletePromises.push(deleteDoc(doc(db, "price_tracking", d.id))));
      wSnap.forEach(d => deletePromises.push(deleteDoc(doc(db, "wishlist", d.id))));
      
      await Promise.all(deletePromises);
      alert("System History Purged Successfully.");
    } catch (e) {
      console.error(e);
      alert("Error purging history");
    } finally {
      setIsClearing(false);
    }
  };

  const handleSaveAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateSettings) return;
    try {
      const response = await fetch("/api/affiliate/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stores: affiliateSettings.stores })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Affiliate program tags updated!");
      }
    } catch (err: any) {
      toast.error("Failed to update affiliate settings: " + err.message);
    }
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramConfig) return;
    try {
      const response = await fetch("/api/telegram/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: telegramConfig })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Telegram channel integration saved!");
      }
    } catch (err: any) {
      toast.error("Failed to update Telegram settings: " + err.message);
    }
  };

  const handleMockTelegramPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockTelegramText.trim()) return;
    setIsParsingDeal(true);
    try {
      const response = await fetch("/api/telegram/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_post: {
            text: mockTelegramText,
            photo_url: mockTelegramPhotoUrl
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Parsed deal with Gemini and posted live! 📲");
        setMockTelegramText("");
        setMockTelegramPhotoUrl("");
        // Reload statistics or page to reflect changes
        fetchAdminStats().then(data => setStats(data));
      } else {
        toast.error("Could not parse text. Ensure deal details are listed.");
      }
    } catch (err: any) {
      toast.error("Failed to post mock Telegram deal: " + err.message);
    } finally {
      setIsParsingDeal(false);
    }
  };
  
  const handlePremiumStatus = async (id: any, status: 'approved' | 'rejected' | 'revoked') => {
     try {
         const targetId = typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
         const { error } = await supabase.from('premium_requests').update({ status }).eq('id', targetId);
         if (error) throw error;
         toast.success(`Request ${status}`);
         // Fetch again to update the UI instantly, in case real-time events are disabled in Supabase
         const { data } = await supabase.from('premium_requests').select('*').order('timestamp', { ascending: false });
         if (data) setPremiumRequests(data);
     } catch (e) {
         toast.error(`Error updating request`);
     }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm p-12 terminal-card bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl text-center"
        >
          <div className="w-16 h-16 bg-[#FF3B30] border border-white/20 rounded-full flex items-center justify-center text-white mx-auto mb-8">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">SECURE GATEWAY</h2>
          <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase font-black mb-12">Executive Credentials Required</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="email" 
              placeholder="EMAIL_"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-center text-white font-black tracking-[0.2em] focus:bg-white/10 outline-none transition-all uppercase placeholder:text-white/20"
            />
            <input 
              type="password" 
              placeholder="PASSCODE_"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-center text-white font-black tracking-[0.5em] focus:bg-white/10 outline-none transition-all uppercase placeholder:text-white/20"
            />
            <button className="btn-brutalist w-full py-4 !px-0 rounded-xl">
              AUTHORIZE_ACCESS
            </button>
          </form>
          <p className="mt-12 text-[9px] text-white/20 tracking-[0.4em] uppercase font-black">Security Node: 2026-X</p>
        </motion.div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#FF3B30] tracking-[0.5em] animate-pulse font-black uppercase bg-transparent">UPLINKING_SECURE_NODE...</div>;

  const chartData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 1100 },
  ];

  const historyLogs = [...trackLogs, ...wishLogs].sort((a, b) => {
     const tA = new Date(a.trackedAt || a.addedAt).getTime();
     const tB = new Date(b.trackedAt || b.addedAt).getTime();
     return tB - tA;
  }).slice(0, 15);

  return (
    <div className="min-h-screen pt-44 px-12 max-w-[1600px] mx-auto pb-24 bg-transparent text-white">
      <header className="mb-20 flex justify-between items-end border-b border-white/10 pb-12">
        <div>
          <h1 className="text-7xl font-black text-white tracking-tighter uppercase font-display leading-none">COMMAND</h1>
          <p className="text-[#FF3B30] font-black tracking-[0.4em] text-[10px] mt-6 uppercase italic">Operational Excellence Node: INDIA_001</p>
        </div>
        <div className="flex flex-col items-end gap-6">
           <div className="flex bg-white/5 border border-white/10 p-1 rounded-lg">
             <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-[#FF3B30] text-white' : 'text-white/50 hover:text-white'}`}>Platform Core</button>
             <button onClick={() => setActiveTab('flights')} className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-md transition-colors ${activeTab === 'flights' ? 'bg-[#FF3B30] text-white' : 'text-white/50 hover:text-white'}`}>Flight Ops</button>
           </div>
           <div className="flex gap-4">
             <button 
               onClick={clearHistory}
               disabled={isClearing}
               className="px-8 py-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-500 hover:text-white text-[10px] font-black tracking-widest hover:bg-red-600 transition-all flex items-center gap-3"
             >
               <Trash2 size={16} /> {isClearing ? 'PURGING...' : 'CLEAR_HISTORY'}
             </button>
             <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-[10px] font-black tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
               <ShieldCheck size={16} /> AUDIT_LOG
             </button>
             <button className="btn-brutalist !py-3 rounded-lg">
               <Plus size={16} /> DEPLOY_SYNC
             </button>
           </div>
        </div>
      </header>

      {activeTab === 'dashboard' ? (
        <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
        <div className="terminal-card p-10 bg-black/40 backdrop-blur-md">
          <div className="flex justify-between items-start mb-8">
            <Users className="text-[#FF3B30]" size={32} />
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">Active_Sessions</p>
          <h3 className="text-6xl font-black text-white mt-4 tracking-tighter font-display">{stats.activeUsers}</h3>
        </div>
        <div className="terminal-card p-10 bg-white/5 backdrop-blur-md text-white">
          <div className="flex justify-between items-start mb-8">
            <Globe className="text-[#FF3B30]" size={32} />
            <span className="text-green-400 text-xs font-black tracking-widest">+12.4%</span>
          </div>
          <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">Intelligence_Queries</p>
          <h3 className="text-6xl font-black text-white mt-4 tracking-tighter font-display">{stats.totalSearches.toLocaleString()}</h3>
        </div>
        <div className="terminal-card p-10 bg-black/40 backdrop-blur-md">
          <div className="flex justify-between items-start mb-8">
            <BarChart3 className="text-[#FF3B30]" size={32} />
            <div className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-sm">STABLE</div>
          </div>
          <p className="text-white/40 text-[10px] font-black tracking-[0.3em] uppercase">Network_Uptime</p>
          <h3 className="text-6xl font-black text-white mt-4 tracking-tighter font-display">99.9%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Chart */}
        <div className="lg:col-span-8 terminal-card p-12 bg-black/40 backdrop-blur-md">
          <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
            <h4 className="text-xs font-black text-white/40 tracking-[0.3em] uppercase">MARKET_EVOLUTION_MATRIX</h4>
            <div className="flex gap-4 items-center">
              <span className="w-3 h-3 bg-[#FF3B30] rounded-full"></span>
              <span className="text-[10px] text-white font-black uppercase tracking-widest">PRICING_VECTORS</span>
            </div>
          </div>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 900 }} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 900 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', borderRadius: '8px' }}
                  itemStyle={{ color: '#FF3B30', fontSize: '12px', fontStyle: 'italic', fontWeight: 900 }}
                />
                <Area type="monotone" dataKey="value" stroke="#FF3B30" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trending */}
        <div className="lg:col-span-4 terminal-card p-12 bg-black/40 backdrop-blur-md">
          <h4 className="text-xs font-black text-white/40 tracking-[0.3em] uppercase mb-12">TOP_VECTOR_ASSETS</h4>
          <div className="space-y-4">
            {stats.trendingProducts.map((p: any, i: number) => (
              <div key={i} className="group flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-xl transition-all hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30]">
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 bg-white/10 rounded-full text-white flex items-center justify-center font-black text-xs transition-colors shadow-inner">
                    0{i+1}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">{p.name}</p>
                    <p className="text-[9px] uppercase tracking-[0.1em] font-bold mt-1 text-white/50 group-hover:text-white/80">{p.searches} LEADS</p>
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} className="p-2 transition-colors opacity-20 group-hover:opacity-100">
                  <ExternalLink size={16} />
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Barcode Scanner Telemetry Panel */}
      {stats && stats.barcodeStats && (
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Scans Telemetry Summary Header */}
          <div className="lg:col-span-12 terminal-card p-10 bg-[#FF3B30]/5 border-brand/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FF3B30]/10 border border-brand/30 flex items-center justify-center text-[#FF3B30]">
                <Scan size={24} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white tracking-wider uppercase font-display">BARCODE SCANNER METRICS PANEL</h4>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider mt-0.5">Real-time scan logs, matching products and price radar captures</p>
              </div>
            </div>

            <div className="flex gap-8 font-mono text-xs">
              <div>
                <span className="text-white/40 block text-[9px] tracking-wider uppercase font-bold">TOTAL SCANS:</span>
                <span className="text-2xl font-black text-[#FF3B30]">{stats.barcodeStats.totalScans}</span>
              </div>
              <div className="border-l border-white/10 pl-8">
                <span className="text-white/40 block text-[9px] tracking-wider uppercase font-bold">RADAR TRIGGERS:</span>
                <span className="text-2xl font-black text-white">{stats.barcodeStats.priceAlertCount}</span>
              </div>
            </div>
          </div>

          {/* Left Block: Most Scanned Products & Categories */}
          <div className="lg:col-span-5 space-y-12">
            {/* Most Scanned Products */}
            <div className="terminal-card p-10 bg-black/40 backdrop-blur-md">
              <h4 className="text-xs font-black text-white/40 tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                <Barcode size={16} className="text-[#FF3B30]" />
                MOST_SCANNED_PRODUCTS
              </h4>
              <div className="space-y-3">
                {stats.barcodeStats.mostScannedProducts.length === 0 ? (
                  <p className="text-center py-6 text-white/20 text-xs font-mono uppercase tracking-widest">Awaiting scans telemetry...</p>
                ) : (
                  stats.barcodeStats.mostScannedProducts.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl text-xs">
                      <span className="text-white font-black uppercase truncate max-w-[70%]">{p.name}</span>
                      <span className="text-[#FF3B30] font-mono font-black">{p.count} SCANS</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Popular Categories */}
            <div className="terminal-card p-10 bg-black/40 backdrop-blur-md">
              <h4 className="text-xs font-black text-white/40 tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
                <Tag size={16} className="text-[#FF3B30]" />
                POPULAR_CATEGORIES
              </h4>
              <div className="space-y-3">
                {stats.barcodeStats.popularCategories.length === 0 ? (
                  <p className="text-center py-6 text-white/20 text-xs font-mono uppercase tracking-widest">Awaiting scans telemetry...</p>
                ) : (
                  stats.barcodeStats.popularCategories.map((c: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl text-xs">
                      <span className="text-white font-black uppercase">{c.category}</span>
                      <span className="text-white/40 font-mono font-bold">{c.count} SCANS</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Block: Live Scan History Stream */}
          <div className="lg:col-span-7 terminal-card p-10 bg-black/40 backdrop-blur-md">
            <h4 className="text-xs font-black text-white/40 tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
              <History size={16} className="text-[#FF3B30]" />
              USER_SCAN_HISTORY
            </h4>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {stats.barcodeStats.recentScans.length === 0 ? (
                <p className="text-center py-10 text-white/20 text-xs font-mono uppercase tracking-widest">No recent scans registered in the database...</p>
              ) : (
                stats.barcodeStats.recentScans.map((scan: any, idx: number) => (
                  <div key={scan.id || idx} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors flex justify-between items-center text-xs">
                    <div>
                      <h5 className="text-white font-black uppercase truncate max-w-[280px]">{scan.productName}</h5>
                      <div className="flex gap-3 mt-1.5 text-[9px] text-white/40 uppercase font-mono tracking-wider">
                        <span>BY: {scan.userName}</span>
                        <span>•</span>
                        <span>BARCODE: {scan.barcode}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-bold block">₹{scan.lowestPrice?.toLocaleString() || 'N/A'}</span>
                      <span className="text-[8px] text-white/30 uppercase mt-1 block">{new Date(scan.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Real-time History Feed */}
      <div className="mt-12 terminal-card p-12 bg-black/40 backdrop-blur-md">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
             <Activity className="text-[#FF3B30] animate-pulse" size={24} />
             <h4 className="text-xs font-black text-white/80 tracking-[0.3em] uppercase">LIVE_ACTIVITY_STREAM</h4>
          </div>
          <span className="text-[10px] text-green-400 font-black uppercase tracking-widest bg-green-500/20 px-3 py-1 rounded-sm border border-green-500/50">Listening</span>
        </div>
        
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
           {historyLogs.length === 0 ? (
             <div className="text-center py-10 text-white/30 text-xs font-black tracking-widest uppercase">No Activity Detected</div>
           ) : (
             historyLogs.map((log) => (
               <motion.div 
                 key={log.id} 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
               >
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-[10px] border ${
                   log.type === "TRK" 
                     ? "bg-[#FF3B30]/20 border-[#FF3B30]/50 text-[#FF3B30]" 
                     : "bg-blue-500/20 border-blue-500/50 text-blue-400"
                 }`}>
                   {log.type}
                 </div>
                 <div className="flex-grow">
                   <p className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{log.productTitle}</p>
                   <div className="flex gap-4 mt-2 text-[9px] uppercase tracking-widest text-white/50 font-bold">
                     <span>ID: {log.userId.substring(0,6)}...</span>
                     <span>|</span>
                     <span>{new Date(log.trackedAt || log.addedAt).toLocaleString()}</span>
                   </div>
                 </div>
                 <div className="hidden md:flex flex-col items-end gap-1">
                   <span className="text-sm font-black text-white tracking-tighter">{log.currentPrice || "N/A"}</span>
                   <span className="text-[9px] uppercase tracking-widest text-[#FF3B30] font-black">{log.source}</span>
                 </div>
               </motion.div>
             ))
           )}
        </div>
      </div>

      {/* Premium Requests Queue */}
      <div className="mt-12 terminal-card p-12 bg-black/40 backdrop-blur-md">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
             <ShieldCheck className="text-yellow-500" size={24} />
             <h4 className="text-xs font-black text-white/80 tracking-[0.3em] uppercase">PENDING_PREMIUM_APPROVALS</h4>
          </div>
          <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest bg-yellow-500/20 px-3 py-1 rounded-sm border border-yellow-500/50">{premiumRequests.filter(r => r.status === 'pending').length} Action Required</span>
        </div>
        
        <div className="space-y-4">
           {premiumRequests.filter(r => r.status !== 'approved').length === 0 ? (
             <div className="text-center py-10 text-white/30 text-xs font-black tracking-widest uppercase">No Requests Pending / Rejected</div>
           ) : (
             premiumRequests.filter(r => r.status !== 'approved').map((req) => {
               const { displayName, screenshot } = parseNameField(req.name);
               return (
                 <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden animate-fade-in">
                   {req.status !== 'pending' && (
                      <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center backdrop-blur-sm pointer-events-none">
                        <span className={`text-xl font-black uppercase tracking-[0.2em] px-4 py-2 border-2 ${req.status === 'approved' ? 'text-green-500 border-green-500' : 'text-red-500 border-red-500'} rotate-[-5deg] opacity-70`}>{req.status}</span>
                      </div>
                   )}
                   <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-grow">
                     {screenshot && (
                       <div 
                         onClick={() => setSelectedScreenshot(screenshot)}
                         className="w-16 h-16 rounded-lg border border-white/10 bg-black cursor-pointer overflow-hidden flex-shrink-0 group relative hover:border-[#FF3B30] transition-colors z-20"
                         title="Click to zoom screenshot"
                       >
                         <img src={screenshot} alt="Payment Verification" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <span className="text-[9px] font-bold text-white uppercase bg-black/70 px-1.5 py-0.5 rounded">Zoom</span>
                         </div>
                       </div>
                     )}
                     <div>
                       <p className="text-sm font-black uppercase tracking-tight">{displayName} <span className="text-[#FF3B30] ml-2">({req.plan})</span></p>
                       <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[9px] uppercase tracking-widest text-white/50 font-bold">
                         <span>UTR: <strong className="text-white font-medium">{req.utr}</strong></span>
                         <span>|</span>
                         <span>{req.email || req.userEmail}</span>
                         {screenshot && (
                           <>
                             <span>|</span>
                             <span className="text-yellow-500 font-black cursor-pointer hover:underline" onClick={() => setSelectedScreenshot(screenshot)}>
                               📸 HAS SCREENSHOT
                             </span>
                           </>
                         )}
                       </div>
                     </div>
                   </div>
                   <div className="flex gap-2 z-20">
                     <button 
                       onClick={() => handlePremiumStatus(req.id, 'approved')}
                       className="p-3 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors border border-green-500/50"
                     >
                       <Check size={20} />
                     </button>
                     <button 
                       onClick={() => handlePremiumStatus(req.id, 'rejected')}
                       className="p-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/50"
                     >
                       <X size={20} />
                     </button>
                   </div>
                 </div>
               );
             })
           )}
        </div>
      </div>

      {/* Active Premium Subscriptions */}
      <div className="mt-12 terminal-card p-12 bg-black/40 backdrop-blur-md mb-20">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
             <ShieldCheck className="text-green-500" size={24} />
             <h4 className="text-xs font-black text-white/80 tracking-[0.3em] uppercase">ACTIVE_PREMIUM_SUBSCRIPTIONS</h4>
          </div>
          <span className="text-[10px] text-green-500 font-black uppercase tracking-widest bg-green-500/20 px-3 py-1 rounded-sm border border-green-500/50">{premiumRequests.filter(r => r.status === 'approved').length} Active</span>
        </div>
        
        <div className="space-y-4">
           {premiumRequests.filter(r => r.status === 'approved').length === 0 ? (
             <div className="text-center py-10 text-white/30 text-xs font-black tracking-widest uppercase">No Active Subscriptions</div>
           ) : (
             premiumRequests.filter(r => r.status === 'approved').map((req) => {
               const { displayName, screenshot } = parseNameField(req.name);
               return (
                 <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden animate-fade-in">
                   <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-grow">
                     {screenshot && (
                       <div 
                         onClick={() => setSelectedScreenshot(screenshot)}
                         className="w-16 h-16 rounded-lg border border-white/10 bg-black cursor-pointer overflow-hidden flex-shrink-0 group relative hover:border-green-500 transition-colors z-20"
                         title="Click to zoom screenshot"
                       >
                         <img src={screenshot} alt="Payment Verification" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <span className="text-[9px] font-bold text-white uppercase bg-black/70 px-1.5 py-0.5 rounded">Zoom</span>
                         </div>
                       </div>
                     )}
                     <div>
                       <p className="text-sm font-black uppercase tracking-tight">{displayName} <span className="text-green-400 ml-2">({req.plan})</span></p>
                       <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[9px] uppercase tracking-widest text-white/50 font-bold">
                         <span>UTR: <strong className="text-white font-medium">{req.utr}</strong></span>
                         <span>|</span>
                         <span>{req.email || req.userEmail}</span>
                         <span>|</span>
                         <span className="text-green-400">APPROVED</span>
                         {screenshot && (
                           <>
                             <span>|</span>
                             <span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => setSelectedScreenshot(screenshot)}>
                               📸 VIEW SCREENSHOT
                             </span>
                           </>
                         )}
                       </div>
                     </div>
                   </div>
                   <div className="flex gap-2 z-20">
                     <button 
                       onClick={() => handlePremiumStatus(req.id, 'revoked')}
                       className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-500/50 text-[10px] font-black uppercase tracking-widest"
                     >
                       REVOKE
                     </button>
                   </div>
                 </div>
               );
             })
           )}
        </div>
      </div>

      {/* Screenshot Zoom Modal Overlay */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScreenshot(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden p-6 space-y-4 cursor-default animate-scale-in"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-xs font-black uppercase tracking-widest text-white/50">Payment Screenshot</span>
                <button 
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex justify-center bg-black/60 rounded-xl border border-white/5 overflow-hidden p-2 max-h-[70vh]">
                <img 
                  src={selectedScreenshot} 
                  alt="Full-size Payment Verification" 
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAMIFICATION OPERATIONAL DESK */}
      <div className="mt-12 terminal-card p-12 bg-black/40 backdrop-blur-md mb-20">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
             <Sparkles className="text-yellow-500" size={24} />
             <h4 className="text-xs font-black text-white/80 tracking-[0.3em] uppercase font-mono">GAMIFICATION_COMMAND_DESK</h4>
          </div>
          <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest bg-yellow-500/20 px-3 py-1 rounded-sm border border-yellow-500/50">OPERATIVE</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
          
          {/* Section 1: User Coins Modifier */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-4">
            <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Gift size={14} className="text-[#FF3B30]" /> REWARD COINS MANAGER
            </h5>
            <p className="text-[10px] text-white/40 leading-relaxed">
              Manually add or remove BuyWise Coins from active member accounts. Enter negative balances to penalize/debit.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!adminUserEmail.trim()) return;
              try {
                const res = await runAdminGamificationAction('coins', { email: adminUserEmail.trim(), coins: adminCoinsAmount, note: adminCoinsReason });
                if (res && res.success) {
                  toast.success(`Successfully updated user coins!`);
                  setAdminUserEmail('');
                }
              } catch(err) {
                toast.error("Operation failed");
              }
            }} className="space-y-3">
              <input
                type="email"
                placeholder="USER_EMAIL_OR_ID"
                value={adminUserEmail}
                onChange={(e) => setAdminUserEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 uppercase font-mono"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="AMOUNT"
                  value={adminCoinsAmount}
                  onChange={(e) => setAdminCoinsAmount(parseInt(e.target.value) || 0)}
                  className="w-1/3 bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 font-mono"
                />
                <input
                  type="text"
                  placeholder="REASON / ADJUSTMENT NOTE"
                  value={adminCoinsReason}
                  onChange={(e) => setAdminCoinsReason(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 uppercase"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-[#FF3B30] text-white font-black uppercase tracking-widest text-[10px] rounded hover:bg-red-600 transition-colors cursor-pointer">
                APPLY_COIN_DELTA
              </button>
            </form>
          </div>

          {/* Section 2: Referral Protection & Savings index */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-6">
            <div className="space-y-3">
              <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={14} className="text-yellow-500" /> REFERRAL PROTECTION BAN
              </h5>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!adminBanEmail.trim()) return;
                try {
                  const res = await runAdminGamificationAction('ban', { email: adminBanEmail.trim() });
                  if (res && res.success) {
                    toast.success(`User banned from referrals successfully!`);
                    setAdminBanEmail('');
                  }
                } catch(err) {
                  toast.error("Ban failed");
                }
              }} className="flex gap-2">
                <input
                  type="text"
                  placeholder="CODE / INVITE_EMAIL"
                  value={adminBanEmail}
                  onChange={(e) => setAdminBanEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 uppercase font-mono"
                />
                <button type="submit" className="px-4 py-2 bg-yellow-500 text-black font-black uppercase tracking-widest text-[10px] rounded hover:bg-yellow-600 transition-colors cursor-pointer">
                  BAN_MEMBER
                </button>
              </form>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5">
              <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={14} className="text-green-500" /> PUBLIC SAVINGS MANUAL OVERRIDE
              </h5>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="INCREMENT INR"
                  value={adminSavingsInc}
                  onChange={(e) => setAdminSavingsInc(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 font-mono"
                />
                <button 
                  onClick={async () => {
                    try {
                      const res = await runAdminGamificationAction('savings', { amount: adminSavingsInc });
                      if (res && res.success) {
                        toast.success("Public savings database incremented!");
                      }
                    } catch(err) {
                      toast.error("Override failed");
                    }
                  }}
                  className="px-4 py-2 bg-green-500 text-black font-black uppercase tracking-widest text-[10px] rounded hover:bg-green-600 transition-colors cursor-pointer"
                >
                  ADD_SAVINGS
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Feature Liquidations */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-4 lg:col-span-1">
            <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Plus size={14} className="text-[#FF3B30]" /> POST LIQUIDATION DEALS
            </h5>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!dealTitle.trim()) return;
              try {
                const res = await runAdminGamificationAction('feature_deal', {
                  title: dealTitle.trim(),
                  oldPrice: dealOldPrice,
                  newPrice: dealNewPrice,
                  discountPercent: dealDiscount,
                  source: dealSource,
                  category: dealCategory,
                  thumbnail: dealThumbnail
                });
                if (res && res.success) {
                  toast.success("Deal published successfully!");
                  setDealTitle('');
                }
              } catch(err) {
                toast.error("Deal publication failed");
              }
            }} className="space-y-3">
              <input
                type="text"
                placeholder="DEAL_PRODUCT_TITLE"
                value={dealTitle}
                onChange={(e) => setDealTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 uppercase"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="OLD PRICE"
                  value={dealOldPrice}
                  onChange={(e) => setDealOldPrice(parseInt(e.target.value) || 0)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white font-mono"
                />
                <input
                  type="number"
                  placeholder="NEW PRICE"
                  value={dealNewPrice}
                  onChange={(e) => setDealNewPrice(parseInt(e.target.value) || 0)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white font-mono"
                />
                <input
                  type="number"
                  placeholder="DISCOUNT %"
                  value={dealDiscount}
                  onChange={(e) => setDealDiscount(parseInt(e.target.value) || 0)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MERCHANT (e.g. Amazon)"
                  value={dealSource}
                  onChange={(e) => setDealSource(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white uppercase"
                />
                <select
                  value={dealCategory}
                  onChange={(e) => setDealCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white uppercase bg-neutral-900"
                >
                  <option value="electronics">Electronics</option>
                  <option value="mobiles">Mobiles</option>
                  <option value="laptops">Laptops</option>
                  <option value="gaming">Gaming</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home</option>
                  <option value="grocery">Grocery</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="THUMBNAIL_URL"
                value={dealThumbnail}
                onChange={(e) => setDealThumbnail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white font-mono text-[10px]"
              />
              <button type="submit" className="w-full py-2 bg-[#FF3B30] text-white font-black uppercase tracking-widest text-[10px] rounded hover:bg-red-600 transition-colors cursor-pointer">
                POST_FEATURED_DEAL
              </button>
            </form>
          </div>

          {/* Section 4: Push Notification Broadcaster */}
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-4 lg:col-span-1">
            <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Bell size={14} className="text-[#FF3B30]" /> PUSH NOTIFICATION BROADCASTER
            </h5>
            <p className="text-[10px] text-white/40 leading-relaxed">
              Send immediate pricing announcements, alerts, and discount passes to all browser and Android listeners.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!broadcastTitle.trim() || !broadcastBody.trim()) return;
              try {
                const res = await runAdminGamificationAction('broadcast_notification', { title: broadcastTitle.trim(), body: broadcastBody.trim() });
                if (res && res.success) {
                  toast.success(`Broadcasting initiated successfully!`);
                  setBroadcastTitle('');
                  setBroadcastBody('');
                }
              } catch(err) {
                toast.error("Broadcast failed");
              }
            }} className="space-y-3">
              <input
                type="text"
                placeholder="ALERT HEADER (e.g. FLASH DEAL DROPPED)"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 uppercase"
              />
              <textarea
                placeholder="ALERT DETAILED TEXT BODY"
                rows={2}
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/20 uppercase font-sans"
              />
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded hover:bg-indigo-700 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20">
                BROADCAST_SYSTEM_WIDE
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* --- AFFILIATE & TELEGRAM MONETIZATION CONSOLE --- */}
      <div className="mt-12 terminal-card p-12 bg-black/40 backdrop-blur-md mb-20 border border-white/10">
        <header className="mb-12 border-b border-white/10 pb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h4 className="text-sm font-black text-[#FF3B30] tracking-[0.3em] uppercase flex items-center gap-2">
              <Globe size={18} /> AFFILIATE MONETIZATION & INTEGRATION CONSOLE
            </h4>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono mt-1">
              Configure store tags, review real-time redirects, and sync deals from Telegram channels
            </p>
          </div>
          <div className="flex gap-2">
            <span className="text-[9px] font-mono font-black uppercase bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Secure Redirects Active
            </span>
          </div>
        </header>

        {/* Part 1: Click Analytics Telemetry */}
        <div className="mb-12">
          <h5 className="text-[11px] font-black tracking-widest text-white/50 uppercase mb-6 flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" /> Real-time Affiliate Click Tracker
          </h5>

          {affiliateSettings ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.keys(affiliateSettings.stores).map((storeKey) => {
                const clickCount = affiliateSettings.clicks[storeKey] || 0;
                const storeConfig = affiliateSettings.stores[storeKey];
                return (
                  <div key={storeKey} className="bg-white/[0.02] border border-white/5 p-4 rounded-lg flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div>
                      <span className="text-[9px] font-black tracking-widest text-white/40 uppercase block truncate">{storeKey}</span>
                      <span className="text-2xl font-black text-white tracking-tighter mt-1 block">{clickCount}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[8px] font-mono font-black">
                      <span className={storeConfig.enabled ? "text-emerald-400" : "text-white/20"}>
                        {storeConfig.enabled ? "● MONETIZED" : "○ INACTIVE"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-white/20 text-xs font-mono">LOADING AFFILIATE CLICK ANALYTICS...</div>
          )}
        </div>

        {/* Part 2: Twin Configuration Form Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Column A: Affiliate Store Tags Settings */}
          <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 p-8 rounded-xl space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-yellow-500" /> Affiliate Store Associate Configuration
              </h5>
              <p className="text-[9px] text-white/40 mt-1 uppercase font-mono">Enter parameters for each storefront to redirect purchases with tags</p>
            </div>

            {affiliateSettings ? (
              <form onSubmit={handleSaveAffiliate} className="space-y-4">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {Object.keys(affiliateSettings.stores).map((storeKey) => {
                    const store = affiliateSettings.stores[storeKey];
                    return (
                      <div key={storeKey} className="p-4 bg-black/40 border border-white/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={store.enabled}
                            onChange={(e) => {
                              const updatedStores = { ...affiliateSettings.stores };
                              updatedStores[storeKey].enabled = e.target.checked;
                              setAffiliateSettings({ ...affiliateSettings, stores: updatedStores });
                            }}
                            className="rounded border-white/10 bg-white/5 text-[#FF3B30] focus:ring-0"
                          />
                          <div>
                            <span className="text-xs font-black uppercase text-white">{storeKey}</span>
                            <span className="text-[8px] font-mono text-white/40 block">PARAMETER: {store.paramName || "tag"}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-grow sm:max-w-xs">
                          <input
                            type="text"
                            placeholder="TRACKING_TAG_ID"
                            value={store.tag}
                            onChange={(e) => {
                              const updatedStores = { ...affiliateSettings.stores };
                              updatedStores[storeKey].tag = e.target.value;
                              setAffiliateSettings({ ...affiliateSettings, stores: updatedStores });
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-white/20 uppercase font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button type="submit" className="w-full py-3 bg-[#FF3B30] text-white font-black uppercase tracking-widest text-[10px] rounded hover:bg-red-600 transition-colors cursor-pointer">
                  SAVE_AFFILIATE_SETTINGS
                </button>
              </form>
            ) : (
              <div className="py-12 text-center text-white/20 text-xs font-mono">LOADING STORE CONFIGURATIONS...</div>
            )}
          </div>

          {/* Column B: Telegram Sync Config & Mock Deal Bot Parser */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Telegram settings config */}
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-xl space-y-6">
              <div className="border-b border-white/5 pb-4">
                <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe size={14} className="text-indigo-400" /> Telegram Channel Integration Sync
                </h5>
                <p className="text-[9px] text-white/40 mt-1 uppercase font-mono">Sync incoming deals posted to your channel directly into Deals page</p>
              </div>

              {telegramConfig ? (
                <form onSubmit={handleSaveTelegram} className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-lg text-xs">
                    <span className="text-white/60 uppercase">Enable Webhook Listener</span>
                    <input
                      type="checkbox"
                      checked={telegramConfig.enabled}
                      onChange={(e) => setTelegramConfig({ ...telegramConfig, enabled: e.target.checked })}
                      className="rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono block uppercase">CHANNEL_USERNAME_OR_ID</label>
                    <input
                      type="text"
                      placeholder="@BUYWISE_DEALS"
                      value={telegramConfig.channelUsername}
                      onChange={(e) => setTelegramConfig({ ...telegramConfig, channelUsername: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono block uppercase">TELEGRAM_BOT_TOKEN</label>
                    <input
                      type="password"
                      placeholder="ENTER BOT TOKEN (e.g. 5238...)"
                      value={telegramConfig.botToken}
                      onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 font-mono"
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded hover:bg-indigo-700 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20">
                    SAVE_TELEGRAM_BOT_CONFIG
                  </button>
                </form>
              ) : (
                <div className="py-6 text-center text-white/20 text-xs font-mono">LOADING TELEGRAM PROFILE...</div>
              )}
            </div>

            {/* Direct Mock Bot Post Parser Tool */}
            <div className="bg-[#FF3B30]/5 border border-[#FF3B30]/20 p-8 rounded-xl space-y-4">
              <div>
                <h5 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FF3B30]" /> Telegram Post AI Parser Playground
                </h5>
                <p className="text-[9px] text-white/40 leading-relaxed uppercase font-mono mt-0.5">
                  Paste any raw deal post text here. Gemini AI will instantly parse categories, pricing, and links to post live to Deals section.
                </p>
              </div>

              <form onSubmit={handleMockTelegramPost} className="space-y-3">
                <textarea
                  placeholder="Paste Telegram post here... e.g., &#10;🔥 AMAZING DEAL on Amazon! &#10;Samsung S24 Ultra now only ₹99,999 from ₹1,29,999! &#10;Check it out: https://amazon.in/dp/B0CSYF8Z98"
                  rows={4}
                  value={mockTelegramText}
                  onChange={(e) => setMockTelegramText(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 font-sans"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setMockTelegramPhotoUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-[#050505] border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-white/20 font-sans file:bg-[#FF3B30] file:text-white file:border-none file:rounded file:px-2 file:py-1 file:mr-2 file:text-xs file:font-black file:uppercase file:cursor-pointer"
                />
                <button
                  type="submit"
                  disabled={isParsingDeal || !mockTelegramText.trim()}
                  className="w-full py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded hover:bg-emerald-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isParsingDeal ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full border-t-2 border-b-2 border-white animate-spin" />
                      PARSING WITH GEMINI ENGINE...
                    </>
                  ) : (
                    "PARSE & PUBLISH LIVE"
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
      </>
      ) : (
        <div className="space-y-12">
          {/* Flight Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="terminal-card p-6 bg-black/40 backdrop-blur-md">
              <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-4">Total Searches</h4>
              <div className="text-4xl font-black text-white">4,289</div>
              <div className="text-xs text-emerald-400 mt-2 font-bold">+12% this week</div>
            </div>
            <div className="terminal-card p-6 bg-black/40 backdrop-blur-md">
              <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-4">Total Bookings</h4>
              <div className="text-4xl font-black text-[#FF3B30]">312</div>
              <div className="text-xs text-emerald-400 mt-2 font-bold">+8% this week</div>
            </div>
            <div className="terminal-card p-6 bg-black/40 backdrop-blur-md">
              <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-4">Est. Commission</h4>
              <div className="text-4xl font-black text-emerald-400">₹45.2k</div>
              <div className="text-xs text-emerald-400 mt-2 font-bold">+24% this week</div>
            </div>
            <div className="terminal-card p-6 bg-black/40 backdrop-blur-md">
              <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-4">Conversion Rate</h4>
              <div className="text-4xl font-black text-white">7.2%</div>
              <div className="text-xs text-[#FF3B30] mt-2 font-bold">-1% this week</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="terminal-card p-10 bg-black/40">
               <h4 className="text-sm font-black text-[#FF3B30] tracking-[0.3em] uppercase mb-8">Top Searched Routes</h4>
               <div className="space-y-4">
                 {[
                   { route: 'BOM → DEL', searches: 1240, bookings: 142 },
                   { route: 'BLR → DEL', searches: 980, bookings: 86 },
                   { route: 'HYD → MAA', searches: 750, bookings: 54 },
                   { route: 'BOM → GOI', searches: 620, bookings: 22 },
                   { route: 'DEL → DXB', searches: 430, bookings: 8 },
                 ].map((r, i) => (
                   <div key={i} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl">
                      <div className="font-black tracking-widest text-white">{r.route}</div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-white/70">{r.searches} Searches</div>
                        <div className="text-[10px] text-emerald-400 font-black tracking-widest mt-1">{r.bookings} Bookings</div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="terminal-card p-10 bg-black/40">
               <h4 className="text-sm font-black text-[#FF3B30] tracking-[0.3em] uppercase mb-8">Revenue Dashboard</h4>
               <div className="h-64 flex items-end justify-between gap-2 border-b border-white/10 pb-4 relative">
                 <div className="absolute inset-0 bg-gradient-to-t from-[#FF3B30]/10 to-transparent pointer-events-none" />
                 {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                   <div key={i} className="w-full bg-white/10 hover:bg-[#FF3B30] transition-colors relative group rounded-t-sm" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{h * 120}
                      </div>
                   </div>
                 ))}
               </div>
               <div className="flex justify-between mt-4 text-[10px] text-white/50 font-black tracking-widest uppercase">
                 <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
