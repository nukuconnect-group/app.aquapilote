// Service Worker AQUA PILOT - PWA Complète
const CACHE_NAME = 'aqua-pilot-v2';
const STATIC_CACHE = 'aqua-pilot-static-v2';
const DYNAMIC_CACHE = 'aqua-pilot-dynamic-v2';

// Ressources essentielles à mettre en cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/assets/aqua-pilot-logo.png',
  'https://storage.googleapis.com/gpt-engineer-file-uploads/C3YioAkra3hJ4npw1XZX0HbG8E32/uploads/1758369338751-LOGO AQUA PILOT.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static files');
        return cache.addAll(STATIC_FILES).catch(err => {
          console.error('[SW] Error caching files:', err);
        });
      })
      .then(() => {
        console.log('[SW] Installation completed');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation completed');
        return self.clients.claim();
      })
  );
});

// Stratégie de cache - Cache-first pour fonctionner hors ligne
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) return;

  // Stratégie cache-first agressive pour toutes les ressources
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Retourner le cache immédiatement si disponible
        if (cachedResponse) {
          // Mettre à jour le cache en arrière-plan
          fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }
            })
            .catch(() => {
              // Ignorer les erreurs réseau en mode hors ligne
            });
          
          return cachedResponse;
        }

        // Si pas en cache, essayer de récupérer
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // En cas d'échec, retourner la page principale pour les navigations
            if (request.mode === 'navigate') {
              return caches.match('/').then(response => {
                return response || new Response('<!DOCTYPE html><html><head><title>AQUA PILOT</title></head><body><div id="root"></div></body></html>', {
                  headers: { 'Content-Type': 'text/html' }
                });
              });
            }

            // Pour les autres ressources, retourner une réponse vide
            return new Response('', {
              status: 200,
              statusText: 'OK'
            });
          });
      })
  );
});

// Gestion des notifications Push (optionnel)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification AQUA PILOT',
      icon: '/src/assets/aqua-pilot-logo.png',
      badge: '/src/assets/aqua-pilot-logo.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'open',
          title: 'Ouvrir l\'app'
        },
        {
          action: 'close',
          title: 'Fermer'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'AQUA PILOT', options)
    );
  }
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message du SW vers l'app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});