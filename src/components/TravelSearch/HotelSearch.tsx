import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Hotel, Calendar, Users, Search, MapPin, Star, AlertCircle, Wifi, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';

import { generateHotelBookingUrl } from './bookingUtils';

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
  
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating');
  const [minRating, setMinRating] = useState(0);
  const [hotelType, setHotelType] = useState<'any' | 'budget' | 'luxury' | 'business' | 'family'>('any');
  const [mustHaveBreakfast, setMustHaveBreakfast] = useState(false);
  const [mustHaveCancellation, setMustHaveCancellation] = useState(false);
  const [apiError, setApiError] = useState(false);

  const handleSearch = async () => {
    if (!city) {
      toast.error('Please enter a destination city');
      return;
    }
    setSearched(true);
    setLoading(true);
    setApiError(false);

    try {
      const params = new URLSearchParams({
        city,
        checkIn,
        checkOut,
        guests: guests.toString(),
        rooms: rooms.toString()
      });

      const response = await fetch(`/api/travel/hotels?${params.toString()}`);
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) {
        throw new Error('Failed to fetch hotels');
      }
      
      const data = await response.json();
      setHotels(data.hotels || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to search hotels. Please try again later.');
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (hotelName: string) => {
    toast.success('Redirecting to booking partner...', { duration: 3000 });
    const affiliateUrl = generateHotelBookingUrl({
      hotelName,
      city,
      checkIn,
      checkOut,
      guests,
      rooms
    });
    setTimeout(() => {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }, 1500);
  };

  const filteredHotels = hotels
    .filter(h => (h.rating || 0) >= minRating)
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'reviews') return (b.reviews || 0) - (a.reviews || 0);
      return 0;
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
              placeholder="City or Destination (e.g. London)" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

        <div className="flex flex-wrap items-center gap-2 bg-[#111] rounded-lg p-2 border border-white/10 w-full mt-4 text-[10px] font-bold uppercase tracking-widest text-white/70">
           <span className="mr-2">Sort & Filter:</span>
           <button onClick={() => setSortBy('rating')} className={`px-3 py-1.5 rounded border transition-colors ${sortBy === 'rating' ? 'border-[#FF3B30] text-[#FF3B30]' : 'border-white/10 hover:border-white/30'}`}>Top Rated</button>
           <button onClick={() => setSortBy('reviews')} className={`px-3 py-1.5 rounded border transition-colors ${sortBy === 'reviews' ? 'border-[#FF3B30] text-[#FF3B30]' : 'border-white/10 hover:border-white/30'}`}>Most Reviewed</button>
           <div className="ml-4 flex items-center gap-2">
              Min Stars:
              <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="bg-transparent text-white outline-none cursor-pointer border-b border-white/20 pb-0.5">
                 <option value="0" className="bg-[#111]">Any</option>
                 <option value="3" className="bg-[#111]">3.0+</option>
                 <option value="4" className="bg-[#111]">4.0+</option>
                 <option value="4.5" className="bg-[#111]">4.5+</option>
              </select>
           </div>
           <div className="ml-4 flex items-center gap-2">
              Type:
              <select value={hotelType} onChange={e => setHotelType(e.target.value as any)} className="bg-transparent text-white outline-none cursor-pointer border-b border-white/20 pb-0.5">
                 <option value="any" className="bg-[#111]">Any</option>
                 <option value="budget" className="bg-[#111]">Budget</option>
                 <option value="luxury" className="bg-[#111]">Luxury</option>
                 <option value="business" className="bg-[#111]">Business</option>
                 <option value="family" className="bg-[#111]">Family Friendly</option>
              </select>
           </div>
           <div className="ml-4 flex items-center gap-4">
             <label className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
               <input type="checkbox" checked={mustHaveBreakfast} onChange={e => setMustHaveBreakfast(e.target.checked)} className="accent-[#FF3B30]" />
               Breakfast Included
             </label>
             <label className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
               <input type="checkbox" checked={mustHaveCancellation} onChange={e => setMustHaveCancellation(e.target.checked)} className="accent-[#FF3B30]" />
               Free Cancellation
             </label>
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

      {apiError && (
        <div className="glass-card p-6 border-[#FF3B30]/50 flex items-center gap-4 text-[#FF3B30]">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-bold">Search Failed</h3>
            <p className="text-sm opacity-80">We couldn't fetch hotels at this time. Please check your SERP API Key configuration.</p>
          </div>
        </div>
      )}

      {searched && !apiError && (
        <div className="space-y-4">
          <div className="text-sm font-bold uppercase tracking-widest text-[#FF3B30] py-2">
             {loading ? 'Searching Hotels...' : (filteredHotels.length > 0 ? `Properties Found in ${city}` : 'No hotels found for the selected destination.')}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {!loading && filteredHotels.map((place, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={place.id || place.name}
                className="glass-card overflow-hidden hover:border-[#FF3B30]/50 transition-all group flex flex-col"
              >
                <div className="w-full h-48 relative">
                  {place.image ? (
                      <img 
                        src={place.image} 
                        alt={place.name || 'Hotel'} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                  ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                         <Hotel size={32} className="text-white/20" />
                      </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 text-[#FFD700]">
                    <Star size={12} className="fill-[#FFD700]" /> {place.rating || 'N/A'} <span className="text-white/50 font-normal">({place.reviews || 0})</span>
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black font-display mb-1">{place.name}</h3>
                    <p className="text-xs text-white/50 mb-3">{place.location || place.distance || 'Location info unavailable'}</p>
                    
                    {place.amenities && place.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {place.amenities.slice(0, 3).map((amenity: string, i: number) => (
                          <span key={i} className="text-[9px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded text-white/70">
                            {amenity}
                          </span>
                        ))}
                        {place.amenities.length > 3 && (
                          <span className="text-[9px] uppercase tracking-wider bg-white/5 px-2 py-1 rounded text-white/50">
                            +{place.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-end justify-between mt-2 pt-3 border-t border-white/5">
                    <div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Price per night</div>
                      <div className="text-lg font-bold text-white/90">
                        {place.price ? `₹${place.price.toLocaleString()}` : (place.rate_per_night?.lowest || 'Price unavailable')}
                      </div>
                    </div>
                    <button onClick={() => handleBook(place.name || '')} className="bg-[#FF3B30] text-black px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all">
                      Check Prices
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
