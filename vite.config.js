import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
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
      allowedHosts: ['cinespin.onrender.com']
    },
    server: {
      host: true,
      port: 3000,
    },
  };
});