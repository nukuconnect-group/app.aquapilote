import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Forcer le nettoyage complet du cache
console.log('🚀 Application démarrant avec nettoyage forcé du cache à:', new Date().toISOString());

// Nettoyage complet du localStorage et sessionStorage
try {
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Storage nettoyé');
} catch (e) {
  console.warn('⚠️ Impossible de nettoyer le storage:', e);
}

// Nettoyage du cache du service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.update();
      if (registration.active) {
        registration.active.postMessage({ type: 'CLEAR_CACHE' });
      }
    });
  });
}

// Rendu de l'application
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('✅ Application rendue sans erreur de dispatcher');