const CACHE_NAME = 'cinespin-cache-v1';
const OFFLINE_URL = '/offline.html'; // Optional: create one if desired

// List of files to cache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.webp',
  '/manifest.json',
];

// Install event - pre-cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_ASSETS.map((url) => {
          return fetch(url).then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            } else {
              console.error(`Failed to cache ${url}:`, response.statusText);
            }
          }).catch((error) => {
            console.error(`Error fetching ${url}:`, error);
          });
        })
      );
    }).catch((error) => {
      console.error('Failed to open cache:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  clients.claim();
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network, then fallback to offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        })
      );
    })
  );
});