import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Forcer le nettoyage complet du cache AVANT tout
console.log('🚀 CACHE BUSTER - Nettoyage agressif à:', new Date().toISOString());

// Nettoyage TOTAL de tous les caches possibles
try {
  localStorage.clear();
  sessionStorage.clear();
  // Vider tous les caches de l'indexedDB aussi
  if ('indexedDB' in window) {
    indexedDB.deleteDatabase('keyval-store');
  }
  console.log('✅ Tous les storage nettoyés');
} catch (e) {
  console.warn('⚠️ Erreur nettoyage storage:', e);
}

// Forcer la désactivation du service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('🗑️ Service worker désenregistré');
    });
  });
}

// Ajouter un paramètre de cache-busting à toutes les requêtes
const originalFetch = window.fetch;
window.fetch = function(...args: Parameters<typeof fetch>) {
  const [resource, config] = args;
  let url: string;
  
  if (typeof resource === 'string') {
    url = resource;
  } else if (resource instanceof Request) {
    url = resource.url;
  } else {
    url = resource.toString();
  }
  
  const separator = url.includes('?') ? '&' : '?';
  const bustUrl = `${url}${separator}cacheBust=${Date.now()}`;
  
  if (typeof resource === 'string') {
    return originalFetch(bustUrl, config);
  } else {
    const newRequest = new Request(bustUrl, {
      method: resource instanceof Request ? resource.method : 'GET',
      headers: resource instanceof Request ? resource.headers : undefined,
      body: resource instanceof Request ? resource.body : undefined,
      mode: resource instanceof Request ? resource.mode : undefined,
      credentials: resource instanceof Request ? resource.credentials : undefined,
      cache: resource instanceof Request ? resource.cache : undefined,
      redirect: resource instanceof Request ? resource.redirect : undefined,
      referrer: resource instanceof Request ? resource.referrer : undefined,
      integrity: resource instanceof Request ? resource.integrity : undefined,
    });
    return originalFetch(newRequest, config);
  }
};

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