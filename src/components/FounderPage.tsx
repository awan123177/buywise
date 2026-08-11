import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'motion/react';
import { ExternalLink, Instagram, Linkedin, Github, Mail, ArrowRight, Smartphone, Sparkles, Target, Zap, Bot, ShieldCheck, Tag, Box } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

const FOUNDER_INFO = {
  name: "Awan Warsi",
  title: "Owner & Chairman of BuyWise",
  description: "A digital exhibition of the BuyWise story.",
  image: "/api/founder-image",
  social: {
    website: "https://awan.pro",
    instagram: "https://instagram.com/awanwarsi",
    linkedin: "https://linkedin.com/in/awanwarsi",
    github: "https://github.com/awanwarsi",
    email: "mailto:hello@awan.pro"
  }
};

const FOCUS_AREAS = [
  { title: "AI Shopping", icon: <Bot size={40} className="text-[#4F7FFF]" />, desc: "The ultimate intelligent assistant." },
  { title: "Price Tracking", icon: <Target size={40} className="text-white" />, desc: "Never miss a price drop again." },
  { title: "Premium", icon: <Sparkles size={40} className="text-orange-400" />, desc: "Exclusive features for power users." },
  { title: "SEO Engine", icon: <Zap size={40} className="text-white" />, desc: "Reaching millions organically." },
  { title: "Price Comparison", icon: <Box size={40} className="text-[#4F7FFF]" />, desc: "Cross-platform analytics." },
  { title: "Gift Cards", icon: <Tag size={40} className="text-white" />, desc: "Seamless digital gifting.", comingSoon: true },
  { title: "Barcode Scanner", icon: <Smartphone size={40} className="text-white" />, desc: "Physical to digital instantly." },
];

export default function FounderPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { scrollYProgress } = useScroll({ 
    target: containerRef,
    offset: ["start start", "end end"] 
  });
  
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Chapter 2 Animations
  const confusionOpacity = useTransform(smoothProgress, [0.15, 0.25, 0.35], [0, 1, 0]);
  const clarityOpacity = useTransform(smoothProgress, [0.35, 0.45, 0.55], [0, 1, 0]);
  const clarityScale = useTransform(smoothProgress, [0.35, 0.45], [0.8, 1]);

  // Horizontal Scroll Animation
  const focusRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: focusScroll } = useScroll({
    target: focusRef,
    offset: ["start end", "end start"]
  });
  const xTransform = useTransform(focusScroll, [0, 1], ["0%", "-50%"]);

  return (
    <div className="bg-[#050505] text-[#F8F8F8] font-sans overflow-x-hidden selection:bg-[#4F7FFF] selection:text-white" ref={containerRef}>
      <Helmet>
        <title>The Story of BuyWise | Awan Warsi</title>
        <meta name="description" content={FOUNDER_INFO.description} />
      </Helmet>

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F7FFF] to-[#F8F8F8] origin-left z-[200]"
        style={{ scaleX: smoothProgress }}
      />

      {/* OPENING */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-[#4F7FFF]/5 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-white/5 rounded-full blur-[120px] mix-blend-screen" />
          <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-[2px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="relative z-10 flex flex-col items-center text-center px-6"
        >
          <h1 className="text-6xl md:text-9xl font-medium tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
            Awan Warsi
          </h1>
          <p className="text-[#4F7FFF] uppercase tracking-[0.4em] text-xs md:text-sm font-bold mb-16">
            {FOUNDER_INFO.title}
          </p>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 1 }}
            className="relative w-48 h-64 md:w-64 md:h-80 rounded-2xl overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
            <img 
              src={FOUNDER_INFO.image} 
              alt={FOUNDER_INFO.name}
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"; }}
            />
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/30"
        >
          <span className="text-[10px] uppercase tracking-widest mb-4">Discover the Story</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* CHAPTER 1: The Problem */}
      <section className="h-[150vh] relative">
        <div className="sticky top-0 h-screen flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-4xl text-center"
          >
            <h2 className="text-4xl md:text-7xl font-medium tracking-tight leading-tight mb-8">
              "I didn't want people to waste money."
            </h2>
            <p className="text-xl md:text-2xl text-white/40 font-light max-w-2xl mx-auto">
              The internet is vast. Prices fluctuate by the second. Consumers were losing the battle against dynamic pricing algorithms. 
            </p>
          </motion.div>
        </div>
      </section>

      {/* CHAPTER 2: The Confusion & The Solution */}
      <section className="h-[200vh] relative">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
          {/* Confusion State */}
          <motion.div 
            style={{ opacity: confusionOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6"
          >
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: Math.random() * 400 - 200, y: Math.random() * 400 - 200, opacity: 0 }}
                  animate={{ 
                    x: Math.random() * 200 - 100, 
                    y: Math.random() * 200 - 100,
                    opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, repeatType: "mirror" }}
                  className="absolute p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md whitespace-nowrap"
                >
                  <span className="text-red-400 font-mono">₹{Math.floor(Math.random() * 50000 + 10000)}</span>
                  <div className="w-24 h-2 bg-white/10 rounded mt-2" />
                </motion.div>
              ))}
              <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-white/20 z-10 mix-blend-overlay">
                CHAOS.
              </h2>
            </div>
          </motion.div>

          {/* Clarity State */}
          <motion.div 
            style={{ opacity: clarityOpacity, scale: clarityScale }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] p-6"
          >
            <div className="w-24 h-24 rounded-full bg-[#4F7FFF]/20 flex items-center justify-center mb-8 border border-[#4F7FFF]/50 shadow-[0_0_50px_rgba(79,127,255,0.3)]">
              <Bot size={40} className="text-[#4F7FFF]" />
            </div>
            <h2 className="text-4xl md:text-7xl font-medium tracking-tight mb-6 text-center">
              Then BuyWise appeared.
            </h2>
            <p className="text-2xl text-white/50 font-light text-center">
              Everything became simple.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CHAPTER 3: Cinematic Storytelling */}
      <section className="py-40 px-6 max-w-4xl mx-auto space-y-[40vh]">
        {[
          "We stripped away the noise.",
          "We built an engine that tracks millions of data points in real-time.",
          "Not just another aggregator. A personal AI shopper.",
          "Designed for elegance. Engineered for precision."
        ].map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-40%" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center"
          >
            <h3 className="text-3xl md:text-5xl font-medium leading-relaxed text-white/90">
              {text}
            </h3>
          </motion.div>
        ))}
      </section>

      {/* CHAPTER 4: Current Focus (Infinite Marquee) */}
      <section className="py-40 relative bg-[#0A0A0A] overflow-hidden">
        <div className="flex flex-col justify-center">
          <div className="px-6 md:px-16 mb-16 max-w-7xl mx-auto w-full">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight">The Ecosystem</h2>
            <p className="text-white/40 mt-4 text-xl">Current focus areas and active development.</p>
          </div>
          
          <div className="relative w-full overflow-hidden flex">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 30, repeat: Infinity }}
              className="flex gap-6 md:gap-8 px-4 w-max"
            >
              {[...FOCUS_AREAS, ...FOCUS_AREAS].map((area, idx) => (
                <div 
                  key={idx}
                  className="w-[85vw] sm:w-[350px] md:w-[400px] shrink-0 h-[400px] p-8 md:p-10 rounded-3xl bg-[#121212] border border-white/5 flex flex-col justify-between group hover:border-white/20 transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-[#4F7FFF]/10 transition-colors duration-700" />
                  
                  <div>
                    <div className="mb-8">
                      {area.icon}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-medium mb-4">{area.title}</h3>
                    <p className="text-white/50 text-base md:text-lg leading-relaxed">{area.desc}</p>
                  </div>

                  {area.comingSoon && (
                    <div className="self-start px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-orange-400">
                      Coming Soon
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CHAPTER 5: Future Vision */}
      <section className="py-40 px-6 relative overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,127,255,0.05),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex-1"
          >
            <h2 className="text-5xl md:text-7xl font-medium tracking-tight mb-8">
              The Future
            </h2>
            <p className="text-2xl text-white/50 font-light leading-relaxed mb-8">
              We are not just building a product. We are building the infrastructure for intelligent consumption. A seamless bridge between human intent and digital execution.
            </p>
          </motion.div>

          <div className="flex-1 relative h-[500px] w-full flex items-center justify-center">
            {/* Floating Glass Objects */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-20 w-64 h-64 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center justify-center"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#4F7FFF] to-white/20 blur-2xl opacity-50" />
            </motion.div>
            
            <motion.div 
              animate={{ 
                y: [0, 30, 0],
                rotate: [0, -10, 0],
                x: [0, -20, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute z-10 w-48 h-48 rounded-full bg-[#121212] border border-white/5 -left-10 top-10 flex items-center justify-center"
            >
              <Sparkles size={32} className="text-white/20" />
            </motion.div>

            <motion.div 
              animate={{ 
                y: [0, -40, 0],
                x: [0, 30, 0]
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute z-30 w-32 h-32 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 right-0 bottom-10"
            />
          </div>
        </div>
      </section>

      {/* ENDING */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative bg-[#000000]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10"
        >
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-[#f5f5f5] uppercase leading-none mb-12">
            BUY<span className="text-[#4F7FFF]">WISE</span>
          </h1>
          
          <p className="text-xl text-white/40 font-light mb-16">
            Thank you for experiencing the journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={() => navigate('/')}
              className="px-10 py-5 bg-white text-black rounded-full font-medium tracking-wide hover:scale-105 hover:bg-[#4F7FFF] hover:text-white transition-all duration-500 flex items-center justify-center gap-3 group"
            >
              Explore BuyWise
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <div className="flex gap-4 ml-0 sm:ml-8 mt-8 sm:mt-0">
              {[
                { icon: <Mail size={20} />, href: FOUNDER_INFO.social.email },
                { icon: <Linkedin size={20} />, href: FOUNDER_INFO.social.linkedin },
                { icon: <Instagram size={20} />, href: FOUNDER_INFO.social.instagram },
                { icon: <Github size={20} />, href: FOUNDER_INFO.social.github }
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all duration-300"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Subtle Bottom Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[20vh] bg-[#4F7FFF]/10 blur-[100px] pointer-events-none" />
      </section>
      
      {/* Spacer for dock on mobile if needed */}
      <div className="h-32 xl:hidden bg-[#000]" />
    </div>
  );
}
