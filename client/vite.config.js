import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: "Aunty Vero's Gari Plug",
        short_name: "Aunty Vero",
        description: "The best roasted Gari on campus.",
        theme_color: "#FBBF24",
        background_color: "#f3f4f6",
        display: "standalone",
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      // 👇 THE MAGIC DATA VAULT IS HERE!
      workbox: {
        runtimeCaching: [
          {
            // Intercept ANY requests going to our Node.js API
            urlPattern: /^http:\/\/localhost:5000\/api\/.*/i,
            // STRATEGY: Try the internet first for fresh stock. If offline, use the photocopy!
            handler: 'StaleWhileRevalidate', 
            options: {
              cacheName: 'aunty-vero-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // Keep the photocopy for 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})