'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Second Brain / Content Hub
 * Central place to collect, organize, and prepare content from multiple sources.
 * Think of it as a "staging area" before content becomes structured POIs, artworks, etc.
 */

type ContentItem = {
  id: string
  type: 'note' | 'url' | 'file' | 'image' | 'contact' | 'idea'
  title: string
  content: string
  source: string
  tags: string[]
  status: 'inbox' | 'processing' | 'ready' | 'exported'
  targetType?: string // where it could go: 'poi', 'artwork', 'partner', 'tour'
  aiSummary?: string
  createdAt: string
}

const mockItems: ContentItem[] = [
  {
    id: '1', type: 'url', title: 'Neues Cafe in der Altstadt', content: 'https://wien.orf.at/neues-cafe-altstadt',
    source: 'Web Clipping', tags: ['cafe', 'wien', 'neueroeffnung'], status: 'inbox',
    targetType: 'poi', aiSummary: 'Neues Spezialitaetencafe in der Wiener Altstadt, eroeffnet Maerz 2026',
    createdAt: '2026-03-20T08:30:00Z',
  },
  {
    id: '2', type: 'note', title: 'Idee: Kulinarische Tour Naschmarkt', content: 'Tour mit 5-6 Stops am Naschmarkt, je 15min pro Stop, Schwerpunkt auf traditionelle Wiener Kueche + internationale Einflüsse',
    source: 'Notiz', tags: ['tour', 'kulinarik', 'naschmarkt'], status: 'processing',
    targetType: 'tour', aiSummary: 'Konzept fuer kulinarische Fuehrung am Naschmarkt mit 5-6 Stationen',
    createdAt: '2026-03-19T14:22:00Z',
  },
  {
    id: '3', type: 'contact', title: 'Kontakt: Galerie Neue Kunst', content: 'Fr. Monika Weber, galerie@neuekunst.at, +43 1 234 5678. Interessiert an Partnerschaft.',
    source: 'CRM-Notiz', tags: ['partner', 'galerie', 'wien'], status: 'ready',
    targetType: 'partner', aiSummary: 'Potenzielle Partnergalerie fuer Kunstfuehrungen',
    createdAt: '2026-03-18T11:45:00Z',
  },
  {
    id: '4', type: 'file', title: 'Katalog Albertina Ausstellung 2026', content: 'Albertina_Monet_2026.pdf (12.4 MB)',
    source: 'Upload', tags: ['albertina', 'monet', 'ausstellung'], status: 'processing',
    targetType: 'artwork', aiSummary: '47 Werke erkannt, davon 12 Monet-Originale, 35 Leihgaben',
    createdAt: '2026-03-17T09:10:00Z',
  },
  {
    id: '5', type: 'image', title: 'Fotos Museumsquartier Fruehjahr', content: '23 Fotos, GPS-getagged',
    source: 'Foto-Upload', tags: ['mq', 'fotos', 'fruehling'], status: 'inbox',
    targetType: 'poi', aiSummary: '23 Bilder vom Museumsquartier-Areal, verschiedene Perspektiven',
    createdAt: '2026-03-16T16:30:00Z',
  },
  {
    id: '6', type: 'idea', title: 'Barrierefreie Touren fuer Rollstuhlfahrer', content: 'Alle Museen mit barrierefreiem Zugang kartieren, spezielle Routen ohne Treppen/Stufen planen',
    source: 'Brainstorm', tags: ['accessibility', 'tour', 'inklusion'], status: 'inbox',
    targetType: 'tour',
    createdAt: '2026-03-15T13:20:00Z',
  },
]

const typeIcons: Record<string, { icon: string; color: string; label: string }> = {
  note: { icon: '📝', color: 'bg-yellow-100 text-yellow-700', label: 'Notiz' },
  url: { icon: '🔗', color: 'bg-blue-100 text-blue-700', label: 'Web-Link' },
  file: { icon: '📄', color: 'bg-purple-100 text-purple-700', label: 'Datei' },
  image: { icon: '🖼', color: 'bg-pink-100 text-pink-700', label: 'Bilder' },
  contact: { icon: '👤', color: 'bg-green-100 text-green-700', label: 'Kontakt' },
  idea: { icon: '💡', color: 'bg-amber-100 text-amber-700', label: 'Idee' },
}

const statusConfig: Record<string, { color: string; label: string }> = {
  inbox: { color: 'bg-gray-100 text-gray-600', label: 'Eingang' },
  processing: { color: 'bg-blue-100 text-blue-700', label: 'KI verarbeitet' },
  ready: { color: 'bg-green-100 text-green-700', label: 'Bereit' },
  exported: { color: 'bg-indigo-100 text-indigo-700', label: 'Exportiert' },
}

const targetTypes: Record<string, { icon: string; label: string }> = {
  poi: { icon: '📍', label: 'POI' },
  artwork: { icon: '🖼', label: 'Kunstwerk' },
  partner: { icon: '🤝', label: 'Partner' },
  tour: { icon: '🗺', label: 'Tour' },
}

export default function ContentHubPage() {
  const [items, setItems] = useState<ContentItem[]>(mockItems)
  const [filterType, setFilterType] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addType, setAddType] = useState<string>('note')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const filteredItems = items.filter(item => {
    if (filterType && item.type !== filterType) return false
    if (filterStatus && item.status !== filterStatus) return false
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const inboxCount = items.filter(i => i.status === 'inbox').length
  const processingCount = items.filter(i => i.status === 'processing').length
  const readyCount = items.filter(i => i.status === 'ready').length

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🧠 Content Hub</h1>
          <p className="text-gray-500 mt-1">Inhalte sammeln, organisieren und fuer den Import vorbereiten</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
        >
          + Inhalt hinzufuegen
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50">📥</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">{inboxCount}</div>
              <div className="text-xs text-gray-500">Im Eingang</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">🤖</span>
            <div>
              <div className="text-2xl font-bold text-blue-700">{processingCount}</div>
              <div className="text-xs text-gray-500">KI verarbeitet</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">✅</span>
            <div>
              <div className="text-2xl font-bold text-green-700">{readyCount}</div>
              <div className="text-xs text-gray-500">Import-bereit</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50">📊</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">{items.length}</div>
              <div className="text-xs text-gray-500">Gesamt</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Object.entries(typeIcons).map(([key, { icon, color }]) => (
              <button
                key={key}
                onClick={() => { setAddType(key); setShowAddModal(true) }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition hover:scale-110 ${color}`}
                title={typeIcons[key].label}
              >
                {icon}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Schnell-Notiz: Titel eingeben und Enter druecken..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                const newItem: ContentItem = {
                  id: Date.now().toString(),
                  type: 'note',
                  title: (e.target as HTMLInputElement).value,
                  content: '',
                  source: 'Schnell-Notiz',
                  tags: [],
                  status: 'inbox',
                  createdAt: new Date().toISOString(),
                }
                setItems([newItem, ...items]);
                (e.target as HTMLInputElement).value = ''
              }
            }}
          />
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition">
            📎 URL einfuegen
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition">
            📁 Datei upload
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Inhalte durchsuchen..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
        />
        <div className="flex gap-1">
          <button
            onClick={() => setFilterType('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${!filterType ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-500'}`}
          >
            Alle
          </button>
          {Object.entries(typeIcons).map(([key, { icon, label }]) => (
            <button
              key={key}
              onClick={() => setFilterType(filterType === key ? '' : key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterType === key ? typeIcons[key].color : 'bg-gray-50 text-gray-500'}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
        >
          <option value="">Alle Status</option>
          <option value="inbox">Eingang</option>
          <option value="processing">KI verarbeitet</option>
          <option value="ready">Bereit</option>
          <option value="exported">Exportiert</option>
        </select>
      </div>

      {/* Content Items */}
      <div className="space-y-2">
        {filteredItems.map(item => {
          const typeInfo = typeIcons[item.type]
          const statusInfo = statusConfig[item.status]
          const targetInfo = item.targetType ? targetTypes[item.targetType] : null
          const isExpanded = expandedItem === item.id

          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
              >
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${typeInfo.color}`}>
                  {typeInfo.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
                  <div className="text-xs text-gray-400 truncate">{item.content}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
                {targetInfo && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                    → {targetInfo.icon} {targetInfo.label}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString('de-DE')}
                </span>
                <span className={`text-gray-400 text-xs transition ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Inhalt</h4>
                      <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                        {item.content}
                      </div>
                      {item.aiSummary && (
                        <div className="mt-3">
                          <h4 className="text-xs font-semibold text-indigo-600 uppercase mb-1">🤖 KI-Zusammenfassung</h4>
                          <div className="text-sm text-gray-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                            {item.aiSummary}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Aktionen</h4>
                      <div className="space-y-2">
                        <button className="w-full px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium hover:bg-indigo-200 transition text-left">
                          🤖 KI analysieren & aufbereiten
                        </button>
                        <button className="w-full px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition text-left">
                          📥 Zum Import-Wizard senden
                        </button>
                        {item.targetType === 'poi' && (
                          <button className="w-full px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition text-left">
                            📍 Direkt als POI anlegen
                          </button>
                        )}
                        {item.targetType === 'partner' && (
                          <button className="w-full px-4 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition text-left">
                            🤝 Im Partner-CRM anlegen
                          </button>
                        )}
                        <button className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition text-left">
                          ✏ Bearbeiten
                        </button>
                        <button className="w-full px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition text-left">
                          🗑 Loeschen
                        </button>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Ziel-Typ aendern</h4>
                        <div className="flex gap-1">
                          {Object.entries(targetTypes).map(([key, { icon, label }]) => (
                            <button
                              key={key}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                item.targetType === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              {icon} {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-lg font-medium">Keine Inhalte gefunden</p>
            <p className="text-sm mt-1">Fuege Notizen, URLs, Dateien oder Ideen hinzu</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Neuen Inhalt hinzufuegen</h2>

            <div className="flex gap-2 mb-4">
              {Object.entries(typeIcons).map(([key, { icon, color, label }]) => (
                <button
                  key={key}
                  onClick={() => setAddType(key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    addType === key ? color + ' border-2 border-current' : 'bg-gray-50 text-gray-500 border-2 border-transparent'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Titel"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              />
              {addType === 'url' ? (
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
              ) : addType === 'file' || addType === 'image' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
                  <div className="text-3xl mb-2">{addType === 'image' ? '🖼' : '📄'}</div>
                  <p className="text-sm text-gray-500">Datei hier ablegen oder klicken</p>
                </div>
              ) : (
                <textarea
                  rows={4}
                  placeholder="Inhalt, Notizen, Details..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
              )}
              <input
                type="text"
                placeholder="Tags (kommagetrennt)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                Abbrechen
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                Hinzufuegen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
