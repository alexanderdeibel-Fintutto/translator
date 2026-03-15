/**
 * School Student App — School Translator (Schueler)
 *
 * Ultra-minimal receiver app for students in the classroom.
 * Flow: Enter session code (or scan QR) → Choose language → Read along.
 *
 * Only 2 screens:
 * 1. Join screen (session code + language selection, school-branded)
 * 2. Live session view (listener mode only)
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { OfflineProvider } from '@/context/OfflineContext'
import { I18nProvider } from '@/context/I18nContext'
import { UserProvider } from '@/context/UserContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import SchoolStudentJoinPage from './pages/SchoolStudentJoinPage'
import ListenerSessionPage from './pages/ListenerSessionPage'

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <OfflineProvider>
          <UserProvider>
            <BrowserRouter>
              <Routes>
                <Route index element={<SchoolStudentJoinPage />} />
                <Route path="/:code" element={<ListenerSessionPage />} />
              </Routes>
              <Toaster position="top-center" richColors />
            </BrowserRouter>
          </UserProvider>
        </OfflineProvider>
      </I18nProvider>
    </ErrorBoundary>
  )
}

export default App
