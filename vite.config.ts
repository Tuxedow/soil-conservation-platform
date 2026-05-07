import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/soil-conservation-platform/',
  server: {
    port: 6001,
  },
})
