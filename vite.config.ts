// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {},
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          const normalizedId = id.replace(/\\/g, '/');

          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/') ||
            normalizedId.includes('/node_modules/scheduler/')
          ) {
            return 'react-core';
          }

          if (normalizedId.includes('/node_modules/react-router')) {
            return 'router';
          }

          if (
            normalizedId.includes('/node_modules/three/') ||
            normalizedId.includes('/node_modules/three-stdlib/')
          ) {
            return 'three';
          }

          if (normalizedId.includes('/node_modules/gsap/')) {
            return 'gsap';
          }

          if (
            normalizedId.includes('/node_modules/lucide-react/') ||
            normalizedId.includes('/node_modules/@tabler/icons-react/')
          ) {
            return 'icons';
          }
        },
      },
    },
  },
})
