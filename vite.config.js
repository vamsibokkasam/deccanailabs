import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const root = path.dirname(fileURLToPath(import.meta.url))
const framerInstalled = fs.existsSync(path.join(root, 'node_modules/framer-motion/package.json'))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: framerInstalled
    ? undefined
    : {
        alias: {
          'framer-motion': path.join(root, 'src/vendor/framer-motion.jsx'),
        },
      },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
})