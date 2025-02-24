import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'dhikr-logo.png', 'mask-icon.svg'],
      manifest: {
        name: 'تدبر الذكر',
        short_name: 'تدبر الذكر',
        description: 'تطبيق لتدبر الأذكار',
        theme_color: '#059669',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'dhikr-logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'dhikr-logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'dhikr-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'dhikr-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'dhikr-logo.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'تدبر الذكر'
          }
        ],
        shortcuts: [
          {
            name: 'تدبر الذكر',
            url: '/',
            icons: [
              {
                src: 'dhikr-logo.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          }
        ],
        categories: ['lifestyle', 'utilities'],
        dir: 'rtl',
        lang: 'ar',
        prefer_related_applications: false,
        related_applications: [],
        padding: true,
        display_override: ['window-controls-overlay']
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // Handle notification clicks in the service worker
        additionalManifestEntries: [
          {
            url: '/',
            revision: 'notification-click'
          }
        ]
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts'
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
