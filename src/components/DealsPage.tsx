import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, TrendingUp, Sparkles, SlidersHorizontal, Bell, 
  Share2, Bookmark, CheckCircle, Smartphone, Globe, Clock, 
  HelpCircle, ChevronRight, Gift, Tag, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchCuratedDeals, triggerDealAction, 
  updateNotificationSettings, fetchGamificationProfile 
} from '../lib/api';
import toast from 'react-hot-toast';

import { useCurrency } from '../contexts/CurrencyContext';

export default function DealsPage() {
  const { user, openLogin } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<'daily' | 'trending'>('daily');
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Filters & Settings
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubtype, setSelectedSubtype] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week'>('today');
  
  // Notification States
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notifPreferences, setNotifPreferences] = useState({
    morning: true,
    afternoon: false,
    evening: true,
  });
  const [pushType, setPushType] = useState({
    web: true,
    android: true,
  });

  // Track user profile
  const [profile, setProfile] = useState<any>(null);

  // Saved Deals list (local visual indicator)
  const [savedDeals, setSavedDeals] = useState<string[]>([]);
  const [alertDeals, setAlertDeals] = useState<string[]>([]);

  // Fetch Deals
  const loadDeals = async () => {
    setLoading(true);
    try {
      let typeParam = 'all';
      if (activeTab === 'daily') {
        if (selectedSubtype === 'flash') typeParam = 'flash';
        else if (selectedSubtype === 'editor') typeParam = 'editor';
        else if (selectedSubtype === 'under500') typeParam = 'under500';
        else if (selectedSubtype === 'under1000') typeParam = 'under1000';
        else if (selectedSubtype === 'under5000') typeParam = 'under5000';
        else typeParam = 'best'; // Top Deals
      } else {
        typeParam = 'trending'; // Trending
      }

      const data = await fetchCuratedDeals({
        category: selectedCategory,
        type: typeParam,
      });
      setDeals(data);
    } catch (e) {
      console.error("Failed to fetch deals:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    if (user) {
      try {
        const data = await fetchGamificationProfile();
        setProfile(data);
        setNotificationsEnabled(data.notificationsEnabled);
        if (data.notificationPreferences) {
          setNotifPreferences(data.notificationPreferences);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadDeals();
  }, [activeTab, selectedCategory, selectedSubtype, selectedTimeframe]);

  useEffect(() => {
    loadProfile();
  }, [user?.uid]);

  // Deal Actions
  const handleSaveDeal = async (dealId: string) => {
    if (!user) {
      toast.error("Please sign in to save deals!");
      openLogin();
      return;
    }
    
    try {
      await triggerDealAction(dealId, 'save');
      if (savedDeals.includes(dealId)) {
        setSavedDeals(prev => prev.filter(id => id !== dealId));
        toast.success("Deal removed from watchlists");
      } else {
        setSavedDeals(prev => [...prev, dealId]);
        toast.success("Deal saved to your watchlists! 💾");
      }
      // Re-trigger visual count increase
      setDeals(prev => prev.map(d => d.id === dealId ? { ...d, saves: d.saves + 1 } : d));
    } catch (e) {
      toast.error("Failed to save deal.");
    }
  };

  const handleShareDeal = async (deal: any) => {
    if (!user) {
      toast.error("Please sign in to share and earn coins!");
      openLogin();
      return;
    }

    try {
      await triggerDealAction(deal.id, 'share');
      // Copy to clipboard
      await navigator.clipboard.writeText(`Check out this BuyWise Deal: ${deal.title} for only ${formatPrice(deal.newPrice)} (${deal.discountPercent}% OFF!) - https://buywise.app/deals`);
      toast.success("Link copied! +2 BuyWise Coins added! 📲");
      // Update share visual
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, purchases: (d.purchases || 0) + 1 } : d));
      loadProfile(); // refresh coins
    } catch (e) {
      console.error(e);
      toast.error("Could not copy deal link.");
    }
  };

  const handleSetAlert = (dealId: string, title: string) => {
    if (!user) {
      toast.error("Please sign in to enable alerts!");
      openLogin();
      return;
    }

    if (alertDeals.includes(dealId)) {
      setAlertDeals(prev => prev.filter(id => id !== dealId));
      toast.success("Price alerts disabled for this item");
    } else {
      setAlertDeals(prev => [...prev, dealId]);
      toast.success(`Price Alert Set! We will ping you if "${title.substring(0, 20)}..." drops further! 🔔`);
    }
  };

  // Save notification preferences
  const handleToggleNotification = async () => {
    if (!user) return;
    const nextEnabled = !notificationsEnabled;
    setNotificationsEnabled(nextEnabled);
    try {
      await updateNotificationSettings(nextEnabled, notifPreferences);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreferenceChange = async (key: 'morning' | 'afternoon' | 'evening') => {
    if (!user) return;
    const updated = { ...notifPreferences, [key]: !notifPreferences[key] };
    setNotifPreferences(updated);
    try {
      await updateNotificationSettings(notificationsEnabled, updated);
    } catch (e) {
      console.error(e);
    }
  };

  // Categories list
  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'mobiles', label: 'Mobiles' },
    { id: 'laptops', label: 'Laptops' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'fashion', label: 'Fashion' },
    { id: 'home', label: 'Home' },
    { id: 'grocery', label: 'Grocery' }
  ];

  // Best Deal today (First deal with isBestSeller or flash deal)
  const bestDeal = deals.find(d => d.isBestSeller) || deals[0];

  return (
    <div className="pt-24 md:pt-28 px-4 md:px-16 max-w-7xl mx-auto pb-16 relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-[#FF3B30]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[200px] h-[200px] rounded-full bg-[#FF3B30]/3 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-white/5 gap-4">
        <div>
          <span className="text-xs font-black tracking-[0.4em] text-[#FF3B30] uppercase mb-1 block">// LIQUIDATION DEALS</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#f5f5f5] uppercase leading-none">
            SAVINGS <span className="text-[#FF3B30]">TERMINAL</span>
          </h2>
          <p className="text-xs md:text-sm text-[#f5f5f5]/60 mt-2 font-medium">
            Real-time liquidations, custom budget filters, and instant deal notifications.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 max-w-md">
          <button
            onClick={() => { setActiveTab('daily'); setSelectedSubtype('all'); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-[11px] font-black tracking-[0.2em] transition-all uppercase ${
              activeTab === 'daily'
                ? 'bg-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Flame size={14} />
            DAILY DEALS
          </button>
          <button
            onClick={() => { setActiveTab('trending'); setSelectedSubtype('all'); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-md text-[11px] font-black tracking-[0.2em] transition-all uppercase ${
              activeTab === 'trending'
                ? 'bg-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            TRENDING DEALS
          </button>
        </div>
      </div>

      {/* Main Grid: Filters & Settings on left/top, Deals list on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Navigation / Filters / Preferences */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Stats Summary */}
          {user && profile && (
            <div className="bg-gradient-to-br from-white/[0.04] to-transparent p-5 rounded-lg border border-white/5">
              <div className="text-[10px] uppercase font-black text-[#f5f5f5]/40 tracking-wider">Your Balance</div>
              <div className="text-2xl font-black text-yellow-500 flex items-center gap-1.5 mt-1">
                🪙 {profile.coins} <span className="text-xs font-medium text-white/50">Coins</span>
              </div>
              <div className="text-[10px] text-white/40 mt-1">Share a deal below to instantly earn +2 coins!</div>
            </div>
          )}

          {/* Timeframe selector for Trending */}
          {activeTab === 'trending' && (
            <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5 space-y-3">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#FF3B30] flex items-center gap-2">
                <Clock size={12} /> TIMEFRAME
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedTimeframe('today')}
                  className={`py-1.5 rounded text-[10px] font-black tracking-widest transition-all ${
                    selectedTimeframe === 'today'
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-transparent text-white/40 border border-transparent hover:text-white'
                  }`}
                >
                  TODAY
                </button>
                <button
                  onClick={() => setSelectedTimeframe('week')}
                  className={`py-1.5 rounded text-[10px] font-black tracking-widest transition-all ${
                    selectedTimeframe === 'week'
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-transparent text-white/40 border border-transparent hover:text-white'
                  }`}
                >
                  THIS WEEK
                </button>
              </div>
            </div>
          )}

          {/* Daily Deals Sub-type filter */}
          {activeTab === 'daily' && (
            <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5 space-y-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#FF3B30] flex items-center gap-2 mb-3">
                <Sparkles size={12} /> DISCOVER DEALS
              </h3>
              {[
                { id: 'all', label: '🔥 TODAY\'S BEST DEALS' },
                { id: 'flash', label: '⚡ FLASH DEALS' },
                { id: 'editor', label: '⭐ EDITOR\'S PICKS' },
                { id: 'under500', label: `💸 UNDER ${formatPrice(500)} BUDGET` },
                { id: 'under1000', label: `💸 UNDER ${formatPrice(1000)} BUDGET` },
                { id: 'under5000', label: `💸 UNDER ${formatPrice(5000)} BUDGET` },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubtype(sub.id)}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-black tracking-wider transition-colors block ${
                    selectedSubtype === sub.id 
                      ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-l-2 border-[#FF3B30]' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {/* Category Filter */}
          <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5 space-y-2">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[#FF3B30] flex items-center gap-2 mb-3">
              <SlidersHorizontal size={12} /> CATEGORIES
            </h3>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-3 py-1.5 rounded text-xs font-black tracking-wider transition-colors block ${
                  selectedCategory === cat.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Notifications Center */}
          <div className="bg-gradient-to-b from-white/[0.03] to-transparent p-5 rounded-lg border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-[#FF3B30] flex items-center gap-2">
                <Bell size={12} /> DEAL ALERTS
              </h3>
              <button 
                onClick={handleToggleNotification}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors relative ${
                  notificationsEnabled ? 'bg-green-500' : 'bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
            
            <p className="text-[10px] text-white/50 leading-relaxed">
              Enable standard web and mobile alerts to receive pricing notifications instantly.
            </p>

            <AnimatePresence>
              {notificationsEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 pt-2 border-t border-white/5 overflow-hidden text-xs"
                >
                  <div className="text-[10px] uppercase tracking-wider font-black text-white/40">Frequencies</div>
                  
                  {[
                    { key: 'morning', label: '🌅 Morning Digest (9:00 AM)' },
                    { key: 'afternoon', label: '☀️ Afternoon Flash (2:00 PM)' },
                    { key: 'evening', label: '🌇 Evening Drop Alerts (8:00 PM)' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white select-none">
                      <input 
                        type="checkbox" 
                        checked={notifPreferences[item.key as 'morning' | 'afternoon' | 'evening']}
                        onChange={() => handlePreferenceChange(item.key as 'morning' | 'afternoon' | 'evening')}
                        className="rounded border-white/10 text-[#FF3B30] bg-transparent focus:ring-0"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}

                  <div className="text-[10px] uppercase tracking-wider font-black text-white/40 pt-2">Supported Platforms</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-white/60">
                      <Globe size={12} className="text-green-500" />
                      <span>Web Browser Push <span className="text-[9px] text-green-500 font-bold bg-green-500/10 px-1 py-0.5 rounded ml-1">ACTIVE</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Smartphone size={12} className="text-[#FF3B30]" />
                      <span>Android App Pushes <span className="text-[9px] text-green-500 font-bold bg-green-500/10 px-1 py-0.5 rounded ml-1">ACTIVE</span></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Side: Showcase & Deals Feed */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Today's Mega Deal Showcase banner */}
          {activeTab === 'daily' && bestDeal && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-[#221010] p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row gap-6 items-center"
            >
              {/* Corner Badge */}
              <div className="absolute top-0 right-0 bg-[#FF3B30] text-white text-[10px] font-black tracking-widest px-4 py-1.5 uppercase rounded-bl-xl shadow-lg flex items-center gap-1">
                <Flame size={12} className="animate-bounce" />
                TODAY'S BEST DEAL
              </div>

              {/* Thumbnail */}
              <div className="w-40 h-40 bg-white/5 rounded-xl flex items-center justify-center p-3 relative shrink-0 border border-white/10 group">
                <img 
                  src={bestDeal.thumbnail} 
                  alt={bestDeal.title} 
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110 duration-300" 
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 uppercase tracking-widest inline-block mr-2">
                    {bestDeal.category.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-0.5 rounded border border-[#FF3B30]/20 uppercase tracking-widest inline-block">
                    {bestDeal.source}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-white line-clamp-2 mt-2 leading-tight">
                    {bestDeal.title}
                  </h3>
                </div>

                <div className="flex items-end gap-3 font-mono">
                  <div className="text-3xl font-black text-green-500">{formatPrice(bestDeal.newPrice)}</div>
                  <div className="text-sm text-white/40 line-through pb-1">{formatPrice(bestDeal.oldPrice)}</div>
                  <div className="text-xs text-[#FF3B30] font-black bg-[#FF3B30]/15 px-2 py-1 rounded border border-[#FF3B30]/20 mb-1 animate-pulse">
                    {bestDeal.discountPercent}% OFF
                  </div>
                </div>

                {bestDeal.timeRemaining && (
                  <div className="flex items-center gap-1 text-[11px] font-black text-[#FF3B30]">
                    <Clock size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                    FLASH ENDS IN: <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 ml-1">{bestDeal.timeRemaining}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSaveDeal(bestDeal.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-colors cursor-pointer ${
                      savedDeals.includes(bestDeal.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    <Bookmark size={14} fill={savedDeals.includes(bestDeal.id) ? "white" : "none"} />
                    {savedDeals.includes(bestDeal.id) ? "SAVED" : "SAVE DEAL"}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShareDeal(bestDeal)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FF3B30] to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-[10px] font-black tracking-widest cursor-pointer shadow-lg shadow-red-600/20"
                  >
                    <Share2 size={14} />
                    SHARE (+2 COINS)
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSetAlert(bestDeal.id, bestDeal.title)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest cursor-pointer transition-all ${
                      alertDeals.includes(bestDeal.id)
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/40'
                        : 'bg-transparent text-white/60 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Bell size={14} />
                    {alertDeals.includes(bestDeal.id) ? "ALERT ACTIVE" : "SET ALERT"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Deals Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <span className="text-[11px] font-black tracking-widest text-[#FF3B30] uppercase">
                {activeTab === 'daily' ? `${selectedSubtype.toUpperCase()} DEALS` : 'MOST COMPARED TRENDING'} ({deals.length})
              </span>
              <span className="text-[10px] text-white/40 font-mono">CURATED 24H LIVE FEED</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 4, 5].map(idx => (
                  <div key={idx} className="h-44 bg-white/[0.02] border border-white/5 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-16 bg-white/[0.01] rounded-2xl border border-white/5 border-dashed">
                <AlertCircle className="mx-auto text-white/20 mb-3" size={36} />
                <div className="text-sm text-white/60 font-black tracking-wider">NO DEALS FOUND</div>
                <p className="text-xs text-white/40 mt-1">Try changing category filters or discover tabs</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deals.map((deal) => {
                  const isSaved = savedDeals.includes(deal.id);
                  const isAlert = alertDeals.includes(deal.id);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={deal.id}
                      className="bg-[#111111]/40 hover:bg-[#111111]/80 transition-all rounded-xl border border-white/5 hover:border-[#FF3B30]/30 p-4 flex flex-col justify-between group h-full relative"
                    >
                      {/* Floating badging */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[8px] font-bold text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10 uppercase tracking-widest">
                          {deal.category}
                        </span>
                        
                        <div className="flex gap-1">
                          {deal.isEditorPick && (
                            <span className="text-[8px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20">
                              ★ EDITOR PICK
                            </span>
                          )}
                          {deal.isFlashDeal && (
                            <span className="text-[8px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 animate-pulse">
                              ⚡ FLASH
                            </span>
                          )}
                          <span className="text-[8px] font-black text-white/30 tracking-widest font-mono uppercase bg-white/5 px-1.5 py-0.5 rounded">
                            {deal.source}
                          </span>
                        </div>
                      </div>

                      {/* Main Deal Body */}
                      <div className="flex gap-4 items-start flex-1 mb-4">
                        <div className="w-20 h-20 bg-white rounded-lg p-1.5 shrink-0 flex items-center justify-center border border-white/10 overflow-hidden relative">
                          <img src={deal.thumbnail} alt={deal.title} className="w-full h-full object-contain filter group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <h4 className="text-xs font-bold text-white tracking-tight line-clamp-2 leading-snug group-hover:text-[#FF3B30] transition-colors">
                            {deal.title}
                          </h4>
                          
                          <div className="flex items-end gap-2 pt-1 font-mono">
                            <span className="text-base font-black text-green-400">{formatPrice(deal.newPrice)}</span>
                            <span className="text-xs text-white/40 line-through">{formatPrice(deal.oldPrice)}</span>
                            <span className="text-[9px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 px-1 py-0.2 rounded">
                              -{deal.discountPercent}%
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[9px] text-white/40 font-mono pt-1">
                            <span>👁 {deal.views || 0} VIEWS</span>
                            <span>💾 {deal.saves || 0} SAVES</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSaveDeal(deal.id)}
                          className={`p-2 rounded bg-white/5 text-white cursor-pointer hover:bg-white/10 ${
                            isSaved ? 'text-green-500' : 'text-white/60'
                          }`}
                          title="Save Deal"
                        >
                          <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSetAlert(deal.id, deal.title)}
                          className={`p-2 rounded bg-white/5 text-white cursor-pointer hover:bg-white/10 ${
                            isAlert ? 'text-yellow-500 bg-yellow-500/10' : 'text-white/60'
                          }`}
                          title="Set Price Drop Alert"
                        >
                          <Bell size={14} />
                        </motion.button>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleShareDeal(deal)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30]/20 rounded text-[9px] font-black tracking-widest uppercase cursor-pointer"
                        >
                          <Share2 size={11} />
                          SHARE (+2 COINS)
                        </motion.button>
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
