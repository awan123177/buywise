// Global safeguard: Ensure window.fetch has both getter and setter for external tracking and canvas libraries
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event: ErrorEvent) => {
    if (event?.message?.includes('Cannot set property fetch') || event?.error?.message?.includes('Cannot set property fetch')) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      return true;
    }
  }, true);

  try {
    const origFetch = window.fetch;
    let current = origFetch ? origFetch.bind(window) : null;
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!desc || (!desc.set && !desc.writable)) {
      Object.defineProperty(window, 'fetch', {
        get: () => current,
        set: (v) => {
          if (typeof v === 'function') current = v;
        },
        configurable: true,
        enumerable: true,
      });
    }
  } catch (_) {
    // If window.fetch is non-configurable, the error listener above will suppress any third-party setter throws
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    registration.unregister();
  }).catch(error => {
    console.error(error.message);
  });
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
