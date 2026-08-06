import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { getFallbackPhotoList, getProductCategoryPhoto } from '../lib/productImages';

interface PremiumProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackImages?: string[];
}

function getSvgFallback(altText: string): string {
  const cleanAlt = (altText || 'Product').replace(/[<>&"]/g, '').substring(0, 28);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" rx="32" fill="#121212"/>
    <circle cx="200" cy="180" r="80" fill="#FF3B30" fill-opacity="0.08" stroke="#FF3B30" stroke-width="2" stroke-dasharray="6 6"/>
    <path d="M160 180H240M200 140V220" stroke="#FF3B30" stroke-width="3" stroke-linecap="round"/>
    <text x="200" y="295" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800">${cleanAlt}</text>
    <text x="200" y="322" text-anchor="middle" fill="#FF3B30" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" letter-spacing="3">BUYWISE VERIFIED</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function PremiumProductImage({ src, alt, className = "", fallbackImages = [] }: PremiumProductImageProps) {
  const [candidateList, setCandidateList] = useState<string[]>([]);
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const fallbackKey = fallbackImages?.join(',') || '';

  useEffect(() => {
    const list: string[] = [];
    const cleanSrc = (src || '').trim();

    if (cleanSrc.startsWith('http') || cleanSrc.startsWith('data:')) {
      list.push(cleanSrc);
      if (cleanSrc.startsWith('http') && !cleanSrc.includes('/api/image-proxy')) {
        list.push(`/api/image-proxy?url=${encodeURIComponent(cleanSrc)}`);
      }
    }

    if (fallbackImages && fallbackImages.length > 0) {
      fallbackImages.forEach(img => {
        if (img && typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    }

    const categoryPhotos = getFallbackPhotoList(alt);
    categoryPhotos.forEach(img => {
      if (img && !list.includes(img)) {
        list.push(img);
      }
    });

    // Always append SVG fallback as ultimate guarantee
    const svgUrl = getSvgFallback(alt);
    if (!list.includes(svgUrl)) {
      list.push(svgUrl);
    }

    setCandidateList(list);
    setCandidateIndex(0);
    setIsLoaded(false);
  }, [src, alt, fallbackKey]);

  const currentUrl = candidateList[candidateIndex] || getProductCategoryPhoto(alt) || getSvgFallback(alt);

  const handleError = () => {
    if (candidateIndex + 1 < candidateList.length) {
      setIsLoaded(false);
      setCandidateIndex(prev => prev + 1);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Immediate check for cached images or data URIs
  useEffect(() => {
    if (currentUrl.startsWith('data:')) {
      setIsLoaded(true);
      return;
    }
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [currentUrl]);

  return (
    <div className={`relative overflow-hidden bg-white/5 flex items-center justify-center rounded-xl ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-white/5 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/20 border-t-[#FF3B30] rounded-full animate-spin" />
        </div>
      )}

      <motion.img
        ref={imgRef}
        key={currentUrl}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
        transition={{ duration: 0.2 }}
        src={currentUrl}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500 rounded-lg"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
