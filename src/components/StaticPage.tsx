import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PAGES = {
  about: {
    title: "About BuyWise",
    content: (
      <>
        <h3 className="text-xl font-bold mb-4">Company Story</h3>
        <p className="text-white/70 mb-6">BuyWise was founded with a single mission: to bring absolute transparency to online shopping and travel. The internet is filled with dynamic pricing, hidden fees, and manipulated deals. We built BuyWise to cut through the noise using AI-driven price intelligence.</p>
        
        <h3 className="text-xl font-bold mb-4">Our Vision</h3>
        <p className="text-white/70 mb-6">To become the world's most trusted AI assistant for consumer purchasing, ensuring no one ever overpays for a product or flight again.</p>
        
        <h3 className="text-xl font-bold mb-4">How BuyWise Works</h3>
        <p className="text-white/70 mb-6">We aggregate data from across the web in real-time. Whether you are looking for electronics or flights, our intelligence engine scans hundreds of retailers and airlines to find the absolute lowest price, applying hidden coupons and affiliate deals automatically.</p>
      </>
    )
  },
  founder: {
    title: "Founder",
    content: (
      <>
        <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-white/10 bg-[#222222] flex items-center justify-center shrink-0">
             <span className="text-white/40 font-mono text-xl uppercase tracking-widest">AW</span>
          </div>
          <div>
            <h2 className="text-3xl font-black font-display text-white mb-2">Awan Warsi</h2>
            <h3 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-widest">Founder of BuyWise</h3>
            <p className="text-white/70 mb-4">Awan Warsi founded BuyWise to solve a problem he faced every day: the sheer difficulty of finding the real lowest price online. After years of dealing with fake sales and dynamic pricing, he set out to build an AI platform that would level the playing field for consumers.</p>
            <div className="flex gap-4 mt-4">
              <a href="https://linkedin.com/company/buywise" className="text-[#FF3B30] hover:underline text-sm">LinkedIn</a>
              <a href="https://x.com/buywise" className="text-[#FF3B30] hover:underline text-sm">X (Twitter)</a>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4">The Mission</h3>
        <p className="text-white/70 mb-6">Awan's mission is simple: to make AI-powered price intelligence accessible to everyone. The goal is to build an ecosystem where transparency is the default, not a luxury.</p>
      </>
    )
  },
  contact: {
    title: "Contact Us",
    content: (
      <>
        <p className="text-white/70 mb-6">We're here to help. Reach out to our support team for any questions or business inquiries.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h4 className="text-white font-bold mb-2">Customer Support</h4>
            <p className="text-white/50 mb-4">For help with your account, premium subscription, or app issues.</p>
            <a href="mailto:support@buywiser.store" className="text-[#FF3B30] font-mono">support@buywiser.store</a>
          </div>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h4 className="text-white font-bold mb-2">Business Inquiries</h4>
            <p className="text-white/50 mb-4">For partnerships, affiliate integrations, and media.</p>
            <a href="mailto:partners@buywiser.store" className="text-[#FF3B30] font-mono">partners@buywiser.store</a>
          </div>
        </div>
      </>
    )
  },
  privacy: {
    title: "Privacy Policy",
    content: (
      <>
        <p className="text-white/70 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        <h3 className="text-xl font-bold mb-4">Data Collection</h3>
        <p className="text-white/70 mb-6">We collect information that you provide directly to us, such as when you create an account, use our services, or communicate with us. This includes search queries to improve our AI models.</p>
        <h3 className="text-xl font-bold mb-4">Data Usage</h3>
        <p className="text-white/70 mb-6">We use the information we collect to operate, maintain, and provide the features of our services, and to communicate with you.</p>
      </>
    )
  },
  terms: {
    title: "Terms & Conditions",
    content: (
      <>
        <p className="text-white/70 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        <h3 className="text-xl font-bold mb-4">Acceptance of Terms</h3>
        <p className="text-white/70 mb-6">By accessing and using BuyWise, you accept and agree to be bound by the terms and provision of this agreement.</p>
        <h3 className="text-xl font-bold mb-4">Service Description</h3>
        <p className="text-white/70 mb-6">BuyWise provides AI-powered shopping and travel comparison tools. We do not sell products directly and are not responsible for third-party merchant fulfillment.</p>
      </>
    )
  },
  disclaimer: {
    title: "Disclaimer",
    content: (
      <>
        <h3 className="text-xl font-bold mb-4">Affiliate Disclosure</h3>
        <p className="text-white/70 mb-6">BuyWise may earn an affiliate commission when you purchase through links on our site. This comes at no additional cost to you and helps keep our service free.</p>
        <h3 className="text-xl font-bold mb-4">Price Accuracy</h3>
        <p className="text-white/70 mb-6">While we strive for real-time accuracy, prices and availability are subject to change by the respective merchants. Always verify the final price at checkout.</p>
      </>
    )
  },
  careers: {
    title: "Careers",
    content: (
      <>
        <p className="text-white/70 mb-6">Join us in building the future of AI-powered commerce.</p>
        <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center">
          <h3 className="text-xl font-bold mb-2">No Open Roles</h3>
          <p className="text-white/50 mb-4">We aren't actively hiring right now, but we're always looking for talented engineers and designers.</p>
          <a href="mailto:careers@buywiser.store" className="text-[#FF3B30]">careers@buywiser.store</a>
        </div>
      </>
    )
  },
  press: {
    title: "Press & Media",
    content: (
      <>
        <p className="text-white/70 mb-6">For press inquiries, interviews, or media kits, please contact our PR team.</p>
        <a href="mailto:press@buywiser.store" className="text-[#FF3B30] mb-8 block">press@buywiser.store</a>
      </>
    )
  },
  faq: {
    title: "Frequently Asked Questions",
    content: (
      <>
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-bold text-white mb-2">Is BuyWise free to use?</h4>
            <p className="text-white/70">Yes, the core price comparison features are completely free. We also offer a Premium tier with advanced AI features.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">How does BuyWise make money?</h4>
            <p className="text-white/70">We earn a small commission from retailers when you make a purchase using our links, at no extra cost to you.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">How accurate are the price drop alerts?</h4>
            <p className="text-white/70">Our systems check prices hourly. You'll receive a notification as soon as the price drops below your target.</p>
          </div>
        </div>
      </>
    )
  }
};

export default function StaticPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  
  const pageData = pageId && (PAGES as any)[pageId];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageId]);

  if (!pageData) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <button onClick={() => navigate('/')} className="text-[#FF3B30] underline">Return Home</button>
      </div>
    );
  }

  // Generate structured data for this page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": pageId === 'faq' ? 'FAQPage' : pageId === 'founder' ? 'ProfilePage' : 'WebPage',
    "name": pageData.title,
    "url": `https://buywiser.store/${pageId}`,
    "publisher": {
      "@type": "Organization",
      "name": "BuyWise",
      "url": "https://buywiser.store",
      "founder": {
        "@type": "Person",
        "name": "Awan Warsi"
      }
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-12 max-w-[1000px] mx-auto">
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-white/50 hover:text-white mb-12 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-4xl md:text-5xl font-black font-display text-white mb-12 tracking-tight">
        {pageData.title}
      </h1>

      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-display">
        {pageData.content}
      </div>
    </div>
  );
}
