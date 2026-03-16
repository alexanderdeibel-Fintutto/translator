/**
 * School Teacher App — School Translator (Lehrer)
 *
 * Classroom speaker app for teachers. Based on Enterprise app
 * but with school-specific branding and simplified navigation.
 *
 * Features:
 * - Quick session activation (main screen, classroom-focused)
 * - Live session as speaker (teacher speaks, students read)
 * - Conversation mode (1:1 parent-teacher meetings)
 * - Session management
 *
 * Excludes: camera OCR, phrasebook, pricing, sales.
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
import SchoolTeacherHomePage from './pages/SchoolTeacherHomePage'
import ClassroomQRPage from './pages/ClassroomQRPage'
const ParentLetterPage = lazy(() => import('./pages/ParentLetterPage'))

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
                  {/* Main: Classroom session activation */}
                  <Route index element={<SchoolTeacherHomePage />} />
                  <Route path="classroom-qr" element={<ClassroomQRPage />} />
                  <Route path="parent-letter" element={<Suspense fallback={<PageLoader />}><ParentLetterPage /></Suspense>} />

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
