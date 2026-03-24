/**
 * Landing App — fintutto.world
 *
 * Product landing page for the Fintutto World platform.
 * Showcases all products, features, pricing segments, investor relations,
 * news, team, roadmap, competition, and legal pages.
 *
 * This app is purely informational — no translation functionality.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Loader2 } from 'lucide-react'
import LandingLayout from './components/LandingLayout'
import LandingHomePage from './pages/LandingHomePage'

// Lazy-loaded routes — App detail pages
const AppConsumerPage = lazy(() => import('./pages/AppConsumerPage'))
const AppListenerPage = lazy(() => import('./pages/AppListenerPage'))
const AppEnterprisePage = lazy(() => import('./pages/AppEnterprisePage'))

// Solution pages (market-specific landing pages)
const SolutionSchoolsPage = lazy(() => import('./pages/SolutionSchoolsPage'))
const SolutionAuthoritiesPage = lazy(() => import('./pages/SolutionAuthoritiesPage'))
const SolutionNgoPage = lazy(() => import('./pages/SolutionNgoPage'))
const SolutionHospitalityPage = lazy(() => import('./pages/SolutionHospitalityPage'))
const SolutionMedicalPage = lazy(() => import('./pages/SolutionMedicalPage'))
const SolutionEventsPage = lazy(() => import('./pages/SolutionEventsPage'))
const SolutionTourGuidesPage = lazy(() => import('./pages/SolutionTourGuidesPage'))
const SolutionAgenciesPage = lazy(() => import('./pages/SolutionAgenciesPage'))

// Product pages (Guide ecosystem)
const ArtGuidePage = lazy(() => import('./pages/ArtGuidePage'))
const CityGuidePage = lazy(() => import('./pages/CityGuidePage'))
const RegionGuidePage = lazy(() => import('./pages/RegionGuidePage'))

// Info pages
const PricingPage = lazy(() => import('./pages/PricingPage'))
const CompetitionPage = lazy(() => import('./pages/CompetitionPage'))
const MarketSizePage = lazy(() => import('./pages/MarketSizePage'))
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
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

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<LandingHomePage />} />

          {/* App detail pages */}
          <Route path="apps/translator" element={<S><AppConsumerPage /></S>} />
          <Route path="apps/live" element={<S><AppListenerPage /></S>} />
          <Route path="apps/enterprise" element={<S><AppEnterprisePage /></S>} />

          {/* Solution pages (market segments) */}
          <Route path="solutions/schools" element={<S><SolutionSchoolsPage /></S>} />
          <Route path="solutions/authorities" element={<S><SolutionAuthoritiesPage /></S>} />
          <Route path="solutions/ngo" element={<S><SolutionNgoPage /></S>} />
          <Route path="solutions/hospitality" element={<S><SolutionHospitalityPage /></S>} />
          <Route path="solutions/medical" element={<S><SolutionMedicalPage /></S>} />
          <Route path="solutions/events" element={<S><SolutionEventsPage /></S>} />
          <Route path="solutions/tourguides" element={<S><SolutionTourGuidesPage /></S>} />
          <Route path="solutions/agencies" element={<S><SolutionAgenciesPage /></S>} />

          {/* Product pages (Guide ecosystem) */}
          <Route path="products/artguide" element={<S><ArtGuidePage /></S>} />
          <Route path="products/cityguide" element={<S><CityGuidePage /></S>} />
          <Route path="products/regionguide" element={<S><RegionGuidePage /></S>} />

          {/* Info pages */}
          <Route path="pricing" element={<S><PricingPage /></S>} />
          <Route path="competition" element={<S><CompetitionPage /></S>} />
          <Route path="market" element={<S><MarketSizePage /></S>} />
          <Route path="roadmap" element={<S><RoadmapPage /></S>} />
          <Route path="team" element={<S><TeamPage /></S>} />
          <Route path="contact" element={<S><ContactPage /></S>} />

          {/* Shared pages */}
          <Route path="features" element={<S><FeaturesPage /></S>} />
          <Route path="technology" element={<S><TechnologyPage /></S>} />
          <Route path="investors" element={<S><InvestorPage /></S>} />
          <Route path="news" element={<S><NewsPage /></S>} />

          {/* Legal */}
          <Route path="impressum" element={<S><ImpressumPage /></S>} />
          <Route path="datenschutz" element={<S><DatenschutzPage /></S>} />

          {/* 404 */}
          <Route path="*" element={<S><NotFoundPage /></S>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
