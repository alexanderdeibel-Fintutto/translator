/**
 * Medical Staff App — Medical Translator (Personal)
 *
 * Speaker app for doctors, nurses, pharmacists, paramedics.
 * Core differentiator: Medical phrase catalog, pain scale, privacy-first.
 *
 * Features:
 * - Conversation mode (1:1 bidirectional with patient)
 * - Medical phrase catalog (triage, symptoms, instructions)
 * - Visual pain scale (emoji-based, no words needed)
 * - Live session for ward rounds / group briefings
 * - Privacy banner (DSGVO/medical data notice)
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
import MedicalStaffHomePage from './pages/MedicalStaffHomePage'

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
                  <Route index element={<MedicalStaffHomePage />} />

                  {/* Core translation */}
                  <Route path="translator" element={<Suspense fallback={<PageLoader />}><TranslatorPage /></Suspense>} />
                  <Route path="conversation" element={<Suspense fallback={<PageLoader />}><ConversationPage /></Suspense>} />
                  <Route path="history" element={<Suspense fallback={<PageLoader />}><HistoryPage /></Suspense>} />

                  {/* Live sessions */}
                  <Route path="live" element={<Suspense fallback={<PageLoader />}><LiveLandingPage /></Suspense>} />
                  <Route path="live/:code" element={<Suspense fallback={<PageLoader />}><LiveSessionPage /></Suspense>} />

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
