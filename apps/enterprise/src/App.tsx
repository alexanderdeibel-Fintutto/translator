/**
 * Enterprise App — Fintutto Enterprise
 *
 * Session management console for guides, speakers, and event technicians.
 * Optimized for one primary use case: activate/manage live translation sessions.
 *
 * Features:
 * - Quick session activation (main screen)
 * - Session creation and management
 * - Participant management
 * - Pre-translation uploads
 * - Live session as speaker
 * - Organization/team management
 *
 * Excludes: consumer features (phrasebook, camera OCR, pricing pages, sales).
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
import EnterpriseHomePage from './pages/EnterpriseHomePage'

// Lazy-loaded enterprise routes
const LiveLandingPage = lazy(() => import('@/pages/LiveLandingPage'))
const LiveSessionPage = lazy(() => import('@/pages/LiveSessionPage'))
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
                  {/* Main: Quick session activation */}
                  <Route index element={<EnterpriseHomePage />} />

                  {/* Live session management */}
                  <Route path="live" element={<Suspense fallback={<PageLoader />}><LiveLandingPage /></Suspense>} />
                  <Route path="live/:code" element={<Suspense fallback={<PageLoader />}><LiveSessionPage /></Suspense>} />

                  {/* Session & participant admin */}
                  <Route path="admin/*" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />

                  {/* Auth & account */}
                  <Route path="auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
                  <Route path="account" element={<Suspense fallback={<PageLoader />}><AccountPage /></Suspense>} />
                  <Route path="account/admin/*" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
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
