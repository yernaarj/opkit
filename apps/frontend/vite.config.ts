import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Proxy API and WebSocket requests to the NestJS backend
  // so the frontend doesn't need CORS handling in development
  server: {
    host: true,   // bind to 0.0.0.0 so Windows browser can reach WSL
    port: 5173,
    proxy: {
      // REST API
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // WebSocket (Socket.IO uses /socket.io path by default)
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      // Allows: import { something } from '@/components/...'
      '@': '/src',
    },
  },
});
