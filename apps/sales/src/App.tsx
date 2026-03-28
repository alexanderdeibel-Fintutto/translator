/**
 * Sales App — Fintutto Sales & ROI Calculator
 *
 * Standalone sales landing page with segment-specific content and ROI calculator.
 * Routes:
 *   /                  → Segment overview (all solutions)
 *   /:segment          → Segment-specific landing (school, authority, medical, hotel, cruise, event, conference, ngo, guide, agency, personal)
 *   /contact           → Lead registration / contact form
 *
 * Target: sales.fintutto.world
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import ErrorBoundary from '@/components/ErrorBoundary'

const SalesOverviewPage = lazy(() => import('./pages/SalesOverviewPage'))
const SalesSegmentPage = lazy(() => import('@/pages/SalesLandingPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ImpressumPage = lazy(() => import('@/pages/ImpressumPage'))
const DatenschutzPage = lazy(() => import('@/pages/DatenschutzPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Overview: all segments */}
          <Route index element={<S><SalesOverviewPage /></S>} />

          {/* Segment-specific landing pages with ROI calculator */}
          <Route path="/:segment" element={<S><SalesSegmentPage /></S>} />

          {/* Support pages */}
          <Route path="/contact" element={<S><ContactPage /></S>} />
          <Route path="/impressum" element={<S><ImpressumPage /></S>} />
          <Route path="/datenschutz" element={<S><DatenschutzPage /></S>} />
          <Route path="*" element={<S><NotFoundPage /></S>} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
