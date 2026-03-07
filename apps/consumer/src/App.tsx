/**
 * Consumer App — Fintutto Translator
 *
 * Full-featured translator for end users (Free/Pro tiers).
 * Includes: translation, conversation, camera OCR, phrasebook,
 * live sessions (speaker + listener), pricing, auth, settings.
 *
 * Excludes: admin/CRM, enterprise session management.
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { OfflineProvider } from '@/context/OfflineContext'
import { I18nProvider } from '@/context/I18nContext'
import { UserProvider } from '@/context/UserContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import Layout from '@/components/layout/Layout'
import TranslatorPage from '@/pages/TranslatorPage'
import { trackPageView } from '@/lib/analytics'

// Lazy-loaded consumer routes
const LiveLandingPage = lazy(() => import('@/pages/LiveLandingPage'))
const LiveSessionPage = lazy(() => import('@/pages/LiveSessionPage'))
const ConversationPage = lazy(() => import('@/pages/ConversationPage'))
const CameraTranslatePage = lazy(() => import('@/pages/CameraTranslatePage'))
const PhrasebookPage = lazy(() => import('@/pages/PhrasebookPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const PricingPageRoute = lazy(() => import('@/pages/PricingPageRoute'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const AccountPage = lazy(() => import('@/pages/AccountPage'))
const SalesLandingPage = lazy(() => import('@/pages/SalesLandingPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const HistoryPage = lazy(() => import('@/pages/HistoryPage'))
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'))
const CompetitorPage = lazy(() => import('@/pages/CompetitorPage'))
const TechnologyPage = lazy(() => import('@/pages/TechnologyPage'))
const InfoPage = lazy(() => import('@/pages/InfoPage'))
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage'))
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage'))
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
                  <Route index element={<TranslatorPage />} />
                  <Route path="info" element={<Suspense fallback={<PageLoader />}><InfoPage /></Suspense>} />
                  <Route path="live" element={<Suspense fallback={<PageLoader />}><LiveLandingPage /></Suspense>} />
                  <Route path="live/:code" element={<Suspense fallback={<PageLoader />}><LiveSessionPage /></Suspense>} />
                  <Route path="conversation" element={<Suspense fallback={<PageLoader />}><ConversationPage /></Suspense>} />
                  <Route path="camera" element={<Suspense fallback={<PageLoader />}><CameraTranslatePage /></Suspense>} />
                  <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
                  <Route path="pricing" element={<Suspense fallback={<PageLoader />}><PricingPageRoute /></Suspense>} />
                  <Route path="auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
                  <Route path="account" element={<Suspense fallback={<PageLoader />}><AccountPage /></Suspense>} />
                  <Route path="sales/:segment" element={<Suspense fallback={<PageLoader />}><SalesLandingPage /></Suspense>} />
                  <Route path="technology" element={<Suspense fallback={<PageLoader />}><TechnologyPage /></Suspense>} />
                  <Route path="features" element={<Suspense fallback={<PageLoader />}><FeaturesPage /></Suspense>} />
                  <Route path="compare" element={<Suspense fallback={<PageLoader />}><CompetitorPage /></Suspense>} />
                  <Route path="impressum" element={<Suspense fallback={<PageLoader />}><ImpressumPage /></Suspense>} />
                  <Route path="datenschutz" element={<Suspense fallback={<PageLoader />}><DatenschutzPage /></Suspense>} />
                  <Route path="phrasebook" element={<Suspense fallback={<PageLoader />}><PhrasebookPage /></Suspense>} />
                  <Route path="favorites" element={<Suspense fallback={<PageLoader />}><FavoritesPage /></Suspense>} />
                  <Route path="history" element={<Suspense fallback={<PageLoader />}><HistoryPage /></Suspense>} />
                  <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
                </Route>
              </Routes>
              <Toaster position="top-right" richColors />
              <PWAInstallBanner />
            </BrowserRouter>
          </UserProvider>
        </OfflineProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}

export default App
