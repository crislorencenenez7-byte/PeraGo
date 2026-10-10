import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        changeNumber: resolve(__dirname, 'change-number.html'),
        otp: resolve(__dirname, 'otp.html'),
        register: resolve(__dirname, 'register.html'),
        pin: resolve(__dirname, 'pin.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
    },
  },
})
