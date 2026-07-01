import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Github, Instagram, Linkedin, Twitter, ArrowRight, Sparkles, Target, Zap, Shield, Globe, Users, ShoppingBag, Youtube, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';
import Ferrofluid from './Ferrofluid';

export default function OwnerPage() {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative selection:bg-[#FF3B30] selection:text-white">
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

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF3B30]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF3B30]/5 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[120px] transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* HERO SECTION */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center justify-center text-center mb-24 pt-10"
        >
          <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-6">
            Founder, Owner & Chairman
          </motion.h1>
          <motion.p variants={fadeIn} className="text-lg md:text-2xl text-white/60 font-medium tracking-wide max-w-2xl">
            Meet the driving force behind BuyWise, creating transparent, intelligent global commerce.
          </motion.p>
        </motion.section>

        {/* SINGLE FEATURED OWNER SHOWCASE */}
        <div className="max-w-4xl mx-auto mb-32">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="bg-[#0f0f0f]/60 backdrop-blur-md rounded-3xl border border-white/10 p-8 md:p-12 flex flex-col md:flex-row gap-12 items-center hover:border-white/20 transition-all duration-300 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3B30]/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-[#FF3B30]/10 transition-colors duration-500" />
            
            {/* Image Container */}
            <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#151515] to-[#0a0a0a] shadow-[0_0_30px_rgba(255,59,48,0.15)] flex items-center justify-center shrink-0 group/photo">
              <Ferrofluid 
                colors={["#FF3B30", "#3A29FF", "#00E6C3"]}
                speed={0.5}
                scale={1}
                turbulence={1}
                fluidity={0.1}
              />
              <img 
                src="/founder.png?v=2" 
                alt="Awan Warsi" 
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover/photo:scale-105"
                onError={(e) => { 
                  e.currentTarget.style.display = 'none'; 
                }} 
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference">
                <div className="text-5xl font-mono text-white/10 tracking-wider font-bold font-display">AW</div>
              </div>
            </div>

            {/* Biography */}
            <div className="text-center md:text-left flex-grow">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF3B30] mb-2">Executive Leadership & Creator</div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Awan Warsi</h2>
              <h3 className="text-base font-semibold text-white/50 uppercase tracking-widest mb-6">Founder, Owner, CEO & Chairman</h3>
              
              <p className="text-white/70 leading-relaxed text-sm md:text-base mb-6">
                Awan Warsi is the sole Founder, Owner, CEO, and Chairman of BuyWise, directing technical innovation, platform engineering, executive strategy, and product design. He crafted the unified AI shopping algorithms, travel comparison engines, and direct support systems to level the playing field for consumers globally.
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {[
                  { icon: "👑", text: "Owner & Chairman" },
                  { icon: "🚀", text: "Founder & CEO" },
                  { icon: "🤖", text: "AI Architect" },
                  { icon: "💻", text: "Full Stack Creator" }
                ].map((badge, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 bg-red-500/5 border border-red-500/10 rounded-full px-3.5 py-1.5 text-xs text-red-300 backdrop-blur-md"
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ABOUT & MISSION */}
        <div className="grid lg:grid-cols-2 gap-12 mb-32">
          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="prose prose-invert prose-lg max-w-none"
          >
            <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Sparkles className="text-[#FF3B30]" /> The Vision
            </h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Awan Warsi established BuyWise with one primary mission: to make online shopping transparent, intelligent, and affordable for everyone.
            </p>
            <p className="text-white/70 leading-relaxed mb-6">
              After experiencing fake discounts, misleading pricing models, and tedious dynamic rate manipulation, he built a fully secure platform that restores complete pricing clarity back to consumers.
            </p>
            <p className="text-white/70 leading-relaxed mb-6">
              Today, BuyWise integrates state-of-the-art AI shopping helpers, immediate barcode tracking, flight scanners, hotel registries, and loyalty programs into a single elegant platform.
            </p>
            <p className="text-white/90 font-medium leading-relaxed">
              We aim to make transparency the default for consumer purchasing worldwide.
            </p>
          </motion.section>

          <motion.section 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
          >
            <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-white/10 rounded-[2rem] p-10 h-full flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3B30]/10 blur-[80px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-50" />
              <Target className="w-12 h-12 text-[#FF3B30] mb-6" />
              <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
              <p className="text-2xl md:text-3xl font-light text-white/90 leading-snug">
                Empower millions of shoppers through AI, absolute price transparency, and intelligent cross-retailer comparison to help everyone save money.
              </p>
            </div>
          </motion.section>
        </div>

        {/* TIMELINE */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-32 max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold">The Journey</h3>
          </div>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block" />
            
            <div className="space-y-6 md:space-y-12">
              {[
                { year: "2026", title: "BuyWise Established by Awan Warsi" },
                { title: "AI Shopping Assistant Launch" },
                { title: "Price Comparison Engine" },
                { title: "Flight Search Integration" },
                { title: "Hotel Search Integration" },
                { title: "Smart Barcode Scanner" },
                { title: "Premium Lifetime Memberships" },
                { title: "Global Expansion Strategy" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeIn}
                  className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8"
                >
                  <div className={`md:w-1/2 flex ${idx % 2 === 0 ? 'md:justify-end' : 'md:justify-start md:order-last'}`}>
                    <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg hover:border-[#FF3B30]/50 transition-colors duration-300 w-full md:w-auto text-center md:text-left">
                      {item.year && <span className="text-[#FF3B30] font-mono text-sm font-bold block mb-1">{item.year}</span>}
                      <h4 className="text-lg font-medium">{item.title}</h4>
                    </div>
                  </div>
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.5)] z-10 shrink-0" />
                  <div className={`hidden md:block w-1/2 ${idx % 2 === 0 ? 'order-last' : ''}`} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ACHIEVEMENTS */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-32"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap className="w-6 h-6 text-yellow-400" />, value: "AI Powered", label: "Shopping Engine" },
              { icon: <ShoppingBag className="w-6 h-6 text-emerald-400" />, value: "100+", label: "Stores Connected" },
              { icon: <Globe className="w-6 h-6 text-blue-400" />, value: "Real-Time", label: "Price Comparison" },
              { icon: <Users className="w-6 h-6 text-purple-400" />, value: "Global", label: "Users" },
              { icon: <Shield className="w-6 h-6 text-[#FF3B30]" />, value: "24/7", label: "AI Assistance" }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className={`bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300 ${idx === 4 ? 'md:col-span-2 lg:col-span-1 lg:hidden xl:flex hidden' : ''} ${idx === 4 ? 'hidden lg:hidden' : ''}`}
              >
                <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                  {stat.icon}
                </div>
                <h4 className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</h4>
                <p className="text-white/50 text-sm uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* QUOTE */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="mb-32 max-w-4xl mx-auto text-center px-4"
        >
          <div className="relative">
            <span className="absolute -top-12 -left-8 text-8xl text-white/10 font-serif leading-none">"</span>
            <blockquote className="text-2xl md:text-4xl font-light leading-tight text-white/90 italic mb-8 relative z-10">
              Technology should empower people to search less, save immediately, and shop wiser.
            </blockquote>
            <span className="absolute -bottom-16 -right-8 text-8xl text-white/10 font-serif leading-none">"</span>
          </div>
          <p className="text-xl font-medium text-[#FF3B30]">— Awan Warsi, Founder, Owner & Chairman</p>
        </motion.section>

        {/* VALUES */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="mb-32"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Innovation",
              "Transparency",
              "Trust",
              "Accessibility"
            ].map((value, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm group hover:border-white/30 transition-all duration-300"
              >
                <h4 className="text-xl font-bold text-white/90 group-hover:text-white group-hover:scale-105 transition-transform duration-300">
                  {value}
                </h4>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SOCIAL LINKS */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="mb-32 flex flex-col items-center"
        >
          <h3 className="text-xl text-white/50 mb-8 uppercase tracking-widest font-medium">Connect with Awan</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="mailto:mohammdsaeed24@gmail.com" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#EA4335]/20 hover:border-[#EA4335] hover:shadow-[0_0_20px_rgba(234,67,53,0.4)] transition-all duration-300 group">
              <Mail className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a href="https://youtube.com" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#FF0000]/20 hover:border-[#FF0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] transition-all duration-300 group">
              <Youtube className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a href="https://instagram.com" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#E1306C]/20 hover:border-[#E1306C] hover:shadow-[0_0_20px_rgba(225,48,108,0.4)] transition-all duration-300 group">
              <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a href="https://x.com" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2] hover:shadow-[0_0_20px_rgba(29,161,242,0.4)] transition-all duration-300 group">
              <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a href="https://github.com" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 group">
              <Github className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="relative text-center py-20 px-4 rounded-[3rem] overflow-hidden border border-white/10 bg-[#111]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#FF3B30]/20 to-transparent opacity-50" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-10">Join the Future of Smart Shopping</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center gap-2 group"
              >
                Explore BuyWise <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/scanner')}
                className="px-8 py-4 bg-[#FF3B30] text-white font-bold rounded-full hover:bg-[#ff5247] transition-colors duration-300 shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:shadow-[0_0_30px_rgba(255,59,48,0.5)] flex items-center justify-center gap-2"
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
