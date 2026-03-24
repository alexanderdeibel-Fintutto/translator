import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Scan Page — QR code and NFC scanner for quick artwork access.
 * Uses device camera for QR codes and NFC API for tags.
 */
export default function ScanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      <header className="px-6 pt-12 pb-6 flex items-center gap-3">
        <Link to="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">QR-Code scannen</h1>
      </header>

      <div className="px-6">
        {/* Camera viewfinder placeholder */}
        <div className="aspect-square rounded-2xl bg-black/50 border-2 border-white/20 flex items-center justify-center mb-6 relative overflow-hidden">
          <div className="absolute inset-8 border-2 border-amber-400/50 rounded-lg" />
          <div className="text-center">
            <span className="text-5xl block mb-4">📷</span>
            <p className="text-white/50">Kamera wird aktiviert...</p>
            <p className="text-white/30 text-sm mt-2">Richte die Kamera auf den QR-Code am Kunstwerk</p>
          </div>
        </div>

        {/* NFC option */}
        <button className="w-full p-4 rounded-xl bg-white/10 flex items-center gap-3 hover:bg-white/15 transition mb-4">
          <span className="text-2xl">📱</span>
          <div className="text-left">
            <div className="font-medium">NFC nutzen</div>
            <div className="text-sm text-white/50">Halte dein Handy an das NFC-Tag</div>
          </div>
        </button>

        {/* Manual code entry */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <label className="block text-sm text-white/60 mb-2">Oder Code manuell eingeben</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="z.B. AG-001"
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none"
            />
            <button className="px-4 py-2 rounded-lg bg-amber-400 text-indigo-950 font-medium">
              Los
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
