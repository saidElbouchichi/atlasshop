import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // Les bibliothèques d'animation sont isolées pour un meilleur cache
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          animation: ['gsap', 'lenis', 'framer-motion'],
          etat: ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
  test: { environment: 'node' },
})
