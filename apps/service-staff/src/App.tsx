/**
 * Service Staff App — Service Translator (Mitarbeiter)
 *
 * Speaker app for retail counters, trade fair booths, public service desks, etc.
 * Core differentiator: Bidirectional conversation mode (both sides speak).
 *
 * Features:
 * - Conversation mode (1:1 bidirectional with guest)
 * - Quick session start for walk-in guests
 * - Live session as speaker
 * - Text translator for documents
 * - QR code generator for guests
 * - Counter statistics dashboard
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { OfflineProvider } from '@/context/OfflineContext'
import { I18nProvider } from '@/context/I18nContext'
import { UserProvider } from '@/context/UserContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/components/layout/Layout'
import { trackPageView } from '@/lib/analytics'
import ServiceStaffHomePage from './pages/ServiceStaffHomePage'
import CounterQRPage from './pages/CounterQRPage'
import CounterStatsPage from './pages/CounterStatsPage'

// Lazy-loaded routes
const LiveLandingPage = lazy(() => import('@/pages/LiveLandingPage'))
const LiveSessionPage = lazy(() => import('@/pages/LiveSessionPage'))
const ConversationPage = lazy(() => import('@/pages/ConversationPage'))
const TranslatorPage = lazy(() => import('@/pages/TranslatorPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function RouteTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
  return null
}

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <OfflineProvider>
          <UserProvider>
            <BrowserRouter>
              <RouteTracker />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<ServiceStaffHomePage />} />

                  {/* Core translation */}
                  <Route path="translator" element={<Suspense fallback={<PageLoader />}><TranslatorPage /></Suspense>} />
                  <Route path="conversation" element={<Suspense fallback={<PageLoader />}><ConversationPage /></Suspense>} />
                  <Route path="history" element={<Suspense fallback={<PageLoader />}><HistoryPage /></Suspense>} />

                  {/* Live sessions */}
                  <Route path="live" element={<Suspense fallback={<PageLoader />}><LiveLandingPage /></Suspense>} />
                  <Route path="live/:code" element={<Suspense fallback={<PageLoader />}><LiveSessionPage /></Suspense>} />

                  {/* Counter-specific */}
                  <Route path="qr" element={<CounterQRPage />} />
                  <Route path="stats" element={<CounterStatsPage />} />

                  {/* Admin */}
                  <Route path="admin/*" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />

                  {/* Auth & account */}
                  <Route path="auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
                  <Route path="account" element={<Suspense fallback={<PageLoader />}><AccountPage /></Suspense>} />
                  <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />

                  <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
                </Route>
              </Routes>
              <Toaster position="top-right" richColors />
            </BrowserRouter>
          </UserProvider>
        </OfflineProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}

export default App
