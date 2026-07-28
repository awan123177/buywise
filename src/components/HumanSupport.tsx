import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Headset, Sparkles, ShoppingCart, ShieldCheck, CreditCard, 
  Bug, Package, Lightbulb, HelpCircle, User, Paperclip, 
  Send, CheckCircle2, ChevronLeft, UploadCloud, X, Mail, MessageSquare, Bot, AlertCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function HumanSupport() {
  const { user } = useAuth();
  
  const [view, setView] = useState<'home' | 'form' | 'success' | 'chat'>('home');
  const [selectedTopic, setSelectedTopic] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guest Email management
  const [guestEmail, setGuestEmail] = useState('');
  useEffect(() => {
    let email = localStorage.getItem('guestSupportEmail');
    if (!email) {
      email = 'guest_' + Math.random().toString(36).substring(7) + '@example.com';
      localStorage.setItem('guestSupportEmail', email);
    }
    setGuestEmail(email);
  }, []);

  const getUserEmail = () => user?.email || formData.email || guestEmail || 'guest@example.com';

  // Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [botState, setBotState] = useState<'greeting' | 'offering_human' | 'human_requested'>('greeting');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isBotTyping]);

  useEffect(() => {
    if (view === 'chat' && chatMessages.length === 0 && !activeTicketId) {
      setChatMessages([
        { id: 'bot-1', sender: 'bot', text: "Hi there! I'm the BuyWise AI Assistant. How can I help you today?", timestamp: new Date().toISOString() }
      ]);
    }
  }, [view]);

  // Poll for human replies if there's an active ticket
  useEffect(() => {
    if (activeTicketId) {
      const fetchTicket = async () => {
        try {
          const res = await fetch('/api/support/my-tickets', {
            headers: { 'x-user-email': getUserEmail() }
          });
          if (res.ok) {
            const data = await res.json();
            const ticket = data.find((t: any) => t.id === activeTicketId);
            if (ticket) {
              setChatMessages(ticket.messages);
            }
          }
        } catch (e) {
          console.error('Failed to poll ticket', e);
        }
      };
      
      fetchTicket();
      const interval = setInterval(fetchTicket, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTicketId, user?.email, formData.email]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          browser: navigator.userAgent,
          device: navigator.platform,
          url: window.location.href
        })
      });
      
      if (!res.ok) throw new Error('Failed to submit ticket');
      
      setView('success');
      toast.success('Ticket submitted successfully');
    } catch (error) {
      toast.error('Failed to submit ticket. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');

    if (activeTicketId) {
      // Send to human
      const tempMsg = { id: Date.now().toString(), sender: 'customer', text: userText, timestamp: new Date().toISOString() };
      setChatMessages(prev => [...prev, tempMsg]);
      
      try {
        await fetch(`/api/support/ticket/${activeTicketId}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': getUserEmail()
          },
          body: JSON.stringify({ text: userText })
        });
      } catch (err) {
        toast.error('Failed to send message');
      }
    } else {
      // Send to bot
      const newMsg = { id: Date.now().toString(), sender: 'customer', text: userText, timestamp: new Date().toISOString() };
      setChatMessages(prev => [...prev, newMsg]);
      
      setIsBotTyping(true);
      try {
        const mappedHistory = chatMessages.map(m => ({
          sender: m.sender === 'customer' ? 'user' : 'bot',
          text: m.text
        }));
        mappedHistory.push({ sender: 'user', text: userText });

        const response = await fetch('/api/support/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: mappedHistory })
        });
        const data = await response.json();
        
        setChatMessages(prev => [...prev, {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: data.text || "I'm sorry, I couldn't process that.",
          timestamp: new Date().toISOString()
        }]);

        const customerMsgCount = chatMessages.filter(m => m.sender === 'customer').length + 1;
        if (customerMsgCount >= 3 || userText.toLowerCase().match(/(human|agent|person|real support|live chat)/)) {
          setBotState('offering_human');
        }
      } catch (e) {
        setChatMessages(prev => [...prev, {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: "I'm having trouble connecting to the AI brain.",
          timestamp: new Date().toISOString()
        }]);
      } finally {
        setIsBotTyping(false);
      }
    }
  };

  const connectToHuman = async () => {
    setIsBotTyping(true);
    setBotState('human_requested');
    
    // Create a ticket with the chat history
    try {
      const chatHistory = chatMessages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
      
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.displayName || 'Guest User',
          email: getUserEmail(),
          phone: '',
          subject: 'Live Chat Support Request',
          message: chatHistory, // fallback
          messages: chatMessages, // send full array to preserve bubbles
          browser: navigator.userAgent,
          device: navigator.platform,
          url: window.location.href
        })
      });
      
      if (!res.ok) throw new Error('Failed to create ticket');
      
      const data = await res.json();
      // Assume the backend returns the created ticket, or we fetch it.
      // Actually our mocked endpoint doesn't return the ticket ID currently.
      // Wait, let's just refetch my-tickets to get the latest one.
      
      setTimeout(async () => {
        const tRes = await fetch('/api/support/my-tickets', {
          headers: { 'x-user-email': getUserEmail() }
        });
        if (tRes.ok) {
          const tickets = await tRes.json();
          if (tickets && tickets.length > 0) {
            // Sort by newest
            const latest = tickets.sort((a:any, b:any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            setActiveTicketId(latest.id);
            setChatMessages(latest.messages);
            setIsBotTyping(false);
            
            toast.success('Connected to Human Support queue!');
          }
        }
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to connect to human agent.');
      setIsBotTyping(false);
    }
  };

  const quickOptions = [
    { label: 'Live Chat', icon: MessageSquare, action: () => setView('chat') },
    { label: 'Submit Ticket', icon: Headset, action: () => { setFormData(p => ({...p, subject: 'Human Support Request'})); setSelectedTopic('Human Support'); setView('form'); } },
    { label: 'Shopping Help', icon: ShoppingCart, action: () => { setFormData(p => ({...p, subject: 'Shopping Help'})); setSelectedTopic('Shopping Help'); setView('form'); } },
    { label: 'Premium Membership', icon: ShieldCheck, action: () => { setFormData(p => ({...p, subject: 'Premium Membership'})); setSelectedTopic('Premium Membership'); setView('form'); } },
    { label: 'Payments', icon: CreditCard, action: () => { setFormData(p => ({...p, subject: 'Payments'})); setSelectedTopic('Payments'); setView('form'); } },
    { label: 'Report a Bug', icon: Bug, action: () => { setFormData(p => ({...p, subject: 'Bug Report'})); setSelectedTopic('Bug Report'); setView('form'); } },
    { label: 'Order Help', icon: Package, action: () => { setFormData(p => ({...p, subject: 'Order Help'})); setSelectedTopic('Order Help'); setView('form'); } },
    { label: 'General Question', icon: HelpCircle, action: () => { setFormData(p => ({...p, subject: 'General Question'})); setSelectedTopic('General Question'); setView('form'); } },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-20 font-sans text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#FF7A00]/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#FF7A00]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-16 relative"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
                <Sparkles className="text-[#FF7A00]" size={16} />
                <span className="text-sm font-bold tracking-wide uppercase text-white/80">Support Center</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-yellow-500">help you?</span>
              </h1>
              <p className="text-xl text-white/50 max-w-2xl mx-auto font-light">
                Get assistance from our dedicated human support team or automated systems. We're here 24/7.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {quickOptions.map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={i}
                    onClick={opt.action}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl p-8 text-left transition-all duration-300 backdrop-blur-xl group shadow-2xl relative overflow-hidden ${opt.label === 'Live Chat' ? 'md:col-span-2 bg-gradient-to-br from-[#FF7A00]/10 to-transparent border-[#FF7A00]/20' : ''}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={`w-14 h-14 rounded-2xl bg-black/50 border flex items-center justify-center mb-6 transition-colors shadow-inner ${opt.label === 'Live Chat' ? 'border-[#FF7A00]/50 group-hover:border-[#FF7A00]' : 'border-white/5 group-hover:border-[#FF7A00]/50'}`}>
                      <Icon className={`transition-colors ${opt.label === 'Live Chat' ? 'text-[#FF7A00]' : 'text-white/70 group-hover:text-[#FF7A00]'}`} size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{opt.label}</h3>
                    <p className="text-sm text-white/40 font-medium flex items-center gap-2 group-hover:text-white/60 transition-colors">
                      {opt.label === 'Live Chat' ? 'Chat with a bot or human agent now' : 'Get Help'} <ChevronLeft size={14} className="rotate-180 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    </p>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div
              key="chat-view"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="max-w-4xl mx-auto h-[700px] flex flex-col bg-[#111111] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-[#161616] flex justify-between items-center z-10 shadow-md">
                <div className="flex items-center gap-4">
                  <button onClick={() => setView('home')} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7A00] to-yellow-500 flex items-center justify-center shadow-lg">
                        {activeTicketId ? <User size={24} className="text-white" /> : <Bot size={24} className="text-white" />}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#161616] rounded-full" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">{activeTicketId ? 'Human Support' : 'BuyWise Assistant'}</h3>
                      <p className="text-xs text-white/50">{activeTicketId ? 'Agent is online' : 'Automated Bot - Online'}</p>
                    </div>
                  </div>
                </div>
                {activeTicketId ? (
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                    <CheckCircle2 size={14} /> Connected to Human
                  </div>
                ) : (
                  <button onClick={connectToHuman} disabled={isBotTyping || botState === 'human_requested'} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-colors disabled:opacity-50">
                    <User size={14} /> Talk to Agent
                  </button>
                )}
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 no-scrollbar flex flex-col">
                <div className="text-center text-xs text-white/30 uppercase tracking-widest font-bold my-4">
                  Today
                </div>
                
                {chatMessages.map((msg, idx) => {
                  const isUser = msg.sender === 'customer';
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 opacity-60">
                        <span className="text-[11px] font-bold tracking-wide">{isUser ? 'You' : (msg.sender === 'agent' ? 'Agent' : 'Bot')}</span>
                        <span className="text-[10px]">•</span>
                        <span className="text-[10px]">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`max-w-[75%] rounded-3xl px-5 py-3 shadow-lg text-[15px] leading-relaxed whitespace-pre-wrap ${
                        isUser 
                          ? 'bg-[#FF7A00] text-white rounded-tr-sm' 
                          : 'bg-[#1C1C1C] border border-white/10 text-white/90 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })}

                {botState === 'offering_human' && !activeTicketId && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-start mt-2">
                    <button 
                      onClick={connectToHuman}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all shadow-lg flex items-center gap-2"
                    >
                      <User size={16} /> Yes, connect me to an Agent
                    </button>
                  </motion.div>
                )}

                {isBotTyping && (
                  <div className="flex flex-col items-start opacity-70">
                    <div className="bg-[#1C1C1C] rounded-3xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-center border border-white/10">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-white/50 rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-white/50 rounded-full" />
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-white/50 rounded-full" />
                    </div>
                  </div>
                )}

                {botState === 'human_requested' && !activeTicketId && (
                  <div className="text-center text-sm text-[#FF7A00] font-medium my-4 flex flex-col items-center gap-2">
                    <RefreshCw size={24} className="animate-spin text-[#FF7A00]/50" />
                    Connecting you to the next available agent...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-[#161616] border-t border-white/10 z-10">
                <form onSubmit={handleSendChatMessage} className="bg-black/50 border border-white/10 rounded-2xl flex items-end p-2 focus-within:border-[#FF7A00]/50 transition-colors">
                  <button type="button" className="p-3 text-white/40 hover:text-white transition-colors rounded-full" title="Attach file">
                    <Paperclip size={20} />
                  </button>
                  <textarea 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent px-2 py-3 max-h-[150px] text-white focus:outline-none resize-none placeholder-white/30"
                    rows={1}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage(e);
                      }
                    }}
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isBotTyping}
                    className="p-3 bg-[#FF7A00] text-white rounded-xl hover:bg-[#E66E00] disabled:opacity-50 transition-colors ml-2"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <button 
                onClick={() => setView('home')} 
                className="mb-8 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
              >
                <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              </button>

              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF7A00]/10 blur-[60px] rounded-full pointer-events-none" />
                
                <h2 className="text-3xl font-black text-white mb-2">{selectedTopic}</h2>
                <p className="text-white/50 mb-10 font-light">Please provide details so we can assist you better.</p>
                
                <form onSubmit={handleSubmitForm} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-2">Name</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 hover:border-white/20 focus:border-[#FF7A00] rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-[#FF7A00] transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-2">Email</label>
                      <input 
                        required 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 hover:border-white/20 focus:border-[#FF7A00] rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-[#FF7A00] transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-2">Phone (Optional)</label>
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 hover:border-white/20 focus:border-[#FF7A00] rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-[#FF7A00] transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-2">Subject</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.subject} 
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                        className="w-full bg-black/50 border border-white/10 hover:border-white/20 focus:border-[#FF7A00] rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-[#FF7A00] transition-all"
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-2">Message</label>
                    <textarea 
                      required 
                      value={formData.message} 
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      rows={5}
                      className="w-full bg-black/50 border border-white/10 hover:border-white/20 focus:border-[#FF7A00] rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-[#FF7A00] transition-all resize-none"
                      placeholder="Please describe your request in detail..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50 ml-2">Attachments</label>
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="w-full border-2 border-dashed border-white/10 hover:border-white/30 rounded-2xl p-8 text-center transition-colors bg-black/20 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files) {
                            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                          }
                        }}
                      />
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/50">
                        <UploadCloud size={24} />
                      </div>
                      <p className="text-white/70 font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-white/40">SVG, PNG, JPG, PDF or GIF (max. 10MB)</p>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                            <div className="flex items-center gap-3">
                              <Paperclip size={16} className="text-white/50" />
                              <span className="text-sm text-white/80">{file.name}</span>
                              <span className="text-xs text-white/40">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeFile(idx)}
                              className="text-white/50 hover:text-[#FF3B30] transition-colors p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-[#FF7A00] hover:bg-[#E66E00] text-white font-bold text-lg py-5 rounded-2xl transition-all shadow-[0_0_40px_rgba(255,122,0,0.3)] hover:shadow-[0_0_60px_rgba(255,122,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 mt-8 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        <span className="relative z-10">Submit Ticket</span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}

          {view === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto pt-20 flex flex-col items-center text-center"
            >
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                  className="w-32 h-32 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center relative z-10"
                >
                  <CheckCircle2 size={64} className="text-green-500" />
                </motion.div>
              </div>
              
              <h2 className="text-4xl font-black text-white mb-6">Thank you for contacting BuyWise.</h2>
              
              <p className="text-lg text-white/60 mb-8 max-w-lg leading-relaxed font-light">
                Your request has been received successfully. A real BuyWise support specialist will respond as soon as possible.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 w-full max-w-md backdrop-blur-xl mb-12">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider font-bold mb-1">Support Email</p>
                      <p className="text-white font-medium">mohammdsaeed24@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-white/10" />

                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] shrink-0">
                      <Headset size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider font-bold mb-1">Estimated Response</p>
                      <p className="text-white font-medium">Usually within a few hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setView('home')} 
                className="text-white/50 hover:text-white font-medium flex items-center gap-2 group transition-colors"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Return to Support Home
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
