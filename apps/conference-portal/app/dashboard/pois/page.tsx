'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Enhanced POI Management Page
 * Features:
 * - Inline editing (click to edit any field)
 * - Quick KI actions (generate descriptions, translate, categorize)
 * - Drag & drop reordering
 * - Bulk operations
 * - Map/list/grid views
 * - Quick-add from URL or name
 * - Status management with visual indicators
 * - Content completeness indicators
 */

type POI = {
  id: string
  name: Record<string, string>
  category: string
  address: string
  lat: number
  lng: number
  status: 'draft' | 'review' | 'published' | 'archived'
  rating: number
  reviewsCount: number
  description: Record<string, string>
  hasAudio: boolean
  languages: string[]
  completeness: number // 0-1
  isPartner: boolean
  partnerName?: string
  views: number
  imageUrl?: string
  tags: string[]
}

const mockPois: POI[] = [
  {
    id: '1', name: { de: 'Stephansdom', en: "St. Stephen's Cathedral" }, category: 'attractions',
    address: 'Stephansplatz 3, 1010 Wien', lat: 48.2084, lng: 16.3731,
    status: 'published', rating: 4.8, reviewsCount: 12453,
    description: { de: 'Das Wahrzeichen Wiens...', en: "Vienna's iconic landmark..." },
    hasAudio: true, languages: ['de', 'en', 'fr', 'it'], completeness: 0.95, isPartner: false,
    views: 34521, tags: ['wahrzeichen', 'gotik', 'kirche'],
  },
  {
    id: '2', name: { de: 'Schloss Schoenbrunn', en: 'Schoenbrunn Palace' }, category: 'attractions',
    address: 'Schoenbrunner Schlossstrasse 47, 1130 Wien', lat: 48.1845, lng: 16.3122,
    status: 'published', rating: 4.7, reviewsCount: 28901,
    description: { de: 'Die ehemalige Sommerresidenz...', en: 'The former summer residence...' },
    hasAudio: true, languages: ['de', 'en', 'fr'], completeness: 0.88, isPartner: false,
    views: 45678, tags: ['schloss', 'barock', 'unesco'],
  },
  {
    id: '3', name: { de: 'Figlmueller' }, category: 'restaurants',
    address: 'Wollzeile 5, 1010 Wien', lat: 48.2089, lng: 16.3747,
    status: 'published', rating: 4.3, reviewsCount: 5678,
    description: { de: 'Das beruehmteste Schnitzelrestaurant...' },
    hasAudio: false, languages: ['de'], completeness: 0.52, isPartner: true, partnerName: 'Figlmueller GmbH',
    views: 12345, tags: ['schnitzel', 'traditionell', 'altstadt'],
  },
  {
    id: '4', name: { de: 'Naschmarkt' }, category: 'shops',
    address: 'Naschmarkt, 1060 Wien', lat: 48.1988, lng: 16.3614,
    status: 'review', rating: 4.5, reviewsCount: 8234,
    description: { de: 'Wiens bekanntester Markt...' },
    hasAudio: false, languages: ['de'], completeness: 0.45, isPartner: false,
    views: 8901, tags: ['markt', 'kulinarik', 'shopping'],
  },
  {
    id: '5', name: { de: 'Albertina' }, category: 'culture',
    address: 'Albertinaplatz 1, 1010 Wien', lat: 48.2046, lng: 16.3688,
    status: 'draft', rating: 4.6, reviewsCount: 9876,
    description: {},
    hasAudio: false, languages: [], completeness: 0.15, isPartner: false,
    views: 0, tags: ['museum', 'kunst'],
  },
  {
    id: '6', name: { de: 'Prater' }, category: 'nature',
    address: 'Prater, 1020 Wien', lat: 48.2166, lng: 16.3961,
    status: 'draft', rating: 4.4, reviewsCount: 15678,
    description: { de: 'Wiens groesster Park...' },
    hasAudio: false, languages: ['de'], completeness: 0.35, isPartner: false,
    views: 0, tags: ['park', 'riesenrad', 'freizeit'],
  },
]

const categoryConfig: Record<string, { icon: string; label: string; color: string }> = {
  attractions: { icon: '🏛', label: 'Sehenswuerdigkeit', color: 'bg-indigo-100 text-indigo-700' },
  restaurants: { icon: '🍽', label: 'Restaurant', color: 'bg-orange-100 text-orange-700' },
  hotels: { icon: '🏨', label: 'Hotel', color: 'bg-blue-100 text-blue-700' },
  shops: { icon: '🛍', label: 'Shopping', color: 'bg-pink-100 text-pink-700' },
  culture: { icon: '🎭', label: 'Kultur', color: 'bg-purple-100 text-purple-700' },
  nature: { icon: '🌿', label: 'Natur', color: 'bg-green-100 text-green-700' },
  sport: { icon: '⚽', label: 'Sport', color: 'bg-yellow-100 text-yellow-700' },
  nightlife: { icon: '🌙', label: 'Nachtleben', color: 'bg-violet-100 text-violet-700' },
  other: { icon: '📌', label: 'Sonstiges', color: 'bg-gray-100 text-gray-700' },
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  draft: { label: 'Entwurf', color: 'text-gray-500', dot: 'bg-gray-400' },
  review: { label: 'In Review', color: 'text-orange-600', dot: 'bg-orange-400' },
  published: { label: 'Live', color: 'text-green-600', dot: 'bg-green-400' },
  archived: { label: 'Archiviert', color: 'text-gray-400', dot: 'bg-gray-300' },
}

export default function PoisPage() {
  const [pois] = useState<POI[]>(mockPois)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeStatus, setActiveStatus] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list')
  const [selectedPois, setSelectedPois] = useState<string[]>([])
  const [editingField, setEditingField] = useState<{ poiId: string; field: string } | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddValue, setQuickAddValue] = useState('')
  const [showAiPanel, setShowAiPanel] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'completeness' | 'views' | 'rating'>('name')

  // Filter POIs
  const filteredPois = pois
    .filter(poi => {
      if (activeCategory !== 'all' && poi.category !== activeCategory) return false
      if (activeStatus && poi.status !== activeStatus) return false
      if (search) {
        const q = search.toLowerCase()
        return poi.name.de?.toLowerCase().includes(q) || poi.address.toLowerCase().includes(q) || poi.tags.some(t => t.includes(q))
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'completeness': return b.completeness - a.completeness
        case 'views': return b.views - a.views
        case 'rating': return b.rating - a.rating
        default: return (a.name.de || '').localeCompare(b.name.de || '')
      }
    })

  // Stats
  const totalPois = pois.length
  const publishedPois = pois.filter(p => p.status === 'published').length
  const incompletePois = pois.filter(p => p.completeness < 0.6).length
  const avgCompleteness = Math.round(pois.reduce((sum, p) => sum + p.completeness, 0) / pois.length * 100)

  function toggleSelectAll() {
    if (selectedPois.length === filteredPois.length) {
      setSelectedPois([])
    } else {
      setSelectedPois(filteredPois.map(p => p.id))
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Points of Interest</h1>
          <p className="text-gray-500 mt-1">
            {totalPois} POIs · {publishedPois} live · {incompletePois} unvollstaendig
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/import/city"
            className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition"
          >
            🏙 City Scout
          </Link>
          <Link
            href="/dashboard/import"
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
          >
            📥 Import
          </Link>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
          >
            + Neuer POI
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg">📍</div>
          <div>
            <div className="text-xl font-bold text-gray-900">{totalPois}</div>
            <div className="text-xs text-gray-500">Gesamt</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-lg">✅</div>
          <div>
            <div className="text-xl font-bold text-green-700">{publishedPois}</div>
            <div className="text-xs text-gray-500">Veroeffentlicht</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-lg">⚠</div>
          <div>
            <div className="text-xl font-bold text-orange-700">{incompletePois}</div>
            <div className="text-xs text-gray-500">Unvollstaendig</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-lg">📊</div>
          <div>
            <div className="text-xl font-bold text-indigo-700">{avgCompleteness}%</div>
            <div className="text-xs text-gray-500">Durchschn. Vollstaendigkeit</div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            activeCategory === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Alle ({pois.length})
        </button>
        {Object.entries(categoryConfig).map(([key, { icon, label, color }]) => {
          const count = pois.filter(p => p.category === key).length
          if (count === 0) return null
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(activeCategory === key ? 'all' : key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeCategory === key ? color : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {icon} {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Search, Filter, Sort & View Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4">
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name, Adresse oder Tag suchen..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          />
          <select
            value={activeStatus}
            onChange={e => setActiveStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value="">Alle Status</option>
            <option value="draft">Entwurf</option>
            <option value="review">In Review</option>
            <option value="published">Live</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value="name">Name</option>
            <option value="completeness">Vollstaendigkeit</option>
            <option value="views">Aufrufe</option>
            <option value="rating">Bewertung</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            {(['list', 'grid', 'map'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-sm transition ${viewMode === mode ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500'}`}
              >
                {mode === 'list' ? '≡' : mode === 'grid' ? '⊞' : '🗺'}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPois.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">{selectedPois.length} ausgewaehlt:</span>
            <button className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium hover:bg-indigo-200 transition">
              🤖 KI-Beschreibungen generieren
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition">
              🌐 Uebersetzen
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition">
              🎙 Audio generieren
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition">
              ✅ Veroeffentlichen
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition">
              🗑 Loeschen
            </button>
          </div>
        )}
      </div>

      {/* POI List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-500 uppercase">
            <input
              type="checkbox"
              checked={selectedPois.length === filteredPois.length && filteredPois.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <div className="w-8" />
            <div className="flex-1">Name & Adresse</div>
            <div className="w-32 text-center">Vollstaendigkeit</div>
            <div className="w-20 text-center">Sprachen</div>
            <div className="w-16 text-center">Audio</div>
            <div className="w-20 text-center">Rating</div>
            <div className="w-20 text-center">Status</div>
            <div className="w-28 text-center">Aktionen</div>
          </div>

          {filteredPois.map(poi => {
            const cat = categoryConfig[poi.category] || categoryConfig.other
            const status = statusConfig[poi.status]
            const isSelected = selectedPois.includes(poi.id)

            return (
              <div
                key={poi.id}
                className={`bg-white rounded-xl border transition ${
                  isSelected ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                      setSelectedPois(isSelected
                        ? selectedPois.filter(id => id !== poi.id)
                        : [...selectedPois, poi.id]
                      )
                    }}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />

                  {/* Category Icon */}
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${cat.color}`}>
                    {cat.icon}
                  </span>

                  {/* Name & Address — inline editable */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {editingField?.poiId === poi.id && editingField?.field === 'name' ? (
                        <input
                          autoFocus
                          defaultValue={poi.name.de}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                          className="text-sm font-medium text-gray-900 border-b-2 border-indigo-400 outline-none bg-transparent w-full"
                        />
                      ) : (
                        <span
                          className="text-sm font-medium text-gray-900 cursor-text hover:border-b hover:border-gray-300"
                          onClick={() => setEditingField({ poiId: poi.id, field: 'name' })}
                        >
                          {poi.name.de}
                        </span>
                      )}
                      {poi.isPartner && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                          🤝 {poi.partnerName}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{poi.address}</div>
                  </div>

                  {/* Completeness Bar */}
                  <div className="w-32 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          poi.completeness >= 0.8 ? 'bg-green-500' :
                          poi.completeness >= 0.5 ? 'bg-yellow-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${poi.completeness * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{Math.round(poi.completeness * 100)}%</span>
                  </div>

                  {/* Languages */}
                  <div className="w-20 text-center">
                    {poi.languages.length > 0 ? (
                      <span className="text-xs text-gray-500">
                        {poi.languages.length === 0 ? '—' : poi.languages.slice(0, 3).join(', ')}
                        {poi.languages.length > 3 && ` +${poi.languages.length - 3}`}
                      </span>
                    ) : (
                      <span className="text-xs text-red-400">Keine</span>
                    )}
                  </div>

                  {/* Audio */}
                  <div className="w-16 text-center">
                    {poi.hasAudio ? (
                      <span className="text-green-500 text-sm">🎙✓</span>
                    ) : (
                      <button
                        className="text-gray-300 hover:text-indigo-500 text-sm transition"
                        title="Audio generieren"
                      >
                        🎙
                      </button>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="w-20 text-center">
                    <span className="text-sm text-yellow-600">★ {poi.rating}</span>
                  </div>

                  {/* Status */}
                  <div className="w-20 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="w-28 flex items-center justify-center gap-1">
                    <button
                      onClick={() => setShowAiPanel(showAiPanel === poi.id ? null : poi.id)}
                      className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs hover:bg-indigo-100 transition"
                      title="KI-Aktionen"
                    >
                      🤖
                    </button>
                    <button
                      className="w-7 h-7 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center text-xs hover:bg-gray-100 transition"
                      title="Bearbeiten"
                    >
                      ✏
                    </button>
                    <button
                      className="w-7 h-7 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center text-xs hover:bg-gray-100 transition"
                      title="Vorschau"
                    >
                      👁
                    </button>
                    <button
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition ${
                        poi.status === 'published'
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600'
                      }`}
                      title={poi.status === 'published' ? 'Live' : 'Veroeffentlichen'}
                    >
                      {poi.status === 'published' ? '✓' : '▶'}
                    </button>
                  </div>
                </div>

                {/* AI Panel (expandable) */}
                {showAiPanel === poi.id && (
                  <div className="border-t border-gray-200 p-3 bg-indigo-50/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-indigo-700">🤖 KI-Aktionen fuer "{poi.name.de}"</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-medium hover:bg-indigo-50 transition">
                        📝 Kurzbeschreibung generieren
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-medium hover:bg-indigo-50 transition">
                        📖 Ausfuehrliche Beschreibung
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-medium hover:bg-indigo-50 transition">
                        🌐 In alle Sprachen uebersetzen
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-medium hover:bg-indigo-50 transition">
                        🎙 Audio-Guide generieren
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-medium hover:bg-indigo-50 transition">
                        🏷 Tags vorschlagen
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-medium hover:bg-indigo-50 transition">
                        ⭐ Fun Facts generieren
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-white border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 transition">
                        ✨ Alles generieren & uebersetzen
                      </button>
                    </div>
                    {poi.completeness < 0.6 && (
                      <div className="mt-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
                        ⚠ Dieser POI ist nur zu {Math.round(poi.completeness * 100)}% vollstaendig.
                        Fehlend: {!poi.description.en ? 'EN-Beschreibung, ' : ''}{!poi.hasAudio ? 'Audio, ' : ''}{poi.languages.length < 2 ? 'Uebersetzungen' : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {filteredPois.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-3">🏙</div>
              <p className="text-lg font-medium text-gray-600">Keine POIs gefunden</p>
              <p className="text-sm text-gray-400 mt-2">
                {search ? 'Versuche eine andere Suche' : 'Starte mit dem City Scout oder lege manuell POIs an'}
              </p>
              <div className="flex gap-3 justify-center mt-4">
                <Link
                  href="/dashboard/import/city"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                >
                  🏙 City Scout starten
                </Link>
                <button
                  onClick={() => setShowQuickAdd(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                >
                  + Manuell anlegen
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 gap-4">
          {filteredPois.map(poi => {
            const cat = categoryConfig[poi.category] || categoryConfig.other
            const status = statusConfig[poi.status]

            return (
              <div key={poi.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                {/* Image placeholder */}
                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-4xl">{cat.icon}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.color}`}>{cat.label}</span>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <span className={`text-xs ${status.color}`}>{status.label}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mt-2">{poi.name.de}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{poi.address}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-yellow-600">★ {poi.rating}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${poi.completeness >= 0.8 ? 'bg-green-500' : poi.completeness >= 0.5 ? 'bg-yellow-500' : 'bg-red-400'}`}
                          style={{ width: `${poi.completeness * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{Math.round(poi.completeness * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-3">
                    <button className="flex-1 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition">🤖 KI</button>
                    <button className="flex-1 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition">✏</button>
                    <button className="flex-1 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition">👁</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Map View Placeholder */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🗺</div>
          <h3 className="text-lg font-bold text-gray-900">Karten-Ansicht</h3>
          <p className="text-sm text-gray-500 mt-1">Interaktive Karte mit allen {filteredPois.length} POIs</p>
          <p className="text-xs text-gray-400 mt-4">Map-Integration (Mapbox/Leaflet) wird in der naechsten Phase eingebaut</p>
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowQuickAdd(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Neuen POI anlegen</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  autoFocus
                  type="text"
                  value={quickAddValue}
                  onChange={e => setQuickAddValue(e.target.value)}
                  placeholder="z.B. Stephansdom, Cafe Central, ..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryConfig).map(([key, { icon, label, color }]) => (
                    <button key={key} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${color} hover:opacity-80 transition`}>
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse (optional)</label>
                <input
                  type="text"
                  placeholder="Strasse, PLZ, Stadt"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none text-sm"
                />
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-indigo-700">🤖 KI soll automatisch Beschreibungen, Oeffnungszeiten und Bewertungen suchen</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowQuickAdd(false)} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                Abbrechen
              </button>
              <button onClick={() => setShowQuickAdd(false)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition">
                POI anlegen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
