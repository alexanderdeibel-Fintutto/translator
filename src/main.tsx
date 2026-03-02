import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'
import { initAnalytics } from './lib/analytics'
import { initSentry } from './lib/sentry'
import { initWebVitals } from './lib/web-vitals'
import { initAdminReporter } from './lib/admin-reporter'

// Initialize monitoring & analytics (order matters: Sentry first for error capture)
initSentry()
initAnalytics()
initAdminReporter()
initWebVitals()

// Register service worker for PWA support
registerSW({
  onNeedRefresh() {
    // New content available — auto-update
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work offline')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
