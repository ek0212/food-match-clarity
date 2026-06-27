import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: set to '/<repo-name>/' or '/' for custom domains
  base: process.env.GITHUB_PAGES ? '/food-match-clarity/' : '/',
})
