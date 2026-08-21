import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Diamond, Search, History, User, LayoutDashboard, LogOut, ShieldCheck, Menu, X, Plane, Flame, Trophy, ChevronDown, Scan, Bot, Gift, Sun, Moon, Eye, EyeOff, Lock, Save, GitCompare, BookOpen, HeartHandshake } from 'lucide-react';
import { Star } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CurrencySelector from './CurrencySelector';
import VisualSearch from './VisualSearch';
import { collection, query, where, onSnapshot, doc, setDoc } from '../lib/firebase';
import { db } from '../lib/firebase';
import { fetchGamificationProfile, deleteAccountAndData } from '../lib/api';
import CouponRewardModal from './CouponRewardModal';
import { useCurrency } from '../contexts/CurrencyContext';
import GooeyNav from './GooeyNav';
import Dock from './Dock';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import toast from 'react-hot-toast';

const GOOEY_NAV_ITEMS = [
  { label: 'HOME', href: '/' },
  { label: 'COMPARE', href: '/compare' },
  { label: 'SHOPPER', href: '/personal-shopper' },
  { label: 'DEALS', href: '/deals' },
  { label: 'GUIDES', href: '/guides' },
  { label: 'SCANNER', href: '/scanner' },
  { label: 'RADAR', href: '/radar' },
  { label: 'GIFTS', href: '/gifts' },
  { label: 'CLUB', href: '/rewards' },
  { label: 'PREMIUM', href: '/premium' },
  { label: 'SUPPORT', href: '/support' },
  { label: 'FOUNDER', href: '/founder' },
  { label: 'ADMIN', href: '/admin' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openLogin, logout, updateAvatar, updateProfile } = useAuth();
  const { currency, setCurrency, rates } = useCurrency();
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [coins, setCoins] = useState<number>(0);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme === 'dark' : true;
    }
    return true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [newName, setNewName] = useState(user?.displayName || '');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setNewName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    const loadProfile = () => {
      if (user?.uid) {
        fetchGamificationProfile()
          .then(profile => {
            setCoins(profile.coins);
            if (profile.hasReceived1000PointCoupon && !localStorage.getItem('1000_point_coupon_seen')) {
               setShowCouponModal(true);
               localStorage.setItem('1000_point_coupon_seen', 'true');
            }
            setActiveBadge(profile.activeBadge || null);
          })
          .catch(() => {});
      }
    };

    loadProfile();

    const handleCoins = (e: any) => {
      if (typeof e.detail?.coins === 'number') {
        setCoins(e.detail.coins);
      }
      loadProfile();
    };

    const handleProfile = (e: any) => {
      if (e.detail?.badge) {
        setActiveBadge(e.detail.badge);
      }
      loadProfile();
    };

    window.addEventListener('buywiseCoinsUpdated', handleCoins);
    window.addEventListener('buywiseProfileUpdated', handleProfile);
    window.addEventListener('buywisePremiumActivated', loadProfile);

    return () => {
      window.removeEventListener('buywiseCoinsUpdated', handleCoins);
      window.removeEventListener('buywiseProfileUpdated', handleProfile);
      window.removeEventListener('buywisePremiumActivated', loadProfile);
    };
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

  if (location.pathname === '/support') {
    return null;
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] px-4 md:px-16 flex items-center justify-between border-b border-white/5 transition-all duration-300 ${isScrolled ? 'h-16 md:h-20 bg-[#000000]/90 backdrop-blur-md shadow-lg shadow-black/20' : 'h-20 md:h-24 bg-[#000000]'}`}>
        <Link to="/" className="flex items-center gap-4 md:gap-6 group">
          <div className="relative hidden sm:block">
            <div className={`relative transition-all duration-500 group-hover:rotate-180 ${isScrolled ? 'w-8 h-8 md:w-10 md:h-10' : 'w-10 h-10 md:w-12 md:h-12'}`}>
              <div className={`absolute top-0 left-0 bg-[#FF3B30] border border-white/5 mix-blend-screen shadow-[0_0_20px_rgba(255,59,48,0.3)] transition-all duration-300 ${isScrolled ? 'w-5 h-5 md:w-6 md:h-6' : 'w-6 h-6 md:w-8 md:h-8'}`}></div>
              <div className={`absolute bottom-0 right-0 bg-transparent border border-white/10 backdrop-blur-sm transition-all duration-300 ${isScrolled ? 'w-5 h-5 md:w-6 md:h-6' : 'w-6 h-6 md:w-8 md:h-8'}`}></div>
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300 ${isScrolled ? 'w-1.5 h-1.5 md:w-2 md:h-2' : 'w-2 h-2 md:w-3 md:h-3'}`}></div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className={`font-black tracking-tighter text-[#f5f5f5] uppercase leading-none transition-all duration-300 ${isScrolled ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'}`}>BUY<span className="text-[#FF3B30]">WISE</span></h1>
            <span className="hidden sm:inline-block text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black text-[#f5f5f5]/40 mt-1">Market Node: 001</span>
          </div>
        </Link>

        <div className="hidden xl:flex items-center space-x-0 border-l border-r border-white/5 h-full overflow-visible shrink overflow-x-auto no-scrollbar">
          <div className="h-full flex items-center">
            <GooeyNav items={GOOEY_NAV_ITEMS} />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <div className="hidden lg:flex items-center gap-4 border-r border-white/5 pr-8 relative shrink-0">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="text-white/50 hover:text-white transition-colors mr-2"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex flex-col items-end">
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
          </div>
          
          
          <CurrencySelector />
          <VisualSearch variant="nav" />
          {user ? (
            <div className="flex justify-center items-center gap-1 sm:gap-3">
               <Link to="/rewards" className="flex items-center gap-1 sm:gap-1.5 px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-400 text-[10px] sm:text-xs font-black font-mono shadow-[0_0_15px_rgba(250,204,21,0.15)] hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all cursor-pointer group shrink-0">
                 <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-yellow-500 flex items-center justify-center bg-yellow-500/20 group-hover:rotate-180 transition-transform duration-500 sm:mr-1">
                   <span className="text-[8px] sm:text-[9px] text-yellow-300">₹</span>
                 </div>
                 {(coins || 0).toLocaleString()} <span className="text-[9px] font-bold text-yellow-500/70 hidden sm:inline tracking-wider">COINS</span>
               </Link>
               {activeBadge && (
                  <div className="hidden sm:flex items-center justify-center px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[8px] sm:text-[9px] font-black uppercase tracking-wider font-mono shadow-[0_0_10px_rgba(59,130,246,0.1)] max-w-[80px] sm:max-w-none truncate shrink-0">
                     {activeBadge}
                  </div>
               )}
               {user.isPremium && (
                  <div title="Premium Member" className="flex items-center justify-center px-1.5 py-1 sm:p-2 rounded-lg sm:rounded-full border border-[#FFD700]/50 bg-[#FFD700]/10 text-[#FFD700] gap-1 shrink-0">
                     <ShieldCheck size={12} className="sm:w-4 sm:h-4 text-[#FFD700]" />
                     <span className="hidden sm:hidden md:block text-[8px] font-black tracking-widest uppercase">Premium</span>
                  </div>
               )}
               <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAvatarModal(true)}
                    title={`Change Avatar`}
                    className={`rounded-full p-[2px] group overflow-hidden relative cursor-pointer bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] hover:shadow-[0_0_20px_rgba(236,72,153,0.8)] transition-all shrink-0 ${isScrolled ? 'w-8 h-8 md:w-10 md:h-10' : 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12'}`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-[#111]">
                      <img src={user.photoURL || undefined} alt="avatar" className="w-full h-full object-cover transition-all absolute inset-0 z-10" />
                      <div className="absolute inset-0 bg-[#FF3B30]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <span className="text-[8px] sm:text-[10px] font-bold text-white tracking-widest uppercase">EDIT</span>
                      </div>
                    </div>
                  </motion.button>
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={logout}
                   title={`Logout`}
                   className={`border border-white/10 rounded-full flex items-center justify-center bg-white/5 hover:bg-[#FF3B30]/20 hover:text-[#FF3B30] hover:border-[#FF3B30]/50 transition-all cursor-pointer shrink-0 ${isScrolled ? 'w-8 h-8 md:w-10 md:h-10' : 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12'}`}
                 >
                   <LogOut size={14} className="sm:w-4 sm:h-4" />
                 </motion.button>
               </div>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openLogin}
              className={`px-4 md:px-6 border border-white/10 rounded-lg group overflow-hidden bg-white/5 cursor-pointer flex items-center gap-2 md:gap-3 transition-all hover:bg-white hover:text-black hover:border-white shrink-0 ${isScrolled ? 'h-8 md:h-10' : 'h-10 md:h-12'}`}
            >
              <User size={16} className="text-[#f5f5f5] group-hover:text-black transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-black hidden sm:block">SIGN IN</span>
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-black sm:hidden">SIGN IN</span>
            </motion.button>
          )}
        </div>
        {showCouponModal && <CouponRewardModal isOpen={showCouponModal} onClose={() => setShowCouponModal(false)} />}
    </nav>

      {/* Bottom Mobile Tab Bar */}
      <div className="fixed bottom-[env(safe-area-inset-bottom)] left-0 right-0 z-[100] pb-2 sm:pb-4 flex justify-center xl:hidden pointer-events-none">
        <div className="pointer-events-auto">
          <Dock
            items={[
              { label: 'HOME', icon: <LayoutDashboard size={18} />, onClick: () => navigate('/') },
              { label: 'COMPARE', icon: <GitCompare size={18} />, onClick: () => navigate('/compare') },
              { label: 'SHOPPER', icon: <Bot size={18} />, onClick: () => navigate('/personal-shopper') },
              { label: 'DEALS', icon: <Flame size={18} />, onClick: () => navigate('/deals') },
              { label: 'MORE', icon: <Menu size={18} />, onClick: () => setIsMobileMenuOpen(true) },
            ]}
            panelHeight={68}
            baseItemSize={36}
            magnification={50}
            distance={80}
            dockHeight={70}
          />
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-[#000000]/95 backdrop-blur-xl flex flex-col xl:hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tighter text-[#f5f5f5] uppercase leading-none">BUY<span className="text-[#FF3B30]">WISE</span></h1>
                <span className="text-[8px] uppercase tracking-[0.4em] font-black text-[#f5f5f5]/40 mt-1">Menu</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {[
                { label: 'HOME', href: '/', icon: <LayoutDashboard size={20} /> },
                { label: 'COMPARE', href: '/compare', icon: <GitCompare size={20} /> },
                { label: 'PERSONAL SHOPPER', href: '/personal-shopper', icon: <Bot size={20} /> },
                { label: 'DEALS', href: '/deals', icon: <Flame size={20} /> },
                { label: 'SHOPPING GUIDES', href: '/guides', icon: <BookOpen size={20} /> },
                { label: 'BARCODE SCANNER', href: '/scanner', icon: <Scan size={20} /> },
                { label: 'PRICE RADAR', href: '/radar', icon: <Search size={20} /> },
                { label: 'GIFT CARDS', href: '/gifts', icon: <Gift size={20} /> },
                { label: 'REWARDS CLUB', href: '/rewards', icon: <Trophy size={20} /> },
                { label: 'PREMIUM', href: '/premium', icon: <Diamond size={20} /> },
                { label: 'HUMAN SUPPORT', href: '/support', icon: <HeartHandshake size={20} /> },
                { label: 'ADMIN PANEL', href: '/admin', icon: <ShieldCheck size={20} /> },
                { label: 'FOUNDER', href: '/founder', icon: <Star size={20} /> },
              ].map((item) => (
                <Link 
                  key={item.href}
                  to={item.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className="text-[#FF3B30]">{item.icon}</div>
                  <span className="font-black tracking-widest text-sm uppercase">{item.label}</span>
                </Link>
              ))}
              <div className="h-20" /> {/* Spacer for bottom dock */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold">Profile & Security Settings</h3>
                <button 
                  onClick={() => {
                    setShowAvatarModal(false);
                    setConfirmDelete(false);
                  }} 
                  className="text-white/50 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { type: 'dicebear', style: 'shapes', seed: 'Alpha' },
                  { type: 'dicebear', style: 'shapes', seed: 'Beta' },
                  { type: 'dicebear', style: 'shapes', seed: 'Gamma' },
                  { type: 'dicebear', style: 'shapes', seed: 'Delta' },
                  { type: 'dicebear', style: 'identicon', seed: 'Epsilon' },
                  { type: 'dicebear', style: 'identicon', seed: 'Zeta' },
                  { type: 'svg', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ff00cc" /><stop offset="100%" stop-color="%23333399" /></linearGradient></defs><rect width="100" height="100" fill="url(%23g1)" /></svg>' },
                  { type: 'svg', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23FDFC47" /><stop offset="100%" stop-color="%2324FE41" /></linearGradient></defs><rect width="100" height="100" fill="url(%23g2)" /></svg>' },
                ].map((avatar, idx) => {
                  const url = avatar.type === 'dicebear' 
                    ? `https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}`
                    : avatar.url!;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        updateAvatar(url);
                        setShowAvatarModal(false);
                      }}
                      className="aspect-square rounded-full border-2 border-transparent hover:border-[#FF3B30] overflow-hidden bg-white/5 transition-all"
                    >
                      <img src={url} alt="avatar option" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/50 font-bold uppercase tracking-widest">Upload Custom Photo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF3B30] file:text-white hover:file:bg-[#FF3B30]/80 cursor-pointer bg-white/5 rounded-lg border border-white/10 p-2"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateAvatar(reader.result as string);
                          setShowAvatarModal(false);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-white/50 font-bold uppercase tracking-widest">Or enter custom URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="custom-avatar-url"
                      placeholder="https://example.com/image.png"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF3B30]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const url = (e.target as HTMLInputElement).value;
                          if (url) {
                            updateAvatar(url);
                            setShowAvatarModal(false);
                          }
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const el = document.getElementById('custom-avatar-url') as HTMLInputElement;
                        if (el && el.value) {
                          updateAvatar(el.value);
                          setShowAvatarModal(false);
                          setConfirmDelete(false);
                        }
                      }}
                      className="bg-[#FF3B30] hover:bg-[#FF3B30]/80 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Profile Update section */}
              <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                <h4 className="text-xs text-white/50 font-bold uppercase tracking-widest">Update Profile Details</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Full Name / Display Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#FF3B30] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Change Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password (optional)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-white text-sm focus:outline-none focus:border-[#FF3B30] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                <button
                  onClick={async () => {
                    if (!newName.trim() && !newPassword) {
                      toast.error("Please provide at least a name or a new password.");
                      return;
                    }
                    setUpdatingProfile(true);
                    try {
                      await updateProfile({
                        name: newName || undefined,
                        password: newPassword || undefined
                      });
                      toast.success("Profile details updated successfully!");
                      setNewPassword(''); // clear password field
                    } catch (err: any) {
                      toast.error(err.message || "Failed to update profile details");
                    } finally {
                      setUpdatingProfile(false);
                    }
                  }}
                  disabled={updatingProfile}
                  className="w-full py-2.5 px-4 bg-[#FF3B30] hover:bg-[#FF3B30]/80 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
                >
                  {updatingProfile ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>

              {/* Data & Privacy (Right to be Forgotten) */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <h4 className="text-xs text-white/50 font-bold uppercase tracking-widest mb-3">Privacy & Security</h4>
                
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full py-2.5 px-4 bg-white/5 hover:bg-[#FF3B30]/10 border border-white/10 hover:border-[#FF3B30]/30 text-xs text-white/60 hover:text-[#FF3B30] rounded-xl font-bold transition-all uppercase tracking-widest"
                  >
                    Delete Account & Data
                  </button>
                ) : (
                  <div className="p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl space-y-3">
                    <p className="text-[11px] text-white/80 leading-relaxed">
                      <strong>Are you absolutely sure?</strong> This will permanently erase your gamification profile, wishlist, price alerts, and all {coins} BuyWise coins. This action is irreversible.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await deleteAccountAndData();
                            await logout();
                            setShowAvatarModal(false);
                            setConfirmDelete(false);
                            navigate('/');
                          } catch (err: any) {
                            console.error("Deletion failed:", err);
                          }
                        }}
                        className="flex-1 py-2 bg-[#FF3B30] hover:bg-[#FF3B30]/80 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                      >
                        Yes, Erase Everything
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg uppercase tracking-wider border border-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
