import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Force le rechargement du cache avec un timestamp
console.log('Application démarrant à:', new Date().toISOString());

// Vider le cache localStorage pour éviter les conflits
try {
  localStorage.removeItem('privacy-policy-accepted');
  localStorage.removeItem('onboarding-completed');
} catch (e) {
  console.warn('Impossible de vider le localStorage:', e);
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);