import React from 'react'
import { Link, useParams } from 'react-router-dom'

export default function OfferDetailPage() {
  const { offerId } = useParams()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">Angebot</h1>
      </header>

      {/* Offer Image */}
      <div className="mx-6 rounded-2xl bg-white/10 overflow-hidden mb-6">
        <div className="h-56 bg-gradient-to-br from-amber-900/30 to-indigo-800/30 flex items-center justify-center">
          <span className="text-6xl">🎁</span>
        </div>
      </div>

      {/* Offer Info */}
      <div className="px-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">Angebot #{offerId?.slice(0, 8)}</h2>
        <p className="text-white/50 text-sm mb-4">von Partner</p>

        {/* Price */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold text-amber-400">— EUR</span>
          <span className="text-lg text-white/30 line-through">— EUR</span>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/50">Typ:</span>
            <span>—</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/50">Gueltig bis:</span>
            <span>—</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/50">Verfuegbar:</span>
            <span>—</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/50">Stornierung:</span>
            <span>Flexibel (24h vorher kostenlos)</span>
          </div>
        </div>

        {/* Description */}
        <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
        <p className="text-white/70 text-sm mb-6">Wird geladen...</p>
      </div>

      {/* Book Button */}
      <div className="px-6 pb-8">
        <Link
          to={`/offer/${offerId}/book`}
          className="block w-full py-4 rounded-xl bg-amber-400 text-indigo-950 font-semibold text-center text-lg"
        >
          Jetzt buchen
        </Link>
        <p className="text-center text-white/30 text-xs mt-3">
          Keine Provision — direkt beim Anbieter
        </p>
      </div>
    </div>
  )
}
