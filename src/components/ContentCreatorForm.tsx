import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Video, Instagram, Phone, Mail, User, Image as ImageIcon, Link as LinkIcon, 
  Send, Sparkles, CheckCircle2, Star, Award, Zap, Camera, Play, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContentCreatorForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    instagram: '',
    photo: '',
    portfolio: '',
    bio: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      toast.error('Please fill in your Name, Phone Number, and Email.');
      return;
    }

    if (!formData.instagram.trim()) {
      toast.error('Please provide your Instagram Profile Link.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmittedId(data.id);
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Could not submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedId) {
    return (
      <div className="bg-[#0D0D11] border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 shadow-[0_0_40px_rgba(16,185,129,0.15)] font-sans">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/40"
        >
          <CheckCircle2 size={40} />
        </motion.div>

        <h2 className="text-3xl font-black text-white mb-3">Application Received! 🎉</h2>
        <p className="text-white/70 mb-6 text-sm leading-relaxed">
          Thank you <span className="text-white font-bold">{formData.name}</span>! Our team at BuyWise has received your application for the <span className="text-[#FF3B30] font-bold">Content Creator</span> role.
        </p>

        <div className="bg-black/60 border border-white/10 rounded-2xl p-4 mb-6 font-mono text-xs text-left space-y-2">
          <p className="text-white/40">Application Ref: <span className="text-emerald-400 font-bold">{submittedId}</span></p>
          <p className="text-white/80">📱 Phone: {formData.phone}</p>
          <p className="text-white/80">📸 Instagram: {formData.instagram}</p>
          <p className="text-white/80">✉️ Email: {formData.email}</p>
        </div>

        <p className="text-xs text-white/50 mb-8">
          Our hiring & creative leads will review your portfolio and reach out to you via WhatsApp or Email within 24-48 hours.
        </p>

        <button
          onClick={() => {
            setSubmittedId(null);
            setFormData({ name: '', phone: '', email: '', instagram: '', photo: '', portfolio: '', bio: '' });
          }}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-xs font-bold transition-all"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6 font-sans">
      
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121218] via-[#1A1A24] to-[#0A0A0E] border border-white/10 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FF3B30]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF3B30]/15 border border-[#FF3B30]/30 text-[#FF3B30] text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles size={14} /> We're Hiring • Content Creator
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            Join BuyWise as a <span className="bg-gradient-to-r from-[#FF3B30] via-orange-400 to-amber-300 bg-clip-text text-transparent">Content Creator</span> 🎬
          </h2>

          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
            Are you passionate about viral short-form videos (Reels, Shorts, TikTok), tech deals, and unboxing cool gadgets? Produce engaging content for BuyWise, build an audience, and monetize your creative talent!
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl text-[#FF3B30] border border-white/10">
                <Video size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Short-Form Focus</p>
                <p className="text-[11px] text-white/50">Instagram Reels & YouTube Shorts</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl text-amber-400 border border-white/10">
                <Award size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Competitive Pay</p>
                <p className="text-[11px] text-white/50">Base Pay + Viral View Bonuses</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl text-emerald-400 border border-white/10">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Creative Freedom</p>
                <p className="text-[11px] text-white/50">Full support & free sample products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* APPLICATION FORM */}
      <div className="bg-[#121218] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
        <div className="mb-8 border-b border-white/10 pb-6">
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Camera className="text-[#FF3B30]" size={24} /> Content Creator Application Form
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Fill in your details, Instagram profile link, contact info, and portfolio photos below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* FULL NAME */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-1.5">
                <User size={14} className="text-[#FF3B30]" /> Full Name <span className="text-[#FF3B30]">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF3B30] transition-all"
              />
            </div>

            {/* PHONE / WHATSAPP NUMBER */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-1.5">
                <Phone size={14} className="text-[#FF3B30]" /> Phone / WhatsApp Number <span className="text-[#FF3B30]">*</span>
              </label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF3B30] transition-all"
              />
            </div>

            {/* EMAIL ADDRESS */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-1.5">
                <Mail size={14} className="text-[#FF3B30]" /> Email Address <span className="text-[#FF3B30]">*</span>
              </label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. creator@gmail.com"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF3B30] transition-all"
              />
            </div>

            {/* INSTAGRAM LINK */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-1.5">
                <Instagram size={14} className="text-pink-500" /> Instagram Profile Link <span className="text-[#FF3B30]">*</span>
              </label>
              <input 
                type="url" 
                required
                value={formData.instagram}
                onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500 transition-all"
              />
            </div>

          </div>

          {/* PROFILE / PORTFOLIO PHOTO */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-amber-400" /> Profile Photo / Headshot
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2 space-y-2">
                <input 
                  type="text" 
                  value={formData.photo.startsWith('data:') ? 'Image Uploaded' : formData.photo}
                  onChange={e => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="Paste Photo URL or click to upload"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF3B30] transition-all"
                />
                
                <div className="flex items-center gap-2">
                  <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white cursor-pointer transition-all inline-flex items-center gap-1.5">
                    <Camera size={14} /> Upload Image File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                  <span className="text-[11px] text-white/40">PNG, JPG, WEBP (Max 5MB)</span>
                </div>
              </div>

              {/* Photo Preview Box */}
              <div className="flex justify-center sm:justify-end">
                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 bg-black/40 overflow-hidden flex items-center justify-center relative">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Applicant" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-white/30">
                      <ImageIcon size={24} className="mx-auto mb-1" />
                      <span className="text-[9px] uppercase font-bold">Photo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PORTFOLIO / PREVIOUS VIDEO LINKS */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-1.5">
              <LinkIcon size={14} className="text-blue-400" /> Portfolio / Reel Links
            </label>
            <input 
              type="text" 
              value={formData.portfolio}
              onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
              placeholder="e.g. YouTube Shorts, Google Drive, or TikTok link"
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF3B30] transition-all"
            />
          </div>

          {/* BIO / COVER NOTE */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2 flex items-center gap-1.5">
              <Play size={14} className="text-emerald-400" /> Tell Us About Yourself & Your Creative Style
            </label>
            <textarea 
              rows={4}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Briefly describe your experience making videos, your editing tools (CapCut, Premiere, etc.), and why you'd like to create content for BuyWise..."
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF3B30] transition-all resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#FF3B30] via-orange-500 to-[#FF3B30] hover:from-[#FF3B30]/90 text-white font-black uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(255,59,48,0.4)] flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">Submitting Application...</span>
            ) : (
              <>
                <Send size={18} /> Submit Creator Application <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
