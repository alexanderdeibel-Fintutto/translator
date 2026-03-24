'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useMuseum, useArtworks } from '@/lib/hooks'
import type { Artwork } from '@/lib/types'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-600',
}

const statusLabels: Record<string, string> = {
  draft: 'Entwurf',
  review: 'In Review',
  published: 'Veröffentlicht',
  archived: 'Archiviert',
}

// Helper: extract localized text from MultiLang object
function t(value: unknown, lang = 'de'): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const obj = value as Record<string, string>
    return obj[lang] || obj['de'] || obj['en'] || Object.values(obj)[0] || ''
  }
  return String(value)
}

export default function ArtworksPage() {
  const { museum } = useMuseum()
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'draft' | 'review' | 'published' | 'archived' | 'all' | undefined>(undefined)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { artworks, loading, total, reload } = useArtworks(museum?.id, {
    search: debouncedSearch || undefined,
    status: statusFilter,
  })

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunstwerke</h1>
          <p className="text-gray-500 mt-1">
            {loading ? 'Wird geladen...' : `${total} Werke in der Sammlung`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/import/museum" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
            📂 Import
          </Link>
          <Link href="/dashboard/artworks/new" className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            + Neues Kunstwerk
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Titel, Künstler, Inventarnummer..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <select
            value={statusFilter || ''}
            onChange={e => setStatusFilter((e.target.value || undefined) as typeof statusFilter)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-indigo-500 outline-none"
          >
            <option value="">Alle Status</option>
            <option value="draft">Entwurf</option>
            <option value="review">In Review</option>
            <option value="published">Veröffentlicht</option>
            <option value="archived">Archiviert</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button onClick={() => setView('list')} className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500'}`}>☰ Liste</button>
            <button onClick={() => setView('grid')} className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500'}`}>⊞ Grid</button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-gray-400">Kunstwerke werden geladen...</p>
        </div>
      ) : artworks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🖼</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Noch keine Kunstwerke</h3>
          <p className="text-gray-400 mb-4">Importiere deine Sammlung oder lege ein Werk manuell an.</p>
          <Link href="/dashboard/import/museum" className="inline-block px-5 py-2.5 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition">
            Jetzt importieren →
          </Link>
        </div>
      ) : view === 'list' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="p-4 font-medium">Bild</th>
                <th className="p-4 font-medium">Titel</th>
                <th className="p-4 font-medium">Künstler</th>
                <th className="p-4 font-medium">Raum</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map(artwork => (
                <ArtworkRow key={artwork.id} artwork={artwork} onReload={reload} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {artworks.map(artwork => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </>
  )
}

function ArtworkRow({ artwork, onReload }: { artwork: Artwork; onReload: () => void }) {
  const imageUrl = (artwork as any).image_url as string | null
  const roomName = artwork.room ? t(artwork.room.name) : null

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition">
      <td className="p-4">
        {imageUrl ? (
          <img src={imageUrl} alt={t(artwork.title)} className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xl">🖼</div>
        )}
      </td>
      <td className="p-4">
        <Link href={`/dashboard/artworks/${artwork.id}`} className="font-medium text-gray-900 hover:text-indigo-700 transition">
          {t(artwork.title)}
        </Link>
        {artwork.inventory_number && (
          <p className="text-xs text-gray-400 font-mono mt-0.5">{artwork.inventory_number}</p>
        )}
      </td>
      <td className="p-4 text-gray-600 text-sm">{artwork.artist_name || '—'}</td>
      <td className="p-4 text-gray-500 text-sm">{roomName || '—'}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[artwork.status] || 'bg-gray-100 text-gray-600'}`}>
          {statusLabels[artwork.status] || artwork.status}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/artworks/${artwork.id}`} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition" title="Bearbeiten">✏️</Link>
          <Link href={`/dashboard/artworks/${artwork.id}?tab=qr`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition" title="QR-Code">📱</Link>
        </div>
      </td>
    </tr>
  )
}

function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const imageUrl = (artwork as any).image_url as string | null

  return (
    <Link href={`/dashboard/artworks/${artwork.id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-indigo-300 hover:shadow-sm transition group">
      {imageUrl ? (
        <img src={imageUrl} alt={t(artwork.title)} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-4xl">🖼</div>
      )}
      <div className="p-3">
        <p className="font-medium text-gray-900 text-sm truncate group-hover:text-indigo-700 transition">{t(artwork.title)}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{artwork.artist_name || '—'}</p>
        <div className="flex items-center justify-between mt-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[artwork.status] || 'bg-gray-100 text-gray-600'}`}>
            {statusLabels[artwork.status] || artwork.status}
          </span>
          {artwork.inventory_number && (
            <span className="text-xs font-mono text-gray-400">{artwork.inventory_number}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
