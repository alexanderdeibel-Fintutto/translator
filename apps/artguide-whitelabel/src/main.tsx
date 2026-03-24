import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@/index.css'

// White-label app: imports the same visitor app but with museum-specific branding
// The museum ID and branding are injected via environment variables at build time
// VITE_MUSEUM_ID, VITE_MUSEUM_BRANDING (JSON)

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {
    console.log('[PWA] White-label museum app ready for offline use')
  },
})

// Dynamic import of the visitor app with white-label context
async function bootstrap() {
  // The visitor App component is reused — branding is applied via CSS variables
  const { default: App } = await import('../../artguide-visitor/src/App')

  const museumBranding = import.meta.env.VITE_MUSEUM_BRANDING
    ? JSON.parse(import.meta.env.VITE_MUSEUM_BRANDING)
    : {}

  // Apply museum branding as CSS variables
  if (museumBranding.primaryColor) {
    document.documentElement.style.setProperty('--museum-primary', museumBranding.primaryColor)
  }
  if (museumBranding.accentColor) {
    document.documentElement.style.setProperty('--museum-accent', museumBranding.accentColor)
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

bootstrap()
