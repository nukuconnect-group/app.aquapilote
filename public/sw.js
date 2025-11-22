// Service Worker AQUA PILOT - Optimisé avec gestion améliorée du cache
const CACHE_VERSION = 'aqua-pilot-v4';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Ressources essentielles (chemins absolus pour iOS)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png'
];

// Installation - Simplifiée pour iOS
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_FILES).catch((err) => {
          console.warn('[SW] Cache failed, continuing anyway:', err);
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('[SW] Skip waiting to activate immediately');
        return self.skipWaiting();
      })
  );
});

// Activation - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('aqua-pilot-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming all clients');
        return self.clients.claim();
      })
      .then(() => {
        // Notifier tous les clients qu'une nouvelle version est active
        return self.clients.matchAll();
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ 
            type: 'SW_UPDATED',
            version: CACHE_VERSION 
          });
        });
      })
  );
});

// Stratégie Network-First avec timeout pour iOS Safari
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Ignorer les URLs non-HTTP/HTTPS
  if (!request.url.startsWith('http')) return;
  
  // Ignorer les requêtes vers Supabase (toujours fraîches)
  if (request.url.includes('supabase.co')) {
    return;
  }

  // Stratégie Network-First avec timeout
  event.respondWith(
    Promise.race([
      fetch(request)
        .then((response) => {
          // Si succès, mettre en cache
          if (response && response.status === 200 && response.type !== 'error') {
            const responseToCache = response.clone();
            
            // Ne pas bloquer la réponse avec le cache
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseToCache))
              .catch((err) => console.warn('[SW] Cache put failed:', err));
          }
          
          return response;
        }),
      // Timeout après 3 secondes pour éviter les attentes infinies
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      )
    ])
    .catch((error) => {
      console.log('[SW] Fetch failed or timeout, trying cache:', request.url);
      
      // Fallback sur le cache
      return caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Pour les navigations, retourner la page d'index
          if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html')
              .then((indexResponse) => {
                if (indexResponse) return indexResponse;
                
                // Fallback HTML minimal
                return new Response(
                  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AQUA PILOT</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
                  {
                    status: 200,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                  }
                );
              });
          }
          
          // Pour les autres ressources, retourner une erreur propre
          return new Response('Resource not available offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

// Gestion des notifications Push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification AQUA PILOT',
      icon: '/favicon.png',
      badge: '/favicon.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      tag: 'aqua-pilot-notification',
      renotify: true
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'AQUA PILOT', options)
    );
  } catch (err) {
    console.error('[SW] Push notification error:', err);
  }
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Messages du SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches...');
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((name) => caches.delete(name))
          );
        })
        .then(() => {
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        })
    );
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    console.log('[SW] Checking for updates...');
    event.waitUntil(
      self.registration.update()
        .then(() => {
          console.log('[SW] Update check completed');
        })
    );
  }
});
