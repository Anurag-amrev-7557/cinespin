const CACHE_VERSION = 'v3'; // Update this to a dynamic version or hash from a build tool
const CACHE_NAME = `cinespin-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html'; // Ensure this is precached

// List of files to cache for precaching, dynamically adding versioning
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.webp',
  '/manifest.json',
  '/src/pages/Auth/Login/Login.jsx',
  '/src/pages/Auth/Login/Login.css',
  '/src/pages/Auth/Register/Register.jsx',
  '/src/pages/Auth/Register/Register.css',
  OFFLINE_URL, // Ensure offline.html is cached
  // You can add a versioned list here if you're dynamically generating versioned assets
];

// Install event - pre-cache static assets with versioning
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate the service worker immediately
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
  clients.claim(); // Claim the client to control the page immediately
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // Delete caches that do not match the current version
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Remove old caches
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network, then fallback to offline
self.addEventListener('fetch', (event) => {
  // Handle GET requests only
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached || // Return cached response if available
        fetch(event.request)
          .then((response) => {
            // If the response is valid, cache it for future requests
            if (response && response.status === 200) {
              const clonedResponse = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse); // Update cache with new files
              });
            }
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show the offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          })
      );
    })
  );
});