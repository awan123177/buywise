import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Diamond, Search, History, User, LayoutDashboard, LogOut, ShieldCheck, Menu, X, Plane, Flame, Trophy, ChevronDown, Scan, Bot } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, setDoc } from '../lib/firebase';
import { db } from '../lib/firebase';
import { fetchGamificationProfile } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Navbar() {
  const location = useLocation();
  const { user, openLogin, logout } = useAuth();
  const { currency, setCurrency, rates } = useCurrency();
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [coins, setCoins] = useState<number>(0);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchGamificationProfile()
        .then(profile => {
          setCoins(profile.coins);
          setActiveBadge(profile.activeBadge || null);
        })
        .catch(() => {});
    }
  }, [user?.uid, location.pathname]);

  useEffect(() => {
    const sessionId = Math.random().toString(36).substring(2, 15);
    const presenceRef = doc(db, "presence", sessionId);
    
    const updatePresence = () => {
      setDoc(presenceRef, { lastActive: Date.now() }, { merge: true }).catch(() => {});
    };
    updatePresence();
    const intervalId = setInterval(updatePresence, 30000);

    let cleanupQuery: () => void = () => {};

    const setupPresence = () => {
      cleanupQuery();
      const q = query(collection(db, "presence"), where("lastActive", ">", Date.now() - 120000));
      cleanupQuery = onSnapshot(q, (snapshot) => {
        setOnlineCount(snapshot.size > 0 ? snapshot.size : 1);
      }, () => {});
    };

    setupPresence();
    const queryRefreshId = setInterval(setupPresence, 60000);

    return () => {
      clearInterval(intervalId);
      clearInterval(queryRefreshId);
      cleanupQuery();
    };
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 md:h-24 px-4 md:px-16 flex items-center justify-between border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl transition-all">
        <Link to="/" className="flex items-center gap-4 md:gap-6 group">
          <div className="relative hidden sm:block">
            <div className="w-10 h-10 md:w-12 md:h-12 relative transition-all duration-500 group-hover:rotate-180">
              <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 bg-[#FF3B30] border border-white/5 mix-blend-screen shadow-[0_0_20px_rgba(255,59,48,0.3)]"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-transparent border border-white/10 backdrop-blur-sm"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-white z-10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-[#f5f5f5] uppercase leading-none">BUY<span className="text-[#FF3B30]">WISE</span></h1>
            <span className="hidden sm:inline-block text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black text-[#f5f5f5]/40 mt-1">Market Node: 001</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center space-x-0 border-l border-r border-white/5 h-full overflow-x-auto">
          {[
            { name: 'INDEX', path: '/' },
            { name: 'DEALS', path: '/deals' },
            { name: 'SCANNER', path: '/scanner' },
            { name: 'RADAR', path: '/radar' },
            { name: 'TRAVEL', path: '/travel' },
            { name: 'CLUB', path: '/rewards' },
            { name: 'PREMIUM', path: '/premium' },
            { name: 'ADMIN', path: '/admin' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`px-4 xl:px-6 h-full flex items-center text-[10px] font-black tracking-[0.2em] transition-all hover:bg-white/5 border-r border-white/5 last:border-r-0 ${
                location.pathname === item.path ? 'bg-gradient-to-b from-[#FF3B30]/10 to-transparent text-[#FF3B30] border-b-2 border-b-[#FF3B30]' : 'text-[#f5f5f5]'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden lg:flex flex-col items-end border-r border-white/5 pr-8 relative">
            <div className="text-[9px] text-[#f5f5f5] font-black uppercase tracking-[0.2em] opacity-40 mb-1">CURRENCY</div>
            <button 
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="text-xs text-[#f5f5f5] font-black tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {currency} <ChevronDown size={12} />
            </button>
            <AnimatePresence>
              {showCurrencyDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-8 bg-[#111111] border border-white/10 rounded-lg shadow-2xl overflow-hidden min-w-[120px] z-50"
                >
                  {(Object.keys(rates) as Array<keyof typeof rates>).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-black tracking-widest transition-colors ${
                        currency === c ? 'bg-[#FF3B30] text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="text-right hidden md:block border-r border-white/5 pr-8">
            <div className="text-[10px] text-[#f5f5f5] uppercase tracking-widest leading-none mb-1 font-black opacity-30">Live Users</div>
            <div className="text-xs text-[#FF3B30] font-mono font-black border-l-2 border-[#FF3B30] pl-4 leading-none flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse shadow-[0_0_8px_#FF3B30]"></span>
              {onlineCount} ONLINE
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-[#f5f5f5] uppercase tracking-widest leading-none mb-1 font-black opacity-30">Status</div>
            <div className="text-xs text-green-500 font-mono font-black border-l-2 border-green-500 pl-4 leading-none text-shadow-sm">CONNECTED</div>
          </div>
          {user ? (
            <div className="flex justify-center items-center gap-3">
               <Link to="/rewards" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-xs font-black font-mono shadow-[0_0_10px_rgba(234,179,8,0.05)] hover:border-yellow-500/50 transition-colors cursor-pointer">
                 🪙 {coins} <span className="text-[9px] font-medium text-white/40">COINS</span>
               </Link>
               {activeBadge && (
                  <div className="hidden sm:flex items-center justify-center px-2 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-wider font-mono shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                     {activeBadge}
                  </div>
               )}
               {user.isPremium && (
                  <div title="Premium Member" className="hidden sm:flex items-center justify-center p-2 rounded-full border border-yellow-500/50 bg-yellow-500/10 text-yellow-500">
                     <ShieldCheck size={16} />
                  </div>
               )}
               <motion.button
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={logout}
                 title={`Logout ${user.displayName}`}
                 className="w-10 h-10 md:w-12 md:h-12 border border-white/10 rounded-full p-0 group overflow-hidden bg-transparent relative shadow-[0_0_15px_rgba(0,0,0,0.5)] cursor-pointer"
               >
                 <img src={user.photoURL || undefined} alt="avatar" className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0 absolute inset-0" />
                 <div className="absolute inset-0 bg-[#FF3B30]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <LogOut size={20} className="text-white" />
                 </div>
               </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openLogin}
              className="h-10 md:h-12 px-4 md:px-6 border border-white/10 rounded-lg group overflow-hidden bg-white/5 cursor-pointer flex items-center gap-2 md:gap-3 transition-colors hover:bg-white hover:text-black hover:border-white"
            >
              <User size={16} className="text-[#f5f5f5] group-hover:text-black transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-black hidden sm:block">SIGN_IN WITH GOOGLE</span>
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-black sm:hidden">SIGN IN</span>
            </motion.button>
          )}
        </div>
      </nav>

      {/* Bottom Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 z-[100] flex items-center justify-around px-1">
        {[
          { name: 'INDEX', path: '/', icon: LayoutDashboard },
          { name: 'DEALS', path: '/deals', icon: Flame },
          { name: 'SCANNER', path: '/scanner', icon: Scan },
          { name: 'RADAR', path: '/radar', icon: Search },
          { name: 'TRAVEL', path: '/travel', icon: Plane },
          { name: 'CLUB', path: '/rewards', icon: Trophy },
          { name: 'PREMIUM', path: '/premium', icon: Diamond },
        ].map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
              location.pathname === item.path ? 'text-[#FF3B30]' : 'text-[#f5f5f5]/50 hover:text-[#f5f5f5]'
            }`}
          >
            <item.icon size={18} />
            <span className="text-[7px] font-black uppercase tracking-widest">{item.name}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
