import React from 'react';
import { motion } from 'motion/react';
import { Headset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupportChat() {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/support')}
      className="fixed z-[140] bottom-24 right-4 sm:bottom-6 sm:right-6 px-4 py-3 bg.gradient-to-r bg-[#FF3B30] text-white rounded-full flex items-center gap-2.5 shadow-[0_0_25px_rgba(255,59,48,0.4)] hover:bg-[#FF3B30]/90 transition-all border border-[#FF3B30]/50 font-bold text-xs uppercase tracking-wider"
      title="Open BuyWise Full-Screen Priority Support"
    >
      <div className="w-2 h-2 rounded-full bg-white animate-ping" />
      <Headset size={20} />
      <span>Human Support</span>
    </motion.button>
  );
}
