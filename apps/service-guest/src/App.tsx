/**
 * Service Guest App — Counter Translator (Gast)
 *
 * Ultra-minimal receiver for guests at hotels, retail, trade fairs.
 * Flow: Enter code (or scan QR at counter) -> Choose language -> Read translations.
 * After session: Optional feedback (1-5 stars).
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
import ServiceGuestJoinPage from './pages/ServiceGuestJoinPage'
import GuestFeedbackPage from './pages/GuestFeedbackPage'

const ListenerSessionPage = lazy(() => import('@/pages/ListenerSessionPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <I18nProvider>
          <OfflineProvider>
            <UserProvider>
              <BrowserRouter>
                <Routes>
                  <Route index element={<ServiceGuestJoinPage />} />
                  <Route path="/feedback/:sessionId" element={<GuestFeedbackPage />} />
                  <Route path="/feedback" element={<GuestFeedbackPage />} />
                  <Route
                    path="/:code"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <ListenerSessionPage />
                      </Suspense>
                    }
                  />
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
