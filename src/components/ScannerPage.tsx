import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scan, Camera, Laptop, HelpCircle, Loader2, ArrowRight, 
  Trash2, RefreshCw, Smartphone, TrendingUp, AlertCircle, 
  Bell, Check, ChevronRight, ShieldAlert, Award, FileUp, Keyboard, ExternalLink, Sparkles
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { scanBarcode, fetchBarcodeHistory } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

interface CompetitorDeal {
  source: string;
  price: string;
  old_price: string | null;
  link: string;
  rating: number;
  delivery: string;
  isCheapest?: boolean;
}

interface ScanResult {
  productName: string;
  brand: string;
  category: string;
  barcode: string;
  thumbnail: string;
  description: string;
  lowestPrice: number;
  highestPrice: number;
  discountPercent: number;
  bestSellerStore: string;
  deliveryEstimate: string;
  availability: boolean;
  shopping_results: CompetitorDeal[];
  recommendation: string;
  priceHistory: { date: string; price: number }[];
  lowestPriceEver: number;
  highestPriceEver: number;
}

interface OfflineScan {
  barcode: string;
  format: string;
  timestamp: string;
}

const DEMO_PRODUCTS = [
  { name: "Sony WH-1000XM5 Headphones", code: "8901058002418", type: "EAN_13", desc: "Premium Noise Cancelling ANC" },
  { name: "Apple iPhone 15 Pro", code: "194253388741", type: "UPC_A", desc: "Flagship Titanium iOS Smartphone" },
  { name: "Bose QuietComfort Ultra", code: "017817847774", type: "UPC_A", desc: "Sleek Over-Ear Audio" },
  { name: "Nike Air Max 270", code: "191887265842", type: "UPC_A", desc: "Futuristic Athletic Sneaker" },
  { name: "Stanley Quencher H2.0", code: "843468165241", type: "UPC_A", desc: "Double-wall Vacuum Tumbler" }
];

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  
  // Scanned details state
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  
  // Price alert settings
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [isAlertSet, setIsAlertSet] = useState(false);
  
  // Offline & Queuing state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<OfflineScan[]>([]);
  const [coinsReward, setCoinsReward] = useState<number | null>(null);

  const qrCodeId = "scanner-reader-view";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state with network
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored! Syncing scan logs...");
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Offline Mode Activated. Scans will be queued locally.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load local queue
    const savedQueue = localStorage.getItem('buywise_offline_scans');
    if (savedQueue) {
      setOfflineQueue(JSON.parse(savedQueue));
    }

    // Fetch historical scans from database
    loadHistory();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopCamera();
    };
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchBarcodeHistory();
      setScanHistory(data || []);
    } catch (e) {
      console.error("Failed to load historical scans", e);
    }
  };

  const saveOfflineQueue = (newQueue: OfflineScan[]) => {
    setOfflineQueue(newQueue);
    localStorage.setItem('buywise_offline_scans', JSON.stringify(newQueue));
  };

  const syncOfflineQueue = async () => {
    const savedQueue = localStorage.getItem('buywise_offline_scans');
    if (!savedQueue) return;
    const queue: OfflineScan[] = JSON.parse(savedQueue);
    if (queue.length === 0) return;

    toast.loading(`Syncing ${queue.length} offline scans...`, { id: 'offline-sync' });
    let successCount = 0;

    for (const item of queue) {
      try {
        await scanBarcode(item.barcode, item.format);
        successCount++;
      } catch (err) {
        console.error("Sync error for", item.barcode, err);
      }
    }

    localStorage.setItem('buywise_offline_scans', '[]');
    setOfflineQueue([]);
    toast.success(`Uplink complete! Synced ${successCount} scans. Earned +${successCount * 2} BuyWise Coins! 🪙`, { 
      id: 'offline-sync',
      duration: 5000 
    });
    loadHistory();
  };

  // Start Camera QR/Barcode Scanning
  const startCamera = async () => {
    setIsScanning(true);
    setScannerError(null);
    setCameraPermission(null);
    
    // Tiny delay to ensure DOM element is mounted before starting scanner
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode(qrCodeId);
        html5QrCodeRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.75;
              return { width: size, height: size * 0.45 }; // Wide rectangular target box suited for barcodes
            },
            aspectRatio: 1.777778
          },
          (decodedText, decodedResult) => {
            // Success callback
            const format = decodedResult?.result?.format?.formatName || "BARCODE";
            handleBarcodeFound(decodedText, format);
            stopCamera();
          },
          (errorMessage) => {
            // Keep scanning, don't spam errors
          }
        );
        setCameraPermission(true);
      } catch (err: any) {
        console.error("Camera Init Error:", err);
        setCameraPermission(false);
        setScannerError(err?.message || "Failed to access system camera. Verify system settings.");
        setIsScanning(false);
      }
    }, 150);
  };

  // Stop Camera Streaming
  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Stop camera error:", err);
      }
    }
    setIsScanning(false);
  };

  // Process newly decoded barcode text
  const handleBarcodeFound = async (barcodeText: string, format: string = "EAN_13") => {
    const trimmed = barcodeText.trim();
    if (!trimmed) return;

    if (!navigator.onLine) {
      // Offline: Add to queue
      const alreadyQueued = offlineQueue.some(item => item.barcode === trimmed);
      if (!alreadyQueued) {
        const updated = [...offlineQueue, { barcode: trimmed, format, timestamp: new Date().toISOString() }];
        saveOfflineQueue(updated);
        toast.success(`Offline! Barcode ${trimmed} queued locally. Will search on network reconnection! 📶`, { duration: 5000 });
      } else {
        toast.error("Product already registered in offline queue.");
      }
      return;
    }

    // Online: Call Server API
    setLoading(true);
    setScanResult(null);
    setIsAlertSet(false);

    try {
      const response = await scanBarcode(trimmed, format);
      if (response.success && response.data) {
        setScanResult(response.data);
        setTargetPrice(Math.round(response.data.lowestPrice * 0.95)); // Default alert to 5% below lowest price
        if (response.coinsAwarded) {
          setCoinsReward(response.coinsAwarded);
          // Auto clear reward pop after 4s
          setTimeout(() => setCoinsReward(null), 4000);
        }
        loadHistory();
      } else {
        toast.error("Failed to parse barcode data. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Price retrieval network failure.");
    } finally {
      setLoading(false);
    }
  };

  // File Upload Barcode Scan Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const html5QrCode = new Html5Qrcode("scanner-file-hidden");
      const decodedText = await html5QrCode.scanFile(file, true);
      handleBarcodeFound(decodedText, "IMAGE_FILE");
    } catch (err: any) {
      console.error("File Decode Error:", err);
      toast.error("No clear barcode identified in the uploaded image. Ensure good lighting and high resolution.");
    } finally {
      setLoading(false);
    }
  };

  const setupPriceAlert = () => {
    if (!scanResult) return;
    setIsAlertSet(true);
    toast.success(`Alert Configured! We will notify you instantly when ${scanResult.productName} falls below ₹${targetPrice.toLocaleString()}!`, {
      icon: "🔔"
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto relative overflow-hidden bg-transparent">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF3B30]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-red-900/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Reward Overlay Notification */}
      <AnimatePresence>
        {coinsReward && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-[#111111] border border-brand/50 rounded-2xl p-6 shadow-2xl flex items-center gap-4 max-w-sm"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center animate-bounce text-amber-400">
              <Award size={24} className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider">REWARD GRANTED!</h4>
              <p className="text-white/60 text-xs">+{coinsReward} BuyWise Coins credited directly to your digital profile. 🪙</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-[#FF3B30] font-mono text-xs uppercase tracking-[0.4em] font-black">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] animate-ping" />
              SATELLITE SCAN CORE
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight uppercase flex items-center gap-3">
              SMART BARCODE SCANNER
            </h1>
            <p className="text-white/40 text-sm mt-2 max-w-2xl">
              Decode barcodes instantly via high-speed scanning to search top Indian online shopping websites (Amazon, Flipkart, Croma, etc.) for live price arbitrage.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <span className="text-white/40 text-xs tracking-wider font-bold uppercase font-mono">STATUS:</span>
            {isOnline ? (
              <span className="text-emerald-400 font-mono text-xs font-black uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE COMM
              </span>
            ) : (
              <span className="text-[#FF3B30] font-mono text-xs font-black uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-ping" />
                OFFLINE (QUEUING ENABLED)
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Primary Scanning Console & Offline Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        
        {/* Left Col: Camera & Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Scanner Card */}
          <div className="terminal-card bg-black/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3B30]/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h3 className="text-lg font-black text-white font-display tracking-wide uppercase flex items-center gap-3">
                <Camera size={20} className="text-[#FF3B30]" />
                VIDEO INTERCEPT SCREEN
              </h3>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-2 transition-all flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider"
                  title="Upload from Image"
                >
                  <FileUp size={16} />
                  <span>UPLOAD IMAGE</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Scanning Element Viewport */}
            <div className="relative aspect-video w-full max-w-2xl mx-auto bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
              
              {isScanning ? (
                <>
                  {/* HTML5 QR Container */}
                  <div id={qrCodeId} className="w-full h-full object-cover" />
                  
                  {/* Futuristic Overlay Elements */}
                  <div className="absolute inset-0 border-2 border-[#FF3B30]/30 pointer-events-none rounded-xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[35%] border-2 border-dashed border-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.3)] rounded pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] tracking-widest text-[#FF3B30] bg-black/80 px-2.5 py-1 font-mono uppercase font-black">ALIGN_BARCODE_HERE</span>
                  </div>
                  
                  {/* Neon Red Moving Scanline */}
                  <div className="absolute left-0 right-0 h-0.5 bg-[#FF3B30] shadow-[0_0_8px_#FF3B30] animate-bounce pointer-events-none" style={{ animationDuration: '3.5s' }} />
                  
                  <div className="absolute top-4 left-4 bg-black/80 border border-white/10 rounded px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#FF3B30] animate-pulse">
                    RECEIVING_LIVE_FEED_
                  </div>
                </>
              ) : (
                <div className="text-center p-8 flex flex-col items-center max-w-md">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-6">
                    <Scan size={32} />
                  </div>
                  
                  <h4 className="text-white font-black tracking-wide text-lg uppercase mb-2">CAMERA OFFLINE</h4>
                  <p className="text-white/40 text-xs mb-6 leading-relaxed">
                    Uplink your device camera feed to execute real-time barcode scanning. Supports standard consumer products (EAN, UPC, ISBN, QR codes).
                  </p>
                  
                  <button 
                    onClick={startCamera}
                    disabled={loading}
                    className="btn-brutalist !py-3.5 !px-8 text-xs font-black tracking-widest flex items-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Camera size={16} />}
                    ACTIVATE INTERCEPT
                  </button>
                </div>
              )}
            </div>

            {/* Quick manual barcode fallback in Scanner reader UI for image decoding */}
            <div id="scanner-file-hidden" className="hidden" />

            {/* Camera Controls & Status */}
            {isScanning && (
              <div className="mt-6 flex justify-center gap-4">
                <button 
                  onClick={stopCamera}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-500 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-black transition-all flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  ABORT CAMERA FEED
                </button>
              </div>
            )}
          </div>

          {/* Keyboard input fallbacks for non-camera or testing scenarios */}
          <div className="terminal-card bg-black/60 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-sm font-black text-white font-display tracking-widest uppercase mb-4 flex items-center gap-2 text-white/70">
              <Keyboard size={16} className="text-[#FF3B30]" />
              MANUAL INTERCEPT OVERRIDE
            </h3>
            
            <div className="flex gap-4">
              <input 
                type="text"
                placeholder="INPUT BARCODE NUMBER (E.G. 8901058002418)"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value.replace(/\D/g, ''))}
                onKeyPress={(e) => e.key === 'Enter' && manualBarcode && handleBarcodeFound(manualBarcode, "MANUAL")}
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono text-sm tracking-wider focus:border-brand focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
              />
              <button
                onClick={() => manualBarcode && handleBarcodeFound(manualBarcode, "MANUAL")}
                disabled={loading || !manualBarcode}
                className="bg-white hover:bg-[#FF3B30] text-black hover:text-white font-mono font-black uppercase text-xs tracking-wider px-6 rounded-xl transition-all flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight size={16} />}
                PROBE
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Demo sandbox & Offline Queues */}
        <div className="space-y-6">
          
          {/* Interactive Demo Sandbox */}
          <div className="terminal-card bg-black/60 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-sm font-black text-white font-display tracking-widest uppercase mb-4 flex items-center gap-2 text-[#FF3B30]">
              <Sparkles size={16} />
              SCAN SIMULATION DECK
            </h3>
            <p className="text-white/40 text-[11px] uppercase tracking-wider font-mono mb-4">
              Don't have a physical package nearby? Select an emulator seed product to mock high-fidelity barcode decoding:
            </p>
            
            <div className="space-y-2.5">
              {DEMO_PRODUCTS.map((demo) => (
                <button
                  key={demo.code}
                  onClick={() => handleBarcodeFound(demo.code, demo.type)}
                  disabled={loading}
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3.5 transition-all flex justify-between items-center group"
                >
                  <div>
                    <h4 className="text-white font-black text-xs group-hover:text-[#FF3B30] transition-colors">{demo.name}</h4>
                    <p className="text-white/40 text-[9px] uppercase tracking-wider font-mono mt-1">
                      {demo.type}: <span className="text-white/70 font-bold">{demo.code}</span>
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-[#FF3B30] transform group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Local Offline Queued Scans */}
          {offlineQueue.length > 0 && (
            <div className="terminal-card bg-[#FF3B30]/5 border border-[#FF3B30]/30 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-white font-mono tracking-widest uppercase flex items-center gap-2">
                  <ShieldAlert size={16} className="text-[#FF3B30] animate-pulse" />
                  OFFLINE QUEUE ({offlineQueue.length})
                </h3>
                <button 
                  onClick={() => {
                    saveOfflineQueue([]);
                    toast.success("Offline queue cleared.");
                  }}
                  className="text-white/40 hover:text-[#FF3B30] text-[9px] font-mono uppercase tracking-wider"
                >
                  CLEAR ALL
                </button>
              </div>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto mb-4 pr-1">
                {offlineQueue.map((item, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-[10px] font-mono">
                    <div>
                      <div className="text-white font-bold">{item.barcode}</div>
                      <div className="text-white/30 text-[8px] uppercase mt-0.5">{item.format} • {new Date(item.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <span className="text-[#FF3B30] text-[9px] uppercase font-bold tracking-wider animate-pulse">PENDING SYNC</span>
                  </div>
                ))}
              </div>

              <button
                onClick={syncOfflineQueue}
                disabled={!isOnline}
                className="w-full bg-white text-black hover:bg-[#FF3B30] hover:text-white py-3 rounded-xl font-mono text-xs uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2 disabled:opacity-45 disabled:hover:bg-white disabled:hover:text-black"
              >
                <RefreshCw size={14} className="animate-spin" />
                SYNC ONLINE CHANNELS
              </button>
            </div>
          )}

          {/* User's Historic Scans Panel */}
          <div className="terminal-card bg-black/60 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-sm font-black text-white font-display tracking-widest uppercase mb-4 flex items-center gap-2 text-white/70">
              <TrendingUp size={16} />
              HISTORIC DEPLOYMENTS
            </h3>
            
            {scanHistory.length === 0 ? (
              <div className="text-center py-6 text-white/20 font-mono text-[10px] uppercase tracking-wider">
                No telemetry history registered.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {scanHistory.slice(0, 10).map((hist, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleBarcodeFound(hist.barcode, "HISTORY")}
                    disabled={loading}
                    className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 text-xs font-mono font-black uppercase">
                      {idx + 1}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-white font-bold text-xs truncate group-hover:text-brand transition-colors">{hist.productName}</h4>
                      <p className="text-white/40 text-[9px] uppercase font-mono tracking-wider mt-0.5">
                        {hist.barcode} • <span className="text-[#FF3B30]">₹{hist.lowestPrice?.toLocaleString() || 'N/A'}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Processing Loader */}
      {loading && (
        <div className="min-h-[400px] flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#FF3B30] w-12 h-12 mb-6" />
          <h3 className="text-lg font-black text-white font-display tracking-widest uppercase animate-pulse">EXTRACTING METRICS VIA GEMINI AI...</h3>
          <p className="text-white/40 text-xs mt-2 uppercase tracking-widest font-mono">Querying Indian Online Marketplaces in Real-time</p>
        </div>
      )}

      {/* Target Scanning Output Visualizer (Full bento-style analysis) */}
      <AnimatePresence>
        {scanResult && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8"
          >
            {/* Bento Grid Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Card 1: Identified Product Profile */}
              <div className="lg:col-span-1 terminal-card bg-black/60 border border-white/10 p-6 md:p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#FF3B30]/10 px-4 py-1.5 font-mono text-[9px] uppercase tracking-wider text-[#FF3B30] rounded-bl-xl font-black">
                  DECODED BARCODE: {scanResult.barcode}
                </div>
                
                <div>
                  <div className="aspect-square w-full max-w-[200px] mx-auto bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6 flex items-center justify-center p-4 relative group">
                    <img 
                      src={scanResult.thumbnail || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500"} 
                      alt={scanResult.productName}
                      className="object-contain w-full h-full transform group-hover:scale-105 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="text-white/40 font-mono text-xs uppercase tracking-widest mb-1.5 font-bold">
                    {scanResult.brand} • {scanResult.category}
                  </div>
                  <h2 className="text-2xl font-black text-white font-display tracking-tight uppercase leading-tight mb-3">
                    {scanResult.productName}
                  </h2>
                  <p className="text-white/50 text-xs leading-relaxed mb-6">
                    {scanResult.description}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs font-mono uppercase tracking-wider">LIVE MARKET SPREAD:</span>
                    <span className="text-white font-mono font-black text-sm">
                      ₹{scanResult.lowestPrice.toLocaleString()} - ₹{scanResult.highestPrice.toLocaleString()}
                    </span>
                  </div>
                  {scanResult.discountPercent > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/40 text-xs font-mono uppercase tracking-wider">ESTIMATED DISCOUNT:</span>
                      <span className="text-emerald-400 font-mono font-black text-sm uppercase">
                        {scanResult.discountPercent}% OFF
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs font-mono uppercase tracking-wider">AVAILABILITY:</span>
                    <span className="text-emerald-400 font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      INSTANT DISPATCH
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Competitor Pricing Intercept Grid */}
              <div className="lg:col-span-2 terminal-card bg-black/60 border border-white/10 p-6 md:p-8 rounded-2xl">
                <h3 className="text-lg font-black text-white font-display tracking-wide uppercase mb-6 flex items-center gap-3">
                  <Scan size={20} className="text-[#FF3B30]" />
                  ONLINE COMPETITOR ANALYSIS
                </h3>
                
                <div className="space-y-3">
                  {scanResult.shopping_results.map((deal, idx) => (
                    <div 
                      key={idx} 
                      className={`relative flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border transition-all ${
                        idx === 0 
                          ? 'bg-[#FF3B30]/5 border-[#FF3B30]/30 shadow-[0_0_15px_rgba(255,59,48,0.08)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      {idx === 0 && (
                        <div className="absolute -top-2.5 left-4 bg-[#FF3B30] text-white px-2.5 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase font-black">
                          CHEAPEST IDENTIFIED SOURCE
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono font-black text-xs text-white">
                          {deal.source.substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-white font-black text-sm uppercase tracking-wide">{deal.source}</h4>
                          <p className="text-white/40 text-[10px] uppercase font-mono tracking-wider mt-0.5">
                            ★ {deal.rating || '4.2'} • {deal.delivery || 'Standard Delivery'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-white font-mono font-black text-lg">{deal.price}</span>
                          {deal.old_price && (
                            <span className="block text-white/30 font-mono text-xs line-through mt-0.5">{deal.old_price}</span>
                          )}
                        </div>
                        <a 
                          href={deal.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-5 py-2.5 rounded-lg font-mono text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                            idx === 0
                              ? 'bg-[#FF3B30] text-white hover:bg-white hover:text-black'
                              : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                          }`}
                        >
                          BUY_NOW
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Price Alert Configurator & Recharts Historical Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Card 3: Interactive Recharts Historical Trend */}
              <div className="lg:col-span-2 terminal-card bg-black/60 border border-white/10 p-6 md:p-8 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-white font-display tracking-wide uppercase flex items-center gap-3">
                      <TrendingUp size={20} className="text-[#FF3B30]" />
                      PRICE TRACK TELEMETRY
                    </h3>
                    <p className="text-white/40 text-[11px] font-mono uppercase tracking-wider mt-0.5">Historical pricing curve for the last 180 cycles</p>
                  </div>
                  
                  <div className="flex gap-4 text-xs font-mono">
                    <div>
                      <span className="text-white/40 uppercase block text-[9px] tracking-wider">ALL-TIME LOW:</span>
                      <span className="text-emerald-400 font-bold">₹{scanResult.lowestPriceEver.toLocaleString()}</span>
                    </div>
                    <div className="border-l border-white/10 pl-4">
                      <span className="text-white/40 uppercase block text-[9px] tracking-wider">ALL-TIME HIGH:</span>
                      <span className="text-white/80 font-bold">₹{scanResult.highestPriceEver.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Area Chart */}
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={scanResult.priceHistory}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="date" 
                        stroke="rgba(255,255,255,0.3)" 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.3)" 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111111', 
                          borderColor: 'rgba(255,255,255,0.1)', 
                          borderRadius: '8px',
                          color: '#fff',
                          fontFamily: 'monospace'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#FF3B30" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 4: Price Drop Alert Setter */}
              <div className="lg:col-span-1 terminal-card bg-black/60 border border-white/10 p-6 md:p-8 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-white font-display tracking-wide uppercase mb-3 flex items-center gap-3">
                    <Bell size={20} className="text-[#FF3B30]" />
                    PRICE RADAR LOCK
                  </h3>
                  <p className="text-white/40 text-xs leading-relaxed mb-6">
                    Configure a laser-precise price radar lock. BuyWise will track competitor pricing hourly and dispatch push notifications the second it hits your target threshhold.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-white/40 text-[10px] font-mono uppercase tracking-wider block mb-2">TARGET PROBE PRICE (INR):</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-mono text-sm">₹</span>
                        <input 
                          type="number"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-sm tracking-wider focus:border-brand focus:bg-white/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between text-[11px] font-mono">
                      <span className="text-white/40 uppercase">CURRENT LOWEST:</span>
                      <span className="text-[#FF3B30] font-bold">₹{scanResult.lowestPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {isAlertSet ? (
                    <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-3.5 rounded-xl font-mono text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2">
                      <Check size={16} />
                      RADAR LOCK ACTIVE
                    </div>
                  ) : (
                    <button 
                      onClick={setupPriceAlert}
                      className="w-full btn-brutalist !py-3.5 text-xs font-black tracking-widest flex items-center justify-center gap-2"
                    >
                      <Bell size={14} />
                      LOCK TARGET VALUE
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Card 5: AI Market Recommendation Terminal */}
            <div className="terminal-card bg-[#111111]/80 border-2 border-brand/20 p-6 md:p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF3B30]/5 blur-[70px] rounded-full pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#FF3B30]/5 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-3.5 mb-4 border-b border-white/5 pb-4">
                <div className="w-8 h-8 rounded-lg bg-[#FF3B30]/10 border border-[#FF3B30]/40 flex items-center justify-center text-[#FF3B30]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white font-display tracking-widest uppercase">COGNITIVE RECOMMENDATION TERMINAL</h3>
                  <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider mt-0.5">Synthesized by Gemini-3.5-Flash Grounded Core</p>
                </div>
              </div>

              <div className="text-white/80 font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap pl-1">
                {scanResult.recommendation}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
