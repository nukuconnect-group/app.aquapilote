import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { OfflineProvider } from './contexts/OfflineContext';

console.log('🚀 AQUA PILOT - Application complète restaurée');

// Enregistrement du Service Worker avec gestion améliorée des mises à jour
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const isLovablePreview = /lovable\.app$/i.test(window.location.hostname);
    if (isLovablePreview) {
      console.info('ℹ️ Service Worker désactivé sur le preview Lovable pour éviter les erreurs de redirection.');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);
        
        // Vérifier les mises à jour immédiatement
        registration.update();
        
        // Écouter les mises à jour du SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('🔄 Nouvelle version du Service Worker trouvée');
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('✅ Nouvelle version installée et prête');
                // Le message SW_UPDATED sera envoyé par le service worker
              }
            });
          }
        });
        
        // Vérifier les mises à jour périodiquement (toutes les 5 minutes)
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
      });
  });
  
  // Recharger la page si le contrôleur change
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('🔄 Nouveau contrôleur détecté, rechargement...');
      window.location.reload();
    }
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <OfflineProvider>
      <App />
    </OfflineProvider>
  </React.StrictMode>
);
