// Service Worker AQUA PILOT - Optimisé pour tous les appareils avec cache intelligent
const CACHE_VERSION = 'aqua-pilot-v6';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;

// Ressources essentielles à pré-cacher
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png'
];

// Configuration du cache optimisée pour desktop/tablette
const CACHE_CONFIG = {
  static: {
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    maxEntries: 100
  },
  images: {
    maxAge: 60 * 60 * 24 * 30, // 30 jours
    maxEntries: 200
  },
  api: {
    maxAge: 60 * 10, // 10 minutes
    maxEntries: 100
  },
  dynamic: {
    maxAge: 60 * 60 * 24 * 14, // 14 jours
    maxEntries: 150
  },
  appShell: {
    maxAge: 60 * 60 * 24 * 365, // 1 an
    maxEntries: 50
  }
};

// Installation - Optimisée pour tous les appareils
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE)
        .then((cache) => {
          return cache.addAll(STATIC_FILES).catch((err) => {
            console.warn('[SW] Cache failed, continuing anyway:', err);
            return Promise.resolve();
          });
        }),
      caches.open(APP_SHELL_CACHE)
        .then((cache) => {
          // Pré-cacher les ressources critiques de l'app shell
          return cache.addAll([
            '/index.html',
            '/manifest.json'
          ]).catch(() => Promise.resolve());
        })
    ])
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
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE, APP_SHELL_CACHE];
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('aqua-pilot-') && !validCaches.includes(name))
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

// Fonction pour déterminer la stratégie de cache appropriée
function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Images - Cache First
  if (/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    return { strategy: 'CacheFirst', cacheName: IMAGE_CACHE, config: CACHE_CONFIG.images };
  }
  
  // API Supabase - Network First avec timeout court
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/rest/')) {
    return { strategy: 'NetworkFirst', cacheName: API_CACHE, config: CACHE_CONFIG.api, timeout: 3000 };
  }
  
  // Storage Supabase - Cache First
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/')) {
    return { strategy: 'CacheFirst', cacheName: IMAGE_CACHE, config: CACHE_CONFIG.images };
  }
  
  // Ressources statiques (JS, CSS) - Stale While Revalidate
  if (/\.(js|css)$/i.test(url.pathname)) {
    return { strategy: 'StaleWhileRevalidate', cacheName: STATIC_CACHE, config: CACHE_CONFIG.static };
  }
  
  // Fonts - Cache First
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    return { strategy: 'CacheFirst', cacheName: STATIC_CACHE, config: CACHE_CONFIG.static };
  }
  
  // Par défaut - Network First
  return { strategy: 'NetworkFirst', cacheName: DYNAMIC_CACHE, config: CACHE_CONFIG.dynamic, timeout: 5000 };
}

// Fonction pour nettoyer les vieux items du cache
async function cleanCache(cacheName, maxEntries, maxAge) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    const entriesToDelete = keys.length - maxEntries;
    for (let i = 0; i < entriesToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Stratégie Cache First
async function cacheFirstStrategy(request, cacheName, config) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Mise à jour en arrière-plan
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          caches.open(cacheName).then(cache => {
            cache.put(request, response.clone());
            cleanCache(cacheName, config.maxEntries, config.maxAge);
          });
        }
      })
      .catch(() => {});
    
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      cleanCache(cacheName, config.maxEntries, config.maxAge);
    }
    return response;
  } catch (error) {
    console.log('[SW] Fetch failed:', request.url);
    throw error;
  }
}

// Stratégie Network First avec timeout
async function networkFirstStrategy(request, cacheName, config, timeout = 5000) {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    );
    
    const response = await Promise.race([
      fetch(request),
      timeoutPromise
    ]);
    
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      cleanCache(cacheName, config.maxEntries, config.maxAge);
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback pour les pages HTML
    if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
      const indexResponse = await caches.match('/index.html');
      if (indexResponse) return indexResponse;
    }
    
    throw error;
  }
}

// Stratégie Stale While Revalidate
async function staleWhileRevalidateStrategy(request, cacheName, config) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        caches.open(cacheName).then(cache => {
          cache.put(request, response.clone());
          cleanCache(cacheName, config.maxEntries, config.maxAge);
        });
      }
      return response;
    })
    .catch(() => {});
  
  return cachedResponse || fetchPromise;
}

// Gestionnaire principal des requêtes fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Ignorer les URLs non-HTTP/HTTPS
  if (!request.url.startsWith('http')) return;
  
  const { strategy, cacheName, config, timeout } = getCacheStrategy(request);
  
  event.respondWith(
    (async () => {
      try {
        switch (strategy) {
          case 'CacheFirst':
            return await cacheFirstStrategy(request, cacheName, config);
          case 'NetworkFirst':
            return await networkFirstStrategy(request, cacheName, config, timeout);
          case 'StaleWhileRevalidate':
            return await staleWhileRevalidateStrategy(request, cacheName, config);
          default:
            return await fetch(request);
        }
      } catch (error) {
        console.error('[SW] Request failed:', request.url, error);
        
        // Tentative de récupération depuis n'importe quel cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        
        // Fallback pour navigation
        if (request.mode === 'navigate') {
          const indexResponse = await caches.match('/index.html');
          if (indexResponse) return indexResponse;
          
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AQUA PILOT - Offline</title></head><body style="font-family:system-ui;padding:20px;text-align:center"><h1>Mode Hors Ligne</h1><p>L\'application est temporairement indisponible. Veuillez vérifier votre connexion.</p></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
        
        return new Response('Resource not available offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
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
