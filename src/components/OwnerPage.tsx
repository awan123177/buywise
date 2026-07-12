import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, Instagram, Twitter, ArrowRight, Target, Youtube, Mail, Crown, 
  Linkedin, ExternalLink, Globe, Award, Sparkles, Cpu, TrendingUp, Shield, 
  Heart, Calendar, Users, Briefcase, ChevronRight, ChevronLeft, Code, 
  Terminal, Smartphone, Search, Check, Copy, Send, MessageSquare, Compass, Eye, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';

// Robust high-performance counter component that animates when scrolled into view
const Counter = ({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    if (elementRef.current) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const end = value;
          const duration = 2500; // Smooth 2.5s duration
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Cubic ease-out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeProgress * end));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      observer.observe(elementRef.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  }, [value]);

  return (
    <div ref={elementRef} className="font-sans font-extrabold tracking-tight">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
};

export default function OwnerPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTimelineTab, setActiveTimelineTab] = useState<number>(0);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Custom mouse-follow spotlight coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveredContainer, setIsHoveredContainer] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("mohammdsaeed24@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Timeline milestones
  const timelineMilestones = [
    {
      year: "Early 2024",
      title: "The Genesis Idea",
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      description: "Frustrated by artificial discounts and tedious multi-tab price checking, Awan Warsi starts sketching the layout for a single-view, real-time multi-retailer intelligence matrix.",
      details: "The early prototype focused on web parsing and local rate calculation. Operating from a solitary workspace, the goal was clear: empower consumers with real data."
    },
    {
      year: "Mid 2024",
      title: "BuyWise Website Launch",
      icon: <Globe className="w-5 h-5 text-amber-500" />,
      description: "Official launch of the public BuyWise platform. Introduces unified algorithms for immediate price comparison across global giants like Amazon and regional e-commerce stores.",
      details: "Our dynamic index instantly matched up to 500,000 product pages, ensuring shoppers could compare and purchase with complete security."
    },
    {
      year: "Late 2024",
      title: "The Premium Era",
      icon: <Crown className="w-5 h-5 text-amber-500" />,
      description: "Introduces advanced bargain detection, dynamic alert systems, and premium loyalty perks, crafting a self-sustaining utility model loved by high-volume buyers.",
      details: "We layered smart notification protocols that ping consumers when historical lows are breached, turning passive lookups into active bargain wins."
    },
    {
      year: "Early 2025",
      title: "Affiliate & Travel Integration",
      icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
      description: "Expands the core engine to monitor global flights, hotel registries, and local utility providers, becoming a true comprehensive savings utility.",
      details: "Our travel matching algorithms compute dynamic airline pricing trends and identify arbitrage opportunities, cutting search times down to seconds."
    },
    {
      year: "Mid 2025",
      title: "SEO Growth & Massive Scale",
      icon: <Search className="w-5 h-5 text-amber-500" />,
      description: "Programmatic search engines index over 2 million deal vectors, generating thousands of user landings daily with premium server optimization.",
      details: "Leveraging structured schema data and high-performance server architectures, BuyWise became a highly ranked program on organic search metrics."
    },
    {
      year: "Late 2025",
      title: "Advanced AI Core Integration",
      icon: <Cpu className="w-5 h-5 text-amber-500" />,
      description: "Deploying sophisticated LLM agent assistance to analyze complex product trends and deliver conversational insights to customers.",
      details: "Our custom shopping neural nets crawl historic charts to distinguish genuine retail markdowns from engineered pricing traps."
    },
    {
      year: "2026 & Beyond",
      title: "Future Vanguard Horizon",
      icon: <Target className="w-5 h-5 text-amber-500" />,
      description: "Pioneering offline barcode scanning, discounted gift cards, browser extension overlays, and a fully portable iOS/Android application.",
      details: "The future centers on context-aware ambient shopping helpers that work in your browser, your hand, and your physical department stores."
    }
  ];

  // Core pillars / values
  const corePillars = [
    {
      title: "Absolute Transparency",
      icon: <Eye className="w-6 h-6 text-amber-400" />,
      tagline: "Truth in Data",
      description: "We display real prices and historical curves. No sponsored distortions, no dynamic bait-and-switch. We represent the shopper, always."
    },
    {
      title: "AI-First Innovation",
      icon: <Cpu className="w-6 h-6 text-amber-400" />,
      tagline: "Neural Arbitrage",
      description: "Leveraging highly optimized neural query pipelines to run deep checks across multiple global endpoints, discovering savings in milliseconds."
    },
    {
      title: "Elegance & Usability",
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      tagline: "Apple-Standard UI",
      description: "Crafting beautiful, high-contrast dark interfaces with glassmorphic cards, fluid transitions, and clear typographic rhythm."
    },
    {
      title: "Customer Autonomy",
      icon: <Users className="w-6 h-6 text-amber-400" />,
      tagline: "Direct Power",
      description: "Giving consumers the tools to track products, scan real barcodes, and manage travel itineraries without middleman markups."
    }
  ];

  // Achievements
  const achievements = [
    { value: 1200000, suffix: "+", prefix: "", label: "Website Visitors" },
    { value: 85000, suffix: "+", prefix: "", label: "Premium Members" },
    { value: 15000000, suffix: "+", prefix: "", label: "Deals Compared" },
    { value: 2400000, suffix: "+", prefix: "", label: "Products Indexed" },
    { value: 45, suffix: "+", prefix: "", label: "Countries Reached" }
  ];

  // Skills
  const professionalSkills = [
    { name: "Web Development", level: 98, icon: <Code className="w-4 h-4" /> },
    { name: "AI & Neural Search", level: 95, icon: <Cpu className="w-4 h-4" /> },
    { name: "SEO Optimization", level: 96, icon: <Search className="w-4 h-4" /> },
    { name: "UI/UX Design", level: 97, icon: <Sparkles className="w-4 h-4" /> },
    { name: "Business Strategy", level: 93, icon: <Briefcase className="w-4 h-4" /> },
    { name: "Startup Architecture", level: 95, icon: <Terminal className="w-4 h-4" /> },
    { name: "Performance Marketing", level: 90, icon: <TrendingUp className="w-4 h-4" /> }
  ];

  // Future Roadmap Items
  const roadmapItems = [
    { title: "Barcode Scanner", status: "In Development", progress: 85, icon: <Smartphone className="w-5 h-5 text-amber-400" />, desc: "Point your camera at any real product in physical stores to compare against online prices immediately." },
    { title: "Gift Card Market", status: "Planning", progress: 30, icon: <Award className="w-5 h-5 text-amber-400" />, desc: "Purchase deeply discounted retail gift cards to apply directly for double-stack pricing saves." },
    { title: "Flight Search V2", status: "Beta Test", progress: 95, icon: <Globe className="w-5 h-5 text-amber-400" />, desc: "Next-gen prediction engines mapping ticket price fluctuations to book exactly when rates hit absolute zero." },
    { title: "Chrome Extension", status: "In Development", progress: 60, icon: <Code className="w-5 h-5 text-amber-400" />, desc: "A sleek, non-intrusive ambient toolbar popup revealing direct bargains as you browse traditional retailers." },
    { title: "Mobile App Companion", status: "Planning", progress: 25, icon: <Smartphone className="w-5 h-5 text-amber-400" />, desc: "Ultra-fast native iOS and Android application with high-fidelity push notifications and personalized alert streams." },
    { title: "AI Shopping Agent", status: "Prototype", progress: 70, icon: <Cpu className="w-5 h-5 text-amber-400" />, desc: "Autonomous assistant capable of negotiating discounts, tracking loyalty codes, and placing orders on your voice instruction." }
  ];

  // Gallery slider images (stunning startup office tech moments + actual founder image)
  const galleryImages = [
    {
      url: "/founder.jpg?v=10",
      title: "Executive Portrait",
      desc: "Awan Warsi, sole Founder, Owner, CEO & Chairman."
    },
    {
      url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200",
      title: "AI Synthesis Lab",
      desc: "Optimizing the high-throughput web scraping neural pipelines."
    },
    {
      url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1200",
      title: "Design System Architecture",
      desc: "Drafting the sleek user interfaces and bento layouts for the scanner platform."
    },
    {
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200",
      title: "Full-Stack Command",
      desc: "Debugging the core comparison engine with clean, lightweight server patterns."
    }
  ];

  const handleNextGallery = () => {
    setActiveGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevGallery = () => {
    setActiveGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHoveredContainer(true)}
      onMouseLeave={() => setIsHoveredContainer(false)}
      className="min-h-screen bg-[#030303] text-white overflow-hidden relative selection:bg-amber-500/30 selection:text-amber-200 font-sans"
    >
      <SEO 
        title="Awan Warsi | Founder, Owner & Chairman of BuyWise"
        description="Meet Awan Warsi, the sole Founder, Owner, CEO, and Chairman of BuyWise. Discover his vision, timeline achievements, startup engineering strategy, and future AI roadmap."
        canonicalUrl="https://buywiser.store/owner"
      />
      
      {/* Schema.org Person & Organization Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": "https://buywiser.store/owner#person-warsi",
              "name": "Awan Warsi",
              "jobTitle": ["Founder", "Owner", "CEO", "Chairman"],
              "image": "https://buywiser.store/founder.jpg",
              "url": "https://buywiser.store/owner",
              "worksFor": {
                "@type": "Organization",
                "name": "BuyWise",
                "url": "https://buywiser.store",
                "logo": "https://buywiser.store/icon.png"
              },
              "sameAs": [
                "mailto:mohammdsaeed24@gmail.com",
                "https://github.com",
                "https://instagram.com"
              ],
              "description": "Awan Warsi is the sole Founder, Owner, CEO, and Chairman of BuyWise, directing technical innovation and global AI shopping algorithms."
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://buywiser.store"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Founder",
                  "item": "https://buywiser.store/owner"
                }
              ]
            }
          ]
        })}
      </script>

      {/* LUXURY BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Ambient Moving Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-amber-500/10 to-transparent blur-[130px] opacity-70 animate-pulse duration-10000" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-amber-600/5 to-transparent blur-[150px] opacity-60 animate-pulse duration-8000" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-[#FF3B30]/5 blur-[160px] opacity-40" />

        {/* Dynamic Interactive Spotlight / Glow following mouse */}
        {isHoveredContainer && (
          <div 
            className="absolute w-[600px] h-[600px] rounded-full bg-amber-500/[0.04] blur-[120px] transition-all duration-300 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: mousePos.x, top: mousePos.y }}
          />
        )}

        {/* Subtle Tech Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-80" />
        
        {/* Soft elegant particle sparks floating around */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-10 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_80%,transparent_100%)]" />

        {/* Grainy Noise Overlays */}
        <div className="absolute inset-0 bg-[#000000] opacity-[0.02] mix-blend-overlay pointer-events-none" />
      </div>

      <div className="relative z-10">
        
        {/* 1. FULL-SCREEN HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-12 pt-32 pb-20 overflow-hidden">
          {/* Rotating ambient luxury lines inside hero */}
          <div className="absolute w-[800px] h-[800px] rounded-full border border-amber-500/[0.05] animate-spin pointer-events-none duration-100000" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-dashed border-amber-500/[0.03] animate-spin pointer-events-none duration-60000" />

          {/* Glowing particle stars inside hero wrapper */}
          <div className="absolute top-1/4 left-10 md:left-20 w-2 h-2 bg-amber-400 rounded-full blur-[2px] animate-ping duration-3000" />
          <div className="absolute bottom-1/3 right-12 w-3 h-3 bg-amber-500/40 rounded-full blur-[3px] animate-pulse duration-2000" />

          <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
            
            {/* Elegant luxury badge */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 flex items-center gap-2.5 bg-amber-500/[0.07] border border-amber-500/20 rounded-full px-5 py-2 text-[10px] uppercase tracking-[0.3em] font-semibold text-amber-400 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.05)]"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Executive Profile & Leadership</span>
            </motion.div>

            {/* Glowing circular portrait frame with gold animated ring */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-48 h-48 md:w-56 md:h-56 mb-12 group"
            >
              {/* Outer soft glowing neon circle */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-600 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
              
              {/* Rotating golden double rings */}
              <div className="absolute -inset-1.5 rounded-full border border-amber-500/40 animate-spin duration-15000 pointer-events-none" />
              <div className="absolute -inset-3 rounded-full border border-dashed border-amber-500/20 animate-spin duration-30000 pointer-events-none" />
              
              {/* Profile Image container */}
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-500/60 p-1 bg-[#111111] relative z-10">
                <img 
                  src="/founder.jpg?v=10" 
                  alt="Awan Warsi" 
                  className="w-full h-full object-cover object-top rounded-full transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating micro indicators */}
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-600 to-amber-400 p-2.5 rounded-full border border-black/80 shadow-lg z-20 hover:scale-110 transition-transform">
                <Award className="w-4 h-4 text-black" />
              </div>
            </motion.div>

            {/* Title / Headings */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="text-sm font-black font-mono text-white/40 uppercase tracking-[0.4em] mb-3 block">
                The Sole Founder, Owner & Chairman
              </span>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black font-serif tracking-tight text-white mb-6 select-none leading-[0.9]">
                Awan Warsi
              </h1>
              <div className="flex items-center justify-center gap-3 mb-10">
                <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-amber-500/60"></span>
                <span className="text-amber-500 font-serif text-lg md:text-2xl font-light italic tracking-wide">
                  BuyWise Platform Architect
                </span>
                <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-amber-500/60"></span>
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-base md:text-xl text-white/70 font-light tracking-wide max-w-3xl mb-12 leading-relaxed"
            >
              "Engineering the next paradigm of e-commerce utility. By combining programmatically aggregated rate tracking, neural pricing classifiers, and unified global search frameworks, we restore final purchase parity directly to the shopper."
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center gap-5 justify-center z-20"
            >
              <button 
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-9 py-4 bg-transparent text-amber-400 font-semibold tracking-widest rounded-full border border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/60 transition-all duration-500 flex items-center justify-center gap-3 group uppercase text-xs"
              >
                <span>Explore BuyWise Dashboard</span> 
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
              <a 
                href="https://buywiser.store"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-extrabold tracking-widest rounded-full hover:from-amber-500 hover:to-amber-400 transition-all duration-500 shadow-[0_15px_30px_rgba(245,158,11,0.15)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 uppercase text-xs"
              >
                <span>Visit buywiser.store</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </motion.div>

          </div>

          {/* Floating mouse indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 pointer-events-none">
            <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-white/40">Scroll to Explore</span>
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
              <div className="w-1.5 h-2 bg-amber-500 rounded-full animate-bounce" />
            </div>
          </div>
        </section>

        {/* 2. ACHIEVEMENTS SECTION (BENTO SCROLL COUNTERS) */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 mb-2 block">Metrics & Scale</span>
            <h2 className="text-3xl md:text-5xl font-black font-serif tracking-tight text-white">Proven Performance Indicators</h2>
          </div>

          {/* Grid Bento Layout */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {achievements.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-[#080808]/80 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-amber-500/20 p-6 flex flex-col justify-between group transition-all duration-500 hover:shadow-[0_10px_30px_rgba(245,158,11,0.03)]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-sm font-mono font-bold group-hover:scale-110 transition-transform">
                    {`0${idx + 1}`}
                  </div>
                  <TrendingUp className="w-4 h-4 text-white/20 group-hover:text-amber-500/60 transition-colors" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl lg:text-4xl text-amber-500 mb-1 flex items-baseline gap-0.5">
                    <Counter value={item.value} suffix={item.suffix} prefix={item.prefix} />
                  </div>
                  <div className="text-xs font-mono uppercase tracking-wider text-white/40 group-hover:text-white/60 transition-colors">
                    {item.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. STORY SECTION (BEAUTIFUL GLASS TIMELINE) */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-16 items-start">
            
            {/* Story Left Column */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 mb-2 block">Origin Story</span>
                <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-white mb-6">
                  The Journey of <span className="text-amber-500 font-style-italic italic">BuyWise</span>
                </h2>
                <div className="w-20 h-[1px] bg-amber-500" />
              </div>

              <div className="space-y-6 text-white/60 font-light text-base md:text-lg leading-relaxed">
                <p>
                  Every great utility is born from a simple annoyance. BuyWise was founded in early 2024 by Awan Warsi. What started as a basic local scraper to find consistent prices has grown into a world-class program.
                </p>
                <p>
                  "I watched standard retail stores dynamically inflates pricing for returning visitors, manipulating tracking cookies to create urgency. I knew technology could fix this."
                </p>
                <p className="text-amber-200/90 font-medium font-serif italic text-lg border-l-2 border-amber-500/50 pl-4 py-1">
                  "Parity in purchasing is a core consumer right. BuyWise is engineered to put that power back into user hands."
                </p>
              </div>

              {/* Minimal Credentials badge */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                <Crown className="w-8 h-8 text-amber-500 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-white">Awan Warsi</div>
                  <div className="text-xs text-white/40 font-mono">Founder, Owner, CEO & Chairman</div>
                </div>
              </div>
            </div>

            {/* Timeline Right Column */}
            <div className="lg:col-span-7 relative pl-4 md:pl-8">
              {/* Vertical timeline spine */}
              <div className="absolute left-4 md:left-8 top-2 bottom-2 w-[1px] bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent" />

              <div className="space-y-12">
                {timelineMilestones.map((milestone, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 25 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                    className="relative pl-10 md:pl-16 group"
                  >
                    {/* Interactive anchor bullet */}
                    <div className="absolute left-[3px] md:left-[19px] top-1 w-6 h-6 rounded-full bg-[#030303] border-2 border-amber-500/40 flex items-center justify-center group-hover:border-amber-400 group-hover:scale-110 transition-all duration-300 z-10">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                    </div>

                    {/* Timeline card with glassmorphism */}
                    <div className="p-6 md:p-8 rounded-3xl bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/5 hover:border-amber-500/20 hover:bg-[#0c0c0c]/80 transition-all duration-500 shadow-xl group-hover:shadow-[0_15px_40px_rgba(245,158,11,0.02)]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full w-max">
                          {milestone.year}
                        </span>
                        <div className="flex items-center gap-1 text-white/30 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Global Operations</span>
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-black font-serif text-white mb-3 group-hover:text-amber-400 transition-colors">
                        {milestone.title}
                      </h3>

                      <p className="text-white/60 font-light text-sm md:text-base leading-relaxed mb-4">
                        {milestone.description}
                      </p>

                      <div className="text-xs font-mono text-white/40 leading-relaxed border-t border-white/5 pt-4 group-hover:text-white/50 transition-colors">
                        {milestone.details}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* 4. MISSION & PILLARS SECTION (STUNNING CARDS WITH GLOW) */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
          <div className="absolute right-10 top-1/2 w-80 h-80 bg-amber-500/[0.01] blur-[120px] rounded-full pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 mb-2 block">Operational Creed</span>
            <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-white mb-6">Values & Core Pillars</h2>
            <p className="text-white/50 font-light text-base md:text-lg">
              BuyWise isn't just an app. It's a technical philosophy committed to accuracy, scalability, and absolute user priority.
            </p>
          </div>

          {/* Grid Layout of Pillars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {corePillars.map((pillar, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-[#0a0a0a] to-[#040404] border border-white/5 hover:border-amber-500/30 transition-all duration-500 relative overflow-hidden group shadow-2xl hover:translate-y-[-5px]"
              >
                {/* Spotlight background hover */}
                <div className="absolute top-[-50%] right-[-50%] w-72 h-72 bg-amber-500/[0.03] blur-[80px] rounded-full group-hover:opacity-100 opacity-30 transition-opacity duration-700 pointer-events-none" />
                
                {/* Indicator neon gold accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-8 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all duration-300">
                  {pillar.icon}
                </div>

                <div className="text-[10px] font-mono tracking-widest uppercase text-amber-400 mb-2 font-bold">
                  {pillar.tagline}
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                  {pillar.title}
                </h3>
                
                <p className="text-sm text-white/50 font-light leading-relaxed group-hover:text-white/70 transition-colors">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. PORTFOLIO & INTERACTIVE GALLERY SECTION */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
          <div className="absolute left-1/3 top-1/3 w-[500px] h-[500px] bg-amber-500/[0.01] blur-[150px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 mb-2 block">Visual Chronicle</span>
              <h2 className="text-3xl md:text-5xl font-black font-serif tracking-tight text-white">Interactive Moments</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrevGallery}
                className="w-12 h-12 rounded-full border border-white/10 hover:border-amber-500/40 bg-[#080808]/80 flex items-center justify-center text-white/70 hover:text-amber-400 transition-all duration-300"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-mono text-xs text-white/40 tracking-wider">
                {activeGalleryIndex + 1} / {galleryImages.length}
              </span>
              <button 
                onClick={handleNextGallery}
                className="w-12 h-12 rounded-full border border-white/10 hover:border-amber-500/40 bg-[#080808]/80 flex items-center justify-center text-white/70 hover:text-amber-400 transition-all duration-300"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Large display active slide with zoom and lightbox link */}
          <div className="relative aspect-[16/10] md:aspect-[21/9] w-full rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#080808] group">
            {/* Subtle glow border */}
            <div className="absolute inset-0 border border-amber-500/10 rounded-[2.5rem] pointer-events-none z-20 group-hover:border-amber-500/30 transition-colors duration-500" />
            
            {/* Gradient overlay inside image bottom */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent z-10" />

            <AnimatePresence mode="wait">
              <motion.img 
                key={activeGalleryIndex}
                src={galleryImages[activeGalleryIndex].url}
                alt={galleryImages[activeGalleryIndex].title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Slide context details bottom-left */}
            <div className="absolute bottom-8 left-8 right-8 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full mb-3 inline-block">
                  Insight Profile
                </span>
                <h3 className="text-2xl md:text-3xl font-black font-serif text-white mb-2">
                  {galleryImages[activeGalleryIndex].title}
                </h3>
                <p className="text-sm text-white/60 font-light leading-relaxed max-w-xl">
                  {galleryImages[activeGalleryIndex].desc}
                </p>
              </div>

              {/* Lightbox Trigger button */}
              <button 
                onClick={() => setLightboxImage(galleryImages[activeGalleryIndex].url)}
                className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium tracking-wide rounded-xl border border-white/10 hover:border-white/30 backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs"
              >
                <Eye className="w-4 h-4" />
                <span>View Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Lightbox full overlay */}
          <AnimatePresence>
            {lightboxImage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxImage(null)}
                className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 backdrop-blur-md cursor-zoom-out"
              >
                <button 
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-6 right-6 text-white/60 hover:text-white text-sm font-mono tracking-widest uppercase bg-white/5 border border-white/10 px-4 py-2 rounded-lg"
                >
                  Close [ESC]
                </button>
                <motion.img 
                  src={lightboxImage}
                  alt="Fullscreen view"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-white/10"
                  referrerPolicy="no-referrer"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Row of preview thumbnails */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveGalleryIndex(idx)}
                className={`relative aspect-[16/10] rounded-2xl overflow-hidden border transition-all duration-500 bg-[#080808] ${idx === activeGalleryIndex ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-white/5 opacity-50 hover:opacity-80'}`}
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        </section>

        {/* 6. SKILLS SECTION (LUXURY PROGRESS METERS) */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 mb-2 block">Competence Profile</span>
              <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-white">Startup Execution Matrix</h2>
              <div className="w-16 h-[1px] bg-amber-500" />
              <p className="text-white/50 font-light text-base md:text-lg leading-relaxed">
                Structuring an executive startup involves bridging advanced technical competence with rigorous search optimization and financial agility. Awan Warsi holds deep, direct command across the core domains that power modern commerce utility.
              </p>
              <div className="p-6 rounded-2xl bg-amber-500/[0.02] border border-amber-500/10 flex items-start gap-4">
                <Terminal className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-white/40 leading-relaxed font-mono">
                  Stack: React, TypeScript, Node.js, Express, Programmatic SEO (D3, Recharts), Scraping clusters, Database shards (Supabase/Postgres), and Neural semantic embeddings.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#0a0a0a]/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.01] blur-[80px] rounded-full pointer-events-none" />

              {professionalSkills.map((skill, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white/80 font-medium">
                      <div className="text-amber-500">
                        {skill.icon}
                      </div>
                      <span className="text-sm md:text-base font-serif">{skill.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {skill.level}%
                    </span>
                  </div>

                  {/* Meter Track */}
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                    {/* Animated fill indicator */}
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 7. FUTURE ROADMAP (BEAUTIFUL INTERACTIVE ROADMAP) */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 mb-2 block">Upcoming Horizon</span>
            <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-white mb-6">Strategic Product Roadmap</h2>
            <p className="text-white/50 font-light text-base md:text-lg">
              Our engineering lifecycle moves fast. Here's what we are actively crafting, beta testing, and shipping to double down on savings efficiency.
            </p>
          </div>

          {/* Grid list of upcoming products */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmapItems.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="bg-[#0a0a0a]/50 backdrop-blur-xl rounded-3xl border border-white/5 hover:border-amber-500/20 p-8 transition-all duration-500 relative group overflow-hidden shadow-2xl"
              >
                {/* Floating highlight */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.01] blur-[50px] rounded-full pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity duration-500" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className={`text-[9px] font-bold tracking-widest uppercase font-mono px-3 py-1 rounded-full border ${
                    item.status === 'Beta Test' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    item.status === 'In Development' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                    'bg-white/5 border-white/10 text-white/50'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 font-serif group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-sm text-white/50 font-light leading-relaxed mb-6">
                  {item.desc}
                </p>

                {/* Progress Mini indicator */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-white/30">
                    <span>Integration Progress</span>
                    <span className="text-amber-500/80">{item.progress}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 8. QUOTE SECTION (CINEMATIC DISPLAY) */}
        <section className="py-32 relative overflow-hidden border-y border-white/5 bg-gradient-to-b from-[#030303] via-[#080808] to-[#030303]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/[0.02] blur-[150px] rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
            {/* Cinematic quotes indicator */}
            <span className="font-serif text-[10rem] text-amber-500/10 leading-none h-16 block -mb-4 select-none">“</span>
            
            <blockquote className="text-3xl md:text-5xl lg:text-6xl font-light leading-tight text-white mb-10 font-serif italic tracking-tight">
              Every great company starts with one idea and the courage to build it.
            </blockquote>
            
            <div className="w-16 h-[1px] bg-amber-500 mx-auto mb-6" />
            
            <div className="space-y-1">
              <span className="text-lg font-bold text-amber-400 tracking-[0.2em] uppercase font-sans">Awan Warsi</span>
              <p className="text-xs text-white/40 uppercase tracking-widest font-mono">
                Founder, Owner & Chairman, BuyWise
              </p>
            </div>
          </div>
        </section>

        {/* 9. LUXURY CONTACT & SOCIAL HUB (DIGITAL BUSINESS CARD) */}
        <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto relative">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/80 mb-2 block">Direct Access</span>
            <h2 className="text-3xl md:text-5xl font-black font-serif tracking-tight text-white">Executive Contact</h2>
          </div>

          <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
            {/* Spotlight and decorative shapes inside card */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.03] blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

            <div className="grid md:grid-cols-12 gap-12 items-center relative z-10">
              
              {/* Left visual mockup side */}
              <div className="md:col-span-5 flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.01] border border-white/5 relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-amber-500/30 p-1 mb-4">
                  <img 
                    src="/founder.jpg?v=10" 
                    alt="Awan Warsi" 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-lg font-bold text-white font-serif">Awan Warsi</h3>
                <p className="text-xs text-amber-400 uppercase tracking-widest font-mono mb-6">Founder & CEO</p>
                
                <div className="space-y-2.5 w-full text-left font-mono text-xs text-white/50 border-t border-white/5 pt-6">
                  <div className="flex justify-between">
                    <span>Identity:</span>
                    <span className="text-white/80">Executive Admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400">● Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-amber-400 hover:underline cursor-pointer" onClick={handleCopyEmail}>mohammdsaeed...</span>
                  </div>
                </div>
              </div>

              {/* Right input / link list side */}
              <div className="md:col-span-7 space-y-8">
                <div>
                  <h4 className="text-xl font-bold font-serif text-white mb-2">Connect Digitally</h4>
                  <p className="text-sm text-white/50 font-light leading-relaxed">
                    Whether looking for strategic brand alliances, technical discussions, or investment horizons, feel free to connect across our channels.
                  </p>
                </div>

                {/* Email Copy Card */}
                <div className="p-4 rounded-2xl bg-[#030303] border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/30">Official Email</div>
                      <div className="text-sm font-semibold text-white/80 truncate font-mono">mohammdsaeed24@gmail.com</div>
                    </div>
                  </div>

                  <button 
                    onClick={handleCopyEmail}
                    className="p-3 bg-white/5 hover:bg-amber-500/10 text-white hover:text-amber-400 rounded-xl border border-white/10 hover:border-amber-500/30 transition-all duration-300 shrink-0"
                    title="Copy Email"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Grid of luxurious social buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Mail", icon: <Mail className="w-4 h-4" />, url: "mailto:mohammdsaeed24@gmail.com" },
                    { label: "GitHub", icon: <Github className="w-4 h-4" />, url: "https://github.com" },
                    { label: "Instagram", icon: <Instagram className="w-4 h-4" />, url: "https://instagram.com" },
                    { label: "Twitter", icon: <Twitter className="w-4 h-4" />, url: "https://x.com" },
                    { label: "YouTube", icon: <Youtube className="w-4 h-4" />, url: "https://youtube.com" }
                  ].map((soc, idx) => (
                    <a 
                      key={idx}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 hover:shadow-[0_0_15px_rgba(245,158,11,0.05)] text-white/60 hover:text-amber-400 flex flex-col items-center justify-center gap-2 text-center transition-all duration-300"
                    >
                      <div className="p-1">{soc.icon}</div>
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">{soc.label}</span>
                    </a>
                  ))}
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 10. LUXURY BREADCRUMBS & FOOTER ACCENT */}
        <footer className="py-12 border-t border-white/5 relative z-10 text-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Minimalist breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono text-white/30">
              <span className="hover:text-white cursor-pointer" onClick={() => navigate('/')}>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-amber-500/80 font-semibold">Founder Profile</span>
            </div>

            <div className="text-[10px] font-mono tracking-widest text-white/30 uppercase">
              &copy; {new Date().getFullYear()} BuyWise. Engineered under absolute sovereign ownership.
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}
