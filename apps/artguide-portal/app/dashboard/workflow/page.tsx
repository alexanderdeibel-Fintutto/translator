'use client'
import { useState, useEffect, useCallback } from 'react'

type Artwork = {
  id: string
  title: string
  artist_name: string
  status: string
  category: string
  is_highlight: boolean
  updated_at: string
  ai_enriched?: boolean
  audio_url?: string | null
}

const COLUMNS = [
  { id: 'draft', label: 'Entwurf', dot: 'bg-gray-400', textColor: 'text-gray-700', bg: 'bg-gray-50', icon: '📝', next: 'review', nextLabel: 'Zur Review' },
  { id: 'review', label: 'In Review', dot: 'bg-yellow-400', textColor: 'text-yellow-700', bg: 'bg-yellow-50', icon: '👀', next: 'published', nextLabel: 'Genehmigen', prev: 'draft', prevLabel: 'Zurueck' },
  { id: 'published', label: 'Veroeffentlicht', dot: 'bg-green-400', textColor: 'text-green-700', bg: 'bg-green-50', icon: '✅', prev: 'draft', prevLabel: 'Zurueck zu Entwurf' },
  { id: 'archived', label: 'Archiviert', dot: 'bg-red-300', textColor: 'text-red-600', bg: 'bg-red-50', icon: '📦' },
]

export default function WorkflowPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [moving, setMoving] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const load = useCallback(() => {
    fetch('/api/artworks?limit=100')
      .then(r => r.json())
      .then(d => setArtworks(d.artworks || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const moveArtwork = async (id: string, newStatus: string) => {
    setMoving(id)
    try {
      await fetch(`/api/artworks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setArtworks(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    } catch (err) { console.error(err) }
    finally { setMoving(null) }
  }

  const bulkApprove = async () => {
    const reviewItems = artworks.filter(a => a.status === 'review')
    if (reviewItems.length === 0) return
    setBulkLoading(true)
    try {
      await Promise.all(reviewItems.map(a =>
        fetch(`/api/artworks/${a.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        })
      ))
      setArtworks(prev => prev.map(a => a.status === 'review' ? { ...a, status: 'published' } : a))
    } catch (err) { console.error(err) }
    finally { setBulkLoading(false) }
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const reviewCount = artworks.filter(a => a.status === 'review').length

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow</h1>
          <p className="text-gray-500 mt-1">Redaktionelle Pipeline — Entwurf bis Veroeffentlichung</p>
        </div>
        <div className="flex gap-3">
          {reviewCount > 0 && (
            <button onClick={bulkApprove} disabled={bulkLoading}
              className="px-4 py-2 rounded-lg bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition disabled:opacity-50 flex items-center gap-2">
              {bulkLoading ? '⏳' : '✅'} Alle {reviewCount} genehmigen
            </button>
          )}
          <a href="/dashboard/artworks" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition">
            Alle Exponate →
          </a>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">⏳</div>
          <p>Lade Exponate...</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 min-h-[500px]">
          {COLUMNS.map(col => {
            const items = artworks.filter(a => a.status === col.id)
            return (
              <div key={col.id} className={`${col.bg} rounded-xl p-3 border border-gray-200`}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <span className={`font-semibold text-sm ${col.textColor}`}>{col.label}</span>
                  <span className="ml-auto text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full font-medium border border-gray-200">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="bg-white/60 rounded-xl p-4 text-center text-gray-400 text-sm border border-dashed border-gray-200">
                      <span className="text-2xl block mb-1">{col.icon}</span>
                      Keine Eintraege
                    </div>
                  ) : items.map(artwork => (
                    <div key={artwork.id}
                      className={`bg-white rounded-xl p-3 border transition cursor-pointer ${
                        selected.has(artwork.id) ? 'border-indigo-400 shadow-sm ring-1 ring-indigo-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => toggleSelect(artwork.id)}>
                      <div className="flex items-start gap-2 mb-2">
                        <input type="checkbox" checked={selected.has(artwork.id)} onChange={() => toggleSelect(artwork.id)}
                          className="mt-0.5 rounded accent-indigo-600" onClick={e => e.stopPropagation()} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{artwork.title}</p>
                          <p className="text-xs text-gray-500 truncate">{artwork.artist_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2.5 flex-wrap">
                        {artwork.is_highlight && <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">⭐ Highlight</span>}
                        {artwork.ai_enriched && <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">✨ KI</span>}
                        {artwork.audio_url && <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">🎙 Audio</span>}
                        {artwork.category && <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">{artwork.category}</span>}
                      </div>
                      <div className="flex gap-1">
                        {col.next && (
                          <button
                            onClick={e => { e.stopPropagation(); moveArtwork(artwork.id, col.next!) }}
                            disabled={moving === artwork.id}
                            className="flex-1 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition disabled:opacity-50">
                            {moving === artwork.id ? '⏳' : col.nextLabel}
                          </button>
                        )}
                        {col.prev && (
                          <button
                            onClick={e => { e.stopPropagation(); moveArtwork(artwork.id, col.prev!) }}
                            disabled={moving === artwork.id}
                            className="px-2 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs hover:bg-gray-200 transition disabled:opacity-50"
                            title={col.prevLabel}>
                            ↩
                          </button>
                        )}
                        <a href={`/dashboard/artworks/${artwork.id}`}
                          onClick={e => e.stopPropagation()}
                          className="px-2 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs hover:bg-gray-200 transition"
                          title="Bearbeiten">
                          →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-900 text-white rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-4 z-50 border border-indigo-700">
          <span className="text-sm font-medium">{selected.size} ausgewaehlt</span>
          <div className="flex gap-2">
            <button onClick={() => {
              selected.forEach(id => moveArtwork(id, 'review'))
              setSelected(new Set())
            }} className="px-3 py-1.5 rounded-lg bg-yellow-400 text-yellow-900 text-xs font-semibold hover:bg-yellow-300 transition">
              👀 Zur Review
            </button>
            <button onClick={() => {
              selected.forEach(id => moveArtwork(id, 'published'))
              setSelected(new Set())
            }} className="px-3 py-1.5 rounded-lg bg-green-400 text-green-900 text-xs font-semibold hover:bg-green-300 transition">
              ✅ Veroeffentlichen
            </button>
            <button onClick={() => {
              selected.forEach(id => moveArtwork(id, 'archived'))
              setSelected(new Set())
            }} className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition">
              📦 Archivieren
            </button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs hover:bg-white/20 transition">
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
