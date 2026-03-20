import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Meine Buchungen</h1>
        <p className="text-white/50 text-sm mt-1">Alle deine Reservierungen</p>
      </header>

      {/* Tabs */}
      <div className="px-6 mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'upcoming' ? 'bg-amber-400 text-indigo-950' : 'bg-white/10 text-white/70'
          }`}
        >
          Anstehend
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'past' ? 'bg-amber-400 text-indigo-950' : 'bg-white/10 text-white/70'
          }`}
        >
          Vergangen
        </button>
      </div>

      {/* Bookings List */}
      <section className="px-6 pb-24">
        <div className="text-center py-16">
          <span className="text-5xl block mb-4">📅</span>
          <h3 className="text-lg font-semibold mb-2">Keine Buchungen</h3>
          <p className="text-white/50 text-sm max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? 'Du hast noch keine anstehenden Buchungen. Entdecke Angebote und buche direkt!'
              : 'Keine vergangenen Buchungen vorhanden.'
            }
          </p>
          <Link
            to="/"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-amber-400 text-indigo-950 font-semibold text-sm"
          >
            Angebote entdecken
          </Link>
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
          <Link to="/bookings" className="flex flex-col items-center text-amber-400">
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
