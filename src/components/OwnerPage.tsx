import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Github, Instagram, ArrowRight, Mail, 
  ExternalLink, Globe, Sparkles, Cpu, Shield, 
  Code, Terminal, Smartphone, Search, 
  Layout, Zap, Rocket, Activity, Lightbulb, Box,
  X, Maximize2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';

const MeshGradient = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/30 blur-[100px] mix-blend-multiply" />
    <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-200/30 blur-[100px] mix-blend-multiply" />
    <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-200/30 blur-[120px] mix-blend-multiply" />
    <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-[50px]" />
  </div>
);

export default function OwnerPage() {
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
    {
      year: "2023",
      title: "Started Learning",
      description: "Began the journey into modern web development, focusing on React, TypeScript, and user experience.",
    },
    {
      year: "Early 2024",
      title: "Started BuyWise",
      description: "Conceived the initial idea to help users navigate complex online pricing and find genuine deals.",
    },
    {
      year: "Mid 2024",
      title: "Launched BuyWise",
      description: "Deployed the first public version of the platform with core price comparison capabilities.",
    },
    {
      year: "Late 2024",
      title: "Google Search Indexing",
      description: "Achieved organic search visibility, allowing users to discover BuyWise naturally.",
    },
    {
      year: "Early 2025",
      title: "Affiliate Integration",
      description: "Partnered with major networks to ensure accurate data feeds and platform sustainability.",
    },
    {
      year: "Mid 2025",
      title: "Premium System Development",
      description: "Began crafting advanced tools and an ad-free experience for power users.",
    },
    {
      year: "Future",
      title: "AI Feature Expansion",
      description: "Developing intelligent shopping assistants and predictive price modeling.",
    }
  ];

  const philosophies = [
    { title: "Think Different", text: "Challenge the status quo of e-commerce. Don't settle for opaque pricing and confusing interfaces." },
    { title: "Build with Purpose", text: "Every feature must serve the user. We build tools that save time, money, and frustration." },
    { title: "Keep Learning", text: "The web evolves daily. Continuous learning is required to build world-class digital products." },
    { title: "Solve Real Problems", text: "Focus on tangible pain points. BuyWise exists because finding the best price was too difficult." },
    { title: "Customer First", text: "Design for the shopper. Transparency, speed, and privacy are non-negotiable." }
  ];

  const skills = [
    "React", "TypeScript", "AI", "SEO", "Frontend Development", 
    "UI Design", "Problem Solving", "Startup Building", "Modern Web Development"
  ];

  const futurePlans = [
    { title: "AI Shopping Assistant", icon: <Cpu className="w-5 h-5" />, desc: "Conversational AI to help find the perfect product." },
    { title: "Barcode Scanner", icon: <Smartphone className="w-5 h-5" />, desc: "Scan physical items to instantly check online prices." },
    { title: "Gift Cards", icon: <ExternalLink className="w-5 h-5" />, desc: "Discounted gift cards for stacked savings." },
    { title: "Flight Comparison", icon: <Globe className="w-5 h-5" />, desc: "Expanding our core engine to travel." },
    { title: "Price Prediction", icon: <Activity className="w-5 h-5" />, desc: "Machine learning to forecast future price drops." },
    { title: "Chrome Extension", icon: <Layout className="w-5 h-5" />, desc: "Instant comparisons while you browse." },
    { title: "Android App", icon: <Smartphone className="w-5 h-5" />, desc: "A native experience for shopping on the go." }
  ];

  const galleryImages = [
    { url: "/founder.jpg?v=10", title: "Founder Portrait" },
    { url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800", title: "Workspace" },
    { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800", title: "Code" },
    { url: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=800", title: "Design" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <SEO 
        title="Awan Warsi | Founder, Owner & Chairman of BuyWise"
        description="Building BuyWise to help people compare prices, discover better deals, and make smarter shopping decisions through technology."
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
              "jobTitle": ["Founder", "Owner", "Chairman"],
              "image": "https://buywiser.store/founder.jpg",
              "url": "https://buywiser.store/owner",
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
              "description": "Building BuyWise to help people compare prices, discover better deals, and make smarter shopping decisions through technology."
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

      <MeshGradient />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/40 to-cyan-50/40 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
        </motion.div>

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white shadow-xl relative z-10">
                <img 
                  src="/founder.jpg?v=10" 
                  alt="Awan Warsi" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-4 font-serif">
              Awan Warsi
            </h1>
            <div className="text-gray-500 text-lg md:text-xl tracking-wide mb-8">
              Owner & Chairman <span className="mx-2 text-gray-400">|</span> BuyWise
            </div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12 leading-relaxed"
          >
            Building BuyWise to help people compare prices, discover better deals, and make smarter shopping decisions through technology.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 justify-center"
          >
            <button 
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Visit BuyWise</span> 
              <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#about"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-900 font-medium rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center shadow-sm"
            >
              Contact
            </a>
          </motion.div>

        </div>
      </section>

      {/* 2. ABOUT ME (EDITORIAL) */}
      <section id="about" className="py-24 px-6 md:px-12 relative bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="prose prose-lg md:prose-xl prose-slate text-gray-600"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight font-serif">
              About Me
            </h2>
            <p className="leading-relaxed">
              I am a builder at heart. I started BuyWise because I was frustrated with how difficult it was to verify if I was actually getting a good deal online. The e-commerce landscape is fragmented, pricing is opaque, and consumers are often left in the dark.
            </p>
            <p className="leading-relaxed mt-6">
              BuyWise solves a fundamental problem: it brings transparency to online shopping. By aggregating data and building intelligent comparison engines, we empower people to make informed decisions without spending hours researching.
            </p>
            <p className="leading-relaxed mt-6">
              I love technology because it scales solutions. A single well-engineered platform can save millions of people time and money. My long-term vision is to make BuyWise the default starting point for any digital purchase, worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. FOUNDER JOURNEY */}
      <section className="py-24 px-6 relative bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 tracking-tight text-center font-serif"
          >
            The Journey
          </motion.h2>

          <div className="relative border-l border-gray-200 ml-4 md:ml-8 space-y-12">
            {timelineMilestones.map((milestone, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative pl-8 md:pl-12"
              >
                <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-slate-50" />
                <div className="text-sm font-semibold text-blue-600 mb-1">{milestone.year}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PHILOSOPHY */}
      <section className="py-24 px-6 md:px-12 relative bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16 tracking-tight text-center font-serif">
            Philosophy
          </h2>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
            {philosophies.map((phil, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">{phil.title}</h3>
                <p className="text-gray-600 leading-relaxed">{phil.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SKILLS */}
      <section className="py-24 px-6 relative bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 tracking-tight font-serif">
            Expertise
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {skills.map((skill, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-gray-700 font-medium text-sm shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-default"
              >
                {skill}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CURRENT FOCUS (COMING SOON) */}
      <section className="py-24 px-6 relative bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight font-serif">Current Focus</h2>
            <p className="text-gray-500">What we are actively building at BuyWise.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {futurePlans.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-50 border border-gray-100 rounded-2xl p-6 relative group hover:bg-gray-50 transition-colors"
              >
                <div className="absolute top-6 right-6">
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-white border border-gray-200 text-gray-500 rounded-full shadow-sm">
                    Coming Soon
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 mb-6 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. GALLERY */}
      <section className="py-24 px-6 relative bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 tracking-tight text-center font-serif">
            Gallery
          </h2>
          <div className="columns-1 md:columns-2 lg:columns-2 gap-6 space-y-6">
            {galleryImages.map((img, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative rounded-2xl overflow-hidden group cursor-zoom-in break-inside-avoid shadow-sm hover:shadow-xl transition-shadow duration-500 bg-white"
                onClick={() => setLightboxImage(img.url)}
              >
                <img 
                  src={img.url} 
                  alt={img.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors duration-500 flex items-center justify-center">
                  <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" />
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
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-md"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={lightboxImage}
              alt="Fullscreen"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. CONTACT */}
      <section className="py-24 px-6 relative bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 font-serif">Get in Touch</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://buywiser.store" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <Globe className="w-4 h-4" /> Website
            </a>
            <button onClick={handleCopyEmail} className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <Mail className="w-4 h-4" /> {copied ? 'Copied!' : 'Email'}
            </button>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

