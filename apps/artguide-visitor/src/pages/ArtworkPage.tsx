import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

/**
 * Artwork Detail Page — The heart of the visitor experience.
 *
 * Features:
 * - High-res artwork image with zoom
 * - Personalized description (based on visitor profile)
 * - Audio player with selected voice
 * - AI Chat ("Frag mich etwas ueber dieses Werk")
 * - Related artworks
 * - Favorite / Share buttons
 * - Artist info
 * - Fun facts (if enabled in profile)
 */
export default function ArtworkPage() {
  const { artworkId } = useParams()
  const [showChat, setShowChat] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center justify-between">
        <Link to="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Artwork Image */}
      <div className="mx-6 rounded-2xl overflow-hidden mb-6">
        <div className="aspect-[4/3] bg-gradient-to-br from-amber-900/30 to-indigo-800/30 flex items-center justify-center">
          <span className="text-6xl">🖼</span>
        </div>
      </div>

      {/* Artwork Info */}
      <div className="px-6 mb-4">
        <h1 className="text-2xl font-bold">Kunstwerk laden...</h1>
        <p className="text-amber-400/80 mt-1">Kuenstler</p>
        <p className="text-white/50 text-sm mt-1">Jahr | Medium | Masse</p>
      </div>

      {/* Audio Player */}
      <div className="mx-6 mb-6 p-4 rounded-xl bg-white/10 flex items-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-amber-400 text-indigo-950 flex items-center justify-center flex-shrink-0"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-white/20">
            <div className="h-full w-0 rounded-full bg-amber-400 transition-all" />
          </div>
          <div className="flex justify-between mt-1 text-xs text-white/40">
            <span>0:00</span>
            <span>--:--</span>
          </div>
        </div>
      </div>

      {/* Personalized Description */}
      <div className="px-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Beschreibung</h3>
        <p className="text-white/70 leading-relaxed">
          Die personalisierte Beschreibung wird basierend auf deinem Profil generiert...
        </p>
      </div>

      {/* AI Chat Toggle */}
      <div className="px-6 mb-6">
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-amber-400/20 to-indigo-400/20 border border-amber-400/30 flex items-center gap-3 hover:from-amber-400/30 hover:to-indigo-400/30 transition"
        >
          <span className="text-2xl">💬</span>
          <div className="text-left">
            <div className="font-medium">Frag mich etwas</div>
            <div className="text-sm text-white/50">KI-Chat ueber dieses Kunstwerk</div>
          </div>
          <svg className={`w-5 h-5 ml-auto transition-transform ${showChat ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showChat && (
          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-center text-white/40 py-8">
              <span className="text-3xl block mb-2">🤖</span>
              KI-Chat wird geladen...
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Was moechtest du wissen?"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none"
              />
              <button className="px-4 py-2 rounded-lg bg-amber-400 text-indigo-950 font-medium">
                Senden
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spacer for bottom nav */}
      <div className="h-24" />
    </div>
  )
}
