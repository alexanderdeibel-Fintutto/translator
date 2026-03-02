import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { OfflineProvider } from '@/context/OfflineContext'
import { I18nProvider } from '@/context/I18nContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import Layout from '@/components/layout/Layout'
import TranslatorPage from '@/pages/TranslatorPage'
import { hasGoogleApiKey } from '@/lib/api-key'

// Lazy-loaded routes for code splitting
const InfoPage = lazy(() => import('@/pages/InfoPage'))
const LiveLandingPage = lazy(() => import('@/pages/LiveLandingPage'))
const LiveSessionPage = lazy(() => import('@/pages/LiveSessionPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage'))
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage'))
const PhrasebookPage = lazy(() => import('@/pages/PhrasebookPage'))
const ConversationPage = lazy(() => import('@/pages/ConversationPage'))
const CameraTranslatePage = lazy(() => import('@/pages/CameraTranslatePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

if (import.meta.env.DEV) {
  console.log('[Translator] Cloud API Key:', hasGoogleApiKey() ? '\u2713 set' : '\u2717 missing')
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <OfflineProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<TranslatorPage />} />
                <Route path="info" element={<Suspense fallback={<PageLoader />}><InfoPage /></Suspense>} />
                <Route path="live" element={<Suspense fallback={<PageLoader />}><LiveLandingPage /></Suspense>} />
                <Route path="live/:code" element={<Suspense fallback={<PageLoader />}><LiveSessionPage /></Suspense>} />
                <Route path="conversation" element={<Suspense fallback={<PageLoader />}><ConversationPage /></Suspense>} />
                <Route path="camera" element={<Suspense fallback={<PageLoader />}><CameraTranslatePage /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
                <Route path="impressum" element={<Suspense fallback={<PageLoader />}><ImpressumPage /></Suspense>} />
                <Route path="datenschutz" element={<Suspense fallback={<PageLoader />}><DatenschutzPage /></Suspense>} />
                <Route path="phrasebook" element={<Suspense fallback={<PageLoader />}><PhrasebookPage /></Suspense>} />
                <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
              </Route>
            </Routes>
            <Toaster position="top-right" richColors />
            <PWAInstallBanner />
          </BrowserRouter>
        </OfflineProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}

export default App
