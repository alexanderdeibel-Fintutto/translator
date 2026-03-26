'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Museum {
  id: string
  slug: string
  name: string
  description?: string
  city?: string
  country?: string
  logo_url?: string
  cover_image_url?: string
  primary_language?: string
  supported_languages?: string[]
}

export default function VisitorHomePage() {
  const [museums, setMuseums] = useState<Museum[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    // PWA Install Prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Load museums
    fetch('/api/visitor/museums')
      .then(r => r.json())
      .then(data => {
        setMuseums(data.museums || demoMuseums)
        setLoading(false)
      })
      .catch(() => {
        setMuseums(demoMuseums)
        setLoading(false)
      })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    const prompt = installPrompt as BeforeInstallPromptEvent
    prompt.prompt()
    setShowInstallBanner(false)
  }

  const filtered = museums.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.city || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white">
      {/* Install Banner */}
      {showInstallBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div>
              <p className="font-semibold text-sm">Art Guide installieren</p>
              <p className="text-xs text-indigo-200">Offline nutzen, zum Homescreen hinzufügen</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-xs text-indigo-200 px-2 py-1"
            >
              Später
            </button>
            <button
              onClick={handleInstall}
              className="bg-white text-indigo-600 text-xs font-bold px-3 py-1 rounded-full"
            >
              Installieren
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl">🎨</div>
          <div>
            <h1 className="text-xl font-bold">Art Guide</h1>
            <p className="text-xs text-gray-400">by Fintutto</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-1">Museen entdecken</h2>
        <p className="text-gray-400 text-sm mb-4">Wähle ein Museum für deine persönliche Führung</p>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Museum oder Stadt suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Museum List */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🏛</p>
            <p>Kein Museum gefunden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(museum => (
              <Link
                key={museum.id}
                href={`/visitor/${museum.slug}`}
                className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
              >
                <div className="flex">
                  {/* Cover Image */}
                  <div className="w-28 h-28 flex-shrink-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center">
                    {museum.cover_image_url ? (
                      <img src={museum.cover_image_url} alt={museum.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🏛</span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 p-4">
                    <h3 className="font-bold text-base leading-tight mb-1">{museum.name}</h3>
                    {museum.city && (
                      <p className="text-xs text-gray-400 mb-2">📍 {museum.city}{museum.country ? `, ${museum.country}` : ''}</p>
                    )}
                    {museum.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{museum.description}</p>
                    )}
                    {museum.supported_languages && museum.supported_languages.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {museum.supported_languages.slice(0, 4).map(lang => (
                          <span key={lang} className="text-xs bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded">
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center pr-3 text-gray-600">›</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* QR Code Hint */}
        <div className="mt-8 bg-indigo-950/50 border border-indigo-800/30 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-2">📷</p>
          <p className="text-sm font-medium text-indigo-300">QR-Code scannen</p>
          <p className="text-xs text-gray-500 mt-1">Scanne den QR-Code am Exponat für die direkte Ansicht</p>
        </div>
      </div>
    </div>
  )
}

// Demo data for when no museums are in DB yet
const demoMuseums: Museum[] = [
  {
    id: 'demo-1',
    slug: 'demo-museum',
    name: 'Demo Museum',
    description: 'Erlebe unsere KI-gestützte Führung durch eine fiktive Sammlung moderner Kunst.',
    city: 'München',
    country: 'Deutschland',
    primary_language: 'de',
    supported_languages: ['de', 'en', 'fr', 'es'],
  }
]

// TypeScript type for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
