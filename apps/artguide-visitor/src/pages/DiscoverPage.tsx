import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Discover Page — Main landing screen for the Art Guide visitor app.
 * Shows nearby museums, search, and quick actions.
 *
 * Features:
 * - Map view (Mapbox) with nearby museums
 * - List view with search/filter
 * - Current location-based suggestions
 * - Recent visits
 * - Favorites
 */
export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Entdecken</h1>
        <p className="text-white/60 mt-1">Museen und Ausstellungen in deiner Naehe</p>
      </header>

      {/* Search bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <input
            type="search"
            placeholder="Museum suchen..."
            className="w-full px-4 py-3 pl-10 rounded-xl bg-white/10 text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none transition"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/scan"
            className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition"
          >
            <span className="text-2xl mb-1">📷</span>
            <span className="text-xs text-white/70">QR scannen</span>
          </Link>
          <button className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition">
            <span className="text-2xl mb-1">📍</span>
            <span className="text-xs text-white/70">In der Naehe</span>
          </button>
          <Link
            to="/profile"
            className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition"
          >
            <span className="text-2xl mb-1">👤</span>
            <span className="text-xs text-white/70">Mein Profil</span>
          </Link>
        </div>
      </div>

      {/* Museum List Placeholder */}
      <section className="px-6">
        <h2 className="text-lg font-semibold mb-4">Empfohlen fuer dich</h2>
        <div className="space-y-4">
          {/* Placeholder cards — will be replaced with real data */}
          <div className="rounded-xl bg-white/10 overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-amber-900/30 to-indigo-800/30 flex items-center justify-center">
              <span className="text-4xl">🏛</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold">Museum wird geladen...</h3>
              <p className="text-sm text-white/50 mt-1">Verbinde mit Art Guide Service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur border-t border-white/10 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className="flex flex-col items-center text-amber-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Entdecken</span>
          </Link>
          <Link to="/scan" className="flex flex-col items-center text-white/50">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className="text-xs mt-1">Scannen</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-white/50">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
