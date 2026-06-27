import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import Radar from './components/Radar';
import Travel from './components/Travel';
import Premium from './components/Premium';
import DealsPage from './components/DealsPage';
import RewardsHub from './components/RewardsHub';
import ThreeBackground from './components/ThreeBackground';
import SupportChat from './components/SupportChat';
import LoginModal from './components/LoginModal';
import ScannerPage from './components/ScannerPage';
import PersonalShopper from './components/PersonalShopper';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AffiliateProvider } from './contexts/AffiliateContext';

export default function App() {
  return (
      <Router>
        <AuthProvider>
          <CurrencyProvider>
            <AffiliateProvider>
              <div className="min-h-screen bg-[#050505] text-[#f5f5f5] selection:bg-[#FF3B30] selection:text-white">
            <ThreeBackground />
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
                <Route path="/shopper" element={<PersonalShopper />} />
                <Route path="/travel" element={<Travel />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/rewards" element={<RewardsHub />} />
                <Route path="/scanner" element={<ScannerPage />} />
                <Route path="/ref/:code" element={<Home />} />
                {/* Backward compatibility */}
                <Route path="/wishlist" element={<Radar />} />
              </Routes>
            </main>
            
            <SupportChat />

            {/* Border Frame */}
            <div className="fixed inset-0 pointer-events-none z-50 border-[20px] border-black/40 hidden xl:block" />
            </div>
            </AffiliateProvider>
          </CurrencyProvider>
        </AuthProvider>
      </Router>
  );
}
