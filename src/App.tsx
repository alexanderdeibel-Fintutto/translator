import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { OfflineProvider } from '@/context/OfflineContext'
import { I18nProvider } from '@/context/I18nContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import Layout from '@/components/layout/Layout'
import TranslatorPage from '@/pages/TranslatorPage'
import InfoPage from '@/pages/InfoPage'
import LiveLandingPage from '@/pages/LiveLandingPage'
import LiveSessionPage from '@/pages/LiveSessionPage'
import SettingsPage from '@/pages/SettingsPage'
import ImpressumPage from '@/pages/ImpressumPage'
import DatenschutzPage from '@/pages/DatenschutzPage'
import PhrasebookPage from '@/pages/PhrasebookPage'
import ConversationPage from '@/pages/ConversationPage'
import CameraTranslatePage from '@/pages/CameraTranslatePage'

if (import.meta.env.DEV) {
  console.log('[Translator] Cloud TTS API Key:', import.meta.env.VITE_GOOGLE_TTS_API_KEY ? '\u2713 gesetzt' : '\u2717 fehlt')
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
                <Route path="info" element={<InfoPage />} />
                <Route path="live" element={<LiveLandingPage />} />
                <Route path="live/:code" element={<LiveSessionPage />} />
                <Route path="conversation" element={<ConversationPage />} />
                <Route path="camera" element={<CameraTranslatePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="impressum" element={<ImpressumPage />} />
                <Route path="datenschutz" element={<DatenschutzPage />} />
                <Route path="phrasebook" element={<PhrasebookPage />} />
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
