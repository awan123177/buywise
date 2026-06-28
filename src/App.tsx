import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import Radar from './components/Radar';
import Travel from './components/Travel';
import Premium from './components/Premium';
import GiftCards from './components/GiftCards';
import DealsPage from './components/DealsPage';
import RewardsHub from './components/RewardsHub';
import SupportChat from './components/SupportChat';
import LoginModal from './components/LoginModal';
import ScannerPage from './components/ScannerPage';
import ProductPage from './components/ProductPage';
import PersonalShopper from './components/PersonalShopper';
import SmartNotifications from './components/SmartNotifications';
import StaticPage from './components/StaticPage';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AffiliateProvider } from './contexts/AffiliateContext';
import SEO from './components/SEO';

const RouteTracker = () => {
  const location = useLocation();
  const getCanonicalUrl = () => {
    return `https://buywiser.store${location.pathname === '/' ? '' : location.pathname}`;
  };
  
  return <SEO canonicalUrl={getCanonicalUrl()} />;
};

export default function App() {
  return (
    <Router>
      <RouteTracker />
      <AuthProvider>
        <CurrencyProvider>
          <AffiliateProvider>
            <div className="min-h-screen bg-transparent text-[#f5f5f5] selection:bg-[#FF3B30] selection:text-black">
          <Navbar />
          <LoginModal />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111111',
                color: '#f5f5f5',
                border: '1px solid rgba(255,59,48,0.2)',
                backdropFilter: 'blur(10px)',
              },
            }}
          />
          <main className="relative z-10 pb-20 lg:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/radar" element={<Radar />} />
              <Route path="/travel" element={<Travel />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/gifts" element={<GiftCards />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/rewards" element={<RewardsHub />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/ref/:code" element={<Home />} />
              <Route path="/wishlist" element={<Radar />} />
              <Route path="/:pageId" element={<StaticPage />} />
            </Routes>
          </main>
          
          <SupportChat />
          </div>
          </AffiliateProvider>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}
