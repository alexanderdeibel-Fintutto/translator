/**
 * Authority Visitor App — AmtTranslator (Besucher)
 *
 * Primär: Bidirektionale Standalone-Übersetzung auf dem eigenen Smartphone.
 * Besucher kann sprechen UND hören — kein zweites Gerät nötig.
 *
 * Routen:
 *   /           → Sprachauswahl + bidirektionale Übersetzung (standalone)
 *   /:code      → Bidirektionale Übersetzung mit Session-Code (verbunden mit Tablett)
 *   /listen/:code → Legacy: Nur-Empfangen-Modus (ListenerView)
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
import VisitorBidirectionalPage from './pages/VisitorBidirectionalPage'

// Legacy: Nur-Empfangen-Modus (für Broadcasting/Gruppenveranstaltungen)
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
                  {/* Primär: Bidirektionale Standalone-Übersetzung */}
                  <Route index element={<VisitorBidirectionalPage />} />

                  {/* Mit Session-Code: verbunden mit Amtstablett */}
                  <Route path="/:code" element={<VisitorBidirectionalPage />} />

                  {/* Legacy: Nur-Empfangen-Modus (Broadcasting/Gruppenveranstaltungen) */}
                  <Route
                    path="/listen/:code"
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
