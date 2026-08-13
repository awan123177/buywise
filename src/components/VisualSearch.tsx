import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Upload, X, Loader2, Sparkles, Image as ImageIcon, 
  ScanLine, Tag, RefreshCw, CheckCircle2, AlertTriangle, 
  Store, ExternalLink, ShoppingBag, ShieldCheck, ArrowRight, Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { enhanceImageForVision } from '../lib/imageEnhancer';
import PremiumProductImage from './PremiumProductImage';

interface VerifiedDeal {
  title: string;
  price: string;
  old_price?: string;
  source: string;
  link: string;
  thumbnail: string;
  delivery?: string;
  coupon?: string;
}

interface AnalysisData {
  query: string;
  productName: string;
  brand: string;
  model: string;
  category: string;
  variant?: string;
  confidence: number;
  deals: VerifiedDeal[];
  cheapestPrice: string;
  bestStore: string;
}

export default function VisualSearch({ variant = 'default' }: { variant?: 'default' | 'nav' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveCamera, setIsLiveCamera] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Pipeline State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState<number>(0);
  const [stageText, setStageText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);

  // Camera Refs & Media Stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  // Handle Live Camera Stream
  const startLiveCamera = async () => {
    setIsLiveCamera(true);
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('[LiveCamera] Permission or hardware error:', err);
      setIsLiveCamera(false);
      toast.error('Unable to access camera stream. Please check browser permissions or upload photo from gallery.');
    }
  };

  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsLiveCamera(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopLiveCamera();
      setImagePreview(null);
      setIsAnalyzing(false);
      setErrorMessage(null);
      setAnalysisResult(null);
    }
  }, [isOpen]);

  // Capture photo snapshot directly from Live Camera stream
  const captureCameraSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    stopLiveCamera();
    processImageDataUrl(capturedDataUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Process and Analyze Image (with image enhancement and pipeline logging)
  const processImageDataUrl = async (rawDataUrl: string) => {
    setImagePreview(rawDataUrl);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    // Stage 1: Quality Enhancement
    setProgressStage(25);
    setStageText('Stage 1/3: Enhancing Photo Contrast & Clarity...');
    
    let enhancedBase64 = rawDataUrl;
    try {
      const enhanced = await enhanceImageForVision(rawDataUrl);
      enhancedBase64 = enhanced.enhancedBase64;
    } catch (e) {
      console.warn('[VisualSearch] Image enhancement fallback to raw:', e);
    }

    // Stage 2: Vision AI Analysis
    setProgressStage(55);
    setStageText('Stage 2/3: Vision AI Identifying Brand, Model & Specs...');

    // Stage 3: Multi-Store Live Search
    const stageTimer = setTimeout(() => {
      setProgressStage(85);
      setStageText('Stage 3/3: Simultaneous Scanning Across 10+ Trusted Indian Stores...');
    }, 1800);

    try {
      const res = await fetch('/api/search/visual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: enhancedBase64 })
      });

      clearTimeout(stageTimer);
      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { success: false, error: `Server returned HTTP ${res.status}` };
      }

      if (!res.ok || !data.success) {
        const detailMsg = data.error || data.details || 'Unable to recognize product in this photo.';
        setErrorMessage(detailMsg);
        setIsAnalyzing(false);
        toast.error(detailMsg);
        return;
      }

      setProgressStage(100);
      setStageText('Analysis Complete!');
      setIsAnalyzing(false);
      setAnalysisResult(data);
      toast.success(`Identified: ${data.productName}`);

    } catch (err: any) {
      clearTimeout(stageTimer);
      setIsAnalyzing(false);
      const errorStr = err?.message || 'Network error during image analysis. Please check connection.';
      setErrorMessage(errorStr);
      toast.error('Analysis failed: ' + errorStr);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) processImageDataUrl(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) processImageDataUrl(ev.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {variant === 'default' ? (
        <button
          onClick={() => { setIsOpen(true); startLiveCamera(); }}
          className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-[#FF3B30]/5 to-transparent border border-[#FF3B30]/20 flex items-center justify-between group hover:border-[#FF3B30]/40 transition-all cursor-pointer overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF3B30] to-orange-500 p-[1px]">
              <div className="w-full h-full bg-[#111] rounded-xl flex items-center justify-center group-hover:bg-[#FF3B30]/10 transition-colors">
                <Camera size={24} className="text-[#FF3B30]" />
              </div>
            </div>
            <div className="text-left">
              <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                Live Store Scanner & AI Visual Search <Sparkles size={14} className="text-orange-400" />
              </h3>
              <p className="text-white/40 text-[10px] font-mono mt-0.5">Scan product in store or upload photo</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 relative z-10">
            <span className="text-[9px] uppercase tracking-widest text-white/70 bg-[#FF3B30]/20 px-3 py-1.5 rounded-full border border-[#FF3B30]/30 font-bold">Live Camera</span>
          </div>
        </button>
      ) : (
        <button
          onClick={() => { setIsOpen(true); startLiveCamera(); }}
          title="Live Camera & Visual Search"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border border-white/10 rounded-lg flex items-center justify-center bg-white/5 hover:bg-[#FF3B30]/20 hover:text-[#FF3B30] hover:border-[#FF3B30]/50 transition-colors cursor-pointer mr-1 sm:mr-2 shrink-0 group relative"
        >
          <Camera size={14} className="sm:w-4 sm:h-4 text-white/70 group-hover:text-[#FF3B30] transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#FF3B30] rounded-full animate-pulse" />
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isAnalyzing && setIsOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/30 flex items-center justify-center">
                    <ScanLine size={18} className="text-[#FF3B30]" />
                  </div>
                  <div>
                    <h2 className="text-white font-black tracking-widest uppercase text-xs sm:text-sm">
                      BuyWise AI Visual Store Scanner
                    </h2>
                    <p className="text-[#FF3B30] text-[10px] font-mono">10+ Trusted Indian Retailers Synchronized</p>
                  </div>
                </div>
                <button 
                  onClick={() => !isAnalyzing && setIsOpen(false)} 
                  className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">

                {/* 1. LIVE CAMERA STREAM MODE */}
                {isLiveCamera && !imagePreview && (
                  <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-black border border-white/10 flex flex-col items-center justify-center">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover" 
                    />
                    
                    {/* Viewfinder Target Frame */}
                    <div className="absolute inset-8 border-2 border-dashed border-[#FF3B30]/70 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                      <div className="flex justify-between text-[#FF3B30] text-[9px] font-mono uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded w-max">
                        Point at product or box
                      </div>
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FF3B30] to-transparent animate-pulse" />
                      <div className="text-right text-[#FF3B30] text-[9px] font-mono uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded w-max self-end">
                        Live Auto-Focus
                      </div>
                    </div>

                    {/* Camera Capture Bar */}
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
                      <button
                        onClick={captureCameraSnapshot}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF3B30] to-orange-500 text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg shadow-[#FF3B30]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Camera size={16} /> Capture & Analyze
                      </button>

                      <button
                        onClick={() => { stopLiveCamera(); fileInputRef.current?.click(); }}
                        className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
                        title="Upload photo from device gallery"
                      >
                        <ImageIcon size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. GALLERY UPLOAD / DRAG & DROP AREA */}
                {!isLiveCamera && !imagePreview && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
                      isDragging ? 'border-[#FF3B30] bg-[#FF3B30]/5 scale-[1.01]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3 text-white/40">
                      <ImageIcon size={26} />
                    </div>
                    <p className="text-white font-black uppercase tracking-widest text-xs mb-1">Drag & Drop Product Photo</p>
                    <p className="text-white/40 text-[11px] font-mono mb-4">or select from device gallery</p>

                    <div className="flex gap-3">
                      <button
                        onClick={startLiveCamera}
                        className="px-4 py-2 rounded-xl bg-[#FF3B30]/20 border border-[#FF3B30]/40 text-[#FF3B30] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-[#FF3B30]/30 transition-all cursor-pointer"
                      >
                        <Video size={14} /> Open Live Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-white/20 transition-all cursor-pointer"
                      >
                        <Upload size={14} /> Browse Photo
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. CAPTURED / UPLOADED PHOTO & ANALYSIS PROGRESS */}
                {imagePreview && (
                  <div className="space-y-4">
                    <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10">
                      <img src={imagePreview} alt="Product Captured" className="max-w-full max-h-full object-contain" />

                      {/* Analyzing Overlay with Stage Progress Bar */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
                          <div className="relative w-20 h-20 mb-4">
                            <div className="absolute inset-0 border-t-2 border-[#FF3B30] rounded-full animate-spin" />
                            <div className="absolute inset-2 border-b-2 border-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }} />
                            <ScanLine size={28} className="absolute inset-0 m-auto text-white animate-pulse" />
                          </div>

                          <p className="text-white font-black uppercase tracking-widest text-xs mb-2">
                            {stageText || 'Analyzing Product...'}
                          </p>

                          {/* Progress Indicator Bar */}
                          <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-[#FF3B30] to-orange-500" 
                              initial={{ width: '10%' }}
                              animate={{ width: `${progressStage}%` }}
                              transition={{ duration: 0.4 }}
                            />
                          </div>

                          <span className="text-white/40 text-[10px] font-mono">Target Response: &lt; 3s</span>
                        </div>
                      )}
                    </div>

                    {/* Action Bar when preview exists */}
                    {!isAnalyzing && (
                      <div className="flex justify-between items-center text-xs">
                        <button
                          onClick={() => { setImagePreview(null); setAnalysisResult(null); setErrorMessage(null); startLiveCamera(); }}
                          className="text-white/60 hover:text-white flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider"
                        >
                          <RefreshCw size={12} /> Retake Photo
                        </button>

                        <button
                          onClick={() => processImageDataUrl(imagePreview)}
                          className="px-4 py-2 rounded-xl bg-[#FF3B30] text-white font-bold uppercase text-xs tracking-wider flex items-center gap-2 hover:bg-[#FF3B30]/90 transition-all cursor-pointer"
                        >
                          <Sparkles size={14} /> Re-analyze
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. MEANINGFUL ERROR MESSAGE DISPLAY */}
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs space-y-2">
                    <div className="flex items-start gap-2.5 font-bold">
                      <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-100 uppercase tracking-wider text-[11px]">Analysis Error</p>
                        <p className="text-red-300 font-normal mt-0.5">{errorMessage}</p>
                      </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                      <button
                        onClick={() => { setErrorMessage(null); startLiveCamera(); }}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-100 text-[10px] uppercase font-bold tracking-wider"
                      >
                        Recapture with Camera
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. ANALYSIS RESULTS & LIVE STORE COMPARISON */}
                {analysisResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Detected Product Summary Header */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Identified ({analysisResult.confidence}% Confidence)
                        </span>
                        <span className="text-[10px] font-mono text-white/40 uppercase">Category: {analysisResult.category}</span>
                      </div>

                      <h3 className="text-white font-black text-base sm:text-lg tracking-tight">
                        {analysisResult.productName}
                      </h3>

                      <div className="flex flex-wrap gap-2 text-[11px] font-mono text-white/60 pt-1">
                        <span className="bg-white/5 px-2 py-0.5 rounded">Brand: <strong className="text-white">{analysisResult.brand}</strong></span>
                        <span className="bg-white/5 px-2 py-0.5 rounded">Model: <strong className="text-white">{analysisResult.model}</strong></span>
                        {analysisResult.variant && <span className="bg-white/5 px-2 py-0.5 rounded">Variant: <strong className="text-white">{analysisResult.variant}</strong></span>}
                      </div>
                    </div>

                    {/* Simultaneous Store Price Comparison */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono text-white/60 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 text-white font-bold">
                          <Store size={14} className="text-[#FF3B30]" /> Live Store Comparison
                        </span>
                        <span className="text-[#FF3B30]">Cheapest: {analysisResult.cheapestPrice}</span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {analysisResult.deals.map((deal, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                              idx === 0 
                                ? 'bg-gradient-to-r from-[#FF3B30]/10 via-orange-500/5 to-transparent border-[#FF3B30]/40' 
                                : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <PremiumProductImage 
                                src={deal.thumbnail} 
                                alt={deal.title} 
                                className="w-12 h-12 rounded-lg shrink-0" 
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-xs">{deal.source}</span>
                                  {idx === 0 && (
                                    <span className="text-[9px] bg-[#FF3B30] text-white font-black uppercase tracking-widest px-1.5 py-0.5 rounded">
                                      Best Price
                                    </span>
                                  )}
                                </div>
                                <p className="text-white/40 text-[10px] line-clamp-1">{deal.delivery || 'Free Express Delivery'}</p>
                              </div>
                            </div>

                            <div className="text-right flex items-center gap-3">
                              <div>
                                <span className="text-white font-black text-sm block">{deal.price}</span>
                                {deal.old_price && <span className="text-white/30 text-[10px] line-through block">{deal.old_price}</span>}
                              </div>

                              <a
                                href={deal.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#FF3B30] hover:text-white text-white/80 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                Buy <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* View Full Search Results Option */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/?q=${encodeURIComponent(analysisResult.query)}`);
                        }}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF3B30] to-orange-500 text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#FF3B30]/20 hover:opacity-95 transition-all cursor-pointer"
                      >
                        View Comprehensive Price Matrix & Analytics <ArrowRight size={16} />
                      </button>
                    </div>

                  </motion.div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
