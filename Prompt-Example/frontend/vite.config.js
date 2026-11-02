import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative asset paths, so the build works from any URL path (e.g. GitHub Pages project sites).
  base: './',
  plugins: [react()],
  server: {
    port: 5183,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:5050',
    },
  },
})
