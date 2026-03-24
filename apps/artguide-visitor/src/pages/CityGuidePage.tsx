import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const categoryTabs = [
  { id: 'all', label: 'Alle', icon: '🏙' },
  { id: 'attraction', label: 'Sights', icon: '🏛' },
  { id: 'restaurant', label: 'Essen', icon: '🍽' },
  { id: 'hotel', label: 'Hotels', icon: '🏨' },
  { id: 'shop', label: 'Shopping', icon: '🛍' },
  { id: 'culture', label: 'Kultur', icon: '🎭' },
  { id: 'nature', label: 'Natur', icon: '🌳' },
  { id: 'nightlife', label: 'Nachtleben', icon: '🌙' },
]

export default function CityGuidePage() {
  const { citySlug } = useParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const [view, setView] = useState<'list' | 'map'>('list')

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{citySlug || 'City Guide'}</h1>
            <p className="text-white/50 text-sm">Entdecke die Stadt</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 mb-4">
        <input
          type="search"
          placeholder="Orte, Restaurants, Aktivitaeten suchen..."
          className="w-full px-4 py-3 pl-10 rounded-xl bg-white/10 text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none transition"
        />
      </div>

      {/* View Toggle */}
      <div className="px-6 mb-4 flex gap-2">
        <button
          onClick={() => setView('list')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            view === 'list' ? 'bg-amber-400 text-indigo-950' : 'bg-white/10 text-white/70'
          }`}
        >
          Liste
        </button>
        <button
          onClick={() => setView('map')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            view === 'map' ? 'bg-amber-400 text-indigo-950' : 'bg-white/10 text-white/70'
          }`}
        >
          Karte
        </button>
      </div>

      {/* Category Tabs (horizontal scroll) */}
      <div className="px-6 mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categoryTabs.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-indigo-950'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Link
            to={`/city/${citySlug}/tours`}
            className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition"
          >
            <span className="text-2xl mb-1">🗺</span>
            <span className="text-xs text-white/70">Touren</span>
          </Link>
          <Link
            to={`/city/${citySlug}/partners`}
            className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition"
          >
            <span className="text-2xl mb-1">🤝</span>
            <span className="text-xs text-white/70">Partner</span>
          </Link>
          <Link
            to={`/city/${citySlug}/offers`}
            className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition"
          >
            <span className="text-2xl mb-1">🎁</span>
            <span className="text-xs text-white/70">Angebote</span>
          </Link>
        </div>
      </div>

      {view === 'list' ? (
        <>
          {/* Featured Section */}
          <section className="px-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Highlights</h2>
            <div className="space-y-3">
              <div className="rounded-xl bg-white/10 overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-amber-900/30 to-indigo-800/30 flex items-center justify-center">
                  <span className="text-4xl">🏙</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">POIs werden geladen...</h3>
                  <p className="text-sm text-white/50 mt-1">Verbinde mit City Guide Service</p>
                </div>
              </div>
            </div>
          </section>

          {/* Nearby Partners */}
          <section className="px-6 pb-24">
            <h2 className="text-lg font-semibold mb-3">Partner in deiner Naehe</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/10 text-center">
                <p className="text-white/50 text-sm">Standort aktivieren fuer Empfehlungen in der Naehe</p>
                <button className="mt-3 px-4 py-2 rounded-lg bg-amber-400 text-indigo-950 text-sm font-medium">
                  Standort aktivieren
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Map View Placeholder */
        <div className="px-6 pb-24">
          <div className="rounded-xl bg-white/5 border border-white/10 h-96 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl block mb-3">🗺</span>
              <p className="text-white/50 text-sm">Karte wird geladen...</p>
              <p className="text-white/30 text-xs mt-1">Mapbox Integration</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur border-t border-white/10 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className="flex flex-col items-center text-white/50">
            <span className="text-lg">🏠</span>
            <span className="text-xs mt-1">Start</span>
          </Link>
          <Link to={`/city/${citySlug}`} className="flex flex-col items-center text-amber-400">
            <span className="text-lg">🏙</span>
            <span className="text-xs mt-1">City Guide</span>
          </Link>
          <Link to="/scan" className="flex flex-col items-center text-white/50">
            <span className="text-lg">📷</span>
            <span className="text-xs mt-1">Scannen</span>
          </Link>
          <Link to="/bookings" className="flex flex-col items-center text-white/50">
            <span className="text-lg">📅</span>
            <span className="text-xs mt-1">Buchungen</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-white/50">
            <span className="text-lg">👤</span>
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
