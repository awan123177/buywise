import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plane, Calendar, Users, Search, ArrowRightLeft, Shield, MapPin, Zap, AlertCircle, Star } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function FlightSearch() {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [cabinClass, setCabinClass] = useState('Economy');
  
  const [loading, setLoading] = useState(false);
  
  const [flights, setFlights] = useState<any[]>([]);
  const [alternative, setAlternative] = useState<{route: string, message: string} | null>(null);
  const [limitedFlights, setLimitedFlights] = useState(false);

  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'lowest_price' | 'fastest' | 'best_value' | 'earliest_dep' | 'latest_dep'>('lowest_price');
  
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const handleSearch = async (overrideOrigin?: string, overrideDest?: string) => {
    const searchOrigin = overrideOrigin || origin;
    const searchDest = overrideDest || destination;
    if (!searchOrigin || !searchDest || !departDate || (tripType === 'round-trip' && !returnDate)) {
      toast.error('Please complete all required fields.');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/travel/search?origin=${searchOrigin}&destination=${searchDest}&depart_date=${departDate}&return_date=${returnDate || ''}&adults=${adults}&cabin_class=${cabinClass}&type=${tripType}`);
            if (res.ok) {
        const data = await res.json();
        setFlights(data.flights || []);
        setAlternative(data.alternative || null);
        setLimitedFlights(data.limited_flights || false);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to fetch flights.');
      }
    } catch (e) {
      toast.error('Search failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

    const handleBook = (bookingLink: string) => {
    toast.success('Redirecting to official booking partner...', { duration: 3000 });
    
    const getCode = (val: string) => val ? val.substring(0, 3).toUpperCase() : '';
    const orig = getCode(origin);
    const dest = getCode(destination);
    
    let searchPath = '';
    if (departDate) {
        const [y1, m1, d1] = departDate.split("-");
        searchPath += `${orig}${d1}${m1}${dest}`;
        
        if (tripType === 'round-trip' && returnDate) {
          const [y2, m2, d2] = returnDate.split("-");
          searchPath += `${d2}${m2}`;
        }
    }
    
    searchPath += `${adults || 1}`;
    
    // Add cabin class (Economy = default, Business = C, First = F)
    let cabinChar = '';
    if (cabinClass === 'Business') cabinChar = 'C';
    if (cabinClass === 'First') cabinChar = 'F';
    
    const targetUrl = `https://www.aviasales.com/search/${searchPath}${cabinChar}`;
    const encodedTarget = encodeURIComponent(targetUrl);
    const affiliateUrl = `https://tp.media/r?campaign_id=100&marker=744135&p=4114&trs=543965&u=${encodedTarget}`;

    setTimeout(() => {
      // Always send them directly to the searched results via affiliate link
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }, 1500);
  };

  const parseDuration = (durationStr: string) => {
    if (!durationStr) return Number.MAX_SAFE_INTEGER;
    let mins = 0;
    const hMatch = durationStr.match(/(\d+)h/);
    if (hMatch) mins += parseInt(hMatch[1]) * 60;
    const mMatch = durationStr.match(/(\d+)m/);
    if (mMatch) mins += parseInt(mMatch[1]);
    return mins > 0 ? mins : Number.MAX_SAFE_INTEGER;
  };

  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0] || '0') * 60 + parseInt(parts[1] || '0');
  };

  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case 'lowest_price': return a.price - b.price;
      case 'fastest': return parseDuration(a.duration) - parseDuration(b.duration);
      case 'best_value': 
        const scoreA = a.price + (parseDuration(a.duration) * 10);
        const scoreB = b.price + (parseDuration(b.duration) * 10);
        return scoreA - scoreB;
      case 'earliest_dep': return parseTime(a.departure_time) - parseTime(b.departure_time);
      case 'latest_dep': return parseTime(b.departure_time) - parseTime(a.departure_time);
      default: return 0;
    }
  });

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex bg-[#111] rounded-lg p-1 border border-white/10">
            <button 
              onClick={() => setTripType('one-way')} 
              className={`px-4 py-2 rounded-md text-xs font-bold tracking-widest uppercase transition-colors ${tripType === 'one-way' ? 'bg-[#FF3B30] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              One Way
            </button>
            <button 
              onClick={() => setTripType('round-trip')} 
              className={`px-4 py-2 rounded-md text-xs font-bold tracking-widest uppercase transition-colors ${tripType === 'round-trip' ? 'bg-[#FF3B30] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              Round Trip
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-[#111] rounded-lg p-1 px-4 border border-white/10 h-[40px]">
             <Users size={14} className="text-white/50" />
             <select 
               value={adults} 
               onChange={(e) => setAdults(Number(e.target.value))}
               className="bg-transparent text-sm font-bold text-white outline-none appearance-none cursor-pointer"
             >
               {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-[#111]">{n} Passenger{n > 1 ? 's' : ''}</option>)}
             </select>
          </div>
          
          <div className="flex items-center gap-2 bg-[#111] rounded-lg p-1 px-4 border border-white/10 h-[40px]">
             <Star size={14} className="text-white/50" />
             <select 
               value={cabinClass} 
               onChange={(e) => setCabinClass(e.target.value)}
               className="bg-transparent text-sm font-bold text-white outline-none appearance-none cursor-pointer"
             >
               <option value="Economy" className="bg-[#111]">Economy</option>
               <option value="Premium Economy" className="bg-[#111]">Premium Economy</option>
               <option value="Business" className="bg-[#111]">Business</option>
               <option value="First" className="bg-[#111]">First Class</option>
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_1fr] gap-4 items-center">
          {/* Origin */}
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="Origin (e.g. DEL)" 
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[#FF3B30] transition-colors uppercase placeholder:normal-case placeholder:font-normal"
            />
          </div>
          
          <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#111] border border-white/10 text-white/50 hover:text-white hover:border-[#FF3B30] cursor-pointer transition-colors" onClick={() => {
            const temp = origin;
            setOrigin(destination);
            setDestination(temp);
          }}>
            <ArrowRightLeft size={16} />
          </div>

          {/* Destination */}
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="Destination (e.g. BOM)" 
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[#FF3B30] transition-colors uppercase placeholder:normal-case placeholder:font-normal"
            />
          </div>

          {/* Depart */}
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="date" 
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[#FF3B30] transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Return */}
          <div className={`relative transition-opacity ${tripType === 'one-way' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="date" 
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[#FF3B30] transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        <button 
          onClick={() => handleSearch()}
          disabled={loading}
          className="w-full mt-6 bg-[#FF3B30] hover:bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> SEARCHING...</>
          ) : (
            <><Search size={18} /> SEARCH FLIGHTS</>
          )}
        </button>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          
          {alternative && (
            <div className="bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-xl p-4 text-white text-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <div className="text-[#FF3B30] font-black uppercase tracking-widest text-xs mb-1">Suggested Alternative</div>
                  <div className="font-bold text-lg">{alternative.route}</div>
                  <div className="text-white/70 text-xs">{alternative.message}</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  const parts = alternative.route.split(' → ');
                  if(parts.length === 2) {
                     setOrigin(parts[0]);
                     setDestination(parts[1]);
                     setTimeout(() => handleSearch(parts[0], parts[1]), 100);
                  }
                }}
                className="whitespace-nowrap px-4 py-2 bg-[#FF3B30] text-black font-black uppercase tracking-widest text-[10px] rounded hover:bg-white transition-colors"
              >
                Search Instead
              </button>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
             <div className="text-sm font-bold uppercase tracking-widest text-[#FF3B30]">{flights.length} flights found</div>
             <div className="flex flex-wrap items-center gap-2">
               <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mr-2">Sort By:</span>
               {(['lowest_price', 'fastest', 'best_value', 'earliest_dep', 'latest_dep'] as const).map(sort => (
                 <button 
                   key={sort}
                   onClick={() => setSortBy(sort)}
                   className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-colors ${
                     sortBy === sort 
                       ? 'border-[#FF3B30] bg-[#FF3B30]/10 text-[#FF3B30] shadow-[0_0_10px_rgba(255,59,48,0.2)]' 
                       : 'border-white/10 bg-[#111] hover:bg-white/5 text-white/70'
                   }`}
                 >
                   {sort.replace('_', ' ')}
                 </button>
               ))}
             </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
               <div className="w-12 h-12 border-4 border-[rgba(255,255,255,0.1)] border-t-[#FF3B30] rounded-full animate-spin mb-4" />
               <div className="text-xs font-black uppercase tracking-widest text-[#FF3B30] animate-pulse">Scanning Partner Networks...</div>
            </div>
          ) : sortedFlights.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <AlertCircle size={32} className="mx-auto text-[#FF3B30]/50 mb-4" />
              <h3 className="font-black text-xl mb-2 font-display">No Flights Found</h3>
              <p className="text-sm text-white/50">Try adjusting your dates or airports.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFlights.map((flight, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={flight.id + idx}
                  className="glass-card p-6 hover:border-[#FF3B30]/50 transition-all group relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                >
                  {sortBy === 'best_value' && idx === 0 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-[-5px_5px_15px_rgba(0,0,0,0.3)]">
                      Top Pick
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                      <div className="flex items-center sm:flex-col sm:items-start gap-4 sm:gap-2">
                         <div className="p-1.5 bg-white rounded-lg">
                           <img src={flight.airline_logo} alt={flight.airline} className="h-8 object-contain" />
                         </div>
                         <div>
                           <div className="text-sm font-black uppercase tracking-wider">{flight.airline}</div>
                           <div className="text-[10px] text-[#FF3B30] font-mono">{flight.flight_number}</div>
                         </div>
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between gap-4 w-full">
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
                            {flight.layovers === 0 ? 'NON-STOP' : `${flight.layovers} STOP${flight.layovers > 1 ? 'S' : ''}`}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-black font-display">{flight.arrival_time}</div>
                          <div className="text-xs text-white/50 font-bold uppercase tracking-widest">{flight.arrival_airport}</div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-56 flex flex-col items-end justify-center border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.05)] pt-4 md:pt-0 pl-0 md:pl-6 space-y-3">
                      <div className="text-right">
                         <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] font-mono drop-shadow-[0_0_8px_rgba(255,59,48,0.3)]">{formatPrice(flight.price)}</div>
                         {flight.original_price > flight.price && (
                           <div className="text-xs text-[#FFD700]/70 line-through font-mono mt-1 flex justify-end gap-2 items-center">
                             {formatPrice(flight.original_price)}
                             <span className="text-[#FF3B30] font-black bg-[#FF3B30]/10 px-1 rounded not-italic">
                               -{Math.round((1 - (flight.price / flight.original_price)) * 100)}%
                             </span>
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
      )}
    </div>
  );
}
