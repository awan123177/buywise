import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ExternalLink, Sparkles } from "lucide-react";

interface AffiliateContextType {
  triggerRedirect: (params: {
    url: string;
    store: string;
    productId?: string;
    productTitle?: string;
    category?: string;
  }) => Promise<void>;
  isRedirecting: boolean;
  redirectStore: string;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

export function useAffiliate() {
  const context = useContext(AffiliateContext);
  if (!context) {
    throw new Error("useAffiliate must be used within an AffiliateProvider");
  }
  return context;
}

export function AffiliateProvider({ children }: { children: React.ReactNode }) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectStore, setRedirectStore] = useState("");
  const [progress, setProgress] = useState(0);

  const triggerRedirect = async ({
    url,
    store,
    productId,
    productTitle,
    category,
  }: {
    url: string;
    store: string;
    productId?: string;
    productTitle?: string;
    category?: string;
  }) => {
    setRedirectStore(store);
    setIsRedirecting(true);
    setProgress(0);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      // Call secure backend to log click & generate affiliate link
      const response = await fetch("/api/affiliate/click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store,
          productId,
          productTitle,
          category,
          url,
        }),
      });

      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);

      let finalUrl = data.affiliateUrl || url;

      // Ensure Amazon tag is always applied consistently via the context provider as a secure fallback
      if (store.toLowerCase() === "amazon" || finalUrl.includes("amazon.in") || finalUrl.includes("amazon.com")) {
        const amzTag = "buywiseind0f8-21";
        try {
          const u = new URL(finalUrl);
          if (!u.searchParams.has("tag")) {
            u.searchParams.set("tag", amzTag);
            finalUrl = u.toString();
          } else if (u.searchParams.get("tag") !== amzTag) {
            u.searchParams.set("tag", amzTag);
            finalUrl = u.toString();
          }
        } catch {
          if (!finalUrl.includes("tag=")) {
            const separator = finalUrl.includes("?") ? "&" : "?";
            finalUrl = `${finalUrl}${separator}tag=${amzTag}`;
          }
        }
      }

      // Small delay for loading finish feel
      setTimeout(() => {
        setIsRedirecting(false);
        window.open(finalUrl, "_blank", "noopener,noreferrer");
      }, 400);
    } catch (err) {
      console.error("Affiliate redirect generation failed:", err);
      clearInterval(progressInterval);
      setProgress(100);
      let fallbackUrl = url;
      if (store.toLowerCase() === "amazon" || fallbackUrl.includes("amazon.in") || fallbackUrl.includes("amazon.com")) {
        const amzTag = "buywiseind0f8-21";
        try {
          const u = new URL(fallbackUrl);
          u.searchParams.set("tag", amzTag);
          fallbackUrl = u.toString();
        } catch {
          const separator = fallbackUrl.includes("?") ? "&" : "?";
          fallbackUrl = `${fallbackUrl}${separator}tag=${amzTag}`;
        }
      }

      setTimeout(() => {
        setIsRedirecting(false);
        window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      }, 400);
    }
  };

  const getStoreDisplayName = (sName: string) => {
    const s = sName.toLowerCase();
    if (s.includes("amazon")) return "Amazon India";
    if (s.includes("flipkart")) return "Flipkart";
    if (s.includes("croma")) return "Croma";
    if (s.includes("reliance")) return "Reliance Digital";
    if (s.includes("vijay")) return "Vijay Sales";
    if (s.includes("cliq") || s.includes("tata")) return "Tata CLiQ";
    if (s.includes("myntra")) return "Myntra";
    if (s.includes("ajio")) return "Ajio";
    return sName.charAt(0).toUpperCase() + sName.slice(1);
  };

  const getStoreThemeColor = (sName: string) => {
    const s = sName.toLowerCase();
    if (s.includes("amazon")) return "from-[#FF9900] to-[#232F3E]";
    if (s.includes("flipkart")) return "from-[#2874F0] to-[#FFE500]";
    if (s.includes("croma")) return "from-[#00E6C3] to-[#111111]";
    if (s.includes("reliance")) return "from-[#E4252A] to-[#0A2240]";
    if (s.includes("vijay")) return "from-[#C41230] to-[#2B2B2B]";
    if (s.includes("cliq") || s.includes("tata")) return "from-[#DA1C5C] to-[#1B1B1B]";
    if (s.includes("myntra")) return "from-[#F13E78] to-[#FF4B2B]";
    if (s.includes("ajio")) return "from-[#313541] to-[#1A1C22]";
    return "from-[#FF3B30] to-[#111111]";
  };

  return (
    <AffiliateContext.Provider value={{ triggerRedirect, isRedirecting, redirectStore }}>
      {children}

      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl z-[9999] flex flex-col items-center justify-center p-6 text-white"
            id="affiliate-redirection-overlay"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr ${getStoreThemeColor(redirectStore)} opacity-10 filter blur-[120px] pointer-events-none`} />

            <div className="max-w-md w-full text-center space-y-8 relative z-10">
              {/* Spinning Logo / Icon Loader */}
              <div className="flex justify-center">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className={`w-28 h-28 rounded-full border-t-2 border-b-2 border-l border-r border-transparent bg-gradient-to-tr ${getStoreThemeColor(redirectStore)} p-[2px]`}
                  >
                    <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white/40 animate-pulse" />
                    </div>
                  </motion.div>
                  
                  {/* Micro particles */}
                  <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full animate-ping opacity-30" />
                  <div className="absolute bottom-1 left-2 w-2 h-2 bg-white rounded-full animate-bounce opacity-40" />
                </div>
              </div>

              {/* Redirection Notice */}
              <div className="space-y-3">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-black tracking-tight uppercase"
                >
                  SECURE REDIRECT
                </motion.h2>
                <p className="text-sm text-white/50 tracking-widest uppercase font-black">
                  Connecting you to <span className="text-white border-b border-white/20 pb-0.5">{getStoreDisplayName(redirectStore)}</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-black tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full mx-auto w-max mt-4">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Applying Best Cash Back & Deals
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="space-y-2 max-w-xs mx-auto">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${getStoreThemeColor(redirectStore)}`}
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-white/40 font-mono tracking-widest">
                  <span>ROUTING VIA BUYWISE SECURE NODE</span>
                  <span>{progress}%</span>
                </div>
              </div>

              {/* Discretionary message */}
              <p className="text-[10px] text-white/30 tracking-widest uppercase leading-relaxed max-w-xs mx-auto">
                You will be automatically redirected. BuyWise partners with stores to secure special coupons, earning a commission on eligible purchases.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AffiliateContext.Provider>
  );
}
