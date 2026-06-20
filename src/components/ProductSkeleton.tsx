import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductSkeleton({ isBest = false }: { isBest?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`terminal-card p-0 flex flex-col gap-0 overflow-hidden bg-transparent ${
        isBest 
          ? "border-[#cc0000]/50 border-2" 
          : "border-white/10 border"
      }`}
    >
      {/* Image Placeholder */}
      <div className="relative aspect-[4/5] bg-white/5 animate-pulse flex items-center justify-center overflow-hidden border-b border-white/10">
        <ShieldAlert className="w-12 h-12 text-white/10" />
      </div>

      {/* Content Placeholder */}
      <div className="p-6 flex flex-col gap-4 flex-grow bg-black/20">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="h-3 w-16 bg-white/10 animate-pulse rounded-full" />
          <div className="h-3 w-8 bg-white/10 animate-pulse rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 animate-pulse rounded-full" />
          <div className="h-4 w-5/6 bg-white/10 animate-pulse rounded-full" />
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-24 bg-white/10 animate-pulse rounded-full" />
            <div className="h-3 w-32 bg-white/10 animate-pulse rounded-full" />
          </div>
          <div className="h-10 w-full bg-white/5 animate-pulse rounded" />
        </div>
      </div>
    </motion.div>
  );
}
