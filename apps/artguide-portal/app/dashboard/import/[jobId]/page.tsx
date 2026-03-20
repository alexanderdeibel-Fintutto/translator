'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Import Job Detail & Review Page
 * Shows the current state of an import job, allows reviewing individual items,
 * bulk approve/reject, and trigger re-enrichment.
 */

const statusConfig: Record<string, { color: string; label: string; icon: string }> = {
  uploaded: { color: 'bg-gray-100 text-gray-700', label: 'Hochgeladen', icon: '📁' },
  analyzing: { color: 'bg-blue-100 text-blue-700', label: 'KI analysiert', icon: '🔍' },
  mapping: { color: 'bg-purple-100 text-purple-700', label: 'Feld-Zuordnung', icon: '🔗' },
  enriching: { color: 'bg-yellow-100 text-yellow-700', label: 'KI anreichert', icon: '🤖' },
  review: { color: 'bg-orange-100 text-orange-700', label: 'Zur Pruefung', icon: '👁' },
  importing: { color: 'bg-cyan-100 text-cyan-700', label: 'Importiert...', icon: '📥' },
  completed: { color: 'bg-green-100 text-green-700', label: 'Abgeschlossen', icon: '✅' },
  failed: { color: 'bg-red-100 text-red-700', label: 'Fehlgeschlagen', icon: '❌' },
}

// Mock job data
const mockJob = {
  id: 'job-2',
  mode: 'city',
  modeLabel: 'Stadt / City Guide',
  modeIcon: '🏙',
  source: 'Wien POIs (Google Places)',
  sourceType: 'google_places',
  status: 'review',
  createdAt: '2026-03-19T10:23:00Z',
  createdBy: 'Alexander Deibel',
  itemsTotal: 1203,
  itemsAnalyzed: 1203,
  itemsEnriched: 1203,
  itemsApproved: 1089,
  itemsRejected: 25,
  itemsImported: 0,
  languages: ['de', 'en'],
  enrichmentConfig: {
    generateDescriptions: true,
    descriptionLevels: ['brief', 'standard'],
    generateAudio: false,
    autoCategories: true,
    generateTours: true,
  },
}

const mockItems = [
  {
    id: 'item-1', rowNumber: 1, status: 'approved', qualityScore: 0.96,
    sourceData: { name: 'Stephansdom', address: 'Stephansplatz 3, 1010 Wien', lat: 48.2084, lng: 16.3731 },
    enrichedData: {
      name: { de: 'Stephansdom', en: "St. Stephen's Cathedral" },
      category: 'attractions',
      description_brief: {
        de: 'Das Wahrzeichen Wiens — ein gotisches Meisterwerk im Herzen der Stadt, dessen 137m hoher Suedturm seit 1433 die Skyline praegt.',
        en: "Vienna's iconic landmark — a Gothic masterpiece in the heart of the city, whose 137m south tower has defined the skyline since 1433.",
      },
      description_standard: {
        de: 'Der Stephansdom ist die bedeutendste Kirche Wiens und seit 1365 Sitz des Erzbistums. Der gotische Bau beeindruckt mit seinem bunten Dachziegel-Mosaik, den wertvollen Altaeren und der Katakombenanlage unter dem Dom. Vom Suedturm bietet sich ein atemberaubender Panoramablick ueber die Stadt.',
        en: "St. Stephen's Cathedral is Vienna's most important church and has been the seat of the archbishopric since 1365. The Gothic structure impresses with its colorful roof tile mosaic, valuable altars, and the catacombs beneath the cathedral. The south tower offers a breathtaking panoramic view over the city.",
      },
      rating: 4.8,
      reviews_count: 12453,
    },
  },
  {
    id: 'item-2', rowNumber: 2, status: 'approved', qualityScore: 0.94,
    sourceData: { name: 'Schloss Schoenbrunn', address: 'Schoenbrunner Schlossstrasse 47, 1130 Wien', lat: 48.1845, lng: 16.3122 },
    enrichedData: {
      name: { de: 'Schloss Schoenbrunn', en: 'Schoenbrunn Palace' },
      category: 'attractions',
      description_brief: {
        de: 'Die ehemalige Sommerresidenz der Habsburger — ein UNESCO-Welterbe mit 1.441 Zimmern, barocken Prunkraeumen und einer der schoensten Gartenanlagen Europas.',
        en: "The former summer residence of the Habsburgs — a UNESCO World Heritage site with 1,441 rooms, baroque state rooms, and one of Europe's most beautiful gardens.",
      },
    },
  },
  {
    id: 'item-3', rowNumber: 3, status: 'enriched', qualityScore: 0.73,
    sourceData: { name: 'Figlmueller', address: 'Wollzeile 5, 1010 Wien', lat: 48.2089, lng: 16.3747 },
    enrichedData: {
      name: { de: 'Figlmueller', en: 'Figlmueller' },
      category: 'restaurants',
      description_brief: {
        de: 'Das beruehmteste Schnitzelrestaurant Wiens seit 1905 — legendaere, telleruebergrosse Wiener Schnitzel in historischem Ambiente.',
        en: "Vienna's most famous schnitzel restaurant since 1905 — legendary, plate-sized Wiener Schnitzel in a historic setting.",
      },
    },
    qualityIssues: ['Oeffnungszeiten nicht verifiziert', 'Kein Foto verfuegbar'],
  },
  {
    id: 'item-4', rowNumber: 4, status: 'rejected', qualityScore: 0.35,
    sourceData: { name: 'Unnamed Business', address: 'Margaretenstr. 22, 1040 Wien', lat: 48.1944, lng: 16.3567 },
    enrichedData: {
      name: { de: 'Unnamed Business', en: 'Unnamed Business' },
      category: 'other',
      description_brief: { de: 'Keine Informationen verfuegbar.', en: 'No information available.' },
    },
    qualityIssues: ['Kein Name', 'Keine Beschreibung moeglich', 'Keine Kategorie erkannt'],
  },
]

const categoryIcons: Record<string, string> = {
  attractions: '🏛',
  restaurants: '🍽',
  hotels: '🏨',
  shops: '🛍',
  culture: '🎭',
  nature: '🌿',
  sport: '⚽',
  nightlife: '🌙',
  other: '📌',
}

export default function ImportJobDetailPage({ params }: { params: { jobId: string } }) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')

  const job = mockJob
  const statusInfo = statusConfig[job.status]
  const progressPercent = Math.round(((job.itemsApproved + job.itemsRejected) / job.itemsTotal) * 100)

  const filteredItems = mockItems.filter(item => {
    if (filterStatus && item.status !== filterStatus) return false
    if (searchQuery && !item.sourceData.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/import" className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-500">
          ← Zurueck
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{job.modeIcon}</span>
            <h1 className="text-2xl font-bold text-gray-900">{job.source}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {job.modeLabel} · Erstellt am {new Date(job.createdAt).toLocaleDateString('de-DE')} von {job.createdBy}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
            🔄 Erneut anreichern
          </button>
          <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
            📊 Export (CSV)
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Fortschritt</h2>
          <span className="text-sm text-gray-500">{progressPercent}% geprueft</span>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4 flex">
          <div
            className="bg-green-500 h-full transition-all"
            style={{ width: `${(job.itemsApproved / job.itemsTotal) * 100}%` }}
            title={`${job.itemsApproved} genehmigt`}
          />
          <div
            className="bg-red-400 h-full transition-all"
            style={{ width: `${(job.itemsRejected / job.itemsTotal) * 100}%` }}
            title={`${job.itemsRejected} abgelehnt`}
          />
          <div
            className="bg-orange-300 h-full transition-all"
            style={{ width: `${((job.itemsTotal - job.itemsApproved - job.itemsRejected) / job.itemsTotal) * 100}%` }}
            title="Ausstehend"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: 'Gesamt', value: job.itemsTotal, color: 'text-gray-900' },
            { label: 'Analysiert', value: job.itemsAnalyzed, color: 'text-blue-700' },
            { label: 'Angereichert', value: job.itemsEnriched, color: 'text-purple-700' },
            { label: 'Genehmigt', value: job.itemsApproved, color: 'text-green-700' },
            { label: 'Abgelehnt', value: job.itemsRejected, color: 'text-red-700' },
            { label: 'Ausstehend', value: job.itemsTotal - job.itemsApproved - job.itemsRejected, color: 'text-orange-700' },
          ].map(stat => (
            <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-4">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="POI suchen..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value="">Alle Status</option>
            <option value="approved">Genehmigt</option>
            <option value="enriched">Angereichert</option>
            <option value="rejected">Abgelehnt</option>
            <option value="error">Fehler</option>
          </select>
          {selectedItems.length > 0 && (
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">
                ✓ {selectedItems.length} genehmigen
              </button>
              <button className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition">
                ✗ {selectedItems.length} ablehnen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.map(item => {
          const isExpanded = expandedItem === item.id
          const catIcon = categoryIcons[item.enrichedData.category] || '📌'
          return (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Item Row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, item.id])
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== item.id))
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-gray-400 text-xs w-8">#{item.rowNumber}</span>
                <span className="text-lg">{catIcon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{item.sourceData.name}</div>
                  <div className="text-xs text-gray-400">{item.sourceData.address}</div>
                </div>

                {/* Quality Score */}
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.qualityScore >= 0.85 ? 'bg-green-500' :
                        item.qualityScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.qualityScore * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{Math.round(item.qualityScore * 100)}%</span>
                </div>

                {/* Status */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'approved' ? 'bg-green-100 text-green-700' :
                  item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {item.status === 'approved' ? '✓ Genehmigt' :
                   item.status === 'rejected' ? '✗ Abgelehnt' : '⚠ Pruefung'}
                </span>

                <span className={`text-gray-400 transition ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Generated Content */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">KI-generierter Content</h4>

                      {item.enrichedData.description_brief && (
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs font-medium text-indigo-600 mb-1">🇩🇪 Kurzbeschreibung (DE)</div>
                            <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                              {item.enrichedData.description_brief.de}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-indigo-600 mb-1">🇬🇧 Brief Description (EN)</div>
                            <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                              {item.enrichedData.description_brief.en}
                            </div>
                          </div>
                        </div>
                      )}

                      {item.enrichedData.description_standard && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-indigo-600 mb-1">🇩🇪 Ausfuehrlich (DE)</div>
                          <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                            {item.enrichedData.description_standard.de}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Metadaten</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-500">Kategorie</span>
                          <span className="font-medium">{catIcon} {item.enrichedData.category}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-500">Koordinaten</span>
                          <span className="font-mono text-xs">{item.sourceData.lat}, {item.sourceData.lng}</span>
                        </div>
                        {item.enrichedData.rating && (
                          <div className="flex justify-between p-2 bg-white rounded-lg border border-gray-200">
                            <span className="text-gray-500">Bewertung</span>
                            <span className="font-medium text-yellow-600">★ {item.enrichedData.rating} ({item.enrichedData.reviews_count?.toLocaleString()})</span>
                          </div>
                        )}
                        <div className="flex justify-between p-2 bg-white rounded-lg border border-gray-200">
                          <span className="text-gray-500">Sprachen</span>
                          <span>🇩🇪 🇬🇧</span>
                        </div>
                      </div>

                      {/* Quality Issues */}
                      {item.qualityIssues && item.qualityIssues.length > 0 && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="text-xs font-semibold text-orange-700 mb-1">⚠ Qualitaetsprobleme</div>
                          <ul className="text-xs text-orange-600 space-y-1">
                            {item.qualityIssues.map((issue: string, i: number) => (
                              <li key={i}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Item Actions */}
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">
                          ✓ Genehmigen
                        </button>
                        <button className="flex-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition">
                          ✗ Ablehnen
                        </button>
                        <button className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition">
                          ✏ Bearbeiten
                        </button>
                        <button className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition">
                          🔄 Neu generieren
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-between z-40">
        <div className="text-sm text-gray-500">
          {job.itemsApproved.toLocaleString()} von {job.itemsTotal.toLocaleString()} genehmigt
          ({89} ausstehend)
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition">
            ✓ Alle ausstehenden genehmigen
          </button>
          <button className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition">
            📥 {job.itemsApproved.toLocaleString()} POIs importieren
          </button>
        </div>
      </div>

      {/* Spacer for bottom bar */}
      <div className="h-20" />
    </>
  )
}
