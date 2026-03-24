import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  define: {
    // Inject build timestamp so we can verify which version is running in production
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
 claude/analyze-chat-history-D5axK
        name: 'guidetranslator (by fintutto)',
        short_name: 'guidetranslator',
        description: 'Kostenloser Übersetzer mit Spracheingabe, Sprachausgabe und Live-Übersetzung',
=======
        name: 'Fintutto Translator',
        short_name: 'Fintutto',
        description: 'Kostenloser Übersetzer mit Spracheingabe, HD-Sprachausgabe, Live-Sessions, Kamera-OCR und Offline-Modus. 32+ Sprachen.',
 main
        theme_color: '#0369a1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['utilities', 'education', 'productivity'],
        lang: 'de',
        dir: 'ltr',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Live-Session starten',
            short_name: 'Live',
            url: '/live',
            description: 'Echtzeit-Übersetzung für Zuhörer starten',
          },
          {
            name: 'Konversation',
            short_name: 'Gespräch',
            url: '/conversation',
            description: 'Face-to-Face Übersetzung für zwei Personen',
          },
          {
            name: 'Kamera-Übersetzer',
            short_name: 'Kamera',
            url: '/camera',
            description: 'Text im Bild erkennen und übersetzen',
          },
          {
            name: 'Phrasebook',
            short_name: 'Phrasen',
            url: '/phrasebook',
            description: 'Wichtige Sätze für Alltag und Behörden',
          },
        ],
      },
      workbox: {
        // Cache static assets (exclude large WASM — loaded on demand via runtime cache)
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Exclude ONNX WASM from precache (21MB+), handle via runtime caching
        globIgnores: ['**/*.wasm'],
        // Offline navigation fallback
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        // Runtime caching for API requests and ML models
        runtimeCaching: [
          {
            // Cache translation API responses
            urlPattern: /^https:\/\/api\.mymemory\.translated\.net/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'translation-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            // Cache Google Translation API responses
            urlPattern: /^https:\/\/translation\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-translate-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            // Cache Google TTS audio responses
            urlPattern: /^https:\/\/texttospeech\.googleapis\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tts-audio-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache local WASM files (ONNX Runtime) on first use
            urlPattern: /\.wasm$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wasm-runtime',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            // Cache Supabase API responses for admin dashboard (content items, stats)
            urlPattern: /\/rest\/v1\/(fw_content_items|fw_workflow_rules|fw_content_timeline|ag_museums)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'admin-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Cache Supabase Storage (cover images, audio files)
            urlPattern: /\/storage\/v1\/object\/public\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache Supabase Edge Functions responses (content-enrich, artguide-tts)
            urlPattern: /\/functions\/v1\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'edge-functions-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 10, // 10 minutes
              },
              networkTimeoutSeconds: 30,
            },
          },
        ],
      },
    }),
  ],
  build: {
    // Warn only for chunks over 550KB (transformers is ~502KB)
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: {
        manualChunks: {
          'transformers': ['@huggingface/transformers'],
          'onnx': ['onnxruntime-web'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  esbuild: {
    // Strip console.log/warn in production (keep console.error)
    pure: ['console.log', 'console.warn'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5180,
  },
  test: {
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
