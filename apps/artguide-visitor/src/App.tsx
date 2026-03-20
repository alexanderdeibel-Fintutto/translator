import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Lazy-loaded pages for code splitting
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'))
const MuseumPage = lazy(() => import('./pages/MuseumPage'))
const ArtworkPage = lazy(() => import('./pages/ArtworkPage'))
const ScanPage = lazy(() => import('./pages/ScanPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))

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

          {/* Museum detail */}
          <Route path="/museum/:museumSlug" element={<MuseumPage />} />
          <Route path="/museum/:museumSlug/tour/:tourId" element={<MuseumPage />} />

          {/* Artwork detail */}
          <Route path="/artwork/:artworkId" element={<ArtworkPage />} />

          {/* QR code deep link */}
          <Route path="/qr/:code" element={<ArtworkPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
