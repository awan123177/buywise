import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Mail, Phone, User, Send, Bot } from 'lucide-react';

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string}[]>([
    { sender: 'bot', text: 'Hello! I am the automated support assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [handover, setHandover] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, handover]);

  const handleSend = () => {
    if(!inputValue.trim()) return;
    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputValue('');
    
    if(!handover) {
      setTimeout(() => {
        // Simple logic for plan approval question
        const lowerMsg = userMsg.toLowerCase();
        if (lowerMsg.includes('plan') && (lowerMsg.includes('approve') || lowerMsg.includes('time') || lowerMsg.includes('long'))) {
           setMessages(prev => [...prev, { sender: 'bot', text: '5 to 10 min on Saturday or Sunday, and on Monday to Friday 9 AM to 3 PM.' }]);
           return;
        }

        if (lowerMsg.includes('plan') && (lowerMsg.includes('get') || lowerMsg.includes('detail') || lowerMsg.includes('feature') || lowerMsg.includes('what'))) {
           setMessages(prev => [...prev, { sender: 'bot', text: 'Weekly Pass (₹30) offers Unlimited AI Insights, Price Drop Alerts, & Flight/Train Scans. Monthly Elite (₹100) adds a Premium Badge, No Ads, & Priority Support. Forever Founder (₹700) includes all features plus Early Access & Lifetime Premium Support.' }]);
           return;
        }

        if (lowerMsg.includes('plan') || lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('how much')) {
           setMessages(prev => [...prev, { sender: 'bot', text: 'We offer three plans: Weekly Pass at ₹30, Monthly Elite at ₹100, and Forever Founder (Lifetime) at ₹700.' }]);
           return;
        }

        setMessages(prev => [...prev, { sender: 'bot', text: 'I understand. Let me connect you with our primary support agent for further assistance.' }]);
        setTimeout(() => {
          setHandover(true);
        }, 1000);
      }, 500);
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-12 md:right-12 w-14 h-14 md:w-16 md:h-16 bg-[#3081FF] rounded-full flex items-center justify-center text-white z-[200] group border border-white/20 shadow-xl"
      >
        <MessageCircle size={24} className="relative z-[200] group-hover:scale-110 md:w-[28px] md:h-[28px] transition-transform" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-20 right-4 md:bottom-32 md:right-12 w-[calc(100vw-2rem)] md:w-[350px] h-[calc(100vh-8rem)] max-h-[500px] bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col z-[200] overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-[#3081FF]/20 text-white flex items-center justify-between border-b border-[#3081FF]/30 shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} className="text-[#3081FF]" />
                <span className="font-black tracking-widest text-[10px] uppercase">Chat Support</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform bg-white/10 rounded-full p-2 cursor-pointer text-white">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.sender === 'bot' && (
                     <div className="w-6 h-6 rounded-full bg-[#3081FF]/20 flex items-center justify-center mr-2 shrink-0">
                       <Bot size={12} className="text-[#3081FF]" />
                     </div>
                   )}
                   <div className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.sender === 'user' ? 'bg-[#3081FF] text-white rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm'}`}>
                     {msg.text}
                   </div>
                 </div>
               ))}
               
               {handover && (
                 <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="pt-4 border-t border-white/10 mt-4 space-y-6">
                    <div className="text-center mb-4">
                       <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 border border-white/10">
                          <User size={24} className="text-green-500" />
                       </div>
                       <h3 className="font-black text-sm tracking-tight text-white">awanwarsi</h3>
                       <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Primary Support Agent</p>
                    </div>

                    <div className="space-y-3">
                       <a href="mailto:awanwarsi790@gmail.com" className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group block">
                          <Mail size={16} className="text-white/50 group-hover:text-green-500 transition-colors" />
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-white/50">Email</span>
                            <span className="text-xs font-medium text-white">awanwarsi790@gmail.com</span>
                          </div>
                       </a>
                       <a href="https://wa.me/917760449306" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group block">
                          <Phone size={16} className="text-white/50 group-hover:text-green-500 transition-colors" />
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-widest font-bold text-white/50">WhatsApp</span>
                            <span className="text-xs font-medium text-white">+91 77604 49306</span>
                          </div>
                       </a>
                    </div>
                 </motion.div>
               )}
               <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-black shrink-0">
               <div className="flex items-center gap-2">
                 <input 
                   type="text" 
                   value={inputValue}
                   onChange={(e) => setInputValue(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                   placeholder="Type your message..."
                   className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-[#3081FF] transition-colors"
                   disabled={handover}
                 />
                 <button 
                   onClick={handleSend}
                   disabled={handover || !inputValue.trim()}
                   className="w-10 h-10 bg-[#3081FF] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Send size={16} className="ml-[-2px]" />
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
