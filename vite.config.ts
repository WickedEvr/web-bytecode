// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Usamos una función para definir los chunks, lo que resuelve el error de tipos
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            return 'vendor-others';
          }
        },
      },
    },
    // Optimizamos el límite para evitar avisos innecesarios en builds complejos
    chunkSizeWarningLimit: 800,
  },
})