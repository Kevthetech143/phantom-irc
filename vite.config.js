import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  base: '/phantom-irc/',
  plugins: [
    react(),
    nodePolyfills({
      include: ['stream', 'util', 'buffer', 'process', 'events'],
      globals: {
        process: true,
        Buffer: true
      }
    })
  ],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      stream: 'stream-browserify'
    }
  }
})
