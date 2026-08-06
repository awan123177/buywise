import React, { useState, useRef, useEffect } from 'react';
import { useCurrency, Currency } from '../contexts/CurrencyContext';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Globe } from 'lucide-react';

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currencies: { code: Currency; symbol: string; label: string }[] = [
    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' }
  ];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative z-[100]" ref={ref}>
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#111] hover:bg-white/5 text-white text-xs font-bold font-mono transition-colors"
      >
        <Globe size={14} className="text-white/50" />
        <span className="text-[#FF3B30]">{currencies.find(c => c.code === currency)?.symbol}</span>
        <span>{currency}</span>
        <ChevronDown size={14} className="text-white/30" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-[300px] overflow-y-auto">
              {currencies.map(c => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors hover:bg-white/5 ${
                    currency === c.code ? 'bg-white/5 font-black text-white' : 'text-white/70 font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#FF3B30] w-4 text-center">{c.symbol}</span>
                    {c.code}
                  </span>
                  <span className="text-white/30 text-[10px]">{c.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
