/**
 * Shared Vite configuration factory for all app variants.
 *
 * Each app in apps/ calls createAppViteConfig() with its variant name.
 * The factory sets up:
 * - React + SWC plugin
 * - PWA with variant-specific manifest
 * - Path alias @/ → shared src/
 * - Common build optimizations (chunk splitting, console stripping)
 * - Workbox runtime caching for translation APIs, models, fonts
 */

import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { appConfigs, type AppVariant } from './app.config'

export function createAppViteConfig(variant: AppVariant, appDir: string): UserConfig {
  const config = appConfigs[variant]
  const rootDir = path.resolve(appDir, '../..')

  return defineConfig({
    root: appDir,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', `icons/${config.iconDir}/*`],
        manifest: {
          name: config.appName,
          short_name: config.shortName,
          description: config.description,
          theme_color: config.themeColor,
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'any',
          scope: '/',
          start_url: config.startUrl,
          categories: ['utilities', 'education', 'productivity'],
          lang: 'de',
          dir: 'ltr',
          icons: [
            {
              src: `/icons/${config.iconDir}/icon.svg`,
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: `/icons/${config.iconDir}/icon-192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `/icons/${config.iconDir}/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `/icons/${config.iconDir}/icon-maskable-192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: `/icons/${config.iconDir}/icon-maskable-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          globIgnores: ['**/*.wasm'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.mymemory\.translated\.net/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'translation-cache',
                expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
            {
              urlPattern: /^https:\/\/translation\.googleapis\.com/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-translate-cache',
                expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
            {
              urlPattern: /^https:\/\/texttospeech\.googleapis\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'tts-audio-cache',
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            // HuggingFace model files: NO runtimeCaching entry.
            // Transformers.js manages its own cache ('transformers-cache').
            // Any SW interception (even NetworkOnly) can cause "Failed to fetch"
            // on mobile browsers with large 35MB+ model files.
            // By omitting these URLs, the SW ignores them entirely.
            {
              urlPattern: /\.wasm$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'wasm-runtime',
                expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
      }),
    ],
    build: {
      outDir: path.resolve(appDir, 'dist'),
      chunkSizeWarningLimit: 550,
      rollupOptions: {
        output: {
          manualChunks: {
            transformers: ['@huggingface/transformers'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
    esbuild: {
      pure: ['console.log', 'console.warn'],
    },
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src'),
      },
    },
    server: {
      port: config.devPort,
      // Allow Vite dev server to serve files from root src/ and public/
      fs: {
        allow: [rootDir],
      },
    },
    // Use root-level PostCSS config (tailwind)
    css: {
      postcss: rootDir,
    },
    // Public assets from root
    publicDir: path.resolve(rootDir, 'public'),
  }) as UserConfig
}
