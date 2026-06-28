import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, ShieldCheck, Mic, MicOff, Volume2, VolumeX, Image as ImageIcon } from 'lucide-react';
import { getShoppingAdvice } from '../lib/gemini';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

// Simple typing effect component
const TypingEffect = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 15); // Adjust speed here
      return () => clearTimeout(timeout);
    } else {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

export default function ChatAssistant({ results }: { results: any[] }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; isTyping?: boolean }[]>([
    { role: 'ai', text: 'Market node active. How may I assist your sourcing today?' },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Voice Output State
  const [isMuted, setIsMuted] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!user?.isPremium) {
       navigate('/premium');
       return;
    }
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[#*`_]/g, ''); // strip markdown for speech
      const utterance = new SpeechSynthesisUtterance(cleanText);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    const userMsg = input.trim();
    if (!userMsg) return;
    
    if (!user?.isPremium) {
       navigate('/premium');
       return;
    }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsProcessing(true);

    try {
      const advice = await getShoppingAdvice(userMsg, results);
      setMessages(prev => [...prev, { role: 'ai', text: advice, isTyping: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Apologies, the market uplink is momentarily reset.", isTyping: true }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTypingComplete = (index: number) => {
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs[index]) {
        newMsgs[index].isTyping = false;
      }
      return newMsgs;
    });
    speakText(messages[index].text);
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 15 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-12 right-24 w-16 h-16 bg-[#FF3B30] rounded-full flex items-center justify-center text-white z-50 group border border-white/20 shadow-xl"
      >
        <Bot size={28} className="relative z-10 group-hover:scale-110 transition-transform" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-32 right-24 w-[450px] max-w-[calc(100vw-8rem)] h-[700px] max-h-[calc(100vh-12rem)] bg-[#0a0a0a]/90 backdrop-blur-2xl border-2 border-white/10 rounded-3xl flex flex-col z-50 overflow-hidden shadow-2xl"
          >
            <div className="p-6 bg-gradient-to-r from-black/50 to-transparent text-white flex items-center justify-between border-b border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-black tracking-widest text-[11px] uppercase text-[#FF3B30]">BuyWise Nexus</div>
                  <div className="text-[8px] text-white/50 uppercase tracking-[0.3em]">AI Shopping Assistant</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={`p-2 rounded-full border transition-colors ${!isMuted ? 'bg-[#FF3B30]/20 border-[#FF3B30] text-[#FF3B30]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                  title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                >
                  {!isMuted ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform text-white/50 hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-transparent relative custom-scrollbar">
              {!user?.isPremium && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 p-8 text-center text-white flex flex-col items-center gap-4 bg-[#111111]/90 backdrop-blur-md m-4 border border-[#FF3B30]/30 rounded-2xl z-20 shadow-[0_0_40px_rgba(255,59,48,0.2)]">
                  <ShieldCheck size={48} className="text-[#FF3B30]" />
                  <h3 className="font-black uppercase tracking-tight text-xl">Premium Node Required</h3>
                  <p className="text-xs tracking-widest text-white/50 uppercase leading-relaxed">Upgrade to unlock cognitive assistance, live comparison, and voice commands.</p>
                  <button onClick={() => navigate('/premium')} className="mt-4 bg-[#FF3B30] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-[#FF3B30] transition-all shadow-[0_0_15px_rgba(255,59,48,0.4)]">
                    Access Premium
                  </button>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 text-sm font-medium leading-relaxed rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] text-white rounded-br-none shadow-[0_5px_15px_rgba(255,59,48,0.2)]' 
                    : 'bg-[#111111] border border-[rgba(255,255,255,0.05)] text-white/90 rounded-bl-none'
                  }`}>
                    {msg.isTyping ? (
                      <div className="markdown-body prose prose-invert prose-sm max-w-none">
                        <TypingEffect text={msg.text} onComplete={() => handleTypingComplete(i)} />
                      </div>
                    ) : (
                      <div className="markdown-body prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-[#111111] text-[#FF3B30] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse border border-[rgba(255,255,255,0.05)] rounded-2xl rounded-bl-none flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full animate-ping" />
                    SYNTHESIZING...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gradient-to-t from-black to-transparent">
              <div className="flex gap-2 relative">
                {!user?.isPremium && <div className="absolute inset-0 bg-transparent z-10" onClick={() => navigate('/premium')} />}
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={user?.isPremium ? "Ask about products, compare..." : "LOCKED_"}
                    disabled={!user?.isPremium || isProcessing}
                    className="w-full bg-[#111111] border border-[rgba(255,255,255,0.1)] rounded-xl pl-10 pr-12 py-3.5 text-white text-sm focus:outline-none focus:border-[#FF3B30]/50 placeholder:text-white/30 transition-all disabled:opacity-50"
                  />
                  <label className="absolute left-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer text-white/40 hover:text-white transition-colors">
                    <ImageIcon size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      if(e.target.files && e.target.files.length > 0) {
                         const file = e.target.files[0];
                         setInput(`Find this product from image: [${file.name}]`);
                         // Simulated image upload functionality
                      }
                    }} disabled={!user?.isPremium || isProcessing} />
                  </label>
                  <button
                    onClick={toggleListening}
                    disabled={!user?.isPremium || isProcessing}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                      isListening ? 'text-[#FF3B30] bg-[#FF3B30]/10 animate-pulse' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!user?.isPremium || !input.trim() || isProcessing}
                  className="bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] text-white p-3.5 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(255,59,48,0.4)] active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:grayscale"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
