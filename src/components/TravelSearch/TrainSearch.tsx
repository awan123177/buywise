import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Train, Calendar, Users, Search, ArrowRightLeft, Shield, MapPin, Zap, AlertCircle, Star } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

import { generateTrainBookingUrl } from './bookingUtils';


const POPULAR_STATIONS = [
  { code: 'NDLS', name: 'New Delhi' },
  { code: 'DLI', name: 'Old Delhi' },
  { code: 'NZM', name: 'Nizamuddin (Delhi)' },
  { code: 'BCT', name: 'Mumbai Central' },
  { code: 'CSMT', name: 'Mumbai CSMT' },
  { code: 'LTT', name: 'Lokmanya Tilak Terminus' },
  { code: 'HWH', name: 'Howrah (Kolkata)' },
  { code: 'SDAH', name: 'Sealdah (Kolkata)' },
  { code: 'MAS', name: 'Chennai Central' },
  { code: 'MS', name: 'Chennai Egmore' },
  { code: 'SBC', name: 'Bengaluru (KSR)' },
  { code: 'YPR', name: 'Yesvantpur (Bengaluru)' },
  { code: 'PUNE', name: 'Pune Jn' },
  { code: 'ADI', name: 'Ahmedabad Jn' },
  { code: 'CNB', name: 'Kanpur Central' },
  { code: 'LKO', name: 'Lucknow Charbagh' },
  { code: 'PNBE', name: 'Patna Jn' },
  { code: 'BSB', name: 'Varanasi Jn' },
  { code: 'BBS', name: 'Bhubaneswar' },
  { code: 'SC', name: 'Secunderabad Jn' },
  { code: 'HYB', name: 'Hyderabad Deccan' },
  { code: 'BPL', name: 'Bhopal Jn' },
  { code: 'INDB', name: 'Indore Jn' },
  { code: 'JP', name: 'Jaipur Jn' }
];

export default function TrainSearch() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [trainClass, setTrainClass] = useState('3A');
  const [quota, setQuota] = useState('GN');
  
  const [loading, setLoading] = useState(false);
  const [trains, setTrains] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'lowest_price' | 'fastest' | 'earliest_dep' | 'latest_dep'>('lowest_price');
  
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const handleSearch = async () => {
    if (!origin || !destination || !departDate) {
      toast.error('Please complete all required fields.');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/travel/trains?origin=${origin}&destination=${destination}&date=${departDate}&adults=${adults}&class=${trainClass}&quota=${quota}`);
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setTrains(data.trains || []);
      } else {
        toast.error('Failed to fetch trains.');
      }
    } catch (e) {
      toast.error('Search failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

    const handleBook = (bookingLink: string) => {
    toast.success('Redirecting to Google Search...', { duration: 3000 });
    
    setTimeout(() => {
      window.open(bookingLink || `https://www.google.com/search?q=book+train+from+${origin}+to+${destination}`, '_blank', 'noopener,noreferrer');
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

  const sortedTrains = [...trains].sort((a, b) => {
    const minPriceA = a.classes ? Math.min(...a.classes.map((c: any) => c.price || Infinity)) : Infinity;
    const minPriceB = b.classes ? Math.min(...b.classes.map((c: any) => c.price || Infinity)) : Infinity;
    
    switch (sortBy) {
      case 'lowest_price': return minPriceA - minPriceB;
      case 'fastest': return parseDuration(a.duration) - parseDuration(b.duration);
      case 'earliest_dep': return parseTime(a.departure_time) - parseTime(b.departure_time);
      case 'latest_dep': return parseTime(b.departure_time) - parseTime(a.departure_time);
      default: return 0;
    }
  });

  return (
    <div className="space-y-8">
      {/* Search Form */}
      
      <div className="glass-card p-6 md:p-8">
        <datalist id="stations-list">
          {POPULAR_STATIONS.map(s => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </datalist>

        <div className="flex flex-wrap items-center gap-4 mb-6">
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
               value={trainClass} 
               onChange={(e) => setTrainClass(e.target.value)}
               className="bg-transparent text-sm font-bold text-white outline-none appearance-none cursor-pointer"
             >
               <option value="1A" className="bg-[#111]">1A (First AC)</option>
               <option value="2A" className="bg-[#111]">2A (Second AC)</option>
               <option value="3A" className="bg-[#111]">3A (Third AC)</option>
               <option value="SL" className="bg-[#111]">SL (Sleeper)</option>
               <option value="CC" className="bg-[#111]">CC (Chair Car)</option>
             </select>
          </div>

          <div className="flex items-center gap-2 bg-[#111] rounded-lg p-1 px-4 border border-white/10 h-[40px]">
             <Shield size={14} className="text-white/50" />
             <select 
               value={quota} 
               onChange={(e) => setQuota(e.target.value)}
               className="bg-transparent text-sm font-bold text-white outline-none appearance-none cursor-pointer"
             >
               <option value="GN" className="bg-[#111]">General</option>
               <option value="TQ" className="bg-[#111]">Tatkal</option>
               <option value="PT" className="bg-[#111]">Premium Tatkal</option>
               <option value="LD" className="bg-[#111]">Ladies</option>
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr] gap-4 items-center">
          {/* Origin */}
          <div className="relative">
            <Train size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="Origin Station (e.g. NDLS or New Delhi)" 
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              list="stations-list"
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
          
          
          <div className="relative">
            <Train size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="Destination Station (e.g. BCT or Mumbai)" 
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              list="stations-list"
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[#FF3B30] transition-colors uppercase placeholder:normal-case placeholder:font-normal"
            />
          </div>


          {/* Date */}
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="date" 
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[#FF3B30] transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

        <button 
          onClick={handleSearch}
          disabled={loading}
          className="w-full mt-6 bg-[#FF3B30] hover:bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> SEARCHING...</>
          ) : (
            <><Search size={18} /> SEARCH TRAINS</>
          )}
        </button>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
             <div className="text-sm font-bold uppercase tracking-widest text-[#FF3B30]">{trains.length} trains found</div>
             <div className="flex flex-wrap items-center gap-2">
               <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mr-2">Sort By:</span>
               {(['lowest_price', 'fastest', 'earliest_dep', 'latest_dep'] as const).map(sort => (
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
               <div className="text-xs font-black uppercase tracking-widest text-[#FF3B30] animate-pulse">Checking IRCTC Availability...</div>
            </div>
          ) : sortedTrains.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <AlertCircle size={32} className="mx-auto text-[#FF3B30]/50 mb-4" />
              <h3 className="font-black text-xl mb-2 font-display">No Trains Found</h3>
              <p className="text-sm text-white/50">Try adjusting your dates or stations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTrains.map((train, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={train.id + idx}
                  className="glass-card p-6 hover:border-[#FF3B30]/50 transition-all group relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                      <div className="flex items-center sm:flex-col sm:items-start gap-4 sm:gap-2">
                         <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
                           <Train size={24} className="text-white" />
                         </div>
                         <div>
                           <div className="text-sm font-black uppercase tracking-wider">{train.train_name}</div>
                           <div className="text-[10px] text-[#FF3B30] font-mono">{train.train_number}</div>
                         </div>
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between gap-4 w-full">
                        <div className="text-center">
                          <div className="text-2xl font-black font-display">{train.departure_time}</div>
                          <div className="text-xs text-white/50 font-bold uppercase tracking-widest">{train.origin_station}</div>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">
                            {train.duration}
                          </div>
                          <div className="w-full relative flex items-center justify-center">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#FF3B30]/50 to-transparent"></div>
                            <Train size={14} className="absolute text-[#FF3B30] drop-shadow-[0_0_8px_rgba(255,59,48,0.8)]" />
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-2xl font-black font-display">{train.arrival_time}</div>
                          <div className="text-xs text-white/50 font-bold uppercase tracking-widest">{train.dest_station}</div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-56 flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-[rgba(255,255,255,0.05)] pt-4 md:pt-0 pl-0 md:pl-6 space-y-3">
                      <div className="text-left md:text-right text-[10px] font-bold text-white/50 uppercase tracking-widest">
                         Starts from
                      </div>
                      <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF3B30] font-mono drop-shadow-[0_0_8px_rgba(255,59,48,0.3)]">
                         {formatPrice(Math.min(...train.classes.map((c:any) => c.price)))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Classes List */}
                  <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-3 relative z-10">
                    <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">
                       <span className="flex items-center gap-1.5 text-[#FF3B30]"><Shield size={14} /> IRCTC Authorized</span>
                       <span className="flex items-center gap-1.5 text-[#FFD700]"><Users size={14} /> Quota: {train.quota}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                       {train.classes.map((c:any, i:number) => (
                         <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                               <span className="font-black text-lg text-white">{c.travel_class}</span>
                               <div className="flex flex-col items-end">
  <span className="font-mono font-bold text-[#FF3B30]">{c.price ? formatPrice(c.price) : 'N/A'}</span>
  {c.is_estimated && <span className="text-[8px] text-white/50 uppercase tracking-widest">(Estimated Fare)</span>}
</div>
                            </div>
                            
                            <div className="text-[10px] font-bold uppercase tracking-widest">
                               {c.availability !== "Fare unavailable for this class" ? (
                                 <span className={c.booking_status === 'AVAILABLE' ? 'text-[#34C759]' : (c.booking_status === 'RAC' ? 'text-[#FF9500]' : 'text-[#FFD700]')}>
                                    {c.availability}
                                 </span>
                               ) : (
                                 <span className="text-white/50">Fare unavailable for this class</span>
                               )}
                            </div>
                            
                            {c.price ? (
                              <button 
                                 onClick={() => handleBook(train.booking_link)}
                                 className="mt-2 w-full bg-[#FF3B30]/20 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-black py-2 rounded font-black uppercase tracking-widest text-[10px] transition-colors"
                              >
                                Book Now
                              </button>
                            ) : null}
                         </div>
                       ))}
                    </div>
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
