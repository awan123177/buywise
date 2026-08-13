import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Trophy, Users, Wallet, Calendar, Gift, 
  ChevronRight, Copy, CheckCircle, Search, HelpCircle, 
  ArrowUpRight, AlertTriangle, RefreshCw, BadgePercent,
  Sparkles, Star, Target, ShieldAlert, Coins
, Ticket } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { fetchUserCoupons, fetchGamificationProfile, triggerDailyCheckIn,
  fetchCoinTransactions, fetchAchievements, 
  submitReferral, fetchReferralsDashboard, 
  fetchLeaderboard, redeemCoinReward, logSocialShare, logReviewAction,
  fetchReviews, submitUserReview, transferCoins, spinWheelDaily, submitMission, api
} from '../lib/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../contexts/CurrencyContext';

export default function RewardsHub() {
  const { user, openLogin } = useAuth();
  const { formatPrice } = useCurrency();
  const [profile, setProfile] = useState<any>(null);
  const [coins, setCoins] = useState<number>(0);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardMetric, setLeaderboardMetric] = useState<'coins' | 'referrals' | 'searches' | 'savings'>('coins');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'wallet' | 'referrals' | 'missions' | 'achievements' | 'streaks' | 'leaderboard'>('wallet');

  // Input states
  const [refCodeInput, setRefCodeInput] = useState<string>('');
  const [claiming, setClaiming] = useState<string | null>(null);
  const [tippingUserId, setTippingUserId] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState<string>('50');

  
  const handleRedeemCoupon = async () => {
    if (coins < 1000) {
      toast.error("You need 1000 coins to generate a coupon.");
      return;
    }
    const toastId = toast.loading("Generating coupon...");
    try {
      const res = await api.post("/gamification/redeem-coupon", {});
      if (res.data?.success && res.data?.coupon) {
         toast.success("Coupon generated successfully!");
         refreshProfileAndCoupons();
      } else {
         toast.error(res.data?.error || "Failed to generate coupon");
      }
    } catch(e) {
      toast.error("Failed to generate coupon");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const refreshProfileAndCoupons = async () => {
    try {
      const p = await fetchGamificationProfile();
      setProfile(p);
      setCoins(p.coins);
      const cRes = await fetchUserCoupons();
      if (cRes.success && cRes.coupons) setCoupons(cRes.coupons);
    } catch(e) {}
  };

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<{ reward: string, coinsAwarded: number, message: string } | null>(null);

  // Advanced Canvas Spin Wheel States & Refs
  const [wheelAngle, setWheelAngle] = useState<number>(0);
  const [showWinCelebration, setShowWinCelebration] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<string>('');
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const angleRef = React.useRef<number>(0);
  const lastTickPegRef = React.useRef<number>(-1);

  // Sound Synthesizers (Web Audio API)
  const playTickSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const playWinSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.15, 0.15); // E5
      playTone(783.99, now + 0.3, 0.15); // G5
      playTone(1046.50, now + 0.45, 0.4); // C6
    } catch (e) {}
  };

  const getCountdownTime = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - now.getTime();
    if (diff <= 0) return "00:00:00";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const WHEEL_SEGMENTS = [
    { label: "10 Coins", rarity: "Common", color: "#1C1917", text: "#A8A29E", stroke: "#44403C" },
    { label: "50 Coins", rarity: "Uncommon", color: "#064E3B", text: "#34D399", stroke: "#047857" },
    { label: "100 Coins", rarity: "Rare", color: "#1E3A8A", text: "#60A5FA", stroke: "#1D4ED8" },
    { label: "500 Coins", rarity: "Mythic", color: "#7F1D1D", text: "#FCA5A5", stroke: "#B91C1C" },
    { label: "Premium Trial", rarity: "Legendary", color: "#78350F", text: "#FBBF24", stroke: "#D97706" },
    { label: "Lucky Badge", rarity: "Epic", color: "#581C87", text: "#C084FC", stroke: "#7E22CE" },
    { label: "Try Again", rarity: "Common", color: "#111111", text: "#4B5563", stroke: "#1F2937" }
  ];

  // Coins animation trigger
  const [particles, setParticles] = useState<any[]>([]);

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Update Countdown and Redraw Canvas on wheelAngle changes
  useEffect(() => {
    setCountdown(getCountdownTime());
    const clockInterval = setInterval(() => {
      setCountdown(getCountdownTime());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const drawWheel = (ctx: CanvasRenderingContext2D, width: number, height: number, angle: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 12;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // 1. Draw outermost golden circular rim with a dark bevel
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    const rimGrad = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + 8);
    rimGrad.addColorStop(0, "#78350F"); // brown-900
    rimGrad.addColorStop(0.3, "#FBBF24"); // gold
    rimGrad.addColorStop(0.7, "#D97706"); // yellow-600
    rimGrad.addColorStop(1, "#1E1B4B"); // indigo-950 deep core
    ctx.fillStyle = rimGrad;
    ctx.shadowColor = "rgba(239, 68, 68, 0.4)"; // red neon glow
    ctx.shadowBlur = 18;
    ctx.fill();
    ctx.restore();

    // 2. Draw segment slices
    const segments = WHEEL_SEGMENTS;
    const sliceAngle = (2 * Math.PI) / 7;

    for (let i = 0; i < 7; i++) {
      const seg = segments[i];
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.save();
      // Draw slice filled background
      ctx.fillStyle = seg.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Draw slice inner golden boundaries
      ctx.strokeStyle = "rgba(251, 191, 36, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Add segment glossy gradient (gives it that polished 3D gaming wheel look)
      const sliceGloss = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      sliceGloss.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      sliceGloss.addColorStop(0.7, "rgba(0, 0, 0, 0.05)");
      sliceGloss.addColorStop(1, "rgba(0, 0, 0, 0.65)");
      ctx.fillStyle = sliceGloss;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Rotate to segment center to write texts
      ctx.restore();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);

      // Draw Label
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = seg.text;
      ctx.font = "black 10px Inter, system-ui, sans-serif";

      // Text drop shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1.5;
      ctx.shadowOffsetY = 1.5;
      ctx.fillText(seg.label, radius - 25, -2);

      // Draw Rarity Category Label
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "bold 7px JetBrains Mono, monospace";
      ctx.fillText(seg.rarity, radius - 25, 8);

      ctx.restore();
    }

    // 3. Draw metallic pegs at segment boundaries
    for (let i = 0; i < 7; i++) {
      const pegAngle = angle + i * sliceAngle;
      const pegX = centerX + radius * Math.cos(pegAngle);
      const pegY = centerY + radius * Math.sin(pegAngle);

      ctx.save();
      ctx.beginPath();
      ctx.arc(pegX, pegY, 3.5, 0, 2 * Math.PI);
      const pegGrad = ctx.createRadialGradient(pegX, pegY, 0, pegX, pegY, 3.5);
      pegGrad.addColorStop(0, "#FFFFFF");
      pegGrad.addColorStop(0.5, "#FBBF24"); // gold peg
      pegGrad.addColorStop(1, "#78350F");
      ctx.fillStyle = pegGrad;
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 1;
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw center dynamic metallic core shield (jackpot logo)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 22, 0, 2 * Math.PI);
    const coreGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 22);
    coreGrad.addColorStop(0, "#FEF08A"); // gold yellow-200
    coreGrad.addColorStop(0.4, "#FBBF24"); // gold yellow-400
    coreGrad.addColorStop(0.8, "#B45309"); // gold yellow-700
    coreGrad.addColorStop(1, "#451A03"); // amber-950
    ctx.fillStyle = coreGrad;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fill();

    // Core stroke outline
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center icon
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText("★", centerX, centerY);
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawWheel(ctx, canvas.width, canvas.height, wheelAngle);
  }, [wheelAngle, loading, activeTab]);

  // Load All Profile & Gamification Data
  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profData, couponsData, txnData, achData, refData, lBoardData, reviewsData] = await Promise.all([
        fetchGamificationProfile(), fetchUserCoupons(),
        fetchCoinTransactions(),
        fetchAchievements(),
        fetchReferralsDashboard(),
        fetchLeaderboard(leaderboardMetric),
        fetchReviews()
      ]);
      setProfile(profData);
      if (couponsData && couponsData.success) {
        setCoupons(couponsData.coupons || []);
      }
      setTransactions(txnData);
      setAchievements(achData);
      setReferralStats(refData);
      setLeaderboard(lBoardData);
      setReviews(reviewsData || []);
    } catch (e) {
      console.error("Failed to load gamification data:", e);
    } finally {
      setLoading(false);
    }
  };

  const triggerCoinAnimation = () => {
    // 3D Coin explosion animation
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.5 + 0.5,
      delay: Math.random() * 0.2
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  };

  const handleSpin = async () => {
    if (!user) return openLogin();
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSpinResult(null);
    setShowWinCelebration(false);
    
    try {
      const result = await spinWheelDaily();
      if (!result.success) {
        setIsSpinning(false);
        toast.error(result.message);
        return;
      }

      // Map the backend outcome string to our client-side segment index
      let targetIndex = 6; // default: Try Again / Better Luck Tomorrow
      const label = result.reward || "";
      if (label.includes("100 Coins")) targetIndex = 2;
      else if (label.includes("500 Coins")) targetIndex = 3;
      else if (label.includes("10 Coins")) targetIndex = 0;
      else if (label.includes("50 Coins")) targetIndex = 1;
      else if (label.includes("Premium")) targetIndex = 4;
      else if (label.includes("Badge") || label.includes("Lucky")) targetIndex = 5;

      const sliceAngle = (2 * Math.PI) / 7;
      // segmentCenterAngle on the standard wheel
      const segmentCenterAngle = (targetIndex + 0.5) * sliceAngle;

      // Start position normalized
      const startRotation = angleRef.current % (2 * Math.PI);
      
      // We want to rotate at least 6 full cycles and land exactly so the center of targetIndex is at 12 o'clock (-Math.PI/2)
      // Top pointer is at -Math.PI / 2.
      // angleOnScreen = segmentCenterAngle + totalRotationNeeded. We want angleOnScreen = 1.5 * Math.PI (which is top)
      // So totalRotationNeeded = (1.5 * Math.PI - segmentCenterAngle) + 2 * Math.PI * numRotations - startRotation
      const numRotations = 6;
      let targetRot = (1.5 * Math.PI - segmentCenterAngle) - startRotation;
      while (targetRot < 0) {
        targetRot += 2 * Math.PI;
      }
      const totalRotationNeeded = targetRot + (2 * Math.PI * numRotations);

      const startTime = performance.now();
      const duration = 5000; // 5 seconds of cinematic spinning
      lastTickPegRef.current = -1;

      const animateWheel = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cinematic Quartic Ease Out
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentAngle = startRotation + totalRotationNeeded * ease;
        
        angleRef.current = currentAngle;

        // Draw directly to canvas for ultra smooth 60fps cinematic spinning (bypasses full component React re-renders)
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            drawWheel(ctx, canvas.width, canvas.height, currentAngle);
          }
        }

        // Tick sounds when passing slice pegs
        const currentPeg = Math.floor((currentAngle - Math.PI / 2) / sliceAngle);
        if (currentPeg !== lastTickPegRef.current) {
          playTickSound();
          lastTickPegRef.current = currentPeg;
          if (navigator.vibrate) {
            navigator.vibrate(10); // subtle haptic feedback for each peg!
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animateWheel);
        } else {
          setWheelAngle(currentAngle);
          setIsSpinning(false);
          setSpinResult(result);
          playWinSound();
          setShowWinCelebration(true);
          
          // Award Coins and Trigger Coin Rain
          if (result.coinsAwarded > 0) {
            triggerCoinAnimation();
            setProfile((prev: any) => ({
              ...prev,
              coins: prev.coins + result.coinsAwarded,
              lastSpinDate: new Date().toISOString().split('T')[0]
            }));
            toast.success(`You won ${result.coinsAwarded} Coins!`);
          } else {
            setProfile((prev: any) => ({
              ...prev,
              lastSpinDate: new Date().toISOString().split('T')[0]
            }));
            toast.success(result.message);
          }
        }
      };

      requestAnimationFrame(animateWheel);
      
    } catch (error) {
      setIsSpinning(false);
      toast.error('Failed to spin. Try again later.');
    }
  };

  const handleCompleteMission = async (missionId: string) => {
    if (!user) return openLogin();
    try {
      const result = await submitMission(missionId);
      refreshProfileAndCoupons();
      if (result.success) {
        toast.success(result.message);
        triggerCoinAnimation();
        setProfile((prev: any) => ({ 
          ...prev, 
          coins: prev.coins + result.coinsAwarded,
          completedMissions: [...(prev.completedMissions || []), `${new Date().toISOString().split('T')[0]}_${missionId}`]
        }));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to complete mission.');
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.uid]);

  // Load Leaderboard when metric changes
  useEffect(() => {
    const loadLboard = async () => {
      try {
        const lBoardData = await fetchLeaderboard(leaderboardMetric);
        setLeaderboard(lBoardData);
      } catch (e) {
        console.error(e);
      }
    };
    if (user?.uid) {
      loadLboard();
    }
  }, [leaderboardMetric, user?.uid]);

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    if (!referralStats?.referralLink) return;
    navigator.clipboard.writeText(referralStats.referralLink);
    toast.success("Referral link copied to clipboard! 🤝");
  };

  // Trigger social sharing coins (+20 coins)
  const handleSocialShare = async () => {
    try {
      await logSocialShare();
      triggerCoinsRain();
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Scroll to custom review section
  const handleWriteReview = () => {
    const element = document.getElementById('member-reviews-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      const textarea = document.getElementById('review-comment-textarea');
      if (textarea) textarea.focus();
    } else {
      toast.error("Reviews section is ready below!");
    }
  };

  // Submit custom user review and feedback (+15 coins)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error("Please enter your feedback comments first!");
      return;
    }

    try {
      setSubmittingReview(true);
      const result = await submitUserReview(reviewRating, reviewComment.trim());
      if (result.success) {
        setReviewComment('');
        setReviewRating(5);
        triggerCoinsRain();
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Submit Referral Code (Referred by a friend)
  const handleApplyReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCodeInput.trim()) return;

    try {
      const result = await submitReferral(refCodeInput.trim());
      if (result.success) {
        triggerCoinsRain();
        setRefCodeInput('');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTipUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tippingUserId) return;
    
    const amount = parseInt(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    try {
      setClaiming(tippingUserId);
      const result = await transferCoins(tippingUserId, amount);
      if (result.success) {
        triggerCoinsRain();
        setTippingUserId(null);
        setTipAmount('50');
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(null);
    }
  };

  // Redeem rewards
  const handleRedeem = async (type: "discount" | "trial" | "deal" | "badge") => {
    if (profile.coins < (type === 'deal' ? 50 : type === 'discount' ? 100 : type === 'badge' ? 150 : 250)) {
      toast.error("Insufficient coins for this reward!");
      return;
    }

    try {
      setClaiming(type);
      const result = await redeemCoinReward(type);
      if (result.success) {
        toast.success(result.message, { duration: 8000 });
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(null);
    }
  };

  // Particle coins burst animation helper
  const triggerCoinsRain = () => {
    const count = 25;
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: -50,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
        delay: Math.random() * 0.5
      });
    }
    setParticles(newParticles);
    // Cleanup particles
    setTimeout(() => setParticles([]), 3500);
  };

  if (!user) {
    return (
      <div className="pt-24 md:pt-28 px-4 md:px-16 max-w-5xl mx-auto pb-16 relative text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#FF3B30]/5 blur-[120px] pointer-events-none" />
        
        <Trophy className="mx-auto text-yellow-500/30 mb-4 animate-bounce" size={64} />
        <span className="text-xs font-black tracking-[0.4em] text-[#FF3B30] uppercase mb-1 block">// REWARDS ARCHIVE</span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#f5f5f5] uppercase leading-none">
          BUYWISE <span className="text-[#FF3B30]">CLUB</span>
        </h2>
        <p className="text-xs md:text-sm text-[#f5f5f5]/60 mt-4 max-w-md mx-auto">
          Earn real-time rewards, compare price indices, track logins, and compete in the national leaderboard. Sign in to join the loop.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openLogin}
          className="mt-8 px-8 py-3 bg-[#FF3B30] hover:bg-red-600 text-white font-black tracking-widest text-xs uppercase rounded-lg shadow-xl shadow-red-600/30 cursor-pointer"
        >
          AUTHENTICATE WITH GOOGLE
        </motion.button>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 px-4 md:px-16 max-w-7xl mx-auto pb-16 relative">
      {/* Dynamic Coin Particles Overflow */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: p.y, x: p.x, rotateX: 0, rotateY: 0, opacity: 1, scale: p.scale }}
            animate={{ 
              y: window.innerHeight + 100, 
              x: p.x + (Math.random() * 200 - 100), 
              rotateX: p.rotation * 2,
              rotateY: p.rotation * 3,
              opacity: 0
            }}
            transition={{ duration: 2.5, ease: 'easeIn', delay: p.delay }}
            className="fixed z-[1000] pointer-events-none select-none"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="w-10 h-10 rounded-full border-[3px] border-yellow-600 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.6)]">
              <span className="text-yellow-100 font-black text-xs">₹</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[200px] h-[200px] rounded-full bg-[#FF3B30]/3 blur-[100px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-white/5 gap-4">
        <div>
          <span className="text-xs font-black tracking-[0.4em] text-yellow-500 uppercase mb-1 block">// ACTIVE MEMBER AREA</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#f5f5f5] uppercase leading-none">
            REWARDS <span className="text-[#FF3B30]">TERMINAL</span>
          </h2>
          <p className="text-xs md:text-sm text-[#f5f5f5]/60 mt-2 font-medium">
            Earn, track, and redeem BuyWise Coins for Premium features, free passes, and exclusive discounts.
          </p>
        </div>

        {/* Navigation Selector */}
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 overflow-x-auto max-w-full">
          {[
            { id: 'wallet', label: '💼 WALLET', icon: Wallet },
            { id: 'referrals', label: '🤝 REFERRALS', icon: Users },
            { id: 'missions', label: '🎯 MISSIONS', icon: Gift },
            { id: 'streaks', label: '🔥 STREAKS', icon: Calendar },
            { id: 'achievements', label: '🏆 MILITARY', icon: Award },
            { id: 'leaderboard', label: '🏅 RANKING', icon: Trophy },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-black tracking-[0.15em] transition-all whitespace-nowrap uppercase ${
                activeTab === tab.id 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <RefreshCw className="mx-auto text-[#FF3B30] animate-spin mb-4" size={36} />
          <div className="text-sm font-black text-white/50 tracking-widest uppercase">LOADING ACCOUNT TERMINAL...</div>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT BENTO BLOCK: User Balance & Claim Store */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Wallet Core Badge */}
            <div className="bg-gradient-to-br from-[#1c1c13] to-[#111111] p-6 rounded-2xl border border-yellow-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[40px] pointer-events-none group-hover:bg-yellow-500/10 transition-all" />
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs uppercase font-black text-yellow-500/60 tracking-widest flex items-center gap-1.5">
                  <Wallet size={12} /> COINS BALANCE
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {profile?.isPremium && (
                    <span className="text-[8px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded uppercase font-black tracking-widest font-mono shadow-[0_0_8px_rgba(234,179,8,0.2)] animate-pulse">
                      👑 PREMIUM
                    </span>
                  )}
                  {profile?.activeBadge && (
                    <span className="text-[8px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded uppercase font-black tracking-widest font-mono">
                      {profile.activeBadge}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-4xl md:text-5xl font-black text-yellow-500 flex items-center gap-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                🪙 {profile?.coins || 0}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[11px] font-mono text-white/50">
                <div>Streaks: <span className="text-green-500 font-black">{profile?.streakCount || 0} Days</span></div>
                <div>Searches: <span className="text-blue-400 font-black">{profile?.searchesCount || 0}</span></div>
                <div>Saved: <span className="text-yellow-500 font-black">{formatPrice(profile?.totalSaved || 0)}</span></div>
              </div>
            </div>

            {/* Quick Coin Gainers */}
            <div className="bg-white/[0.02] p-5 rounded-xl border border-white/5 space-y-3">
              <div className="text-xs font-black uppercase text-[#FF3B30] tracking-widest flex items-center gap-1">
                <Sparkles size={12} /> INSTANT COIN BOOSTERS
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed mb-1">
                Complete these quick tasks right now to load up your coin pouch:
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={handleSocialShare}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors cursor-pointer border border-white/5 group"
                >
                  <div className="text-xs font-black text-white/80 group-hover:text-white">📱 Share BuyWise to WhatsApp/X</div>
                  <span className="text-xs font-bold text-yellow-500">+20 Coins 🪙</span>
                </button>

                <button
                  onClick={handleWriteReview}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors cursor-pointer border border-white/5 group"
                >
                  <div className="text-xs font-black text-white/80 group-hover:text-white">⭐ Rate Us / Submit Review</div>
                  <span className="text-xs font-bold text-yellow-500">+10 Coins 🪙</span>
                </button>
              </div>
            </div>

            {/* BuyWise Reward Store */}
            <div className="bg-[#111111]/40 p-5 rounded-2xl border border-white/5 space-y-6 col-span-1 md:col-span-2">
              <div className="text-sm font-black uppercase text-yellow-500 tracking-widest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift size={18} /> BUYWISE REWARD STORE
                </div>
                <div className="text-[10px] text-white/40">SPEND COINS FOR REAL VALUE</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'deal', label: '🔓 SECRET EXCLUSIVE DEAL', desc: 'Unlock access to hidden liquidation products.', cost: 50, color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
                  { id: 'discount', label: '🎟️ 50% PREMIUM DISCOUNT', desc: 'Half-off on any premium license keys.', cost: 100, color: 'bg-green-500/10 border-green-500/20 text-green-400' },
                  { id: 'badge', label: '💎 COINS LEGEND BADGE', desc: 'Adds a legendary icon next to your name.', cost: 150, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
                  { id: 'trial', label: '👑 3-DAY PREMIUM TRIAL', desc: 'Full premium server access unlocked instantly.', cost: 250, color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
                  { id: 'mystery', label: '🎁 MYSTERY BOX', desc: 'Could contain premium, badges, or massive coins.', cost: 200, color: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400' },
                  { id: 'avatar', label: '🧑‍🚀 PREMIUM AVATAR', desc: 'Unlock an exclusive 3D animated avatar ring.', cost: 300, color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' }
                ].map(item => {
                  const canRedeem = (profile?.coins || 0) >= item.cost;
                  return (
                    <div key={item.id} className={`p-4 rounded-xl border flex flex-col justify-between ${item.color} relative overflow-hidden group hover:border-opacity-50 transition-all`}>
                      <div className="space-y-1 mb-4 z-10 relative">
                        <div className="text-xs font-black tracking-wider uppercase drop-shadow-md">{item.label}</div>
                        <div className="text-[10px] text-white/60 leading-relaxed font-medium">{item.desc}</div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={!canRedeem || claiming === item.id}
                        onClick={() => handleRedeem(item.id as any)}
                        className={`w-full py-2 rounded text-[10px] font-black tracking-widest uppercase cursor-pointer z-10 transition-all ${
                          canRedeem 
                            ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                            : 'bg-black/40 text-white/30 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {claiming === item.id ? 'BUYING...' : `REDEEM FOR ${item.cost} 🪙`}
                      </motion.button>
                      <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                         <Gift size={100} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT BENTO BLOCKS: Interactive Navigation tabs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. WALLET DETAILS TAB */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">

                {/* Generated Coupons */}
                <div className="bg-[#1C1917]/85 backdrop-blur-xl p-8 rounded-3xl border border-[#EF4444]/15 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Your Coupons</h3>
                      <p className="text-xs text-white/50">Redeem coins for Premium discount codes</p>
                    </div>
                    <button 
                      onClick={handleRedeemCoupon}
                      className="px-4 py-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-yellow-500/20 flex items-center gap-2"
                    >
                      <Ticket size={14} />
                      Redeem 1000 Coins
                    </button>
                  </div>
                  
                  {coupons.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-xs uppercase tracking-widest font-bold">
                      No coupons generated yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coupons.map((coupon, idx) => (
                        <div key={idx} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-white font-mono">{coupon.code}</div>
                            <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Generated: {new Date(coupon.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                            Valid
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Spin to Win Section (AAA-Quality Gamified Upgrade) */}
                <div className="bg-[#1C1917]/85 backdrop-blur-xl p-8 rounded-3xl border border-[#EF4444]/25 space-y-6 text-center relative overflow-hidden shadow-[0_0_40px_rgba(239,68,68,0.15)] group">
                  {/* Glowing background light rings */}
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Subtle floating firefly sparks */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          y: [-10, -150],
                          x: [Math.random() * 300, Math.random() * 300],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 4 + Math.random() * 3,
                          repeat: Infinity,
                          delay: Math.random() * 2
                        }}
                        className="absolute w-1 h-1 bg-yellow-400 rounded-full blur-[0.5px]"
                        style={{ bottom: "10px", left: `${i * 15}%` }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF3B30] bg-[#FF3B30]/10 px-3 py-1 rounded-full border border-[#FF3B30]/20">
                      OFFICIAL DAILY JACKPOT
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2 mt-3 font-display">
                      <Sparkles size={26} className="text-yellow-400 animate-pulse" /> SPIN & WIN
                    </h3>
                    <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto leading-relaxed">
                      Compete for Rare, Epic, and Mythic loot rewards. Spin once every 24 hours to claim your daily bonus.
                    </p>
                  </div>
                  
                  {/* Physical Wheel Container */}
                  <div className="relative flex justify-center items-center py-6">
                    {/* Golden Indicator Needle/Pointer */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_12px_rgba(239,68,68,0.7)] flex flex-col items-center">
                      <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-yellow-400" />
                      <div className="w-2 h-2 bg-[#FF3B30] rounded-full -mt-2 border border-white" />
                    </div>

                    {/* Wheel Inner Glow */}
                    <div className="absolute w-[290px] h-[290px] rounded-full border border-yellow-500/10 bg-gradient-to-b from-transparent to-red-950/10 pointer-events-none z-10" />

                    {/* HTML5 Canvas Component */}
                    <div className="relative bg-[#0C0A09] p-3.5 rounded-full border-4 border-double border-yellow-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                      <canvas 
                        ref={canvasRef} 
                        width={280} 
                        height={280} 
                        className="rounded-full relative z-20 cursor-pointer block"
                        onClick={handleSpin}
                      />

                      {/* Lock Overlay for Completed Spins */}
                      {profile?.lastSpinDate === new Date().toISOString().split('T')[0] && !isSpinning && (
                        <div className="absolute inset-0 bg-[#0c0a09]/85 rounded-full z-25 flex flex-col justify-center items-center p-6 backdrop-blur-sm">
                          <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-red-500 shadow-inner mb-3">
                            <span className="text-xl">🔒</span>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40">NEXT SPIN IN</span>
                          <span className="text-xl font-mono font-bold text-yellow-500 mt-1 uppercase tracking-widest">{countdown || "00:00:00"}</span>
                          <span className="text-[8px] text-white/30 mt-2 max-w-[140px] leading-relaxed">System lock is active until daily midnight.</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Launch Controls */}
                  <div className="space-y-3 relative z-10">
                    <button 
                      onClick={handleSpin}
                      disabled={isSpinning || profile?.lastSpinDate === new Date().toISOString().split('T')[0]}
                      className="w-full max-w-xs mx-auto py-3.5 bg-gradient-to-r from-[#FF3B30] via-red-600 to-[#FF3B30] hover:from-red-600 hover:to-red-500 text-white font-black uppercase tracking-[0.15em] text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_25px_rgba(239,68,68,0.35)] hover:shadow-[0_4px_30px_rgba(239,68,68,0.5)] active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isSpinning ? (
                        <>
                          <RefreshCw className="animate-spin" size={14} /> CINEMATIC SPINNING...
                        </>
                      ) : profile?.lastSpinDate === new Date().toISOString().split('T')[0] ? (
                        'NEXT DAILY SPIN LOCKED'
                      ) : (
                        <>
                          <Sparkles size={14} className="text-yellow-300 animate-bounce" /> ENGAGE DAILY SPIN
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Immense AAA Victory Celebration Overlay Modal */}
                <AnimatePresence>
                  {showWinCelebration && spinResult && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/95 z-[9999] flex flex-col justify-center items-center p-6 backdrop-blur-md"
                    >
                      {/* Interactive celebration particles background */}
                      <div className="absolute inset-0 pointer-events-none select-none opacity-40 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ y: -50, x: Math.random() * window.innerWidth, rotate: 0 }}
                            animate={{ y: window.innerHeight + 100, x: Math.random() * window.innerWidth, rotate: 360 }}
                            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, ease: "linear" }}
                            className="absolute text-xl"
                          >
                            {["🪙", "✨", "🎉", "🔥"][Math.floor(Math.random() * 4)]}
                          </motion.div>
                        ))}
                      </div>

                      <motion.div
                        initial={{ scale: 0.85, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.85, y: 50, opacity: 0 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="bg-stone-900 border-2 border-yellow-500/40 p-8 rounded-3xl max-w-md w-full text-center relative overflow-hidden shadow-[0_0_80px_rgba(251,191,36,0.3)]"
                      >
                        {/* Golden Bevel Frame overlay */}
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600" />
                        
                        <div className="absolute top-4 right-4 text-xs font-black tracking-widest text-white/20 select-none font-mono">
                          SECURE REWARD
                        </div>

                        {/* Rarity Ring Header */}
                        <div className="flex justify-center mb-6">
                          <div className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                            <Trophy size={38} className="text-yellow-400" />
                          </div>
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                          JACKPOT WINNER!
                        </span>

                        <h2 className="text-3xl font-black text-white mt-4 uppercase tracking-tight font-display leading-none">
                          CONGRATULATIONS
                        </h2>
                        
                        <div className="my-6 p-5 bg-black/60 rounded-2xl border border-white/5 shadow-inner">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">ITEM RETRIEVED</span>
                          <div className="text-2xl font-black text-yellow-400 mt-1 uppercase tracking-wide">
                            {spinResult.reward}
                          </div>
                          <p className="text-xs text-white/60 mt-2 max-w-xs mx-auto leading-relaxed font-medium">
                            {spinResult.message}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => setShowWinCelebration(false)}
                            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 active:scale-95 transition-all duration-200"
                          >
                            CLAIM & DISMISS
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <Wallet size={18} className="text-[#FF3B30]" /> COINS TRANSACTION HISTORY
                    </h3>
                    <p className="text-xs text-white/40">Detailed ledger of your earnings and redemptions.</p>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-16 text-white/30 text-xs">
                      No transactions registered. Complete searches or log in daily to earn coins!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {transactions.map((t) => (
                        <div key={t.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-white/90">{t.reason}</div>
                            <div className="text-[10px] text-white/40 font-mono mt-0.5">
                              {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className={`font-mono font-black ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {t.amount > 0 ? `+${t.amount}` : t.amount} 🪙
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. REFERRALS TAB */}
            {activeTab === 'referrals' && (
              <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 space-y-6">
                
                {/* Referrers Code Setup */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#FF3B30] tracking-wider">// RECRUITMENT DRIVE</h4>
                    <h3 className="text-base font-black text-white">INVITE FRIENDS, EARN TOGETHER</h3>
                    <p className="text-xs text-white/50 leading-relaxed">
                      Share your custom link. Once your friend completes their first comparison search, you get <span className="text-yellow-500 font-bold">+50 coins</span> and they get <span className="text-yellow-500 font-bold">+20 coins</span>!
                    </p>

                    {referralStats && (
                      <div className="flex bg-white/5 p-2 rounded-lg border border-white/5 items-center justify-between">
                        <span className="font-mono text-xs text-yellow-500 font-black">{referralStats.referralCode}</span>
                        <button 
                          onClick={copyReferralLink}
                          className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit code of who referred you */}
                  {!profile?.referredBy ? (
                    <div className="space-y-3 bg-gradient-to-b from-white/[0.02] to-transparent p-4 rounded-xl border border-white/5 h-full">
                      <h4 className="text-xs font-black uppercase text-yellow-500 tracking-wider">APPLY CODE</h4>
                      <p className="text-[10px] text-white/50 leading-relaxed">
                        Were you invited by a friend? Enter their code below to instantly link and lock in +20 Coins after your first search!
                      </p>
                      <form onSubmit={handleApplyReferral} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. AMAN145"
                          value={refCodeInput}
                          onChange={(e) => setRefCodeInput(e.target.value.toUpperCase())}
                          className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white uppercase placeholder-white/20 focus:ring-0 focus:border-[#FF3B30] flex-1"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#FF3B30] text-white font-black text-xs uppercase tracking-widest rounded hover:bg-red-600 cursor-pointer"
                        >
                          APPLY
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/10 flex flex-col justify-center text-center">
                      <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
                      <div className="text-xs font-black text-green-500 uppercase tracking-widest">Linked and Verified</div>
                      <p className="text-[10px] text-white/40 mt-1">Both you and your referrer are qualified!</p>
                    </div>
                  )}
                </div>

                {/* Dashboard Stats */}
                {referralStats && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <h3 className="text-xs font-black uppercase tracking-wider text-white">REFERRAL OVERVIEW</h3>
                       {(() => {
                         const count = referralStats.successful;
                         let level = "Bronze";
                         let color = "text-orange-400";
                         if (count >= 50) { level = "Legend"; color = "text-purple-500 bg-purple-500/10"; }
                         else if (count >= 25) { level = "Diamond"; color = "text-cyan-400 bg-cyan-400/10"; }
                         else if (count >= 10) { level = "Platinum"; color = "text-slate-200 bg-slate-200/10"; }
                         else if (count >= 5) { level = "Gold"; color = "text-yellow-400 bg-yellow-400/10"; }
                         else if (count >= 1) { level = "Silver"; color = "text-gray-300 bg-gray-300/10"; }
                         else { color = "text-orange-400 bg-orange-400/10"; }
                         return (
                           <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${color}`}>
                             Level: {level}
                           </div>
                         )
                       })()}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      {[
                        { label: 'Total Invites', val: referralStats.total, color: 'text-white' },
                        { label: 'Successful', val: referralStats.successful, color: 'text-green-500' },
                        { label: 'Pending Searches', val: referralStats.pending, color: 'text-yellow-500' },
                        { label: 'Total Coins Earned', val: `${referralStats.coinsEarned} 🪙`, color: 'text-yellow-500 font-bold' }
                      ].map((card, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                          <div className="text-[10px] text-white/40 uppercase tracking-wider">{card.label}</div>
                          <div className={`text-xl font-mono font-black mt-1 ${card.color}`}>{card.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* History */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-black uppercase tracking-widest text-white/40">Invite Log</div>
                      
                      {referralStats.history?.length === 0 ? (
                        <div className="text-xs text-white/30 py-4 text-center">No invites recorded yet. Make some money save suggestions to friends!</div>
                      ) : (
                        <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 text-xs">
                          {referralStats.history.map((h: any, idx: number) => (
                            <div key={idx} className="p-2.5 bg-white/[0.01] border border-white/5 rounded flex justify-between items-center">
                              <div>
                                <span className="font-bold text-white">{h.name}</span>
                                <span className="text-[10px] text-white/40 ml-2">({h.email})</span>
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                                h.status === 'successful' ? 'text-green-500' : h.status === 'pending' ? 'text-yellow-500 animate-pulse' : 'text-red-500'
                              }`}>{h.reward}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* MISSIONS TAB */}
            {activeTab === 'missions' && (
              <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Target size={18} className="text-blue-500" /> MISSION CONTROL
                  </h3>
                  <p className="text-xs text-white/40">Complete daily, weekly, and monthly challenges to earn massive coin bounties.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Daily Missions */}
                  <div className="space-y-4">
                     <h4 className="font-black uppercase tracking-widest text-xs text-green-400">Daily Missions</h4>
                     {[
                       { id: 'daily_search', title: 'Compare 5 Products', reward: 20 },
                       { id: 'daily_share', title: 'Share a Deal', reward: 15 },
                       { id: 'daily_login', title: 'Login & Spin', reward: 10 }
                     ].map(mission => {
                       const isCompleted = profile?.completedMissions?.includes(`${new Date().toISOString().split('T')[0]}_${mission.id}`);
                       return (
                         <div key={mission.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-white/20 transition-all">
                           {isCompleted && <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />}
                           <div>
                             <h5 className="font-bold text-sm text-white">{mission.title}</h5>
                             <div className="font-mono text-xs text-yellow-500 mt-1">+{mission.reward} 🪙</div>
                           </div>
                           <button 
                             onClick={() => handleCompleteMission(mission.id)}
                             disabled={isCompleted}
                             className={`w-full py-2 text-[10px] font-black uppercase tracking-widest rounded ${isCompleted ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                           >
                             {isCompleted ? 'CLAIMED' : 'CLAIM'}
                           </button>
                         </div>
                       )
                     })}
                  </div>
                  
                  {/* Weekly Missions */}
                  <div className="space-y-4">
                     <h4 className="font-black uppercase tracking-widest text-xs text-blue-400">Weekly Missions</h4>
                     {[
                       { id: 'weekly_searches', title: '50 Comparisons', reward: 100 },
                       { id: 'weekly_referrals', title: 'Refer 1 Friend', reward: 150 },
                       { id: 'weekly_saves', title: 'Save ₹5000', reward: 100 }
                     ].map(mission => {
                       const isCompleted = profile?.completedMissions?.includes(`${new Date().toISOString().split('T')[0]}_${mission.id}`);
                       return (
                         <div key={mission.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-white/20 transition-all">
                           {isCompleted && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />}
                           <div>
                             <h5 className="font-bold text-sm text-white">{mission.title}</h5>
                             <div className="font-mono text-xs text-yellow-500 mt-1">+{mission.reward} 🪙</div>
                           </div>
                           <button 
                             onClick={() => handleCompleteMission(mission.id)}
                             disabled={isCompleted}
                             className={`w-full py-2 text-[10px] font-black uppercase tracking-widest rounded ${isCompleted ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                           >
                             {isCompleted ? 'CLAIMED' : 'CLAIM'}
                           </button>
                         </div>
                       )
                     })}
                  </div>

                  {/* Monthly Missions */}
                  <div className="space-y-4">
                     <h4 className="font-black uppercase tracking-widest text-xs text-purple-400">Monthly Missions</h4>
                     {[
                       { id: 'monthly_streak', title: '20 Day Streak', reward: 500 },
                       { id: 'monthly_referrals', title: 'Refer 5 Friends', reward: 1000 },
                       { id: 'monthly_pro', title: 'Become Premium', reward: 500 }
                     ].map(mission => {
                       const isCompleted = profile?.completedMissions?.includes(`${new Date().toISOString().split('T')[0]}_${mission.id}`);
                       return (
                         <div key={mission.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-white/20 transition-all">
                           {isCompleted && <div className="absolute inset-0 bg-purple-500/10 pointer-events-none" />}
                           <div>
                             <h5 className="font-bold text-sm text-white">{mission.title}</h5>
                             <div className="font-mono text-xs text-yellow-500 mt-1">+{mission.reward} 🪙</div>
                           </div>
                           <button 
                             onClick={() => handleCompleteMission(mission.id)}
                             disabled={isCompleted}
                             className={`w-full py-2 text-[10px] font-black uppercase tracking-widest rounded ${isCompleted ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                           >
                             {isCompleted ? 'CLAIMED' : 'CLAIM'}
                           </button>
                         </div>
                       )
                     })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. USER STREAKS TAB */}
            {activeTab === 'streaks' && (
              <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 space-y-6">
                
                <div className="flex items-center gap-3">
                  <Calendar size={24} className="text-[#FF3B30]" />
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">STREAK CONTROL MODULE</h3>
                    <p className="text-xs text-white/40">Consecutive logging streak and milestones schedule.</p>
                  </div>
                </div>

                {/* Streak Counter details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#FF3B30]/5 border border-[#FF3B30]/10 p-5 rounded-xl">
                  <div className="text-center md:text-left space-y-1 col-span-2">
                    <div className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">YOUR CURRENT LEVEL</div>
                    <div className="text-2xl font-black text-white uppercase">{profile?.streakCount || 0} DAY STREAK</div>
                    <p className="text-[10px] text-white/50 leading-relaxed">
                      Always compare prices daily to keep your streak hot. A broken day resets the streak. Keep comparing!
                    </p>
                  </div>
                  <div className="flex justify-center shrink-0">
                    <div className="w-20 h-20 bg-[#FF3B30] text-white font-black text-xl rounded-full flex flex-col justify-center items-center shadow-lg shadow-red-600/30 animate-pulse">
                      <span>🔥</span>
                      <span className="text-xs font-black tracking-tighter">{profile?.streakCount || 0} DAYS</span>
                    </div>
                  </div>
                </div>

                {/* Calendar simulation */}
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">LAST 7 DAYS ACTIVITY</div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const isActive = (profile?.streakCount || 0) > i;
                      const daysAgo = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i];
                      return (
                        <div key={i} className={`p-2 rounded-lg text-center border font-mono ${
                          isActive 
                            ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                            : 'bg-white/5 border-white/5 text-white/20'
                        }`}>
                          <div className="text-[10px] uppercase font-bold">{daysAgo}</div>
                          <div className="text-sm font-black mt-1">{isActive ? '✓' : '•'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Increasing streak reward details */}
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">STREAK REWARDS SCHEDULE</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {[
                      { days: '3 Days', bonus: '15 Coins 🪙', badge: '🔥 Hot' },
                      { days: '7 Days', bonus: '100 Coins 🪙', badge: '⚡ Mega' },
                      { days: '15 Days', bonus: '50 Coins 🪙', badge: '💪 Super' },
                      { days: '30 Days', bonus: '150 Coins 🪙', badge: '👑 Master' },
                      { days: '90 Days', bonus: '300 Coins 🪙', badge: '💎 Epic' },
                      { days: '365 Days', bonus: '1000 Coins 🪙', badge: '🚀 Cosmic' }
                    ].map((st, idx) => {
                      const isAchieved = (profile?.streakCount || 0) >= parseInt(st.days);
                      return (
                        <div key={idx} className={`p-2.5 rounded border flex justify-between items-center ${
                          isAchieved ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-white/5 border-white/5 text-white/40'
                        }`}>
                          <div>
                            <span className="font-bold">{st.days} Milestone</span>
                            <span className="text-[8px] uppercase tracking-widest font-black bg-white/5 text-white/50 px-1 py-0.2 rounded ml-2">{st.badge}</span>
                          </div>
                          <span className="font-mono font-bold text-yellow-500">{st.bonus}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* 4. MILITARY ACHIEVEMENT SYSTEM */}
            {activeTab === 'achievements' && (
              <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Award size={20} className="text-[#FF3B30]" /> QUESTS & MILESTONES
                  </h3>
                  <p className="text-xs text-white/40">Complete price hunting feats to unlock exclusive badges and bountiful coin pools.</p>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((ach) => (
                    <div 
                      key={ach.id} 
                      className={`p-4 rounded-xl border flex gap-4 transition-all ${
                        ach.unlocked 
                          ? 'bg-gradient-to-br from-yellow-500/[0.03] to-transparent border-yellow-500/20' 
                          : 'bg-white/[0.01] border-white/5 filter grayscale opacity-40'
                      }`}
                    >
                      {/* Icon */}
                      <div className="text-3xl p-1 bg-white/5 rounded-lg border border-white/5 shrink-0 flex items-center justify-center w-12 h-12">
                        {ach.icon}
                      </div>

                      {/* Detail */}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase text-white tracking-wider">{ach.title}</h4>
                          <span className="text-[10px] font-bold text-yellow-500 font-mono">+{ach.coinsReward} 🪙</span>
                        </div>
                        <p className="text-[10px] text-white/50 leading-relaxed">{ach.description}</p>
                        
                        {/* Status badge */}
                        <div className="pt-1.5 flex justify-between items-center">
                          <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase ${
                            ach.unlocked ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-white/30'
                          }`}>
                            {ach.unlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. NATIONAL RANKINGS LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 space-y-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <Trophy size={20} className="text-yellow-500" /> BUYWISE NATIONAL ELITE
                    </h3>
                    <p className="text-xs text-white/40">Top 100 users ranked across savings nodes.</p>
                  </div>

                  {/* Leaderboard Category Filters */}
                  <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 max-w-full overflow-x-auto">
                    {[
                      { id: 'coins', label: '🪙 COINS' },
                      { id: 'referrals', label: '🤝 REF' },
                      { id: 'searches', label: '🔍 SEARCH' },
                      { id: 'savings', label: '💰 SAVED' }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        onClick={() => setLeaderboardMetric(btn.id as any)}
                        className={`px-3 py-1.5 rounded text-[8px] font-black tracking-widest transition-all ${
                          leaderboardMetric === btn.id
                            ? 'bg-yellow-500 text-black font-black'
                            : 'text-white/40 hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Leaderboard Table */}
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-16 text-white/30 text-xs">Loading leaderboard metric...</div>
                  ) : (
                    leaderboard.map((u, idx) => {
                      const isMe = u.userId === user?.uid;
                      return (
                        <div key={u.userId} className="flex flex-col">
                          <div 
                            className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                              isMe 
                                ? 'bg-yellow-500/10 border-yellow-500/30 font-bold' 
                                : 'bg-white/[0.01] border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                            {/* Rank Column */}
                            <span className="font-mono font-black text-white/40 w-6 text-center">{u.rank}</span>
                            
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 overflow-hidden shrink-0">
                              <img src={u.avatar} alt="avatar" className="w-full h-full object-cover" />
                            </div>

                            {/* Details */}
                            <div>
                              <div className="text-white/90 flex items-center gap-1.5 font-bold">
                                {u.name}
                                {isMe && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1 py-0.1 rounded font-black">YOU</span>}
                              </div>
                              {u.badge && (
                                <div className="text-[9px] text-yellow-500 uppercase tracking-wider font-bold mt-0.5">{u.badge}</div>
                              )}
                            </div>
                          </div>

                          {/* Leaderboard Values */}
                          <div className="flex items-center gap-4">
                            <div className="text-right font-mono">
                              {leaderboardMetric === 'coins' && <span className="font-bold text-yellow-500">{u.coins} 🪙</span>}
                              {leaderboardMetric === 'referrals' && <span className="font-bold text-green-400">{u.referralsCount} Ref</span>}
                              {leaderboardMetric === 'searches' && <span className="font-bold text-blue-400">{u.searchesCount} Search</span>}
                              {leaderboardMetric === 'savings' && <span className="font-bold text-green-400">{formatPrice(u.savingsCount)}</span>}
                            </div>
                            
                            {!isMe && (
                              <button
                                onClick={() => setTippingUserId(tippingUserId === u.userId ? null : u.userId)}
                                className="px-2 py-1 text-[10px] bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/20 rounded font-bold transition-colors"
                              >
                                Tip 🪙
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Tip Form Dropdown */}
                        <AnimatePresence>
                          {tippingUserId === u.userId && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <form onSubmit={handleTipUser} className="bg-black/30 p-3 flex items-center justify-between gap-3 border-t border-white/5">
                                <div className="text-[10px] text-white/50">Send Coins to <span className="text-white">{u.name}</span></div>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    value={tipAmount}
                                    onChange={(e) => setTipAmount(e.target.value)}
                                    className="w-16 bg-black border border-white/10 rounded px-2 py-1 text-xs text-white text-center font-mono"
                                    min="1"
                                  />
                                  <button 
                                    type="submit"
                                    disabled={claiming === u.userId}
                                    className="px-3 py-1 bg-yellow-500 text-black font-black text-[10px] uppercase rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                  >
                                    {claiming === u.userId ? 'Sending...' : 'Send'}
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                    })
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

        {/* 6. VERIFIED MEMBER REVIEWS & APP FEEDBACK SECTION */}
        <div id="member-reviews-section" className="bg-white/[0.01] p-6 sm:p-8 rounded-2xl border border-white/5 space-y-8 mt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <span className="text-xs font-black tracking-[0.4em] text-yellow-500 uppercase mb-1 block">// APP FEEDBACK ENGINE</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Star size={20} className="text-yellow-500 fill-yellow-500" /> BUYWISE SAVER STORIES & COMMUNITY REVIEWS
              </h3>
              <p className="text-xs text-white/40">Read real feedback from our community of pricing legends and share your own.</p>
            </div>
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg">
              <Sparkles size={14} className="text-yellow-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-wider text-yellow-500 uppercase">FEEDBACK BONUS: +15 COINS 🪙</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Review Submission Form */}
            <form onSubmit={handleSubmitReview} className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5">// SUBMIT FEEDBACK</h4>
              
              {/* Rating Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">SELECT RATING</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-2xl transition-all hover:scale-125 cursor-pointer focus:outline-none"
                    >
                      <Star 
                        size={24} 
                        className={`${
                          star <= reviewRating 
                            ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' 
                            : 'text-white/20 hover:text-white/40'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider block">YOUR SAVINGS STORY / FEEDBACK</label>
                <textarea
                  id="review-comment-textarea"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={`e.g. Saved ${formatPrice(2000)} on my smart TV today!`}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white placeholder-white/20 focus:ring-1 focus:ring-[#FF3B30] focus:border-[#FF3B30] focus:outline-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 bg-[#FF3B30] hover:bg-red-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-md shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    PUBLISHING...
                  </>
                ) : (
                  <>
                    <span>⭐</span> SUBMIT REVIEW & EARN +15 COINS
                  </>
                )}
              </button>
            </form>

            {/* Reviews List Feed */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase text-white/40 tracking-widest flex items-center justify-between">
                <span>// RECENT SAVER REVIEWS ({500 + reviews.length})</span>
                <span className="text-[9px] text-green-400 font-mono tracking-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> Live Synced
                </span>
              </h4>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-white/20 text-xs border border-dashed border-white/5 rounded-xl">
                    No reviews posted yet. Be the first to tell your story!
                  </div>
                ) : (
                  reviews.map((rev, idx) => (
                    <motion.div 
                      key={rev.id} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ delay: (idx % 10) * 0.08, duration: 0.5, ease: "easeOut" }}
                      className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2 relative overflow-hidden group"
                    >
                      {/* Top row */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2.5">
                          {/* Avatar fallback */}
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF3B30]/20 to-[#FF3B30]/5 border border-[#FF3B30]/20 flex items-center justify-center text-xs text-white font-black uppercase">
                            {rev.userName ? rev.userName[0] : 'U'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white/95 flex items-center gap-1.5">
                              {rev.userName}
                              {rev.userId === user?.uid && (
                                <span className="text-[8px] bg-[#FF3B30]/15 text-[#FF3B30] px-1 rounded font-black">YOU</span>
                              )}
                            </div>
                            <div className="text-[9px] text-white/30 font-mono">
                              {new Date(rev.timestamp).toLocaleDateString()} at {new Date(rev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        {/* Stars rating */}
                        <div className="flex items-center gap-0.5 text-yellow-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              className={i < rev.rating ? 'fill-yellow-500' : 'text-white/10'} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-white/70 leading-relaxed font-sans">{rev.comment}</p>

                      {/* Bottom meta */}
                      <div className="pt-1 flex items-center justify-between text-[9px] font-mono border-t border-white/5">
                        <span className="text-white/30">Verified Sourcing Node</span>
                        <span className="text-yellow-500 font-bold bg-yellow-500/5 px-1.5 py-0.5 rounded border border-yellow-500/10">Rewarded: +{rev.coinsEarned} 🪙</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        </>
      )}
    </div>
  );
}
