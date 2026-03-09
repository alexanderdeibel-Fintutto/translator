import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'
import { initSentry, captureError } from './lib/sentry'
import { initAnalytics, trackError } from './lib/analytics'
import { initWebVitals } from './lib/web-vitals'
import { initAdminReporter } from './lib/admin-reporter'

// --- Initialize monitoring & error tracking ---
initSentry()
initAnalytics()
initWebVitals()
initAdminReporter()

// --- Global error handlers (catch errors outside React tree) ---
window.addEventListener('error', (event) => {
  if (event.error) {
    captureError(event.error, { source: 'window.onerror' })
    trackError({
      type: 'js_error',
      message: event.error.message || 'Unknown error',
      source: event.filename || 'unknown',
      stack: event.error.stack,
    })
  }
})

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason))
  captureError(error, { source: 'unhandledrejection' })
  trackError({
    type: 'js_error',
    message: error.message || 'Unhandled promise rejection',
    source: 'unhandledrejection',
    stack: error.stack,
  })
})

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
