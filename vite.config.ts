import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this site from /interp/.
  // Keep local dev at root and only use the repo base in CI builds.
  base: process.env.GITHUB_ACTIONS ? '/interp/' : '/',
  plugins: [react()],
})
