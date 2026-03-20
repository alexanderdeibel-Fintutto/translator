import React from 'react'
import { Link, useParams } from 'react-router-dom'

export default function PartnerDetailPage() {
  const { partnerId } = useParams()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold truncate">Partner #{partnerId?.slice(0, 8)}</h1>
      </header>

      {/* Partner Hero */}
      <div className="mx-6 rounded-2xl bg-white/10 overflow-hidden mb-6">
        <div className="h-48 bg-gradient-to-br from-amber-900/30 to-indigo-800/30 flex items-center justify-center">
          <span className="text-6xl">🏪</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold">Partner laden...</h2>
            <span className="px-2 py-0.5 rounded-full text-xs bg-green-400/20 text-green-300">Verifiziert</span>
          </div>
          <p className="text-sm text-white/50">Restaurant / Kategorie</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-white/50">
            <span>📍 Adresse laden...</span>
            <span>⭐ —</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-4 gap-3">
          <button className="flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/15 transition">
            <span className="text-xl mb-1">📞</span>
            <span className="text-xs text-white/70">Anrufen</span>
          </button>
          <button className="flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/15 transition">
            <span className="text-xl mb-1">🗺</span>
            <span className="text-xs text-white/70">Route</span>
          </button>
          <button className="flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/15 transition">
            <span className="text-xl mb-1">🌐</span>
            <span className="text-xs text-white/70">Website</span>
          </button>
          <button className="flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/15 transition">
            <span className="text-xl mb-1">❤</span>
            <span className="text-xs text-white/70">Merken</span>
          </button>
        </div>
      </div>

      {/* Description */}
      <section className="px-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
        <p className="text-white/70 text-sm">Beschreibung wird geladen...</p>
      </section>

      {/* Opening Hours */}
      <section className="px-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Oeffnungszeiten</h3>
        <div className="rounded-xl bg-white/10 p-4">
          <p className="text-white/50 text-sm">Oeffnungszeiten werden geladen...</p>
        </div>
      </section>

      {/* Offers */}
      <section className="px-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Angebote</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/10 text-center">
            <p className="text-white/50 text-sm">Keine aktiven Angebote</p>
          </div>
        </div>
      </section>

      {/* Book Button */}
      <div className="px-6 pb-24">
        <Link
          to={`/partner/${partnerId}/book`}
          className="block w-full py-4 rounded-xl bg-amber-400 text-indigo-950 font-semibold text-center text-lg"
        >
          Jetzt buchen
        </Link>
      </div>
    </div>
  )
}
