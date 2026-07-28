import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MessageSquare, CheckCircle2, Clock, Trash2, Send, Archive, User, AlertCircle, RefreshCw, X, MoreVertical, Paperclip, ChevronDown, CheckCheck, Star, ShieldCheck, Download, History, Tag, Keyboard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSupportDashboard({ email, passcode, defaultFilter = "open" }: { email: string, passcode: string, defaultFilter?: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(defaultFilter);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/support/tickets', {
        headers: {
          'x-user-email': email,
          'x-admin-passcode': passcode
        }
      });
      if (!res.ok) throw new Error('Failed to fetch support tickets');
      const data = await res.json();
      
      // Inject some mock premium/priority data for demonstration of UI since backend might not have it yet
      const enrichedData = data.map((t: any) => ({
        ...t,
        isPremiumUser: (t.subject || '').toLowerCase().includes('premium') || Math.random() > 0.8,
        priority: (t.subject || '').toLowerCase().includes('urgent') ? 'high' : 'normal',
        isOnline: Math.random() > 0.5
      }));
      
      setTickets(enrichedData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      
      if (selectedTicket) {
        const updated = enrichedData.find((t: any) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (e) {
      toast.error('Could not load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated && JSON.stringify(updated.messages) !== JSON.stringify(selectedTicket.messages)) {
        setSelectedTicket(updated);
      }
    }
  }, [tickets]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 3000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.messages]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email,
          'x-admin-passcode': passcode
        },
        body: JSON.stringify({ text: replyText })
      });
      if (!res.ok) throw new Error('Failed to send reply');
      
      toast.success('Reply sent successfully');
      setReplyText('');
      await fetchTickets();
    } catch (e) {
      toast.error('Failed to send reply');
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/support/tickets/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email,
          'x-admin-passcode': passcode
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Ticket marked as ${newStatus}`);
      await fetchTickets();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = false;
    switch(filter) {
      case 'open': matchesFilter = t.status === 'open'; break;
      case 'pending': matchesFilter = t.status === 'pending'; break;
      case 'resolved': matchesFilter = t.status === 'resolved'; break;
      case 'high_priority': matchesFilter = t.priority === 'high'; break;
      case 'premium_users': matchesFilter = t.isPremiumUser; break;
      case 'livechat': matchesFilter = t.subject === 'Live Chat Support Request'; break;
      default: matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-[calc(100vh-140px)] bg-black border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl font-sans text-white">
      
      {/* Left Sidebar - Conversation List */}
      <div className="w-[380px] bg-[#0A0A0A] border-r border-white/5 flex flex-col z-10 shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <h2 className="text-xl font-black mb-4 flex items-center justify-between">
            <span>Inbox <span className="text-[#FF7A00] bg-[#FF7A00]/10 px-2 py-0.5 rounded-full text-sm">{tickets.filter(t => t.status === 'open').length}</span></span>
            <button onClick={fetchTickets} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#FF7A00] focus:bg-white/10 transition-all shadow-inner"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'open', label: 'Open' },
              { id: 'pending', label: 'Pending' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'high_priority', label: 'High Priority', icon: AlertCircle },
              { id: 'premium_users', label: 'Premium Users', icon: ShieldCheck },
              { id: 'livechat', label: 'Live Chats', icon: MessageSquare }
            ].map(f => (
              <button 
                key={f.id} 
                onClick={() => setFilter(f.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${filter === f.id ? 'bg-[#FF7A00] text-white shadow-[0_0_15px_rgba(255,122,0,0.3)]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80'}`}
              >
                {f.icon && <f.icon size={12} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/40 gap-3">
              <RefreshCw className="animate-spin" size={24} />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-white/30 gap-3 text-center px-4">
              <CheckCircle2 size={32} className="opacity-50" />
              <p className="text-sm font-medium">Inbox zero! No conversations match this view.</p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 rounded-2xl transition-all relative overflow-hidden group ${selectedTicket?.id === ticket.id ? 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-lg' : 'bg-transparent border border-transparent hover:bg-white/5 hover:border-white/5'}`}
              >
                {selectedTicket?.id === ticket.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF7A00] shadow-[0_0_10px_#FF7A00]" />
                )}
                
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold shadow-inner">
                        {ticket.name.charAt(0).toUpperCase()}
                      </div>
                      {ticket.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#0A0A0A] rounded-full" />
                      )}
                    </div>
                    <span className="font-bold text-white text-sm truncate">{ticket.name}</span>
                    {ticket.isPremiumUser && <ShieldCheck size={14} className="text-[#FF7A00] shrink-0" />}
                  </div>
                  <span className="text-[10px] font-medium text-white/40 whitespace-nowrap shrink-0 mt-1">
                    {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                
                <div className="text-xs text-white/80 font-medium truncate mb-1.5 pl-2 pr-6">
                  {ticket.subject}
                </div>
                
                <div className="text-xs text-white/40 truncate mb-3 pl-2 pr-4 font-light">
                  {ticket.messages?.[ticket.messages.length - 1]?.text || ticket.message}
                </div>
                
                <div className="flex items-center justify-between pl-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                    ticket.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' ? 'bg-blue-400' : ticket.status === 'pending' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    {ticket.status}
                  </span>
                  
                  {ticket.priority === 'high' && (
                    <span className="text-[#FF3B30] flex items-center gap-1 text-[10px] font-bold uppercase">
                      <AlertCircle size={12} /> High Priority
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Area - Conversation */}
      <div className="flex-1 flex flex-col bg-[#111111] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
        
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-[#161616]/80 backdrop-blur-xl flex justify-between items-start z-10 shadow-md">
              <div className="flex gap-4">
                <div className="relative mt-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-lg font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {selectedTicket.name.charAt(0).toUpperCase()}
                  </div>
                  {selectedTicket.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#161616] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-black text-white">{selectedTicket.name}</h3>
                    {selectedTicket.isPremiumUser && (
                      <span className="flex items-center gap-1 bg-gradient-to-r from-[#FF7A00] to-yellow-500 px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-lg">
                        <Star size={10} className="fill-white" /> Premium Customer
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                    <span className="flex items-center gap-1.5"><User size={12}/> {selectedTicket.email}</span>
                    {selectedTicket.phone && <span className="flex items-center gap-1.5 text-white/70">📱 {selectedTicket.phone}</span>}
                    <span className="flex items-center gap-1.5"><Clock size={12}/> {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-white/40 uppercase tracking-wider font-bold">
                    <span className="bg-white/5 px-2 py-1 rounded-md border border-white/10">ID: {selectedTicket.id}</span>
                    <span className="flex items-center gap-1"><History size={12}/> {selectedTicket.device} / {selectedTicket.browser?.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <div className="flex gap-2">
                  <button onClick={() => handleUpdateStatus(selectedTicket.id, 'open')} className={`flex items-center gap-2 px-4 py-2 ${selectedTicket.status === 'open' ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60'} border border-transparent rounded-xl hover:bg-blue-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider shadow-sm`}>
                    Open
                  </button>
                  <button onClick={() => handleUpdateStatus(selectedTicket.id, 'pending')} className={`flex items-center gap-2 px-4 py-2 ${selectedTicket.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white/5 text-white/60'} border border-transparent rounded-xl hover:bg-yellow-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider shadow-sm`}>
                    Pending
                  </button>
                  <button onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')} className={`flex items-center gap-2 px-4 py-2 ${selectedTicket.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-white/5 text-white/60'} border border-transparent rounded-xl hover:bg-green-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider shadow-sm`}>
                    <CheckCircle2 size={16} /> Resolved
                  </button>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <span className="bg-[#FF3B30]/10 text-[#FF3B30] px-2 py-1 rounded text-[10px] font-bold uppercase border border-[#FF3B30]/20 flex items-center gap-1">
                    <Tag size={10} /> {selectedTicket.subject}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 z-10 no-scrollbar">
              
              {/* Timeline marker for ticket creation */}
              <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <div className="h-px w-12 bg-white/10" />
                Ticket created via Contact Form
                <div className="h-px w-12 bg-white/10" />
              </div>

              {selectedTicket.messages?.map((msg: any, i: number) => {
                const isAgent = msg.sender === 'agent';
                const isLast = i === selectedTicket.messages.length - 1;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    key={i} 
                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 px-1 opacity-60">
                      <span className="text-[11px] font-bold tracking-wide">{isAgent ? 'You' : selectedTicket.name}</span>
                      <span className="text-[10px]">•</span>
                      <span className="text-[10px]">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    
                    <div className={`max-w-[75%] rounded-3xl px-6 py-4 shadow-xl ${
                      isAgent 
                        ? 'bg-gradient-to-br from-[#FF7A00] to-[#E66E00] text-white rounded-tr-sm' 
                        : 'bg-[#1C1C1C] border border-white/5 text-white/90 rounded-tl-sm'
                    }`}>
                      <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                    </div>
                    
                    {/* Read receipt indicator for agent messages */}
                    {isAgent && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-[#FF7A00]/80 px-2">
                        <span>Read</span> <CheckCheck size={12} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {/* Mock typing indicator */}
              {selectedTicket.isOnline && !isReplying && (
                <div className="flex flex-col items-start opacity-50">
                  <div className="text-[10px] mb-1 ml-2">{selectedTicket.name} is typing...</div>
                  <div className="bg-[#1C1C1C] rounded-full px-4 py-3 flex gap-1 items-center">
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Area */}
            <div className="p-4 border-t border-white/5 bg-[#161616]/80 backdrop-blur-xl z-10">
              <form onSubmit={handleReply} className="bg-black/50 border border-white/10 rounded-3xl overflow-hidden focus-within:border-[#FF7A00]/50 focus-within:ring-1 focus-within:ring-[#FF7A00]/50 transition-all shadow-inner">
                <textarea 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply... (Press Enter to send, Shift+Enter for new line)"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(e);
                    }
                  }}
                  rows={3}
                  className="w-full bg-transparent px-6 py-4 text-[15px] text-white focus:outline-none resize-none placeholder-white/30"
                />
                
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-t border-white/5">
                  <div className="flex gap-2">
                    <button type="button" className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Attach file">
                      <Paperclip size={18} />
                    </button>
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors text-xs font-bold uppercase tracking-wider" title="Saved Replies">
                      <Archive size={14} /> Saved Replies
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest hidden sm:flex items-center gap-1">
                      <Keyboard size={12} /> Enter to send
                    </span>
                    <button 
                      type="submit" 
                      disabled={isReplying || !replyText.trim()}
                      className="px-6 py-2 bg-[#FF7A00] text-white font-bold rounded-full hover:bg-[#E66E00] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,122,0,0.3)] hover:shadow-[0_0_30px_rgba(255,122,0,0.5)] flex items-center justify-center gap-2 group"
                    >
                      {isReplying ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <>
                          Send <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center z-10 p-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full" />
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10 shadow-2xl">
                <MessageSquare size={40} className="text-white/50" />
              </div>
            </div>
            <h2 className="text-3xl font-black mb-3">BuyWise Human Support</h2>
            <p className="text-lg text-white/40 max-w-md font-light">
              Select a conversation from the left to view customer details, conversation history, and send replies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
