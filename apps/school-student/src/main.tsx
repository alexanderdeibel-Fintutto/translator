import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import '@/index.css'

registerSW({
  onNeedRefresh() {},
  onOfflineReady() {
    console.log('[PWA] School Translator (Student) ready for offline use')
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
