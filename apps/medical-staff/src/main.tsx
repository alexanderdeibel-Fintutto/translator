import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import '@/index.css'
import { initMonitoring } from '@/lib/monitoring'

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {
    console.log('[PWA] Medical Translator (Staff) ready for offline use')
  },
})

initMonitoring()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
