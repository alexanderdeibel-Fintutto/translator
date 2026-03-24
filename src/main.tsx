import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// Register service worker for PWA support.
// When a new deployment arrives, the SW updates in the background.
// We must reload the page so the user actually runs the new code.
const updateSW = registerSW({
  onNeedRefresh() {
    // New content available — reload immediately so users get latest fixes.
    // Without this, the old cached JS keeps running indefinitely.
    updateSW(true)
  },
  onOfflineReady() {
    // noop — offline readiness is silent
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
