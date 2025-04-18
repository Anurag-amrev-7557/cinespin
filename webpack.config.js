const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  // Add Workbox plugin
  plugins: [
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
              maxAgeSeconds: 60 * 60 * 24 * 365,
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
              maxAgeSeconds: 60 * 60 * 24 * 30,
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
              maxAgeSeconds: 60 * 60 * 24 * 90,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            rangeRequests: true,
          },
        },
      ],
    }),
  ],
};