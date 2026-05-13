import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';
import { getShoppingAdvice } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';

export default function ChatAssistant({ results }: { results: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Market node active. How may I assist your sourcing today?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const advice = await getShoppingAdvice(userMsg, results);
      setMessages(prev => [...prev, { role: 'ai', text: advice }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Apologies, the market uplink is momentarily reset." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 15 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-12 right-24 w-16 h-16 bg-[#cc0000] rounded-full flex items-center justify-center text-white z-50 group border border-white/20"
      >
        <Bot size={28} className="relative z-10 group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-32 right-24 w-[450px] max-w-[calc(100vw-8rem)] h-[700px] max-h-[calc(100vh-12rem)] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 bg-white/5 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#cc0000]" />
                <span className="font-black tracking-widest text-[10px] uppercase">COGNITIVE_TERMINAL_0.1</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 bg-transparent">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] p-5 text-sm font-medium leading-relaxed border border-white/10 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-[#cc0000] text-white' 
                    : 'bg-white/10 text-white backdrop-blur-md'
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest animate-pulse border border-white/10 rounded-full backdrop-blur-md">
                    UPLINKING...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white/5 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="QUERY_SYSTEM_"
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-sm font-black focus:outline-none focus:bg-white/10 placeholder:text-white/30 uppercase tracking-tighter"
                />
                <button
                  onClick={handleSend}
                  className="bg-white/10 text-white p-4 rounded-xl border border-white/10 transition-all hover:bg-[#cc0000] hover:text-white active:scale-95 flex items-center justify-center"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
