import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import { URL, fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    basicSsl()
  ],
  server: {
    https: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          chart: [
            'chart.js',
            'vue-chartjs'
          ],
          crypto: [
            'crypto-js',
            'elliptic',
            'ethers'
          ],
          edge: [
            '@edge/bridge-utils',
            '@edge/index-utils',
            '@edge/wallet-utils',
            '@edge/xe-utils'
          ]
        }
      }
    },
  },
})
