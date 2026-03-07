/**
 * Landing App — translator.fintutto.de
 *
 * Product landing page for the Fintutto Translator platform.
 * Showcases all 3 apps, features, pricing segments, investor relations,
 * news, and legal pages.
 *
 * This app is purely informational — no translation functionality.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import LandingLayout from './components/LandingLayout'
import LandingHomePage from './pages/LandingHomePage'

// Lazy-loaded routes
const AppConsumerPage = lazy(() => import('./pages/AppConsumerPage'))
const AppListenerPage = lazy(() => import('./pages/AppListenerPage'))
const AppEnterprisePage = lazy(() => import('./pages/AppEnterprisePage'))
const NewsPage = lazy(() => import('./pages/NewsPage'))

// Shared pages from src/
const InvestorPage = lazy(() => import('@/pages/InvestorPage'))
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'))
const TechnologyPage = lazy(() => import('@/pages/TechnologyPage'))
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<LandingHomePage />} />

          {/* App detail pages */}
          <Route path="apps/translator" element={<Suspense fallback={<PageLoader />}><AppConsumerPage /></Suspense>} />
          <Route path="apps/live" element={<Suspense fallback={<PageLoader />}><AppListenerPage /></Suspense>} />
          <Route path="apps/enterprise" element={<Suspense fallback={<PageLoader />}><AppEnterprisePage /></Suspense>} />

          {/* Shared pages */}
          <Route path="features" element={<Suspense fallback={<PageLoader />}><FeaturesPage /></Suspense>} />
          <Route path="technology" element={<Suspense fallback={<PageLoader />}><TechnologyPage /></Suspense>} />
          <Route path="investors" element={<Suspense fallback={<PageLoader />}><InvestorPage /></Suspense>} />
          <Route path="news" element={<Suspense fallback={<PageLoader />}><NewsPage /></Suspense>} />

          {/* Legal */}
          <Route path="impressum" element={<Suspense fallback={<PageLoader />}><ImpressumPage /></Suspense>} />
          <Route path="datenschutz" element={<Suspense fallback={<PageLoader />}><DatenschutzPage /></Suspense>} />

          {/* 404 */}
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
