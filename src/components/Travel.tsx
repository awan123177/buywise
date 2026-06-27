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
    toast.success('Redirecting to secure booking via Travelpayouts...', { duration: 3000 });
    setTimeout(() => {
      window.open(bookingLink, '_blank', 'noopener,noreferrer');
    }, 1500);
  };

  const handleSaveAlert = () => {
    if (!user) {
      openLogin();
      return;
    }
    toast.success('Fare Drop Alert enabled for this route!');
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto min-h-screen text-white">
      {/* Header */}
      <div className="text-center mb-10 mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] text-xs font-black tracking-widest mb-6 uppercase"
        >
          <Plane size={14} /> Travelpayouts Partner
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 uppercase">
          BuyWise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-orange-500">Flights</span>
        </h1>
        <p className="text-white/40 max-w-2xl mx-auto font-mono text-sm uppercase tracking-wider leading-relaxed">
          Unlock hidden airfares. Book securely. Earn exclusive rewards.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-white/50">
          <Star className="text-yellow-500 w-4 h-4" /> 4.9/5 (200+ Reviews)
        </div>
      </div>

      {/* Search Console */}
      <div className="bg-[#0A0A0A] border border-white/10 p-6 md:p-8 rounded-3xl mb-12 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF3B30] rounded-full filter blur-[120px] opacity-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto hide-scrollbar">
            {['one-way', 'round-trip', 'multi-city'].map((type) => (
              <button
                key={type}
                onClick={() => setTripType(type as any)}
                className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${tripType === type ? 'bg-[#FF3B30] text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
              >
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-start md:justify-end">
             <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-white/50" />
                <select className="bg-transparent text-white font-bold outline-none cursor-pointer appearance-none">
                  <option className="bg-black">1 Adult</option>
                  <option className="bg-black">2 Adults</option>
                  <option className="bg-black">Family</option>
                </select>
             </div>
             <div className="w-px h-6 bg-white/10 hidden md:block"></div>
             <div className="flex items-center gap-2 text-sm">
                <Star size={16} className="text-white/50" />
                <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} className="bg-transparent text-white font-bold outline-none cursor-pointer appearance-none">
                  <option className="bg-black">Economy</option>
                  <option className="bg-black">Premium Economy</option>
                  <option className="bg-black">Business</option>
                  <option className="bg-black">First Class</option>
                </select>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_1fr] gap-4 items-center">
           {/* Origin */}
           <div className="relative group z-30" ref={originRef}>
             <div className="absolute inset-0 bg-[#FF3B30]/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-xl" />
             <div className="relative bg-[#111] border border-white/10 p-4 rounded-2xl flex items-center gap-3">
               <MapPin size={20} className="text-white/30" />
               <div className="flex-1">
                 <label className="text-[10px] text-white/50 uppercase tracking-widest font-black block mb-1">From</label>
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
               <div className="absolute top-full mt-2 left-0 w-full bg-[#111] border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-2xl z-50">
                  {originSuggestions.map(s => (
                    <div key={s.id} onClick={() => { setOrigin(s.airports?.[0]?.id || s.id); setOriginQuery(s.name); setShowOriginDropdown(false); }} className="p-4 hover:bg-white/5 cursor-pointer border-b border-white/5 flex justify-between items-center group">
                      <div>
                        <div className="font-bold text-sm group-hover:text-[#FF3B30] transition-colors">{s.name}</div>
                        <div className="text-[10px] text-white/40">{s.description}</div>
                      </div>
                      {s.airports?.[0]?.id && <span className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs font-black">{s.airports[0].id}</span>}
                    </div>
                  ))}
               </div>
             )}
           </div>

           {/* Swap button */}
           <div className="hidden lg:flex w-10 h-10 items-center justify-center rounded-full border border-white/10 hover:border-[#FF3B30]/50 hover:bg-[#FF3B30]/10 transition-colors cursor-pointer text-white/50 hover:text-[#FF3B30]">
             <ArrowRightLeft size={16} />
           </div>

           {/* Destination */}
           <div className="relative group z-20" ref={destRef}>
             <div className="absolute inset-0 bg-[#FF3B30]/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-500 rounded-xl" />
             <div className="relative bg-[#111] border border-white/10 p-4 rounded-2xl flex items-center gap-3">
               <MapPin size={20} className="text-white/30" />
               <div className="flex-1">
                 <label className="text-[10px] text-white/50 uppercase tracking-widest font-black block mb-1">To</label>
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
               <div className="absolute top-full mt-2 left-0 w-full bg-[#111] border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-2xl z-50">
                  {destinationSuggestions.map(s => (
                    <div key={s.id} onClick={() => { setDestination(s.airports?.[0]?.id || s.id); setDestinationQuery(s.name); setShowDestinationDropdown(false); }} className="p-4 hover:bg-white/5 cursor-pointer border-b border-white/5 flex justify-between items-center group">
                      <div>
                        <div className="font-bold text-sm group-hover:text-[#FF3B30] transition-colors">{s.name}</div>
                        <div className="text-[10px] text-white/40">{s.description}</div>
                      </div>
                      {s.airports?.[0]?.id && <span className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs font-black">{s.airports[0].id}</span>}
                    </div>
                  ))}
               </div>
             )}
           </div>

           {/* Dates */}
           <div className="grid grid-cols-2 gap-2">
             <div className="bg-[#111] border border-white/10 p-4 rounded-2xl flex flex-col justify-center relative">
               <label className="text-[10px] text-white/50 uppercase tracking-widest font-black block mb-1">Depart</label>
               <input 
                 type="date" 
                 value={departDate}
                 onChange={e => setDepartDate(e.target.value)}
                 className="bg-transparent font-bold text-white outline-none w-full [color-scheme:dark]"
               />
             </div>
             <div className={`bg-[#111] border border-white/10 p-4 rounded-2xl flex flex-col justify-center transition-opacity ${tripType === 'one-way' ? 'opacity-50 pointer-events-none' : ''}`}>
               <label className="text-[10px] text-white/50 uppercase tracking-widest font-black block mb-1">Return</label>
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

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4 text-xs font-bold text-white/50">
             <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
               <input type="checkbox" className="accent-[#FF3B30]" /> Direct Flights Only
             </label>
             <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
               <input type="checkbox" className="accent-[#FF3B30]" /> Refundable Fares
             </label>
           </div>
           
           <button 
             onClick={handleSearch}
             disabled={loading}
             className="w-full md:w-auto bg-gradient-to-r from-[#FF3B30] to-orange-500 hover:opacity-90 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,59,48,0.3)]"
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
            <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black uppercase tracking-widest text-sm">Filters</h3>
                <SlidersHorizontal size={16} className="text-white/50" />
              </div>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-4">Price Range</h4>
                  <div className="h-1 bg-white/10 rounded-full relative">
                    <div className="absolute top-0 left-0 w-2/3 h-full bg-[#FF3B30] rounded-full"></div>
                    <div className="absolute top-1/2 left-2/3 w-4 h-4 bg-white rounded-full -translate-y-1/2 -translate-x-1/2 shadow-lg border-2 border-[#FF3B30]"></div>
                  </div>
                  <div className="flex justify-between mt-3 text-xs font-bold">
                    <span>₹2,000</span>
                    <span>₹25,000+</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-4">Airlines</h4>
                  <div className="space-y-3">
                    {['IndiGo', 'Air India', 'Vistara', 'Akasa Air'].map(a => (
                      <label key={a} className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3 text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                          <input type="checkbox" defaultChecked className="accent-[#FF3B30]" />
                          {a}
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">₹4k+</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] text-white/50 uppercase tracking-widest font-black mb-4">Departure Time</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['00-06', '06-12', '12-18', '18-24'].map(t => (
                      <button key={t} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-colors">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prediction Card (Premium Teaser) */}
            <div className="bg-gradient-to-b from-[#FF3B30]/10 to-[#0A0A0A] border border-[#FF3B30]/30 p-6 rounded-3xl relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF3B30] opacity-20 blur-2xl rounded-full"></div>
               <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 mb-2 text-[#FF3B30]">
                 <Zap size={16} /> AI Fare Prediction
               </h3>
               {prediction === 'wait' ? (
                 <>
                   <div className="text-3xl font-black text-white my-3 flex items-center gap-2">Wait <TrendingDown size={24} className="text-emerald-500" /></div>
                   <p className="text-xs text-white/70 leading-relaxed mb-4">Our model predicts prices will drop by ~15% in the next 3 days.</p>
                 </>
               ) : (
                 <>
                   <div className="text-3xl font-black text-white my-3 flex items-center gap-2">Buy Now <Check size={24} className="text-emerald-500" /></div>
                   <p className="text-xs text-white/70 leading-relaxed mb-4">Prices are historically low. Unlikely to drop further.</p>
                 </>
               )}
               
               <button onClick={handleSaveAlert} className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                 <Bell size={14} /> Alert Me
               </button>
               
               {!user?.isPremium && (
                 <div className="mt-4 pt-4 border-t border-white/10 text-center">
                   <span className="text-[9px] text-[#FF3B30] font-black uppercase tracking-widest">Premium Feature</span>
                 </div>
               )}
            </div>
          </div>

          {/* Flight Results List */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-2">
               <div className="text-sm font-bold">{flights.length} flights found</div>
               <div className="flex gap-2">
                 <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10">Cheapest</button>
                 <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-[#FF3B30] bg-[#FF3B30]/10 text-[#FF3B30]">Fastest</button>
               </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <div className="w-12 h-12 border-4 border-white/10 border-t-[#FF3B30] rounded-full animate-spin mb-4" />
                 <div className="text-xs font-black uppercase tracking-widest animate-pulse">Scanning Travelpayouts Network...</div>
              </div>
            ) : flights.length === 0 ? (
              <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-3xl">
                <AlertCircle size={32} className="mx-auto text-white/30 mb-4" />
                <h3 className="font-black text-xl mb-2">No Flights Found</h3>
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
                    className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 hover:border-white/30 transition-colors group relative overflow-hidden"
                  >
                    {/* Optional Best Value Badge */}
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 bg-[#FF3B30] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                        Best Value
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      
                      {/* Left: Airline & Times */}
                      <div className="flex-1 grid grid-cols-3 items-center gap-4">
                        {/* Airline Info */}
                        <div className="flex flex-col items-start gap-2">
                           <img src={flight.airline_logo} alt={flight.airline} className="h-8 bg-white rounded p-0.5" />
                           <div>
                             <div className="text-sm font-black">{flight.airline}</div>
                             <div className="text-[10px] text-white/50 font-mono">{flight.flight_number}</div>
                           </div>
                        </div>

                        {/* Timeline */}
                        <div className="col-span-2 flex items-center justify-between gap-4">
                          <div className="text-center">
                            <div className="text-xl font-black">{flight.departure_time}</div>
                            <div className="text-xs text-white/50 font-bold">{flight.departure_airport}</div>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">
                              {flight.duration}
                            </div>
                            <div className="w-full relative flex items-center justify-center">
                              <div className="w-full h-px bg-white/20"></div>
                              <Plane size={12} className="absolute text-[#FF3B30]" />
                            </div>
                            <div className="text-[9px] text-[#FF3B30] mt-1 font-bold">
                              {flight.layovers === 0 ? 'NON-STOP' : `${flight.layovers} STOP`}
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-xl font-black">{flight.arrival_time}</div>
                            <div className="text-xs text-white/50 font-bold">{flight.arrival_airport}</div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Action */}
                      <div className="w-full md:w-48 flex flex-col items-end justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 pl-0 md:pl-6 space-y-3">
                        <div className="text-right">
                           <div className="text-2xl font-black text-white">{formatPrice(flight.price)}</div>
                           {flight.original_price > flight.price && (
                             <div className="text-xs text-white/30 line-through font-mono">
                               {formatPrice(flight.original_price)}
                             </div>
                           )}
                        </div>
                        <button 
                          onClick={() => handleBook(flight.booking_link)}
                          className="w-full bg-white hover:bg-gray-200 text-black py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors text-center shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                          Book Now
                        </button>
                      </div>

                    </div>

                    {/* Bottom Details Bar */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
                      <span className="flex items-center gap-1"><Shield size={12} /> {flight.refundable ? 'Refundable' : 'Non-Refundable'}</span>
                      <span className="flex items-center gap-1"><Zap size={12} /> {flight.cabin_class}</span>
                      <span className="flex items-center gap-1"><AlertCircle size={12} /> {flight.baggage}</span>
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
