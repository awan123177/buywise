import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'SGD' | 'AUD' | 'CAD' | 'JPY';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Record<Currency, number>;
  convert: (amountInINR: number, fromCurrency?: string) => number;
  formatPrice: (amountInINR: number, fromCurrency?: string) => string;
}

// Fixed mock rates against INR
const RATES: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  SAR: 0.045,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
  JPY: 1.81
};

const SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SAR: '﷼',
  SGD: 'S$',
  AUD: 'A$',
  CAD: 'C$',
  JPY: '¥'
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('INR');
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user_currency');
    if (saved && saved in RATES) {
      setCurrencyState(saved as Currency);
      setDetected(true);
    } else {
      // Detect country
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (!localStorage.getItem('user_currency')) {
            const country = data.country_code;
            if (country === 'IN') setCurrencyState('INR');
            else if (country === 'US') setCurrencyState('USD');
            else if (country === 'AE') setCurrencyState('AED');
            else if (country === 'GB') setCurrencyState('GBP');
            else if (country === 'SG') setCurrencyState('SGD');
            else if (country === 'SA') setCurrencyState('SAR');
            else if (country === 'AU') setCurrencyState('AUD');
            else if (country === 'CA') setCurrencyState('CAD');
            else if (country === 'JP') setCurrencyState('JPY');
            else if (data.currency && data.currency in RATES) setCurrencyState(data.currency as Currency);
            else setCurrencyState('USD');
          }
        })
        .catch(() => {})
        .finally(() => setDetected(true));
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('user_currency', c);
  };

  const convert = (amount: number, fromCurrency: string = 'INR') => {
    // If we have an amount in INR
    if (fromCurrency === 'INR') {
        return amount * RATES[currency];
    }
    
    // If the amount is not in INR, first convert to INR, then to target
    const inINR = fromCurrency in RATES ? amount / RATES[fromCurrency as Currency] : amount;
    return inINR * RATES[currency];
  };

  const formatPrice = (amount: number, fromCurrency: string = 'INR') => {
    const converted = convert(amount, fromCurrency);
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: (currency === 'INR' || currency === 'JPY') ? 0 : 2
    }).format(converted);
    
    if (currency === 'INR') {
       return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    }
    
    return formatted;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates: RATES, convert, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
