import { lazy, Suspense } from 'react'
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
 claude/add-new-languages-G9HsJ

// Lazy-load pages that aren't needed on initial load

import { hasGoogleApiKey } from '@/lib/api-key'

// Lazy-loaded routes for code splitting
 main
const InfoPage = lazy(() => import('@/pages/InfoPage'))
const LiveLandingPage = lazy(() => import('@/pages/LiveLandingPage'))
const LiveSessionPage = lazy(() => import('@/pages/LiveSessionPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage'))
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage'))
const PhrasebookPage = lazy(() => import('@/pages/PhrasebookPage'))
 claude/add-new-languages-G9HsJ

const ConversationPage = lazy(() => import('@/pages/ConversationPage'))
const CameraTranslatePage = lazy(() => import('@/pages/CameraTranslatePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
 main

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

function PageFallback() {
  return <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">Laden...</div>
}

function App() {
  return (
 claude/add-new-languages-G9HsJ
    <I18nProvider>
      <OfflineProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<TranslatorPage />} />
              <Route path="info" element={<Suspense fallback={<PageFallback />}><InfoPage /></Suspense>} />
              <Route path="live" element={<Suspense fallback={<PageFallback />}><LiveLandingPage /></Suspense>} />
              <Route path="live/:code" element={<Suspense fallback={<PageFallback />}><LiveSessionPage /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>} />
              <Route path="impressum" element={<Suspense fallback={<PageFallback />}><ImpressumPage /></Suspense>} />
              <Route path="datenschutz" element={<Suspense fallback={<PageFallback />}><DatenschutzPage /></Suspense>} />
              <Route path="phrasebook" element={<Suspense fallback={<PageFallback />}><PhrasebookPage /></Suspense>} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </OfflineProvider>
    </I18nProvider>

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
 main
  )
}

export default App
