'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

type Artwork = {
  id: string
  title: string
  artist_name: string
  year_created: string
  category: string
  is_highlight: boolean
  image_url: string | null
  inventory_number: string
  status: string
}

const CATEGORIES: Record<string, string> = {
  painting: '🖼 Gemälde',
  sculpture: '🗿 Skulptur',
  photography: '📷 Fotografie',
  installation: '💡 Installation',
  drawing: '✏️ Zeichnung',
  print: '🖨 Grafik',
  other: '🎨 Sonstiges',
}

export default function VisitorMuseumPage() {
  const params = useParams()
  const museumSlug = params.museumSlug as string

  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'highlights'>('all')
  const [lang, setLang] = useState('de')

  useEffect(() => {
    fetch('/api/artworks?limit=50&status=published')
      .then(r => r.json())
      .then(d => setArtworks(d.artworks || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = artworks.filter(a => {
    if (filter === 'highlights' && !a.is_highlight) return false
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) &&
        !a.artist_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const highlights = artworks.filter(a => a.is_highlight)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-indigo-950 to-gray-950 px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold">A</div>
            <span className="font-semibold text-white/80">Art Guide</span>
          </div>
          <select value={lang} onChange={e => setLang(e.target.value)}
            className="bg-white/10 border border-white/10 text-white text-sm rounded-lg px-2 py-1">
            <option value="de">🇩🇪 DE</option>
            <option value="en">🇬🇧 EN</option>
            <option value="fr">🇫🇷 FR</option>
            <option value="es">🇪🇸 ES</option>
          </select>
        </div>
        <h1 className="text-2xl font-bold text-white capitalize">{museumSlug.replace(/-/g, ' ')}</h1>
        <p className="text-white/50 text-sm mt-1">{artworks.length} Exponate · {highlights.length} Highlights</p>

        {/* Search */}
        <div className="mt-4 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kunstwerk oder Kuenstler suchen..."
            className="w-full bg-white/10 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      <div className="px-4 pt-4 pb-24">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'all', label: 'Alle Werke' },
            { id: 'highlights', label: `⭐ Highlights (${highlights.length})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as typeof filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Artwork Grid */}
        {loading ? (
          <div className="text-center py-12 text-white/40">
            <div className="text-4xl mb-3">⏳</div>
            <p>Lade Exponate...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <div className="text-4xl mb-3">🔍</div>
            <p>Keine Exponate gefunden</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(artwork => (
              <a
                key={artwork.id}
                href={`/visitor/${museumSlug}/${artwork.inventory_number || artwork.id}`}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-400/50 hover:bg-white/8 transition group">
                {/* Image */}
                <div className="aspect-square bg-gray-900 relative overflow-hidden">
                  {artwork.image_url ? (
                    <img src={artwork.image_url} alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <span className="text-4xl">{CATEGORIES[artwork.category]?.split(' ')[0] || '🎨'}</span>
                    </div>
                  )}
                  {artwork.is_highlight && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs">⭐</div>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-white text-sm font-semibold leading-tight line-clamp-2">{artwork.title}</p>
                  <p className="text-white/50 text-xs mt-1 truncate">{artwork.artist_name}</p>
                  {artwork.year_created && (
                    <p className="text-white/30 text-xs mt-0.5">{artwork.year_created}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-sm border-t border-white/10 px-4 py-3">
        <button className="w-full py-3.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-400 transition flex items-center justify-center gap-2">
          🗺 Fuehrung starten
        </button>
      </div>
    </div>
  )
}
