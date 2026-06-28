import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Calendar, Users, Search, ArrowRightLeft, Shield, SlidersHorizontal, MapPin, Zap, Bell, Clock, ChevronDown, Check, TrendingDown, Star, AlertCircle, Share2, Heart, Download } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Travel() {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip' | 'multi-city'>('one-way');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('Economy');
  
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  
  const { formatPrice } = useCurrency();
  const { user, openLogin } = useAuth();
  
  // Fake fare prediction state
  const [prediction, setPrediction] = useState<'buy_now' | 'wait' | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) setShowOriginDropdown(false);
      if (destRef.current && !destRef.current.contains(e.target as Node)) setShowDestinationDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string, setSuggestions: any) => {
    if (query.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(`/api/airports?q=${encodeURIComponent(query)}`);
      if (res.ok) setSuggestions(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (showOriginDropdown) fetchSuggestions(originQuery, setOriginSuggestions);
    }, 300);
    return () => clearTimeout(timeout);
  }, [originQuery, showOriginDropdown]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (showDestinationDropdown) fetchSuggestions(destinationQuery, setDestinationSuggestions);
    }, 300);
    return () => clearTimeout(timeout);
  }, [destinationQuery, showDestinationDropdown]);

  const handleSearch = async () => {
    if (!origin || !destination || !departDate || (tripType === 'round-trip' && !returnDate)) {
      toast.error('Please complete all required fields.');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/travelpayouts/search?origin=${origin}&destination=${destination}&depart_date=${departDate}&return_date=${returnDate || ''}&adults=${adults}&cabin_class=${cabinClass}&type=${tripType}`);
      if (res.ok) {
        const data = await res.json();
        setFlights(data.flights || []);
        
        // Randomize prediction
        setPrediction(Math.random() > 0.5 ? 'buy_now' : 'wait');
      } else {
        toast.error('Failed to fetch flights.');
      }
    } catch (e) {
      toast.error('Search failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (bookingLink: string) => {
    toast.success('Redirecting to secure booking...', { duration: 3000 });
    setTimeout(() => {
      window.open('https://kiwi.tpo.lu/bybnqDEf', '_blank', 'noopener,noreferrer');
    }, 1500);
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto min-h-screen text-white relative z-10">
      {/* Header */}
      <div className="text-center mb-10 mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-xs font-black tracking-widest mb-6 uppercase shadow-[0_0_15px_rgba(255,59,48,0.2)]"
        >
          <Plane size={14} /> Travelpayouts Partner
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 uppercase font-display">
          BuyWise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] drop-shadow-[0_0_15px_rgba(255,59,48,0.4)]">Flights</span>
        </h1>
        <p className="text-white/50 max-w-2xl mx-auto font-mono text-sm uppercase tracking-wider leading-relaxed">
          Unlock hidden airfares. Book securely. Earn exclusive rewards.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-[#FFD700]">
          <Star className="text-[#FFD700] w-4 h-4 fill-[#FFD700]" /> 4.9/5 (200+ Reviews)
        </div>
      </div>

      {/* Search Console */}
      <div className="glass-card p-6 md:p-8 mb-12 relative overflow-visible">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-[#FF3B30]/10 to-[#FF3B30]/10 rounded-[inherit] filter blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center justify-between mb-8 border-b border-[rgba(255,255,255,0.08)] pb-6">
          <div className="flex bg-[#0a0a0a] p-1.5 rounded-xl border border-[rgba(255,255,255,0.08)] w-full md:w-auto overflow-x-auto hide-scrollbar shadow-inner">
            {['one-way', 'round-trip', 'multi-city'].map((type) => (
              <button
                key={type}
                onClick={() => setTripType(type as any)}
                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${tripType === type ? 'bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.4)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start md:justify-end">
             <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-[#FF3B30]" />
                <select className="bg-transparent text-white font-bold outline-none cursor-pointer appearance-none uppercase tracking-widest text-xs">
                  <option className="bg-[#111111]">1 Adult</option>
                  <option className="bg-[#111111]">2 Adults</option>
                  <option className="bg-[#111111]">Family</option>
                </select>
             </div>
             <div className="w-px h-6 bg-[rgba(255,255,255,0.1)] hidden md:block"></div>
             <div className="flex items-center gap-2 text-sm">
                <Star size={16} className="text-[#FFD700]" />
                <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} className="bg-transparent text-white font-bold outline-none cursor-pointer appearance-none uppercase tracking-widest text-xs">
                  <option className="bg-[#111111]">Economy</option>
                  <option className="bg-[#111111]">Premium Economy</option>
                  <option className="bg-[#111111]">Business</option>
                  <option className="bg-[#111111]">First Class</option>
                </select>
             </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_1fr] gap-4 items-center">
           {/* Origin */}
           <div className="relative group z-30" ref={originRef}>
             <div className="absolute inset-0 bg-[#FF3B30]/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-xl" />
             <div className="relative bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] hover:border-[#FF3B30]/50 p-4 rounded-2xl flex items-center gap-3 transition-colors">
               <MapPin size={20} className="text-[#FF3B30]" />
               <div className="flex-1">
                 <label className="text-[10px] text-[#FF3B30]/70 uppercase tracking-widest font-black block mb-1">From</label>
                 <input 
                   type="text"
                   value={originQuery}
                   onChange={e => { setOriginQuery(e.target.value); setShowOriginDropdown(true); }}
                   onFocus={() => setShowOriginDropdown(true)}
                   className="bg-transparent w-full font-bold text-white outline-none placeholder:text-white/20"
                   placeholder="City or Airport"
                 />
               </div>
             </div>
             {showOriginDropdown && originSuggestions.length > 0 && (
               <div className="absolute top-full mt-2 left-0 w-full bg-[#111111] border border-[#FF3B30]/30 rounded-xl max-h-60 overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50">
                  {originSuggestions.map(s => (
                    <div key={s.id} onClick={() => { setOrigin(s.airports?.[0]?.id || s.id); setOriginQuery(s.name); setShowOriginDropdown(false); }} className="p-4 hover:bg-[#FF3B30]/10 cursor-pointer border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center group">
                      <div>
                        <div className="font-bold text-sm group-hover:text-[#FF3B30] transition-colors">{s.name}</div>
                        <div className="text-[10px] text-white/40">{s.description}</div>
                      </div>
                      {s.airports?.[0]?.id && <span className="bg-[#FF3B30]/20 text-[#FF3B30] px-2 py-1 rounded text-xs font-black">{s.airports[0].id}</span>}
                    </div>
                  ))}
               </div>
             )}
           </div>

           {/* Swap button */}
           <div className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] hover:border-[#FF3B30]/50 hover:bg-[#FF3B30]/10 transition-colors cursor-pointer text-white/50 hover:text-[#FF3B30]">
             <ArrowRightLeft size={16} />
           </div>

           {/* Destination */}
           <div className="relative group z-20" ref={destRef}>
             <div className="absolute inset-0 bg-[#FF3B30]/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-xl" />
             <div className="relative bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] hover:border-[#FF3B30]/50 p-4 rounded-2xl flex items-center gap-3 transition-colors">
               <MapPin size={20} className="text-[#FF3B30]" />
               <div className="flex-1">
                 <label className="text-[10px] text-[#FF3B30]/70 uppercase tracking-widest font-black block mb-1">To</label>
                 <input 
                   type="text"
                   value={destinationQuery}
                   onChange={e => { setDestinationQuery(e.target.value); setShowDestinationDropdown(true); }}
                   onFocus={() => setShowDestinationDropdown(true)}
                   className="bg-transparent w-full font-bold text-white outline-none placeholder:text-white/20"
                   placeholder="City or Airport"
                 />
               </div>
             </div>
             {showDestinationDropdown && destinationSuggestions.length > 0 && (
               <div className="absolute top-full mt-2 left-0 w-full bg-[#111111] border border-[#FF3B30]/30 rounded-xl max-h-60 overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50">
                  {destinationSuggestions.map(s => (
                    <div key={s.id} onClick={() => { setDestination(s.airports?.[0]?.id || s.id); setDestinationQuery(s.name); setShowDestinationDropdown(false); }} className="p-4 hover:bg-[#FF3B30]/10 cursor-pointer border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center group">
                      <div>
                        <div className="font-bold text-sm group-hover:text-[#FF3B30] transition-colors">{s.name}</div>
                        <div className="text-[10px] text-white/40">{s.description}</div>
                      </div>
                      {s.airports?.[0]?.id && <span className="bg-[#FF3B30]/20 text-[#FF3B30] px-2 py-1 rounded text-xs font-black">{s.airports[0].id}</span>}
                    </div>
                  ))}
               </div>
             )}
           </div>

           {/* Dates */}
           <div className="grid grid-cols-2 gap-2 relative z-10">
             <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] hover:border-[#FFD700]/50 p-4 rounded-2xl flex flex-col justify-center relative transition-colors">
               <label className="text-[10px] text-[#FFD700]/70 uppercase tracking-widest font-black block mb-1">Depart</label>
               <input 
                 type="date" 
                 value={departDate}
                 onChange={e => setDepartDate(e.target.value)}
                 className="bg-transparent font-bold text-white outline-none w-full [color-scheme:dark]"
               />
             </div>
             <div className={`bg-[#0a0a0a] border border-[rgba(255,255,255,0.1)] hover:border-[#FFD700]/50 p-4 rounded-2xl flex flex-col justify-center transition-all ${tripType === 'one-way' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
               <label className="text-[10px] text-[#FFD700]/70 uppercase tracking-widest font-black block mb-1">Return</label>
               <input 
                 type="date" 
                 value={returnDate}
                 onChange={e => setReturnDate(e.target.value)}
                 className="bg-transparent font-bold text-white outline-none w-full [color-scheme:dark]"
                 disabled={tripType === 'one-way'}
               />
             </div>
           </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4 text-xs font-bold text-white/50">
             <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
               <input type="checkbox" className="accent-[#FF3B30] w-4 h-4 rounded" /> Direct Flights Only
             </label>
             <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
               <input type="checkbox" className="accent-[#FF3B30] w-4 h-4 rounded" /> Refundable Fares
             </label>
           </div>
           
           <button 
             onClick={handleSearch}
             disabled={loading}
             className="w-full md:w-auto bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] hover:opacity-90 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,59,48,0.3)] hover:shadow-[0_0_60px_rgba(255,59,48,0.5)] hover:-translate-y-1"
           >
             {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={18} />}
             Search Flights
           </button>
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black uppercase tracking-widest text-sm text-[#FF3B30]">Filters</h3>
                <SlidersHorizontal size={16} className="text-[#FF3B30]" />
              </div>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] text-[#FF3B30]/70 uppercase tracking-widest font-black mb-4">Price Range</h4>
                  <div className="h-1.5 bg-[#0a0a0a] rounded-full relative overflow-hidden border border-[rgba(255,255,255,0.05)]">
                    <div className="absolute top-0 left-0 w-2/3 h-full bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] rounded-full"></div>
                    <div className="absolute top-1/2 left-2/3 w-4 h-4 bg-white rounded-full -translate-y-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(255,59,48,0.8)] border-2 border-[#FF3B30]"></div>
                  </div>
                  <div className="flex justify-between mt-3 text-xs font-bold font-mono">
                    <span>₹2,000</span>
                    <span>₹25,000+</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] text-[#FF3B30]/70 uppercase tracking-widest font-black mb-4">Airlines</h4>
                  <div className="space-y-3">
                    {['IndiGo', 'Air India', 'Vistara', 'Akasa Air'].map(a => (
                      <label key={a} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3 text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                          <input type="checkbox" defaultChecked className="accent-[#FF3B30] w-4 h-4 rounded" />
                          {a}
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">₹4k+</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] text-[#FF3B30]/70 uppercase tracking-widest font-black mb-4">Departure Time</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['00-06', '06-12', '12-18', '18-24'].map(t => (
                      <button key={t} className="bg-[#0a0a0a] hover:bg-[#FF3B30]/20 border border-[rgba(255,255,255,0.05)] hover:border-[#FF3B30] rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-colors text-white/70 hover:text-[#FF3B30]">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prediction Card (Premium Teaser) */}
            <div className="bg-gradient-to-b from-[#FFD700]/10 to-[#111111] border border-[#FFD700]/30 p-6 rounded-3xl relative overflow-hidden shadow-[0_10px_30px_rgba(255,215,0,0.1)]">
               <div className="absolute -right-4 -top-4 w-32 h-32 bg-[#FFD700] opacity-20 blur-3xl rounded-full"></div>
               <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 mb-2 text-[#FFD700]">
                 <Zap size={16} className="fill-[#FFD700]" /> AI Fare Prediction
               </h3>
               {prediction === 'wait' ? (
                 <>
                   <div className="text-3xl font-black text-white my-3 flex items-center gap-2 font-display">Wait <TrendingDown size={24} className="text-[#FF3B30]" /></div>
                   <p className="text-xs text-white/70 leading-relaxed mb-4">Our model predicts prices will drop by ~15% in the next 3 days.</p>
                 </>
               ) : (
                 <>
                   <div className="text-3xl font-black text-white my-3 flex items-center gap-2 font-display">Buy Now <Check size={24} className="text-[#FF3B30]" /></div>
                   <p className="text-xs text-white/70 leading-relaxed mb-4">Prices are historically low. Unlikely to drop further.</p>
                 </>
               )}
               
               {!user?.isPremium && (
                 <div className="mt-4 pt-4 border-t border-[rgba(255,215,0,0.2)] text-center">
                   <span className="text-[9px] text-[#FFD700] font-black uppercase tracking-widest bg-[#FFD700]/10 px-2 py-1 rounded">Premium Feature</span>
                 </div>
               )}
            </div>
          </div>

          {/* Flight Results List */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-2">
               <div className="text-sm font-bold uppercase tracking-widest text-[#FF3B30]">{flights.length} flights found</div>
               <div className="flex gap-2">
                 <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#111111] hover:bg-[#111111]/80 transition-colors">Cheapest</button>
                 <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#FF3B30] bg-[#FF3B30]/10 text-[#FF3B30] shadow-[0_0_10px_rgba(255,59,48,0.2)]">Fastest</button>
               </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <div className="w-12 h-12 border-4 border-[rgba(255,255,255,0.1)] border-t-[#FF3B30] rounded-full animate-spin mb-4" />
                 <div className="text-xs font-black uppercase tracking-widest text-[#FF3B30] animate-pulse">Scanning Travelpayouts Network...</div>
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-20 glass-card">
                <AlertCircle size={32} className="mx-auto text-[#FF3B30]/50 mb-4" />
                <h3 className="font-black text-xl mb-2 font-display">No Flights Found</h3>
                <p className="text-sm text-white/50">Try adjusting your dates or airports.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flights.map((flight, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={flight.id}
                    className="glass-card p-6 hover:border-[#FF3B30]/50 transition-all group relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                  >
                    {/* Optional Best Value Badge */}
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-[-5px_5px_15px_rgba(0,0,0,0.3)]">
                        Best Value
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                      
                      {/* Left: Airline & Times */}
                      <div className="flex-1 grid grid-cols-3 items-center gap-4">
                        {/* Airline Info */}
                        <div className="flex flex-col items-start gap-2">
                           <div className="p-1.5 bg-white rounded-lg">
                             <img src={flight.airline_logo} alt={flight.airline} className="h-8 object-contain" />
                           </div>
                           <div>
                             <div className="text-sm font-black uppercase tracking-wider">{flight.airline}</div>
                             <div className="text-[10px] text-[#FF3B30] font-mono">{flight.flight_number}</div>
                           </div>
                        </div>

                        {/* Timeline */}
                        <div className="col-span-2 flex items-center justify-between gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-black font-display">{flight.departure_time}</div>
                            <div className="text-xs text-white/50 font-bold uppercase tracking-widest">{flight.departure_airport}</div>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">
                              {flight.duration}
                            </div>
                            <div className="w-full relative flex items-center justify-center">
                              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FF3B30]/50 to-transparent"></div>
                              <Plane size={14} className="absolute text-[#FF3B30] drop-shadow-[0_0_8px_rgba(255,59,48,0.8)]" />
                            </div>
                            <div className="text-[9px] text-[#FFD700] mt-1 font-bold tracking-widest uppercase">
                              {flight.layovers === 0 ? 'NON-STOP' : `${flight.layovers} STOP`}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-black font-display">{flight.arrival_time}</div>
                            <div className="text-xs text-white/50 font-bold uppercase tracking-widest">{flight.arrival_airport}</div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Action */}
                      <div className="w-full md:w-56 flex flex-col items-end justify-center border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.05)] pt-4 md:pt-0 pl-0 md:pl-6 space-y-3">
                        <div className="text-right">
                           <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] font-mono drop-shadow-[0_0_8px_rgba(255,59,48,0.3)]">{formatPrice(flight.price)}</div>
                           {flight.original_price > flight.price && (
                             <div className="text-xs text-[#FFD700]/70 line-through font-mono mt-1">
                               {formatPrice(flight.original_price)}
                             </div>
                           )}
                        </div>
                        <button 
                          onClick={() => handleBook(flight.booking_link)}
                          className="w-full bg-[#FF3B30] hover:bg-white text-black py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all text-center shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)]"
                        >
                          Book Now
                        </button>
                      </div>

                    </div>

                    {/* Bottom Details Bar */}
                    <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-white/50 relative z-10">
                      <span className="flex items-center gap-1.5 text-[#FF3B30]"><Shield size={14} /> {flight.refundable ? 'Refundable' : 'Non-Refundable'}</span>
                      <span className="flex items-center gap-1.5 text-[#FF3B30]"><Zap size={14} /> {flight.cabin_class}</span>
                      <span className="flex items-center gap-1.5 text-[#FFD700]"><AlertCircle size={14} /> {flight.baggage}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
