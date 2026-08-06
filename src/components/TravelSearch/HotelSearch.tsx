import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Hotel, Calendar, Users, Search, MapPin, Star, AlertCircle, Shield, Wifi, Coffee } from 'lucide-react';
import { useCurrency } from '../../contexts/CurrencyContext';
import toast from 'react-hot-toast';

export default function HotelSearch() {
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'lowest_price' | 'highest_rated' | 'luxury' | 'budget'>('lowest_price');
  const [minRating, setMinRating] = useState(0);
  const [mustHaveBreakfast, setMustHaveBreakfast] = useState(false);
  const [mustHaveCancellation, setMustHaveCancellation] = useState(false);
  const { formatPrice, currency } = useCurrency();

    const handleSearch = async () => {
    if (!city) {
      toast.error('Please enter a destination city');
      return;
    }
    setLoading(true);
    setSearched(true);
    
    try {
      const userCountry = 'IN';
      const userLang = navigator.language || 'en-US';
      const res = await fetch(`/api/travel/hotels?city=${encodeURIComponent(city)}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}&currency=${currency}&country=${userCountry}&language=${userLang}`);
      if (res.ok) {
        const data = await res.json();
        setHotels(data.hotels || []);
      } else {
        toast.error('Failed to fetch hotels');
      }
    } catch (e) {
      toast.error('Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

    const handleBook = (hotelName: string, bookingLink?: string) => {
    toast.success('Redirecting to booking partner...', { duration: 3000 });
    
    // Direct Klook Search for the specific hotel
    let targetUrl = `https://www.klook.com/en-IN/hotels/search/?query=${encodeURIComponent(hotelName || city)}`;
    if (checkIn && checkOut) {
       targetUrl += `&check_in=${checkIn}&check_out=${checkOut}`;
    }
    targetUrl += `&adults=${guests}&rooms=${rooms}`;
    
    const encodedTarget = encodeURIComponent(targetUrl);
    const affiliateUrl = `https://tp.media/r?campaign_id=137&marker=744135&p=4110&trs=543965&u=${encodedTarget}`;

    setTimeout(() => {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }, 1500);
  };

  

  const sortedHotels = [...hotels]
  .filter(h => h.rating >= minRating)
  .filter(h => mustHaveBreakfast ? h.breakfast_included : true)
  .filter(h => mustHaveCancellation ? h.free_cancellation : true)
  .sort((a, b) => {
    switch (sortBy) {
      case 'lowest_price':
      case 'budget':
        return a.price - b.price;
      case 'highest_rated':
        return b.rating - a.rating;
      case 'luxury':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-[#111] rounded-lg p-1 px-4 border border-white/10 h-[40px]">
             <Users size={14} className="text-white/50" />
             <select 
               value={guests} 
               onChange={(e) => setGuests(Number(e.target.value))}
               className="bg-transparent text-sm font-bold text-white outline-none appearance-none cursor-pointer"
             >
               {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-[#111]">{n} Guest{n > 1 ? 's' : ''}</option>)}
             </select>
          </div>
          <div className="flex items-center gap-2 bg-[#111] rounded-lg p-1 px-4 border border-white/10 h-[40px]">
             <Hotel size={14} className="text-white/50" />
             <select 
               value={rooms} 
               onChange={(e) => setRooms(Number(e.target.value))}
               className="bg-transparent text-sm font-bold text-white outline-none appearance-none cursor-pointer"
             >
               {[1,2,3,4].map(n => <option key={n} value={n} className="bg-[#111]">{n} Room{n > 1 ? 's' : ''}</option>)}
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4 items-center">
          <div className="relative">
            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="text" 
              placeholder="City or Hotel Name" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[#FF3B30] transition-colors"
            />
          </div>
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="date" 
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[#FF3B30] transition-colors [color-scheme:dark]"
            />
          </div>
          <div className="relative">
            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input 
              type="date" 
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-[#FF3B30] transition-colors [color-scheme:dark]"
            />
          </div>
        </div>

          <div className="flex items-center gap-2 bg-[#111] rounded-lg p-1 px-4 border border-white/10 h-[40px] overflow-x-auto whitespace-nowrap">
             <div className="flex gap-2">
               {(['lowest_price', 'highest_rated', 'luxury', 'budget'] as const).map(sort => (
                 <button 
                   key={sort}
                   onClick={() => setSortBy(sort)}
                   className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border transition-colors ${
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
          <div className="flex flex-wrap items-center gap-2 bg-[#111] rounded-lg p-2 border border-white/10 w-full mt-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
             <span className="mr-2">Filters:</span>
             <label className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
               <input type="checkbox" checked={mustHaveBreakfast} onChange={e => setMustHaveBreakfast(e.target.checked)} className="accent-[#FF3B30]" /> Breakfast
             </label>
             <label className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors ml-4">
               <input type="checkbox" checked={mustHaveCancellation} onChange={e => setMustHaveCancellation(e.target.checked)} className="accent-[#FF3B30]" /> Free Cancel
             </label>
             <div className="ml-4 flex items-center gap-2">
                Min Stars:
                <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="bg-transparent text-white outline-none cursor-pointer border-b border-white/20 pb-0.5">
                   <option value="0" className="bg-[#111]">Any</option>
                   <option value="3" className="bg-[#111]">3+ Stars</option>
                   <option value="4" className="bg-[#111]">4+ Stars</option>
                   <option value="4.5" className="bg-[#111]">4.5+ Stars</option>
                </select>
             </div>
          </div>
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="w-full mt-6 bg-[#FF3B30] hover:bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] disabled:opacity-50"
        >
          {loading ? <><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> SEARCHING...</> : <><Search size={18} /> SEARCH HOTELS</>}
        </button>
      </div>

      {searched && (
        <div className="space-y-4">
          <div className="text-sm font-bold uppercase tracking-widest text-[#FF3B30] mb-4">
             {loading ? 'Searching...' : (hotels.length > 0 ? `Top Properties Found in ${city}` : 'No hotels found for the selected destination.')}
          </div>
          {loading ? (
             <div className="space-y-4">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="glass-card overflow-hidden flex flex-col md:flex-row animate-pulse">
                   <div className="w-full md:w-64 h-48 bg-white/5" />
                   <div className="flex-1 p-6 flex flex-col justify-between">
                     <div>
                       <div className="h-6 w-3/4 bg-white/5 rounded mb-4" />
                       <div className="flex gap-2 mb-4">
                         <div className="h-4 w-16 bg-white/5 rounded" />
                         <div className="h-4 w-16 bg-white/5 rounded" />
                       </div>
                     </div>
                     <div className="flex justify-between items-end mt-4">
                       <div>
                         <div className="h-3 w-20 bg-white/5 rounded mb-2" />
                         <div className="h-6 w-24 bg-white/5 rounded" />
                       </div>
                       <div className="h-10 w-32 bg-white/5 rounded-xl" />
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          ) : sortedHotels.map((hotel, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={hotel.id}
              className="glass-card overflow-hidden hover:border-[#FF3B30]/50 transition-all group flex flex-col md:flex-row"
            >
              <div className="w-full md:w-64 h-48 md:h-auto relative">
                <img 
  src={hotel.image} 
  alt={hotel.name} 
  className="w-full h-full object-cover"
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    if (!target.dataset.retried) {
       target.dataset.retried = 'true';
       // Try an unsplash backup based on location or generic
       target.src = `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80&hash=${hotel.id}`;
    }
  }}
  loading="lazy"
/>
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 text-[#FFD700]">
                  <Star size={12} className="fill-[#FFD700]" /> {hotel.rating} <span className="text-white/50 font-normal">({hotel.reviews})</span>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black font-display mb-2">{hotel.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.map((amenity: string) => (
                      <span key={amenity} className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded text-white/70">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-end justify-between mt-4 md:mt-0 pt-4 border-t border-white/5">
                  <div>
                    <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Price per night</div>
                    <div className="text-2xl font-black text-[#FF3B30] font-mono">{formatPrice(hotel.price)}</div>
                  </div>
                  <button onClick={() => handleBook(hotel.name, hotel.booking_link)} className="bg-[#FF3B30] text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-[0_0_15px_rgba(255,59,48,0.3)]">
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
