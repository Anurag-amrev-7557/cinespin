const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  // Add Workbox plugin
  output: {
    // Use content hashes in the filenames for cache busting
    filename: '[name].[contenthash].js',  // JavaScript files
    chunkFilename: '[name].[contenthash].js',  // Chunk files
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    // Generate the service worker with dynamic caching rules
    new WorkboxPlugin.GenerateSW({
      cacheId: 'cinespin-app',
      mode: 'production',
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
      offlineGoogleAnalytics: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      navigateFallback: '/offline.html',
      navigateFallbackDenylist: [/^\/api\//],
      directoryIndex: null,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 365, // Cache for 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
              headers: { 'Content-Type': 'font/woff2' },
            },
          },
        },
        {
          urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'tmdb-api-cache',
            networkTimeoutSeconds: 5,
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'tmdb-images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 90, // Cache for 90 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            rangeRequests: true, // Enable range requests for images
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'document',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'html-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7, // Cache HTML for 7 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'offline-images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 60, // Cache images for 60 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            fetchOptions: {
              mode: 'no-cors',
            },
          },
        },
      ],
    }),

    // Inject a custom service worker (this allows for more fine-grained control)
    new WorkboxPlugin.InjectManifest({
      swSrc: './public/service-worker.js', // Path to custom service worker
      swDest: 'service-worker.js', // Output file for the service worker
    }),
  ],
};