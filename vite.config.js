import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow existing NEXT_PUBLIC_* env vars (common with Next.js templates) alongside VITE_*.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/create-checkout-session': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
