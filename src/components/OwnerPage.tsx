import React from 'react';
import { motion } from 'framer-motion';
import { Github, Instagram, Twitter, ArrowRight, Target, Youtube, Mail, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';

export default function OwnerPage() {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-hidden relative selection:bg-amber-500/30 selection:text-amber-200">
      <SEO 
        title="Founder, Owner & Chairman | BuyWise"
        description="Meet Awan Warsi, the sole Founder, Owner, CEO, and Chairman of BuyWise, the AI-powered shopping platform helping users compare prices and save money."
        canonicalUrl="https://buywiser.store/owner"
      />
      
      {/* Structured Data for Founder */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": "https://buywiser.store/owner#person-warsi",
              "name": "Awan Warsi",
              "jobTitle": ["Founder", "Owner", "CEO", "Chairman"],
              "worksFor": {
                "@type": "Organization",
                "name": "BuyWise",
                "url": "https://buywiser.store"
              },
              "sameAs": [
                "mailto:mohammdsaeed24@gmail.com"
              ]
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
                  "name": "Owner",
                  "item": "https://buywiser.store/owner"
                }
              ]
            }
          ]
        })}
      </script>

      {/* Luxury Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/5 blur-[150px]" />
        <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] rounded-full bg-yellow-500/5 blur-[150px] transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 pt-40 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center justify-center text-center mb-32"
        >
          <motion.div variants={fadeIn} className="mb-6 flex items-center justify-center gap-2">
             <Crown className="w-5 h-5 text-amber-500" />
             <span className="text-xs uppercase tracking-[0.3em] font-medium text-amber-500/80">Executive Leadership</span>
          </motion.div>
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-amber-100 via-amber-200 to-amber-600 mb-8 drop-shadow-sm">
            Awan Warsi
          </motion.h1>
          <motion.p variants={fadeIn} className="text-lg md:text-2xl text-white/50 font-light tracking-wide max-w-2xl font-serif italic">
            "Redefining transparency and elegance in global commerce."
          </motion.p>
        </motion.section>

        {/* SINGLE FEATURED OWNER SHOWCASE */}
        <div className="max-w-5xl mx-auto mb-40">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-[2.5rem] border border-amber-500/20 p-8 md:p-16 flex flex-col md:flex-row gap-16 items-center shadow-[0_0_50px_rgba(245,158,11,0.05)] relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 to-transparent blur-[100px] rounded-full pointer-events-none transition-all duration-700 opacity-50 group-hover:opacity-100" />
            
            {/* Image Container */}
            <div className="relative w-full aspect-[3/4] max-w-[320px] rounded-3xl overflow-hidden border border-amber-500/30 bg-[#050505] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center shrink-0 group/photo">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img 
                src={`/founder.jpg?v=${Date.now()}`} 
                alt="Awan Warsi" 
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover/photo:scale-110"
                onError={(e) => { 
                  e.currentTarget.src = "/founder.svg"; 
                }} 
              />
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="text-amber-500 text-xs tracking-widest uppercase font-bold mb-1">Founder & CEO</div>
                <div className="text-white text-2xl font-serif">Awan Warsi</div>
              </div>
            </div>

            {/* Biography */}
            <div className="text-center md:text-left flex-grow z-10">
              <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-[0.2em] mb-8 flex items-center justify-center md:justify-start gap-3">
                 <span className="w-8 h-[1px] bg-amber-500/50"></span> The Architect <span className="w-8 h-[1px] bg-amber-500/50 md:hidden"></span>
              </h3>
              
              <p className="text-white/80 leading-relaxed text-base md:text-lg mb-8 font-light">
                Awan Warsi is the sole Founder, Owner, CEO, and Chairman of BuyWise. Directing technical innovation, platform engineering, executive strategy, and product design, he crafted the unified AI shopping algorithms and travel comparison engines to level the playing field for consumers globally.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {[
                  { text: "Owner & Chairman" },
                  { text: "Founder & CEO" },
                  { text: "AI Architect" },
                  { text: "Lead Engineer" }
                ].map((badge, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-full px-5 py-2 text-xs text-amber-200/80 backdrop-blur-md uppercase tracking-wider font-medium shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                  >
                    {badge.text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ABOUT & MISSION */}
        <div className="grid lg:grid-cols-2 gap-16 mb-40">
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="flex flex-col justify-center"
          >
            <h3 className="text-4xl font-serif font-light mb-8 text-white">
              The <span className="text-amber-500 font-style-italic italic">Vision</span>
            </h3>
            <div className="space-y-6 text-white/60 font-light text-lg leading-relaxed">
              <p>
                Awan Warsi established BuyWise with one primary mission: to make online shopping transparent, intelligent, and affordable for everyone.
              </p>
              <p>
                After experiencing fake discounts, misleading pricing models, and tedious dynamic rate manipulation, he built a fully secure platform that restores complete pricing clarity back to consumers.
              </p>
              <p>
                Today, BuyWise integrates state-of-the-art AI shopping helpers, immediate barcode tracking, flight scanners, hotel registries, and loyalty programs into a single elegant platform.
              </p>
              <p className="text-amber-200/90 font-medium">
                We aim to make transparency the default for consumer purchasing worldwide.
              </p>
            </div>
          </motion.section>
          
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="bg-gradient-to-br from-[#12100d] to-[#050403] border border-amber-500/10 rounded-[2.5rem] p-12 h-full flex flex-col justify-center relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-50" />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
              
              <Target className="w-10 h-10 text-amber-500 mb-8 opacity-80" />
              <h3 className="text-3xl font-serif font-light mb-8 text-white">Our Mission</h3>
              <p className="text-2xl md:text-4xl font-light text-white/90 leading-tight font-serif italic">
                Empower millions of shoppers through AI, absolute price transparency, and intelligent cross-retailer comparison.
              </p>
            </div>
          </motion.section>
        </div>

        {/* QUOTE */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="mb-40 max-w-4xl mx-auto text-center px-4"
        >
          <div className="relative py-12">
            <span className="absolute -top-6 left-0 text-9xl text-amber-500/10 font-serif leading-none">"</span>
            <blockquote className="text-3xl md:text-5xl font-light leading-tight text-white/90 italic mb-10 relative z-10 font-serif">
              Technology should empower people to search less, save immediately, and shop wiser.
            </blockquote>
            <span className="absolute -bottom-16 right-0 text-9xl text-amber-500/10 font-serif leading-none">"</span>
          </div>
          <div className="w-24 h-[1px] bg-amber-500/30 mx-auto mb-6" />
          <p className="text-lg font-medium text-amber-500 uppercase tracking-[0.2em]">Awan Warsi</p>
          <p className="text-sm text-white/40 tracking-wider">Founder, Owner & Chairman</p>
        </motion.section>

        {/* SOCIAL LINKS */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="mb-40 flex flex-col items-center"
        >
          <h3 className="text-sm text-amber-500/70 mb-10 uppercase tracking-[0.3em] font-medium flex items-center gap-4">
            <span className="w-12 h-[1px] bg-amber-500/30"></span> Connect <span className="w-12 h-[1px] bg-amber-500/30"></span>
          </h3>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="mailto:mohammdsaeed24@gmail.com" className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-amber-500/20 flex items-center justify-center text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-500 group">
              <Mail className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
            </a>
            <a href="https://youtube.com" className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-amber-500/20 flex items-center justify-center text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-500 group">
              <Youtube className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
            </a>
            <a href="https://instagram.com" className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-amber-500/20 flex items-center justify-center text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-500 group">
              <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
            </a>
            <a href="https://x.com" className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-amber-500/20 flex items-center justify-center text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-500 group">
              <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
            </a>
            <a href="https://github.com" className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-amber-500/20 flex items-center justify-center text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-500 group">
              <Github className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
            </a>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="relative text-center py-24 px-6 rounded-[3rem] overflow-hidden border border-amber-500/20 bg-[#0a0a0a] shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-8 text-white">Join the Future of Smart Shopping</h2>
            <p className="text-white/60 font-light mb-12 text-lg">Experience the next generation of price comparison, powered by advanced artificial intelligence.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button 
                onClick={() => navigate('/')}
                className="px-10 py-4 bg-transparent text-amber-500 font-medium tracking-wide rounded-full border border-amber-500/30 hover:bg-amber-500/10 transition-all duration-500 flex items-center justify-center gap-3 group uppercase text-sm"
              >
                Explore BuyWise <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/scanner')}
                className="px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-semibold tracking-wide rounded-full hover:from-amber-500 hover:to-amber-400 transition-all duration-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 uppercase text-sm"
              >
                Start Comparing
              </button>
            </div>
          </div>
        </motion.section>
        
      </div>
    </div>
  );
}
