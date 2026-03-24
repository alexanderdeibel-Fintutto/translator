import React from 'react'
import { Link } from 'react-router-dom'

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Entdecken</h1>
        <p className="text-white/60 mt-1">Museen, Staedte und Regionen</p>
      </header>

      {/* Search bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <input
            type="search"
            placeholder="Museum, Stadt, POI suchen..."
            className="w-full px-4 py-3 pl-10 rounded-xl bg-white/10 text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none transition"
          />
          <svg className="absolute left-3 top-3.5 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-4 gap-3">
          <Link to="/scan" className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition">
            <span className="text-2xl mb-1">📷</span>
            <span className="text-xs text-white/70">QR Scan</span>
          </Link>
          <button className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition">
            <span className="text-2xl mb-1">📍</span>
            <span className="text-xs text-white/70">In der Naehe</span>
          </button>
          <Link to="/bookings" className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition">
            <span className="text-2xl mb-1">📅</span>
            <span className="text-xs text-white/70">Buchungen</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition">
            <span className="text-2xl mb-1">👤</span>
            <span className="text-xs text-white/70">Profil</span>
          </Link>
        </div>
      </div>

      {/* Guide Type Cards */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Guides</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-400/20 p-4 text-center">
            <span className="text-3xl block mb-2">🏛</span>
            <span className="text-sm font-medium">Art Guide</span>
            <span className="text-xs block text-white/50 mt-0.5">Museen</span>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-400/20 p-4 text-center">
            <span className="text-3xl block mb-2">🏙</span>
            <span className="text-sm font-medium">City Guide</span>
            <span className="text-xs block text-white/50 mt-0.5">Staedte</span>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-400/20 p-4 text-center">
            <span className="text-3xl block mb-2">🌄</span>
            <span className="text-sm font-medium">Region Guide</span>
            <span className="text-xs block text-white/50 mt-0.5">Regionen</span>
          </div>
        </div>
      </section>

      {/* Museums */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Museen & Galerien</h2>
        <div className="space-y-3">
          <div className="rounded-xl bg-white/10 overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-amber-900/30 to-indigo-800/30 flex items-center justify-center">
              <span className="text-4xl">🏛</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold">Museen werden geladen...</h3>
              <p className="text-sm text-white/50 mt-1">Verbinde mit Art Guide Service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Staedte entdecken</h2>
        <div className="space-y-3">
          <div className="rounded-xl bg-white/10 overflow-hidden p-4 text-center">
            <span className="text-4xl block mb-2">🏙</span>
            <p className="text-white/50 text-sm">Staedte werden geladen...</p>
          </div>
        </div>
      </section>

      {/* Nearby Offers */}
      <section className="px-6 pb-24">
        <h2 className="text-lg font-semibold mb-3">Angebote in der Naehe</h2>
        <div className="space-y-3">
          <div className="rounded-xl bg-white/10 overflow-hidden p-4 text-center">
            <span className="text-4xl block mb-2">🎁</span>
            <p className="text-white/50 text-sm">Standort aktivieren fuer lokale Angebote</p>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur border-t border-white/10 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className="flex flex-col items-center text-amber-400">
            <span className="text-lg">🏠</span>
            <span className="text-xs mt-1">Entdecken</span>
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
