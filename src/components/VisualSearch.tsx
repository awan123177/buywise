import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, X, Loader2, Sparkles, Image as ImageIcon, ScanLine, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function VisualSearch({ variant = 'default' }: { variant?: 'default' | 'nav' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processImage = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image must be smaller than 20MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      setImagePreview(e.target?.result as string);
      setIsAnalyzing(true);
      
      try {
        // Send to backend for Gemini Vision processing
        const res = await fetch('/api/search/visual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: e.target?.result })
        });
        
        if (!res.ok) throw new Error('Analysis failed');
        const data = await res.json();
        
        setIsAnalyzing(false);
        setIsOpen(false);
        setImagePreview(null);
        
        // Navigate to search results with the detected query
        if (data.query) {
           toast.success(`Identified: ${data.query}`);
           navigate(`/?q=${encodeURIComponent(data.query)}`);
        } else {
           toast.error("Could not identify product.");
        }
        
      } catch (err) {
        setIsAnalyzing(false);
        toast.error("Failed to analyze image.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  return (
    <>
      
      {variant === 'default' ? (
        <button
          onClick={() => setIsOpen(true)}
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
                AI Visual Search <Sparkles size={14} className="text-orange-400" />
              </h3>
              <p className="text-white/40 text-[10px] font-mono mt-0.5">Upload. Scan. Save.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 relative z-10">
            <span className="text-[9px] uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded">Try it out</span>
          </div>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          title="AI Visual Search"
          className="w-10 h-10 md:w-12 md:h-12 border border-white/10 rounded-lg flex items-center justify-center bg-white/5 hover:bg-[#FF3B30]/20 hover:text-[#FF3B30] hover:border-[#FF3B30]/50 transition-colors cursor-pointer mr-2 shrink-0 group"
        >
          <Camera size={18} className="text-white/70 group-hover:text-[#FF3B30] transition-colors" />
        </button>
      )}


      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isAnalyzing && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-[#FF3B30]/10 flex items-center justify-center">
                     <ScanLine size={16} className="text-[#FF3B30]" />
                   </div>
                   <h2 className="text-white font-black tracking-widest uppercase text-sm">Visual Search Intelligence</h2>
                 </div>
                 <button onClick={() => !isAnalyzing && setIsOpen(false)} className="text-white/40 hover:text-white p-2">
                   <X size={20} />
                 </button>
              </div>

              <div className="p-8">
                {!imagePreview ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isDragging ? 'border-[#FF3B30] bg-[#FF3B30]/5 scale-[1.02]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    }`}
                  >
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <ImageIcon size={28} className="text-white/40" />
                    </div>
                    <p className="text-white font-black uppercase tracking-widest text-sm mb-2">Drag & Drop Image Here</p>
                    <p className="text-white/30 text-xs font-mono">or click to browse from device</p>
                    <div className="mt-6 flex gap-4">
                      <span className="text-[10px] text-white/20 bg-white/5 px-3 py-1 rounded-full uppercase tracking-wider">JPG, PNG, WEBP</span>
                      <span className="text-[10px] text-white/20 bg-white/5 px-3 py-1 rounded-full uppercase tracking-wider">Max 20MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain opacity-50 mix-blend-screen" />
                    
                    {isAnalyzing && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                         <div className="relative w-24 h-24 mb-6">
                           <div className="absolute inset-0 border-t-2 border-[#FF3B30] rounded-full animate-spin" />
                           <div className="absolute inset-2 border-b-2 border-orange-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                           <ScanLine size={32} className="absolute inset-0 m-auto text-white animate-pulse" />
                         </div>
                         <h3 className="text-white font-black tracking-widest uppercase text-sm mb-2">Analyzing Product...</h3>
                         <div className="flex items-center gap-2 text-white/50 text-[10px] font-mono">
                           <Sparkles size={12} className="text-orange-400" />
                           <span>Identifying Brand, Model & Specs</span>
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
