import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Headset, User, Paperclip, Send, ChevronLeft, X, Bot,
  Mic, Copy, Download, Search, CheckCheck, MessageCircle, PhoneCall
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function HumanSupport() {
  const { user } = useAuth();
  
  // Ticket Identifiers & State
  const [ticketId, setTicketId] = useState<string>(() => 'TK-' + Math.floor(10000 + Math.random() * 90000));
  const [isTransferredToHuman, setIsTransferredToHuman] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [typingText, setTypingText] = useState('BuyWise Support Bot is thinking...');
  const [chatSearch, setChatSearch] = useState('');
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  // Guest Email management
  const [guestEmail, setGuestEmail] = useState('');
  useEffect(() => {
    let email = localStorage.getItem('guestSupportEmail');
    if (!email) {
      email = 'guest_' + Math.random().toString(36).substring(7) + '@buywise.app';
      localStorage.setItem('guestSupportEmail', email);
    }
    setGuestEmail(email);
  }, []);

  const getUserEmail = () => user?.email || guestEmail;

  // Initial Welcome Greeting from BuyWise Support Bot
  const [chatMessages, setChatMessages] = useState<any[]>(() => [
    {
      id: 'welcome-bot-greeting',
      sender: 'bot',
      text: `Hi 👋\nWelcome to BuyWise Human Support.\n\nI'm the **BuyWise Support Bot**.\n\nI'll first understand your issue and try to help you.\n\nIf I can't solve it, I'll instantly connect you with a human support specialist.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'seen'
    }
  ]);

  const [chatInput, setChatInput] = useState('');
  const [files, setFiles] = useState<{ name: string; url: string; size: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Auto-scroll on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isBotTyping]);

  // Recording timer simulation
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Restore existing active support ticket on mount if available
  useEffect(() => {
    const activeEmail = user?.email || guestEmail;
    if (!activeEmail) return;

    const savedTicketId = localStorage.getItem('activeSupportTicketId');
    if (savedTicketId) {
      setTicketId(savedTicketId);
      setIsTransferredToHuman(true);
    }

    const restoreActiveTicket = async () => {
      try {
        const res = await fetch('/api/support/my-tickets', {
          headers: { 'x-user-email': activeEmail }
        });
        if (res.ok) {
          const tickets = await res.json();
          if (tickets && tickets.length > 0) {
            // Find open or pending ticket, or the saved ticket
            const target = tickets.find((t: any) => t.id === savedTicketId) || tickets.find((t: any) => t.status === 'open' || t.status === 'pending') || tickets[0];
            if (target) {
              setTicketId(target.id);
              setIsTransferredToHuman(true);
              localStorage.setItem('activeSupportTicketId', target.id);
              if (Array.isArray(target.messages) && target.messages.length > 0) {
                setChatMessages(target.messages);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to restore active ticket:', err);
      }
    };

    restoreActiveTicket();
  }, [user?.email, guestEmail]);

  // Real-time synchronization with server when transferred to human
  useEffect(() => {
    if (isTransferredToHuman && ticketId) {
      const emailToUse = user?.email || guestEmail;
      const fetchTicketUpdates = async () => {
        try {
          if (!emailToUse) return;
          const res = await fetch('/api/support/my-tickets', {
            headers: { 'x-user-email': emailToUse }
          });
          if (res.ok) {
            const tickets = await res.json();
            const current = tickets.find((t: any) => t.id === ticketId);
            if (current && Array.isArray(current.messages) && current.messages.length > 0) {
              setChatMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id));
                const newMsgs = current.messages.filter((m: any) => !existingIds.has(m.id));
                if (newMsgs.length > 0) {
                  // Show toast when new agent reply arrives!
                  const hasAgentReply = newMsgs.some((m: any) => m.sender === 'agent');
                  if (hasAgentReply) {
                    toast.success('New reply from Human Support!');
                  }
                  return [...prev, ...newMsgs];
                }
                return prev;
              });
            }
          }
        } catch (err) {
          console.error('Ticket update fetch error:', err);
        }
      };

      fetchTicketUpdates();
      const interval = setInterval(fetchTicketUpdates, 3000);
      return () => clearInterval(interval);
    }
  }, [isTransferredToHuman, ticketId, user?.email, guestEmail]);

  // Function to Transfer Conversation to Human Specialist
  const handleTransferToHuman = async () => {
    if (isTransferredToHuman) return;

    setIsBotTyping(true);
    setTypingText('Connecting to BuyWise Human Support Specialist...');
    const toastId = toast.loading('Connecting to BuyWise Human Specialist...');

    try {
      const generatedId = ticketId || ('TK-' + Math.floor(10000 + Math.random() * 90000));
      setTicketId(generatedId);
      localStorage.setItem('activeSupportTicketId', generatedId);

      const lastUserMsg = [...chatMessages].reverse().find(m => m.sender === 'customer')?.text || 'Support Request';

      // Create ticket on server with COMPLETE message history
      await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: generatedId,
          name: user?.displayName || 'BuyWise Customer',
          email: getUserEmail(),
          subject: `Support Request: ${lastUserMsg.substring(0, 40)}...`,
          message: lastUserMsg,
          messages: chatMessages,
          browser: navigator.userAgent,
          device: navigator.platform,
          url: window.location.href
        })
      });

      setTimeout(() => {
        setIsBotTyping(false);
        setIsTransferredToHuman(true);
        toast.dismiss(toastId);
        toast.success(`Connected! Ticket #${generatedId} assigned to Human Specialist.`);

        setChatMessages(prev => [
          ...prev,
          {
            id: 'sys-transfer-' + Date.now(),
            sender: 'system',
            text: `🤖 Issue transferred to Human Support Desk! Ticket #${generatedId} generated with complete history.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'agent-welcome-' + Date.now(),
            sender: 'agent',
            text: `Namaste ${user?.displayName || 'there'}! I am a **BuyWise Human Support Specialist**. I have received your complete issue details and transcript above. How can I best assist you right now?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'seen'
          }
        ]);
      }, 800);
    } catch (err) {
      setIsBotTyping(false);
      setIsTransferredToHuman(true);
      toast.dismiss(toastId);
      toast.error('Connected to human support desk.');
    }
  };

  // Handle User Message Submission
  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || chatInput).trim();
    if (!userText && files.length === 0) return;

    if (!textToSend) setChatInput('');
    const currentFiles = [...files];
    setFiles([]);

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: 'customer',
      text: userText,
      replyTo: replyingTo ? replyingTo.text : null,
      attachments: currentFiles.length > 0 ? currentFiles : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };

    setReplyingTo(null);
    setChatMessages(prev => [...prev, newMsg]);

    const lower = userText.toLowerCase();

    // Check if user explicitly requested a human
    if (!isTransferredToHuman && (lower.includes('human') || lower.includes('agent') || lower.includes('person') || lower.includes('transfer') || lower.includes('talk to human') || lower.includes('speak to human'))) {
      handleTransferToHuman();
      return;
    }

    if (!isTransferredToHuman) {
      // AI Support Bot response
      setIsBotTyping(true);
      setTypingText('BuyWise Support Bot is thinking...');

      try {
        const historyPayload = chatMessages.map(m => ({
          sender: m.sender === 'customer' ? 'user' : 'bot',
          text: m.text
        }));
        historyPayload.push({ sender: 'user', text: userText });

        const res = await fetch('/api/support/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyPayload, userEmail: getUserEmail() })
        });

        const data = await res.json();

        setTimeout(() => {
          setIsBotTyping(false);
          const botReplyText = data.text || "I understand your concern. If my response doesn't completely resolve your issue, you can transfer to our human support specialist anytime!";
          
          setChatMessages(prev => [
            ...prev,
            {
              id: 'bot-reply-' + Date.now(),
              sender: 'bot',
              text: botReplyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'seen',
              showTransferOption: lower.includes('refund')  || lower.includes('not solved') || lower.includes('human') || lower.includes('transfer') || botReplyText.toLowerCase().includes('transfer') || botReplyText.toLowerCase().includes('human')
            }
          ]);
        }, 600);
      } catch (err) {
        setIsBotTyping(false);
      }
    } else {
      // Post reply to ticket when transferred to human
      try {
        await fetch(`/api/support/ticket/${ticketId}/reply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': getUserEmail()
          },
          body: JSON.stringify({ text: userText })
        });

        setChatMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'seen' } : m));
      } catch (err) {
        toast.error('Failed to send message to support desk.');
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fakeUrl = URL.createObjectURL(file);
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      setFiles(prev => [...prev, { name: file.name, url: fakeUrl, size: sizeStr }]);
      toast.success(`Attached ${file.name}`);
    }
  };

  // Send voice memo
  const sendVoiceMemo = () => {
    setIsRecording(false);
    const memoMsg = {
      id: 'msg-' + Date.now(),
      sender: 'customer',
      text: `🎤 Voice Note (${recordingTime}s)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };
    setChatMessages(prev => [...prev, memoMsg]);
    toast.success('Voice message sent');
  };

  // Download Transcript
  const downloadTranscript = () => {
    const lines = chatMessages.map(m => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`);
    const blob = new Blob([`BUYWISE SUPPORT TRANSCRIPT\nTicket ID: #${ticketId}\nStatus: ${isTransferredToHuman ? 'Human Agent Live' : 'AI Support Bot'}\nUser: ${user?.displayName || 'Customer'} (${getUserEmail()})\nDate: ${new Date().toLocaleString()}\n\n` + lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BuyWise_Support_${ticketId}.txt`;
    a.click();
    toast.success('Support transcript downloaded');
  };

  const filteredMessages = chatMessages.filter(m => 
    !chatSearch || m.text.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-[#09090B] text-white flex flex-col font-sans overflow-hidden select-none">
      
      {/* FULL SCREEN HEADER BAR */}
      <header className="h-16 px-4 sm:px-6 bg-[#121215] border-b border-white/10 flex items-center justify-between z-30 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.history.back()}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 hover:text-white transition-all flex items-center gap-1 text-xs font-bold"
            title="Back to BuyWise App"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF3B30] to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-[0_0_12px_rgba(255,59,48,0.4)]">
                <Headset size={20} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#121215] rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-white">BuyWise Support</h1>
                <span className="px-2 py-0.5 bg-[#FF3B30]/15 border border-[#FF3B30]/30 rounded-full text-[10px] font-mono text-[#FF3B30] font-bold">
                  24/7 Live
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                {isTransferredToHuman ? `Connected to Specialist • Ticket #${ticketId}` : `BuyWise Support Bot Active`}
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-2.5 text-white/40" />
            <input 
              type="text" 
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search chat..."
              className="pl-8 pr-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#FF3B30] w-32 focus:w-48 transition-all"
            />
          </div>

          <button 
            onClick={downloadTranscript}
            title="Download Transcript"
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-all text-xs flex items-center gap-1.5"
          >
            <Download size={15} />
            <span className="hidden md:inline text-xs font-semibold">Transcript</span>
          </button>

          <a 
            href="https://wa.me/917760449306" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
            title="Direct WhatsApp Desk"
          >
            <MessageCircle size={15} />
            <span className="hidden md:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      {/* CHAT MESSAGES SCROLL AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#09090B] space-y-4 no-scrollbar">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Render Messages */}
          {filteredMessages.map((msg) => {
            const isUser = msg.sender === 'customer';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center py-2 my-2">
                  <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white/80 shadow-md inline-block">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF3B30] to-orange-500 flex items-center justify-center shrink-0 text-white font-black text-xs shadow-lg mt-0.5">
                    {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {msg.replyTo && (
                    <div className="text-[10px] text-white/50 bg-white/5 border-l-2 border-[#FF3B30] px-2 py-1 rounded mb-1 max-w-full truncate">
                      Replying to: {msg.replyTo}
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser 
                      ? 'bg-gradient-to-r from-[#FF3B30] to-[#D32F2F] text-white rounded-tr-none shadow-[0_0_15px_rgba(255,59,48,0.25)]' 
                      : 'bg-[#141418] text-white/95 border border-white/10 rounded-tl-none shadow-lg'
                  }`}>
                    {msg.text}

                    {/* Attachments rendering */}
                    {msg.attachments && (
                      <div className="mt-2.5 space-y-1">
                        {msg.attachments.map((att: any, ai: number) => (
                          <div key={ai} className="p-2 bg-black/40 rounded-xl flex items-center gap-2 border border-white/10 text-xs">
                            <Paperclip size={13} className="text-[#FF3B30]" />
                            <span className="truncate max-w-[160px] font-medium">{att.name}</span>
                            <span className="text-[10px] text-white/40">{att.size}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transfer to Human Button (ONLY shown when AI suggests transfer or customer asks) */}
                  {!isTransferredToHuman && !isUser && msg.showTransferOption && (
                    <motion.button
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={() => handleTransferToHuman()}
                      className="mt-2.5 px-4 py-2.5 bg-gradient-to-r from-[#FF3B30] to-orange-500 hover:from-[#FF3B30]/90 text-white text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(255,59,48,0.4)] transition-all"
                    >
                      <PhoneCall size={14} /> Transfer to Human Support
                    </motion.button>
                  )}

                  {/* Metadata & Receipt Indicators */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-white/40">
                    <span>{msg.timestamp}</span>

                    {isUser && (
                      <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                        {msg.status === 'seen' ? (
                          <span className="flex items-center text-emerald-400 gap-1">
                            <CheckCheck size={13} className="stroke-[2.5]" /> Seen
                          </span>
                        ) : (
                          <CheckCheck size={13} className="text-white/60" />
                        )}
                      </span>
                    )}

                    {/* Action Bar on Hover */}
                    <div className="hidden group-hover:flex items-center gap-2 ml-2">
                      <button onClick={() => setReplyingTo(msg)} title="Reply" className="hover:text-white transition-colors">
                        Reply
                      </button>
                      <button onClick={() => {
                        navigator.clipboard.writeText(msg.text);
                        toast.success('Copied text');
                      }} title="Copy" className="hover:text-white transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isBotTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs text-white/60 py-2 px-1"
            >
              <div className="flex gap-1 bg-[#141418] border border-white/10 px-3 py-1.5 rounded-full items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2 font-mono text-[11px] text-white/80">{typingText}</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* FOOTER INPUT CONTROLS BAR (ALWAYS VISIBLE & ENABLED) */}
      <footer className="p-3 pb-4 sm:pb-6 bg-[#121215] border-t border-white/10 z-30 shrink-0">
        <div className="max-w-3xl mx-auto">
          
          {/* Attached Files Preview */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((f, i) => (
                <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs flex items-center gap-2">
                  <Paperclip size={13} className="text-[#FF3B30]" />
                  <span className="truncate max-w-[140px]">{f.name}</span>
                  <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-white/40 hover:text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reply-To Preview Bar */}
          {replyingTo && (
            <div className="p-2 bg-white/5 border border-white/10 rounded-xl mb-2 flex items-center justify-between text-xs text-white/80">
              <span className="truncate">Replying to: <b>{replyingTo.text}</b></span>
              <button onClick={() => setReplyingTo(null)} className="text-red-400 hover:text-red-300">
                <X size={14} />
              </button>
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} 
            className="p-2 bg-black/80 border border-white/10 rounded-2xl flex items-center gap-2 shadow-2xl focus-within:border-[#FF3B30]/60 transition-all"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all shrink-0"
              title="Attach screenshot or document"
            >
              <Paperclip size={18} />
            </button>

            <button 
              type="button"
              onClick={() => {
                if (isRecording) sendVoiceMemo();
                else setIsRecording(true);
              }}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
              title={isRecording ? 'Stop and send voice message' : 'Record voice note'}
            >
              <Mic size={18} />
            </button>

            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                isRecording 
                  ? `Recording... ${recordingTime}s (Click mic to send)` 
                  : isTransferredToHuman 
                  ? "Message BuyWise Human Support Specialist..." 
                  : "Type your message to BuyWise Support Bot..."
              }
              className="flex-1 bg-transparent px-2 py-2 text-sm text-white focus:outline-none placeholder:text-white/30"
            />

            <button 
              type="submit"
              disabled={!chatInput.trim() && files.length === 0 && !isRecording}
              className="p-3 bg-[#FF3B30] hover:bg-[#FF3B30]/90 disabled:opacity-30 disabled:hover:bg-[#FF3B30] text-white rounded-xl transition-all shadow-[0_0_15px_rgba(255,59,48,0.4)] shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
