// vite.config.ts
import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function deferRenderBlockingCss(): PluginOption {
  const deferCss = (html: string) =>
    html.replace(
      /<link rel="stylesheet"([^>]*?)href="([^"]*\/assets\/index-[^"]+\.css)"([^>]*)>/g,
      `<link rel="preload" as="style"$1href="$2"$3 fetchpriority="high" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet"$1href="$2"$3></noscript>`,
    )

  return {
    name: 'bytecode-defer-render-blocking-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler: deferCss,
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), deferRenderBlockingCss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) {
            return;
          }

          const normalizedId = id.replace(/\\/g, '/');

          if (normalizedId.includes('/node_modules/framer-motion/')) {
            return 'framer';
          }

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
