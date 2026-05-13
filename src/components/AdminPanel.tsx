import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, Users, Globe, ExternalLink, ShieldCheck, 
  Trash2, Plus, TrendingUp, AlertTriangle, Search
} from 'lucide-react';
import { fetchAdminStats } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminPanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (isAuthorized) {
      fetchAdminStats().then(data => {
        setStats(data);
        setLoading(false);
      });
    }
  }, [isAuthorized]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '2026') { 
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

  return (
    <div className="min-h-screen pt-44 px-12 max-w-[1600px] mx-auto pb-24 bg-transparent text-white">
      <header className="mb-20 flex justify-between items-end border-b border-white/10 pb-12">
        <div>
          <h1 className="text-7xl font-black text-white tracking-tighter uppercase font-display leading-none">COMMAND</h1>
          <p className="text-[#FF3B30] font-black tracking-[0.4em] text-[10px] mt-6 uppercase italic">Operational Excellence Node: INDIA_001</p>
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
      </header>

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
    </div>
  );
}
