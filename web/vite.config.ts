import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Precisa ser função, não RegExp: o Workbox ignora RegExp que não casa desde o
// início da URL quando a requisição é cross-origin — e a API sempre é.

// O GitHub Pages serve o site em /<repo>/, mas o dev server roda na raiz.
export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/vortex-marketplace/' : '/'

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'Desapega Campus — economia circular na UNIFOR',
          short_name: 'Desapega',
          description:
            'Marketplace de economia circular do campus: doe, venda e encontre material de estudo entre estudantes da UNIFOR.',
          lang: 'pt-BR',
          start_url: base,
          scope: base,
          display: 'standalone',
          background_color: '#f4f6fb',
          theme_color: '#170d29',
          categories: ['shopping', 'education'],
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          // O precache baixa tudo na instalação: não faz sentido levar os subsets
          // que um site em português nunca vai pedir.
          globIgnores: [
            '**/*-{arabic,hebrew,cyrillic,cyrillic-ext,greek,greek-ext,vietnamese,math,symbols}-*.woff2',
          ],
          navigateFallback: `${base}index.html`,
          runtimeCaching: [
            {
              // A vitrine continua visível offline com a última resposta recebida.
              urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/'),
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-desapega',
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // As fotos dos anúncios vêm de qualquer host que o usuário colar.
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'imagens-anuncios',
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  }
})
