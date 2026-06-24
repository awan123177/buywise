import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Mail, Phone, User, Send, Bot, Loader2, Sparkles, Headset, ChevronRight, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Markdown from 'react-markdown';

export default function SupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string}[]>([
    { sender: 'bot', text: 'Namaste! I am the BuyWise Support Intelligence. I can guide you through our 3D product view, price radar forecasts, flight scanners, billing, and plans. How can I assist you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [handover, setHandover] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, handover, isLoading]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue.trim();
    if (!textToSend || isLoading) return;
    
    const updatedMessages: { sender: 'user' | 'bot'; text: string }[] = [...messages, { sender: 'user', text: textToSend }];
    setMessages(updatedMessages);
    if (!textOverride) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.slice(-8), // Send last 8 messages for context
          userEmail: user?.email || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Support system offline');
      }

      const data = await response.json();
      const botText = data.text || "I apologize, our core support system is refreshing. Please let me know how else I can help.";
      
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);

      // Trigger escalation to human if the bot suggests live support or user requests direct agent
      const lowerBotText = botText.toLowerCase();
      if (lowerBotText.includes('live support') || lowerBotText.includes('escalate') || lowerBotText.includes('primary support agent') || lowerBotText.includes('whatsapp') || lowerBotText.includes('email') || lowerBotText.includes('awanwarsi') || lowerBotText.includes('avanvarsi')) {
        setHandover(true);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: "Connecting you directly to human assistance due to connection limits..." }]);
      setHandover(true);
    } finally {
      setIsLoading(false);
    }
  };

  const quickReplies = [
    "How does the price tracker work?",
    "My premium was not approved yet.",
    "Can you scan flights for me?",
    "How much time will it take to approve premium?"
  ];

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
                <Bot size={18} className="text-[#3081FF] animate-pulse" />
                <span className="font-black tracking-widest text-[10px] uppercase flex items-center gap-1.5">
                  BuyWise AI Support <Sparkles size={10} className="text-yellow-400" />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setHandover(!handover)} 
                  title="Toggle Contact Support Info"
                  className={`p-2 rounded-full cursor-pointer transition-colors ${handover ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <Headset size={14} />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform bg-white/10 rounded-full p-2 cursor-pointer text-white">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   {msg.sender === 'bot' && (
                     <div className="w-6 h-6 rounded-full bg-[#3081FF]/20 flex items-center justify-center mr-2 shrink-0">
                       <Bot size={12} className="text-[#3081FF]" />
                     </div>
                   )}
                   <div className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-[#3081FF] text-white rounded-tr-sm font-medium' : 'bg-white/10 text-white/95 rounded-tl-sm'}`}>
                     {msg.sender === 'bot' ? (
                       <div className="prose prose-invert prose-p:leading-snug prose-sm max-w-none">
                         <Markdown>{msg.text}</Markdown>
                       </div>
                     ) : (
                       msg.text
                     )}
                   </div>
                 </div>
               ))}

               {messages.length === 1 && !isLoading && (
                 <div className="flex flex-col gap-2 pt-2">
                   <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                     <HelpCircle size={10} /> Suggested Questions
                   </span>
                   {quickReplies.map((reply, i) => (
                     <motion.button
                       key={i}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: i * 0.1 }}
                       onClick={() => handleSend(reply)}
                       className="text-left p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white/80 transition-colors flex items-center justify-between group"
                     >
                       {reply}
                       <ChevronRight size={12} className="text-white/30 group-hover:text-white/80 transition-colors" />
                     </motion.button>
                   ))}
                 </div>
               )}

               {isLoading && (
                 <div className="flex justify-start">
                   <div className="w-6 h-6 rounded-full bg-[#3081FF]/20 flex items-center justify-center mr-2 shrink-0">
                     <Bot size={12} className="text-[#3081FF] animate-spin" />
                   </div>
                   <div className="bg-white/5 rounded-xl p-3 text-xs text-white/40 flex items-center gap-2">
                     <Loader2 size={12} className="animate-spin" /> BuyWise intelligence analyzing...
                   </div>
                 </div>
               )}
               
               {handover && (
                 <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="pt-4 border-t border-white/10 mt-4 space-y-4">
                     <div className="text-center mb-2">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-1 border border-white/10">
                           <User size={18} className="text-green-500 animate-bounce" />
                        </div>
                        <h3 className="font-black text-xs tracking-tight text-white">Direct Core Team Support</h3>
                        <p className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5">Live Assistance Channels</p>
                     </div>

                     <div className="space-y-2">
                        <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2.5 p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group block">
                           <Mail size={14} className="text-white/50 group-hover:text-green-500 transition-colors" />
                           <div className="flex flex-col">
                             <span className="text-[8px] uppercase tracking-widest font-bold text-white/50">Owner & Developer</span>
                             <span className="text-[11px] font-medium text-white">Awanwarsi</span>
                           </div>
                        </a>
                        <a href="mailto:awanwarsi790@gmail.com" className="hidden flex items-center gap-2.5 p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group block">
                           <Mail size={14} className="text-white/50 group-hover:text-green-500 transition-colors" />
                           <div className="flex flex-col">
                             <span className="text-[8px] uppercase tracking-widest font-bold text-white/50">Lead Engineer</span>
                             <span className="text-[11px] font-medium text-white">awanwarsi790@gmail.com</span>
                           </div>
                        </a>
                        <a href="https://wa.me/917760449306" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors group block">
                           <Phone size={14} className="text-green-400 group-hover:text-green-500 transition-colors" />
                           <div className="flex flex-col">
                             <span className="text-[8px] uppercase tracking-widest font-bold text-green-400/50">WhatsApp Live Support</span>
                             <span className="text-[11px] font-medium text-green-300">+91 77604 49306</span>
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
                   placeholder="Type your question..."
                   className="flex-1 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-[#3081FF] transition-colors"
                   disabled={isLoading}
                 />
                 <button 
                   onClick={() => handleSend()}
                   disabled={isLoading || !inputValue.trim()}
                   className="w-10 h-10 bg-[#3081FF] rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[#3081FF]/80 transition-colors"
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
