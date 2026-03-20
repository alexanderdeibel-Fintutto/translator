import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const businessTypes = [
  { id: 'all', label: 'Alle', icon: '🏪' },
  { id: 'restaurant', label: 'Restaurants', icon: '🍽' },
  { id: 'hotel', label: 'Hotels', icon: '🏨' },
  { id: 'cafe', label: 'Cafes', icon: '☕' },
  { id: 'shop', label: 'Shops', icon: '🛍' },
  { id: 'bar', label: 'Bars', icon: '🍸' },
  { id: 'wellness', label: 'Wellness', icon: '💆' },
  { id: 'sport', label: 'Sport', icon: '⚽' },
  { id: 'tour_operator', label: 'Touren', icon: '🚌' },
]

export default function PartnerDirectoryPage() {
  const { citySlug, regionSlug } = useParams()
  const [activeType, setActiveType] = useState('all')
  const scope = citySlug ? 'city' : 'region'
  const slug = citySlug || regionSlug

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Link to={`/${scope}/${slug}`} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Partner & Anbieter</h1>
            <p className="text-white/50 text-sm">Lokale Betriebe entdecken</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 mb-4">
        <input
          type="search"
          placeholder="Restaurant, Cafe, Hotel suchen..."
          className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none transition"
        />
      </div>

      {/* Type Filter (horizontal scroll) */}
      <div className="px-6 mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {businessTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeType === type.id
                  ? 'bg-amber-400 text-indigo-950'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Partner List */}
      <section className="px-6 pb-24">
        <div className="space-y-3">
          {/* Empty State */}
          <div className="text-center py-12">
            <span className="text-5xl block mb-4">🤝</span>
            <h3 className="text-lg font-semibold mb-2">Partner werden geladen...</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto">
              Hier findest du bald alle lokalen Betriebe — Restaurants, Hotels, Shops und mehr.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur border-t border-white/10 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className="flex flex-col items-center text-white/50">
            <span className="text-lg">🏠</span>
            <span className="text-xs mt-1">Start</span>
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
