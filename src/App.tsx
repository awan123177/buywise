import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import Radar from './components/Radar';
import Travel from './components/Travel';
import Premium from './components/Premium';
import ThreeBackground from './components/ThreeBackground';
import SupportChat from './components/SupportChat';
import { AuthProvider } from './contexts/AuthContext';

const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-[#050505] text-[#f5f5f5] selection:bg-[#FF3B30] selection:text-white">
            <ThreeBackground />
            <Navbar />
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
                {/* Backward compatibility */}
                <Route path="/wishlist" element={<Radar />} />
              </Routes>
            </main>
            
            <SupportChat />

            {/* Border Frame */}
            <div className="fixed inset-0 pointer-events-none z-50 border-[20px] border-black/40 hidden xl:block" />
          </div>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}
