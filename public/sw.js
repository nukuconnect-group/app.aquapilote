const CACHE_NAME = 'aqua-pilot-v2.0.0-fresh'; // Nouveau nom pour forcer la mise à jour
const urlsToCache = [
  '/',
  '/manifest.json'
];

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

// Stratégie de mise en cache - Network First pour éviter les anciennes versions
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((response) => {
      // Si la requête réseau réussit, utiliser la nouvelle version
      if (response && response.status === 200) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }
      throw new Error('Network response was not ok');
    }).catch(() => {
      // Fallback sur le cache seulement si le réseau échoue
      return caches.match(event.request);
    })
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