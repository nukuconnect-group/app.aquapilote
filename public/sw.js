// Désactiver complètement le cache pour forcer le rechargement
const CACHE_NAME = 'aqua-pilot-no-cache-' + Date.now();
const urlsToCache = [];

// Installation du service worker - nettoyage forcé
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation avec nettoyage forcé');
  event.waitUntil(
    // Supprimer tous les anciens caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Suppression du cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Créer le nouveau cache
      return caches.open(CACHE_NAME);
    }).then((cache) => {
      console.log('Nouveau cache créé');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Force l'activation immédiate
});

// Activation du service worker - nettoyage complet
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation avec nettoyage complet');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Prendre le contrôle immédiatement
    })
  );
});

// Désactiver complètement le cache - toujours utiliser le réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request.url + '?nocache=' + Date.now())
      .catch(() => fetch(event.request))
  );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    });
  }
});