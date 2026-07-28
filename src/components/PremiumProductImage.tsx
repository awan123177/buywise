import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageOff } from 'lucide-react';

interface PremiumProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackImages?: string[];
}

export default function PremiumProductImage({ src, alt, className = "", fallbackImages = [] }: PremiumProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFallbackIndex(0);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (fallbackIndex < fallbackImages.length) {
      setCurrentSrc(fallbackImages[fallbackIndex]);
      setFallbackIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-white/5 flex items-center justify-center ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}
      
      {hasError ? (
        <div className="flex flex-col items-center justify-center text-white/20">
          <ImageOff size={32} className="mb-2 opacity-50" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-center">Image<br/>Unavailable</span>
        </div>
      ) : (
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className="w-full h-full object-contain mix-blend-screen hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
