import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { OfflineProvider } from '@/context/OfflineContext'
import { I18nProvider } from '@/context/I18nContext'
import Layout from '@/components/layout/Layout'
import TranslatorPage from '@/pages/TranslatorPage'

// Lazy-load pages that aren't needed on initial load
const InfoPage = lazy(() => import('@/pages/InfoPage'))
const LiveLandingPage = lazy(() => import('@/pages/LiveLandingPage'))
const LiveSessionPage = lazy(() => import('@/pages/LiveSessionPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage'))
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage'))
const PhrasebookPage = lazy(() => import('@/pages/PhrasebookPage'))

if (import.meta.env.DEV) {
  console.log('[Translator] Cloud TTS API Key:', import.meta.env.VITE_GOOGLE_TTS_API_KEY ? '\u2713 gesetzt' : '\u2717 fehlt')
}

function PageFallback() {
  return <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">Laden...</div>
}

function App() {
  return (
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
  )
}

export default App
