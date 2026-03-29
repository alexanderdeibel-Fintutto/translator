'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { MapPOI } from '../../../components/GoogleMapView'

const GoogleMapView = dynamic(() => import('../../../components/GoogleMapView'), { ssr: false })

// Demo-Tour-Daten für Vorschau
const DEMO_TOURS = [
  {
    id: 'tour-1',
    title: 'Wiener Innenstadt Klassiker',
    type: 'curated',
    duration: '2h 30min',
    distance: '3.2 km',
    mode: 'walking',
    stops: [
      { id: 's1', name: 'Stephansdom', lat: 48.2084, lng: 16.3731, category: 'attractions', status: 'published' as const, address: 'Stephansplatz 3' },
      { id: 's2', name: 'Hofburg', lat: 48.2066, lng: 16.3644, category: 'attractions', status: 'published' as const, address: 'Michaelerkuppel' },
      { id: 's3', name: 'Kunsthistorisches Museum', lat: 48.2033, lng: 16.3614, category: 'museums', status: 'published' as const, address: 'Maria-Theresien-Platz' },
      { id: 's4', name: 'Naschmarkt', lat: 48.1988, lng: 16.3614, category: 'shops', status: 'review' as const, address: 'Naschmarkt' },
    ],
    languages: ['de', 'en', 'fr', 'it'],
    status: 'published',
    views: 12450,
  },
]

export default function CityToursPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedTour, setSelectedTour] = useState<typeof DEMO_TOURS[0] | null>(null)
  const [showNewTourModal, setShowNewTourModal] = useState(false)

  const filteredTours = activeTab === 'all'
    ? DEMO_TOURS
    : DEMO_TOURS.filter(t => t.type === activeTab)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stadt-Touren</h1>
          <p className="text-gray-500 mt-1">Kuratierte und KI-generierte Stadtführungen</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">
            🤖 KI-Tour generieren
          </button>
          <button
            onClick={() => setShowNewTourModal(true)}
            className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition"
          >
            + Neue Tour
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          ['all', 'Alle'],
          ['curated', 'Kuratiert'],
          ['ai_generated', 'KI-generiert'],
          ['thematic', 'Thematisch'],
          ['partner_sponsored', 'Partner-gesponsert'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === id
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Layout: Tour-Liste + Karten-Vorschau */}
      <div className="grid grid-cols-5 gap-6">
        {/* Tour-Liste */}
        <div className="col-span-2 space-y-3">
          {filteredTours.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <span className="text-4xl block mb-3">🗺️</span>
              <p className="text-gray-500 font-medium">Keine Touren in dieser Kategorie</p>
              <button
                onClick={() => setShowNewTourModal(true)}
                className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium"
              >
                + Tour erstellen
              </button>
            </div>
          ) : (
            filteredTours.map(tour => (
              <div
                key={tour.id}
                onClick={() => setSelectedTour(selectedTour?.id === tour.id ? null : tour)}
                className={`bg-white rounded-xl border cursor-pointer transition hover:shadow-md ${
                  selectedTour?.id === tour.id
                    ? 'border-indigo-400 ring-2 ring-indigo-100'
                    : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {tour.mode === 'walking' ? '🚶' : tour.mode === 'cycling' ? '🚲' : '🚌'}
                        </span>
                        <h3 className="font-semibold text-gray-900 text-sm">{tour.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>⏱ {tour.duration}</span>
                        <span>📏 {tour.distance}</span>
                        <span>📍 {tour.stops.length} Stopps</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tour.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tour.status === 'published' ? 'Live' : 'Entwurf'}
                      </span>
                      <span className="text-xs text-gray-400">👁 {tour.views.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Stopps-Vorschau */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tour.stops.map((stop, i) => (
                      <span key={stop.id} className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-full text-xs text-gray-600 border border-gray-100">
                        <span className="text-indigo-500 font-bold">{i + 1}</span>
                        {stop.name}
                      </span>
                    ))}
                  </div>

                  {/* Sprachen */}
                  <div className="mt-2 flex items-center gap-1">
                    {tour.languages.map(lang => (
                      <span key={lang} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-mono uppercase">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Aktionen */}
                <div className="px-4 py-2 border-t border-gray-100 flex gap-2">
                  <button className="flex-1 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition">
                    ✏️ Bearbeiten
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition">
                    📊 Analytics
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium hover:bg-amber-100 transition">
                    🤖 KI-Optimierung
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Neue Tour Karte */}
          <div
            onClick={() => setShowNewTourModal(true)}
            className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition"
          >
            <span className="text-3xl block mb-2">➕</span>
            <p className="text-sm font-medium text-gray-500">Neue Tour erstellen</p>
          </div>
        </div>

        {/* Karten-Vorschau */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {selectedTour ? `🗺️ ${selectedTour.title}` : '🗺️ Karten-Vorschau'}
              </span>
              {selectedTour && (
                <button
                  onClick={() => setSelectedTour(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Alle anzeigen
                </button>
              )}
            </div>
            <GoogleMapView
              pois={(selectedTour?.stops ?? DEMO_TOURS.flatMap(t => t.stops)).map((stop): MapPOI => ({
                id: stop.id,
                name: stop.name,
                lat: stop.lat,
                lng: stop.lng,
                category: stop.category,
                status: stop.status,
                address: stop.address,
              }))}
              height="460px"
              center={selectedTour?.stops[0]
                ? { lat: selectedTour.stops[0].lat, lng: selectedTour.stops[0].lng }
                : undefined
              }
              zoom={selectedTour ? 14 : 13}
            />
          </div>
        </div>
      </div>

      {/* Tour-Features Info */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {[
          { icon: '🚶', title: 'Zu Fuß', desc: 'Walking Tours durch die Altstadt' },
          { icon: '🚲', title: 'Per Rad', desc: 'Fahrradtouren mit GPS-Navigation' },
          { icon: '🚌', title: 'Öffis', desc: 'Bus & Bahn Touren mit Haltestellen' },
          { icon: '🤖', title: 'KI-generiert', desc: 'Personalisierte Tour basierend auf Interessen' },
        ].map(f => (
          <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <span className="text-3xl">{f.icon}</span>
            <h4 className="font-medium text-gray-900 mt-2 text-sm">{f.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Neue Tour Modal */}
      {showNewTourModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowNewTourModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">Neue Stadt-Tour erstellen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tour-Titel</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="z.B. Wiener Kaffeehäuser Tour"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fortbewegungsmittel</label>
                <div className="flex gap-2">
                  {[
                    { id: 'walking', icon: '🚶', label: 'Zu Fuß' },
                    { id: 'cycling', icon: '🚲', label: 'Rad' },
                    { id: 'transit', icon: '🚌', label: 'Öffis' },
                  ].map(m => (
                    <button
                      key={m.id}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:border-indigo-400 hover:bg-indigo-50 transition"
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-amber-600 rounded" />
                  <span className="text-sm text-amber-700">
                    🤖 KI soll automatisch passende POIs aus meiner Datenbank vorschlagen
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewTourModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition"
              >
                Abbrechen
              </button>
              <button
                onClick={() => setShowNewTourModal(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
              >
                Tour erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
