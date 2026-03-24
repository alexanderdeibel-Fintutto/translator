/**
 * Listener App — Fintutto Live
 *
 * Ultra-minimal receiver app for live translation sessions.
 * Flow: Enter session code (or scan QR) → Choose language → Listen.
 *
 * Only 2 screens:
 * 1. Join screen (session code input + language selection)
 * 2. Live session view (listener mode only)
 *
 * White-label ready: branding configurable via environment variables.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { OfflineProvider } from '@/context/OfflineContext'
import { I18nProvider } from '@/context/I18nContext'
import { UserProvider } from '@/context/UserContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import ListenerJoinPage from './pages/ListenerJoinPage'
import ListenerSessionPage from '@/pages/ListenerSessionPage'

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <OfflineProvider>
          <UserProvider>
            <BrowserRouter>
              <Routes>
                <Route index element={<ListenerJoinPage />} />
                <Route path="/:code" element={<ListenerSessionPage />} />
              </Routes>
              <Toaster position="top-center" richColors />
            </BrowserRouter>
          </UserProvider>
        </OfflineProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}

export default App
