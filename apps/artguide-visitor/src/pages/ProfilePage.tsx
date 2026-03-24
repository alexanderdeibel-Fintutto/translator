import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Profile Page — Visitor profile and personalization settings.
 *
 * Sections:
 * - Personal info (age, salutation)
 * - Knowledge level
 * - Voice preferences
 * - Visit history
 * - Favorites
 * - Settings (language, accessibility)
 */
export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white pb-24">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold">Mein Profil</h1>
        <p className="text-white/60 mt-1">Personalisierung und Einstellungen</p>
      </header>

      <div className="px-6 space-y-4">
        {/* Profile Card */}
        <div className="p-4 rounded-xl bg-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <div className="font-semibold">Besucher</div>
              <div className="text-sm text-white/50">Profil bearbeiten</div>
            </div>
            <svg className="w-5 h-5 ml-auto text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Settings Sections */}
        {[
          { icon: '🎨', title: 'Kunst-Level & Interessen', desc: 'Wissensstand und Vorlieben' },
          { icon: '🎙', title: 'Stimme & Audio', desc: 'Voice Preset, Geschwindigkeit' },
          { icon: '⏱', title: 'Besuchsstil', desc: 'Dauer, Tiefe, Fuehrungsart' },
          { icon: '🤖', title: 'KI-Persoenlichkeit', desc: 'Ton, Detailgrad, Stil' },
          { icon: '♿', title: 'Barrierefreiheit', desc: 'Audiodeskription, Schriftgroesse' },
          { icon: '🌍', title: 'Sprache', desc: 'App- und Inhaltssprache' },
        ].map(item => (
          <button
            key={item.title}
            className="w-full p-4 rounded-xl bg-white/10 flex items-center gap-4 hover:bg-white/15 transition"
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="text-left">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-white/50">{item.desc}</div>
            </div>
            <svg className="w-5 h-5 ml-auto text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}

        {/* History */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-3">Letzte Besuche</h3>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-white/40">
            Noch keine Besuche — entdecke dein erstes Museum!
          </div>
        </div>

        {/* Favorites */}
        <div className="pt-2">
          <h3 className="text-lg font-semibold mb-3">Favoriten</h3>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-white/40">
            Noch keine Favoriten — markiere Kunstwerke mit ❤
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur border-t border-white/10 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className="flex flex-col items-center text-white/50">
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
          <Link to="/profile" className="flex flex-col items-center text-amber-400">
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
