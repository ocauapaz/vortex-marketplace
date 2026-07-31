import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// O GitHub Pages serve o site em /<repo>/, mas o dev server roda na raiz.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/vortex-marketplace/' : '/',
  plugins: [react(), tailwindcss()],
}))
