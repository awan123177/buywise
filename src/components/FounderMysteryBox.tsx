import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Crown, 
  CheckCircle2, 
  Lock, 
  Gift, 
  ShieldCheck, 
  Coins, 
  Award, 
  Infinity as InfinityIcon,
  Flame,
  Star,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { fetchFounderMysteryBoxStatus, claimFounderMysteryBox } from '../lib/api';

interface FounderMysteryBoxProps {
  onSelectFounderPlan?: () => void;
  onPlanPurchased?: () => void;
}

// Web Audio API Sound Synthesizer for high-energy unboxing
const playUnboxSoundEffect = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play an energetic rising fanfare sequence
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = index === notes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 0.55);
    });

    // Add deep bass impact
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3
    bassOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.8);
    bassGain.gain.setValueAtTime(0.4, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(ctx.currentTime);
    bassOsc.stop(ctx.currentTime + 0.85);

  } catch (e) {
    // Non-blocking audio fallback
  }
};

export default function FounderMysteryBox({ onSelectFounderPlan }: FounderMysteryBoxProps) {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  
  const [loading, setLoading] = useState(true);
  const [isEligible, setIsEligible] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [claimedAt, setClaimedAt] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch status from server
  const loadStatus = async () => {
    if (!user) {
      setIsEligible(false);
      setIsClaimed(false);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await fetchFounderMysteryBoxStatus();
      setIsEligible(!!data?.eligible);
      setIsClaimed(!!data?.claimed);
      setClaimedAt(data?.claimedAt || null);
    } catch (e) {
      console.warn("Could not fetch mystery box status:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [user]);

  // Listen for external premium activation events
  useEffect(() => {
    const handleActivated = () => {
      loadStatus();
    };
    window.addEventListener('buywisePremiumActivated', handleActivated);
    return () => window.removeEventListener('buywisePremiumActivated', handleActivated);
  }, []);

  const triggerConfetti = () => {
    try {
      // High-energy gold & amber celebration explosion
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#F59E0B', '#EAB308', '#FFFFFF', '#FF3B30']
      });

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FACC15', '#F59E0B', '#EAB308', '#FFFFFF']
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FACC15', '#F59E0B', '#EAB308', '#FFFFFF']
        });
      }, 250);
    } catch (e) {
      // Non-blocking
    }
  };

  const handleOpenMysteryBox = async () => {
    if (isOpening || isClaimed || !isEligible) return;
    
    setIsOpening(true);
    playUnboxSoundEffect();

    try {
      // 1. Trigger atomic server claim endpoint
      const result = await claimFounderMysteryBox();
      
      // 2. Play dramatic unboxing animation timing
      setTimeout(() => {
        triggerConfetti();
        setIsClaimed(true);
        setClaimedAt(result.claimedAt || new Date().toISOString());
        setClaimResult(result);
        setShowCelebrationModal(true);
        setIsOpening(false);

        // 3. Dispatch global events so Navbar coins & active badges update instantly
        window.dispatchEvent(new CustomEvent('buywiseCoinsUpdated', { detail: { coins: result.coins } }));
        window.dispatchEvent(new CustomEvent('buywiseProfileUpdated', { detail: result }));
        
        toast.success("🎁 10,000 Coins & Lifetime Super Enhanced Founder Badge Unlocked!");
      }, 1600);

    } catch (err: any) {
      setIsOpening(false);
      const errMsg = err?.response?.data?.error || err?.message || "Failed to open mystery box. Please try again.";
      toast.error(errMsg);
      
      if (err?.response?.data?.alreadyClaimed) {
        setIsClaimed(true);
        setClaimedAt(err?.response?.data?.claimedAt || new Date().toISOString());
      }
    }
  };

  return (
    <div 
      id="forever-founder-mystery-box-section"
      ref={containerRef}
      className="relative max-w-4xl mx-auto w-full my-8 p-1 rounded-3xl bg-gradient-to-b from-yellow-500/30 via-yellow-600/10 to-black/80 border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] overflow-hidden"
    >
      {/* Background Ambient Glow & Starfields */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/15 via-black/90 to-[#080808] -z-10" />
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-yellow-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="p-6 md:p-10 rounded-[22px] bg-[#0c0c0c]/90 backdrop-blur-xl flex flex-col items-center text-center relative z-10">
        
        {/* Top Tag & Guarantee Notice */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
            <Crown size={12} className="text-yellow-400" />
            FOREVER FOUNDER EXCLUSIVE
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/5 text-white/70 border border-white/10">
            <ShieldCheck size={11} className="text-green-400" />
            Guaranteed Reward (No RNG / Not Gambling)
          </span>
        </div>

        {/* Section Title & Subtitle */}
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 flex items-center justify-center gap-2 drop-shadow-md">
          <span>🎁</span> FOREVER FOUNDER MYSTERY BOX
        </h2>
        <p className="text-white/60 text-xs md:text-sm mt-2 max-w-lg font-medium">
          Your exclusive lifetime founder reward with guaranteed promotional bonuses.
        </p>

        {/* MAIN VISUAL MYSTERY BOX CONTAINER */}
        <div className="my-8 relative flex flex-col items-center justify-center">
          
          {/* Animated Glow Aura Behind Box */}
          <motion.div 
            animate={{
              scale: isOpening ? [1, 1.4, 1.8] : [1, 1.08, 1],
              opacity: isOpening ? [0.6, 1, 0.8] : [0.3, 0.6, 0.3],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: isOpening ? 0.8 : 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-tr from-yellow-500/40 via-amber-400/30 to-orange-500/20 blur-[60px] pointer-events-none -z-10"
          />

          {/* MYSTERY CHEST CONTAINER */}
          <motion.div 
            animate={
              isOpening 
                ? {
                    x: [-8, 8, -8, 8, -4, 4, 0],
                    y: [-4, 4, -8, 8, -2, 2, 0],
                    rotate: [-4, 4, -4, 4, -2, 2, 0],
                    scale: [1, 1.05, 1.12, 1.2, 1.25]
                  }
                : {
                    y: [-6, 6, -6],
                    rotate: [-1, 1, -1]
                  }
            }
            transition={
              isOpening
                ? { duration: 1.5, ease: "easeInOut" }
                : { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }
            className={`relative w-40 h-40 md:w-52 md:h-52 rounded-3xl flex items-center justify-center p-4 cursor-pointer select-none transition-all duration-500 ${
              isClaimed
                ? 'bg-gradient-to-b from-yellow-500/20 to-black/60 border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.25)]'
                : isEligible
                  ? 'bg-gradient-to-b from-yellow-500/30 via-yellow-600/20 to-black/80 border-2 border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)] hover:shadow-[0_0_60px_rgba(250,204,21,0.6)]'
                  : 'bg-black/60 border-2 border-yellow-500/20 opacity-90'
            }`}
            onClick={() => {
              if (isEligible && !isClaimed && !isOpening) {
                handleOpenMysteryBox();
              }
            }}
          >
            {/* Box Surface Metallic Accents */}
            <div className="absolute inset-2 rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 via-transparent to-black/40 pointer-events-none" />
            
            {/* Corner Gold Brackets */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-yellow-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-yellow-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />

            {/* Central Icon / State */}
            {isClaimed ? (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center text-center gap-1"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center text-black shadow-lg shadow-yellow-500/40">
                  <CheckCircle2 size={36} className="text-black" />
                </div>
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mt-2 font-mono">
                  OPENED & ACTIVE
                </span>
              </motion.div>
            ) : isOpening ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="flex flex-col items-center text-center"
              >
                <Sparkles size={48} className="text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,1)]" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest mt-2">
                  UNLOCKING...
                </span>
              </motion.div>
            ) : isEligible ? (
              <div className="flex flex-col items-center text-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <Gift size={56} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
                </motion.div>
                <span className="text-[9px] font-black text-yellow-300 uppercase tracking-widest mt-1 bg-yellow-500/20 px-2 py-0.5 rounded-full border border-yellow-400/40">
                  READY TO UNBOX
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-1">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/5 border border-yellow-500/20 flex items-center justify-center text-yellow-400/80">
                  <Lock size={28} />
                </div>
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-1">
                  FOUNDER LOCKED
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* GUARANTEED REWARDS DISPLAY CARD */}
        <div className="w-full max-w-xl bg-black/50 border border-yellow-500/20 rounded-2xl p-5 mb-6 backdrop-blur-md">
          <div className="text-[11px] font-black uppercase tracking-wider text-yellow-400 mb-3 flex items-center justify-center gap-2">
            <Sparkles size={14} /> Guaranteed Founder Rewards
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            
            {/* Reward 1: 10,000 Coins */}
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
              isClaimed 
                ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' 
                : 'bg-white/5 border-white/10 text-white'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                <Coins size={20} className="text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase text-yellow-400">10,000 BuyWise Coins</span>
                  {isClaimed && <CheckCircle2 size={13} className="text-green-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-white/60 leading-tight mt-0.5">
                  Instant balance boost for reward store & features.
                </p>
              </div>
            </div>

            {/* Reward 2: Super Enhanced Founder Badge */}
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
              isClaimed 
                ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300' 
                : 'bg-white/5 border-white/10 text-white'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                <Award size={20} className="text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase text-yellow-400">Super Founder Badge</span>
                  {isClaimed && <CheckCircle2 size={13} className="text-green-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-white/60 leading-tight mt-0.5 flex items-center gap-1">
                  <InfinityIcon size={11} className="text-yellow-400 inline" /> Permanent Lifetime Prestige
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* INTERACTIVE ACTION BUTTONS */}
        <div className="w-full max-w-md">
          {isClaimed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/40 text-yellow-300 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <CheckCircle2 size={16} className="text-green-400" />
                <span>MYSTERY BOX OPENED — REWARDS ACTIVE</span>
              </div>
              {claimedAt && (
                <span className="text-[10px] text-white/40 font-mono">
                  Claimed on {new Date(claimedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ) : isEligible ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={isOpening}
              onClick={handleOpenMysteryBox}
              className={`w-full py-4 px-6 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 relative overflow-hidden group shadow-[0_0_30px_rgba(250,204,21,0.4)] ${
                isOpening
                  ? 'bg-yellow-600 text-black cursor-wait'
                  : 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-black hover:shadow-[0_0_50px_rgba(250,204,21,0.7)] cursor-pointer'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isOpening ? (
                  <>
                    <Sparkles className="animate-spin" size={16} />
                    <span>OPENING MYSTERY BOX...</span>
                  </>
                ) : (
                  <>
                    <Gift size={16} />
                    <span>OPEN MYSTERY BOX</span>
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                toast.info("Forever Founder purchases are coming soon!");
                const founderSection = document.getElementById('forever-founder-plan-card');
                if (founderSection) {
                  founderSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-4 px-6 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-yellow-600/30 to-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30 hover:border-yellow-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 group"
            >
              <Lock size={14} className="text-yellow-400 group-hover:scale-110 transition-transform" />
              <span>UPGRADE TO FOREVER FOUNDER (COMING SOON)</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          )}
        </div>

      </div>

      {/* REWARD CELEBRATION MODAL */}
      <AnimatePresence>
        {showCelebrationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setShowCelebrationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full p-8 rounded-3xl bg-gradient-to-b from-[#1c1a0e] via-[#121212] to-black border-2 border-yellow-500 shadow-[0_0_60px_rgba(250,204,21,0.5)] text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500" />
              
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center text-black mx-auto mb-4 shadow-[0_0_30px_rgba(250,204,21,0.6)]">
                <TrophyIcon size={42} className="text-black" />
              </div>

              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-yellow-400 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/40">
                PROMOTIONAL REWARD UNLOCKED
              </span>

              <h3 className="text-2xl font-black uppercase text-white mt-4 tracking-tight">
                YOU UNLOCKED FOREVER FOUNDER REWARDS!
              </h3>
              
              <p className="text-white/70 text-xs mt-2 leading-relaxed">
                Welcome to the highest echelon of BuyWise. Your guaranteed founder benefits are now active.
              </p>

              <div className="my-6 space-y-3">
                <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3 text-left">
                  <Coins className="text-yellow-400 shrink-0" size={24} />
                  <div>
                    <div className="text-xs font-black uppercase text-yellow-400">+10,000 BuyWise Coins</div>
                    <div className="text-[10px] text-white/60">Credited to your account wallet ledger</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3 text-left">
                  <Award className="text-yellow-400 shrink-0" size={24} />
                  <div>
                    <div className="text-xs font-black uppercase text-yellow-400">Super Enhanced Founder Badge</div>
                    <div className="text-[10px] text-white/60">Permanent lifetime badge on profile & leaderboards</div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCelebrationModal(false)}
                className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-yellow-500 to-amber-400 text-black hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] cursor-pointer transition-all"
              >
                AWESOME, LET'S GO!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function TrophyIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return <Crown size={size} className={className} />;
}
