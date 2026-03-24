import React from 'react'
import { useParams, Link } from 'react-router-dom'

/**
 * Museum Page — Overview of a specific museum.
 *
 * Sections:
 * - Hero with museum image + info
 * - Interactive floorplan / map (Mapbox for outdoor)
 * - Available tours
 * - Highlighted artworks
 * - Current room detection (BLE/WiFi/GPS)
 * - Start audio guide button
 */
export default function MuseumPage() {
  const { museumSlug, tourId } = useParams()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Back button */}
      <header className="px-6 pt-12 pb-4 flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold truncate">{museumSlug}</h1>
      </header>

      {/* Museum Hero */}
      <div className="mx-6 rounded-2xl bg-white/10 overflow-hidden mb-6">
        <div className="h-48 bg-gradient-to-br from-amber-900/30 to-indigo-800/30 flex items-center justify-center">
          <span className="text-6xl">🏛</span>
        </div>
        <div className="p-4">
          <h2 className="text-lg font-semibold">Museum laden...</h2>
          <p className="text-sm text-white/50 mt-1">Daten werden abgerufen</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center gap-2 p-4 rounded-xl bg-amber-400 text-indigo-950 font-semibold">
            <span>🎧</span> Audio starten
          </button>
          <button className="flex items-center gap-2 p-4 rounded-xl bg-white/10">
            <span>🗺</span> Karte/Grundriss
          </button>
        </div>
      </div>

      {/* Tours Section */}
      <section className="px-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Fuehrungen</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-medium">Fuehrungen werden geladen...</div>
                <div className="text-sm text-white/50">Personalisiert fuer dein Profil</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="px-6 pb-24">
        <h3 className="text-lg font-semibold mb-3">Highlights</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 overflow-hidden">
            <div className="h-32 bg-white/5 flex items-center justify-center">
              <span className="text-3xl">🖼</span>
            </div>
            <div className="p-3">
              <div className="text-sm font-medium truncate">Wird geladen...</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
