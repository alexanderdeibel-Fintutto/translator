/**
 * Medical Patient App — Medical Translator (Patient)
 *
 * Ultra-minimal receiver for patients in hospitals, clinics, pharmacies.
 * Flow: Enter code (or scan QR) -> Choose language -> Read doctor's translations.
 * Includes pain scale for visual communication.
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
import MedicalPatientJoinPage from './pages/MedicalPatientJoinPage'

const ListenerSessionPage = lazy(() => import('@/pages/ListenerSessionPage'))

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
      <I18nProvider>
        <OfflineProvider>
          <UserProvider>
            <BrowserRouter>
              <Routes>
                <Route index element={<MedicalPatientJoinPage />} />
                <Route path="/:code" element={
                  <Suspense fallback={
                    <div className="flex items-center justify-center min-h-screen">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  }>
                    <ListenerSessionPage />
                  </Suspense>
                } />
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
