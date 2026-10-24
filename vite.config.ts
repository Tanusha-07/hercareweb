import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * HerCare+ Vite config.
 *
 * The dev server proxies /api to the local OTP/AI backend (see server/), so the
 * frontend never holds SMS or AI credentials and no CORS setup is needed locally.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2018',
    // Keep the payload small for 2G/3G users.
    chunkSizeWarningLimit: 640,
    cssCodeSplit: true,
    reportCompressedSize: true,
  },
});
