import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const CityGuidePage = lazy(() => import('./pages/CityGuidePage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-teal-900 to-teal-800">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
          {/* Home — city selection / discover */}
          <Route path="/" element={<HomePage />} />

          {/* City Guide — main visitor experience */}
          <Route path="/city/:slug" element={<CityGuidePage />} />
          <Route path="/city/:slug/tours" element={<CityGuidePage />} />

          {/* Favorites */}
          <Route path="/favorites" element={<FavoritesPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
