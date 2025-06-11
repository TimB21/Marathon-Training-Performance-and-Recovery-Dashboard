import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    proxy: {
      '/splits_by_run': 'http://127.0.0.1:5000',
      '/fetch_runs': 'http://127.0.0.1:5000',
      '/run': 'http://127.0.0.1:5000',
    },
  },
  optimizeDeps: {
    include: ['leaflet'],
  },
})

