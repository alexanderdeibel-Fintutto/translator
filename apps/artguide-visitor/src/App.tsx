import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Lazy-loaded pages for code splitting
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'))
const MuseumPage = lazy(() => import('./pages/MuseumPage'))
const ArtworkPage = lazy(() => import('./pages/ArtworkPage'))
const ScanPage = lazy(() => import('./pages/ScanPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))

// City & Region Guide
const CityGuidePage = lazy(() => import('./pages/CityGuidePage'))
const RegionGuidePage = lazy(() => import('./pages/RegionGuidePage'))

// Partners, Offers, Bookings
const PartnerDirectoryPage = lazy(() => import('./pages/PartnerDirectoryPage'))
const PartnerDetailPage = lazy(() => import('./pages/PartnerDetailPage'))
const OfferDetailPage = lazy(() => import('./pages/OfferDetailPage'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Laden...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Onboarding (first launch) */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Main tabs */}
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Museum / Art Guide */}
          <Route path="/museum/:museumSlug" element={<MuseumPage />} />
          <Route path="/museum/:museumSlug/tour/:tourId" element={<MuseumPage />} />
          <Route path="/artwork/:artworkId" element={<ArtworkPage />} />
          <Route path="/qr/:code" element={<ArtworkPage />} />

          {/* City Guide */}
          <Route path="/city/:citySlug" element={<CityGuidePage />} />
          <Route path="/city/:citySlug/tours" element={<CityGuidePage />} />
          <Route path="/city/:citySlug/partners" element={<PartnerDirectoryPage />} />
          <Route path="/city/:citySlug/offers" element={<CityGuidePage />} />

          {/* Region Guide */}
          <Route path="/region/:regionSlug" element={<RegionGuidePage />} />
          <Route path="/region/:regionSlug/partners" element={<PartnerDirectoryPage />} />
          <Route path="/region/:regionSlug/offers" element={<RegionGuidePage />} />

          {/* Partners */}
          <Route path="/partner/:partnerId" element={<PartnerDetailPage />} />
          <Route path="/partner/:partnerId/book" element={<BookingPage />} />

          {/* Offers */}
          <Route path="/offer/:offerId" element={<OfferDetailPage />} />
          <Route path="/offer/:offerId/book" element={<BookingPage />} />

          {/* Bookings */}
          <Route path="/bookings" element={<MyBookingsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
