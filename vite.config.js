import { defineConfig } from 'vite'
import inject from '@rollup/plugin-inject'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import vue from '@vitejs/plugin-vue'
import { URL, fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills()
  ],
  build: {
    rollupOptions: {
      plugins: [
        inject({ Buffer: ['buffer', 'Buffer' ]})
      ]
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
