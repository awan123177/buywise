import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download, Smartphone, ShieldCheck, CheckCircle2, ArrowRight, Copy, Check, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

export default function DownloadPage() {
  const [apkInfo, setApkInfo] = useState<{
    versionName: string;
    versionCode: string;
    packageName: string;
    fileSizeFormatted: string;
    uploadedAt: string;
    publicUrl: string;
  }>({
    versionName: '1.0.0',
    versionCode: '100',
    packageName: 'store.buywise.app',
    fileSizeFormatted: '46.0 MB',
    uploadedAt: new Date().toISOString(),
    publicUrl: 'https://buywiser.store/downloads/buywise.apk'
  });

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/apk/current')
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.activeApk) {
          setApkInfo(data.activeApk);
        }
      })
      .catch((err) => console.error('Error fetching current APK info:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('https://buywiser.store/downloads/buywise.apk');
    setCopied(true);
    toast.success('Direct APK URL copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(apkInfo.uploadedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const downloadUrl = '/downloads/buywise.apk';

  return (
    <div className="min-h-screen bg-black/90 text-white pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/30 text-[#FF3B30] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={16} /> Official Android App
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase text-white">
            Download <span className="text-[#FF3B30]">BuyWise</span>
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto">
            Get the official BuyWise Android application for real-time price comparisons, flash deals, and instant savings.
          </p>
        </motion.div>

        {/* Main Download Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF3B30]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* App Branding & Specs */}
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF3B30] to-orange-600 rounded-2xl p-0.5 shadow-2xl shadow-[#FF3B30]/20 flex items-center justify-center text-white font-black text-3xl">
                  BW
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">BuyWise</h2>
                  <p className="text-white/40 text-sm font-medium">Official Android Application</p>
                  <p className="text-xs text-[#FF3B30] font-mono mt-1">Package: {apkInfo.packageName}</p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
                <div>
                  <span className="block text-[10px] text-white/40 uppercase font-bold">Version</span>
                  <span className="text-base font-black text-white">{apkInfo.versionName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase font-bold">File Size</span>
                  <span className="text-base font-black text-white">{apkInfo.fileSizeFormatted}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/40 uppercase font-bold">Updated</span>
                  <span className="text-base font-black text-white">{formattedDate}</span>
                </div>
              </div>

              {/* Big Download Button */}
              <div className="space-y-3 pt-2">
                <a
                  href={downloadUrl}
                  download="buywise.apk"
                  className="w-full py-5 px-8 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-black text-lg uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#FF3B30]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Download size={24} className="animate-bounce" />
                  DOWNLOAD APK
                </a>

                <div className="flex items-center justify-between text-xs text-white/50 px-2">
                  <span>Direct URL: <code className="text-white/80 font-mono">https://buywiser.store/downloads/buywise.apk</code></span>
                  <button 
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1 text-[#FF3B30] hover:underline font-bold uppercase"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center p-6 bg-black/60 border border-white/10 rounded-2xl text-center space-y-4">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <QRCode value="https://buywiser.store/download" size={140} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-white">Scan to Download</p>
                <p className="text-[11px] text-white/40 mt-1">Point your phone camera to open download page</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Installation Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Smartphone size={24} className="text-[#FF3B30]" />
            <h3 className="text-xl font-black uppercase tracking-tight text-white">How to Install BuyWise</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: '1', title: 'Tap Download', desc: 'Click the Download APK button above.' },
              { step: '2', title: 'Open File', desc: 'Open the downloaded buywise.apk file.' },
              { step: '3', title: 'Allow Source', desc: 'If asked, enable install from unknown sources.' },
              { step: '4', title: 'Tap Install', desc: 'Confirm installation on your device.' },
              { step: '5', title: 'Open BuyWise', desc: 'Launch BuyWise and start saving!' }
            ].map((item) => (
              <div key={item.step} className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-2 relative">
                <span className="w-8 h-8 rounded-full bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/40 flex items-center justify-center font-black text-sm">
                  {item.step}
                </span>
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-xs text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Security Banner */}
          <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-[#FF3B30] font-bold uppercase tracking-wider">
            <ShieldCheck size={20} className="shrink-0" />
            <span>Only download BuyWise from buywiser.store. Protect your device against unverified downloads.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
