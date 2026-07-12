import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Github, Instagram, ArrowRight, Mail, 
  ExternalLink, Globe, Sparkles, Cpu, Shield, 
  Code, Terminal, Smartphone, Search, 
  Layout, Zap, Rocket, Activity, Lightbulb, Box
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';

const Spotlight = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', () => setIsHovered(true));
      container.addEventListener('mouseleave', () => setIsHovered(false));
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', () => setIsHovered(true));
        container.removeEventListener('mouseleave', () => setIsHovered(false));
      }
    };
  }, [containerRef]);

  return (
    <AnimatePresence>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[100px] transition-all duration-0 transform -translate-x-1/2 -translate-y-1/2 z-0"
          style={{ left: mousePos.x, top: mousePos.y }}
        />
      )}
    </AnimatePresence>
  );
};

export default function OwnerPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText("mohammdsaeed24@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timelineMilestones = [
    {
      year: "2023",
      title: "Learning & Foundation",
      icon: <Terminal className="w-5 h-5 text-indigo-400" />,
      description: "Started the journey into web development, mastering React, TypeScript, and modern web architecture.",
    },
    {
      year: "Early 2024",
      title: "The Genesis of BuyWise",
      icon: <Lightbulb className="w-5 h-5 text-indigo-400" />,
      description: "Conceived the idea of a unified shopping platform to help users compare prices and discover real deals.",
    },
    {
      year: "Mid 2024",
      title: "BuyWise Website Launch",
      icon: <Rocket className="w-5 h-5 text-cyan-400" />,
      description: "The official launch of BuyWise. Implemented core search functionalities and basic price comparison.",
    },
    {
      year: "Late 2024",
      title: "Search & Indexing Growth",
      icon: <Search className="w-5 h-5 text-cyan-400" />,
      description: "Achieved significant Google indexing, allowing users to discover BuyWise organically through search engines.",
    },
    {
      year: "Early 2025",
      title: "Affiliate Integration",
      icon: <Box className="w-5 h-5 text-indigo-400" />,
      description: "Completed full integration with major affiliate networks like Amazon to provide accurate data and sustain the platform.",
    },
    {
      year: "Mid 2025",
      title: "Premium System",
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
      description: "Currently developing the premium membership system to offer advanced tools and ad-free experiences for power users.",
    },
    {
      year: "Future",
      title: "AI & Expansion",
      icon: <Cpu className="w-5 h-5 text-cyan-400" />,
      description: "Building the next generation of AI features, including smart shopping assistants and price prediction models.",
    }
  ];

  const skills = [
    { name: "Web Development", icon: <Code className="w-4 h-4" /> },
    { name: "React", icon: <Layout className="w-4 h-4" /> },
    { name: "TypeScript", icon: <Terminal className="w-4 h-4" /> },
    { name: "AI", icon: <Cpu className="w-4 h-4" /> },
    { name: "SEO", icon: <Search className="w-4 h-4" /> },
    { name: "UI/UX", icon: <Sparkles className="w-4 h-4" /> },
    { name: "Product Design", icon: <Box className="w-4 h-4" /> },
    { name: "Problem Solving", icon: <Zap className="w-4 h-4" /> }
  ];

  const futurePlans = [
    { title: "AI Shopping Assistant", icon: <Cpu className="w-5 h-5 text-indigo-400" />, desc: "Conversational AI to help you find the best products." },
    { title: "Barcode Scanner", icon: <Smartphone className="w-5 h-5 text-cyan-400" />, desc: "Scan physical products in-store to check online prices." },
    { title: "Gift Cards", icon: <ExternalLink className="w-5 h-5 text-indigo-400" />, desc: "Compare and purchase discounted gift cards." },
    { title: "Flight Comparison", icon: <Globe className="w-5 h-5 text-cyan-400" />, desc: "Expand our engine to cover flights and travel." },
    { title: "Price Prediction", icon: <Activity className="w-5 h-5 text-indigo-400" />, desc: "Machine learning models to predict future price drops." },
    { title: "Chrome Extension", icon: <Layout className="w-5 h-5 text-cyan-400" />, desc: "Instant price comparison while browsing other stores." },
    { title: "Android App", icon: <Smartphone className="w-5 h-5 text-indigo-400" />, desc: "A native mobile experience for shopping on the go." }
  ];

  const realStats = [
    { label: "Products Compared", value: "Thousands" },
    { label: "Supported Stores", value: "Amazon & More" },
    { label: "Website Version", value: "v2.0" },
    { label: "Latest Updates", value: "Weekly" }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0F172A] text-[#F8FAFC] overflow-hidden relative font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <SEO 
        title="Awan Warsi | Owner & Chairman of BuyWise"
        description="Building BuyWise to help shoppers compare prices, discover better deals, and make smarter buying decisions through technology."
        canonicalUrl="https://buywiser.store/owner"
        image="https://buywiser.store/founder.jpg"
      />

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
              "description": "Building BuyWise to help shoppers compare prices, discover better deals, and make smarter buying decisions through technology."
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

      <Spotlight containerRef={containerRef} />

      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse duration-10000" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/10 blur-[130px] animate-pulse duration-7000" />
        <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[100px]" />
      </div>

      <div className="relative z-10">
        
        {/* 1. HERO SECTION */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
          <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-indigo-400 rounded-full blur-[2px] animate-ping duration-3000 opacity-50" />
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-cyan-400 rounded-full blur-[3px] animate-pulse duration-2000 opacity-30" />
          </motion.div>

          <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-40 h-40 md:w-48 md:h-48 mb-10 group"
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
              <div className="absolute -inset-0.5 rounded-full border border-indigo-500/30 animate-spin duration-[15000ms] pointer-events-none" />
              
              <div className="w-full h-full rounded-full overflow-hidden border border-slate-700/50 p-1 bg-[#0F172A] relative z-10">
                <img 
                  src="/founder.jpg?v=10" 
                  alt="Awan Warsi" 
                  className="w-full h-full object-cover object-top rounded-full transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-4">
                Awan Warsi
              </h1>
              <div className="text-indigo-400 text-lg md:text-xl font-medium tracking-wide mb-8">
                Owner & Chairman of BuyWise
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-slate-400 max-w-2xl mb-12 leading-relaxed"
            >
              Building BuyWise to help shoppers compare prices, discover better deals, and make smarter buying decisions through technology.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center"
            >
              <button 
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#0F172A] font-semibold rounded-full hover:bg-slate-100 transition-all duration-300 shadow-lg shadow-white/5 flex items-center justify-center gap-2"
              >
                <span>Visit BuyWise</span> 
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#about"
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/50 text-white font-medium rounded-full border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 backdrop-blur-sm flex items-center justify-center"
              >
                About
              </a>
            </motion.div>

          </div>
        </section>

        {/* 2. ABOUT SECTION */}
        <section id="about" className="py-24 px-6 relative border-t border-slate-800/50 bg-[#0F172A]/50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The Vision</h2>
              <div className="w-12 h-1 bg-indigo-500 rounded-full" />
            </div>
            
            <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
              <p>
                The internet is vast, but finding the right price shouldn't require opening twenty tabs and tracking spreadsheets. BuyWise was started to solve a genuine problem: the fragmentation of online shopping.
              </p>
              <p>
                As e-commerce grew more complex, pricing became opaque. Different retailers, dynamic pricing models, and hidden fees make it hard for everyday consumers to know if they are truly getting a good deal. 
              </p>
              <p>
                Our mission is to build a unified platform that brings clarity, speed, and intelligence to shopping. By leveraging modern technology, we aim to build tools that work for the consumer, saving time and money with complete transparency.
              </p>
            </div>
          </div>
        </section>

        {/* 3. PERFORMANCE STATS (REAL) */}
        <section className="py-20 px-6 relative">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {realStats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 text-center hover:bg-slate-800/50 transition-colors"
              >
                <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 4. JOURNEY TIMELINE */}
        <section className="py-24 px-6 relative bg-slate-900/30 border-y border-slate-800/50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">The Journey</h2>
              <div className="w-12 h-1 bg-cyan-500 rounded-full" />
            </div>

            <div className="relative pl-4 md:pl-8 border-l border-slate-700/50 space-y-12">
              {timelineMilestones.map((milestone, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative pl-8 md:pl-12"
                >
                  <div className="absolute left-[-17px] md:left-[-17px] top-1 w-8 h-8 rounded-full bg-[#0F172A] border-2 border-slate-600 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  </div>

                  <div className="bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-indigo-500/30 hover:bg-slate-800/40 transition-all duration-300">
                    <div className="text-sm font-semibold text-indigo-400 mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                      {milestone.icon}
                      {milestone.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. SKILLS */}
        <section className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Core Competencies</h2>
              <div className="w-12 h-1 bg-indigo-500 rounded-full mx-auto" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {skills.map((skill, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 flex flex-col items-center text-center hover:bg-slate-800/60 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {skill.icon}
                  </div>
                  <div className="text-sm font-medium text-slate-200">{skill.name}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FUTURE VISION */}
        <section className="py-24 px-6 relative bg-slate-900/30 border-t border-slate-800/50">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Future Roadmap</h2>
              <div className="w-12 h-1 bg-cyan-500 rounded-full mx-auto" />
              <p className="text-slate-400 mt-6 max-w-2xl mx-auto">
                We are actively building the next generation of tools to make BuyWise the ultimate shopping utility.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {futurePlans.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-slate-800/20 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors"
                >
                  <div className="absolute top-4 right-4 text-[10px] font-medium px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-full">
                    Coming Soon
                  </div>
                  <div className="mb-4 bg-slate-800/50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-700/50">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. CONTACT */}
        <section className="py-32 px-6 relative border-t border-slate-800/50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Get in Touch</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://buywiser.store" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                <Globe className="w-4 h-4" /> Website
              </a>
              <button onClick={handleCopyEmail} className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                <Mail className="w-4 h-4" /> {copied ? 'Copied!' : 'Email'}
              </button>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
