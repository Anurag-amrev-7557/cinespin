import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), imagetools(),     
      viteCompression({
      algorithm: 'brotliCompress', // or 'brotliCompress'
      ext: '.br',        // output extension
      deleteOriginFile: false, // keeps original .js file
    })],
    base: '/', // ✅ Ensures correct asset paths for production on Render
    optimizeDeps: {
      include: ['react-slick'],
    },
    define: {
      'process.env': Object.fromEntries(
        Object.entries(env).map(([key, val]) => [key, JSON.stringify(val)])
      ),
    },
    build: {
      outDir: 'dist',
    },
    preview: {
      allowedHosts: ['cinespin.onrender.com', 'cinespin.web.app']
    },
    server: {
      host: true,
      port: 3000,
    },
  };
});