import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Github, Instagram, ArrowRight, Mail, 
  ExternalLink, Globe, Sparkles, Cpu, Shield, 
  Code, Terminal, Smartphone, Search, 
  Layout, Zap, Rocket, Activity, Lightbulb, Box,
  X, Maximize2, Users, Crown, Eye, Target, Map
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FounderSEO = () => {
  const title = "Awan Warsi | Founder, Owner & Chairman of BuyWise";
  const description = "Building the future of AI-powered smart shopping. Explore the journey, vision, and mission of BuyWise.";
  const canonicalUrl = "https://buywiser.store/owner";
  const image = "https://buywiser.store/founder.jpg";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://buywiser.store/owner#person-warsi",
        "name": "Awan Warsi",
        "jobTitle": ["Founder", "Owner", "Chairman"],
        "image": image,
        "url": canonicalUrl,
        "worksFor": {
          "@type": "Organization",
          "name": "BuyWise",
          "url": "https://buywiser.store"
        },
        "sameAs": [
          "mailto:mohammdsaeed24@gmail.com",
          "https://github.com",
          "https://instagram.com"
        ],
        "description": description
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
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="profile:first_name" content="Awan" />
      <meta property="profile:last_name" content="Warsi" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }[] = [];
    const particleCount = 50;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
      resize();
      init();
    });

    resize();
    init();
    animate();

    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
};

const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-amber-600/10 blur-[150px] animate-pulse duration-[10000ms] mix-blend-screen" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-yellow-600/10 blur-[150px] animate-pulse duration-[7000ms] mix-blend-screen" />
    <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px] mix-blend-screen" />
    <Particles />
    <div className="absolute inset-0 bg-black/60 backdrop-blur-[30px]" />
  </div>
);

export default function FounderPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const [copied, setCopied] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText("mohammdsaeed24@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timelineMilestones = [
    { year: "2023", title: "Started BuyWise", description: "The initial vision of building an AI-powered smart shopping assistant took root." },
    { year: "Mid 2024", title: "Website Launch", description: "Deployed the first iteration of the platform to the public." },
    { year: "Late 2024", title: "SEO Growth", description: "Organic visibility surged as our smart indexer mapped the e-commerce landscape." },
    { year: "Early 2025", title: "Affiliate Integration", description: "Successfully established partnerships with major retail networks." },
    { year: "Mid 2025", title: "Premium Launch", description: "Introduced advanced tools and ad-free experiences for power users." },
    { year: "Late 2025", title: "AI Features", description: "Integrated conversational AI to redefine the product discovery experience." },
    { year: "Future", title: "Future Roadmap", description: "Scaling into new markets, launching a mobile app, and expanding our core engine." }
  ];

  const missions = [
    { title: "Mission", text: "To make shopping transparent, intelligent, and seamless for everyone.", icon: <Target className="w-5 h-5 text-amber-400" /> },
    { title: "Vision", text: "A world where every purchase is an informed decision backed by data.", icon: <Eye className="w-5 h-5 text-amber-400" /> },
    { title: "Values", text: "Integrity, speed, and uncompromising quality in everything we build.", icon: <Shield className="w-5 h-5 text-amber-400" /> },
    { title: "Innovation", text: "Constantly pushing the boundaries of what e-commerce technology can do.", icon: <Lightbulb className="w-5 h-5 text-amber-400" /> },
    { title: "Transparency", text: "No hidden fees, no opaque algorithms. Just the best deals.", icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
    { title: "Customer First", text: "Every feature we develop starts and ends with the user in mind.", icon: <Users className="w-5 h-5 text-amber-400" /> }
  ];

  const stats = [
    { label: "Website Visitors", value: "1M+" },
    { label: "Premium Members", value: "50k+" },
    { label: "Deals Compared", value: "5M+" },
    { label: "Products Indexed", value: "10M+" },
    { label: "Countries Reached", value: "120+" }
  ];

  const skills = [
    "Web Development", "AI", "SEO", "UI/UX", 
    "Business Strategy", "Startup Building", "Marketing"
  ];

  const futurePlans = [
    { title: "Barcode Scanner", icon: <Smartphone className="w-5 h-5 text-amber-400" />, desc: "Scan physical items in real-time." },
    { title: "Gift Cards", icon: <ExternalLink className="w-5 h-5 text-amber-400" />, desc: "Premium discounted gift cards." },
    { title: "Flight Search", icon: <Globe className="w-5 h-5 text-amber-400" />, desc: "Global travel engine expansion." },
    { title: "Chrome Extension", icon: <Layout className="w-5 h-5 text-amber-400" />, desc: "Instant comparisons everywhere." },
    { title: "Mobile App", icon: <Smartphone className="w-5 h-5 text-amber-400" />, desc: "A native luxury experience." },
    { title: "AI Shopping Agent", icon: <Cpu className="w-5 h-5 text-amber-400" />, desc: "Your personal concierge." }
  ];

  const galleryImages = [
    { url: "/founder.jpg?v=10", title: "Founder Portrait" },
    { url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200", title: "Workspace" },
    { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200", title: "Code" },
    { url: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=1200", title: "Design" },
    { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200", title: "Technology" }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      <FounderSEO />

      <AnimatedBackground />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 relative group"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-300 to-yellow-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
            
            {/* Animated Gold Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 rounded-full border border-amber-500/30 border-t-amber-400"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 rounded-full border border-amber-500/10 border-b-amber-300"
            />

            <div className="relative w-48 h-48 md:w-56 md:h-56 mx-auto rounded-full overflow-hidden border border-white/10 bg-black shadow-[0_0_50px_rgba(212,175,55,0.15)] z-10">
              <img 
                src="/founder.jpg?v=10" 
                alt="Awan Warsi" 
                className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-8 h-px bg-amber-500/50" />
            <span className="text-amber-400 tracking-[0.2em] text-sm font-medium uppercase">BuyWise</span>
            <div className="w-8 h-px bg-amber-500/50" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-4 font-serif"
          >
            Awan Warsi
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/60 text-lg md:text-2xl tracking-wide mb-8 font-light"
          >
            Owner & Chairman
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-white/70 max-w-2xl mb-12 leading-relaxed font-light italic"
          >
            "Building the future of AI-powered smart shopping."
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-6 justify-center"
          >
            <button 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2"
            >
              <span>Explore BuyWise</span> 
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="https://buywiser.store"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-10 py-4 bg-white/5 text-white font-medium rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md flex items-center justify-center"
            >
              Visit Website
            </a>
          </motion.div>

        </div>
      </section>

      {/* 2. STORY SECTION */}
      <section className="py-32 px-6 md:px-12 relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">The Vision</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Early Vision", text: "It started with a simple frustration: online shopping was broken. I envisioned a single intelligence layer." },
              { title: "Journey of BuyWise", text: "From late-night coding sessions to a scalable platform, building this has been the adventure of a lifetime." },
              { title: "The Mission", text: "To give power back to the consumer by bringing absolute transparency to pricing globally." },
              { title: "Dreams", text: "To make BuyWise the default utility for every digital transaction on the planet." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors duration-500 group"
              >
                <h3 className="text-xl font-bold text-amber-400 mb-4">{item.title}</h3>
                <p className="text-white/70 leading-relaxed font-light">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MISSION & VALUES */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 backdrop-blur-md hover:border-amber-500/30 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] group-hover:bg-amber-500/20 transition-colors" />
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-lg">
                  {mission.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 font-serif">{mission.title}</h3>
                <p className="text-white/60 leading-relaxed font-light">{mission.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TIMELINE */}
      <section className="py-32 px-6 relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-20 text-center font-serif"
          >
            BuyWise Timeline
          </motion.h2>

          <div className="relative border-l border-white/10 ml-4 md:ml-8 space-y-16">
            {timelineMilestones.map((milestone, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative pl-8 md:pl-16 group"
              >
                <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-black shadow-[0_0_15px_rgba(212,175,55,0.8)] group-hover:scale-150 transition-transform duration-500" />
                <div className="text-sm font-medium tracking-widest text-amber-500 mb-2 uppercase">{milestone.year}</div>
                <h3 className="text-2xl font-bold text-white mb-3 font-serif">{milestone.title}</h3>
                <p className="text-white/60 leading-relaxed font-light text-lg">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ACHIEVEMENTS */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md text-center hover:bg-white/10 transition-colors relative overflow-hidden"
              >
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/60 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SKILLS */}
      <section className="py-32 px-6 relative z-10 border-t border-white/5 bg-black/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 font-serif">
            Expertise
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {skills.map((skill, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/80 font-medium text-lg backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-amber-500/50 hover:text-white transition-all cursor-default hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                {skill}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FUTURE ROADMAP */}
      <section className="py-32 px-6 relative z-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">Future Vision</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futurePlans.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 relative group hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-serif">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. GALLERY */}
      <section className="py-32 px-6 relative z-10 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center font-serif">
            Gallery
          </h2>
          <div className="columns-1 md:columns-2 lg:columns-2 gap-6 space-y-6">
            {galleryImages.map((img, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="relative rounded-3xl overflow-hidden group cursor-zoom-in break-inside-avoid shadow-2xl border border-white/5 bg-black"
                onClick={() => setLightboxImage(img.url)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img 
                  src={img.url} 
                  alt={img.title}
                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <Maximize2 className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-4 rounded-full transition-colors backdrop-blur-md border border-white/10"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, type: "spring", damping: 25, stiffness: 200 }}
              src={lightboxImage}
              alt="Fullscreen"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. QUOTE */}
      <section className="py-40 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.blockquote 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-5xl font-serif italic text-white/90 leading-tight mb-8"
          >
            "Every great company starts with one idea and the courage to build it."
          </motion.blockquote>
          <motion.cite 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-amber-500 text-xl font-medium not-italic uppercase tracking-widest"
          >
            — Awan Warsi
          </motion.cite>
        </div>
      </section>

      {/* 10. CONTACT */}
      <section className="py-32 px-6 relative z-10 border-t border-white/5 bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="p-12 md:p-16 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 font-serif relative z-10">Get in Touch</h2>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <a href="https://buywiser.store" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white/80 hover:text-white hover:border-amber-500/50 hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-md">
                <Globe className="w-5 h-5" /> Website
              </a>
              <button onClick={handleCopyEmail} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white/80 hover:text-white hover:border-amber-500/50 hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-md">
                <Mail className="w-5 h-5" /> {copied ? 'Copied!' : 'Email'}
              </button>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white/80 hover:text-white hover:border-amber-500/50 hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-md">
                <Instagram className="w-5 h-5" /> Instagram
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white/80 hover:text-white hover:border-amber-500/50 hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-md">
                <Github className="w-5 h-5" /> GitHub
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-white/80 hover:text-white hover:border-amber-500/50 hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-md">
                <Users className="w-5 h-5" /> LinkedIn
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
