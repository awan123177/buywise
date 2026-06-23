import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Train, Hotel, Search, ArrowRightLeft, MapPin } from 'lucide-react';

export default function Travel() {
  const [mode, setMode] = useState<'flight' | 'train' | 'hotel'>('flight');
  const [date, setDate] = useState('');

  const [origin, setOrigin] = useState('');
  const [originQuery, setOriginQuery] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const [destination, setDestination] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [flights, setFlights] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string, setSuggestions: any) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/airports?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
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

  const selectSuggestion = (sug: any, type: 'origin' | 'destination') => {
    // We try to get an airport IATA code first, if not we take the suggestion id
    const code = sug.airports?.[0]?.id || sug.id;
    const displayName = sug.name;
    if (type === 'origin') {
      setOrigin(code);
      setOriginQuery(displayName);
      setShowOriginDropdown(false);
    } else {
      setDestination(code);
      setDestinationQuery(displayName);
      setShowDestinationDropdown(false);
    }
  };

  const handleSearch = async () => {
    if (mode === 'flight') {
      if (!origin || !destination || !date) {
        setError('Please fill in all fields (origin, destination, date). Use 3-letter IATA codes.');
        return;
      }
      setLoading(true);
      setError('');
      try {
         const res = await fetch(`/api/flights?departure_id=${origin.toUpperCase()}&arrival_id=${destination.toUpperCase()}&outbound_date=${date}&type=2`);
         const data = await res.json();
         if (res.ok) {
           if (data.best_flights || data.other_flights) {
               setFlights([...(data.best_flights || []), ...(data.other_flights || [])]);
           } else {
               setFlights([]);
           }
         } else {
           setError(data.error || 'Failed to fetch flights');
         }
      } catch (err) {
         console.error('Flight search error', err);
         setError('Failed to fetch flights. Please try again.');
      } finally {
         setLoading(false);
      }
    } else if (mode === 'train') {
      if (!originQuery || !destinationQuery || !date) {
        setError('Please fill in all fields for train search (origin, destination, date).');
        return;
      }
      setLoading(true);
      setError('');
      setTimeout(() => {
        setLoading(false);
        setTrains([
          {
             train_name: "Premium AI Express",
             train_number: "12951",
             departure_time: "17:00",
             arrival_time: "08:32",
             duration: "15h 32m",
             price: 2850,
             class: "3A",
          },
          {
             train_name: "Superfast Bullet",
             train_number: "22909",
             departure_time: "16:30",
             arrival_time: "09:40",
             duration: "17h 10m",
             price: 1050,
             class: "SL",
          },
          {
             train_name: "Shatabdi Connect",
             train_number: "12009",
             departure_time: "06:00",
             arrival_time: "14:20",
             duration: "8h 20m",
             price: 1450,
             class: "CC",
          }
        ]);
      }, 1000);
    }
  };

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen text-white flex flex-col gap-12 pb-20">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Travel <span className="text-[#3081FF]">Intelligence</span></h1>
        <p className="text-white/50 tracking-widest uppercase text-xs">AI-Powered Routing & Booking Arbitrage</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
         <button onClick={() => setMode('flight')} className={`px-4 md:px-6 py-3 flex items-center gap-2 font-black text-xs uppercase tracking-widest border transition-all ${mode === 'flight' ? 'bg-[#3081FF]/20 border-[#3081FF] text-[#3081FF]' : 'bg-transparent border-white/10 text-white/50 hover:border-white/30'}`}><Plane size={16}/> Flights</button>
         <button onClick={() => setMode('train')} className={`px-4 md:px-6 py-3 flex items-center gap-2 font-black text-xs uppercase tracking-widest border transition-all ${mode === 'train' ? 'bg-[#3081FF]/20 border-[#3081FF] text-[#3081FF]' : 'bg-transparent border-white/10 text-white/50 hover:border-white/30'}`}><Train size={16}/> Trains</button>
         <button onClick={() => setMode('hotel')} className={`px-4 md:px-6 py-3 flex items-center gap-2 font-black text-xs uppercase tracking-widest border transition-all ${mode === 'hotel' ? 'bg-[#3081FF]/20 border-[#3081FF] text-[#3081FF]' : 'bg-transparent border-white/10 text-white/50 hover:border-white/30'}`}><Hotel size={16}/> Hotels</button>
      </div>

      <div className="max-w-4xl mx-auto w-full terminal-card p-6 md:p-8 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row gap-4 items-center relative z-20">
           <div className="space-y-1 w-full flex-1 relative" ref={originRef}>
             <label className="text-[10px] text-white/50 uppercase tracking-widest font-black">Origin</label>
             <input 
               type="text" 
               value={originQuery} 
               onChange={(e) => {
                 setOriginQuery(e.target.value);
                 setShowOriginDropdown(true);
               }} 
               onFocus={() => setShowOriginDropdown(true)}
               className="w-full bg-black border border-white/10 p-4 text-sm font-bold focus:border-[#3081FF] outline-none" 
               placeholder="City or Airport" 
             />
             <AnimatePresence>
               {showOriginDropdown && originSuggestions.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="absolute top-full left-0 w-full bg-black border border-white/10 mt-2 max-h-60 overflow-y-auto z-[100] rounded-xl shadow-2xl"
                 >
                   {originSuggestions.map(sug => (
                     <div 
                       key={sug.id} 
                       className="p-4 border-b border-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between group"
                       onClick={() => selectSuggestion(sug, 'origin')}
                     >
                       <div className="flex flex-col gap-1">
                         <span className="font-bold text-sm text-white group-hover:text-[#3081FF] transition-colors">{sug.name}</span>
                         <span className="text-xs text-white/50">{sug.description}</span>
                       </div>
                       {sug.airports?.[0]?.id && (
                         <span className="text-xs font-black bg-white/10 px-2 py-1 rounded text-white/70">{sug.airports[0].id}</span>
                       )}
                     </div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
           <div className="hidden lg:flex w-10 h-10 mt-6 shrink-0 border items-center justify-center border-white/10 hover:border-white/30 rounded-full cursor-pointer bg-white/5">
             <ArrowRightLeft size={16} />
           </div>
           <div className="space-y-1 w-full flex-1 relative" ref={destRef}>
             <label className="text-[10px] text-white/50 uppercase tracking-widest font-black">Destination</label>
             <input 
               type="text" 
               value={destinationQuery} 
               onChange={(e) => {
                 setDestinationQuery(e.target.value);
                 setShowDestinationDropdown(true);
               }} 
               onFocus={() => setShowDestinationDropdown(true)}
               className="w-full bg-black border border-white/10 p-4 text-sm font-bold focus:border-[#3081FF] outline-none" 
               placeholder="City or Airport" 
             />
             <AnimatePresence>
               {showDestinationDropdown && destinationSuggestions.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="absolute top-full left-0 w-full bg-black border border-white/10 mt-2 max-h-60 overflow-y-auto z-[100] rounded-xl shadow-2xl"
                 >
                   {destinationSuggestions.map(sug => (
                     <div 
                       key={sug.id} 
                       className="p-4 border-b border-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between group"
                       onClick={() => selectSuggestion(sug, 'destination')}
                     >
                       <div className="flex flex-col gap-1">
                         <span className="font-bold text-sm text-white group-hover:text-[#3081FF] transition-colors">{sug.name}</span>
                         <span className="text-xs text-white/50">{sug.description}</span>
                       </div>
                       {sug.airports?.[0]?.id && (
                         <span className="text-xs font-black bg-white/10 px-2 py-1 rounded text-white/70">{sug.airports[0].id}</span>
                       )}
                     </div>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 z-10 relative">
           <div className="space-y-1">
             <label className="text-[10px] text-white/50 uppercase tracking-widest font-black">Date</label>
             <input 
               type="date" 
               value={date}
               onChange={(e) => setDate(e.target.value)}
               className="w-full bg-black border border-white/10 p-4 text-sm font-bold text-white focus:border-[#3081FF] outline-none [color-scheme:dark]" 
             />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] text-white/50 uppercase tracking-widest font-black">Travelers</label>
             <select className="w-full bg-black border border-white/10 p-[15px] text-sm font-bold focus:border-[#3081FF] outline-none appearance-none">
                <option>1 Adult</option>
                <option>2 Adults</option>
                <option>Family</option>
             </select>
           </div>
           <div className="flex items-end mt-2 md:mt-0 sm:col-span-2 md:col-span-1">
             <button onClick={handleSearch} disabled={loading} className="w-full bg-[#3081FF] hover:bg-blue-600 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] text-xs p-4 flex justify-center items-center gap-2">
                {loading ? 'Searching...' : <><Search size={16} /> Search {mode}s</>}
             </button>
           </div>
        </div>
        {error && (
          <div className="mt-4 p-4 text-sm text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-md">
            {error}
          </div>
        )}
      </div>

      {flights.length > 0 && mode === 'flight' ? (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Flight Results ({flights.length})</h3>
          {flights.map((flight: any, idx: number) => (
            <a href={`https://www.google.com/travel/flights?q=Flights%20to%20${destination}%20from%20${origin}%20on%20${date}`} target="_blank" rel="noopener noreferrer" key={idx} className="bg-white/5 border border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 hover:border-[#3081FF]/50 transition-all group block">
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <img src={flight.airline_logo} alt={flight.airline} className="w-10 h-10 object-contain bg-white rounded-full p-1 group-hover:scale-110 transition-transform" />
                 <div>
                   <div className="font-black leading-none">{flight.flights?.[0]?.airline || "Airline"}</div>
                   <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
                      {flight.flights?.[0]?.flight_number} • {flight.flights?.[0]?.airplane}
                   </div>
                 </div>
               </div>

               <div className="flex items-center gap-6 flex-1 justify-center w-full md:w-auto text-center md:text-left border-y border-white/5 md:border-0 py-4 md:py-0">
                  <div>
                    <div className="text-xl font-bold">{flight.flights?.[0]?.departure_airport?.time?.split(' ')[1] || "—"}</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-widest">{flight.flights?.[0]?.departure_airport?.id}</div>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-4 text-white/50 relative">
                     <div className="text-[10px] uppercase font-bold mb-1">{flight.total_duration} minutes</div>
                     <div className="h-[1px] w-full bg-white/20 relative group-hover:bg-[#3081FF]/50 transition-colors">
                        <Plane size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 rotate-90 group-hover:text-[#3081FF] transition-colors" />
                     </div>
                     <div className="text-[10px] uppercase mt-1 text-[#3081FF] font-bold">{flight.layovers?.length ? `${flight.layovers.length} stop(s)` : 'Non-stop'}</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{flight.flights?.[flight.flights.length - 1]?.arrival_airport?.time?.split(' ')[1] || "—"}</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-widest">{flight.flights?.[flight.flights.length - 1]?.arrival_airport?.id}</div>
                  </div>
               </div>

               <div className="w-full md:w-auto flex flex-col items-center md:items-end">
                  <div className="text-2xl font-black text-[#3081FF]">₹{flight.price}</div>
                  {flight.type && <div className="text-[10px] text-green-500 uppercase tracking-widest mt-1 font-bold">{flight.type}</div>}
                  <div className="text-[10px] text-white/30 uppercase tracking-widest mt-2 group-hover:text-white transition-colors">View Deal →</div>
               </div>
            </a>
          ))}
        </div>
      ) : trains.length > 0 && mode === 'train' ? (
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Train Results (Smart Predictions)</h3>
          {trains.map((train: any, idx: number) => (
            <div key={idx} className="bg-white/5 border border-white/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-colors">
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="w-10 h-10 flex items-center justify-center bg-[#FF3B30]/10 text-[#FF3B30] rounded-full p-2">
                    <Train size={20} />
                 </div>
                 <div>
                   <div className="font-black leading-none">{train.train_name}</div>
                   <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
                      {train.train_number} • Class {train.class}
                   </div>
                 </div>
               </div>

               <div className="flex items-center gap-6 flex-1 justify-center w-full md:w-auto text-center md:text-left border-y border-white/5 md:border-0 py-4 md:py-0">
                  <div>
                    <div className="text-xl font-bold">{train.departure_time}</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-widest">{originQuery || "Origin"}</div>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-4 text-white/50 relative">
                     <div className="text-[10px] uppercase font-bold mb-1">{train.duration}</div>
                     <div className="h-[1px] w-full bg-white/20 relative">
                        <Train size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50" />
                     </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold">{train.arrival_time}</div>
                    <div className="text-[10px] text-white/50 uppercase tracking-widest">{destinationQuery || "Dest"}</div>
                  </div>
               </div>

               <div className="w-full md:w-auto flex flex-col items-center md:items-end">
                  <div className="text-2xl font-black text-[#FF3B30]">₹{train.price}</div>
                  <div className="text-[10px] text-green-500 uppercase tracking-widest mt-1 font-bold">Predicted Available</div>
                  <button className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest transition-colors w-full md:w-auto">
                     Book via IRCTC
                  </button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-center opacity-30 pointer-events-none">
          <div className="p-8 border border-white/10">
             <div className="w-12 h-12 bg-white/5 mx-auto mb-4 flex items-center justify-center"><Plane /></div>
             <h4 className="font-black uppercase tracking-widest text-[#3081FF] mb-2">Flight Arbitrage</h4>
             <p className="text-xs">Connecting to hidden airline fare classes...</p>
          </div>
          <div className="p-8 border border-white/10">
             <div className="w-12 h-12 bg-white/5 mx-auto mb-4 flex items-center justify-center"><Train /></div>
             <h4 className="font-black uppercase tracking-widest text-[#3081FF] mb-2">Ticket Availability</h4>
             <p className="text-xs">Predicting Tatkal confirmation probabilities...</p>
          </div>
          <div className="p-8 border border-white/10">
             <div className="w-12 h-12 bg-white/5 mx-auto mb-4 flex items-center justify-center"><Hotel /></div>
             <h4 className="font-black uppercase tracking-widest text-[#3081FF] mb-2">Corporate Rates</h4>
             <p className="text-xs">Unlocking hidden block bookings...</p>
          </div>
        </div>
      )}
    </div>
  );
}
