import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps'

// Demo-Städte in einer Region (z.B. Niederösterreich)
const DEMO_CITIES = [
  { id: 'krems', name: 'Krems an der Donau', lat: 48.4097, lng: 15.6148, pois: 24, highlights: ['Kunstmeile', 'Altstadt', 'Weinkeller'] },
  { id: 'melk', name: 'Melk', lat: 48.2285, lng: 15.3318, pois: 12, highlights: ['Stift Melk', 'Donauradweg'] },
  { id: 'klosterneuburg', name: 'Klosterneuburg', lat: 48.3058, lng: 16.3258, pois: 8, highlights: ['Stift Klosterneuburg', 'Weingut'] },
  { id: 'tulln', name: 'Tulln', lat: 48.3319, lng: 16.0567, pois: 6, highlights: ['Egon-Schiele-Museum', 'Rosenpark'] },
]

const DEMO_HIGHLIGHTS = [
  { id: '1', name: 'Stift Melk', lat: 48.2285, lng: 15.3318, type: 'culture', icon: '⛪', city: 'Melk' },
  { id: '2', name: 'Kunstmeile Krems', lat: 48.4097, lng: 15.6148, type: 'culture', icon: '🎨', city: 'Krems' },
  { id: '3', name: 'Donauradweg', lat: 48.3, lng: 15.5, type: 'nature', icon: '🚲', city: 'Region' },
  { id: '4', name: 'Stift Klosterneuburg', lat: 48.3058, lng: 16.3258, type: 'culture', icon: '⛪', city: 'Klosterneuburg' },
]

export default function RegionGuidePage() {
  const { regionSlug } = useParams()
  const [selectedCity, setSelectedCity] = useState<typeof DEMO_CITIES[0] | null>(null)
  const [selectedHighlight, setSelectedHighlight] = useState<typeof DEMO_HIGHLIGHTS[0] | null>(null)
  const [showMap, setShowMap] = useState(true)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  // Regionszentrum berechnen
  const regionCenter = {
    lat: DEMO_CITIES.reduce((s, c) => s + c.lat, 0) / DEMO_CITIES.length,
    lng: DEMO_CITIES.reduce((s, c) => s + c.lng, 0) / DEMO_CITIES.length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold capitalize">{regionSlug || 'Region Guide'}</h1>
            <p className="text-white/50 text-sm">Entdecke die Region</p>
          </div>
        </div>
      </header>

      {/* Regionskarte */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-sm font-medium text-white/70">Regionskarte</span>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            {showMap ? 'Ausblenden' : 'Anzeigen'}
          </button>
        </div>

        {showMap && (
          apiKey ? (
            <APIProvider apiKey={apiKey}>
              <div className="rounded-xl overflow-hidden" style={{ height: '220px' }}>
                <Map
                  defaultCenter={selectedCity
                    ? { lat: selectedCity.lat, lng: selectedCity.lng }
                    : regionCenter
                  }
                  defaultZoom={selectedCity ? 13 : 10}
                  mapId="fintutto-regionguide-visitor"
                  gestureHandling="greedy"
                  colorScheme="DARK"
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* Städte-Pins */}
                  {DEMO_CITIES.map(city => (
                    <AdvancedMarker
                      key={city.id}
                      position={{ lat: city.lat, lng: city.lng }}
                      onClick={() => setSelectedCity(selectedCity?.id === city.id ? null : city)}
                    >
                      <Pin background="#6366f1" borderColor="#6366f1" glyphColor="#fff" glyph="🏙" />
                    </AdvancedMarker>
                  ))}

                  {/* Highlight-Pins */}
                  {DEMO_HIGHLIGHTS.map(h => (
                    <AdvancedMarker
                      key={h.id}
                      position={{ lat: h.lat, lng: h.lng }}
                      onClick={() => setSelectedHighlight(selectedHighlight?.id === h.id ? null : h)}
                    >
                      <Pin background="#f59e0b" borderColor="#f59e0b" glyphColor="#fff" glyph={h.icon} />
                    </AdvancedMarker>
                  ))}

                  {selectedCity && (
                    <InfoWindow
                      position={{ lat: selectedCity.lat, lng: selectedCity.lng }}
                      onCloseClick={() => setSelectedCity(null)}
                    >
                      <div className="p-2">
                        <p className="font-semibold text-gray-900">{selectedCity.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{selectedCity.pois} POIs</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedCity.highlights.map(h => (
                            <span key={h} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">{h}</span>
                          ))}
                        </div>
                        <Link
                          to={`/city/${selectedCity.id}`}
                          className="block mt-2 py-1 rounded bg-indigo-600 text-white text-xs text-center font-medium"
                        >
                          City Guide öffnen
                        </Link>
                      </div>
                    </InfoWindow>
                  )}

                  {selectedHighlight && (
                    <InfoWindow
                      position={{ lat: selectedHighlight.lat, lng: selectedHighlight.lng }}
                      onCloseClick={() => setSelectedHighlight(null)}
                    >
                      <div className="p-2">
                        <p className="font-semibold text-gray-900">{selectedHighlight.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{selectedHighlight.city}</p>
                        <button className="mt-2 w-full py-1 rounded bg-amber-500 text-white text-xs font-medium">
                          🎧 Audio-Guide
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </div>
            </APIProvider>
          ) : (
            <div className="rounded-xl bg-white/5 border border-white/10 h-48 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl block mb-2">🌄</span>
                <p className="text-white/50 text-sm">Regionskarte</p>
                <p className="text-white/30 text-xs mt-1">VITE_GOOGLE_MAPS_API_KEY fehlt</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Städte in der Region */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">
          Städte in der Region
          <span className="ml-2 text-sm text-white/40 font-normal">({DEMO_CITIES.length})</span>
        </h2>
        <div className="space-y-2">
          {DEMO_CITIES.map(city => (
            <div
              key={city.id}
              onClick={() => setSelectedCity(selectedCity?.id === city.id ? null : city)}
              className={`p-4 rounded-xl cursor-pointer transition ${
                selectedCity?.id === city.id
                  ? 'bg-indigo-600/40 border border-indigo-400/50'
                  : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{city.name}</div>
                  <div className="text-sm text-white/50 mt-0.5">{city.pois} POIs</div>
                </div>
                <Link
                  to={`/city/${city.id}`}
                  onClick={e => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-indigo-950 text-xs font-medium hover:bg-amber-300 transition"
                >
                  Erkunden →
                </Link>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {city.highlights.map(h => (
                  <span key={h} className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/60">{h}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Regionale Ausflüge */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Regionale Ausflüge</h2>
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚲</span>
              <div>
                <div className="font-medium">Donauradweg Etappe</div>
                <div className="text-sm text-white/50">Krems → Melk · 35 km · 3h</div>
              </div>
              <button className="ml-auto px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-400 text-xs font-medium">
                Route
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚌</span>
              <div>
                <div className="font-medium">Stifter-Tour</div>
                <div className="text-sm text-white/50">Melk + Klosterneuburg · Ganztag</div>
              </div>
              <button className="ml-auto px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-400 text-xs font-medium">
                Details
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top-Sehenswürdigkeiten */}
      <section className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Top-Sehenswürdigkeiten</h2>
        <div className="grid grid-cols-2 gap-3">
          {DEMO_HIGHLIGHTS.map(h => (
            <div key={h.id} className="rounded-xl bg-white/10 overflow-hidden hover:bg-white/15 transition cursor-pointer">
              <div className="h-24 flex items-center justify-center bg-white/5">
                <span className="text-4xl">{h.icon}</span>
              </div>
              <div className="p-3">
                <div className="text-sm font-medium">{h.name}</div>
                <div className="text-xs text-white/50 mt-0.5">{h.city}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Regionale Partner */}
      <section className="px-6 pb-24">
        <h2 className="text-lg font-semibold mb-3">Regionale Partner</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to={`/region/${regionSlug}/partners`}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition text-center"
          >
            <span className="text-2xl block mb-1">🍽️</span>
            <span className="text-sm">Restaurants</span>
          </Link>
          <Link
            to={`/region/${regionSlug}/partners`}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition text-center"
          >
            <span className="text-2xl block mb-1">🏨</span>
            <span className="text-sm">Hotels</span>
          </Link>
          <Link
            to={`/region/${regionSlug}/partners`}
            className="p-4 rounded-xl bg-white/10 hover:bg-white/15 transition text-center"
          >
            <span className="text-2xl block mb-1">🌳</span>
            <span className="text-sm">Natur</span>
          </Link>
          <Link
            to={`/region/${regionSlug}/offers`}
            className="p-4 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 transition text-center border border-amber-400/30"
          >
            <span className="text-2xl block mb-1">🎁</span>
            <span className="text-sm text-amber-300">Angebote</span>
          </Link>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur border-t border-white/10 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className="flex flex-col items-center text-white/50">
            <span className="text-lg">🏠</span>
            <span className="text-xs mt-1">Start</span>
          </Link>
          <Link to={`/region/${regionSlug}`} className="flex flex-col items-center text-amber-400">
            <span className="text-lg">🌄</span>
            <span className="text-xs mt-1">Region</span>
          </Link>
          <Link to="/scan" className="flex flex-col items-center text-white/50">
            <span className="text-lg">📷</span>
            <span className="text-xs mt-1">Scannen</span>
          </Link>
          <Link to="/bookings" className="flex flex-col items-center text-white/50">
            <span className="text-lg">📅</span>
            <span className="text-xs mt-1">Buchungen</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center text-white/50">
            <span className="text-lg">👤</span>
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
