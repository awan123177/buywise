import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImageOff } from 'lucide-react';
import { getFallbackPhotoList } from '../lib/productImages';

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

  const effectiveFallbacks = React.useMemo(() => {
    const categoryFallbacks = getFallbackPhotoList(alt);
    return Array.from(new Set([...fallbackImages, ...categoryFallbacks]));
  }, [alt, fallbackImages]);

  useEffect(() => {
    setCurrentSrc(src || effectiveFallbacks[0]);
    setFallbackIndex(0);
    setIsLoaded(false);
    setHasError(false);
  }, [src, effectiveFallbacks]);

  const handleError = () => {
    if (fallbackIndex < effectiveFallbacks.length) {
      setCurrentSrc(effectiveFallbacks[fallbackIndex]);
      setFallbackIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-white/5 flex items-center justify-center rounded-xl ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}
      
      {hasError ? (
        <div className="flex flex-col items-center justify-center text-white/20 p-4">
          <ImageOff size={32} className="mb-2 opacity-50" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-center">Image<br/>Unavailable</span>
        </div>
      ) : (
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-500 rounded-lg"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}

