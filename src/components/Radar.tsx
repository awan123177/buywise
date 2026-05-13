import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Crosshair, Heart, BellRing, ExternalLink, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Radar() {
  const { user } = useAuth();
  const [trackedItems, setTrackedItems] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Request push notification permissions on mount
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (trackedItems.length === 0) return;

    // Simulate background price monitoring job
    const interval = setInterval(() => {
      // 30% chance to simulate a price drop every 15 seconds
      if (Math.random() > 0.7) {
        const randomItem = trackedItems[Math.floor(Math.random() * trackedItems.length)];
        const percentDrop = Math.floor(Math.random() * 15) + 5; // 5% to 20% drop
        const title = `🚨 PRICE DROP ALERT: -${percentDrop}%`;
        const body = `${randomItem.productTitle} dropped on ${randomItem.source}!`;

        // Local Toast Notification
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#111111]/90 rounded-xl pointer-events-auto flex ring-1 ring-[#FF3B30]/50 overflow-hidden backdrop-blur-md`}>
            <div className="p-4 flex-1">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-[#FF3B30]/20 flex items-center justify-center border border-[#FF3B30]/50 animate-pulse">
                    <BellRing className="h-5 w-5 text-[#FF3B30]" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-black text-white uppercase tracking-wider">
                    {title}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2 uppercase tracking-wide">
                    {body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 6000, id: `mock-price-drop-${randomItem.id}` });

        // System Push Notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: randomItem.thumbnail || '/favicon.ico'
          });
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [trackedItems]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Set up real-time listener for price tracking
    const qTrack = query(collection(db, 'price_tracking'), where('userId', '==', user.uid));
    const unsubTrack = onSnapshot(qTrack, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrackedItems(items);
      setLoading(false);
    });

    const qWishlist = query(collection(db, 'wishlist'), where('userId', '==', user.uid));
    const unsubWishlist = onSnapshot(qWishlist, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishlistItems(items);
      setLoading(false);
    });

    return () => {
      unsubTrack();
      unsubWishlist();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen pt-44 flex items-center justify-center px-4">
        <div className="terminal-card p-12 text-center max-w-md">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 text-[#FF3B30]">ACCESS_DENIED</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5f5f5]/60 mb-6">AUTOMATED_DEFENSE_SYSTEM_ENGAGED</p>
          <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-lg p-4 text-xs font-mono text-[#FF3B30]">
            {"// ERROR: UNAUTHORIZED_USER_DETECTED"}
            <br />
            {"// ACTION: PLEASE_AUTHENTICATE_TO_ACCESS_RADAR"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-36 px-4 md:px-8 max-w-7xl mx-auto pb-24">
      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
          RADAR<span className="text-[#FF3B30]">_SYSTEM</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.3em] font-black text-white/40 mt-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-[#FF3B30] rounded-full animate-pulse"></span>
          MONITORING_ACTIVE // AWAITING_PRICE_DROPS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Tracked Items Section */}
        <section>
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
            <Crosshair className="text-[#FF3B30]" size={24} />
            <h2 className="text-2xl font-black uppercase tracking-widest text-[#f5f5f5]">PRICE_TRACKING</h2>
            <div className="ml-auto bg-[#FF3B30]/20 text-[#FF3B30] text-[10px] font-black px-3 py-1 rounded-full border border-[#FF3B30]/30">
              {trackedItems.length} TARGETS
            </div>
          </div>
          
          <div className="space-y-4">
            {trackedItems.length === 0 && !loading && (
              <div className="terminal-card p-8 text-center text-white/40 text-xs font-black uppercase tracking-widest">
                NO_TARGETS_DETECTED
              </div>
            )}
            
            {trackedItems.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={item.id} 
                className="glass-card p-4 flex gap-6 hover:border-[#FF3B30]/50 transition-colors group relative overflow-hidden"
              >
                {/* Scanning line effect on hover */}
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF3B30] to-transparent top-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="w-24 h-24 bg-white/5 rounded-lg border border-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-full h-full object-contain mix-blend-screen" />
                  ) : (
                    <Crosshair className="text-white/20" size={32} />
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-black text-[#f5f5f5] line-clamp-2 pr-4">{item.productTitle}</h3>
                  </div>
                  
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-black">BASELINE_PRICE</div>
                      <div className="text-xl font-black text-[#FF3B30]">{item.currentPrice}</div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[9px] uppercase tracking-widest font-black bg-white/5 px-2 py-1 rounded border border-white/5 text-[#f5f5f5]/70">
                         {item.source}
                       </span>
                       <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 font-black uppercase tracking-widest text-[#FF3B30] hover:text-white transition-colors">
                         GO_TO_TARGET <ArrowRight size={12} />
                       </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Wishlist Section */}
        <section>
          <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
            <Heart className="text-white" size={24} />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">WISHLIST</h2>
            <div className="ml-auto bg-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/10">
              {wishlistItems.length} SAVED
            </div>
          </div>
          
          <div className="space-y-4">
            {wishlistItems.length === 0 && !loading && (
              <div className="terminal-card p-8 text-center text-white/40 text-xs font-black uppercase tracking-widest">
                NO_SAVED_ITEMS
              </div>
            )}
            
            {wishlistItems.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={item.id} 
                className="glass-card p-4 flex gap-6 hover:border-white/30 transition-colors group relative overflow-hidden"
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="w-24 h-24 bg-white/5 rounded-lg border border-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-full h-full object-contain mix-blend-screen" />
                  ) : (
                    <Heart className="text-white/20" size={32} />
                  )}
                </div>
                <div className="flex flex-col flex-1 relative z-10">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-black text-white line-clamp-2 pr-4">{item.productTitle}</h3>
                  </div>
                  
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-black">LAST_SEEN_PRICE</div>
                      <div className="text-xl font-black text-white">{item.currentPrice}</div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                       <span className="text-[9px] uppercase tracking-widest font-black bg-white/5 px-2 py-1 rounded border border-white/5 text-[#f5f5f5]/70">
                         {item.source}
                       </span>
                       <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] flex items-center gap-1 font-black uppercase tracking-widest text-white hover:text-[#FF3B30] transition-colors">
                         VIEW_ORIGINAL <ExternalLink size={12} />
                       </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
