import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Train, Hotel } from 'lucide-react';
import FlightSearch from './TravelSearch/FlightSearch';
import TrainSearch from './TravelSearch/TrainSearch';
import HotelSearch from './TravelSearch/HotelSearch';

export default function Travel() {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'trains'>('flights');

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto min-h-screen text-white relative z-10">
      
      {/* Header */}
      <div className="text-center mb-10 mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block mb-4"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[#FF3B30]">
            Global Network
          </span>
        </motion.div>
        
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 font-display">
          BuyWise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B30] to-[#FF3B30]">Travel</span>
        </h1>
        <p className="text-white/50 max-w-xl mx-auto text-sm leading-relaxed">
          Book genuine flights, hotels, and trains with verified prices directly from official partners.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 overflow-x-auto pb-4 hide-scrollbar">
        <div className="bg-[#111] border border-white/10 rounded-xl p-1 flex min-w-max">
          <button
            onClick={() => setActiveTab('flights')}
            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg text-xs md:text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'flights' ? 'bg-[#FF3B30] text-white shadow-lg' : 'text-white/50 hover:text-white'
            }`}
          >
            <Plane size={18} /> Flights
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg text-xs md:text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'hotels' ? 'bg-[#FF3B30] text-white shadow-lg' : 'text-white/50 hover:text-white'
            }`}
          >
            <Hotel size={18} /> Hotels
          </button>
          <button
            onClick={() => setActiveTab('trains')}
            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg text-xs md:text-sm font-black uppercase tracking-widest transition-all ${
              activeTab === 'trains' ? 'bg-[#FF3B30] text-white shadow-lg' : 'text-white/50 hover:text-white'
            }`}
          >
            <Train size={18} /> Trains
          </button>

        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'flights' && (
          <motion.div key="flights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <FlightSearch />
          </motion.div>
        )}
        {activeTab === 'hotels' && (
          <motion.div key="hotels" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <HotelSearch />
          </motion.div>
        )}
        {activeTab === 'trains' && (
          <motion.div key="trains" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <TrainSearch />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
