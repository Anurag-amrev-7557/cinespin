import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), imagetools()],
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