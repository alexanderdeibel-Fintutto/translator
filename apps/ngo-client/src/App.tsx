/**
 * NGO Client App — Refugee Translator (Klient)
 *
 * Ultra-minimal receiver app for refugees and asylum seekers.
 * Flow: Enter session code (or scan QR) → Choose language → Read along.
 *
 * Designed for users who may have limited tech literacy.
 * Large touch targets, minimal text, multilingual hints.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { OfflineProvider } from '@/context/OfflineContext'
import { I18nProvider } from '@/context/I18nContext'
import { UserProvider } from '@/context/UserContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AccessibilityProvider } from '@/components/market/AccessibilityToggle'
import NgoClientJoinPage from './pages/NgoClientJoinPage'

const ListenerSessionPage = lazy(() => import('@/pages/ListenerSessionPage'))

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
      <I18nProvider>
        <OfflineProvider>
          <UserProvider>
            <BrowserRouter>
              <Routes>
                <Route index element={<NgoClientJoinPage />} />
                <Route path="/:code" element={
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  }>
                    <ListenerSessionPage />
                  </Suspense>
                } />
              </Routes>
              <Toaster position="top-center" richColors />
            </BrowserRouter>
          </UserProvider>
        </OfflineProvider>
      </I18nProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  )
}

export default App
