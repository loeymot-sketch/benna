import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// API_PORT permet de pointer le front vers une autre API (ex. copie de test) : API_PORT=8788 npm run dev -- --port 5174
const API = `http://127.0.0.1:${process.env.API_PORT ?? 8787}`;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: API, changeOrigin: true },
      '/uploads': { target: API, changeOrigin: true },
      '/socket.io': { target: API, ws: true, changeOrigin: true },
    },
  },
});
