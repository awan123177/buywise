import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Github, Instagram, Linkedin, Twitter, ArrowRight, Sparkles, Target, Zap, Shield, Globe, Users, ShoppingBag, Youtube, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';

export default function FounderPage() {
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
        title="Awan Warsi | Founder & CEO of BuyWise"
        description="Meet Awan Warsi, Founder and CEO of BuyWise, the AI-powered shopping platform helping users compare prices, discover deals and save money."
        canonicalUrl="https://buywiser.store/founder"
      />
      
      {/* Structured Data for Founder */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": "https://buywiser.store/founder#person",
              "name": "Awan Warsi",
              "jobTitle": ["Founder", "CEO", "Owner"],
              "worksFor": {
                "@type": "Organization",
                "name": "BuyWise",
                "url": "https://buywiser.store"
              },
              "sameAs": [
                "https://www.instagram.com/awanwarsi",
                "https://x.com/warsi_awan",
                "https://github.com/awan123177/buywise.git",
                "https://linkedin.com/in/awanwarsi"
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
                  "name": "Founder",
                  "item": "https://buywiser.store/founder"
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
          className="flex flex-col items-center justify-center text-center mb-32 pt-10"
        >
          <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-6">
            Founder
          </motion.h1>
          <motion.p variants={fadeIn} className="text-lg md:text-2xl text-white/60 font-medium tracking-wide max-w-2xl">
            Meet the Founder Behind BuyWise
          </motion.p>
        </motion.section>

        {/* FOUNDER CARD */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="mb-32"
        >
          <div className="relative group">
            {/* Animated glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF3B30]/50 to-purple-600/50 rounded-[2rem] blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 flex flex-col lg:flex-row gap-12 items-center lg:items-start shadow-2xl">
              
              {/* Left Side: Image */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0 relative group/img cursor-pointer"
              >
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden border border-white/20 bg-gradient-to-br from-white/5 to-white/0 shadow-[0_0_40px_rgba(255,59,48,0.15)]">
                  <img 
                    src="/founder.png?v=2" 
                    alt="Awan Warsi" 
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/img:scale-110"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }}
                  />
                  <div className="hidden absolute inset-0 flex items-center justify-center text-4xl font-mono text-white/30 bg-[#111]">AW</div>
                </div>
              </motion.div>

              {/* Right Side: Details */}
              <div className="flex-1 flex flex-col justify-center lg:pt-4 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Awan Warsi</h2>
                  <BadgeCheck className="w-8 h-8 text-blue-500 shrink-0" />
                </div>
                <h3 className="text-lg md:text-xl text-white/50 font-medium mb-8">
                  Founder • Owner • CEO of BuyWise
                </h3>
                
                {/* Badges */}
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex flex-wrap justify-center lg:justify-start gap-3"
                >
                  {[
                    { icon: "🚀", text: "Founder" },
                    { icon: "🤖", text: "AI Innovator" },
                    { icon: "💻", text: "Full Stack Developer" },
                    { icon: "💰", text: "Entrepreneur" },
                    { icon: "🌍", text: "Building Global Shopping Intelligence" }
                  ].map((badge, idx) => (
                    <motion.div 
                      key={idx}
                      variants={fadeIn}
                      className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm md:text-base text-white/80 backdrop-blur-md shadow-lg"
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

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
              Awan Warsi founded BuyWise with one mission: to make online shopping transparent, intelligent and affordable.
            </p>
            <p className="text-white/70 leading-relaxed mb-6">
              After experiencing fake discounts, misleading pricing and difficult product comparisons, he decided to build an AI-powered platform that gives consumers complete pricing transparency.
            </p>
            <p className="text-white/70 leading-relaxed mb-6">
              Today BuyWise combines artificial intelligence, price comparison, barcode scanning, flight search, hotel booking and smart shopping tools into one intelligent ecosystem.
            </p>
            <p className="text-white/90 font-medium leading-relaxed">
              The vision is to become the world's smartest shopping assistant.
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
              <h3 className="text-3xl font-bold mb-6">Mission</h3>
              <p className="text-2xl md:text-3xl font-light text-white/90 leading-snug">
                Empower millions of shoppers through AI, transparency and intelligent price comparison while helping everyone save money every day.
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
                { year: "2026", title: "BuyWise Founded" },
                { title: "AI Shopping Assistant" },
                { title: "Price Comparison Engine" },
                { title: "Flight Search" },
                { title: "Hotel Search" },
                { title: "Barcode Scanner" },
                { title: "Premium Membership" },
                { title: "Global Expansion" }
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
              Technology should help people spend less time searching and more time living.
            </blockquote>
            <span className="absolute -bottom-16 -right-8 text-8xl text-white/10 font-serif leading-none">"</span>
          </div>
          <p className="text-xl font-medium text-[#FF3B30]">— Awan Warsi</p>
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
          <h3 className="text-xl text-white/50 mb-8 uppercase tracking-widest font-medium">Connect</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="mailto:mohammdsaeed24@gmail.com" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#EA4335]/20 hover:border-[#EA4335] hover:shadow-[0_0_20px_rgba(234,67,53,0.4)] transition-all duration-300 group">
              <Mail className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a href="https://youtube.com/@awanwarsi-n7h?si=e0ell5fmqVCIhWgQ" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#FF0000]/20 hover:border-[#FF0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] transition-all duration-300 group">
              <Youtube className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a href="https://www.instagram.com/awanwarsi" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#E1306C]/20 hover:border-[#E1306C] hover:shadow-[0_0_20px_rgba(225,48,108,0.4)] transition-all duration-300 group">
              <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a href="https://x.com/warsi_awan" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2] hover:shadow-[0_0_20px_rgba(29,161,242,0.4)] transition-all duration-300 group">
              <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#0077B5]/20 hover:border-[#0077B5] hover:shadow-[0_0_20px_rgba(0,119,181,0.4)] transition-all duration-300 group">
              <Linkedin className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </a>
            <a href="https://github.com/awan123177/buywise.git" target="_blank" rel="noopener noreferrer" className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 group">
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
