import React from 'react'
import { Link, useParams } from 'react-router-dom'

export default function RegionGuidePage() {
  const { regionSlug } = useParams()

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
            <h1 className="text-xl font-bold">{regionSlug || 'Region Guide'}</h1>
            <p className="text-white/50 text-sm">Entdecke die Region</p>
          </div>
        </div>
      </header>

      {/* Region Map */}
      <div className="px-6 mb-6">
        <div className="rounded-xl bg-white/5 border border-white/10 h-48 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl block mb-2">🌄</span>
            <p className="text-white/50 text-sm">Regionskarte wird geladen...</p>
          </div>
        </div>
      </div>

      {/* Cities in this Region */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Staedte in der Region</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/10 text-center">
            <p className="text-white/50 text-sm">Staedte werden geladen...</p>
          </div>
        </div>
      </section>

      {/* Regional Tours */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Regionale Ausfluege</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗺</span>
              <div>
                <div className="font-medium">Tagesausfluege werden geladen...</div>
                <div className="text-sm text-white/50">Mehrere Staedte an einem Tag</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Highlights */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Top-Sehenswuerdigkeiten</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/10 overflow-hidden">
            <div className="h-32 bg-white/5 flex items-center justify-center">
              <span className="text-3xl">🏔</span>
            </div>
            <div className="p-3">
              <div className="text-sm font-medium">Wird geladen...</div>
            </div>
          </div>
        </div>
      </section>

      {/* Regional Partners */}
      <section className="px-6 pb-24">
        <h2 className="text-lg font-semibold mb-3">Regionale Partner</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/region/${regionSlug}/partners`}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition text-center"
          >
            <span className="text-2xl block mb-1">🍽</span>
            <span className="text-sm">Restaurants</span>
          </Link>
          <Link
            to={`/region/${regionSlug}/partners`}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition text-center"
          >
            <span className="text-2xl block mb-1">🏨</span>
            <span className="text-sm">Hotels</span>
          </Link>
          <Link
            to={`/region/${regionSlug}/partners`}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition text-center"
          >
            <span className="text-2xl block mb-1">🌳</span>
            <span className="text-sm">Natur</span>
          </Link>
          <Link
            to={`/region/${regionSlug}/offers`}
            className="p-4 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 transition text-center border border-amber-400/30"
          >
            <span className="text-2xl block mb-1">🎁</span>
            <span className="text-sm text-amber-300">Angebote</span>
          </Link>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur border-t border-white/10 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className="flex flex-col items-center text-white/50">
            <span className="text-lg">🏠</span>
            <span className="text-xs mt-1">Start</span>
          </Link>
          <Link to={`/region/${regionSlug}`} className="flex flex-col items-center text-amber-400">
            <span className="text-lg">🌄</span>
            <span className="text-xs mt-1">Region</span>
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
