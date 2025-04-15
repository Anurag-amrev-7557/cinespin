const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  // Add Workbox plugin
  plugins: [
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
};