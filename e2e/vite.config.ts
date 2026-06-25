import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// Dev server config for the Playwright E2E harness app.
export default defineConfig({
  root: resolve(__dirname, 'app'),
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
})
