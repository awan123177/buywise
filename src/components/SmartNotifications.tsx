import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, Tag, Sparkles, TrendingDown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NOTIFICATIONS = [
  { title: 'Flash Sale Detected', message: 'Sony WH-1000XM5 just dropped by ₹3,000 on Amazon!', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { title: 'Coupon Available', message: 'Apply SAVE500 for an extra ₹500 off at Croma checkout.', icon: Tag, color: 'text-green-400', bg: 'bg-green-400/10' },
  { title: 'AI Recommendation', message: 'Based on your searches, the iPhone 15 Pro is at its lowest price ever.', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { title: 'Restock Alert', message: 'The PS5 you were looking for is back in stock at Reliance Digital.', icon: Bell, color: 'text-blue-400', bg: 'bg-blue-400/10' },
];

export default function SmartNotifications() {
  useEffect(() => {
    const triggerRandomNotification = () => {
      const notif = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
      
      toast.custom((t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="max-w-md w-full bg-[#111111]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-2xl pointer-events-auto flex ring-1 ring-black/5 overflow-hidden"
            >
              <div className="flex-1 p-4">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 pt-0.5`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${notif.bg}`}>
                      <notif.icon className={`h-5 w-5 ${notif.color}`} />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-black text-white uppercase tracking-wider">
                      {notif.title}
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/10">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ), { duration: 6000, position: 'bottom-left' });
    };

    // Trigger first notification after 15 seconds, then every 60 seconds
    const initialTimeout = setTimeout(triggerRandomNotification, 15000);
    const interval = setInterval(triggerRandomNotification, 60000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return null;
}
