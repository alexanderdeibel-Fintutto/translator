import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps'

const categoryTabs = [
  { id: 'all', label: 'Alle', icon: '🏙' },
  { id: 'attraction', label: 'Sights', icon: '🏛' },
  { id: 'restaurant', label: 'Essen', icon: '🍽' },
  { id: 'hotel', label: 'Hotels', icon: '🏨' },
  { id: 'shop', label: 'Shopping', icon: '🛍' },
  { id: 'culture', label: 'Kultur', icon: '🎭' },
  { id: 'nature', label: 'Natur', icon: '🌳' },
  { id: 'nightlife', label: 'Nachtleben', icon: '🌙' },
]

// Demo-POIs (werden später aus Supabase geladen)
const DEMO_POIS = [
  { id: '1', name: 'Stephansdom', lat: 48.2084, lng: 16.3731, category: 'attraction', address: 'Stephansplatz 3, Wien', rating: 4.8 },
  { id: '2', name: 'Schloss Schönbrunn', lat: 48.1845, lng: 16.3122, category: 'attraction', address: 'Schönbrunner Schlossstr. 47', rating: 4.7 },
  { id: '3', name: 'Figlmüller', lat: 48.2089, lng: 16.3747, category: 'restaurant', address: 'Wollzeile 5, Wien', rating: 4.3 },
  { id: '4', name: 'Naschmarkt', lat: 48.1988, lng: 16.3614, category: 'shop', address: 'Naschmarkt, Wien', rating: 4.5 },
  { id: '5', name: 'Albertina', lat: 48.2046, lng: 16.3688, category: 'culture', address: 'Albertinaplatz 1, Wien', rating: 4.6 },
  { id: '6', name: 'Prater', lat: 48.2166, lng: 16.3961, category: 'nature', address: 'Prater, Wien', rating: 4.4 },
]

const CATEGORY_COLORS: Record<string, string> = {
  attraction: '#6366f1',
  restaurant: '#f59e0b',
  hotel: '#3b82f6',
  shop: '#ec4899',
  culture: '#8b5cf6',
  nature: '#10b981',
  nightlife: '#7c3aed',
}

const CATEGORY_ICONS: Record<string, string> = {
  attraction: '🏛',
  restaurant: '🍽',
  hotel: '🏨',
  shop: '🛍',
  culture: '🎭',
  nature: '🌳',
  nightlife: '🌙',
}

export default function CityGuidePage() {
  const { citySlug } = useParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [selectedPoi, setSelectedPoi] = useState<typeof DEMO_POIS[0] | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  const filteredPois = activeCategory === 'all'
    ? DEMO_POIS
    : DEMO_POIS.filter(p => p.category === activeCategory)

  function requestLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn('Standort nicht verfügbar'),
      )
    }
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
            <h1 className="text-xl font-bold capitalize">{citySlug || 'City Guide'}</h1>
            <p className="text-white/50 text-sm">Entdecke die Stadt</p>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
          <input
            type="search"
            placeholder="Orte, Restaurants, Aktivitäten suchen..."
            className="w-full px-4 py-3 pl-10 rounded-xl bg-white/10 text-white placeholder:text-white/40 border border-white/10 focus:border-amber-400/50 focus:outline-none transition"
          />
        </div>
      </div>

      {/* View Toggle */}
      <div className="px-6 mb-4 flex gap-2">
        <button
          onClick={() => setView('list')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            view === 'list' ? 'bg-amber-400 text-indigo-950' : 'bg-white/10 text-white/70'
          }`}
        >
          📋 Liste
        </button>
        <button
          onClick={() => setView('map')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            view === 'map' ? 'bg-amber-400 text-indigo-950' : 'bg-white/10 text-white/70'
          }`}
        >
          🗺️ Karte
        </button>
      </div>

      {/* Category Tabs */}
      <div className="px-6 mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {categoryTabs.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-indigo-950'
                  : 'bg-white/10 text-white/70 hover:bg-white/15'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'list' ? (
        <>
          {/* Quick Actions */}
          <div className="px-6 mb-6">
            <div className="grid grid-cols-3 gap-3">
              <Link
                to={`/city/${citySlug}/tours`}
                className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition"
              >
                <span className="text-2xl mb-1">🗺️</span>
                <span className="text-xs text-white/70">Touren</span>
              </Link>
              <Link
                to={`/city/${citySlug}/partners`}
                className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition"
              >
                <span className="text-2xl mb-1">🤝</span>
                <span className="text-xs text-white/70">Partner</span>
              </Link>
              <Link
                to={`/city/${citySlug}/offers`}
                className="flex flex-col items-center p-4 rounded-xl bg-white/10 hover:bg-white/15 transition"
              >
                <span className="text-2xl mb-1">🎁</span>
                <span className="text-xs text-white/70">Angebote</span>
              </Link>
            </div>
          </div>

          {/* POI-Liste */}
          <section className="px-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">
              {activeCategory === 'all' ? 'Highlights' : categoryTabs.find(c => c.id === activeCategory)?.label}
              <span className="ml-2 text-sm text-white/40 font-normal">({filteredPois.length})</span>
            </h2>
            <div className="space-y-3">
              {filteredPois.map(poi => (
                <div key={poi.id} className="rounded-xl bg-white/10 overflow-hidden hover:bg-white/15 transition cursor-pointer">
                  <div className="h-32 flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[poi.category] || '#6366f1'}33, ${CATEGORY_COLORS[poi.category] || '#6366f1'}11)` }}
                  >
                    <span className="text-5xl">{CATEGORY_ICONS[poi.category] || '📍'}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{poi.name}</h3>
                        <p className="text-sm text-white/50 mt-0.5">{poi.address}</p>
                      </div>
                      <span className="text-amber-400 text-sm font-medium">★ {poi.rating}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => { setSelectedPoi(poi); setView('map') }}
                        className="flex-1 py-1.5 rounded-lg bg-white/10 text-white/70 text-xs font-medium hover:bg-white/20 transition"
                      >
                        🗺️ Auf Karte
                      </button>
                      <button className="flex-1 py-1.5 rounded-lg bg-amber-400/20 text-amber-400 text-xs font-medium hover:bg-amber-400/30 transition">
                        🎧 Audio-Guide
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Nearby Partners */}
          <section className="px-6 pb-24">
            <h2 className="text-lg font-semibold mb-3">Partner in deiner Nähe</h2>
            {userLocation ? (
              <div className="p-4 rounded-xl bg-white/10 text-center">
                <p className="text-white/50 text-sm">Partner werden geladen...</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/10 text-center">
                <p className="text-white/50 text-sm">Standort aktivieren für Empfehlungen in der Nähe</p>
                <button
                  onClick={requestLocation}
                  className="mt-3 px-4 py-2 rounded-lg bg-amber-400 text-indigo-950 text-sm font-medium"
                >
                  📍 Standort aktivieren
                </button>
              </div>
            )}
          </section>
        </>
      ) : (
        /* Karten-Ansicht mit Google Maps */
        <div className="px-4 pb-24">
          {apiKey ? (
            <APIProvider apiKey={apiKey}>
              <div className="rounded-xl overflow-hidden" style={{ height: '65vh' }}>
                <Map
                  defaultCenter={selectedPoi
                    ? { lat: selectedPoi.lat, lng: selectedPoi.lng }
                    : { lat: 48.2082, lng: 16.3738 }
                  }
                  defaultZoom={selectedPoi ? 16 : 13}
                  mapId="fintutto-cityguide-visitor"
                  gestureHandling="greedy"
                  colorScheme="DARK"
                  style={{ width: '100%', height: '100%' }}
                >
                  {filteredPois.map(poi => (
                    <AdvancedMarker
                      key={poi.id}
                      position={{ lat: poi.lat, lng: poi.lng }}
                      onClick={() => setSelectedPoi(selectedPoi?.id === poi.id ? null : poi)}
                    >
                      <Pin
                        background={CATEGORY_COLORS[poi.category] || '#6366f1'}
                        borderColor={CATEGORY_COLORS[poi.category] || '#6366f1'}
                        glyphColor="#ffffff"
                        glyph={CATEGORY_ICONS[poi.category] || '📍'}
                      />
                    </AdvancedMarker>
                  ))}

                  {userLocation && (
                    <AdvancedMarker position={userLocation}>
                      <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-white shadow-lg" />
                    </AdvancedMarker>
                  )}

                  {selectedPoi && (
                    <InfoWindow
                      position={{ lat: selectedPoi.lat, lng: selectedPoi.lng }}
                      onCloseClick={() => setSelectedPoi(null)}
                    >
                      <div className="p-2 min-w-[180px]">
                        <p className="font-semibold text-gray-900">{selectedPoi.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{selectedPoi.address}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-amber-500 text-xs">★ {selectedPoi.rating}</span>
                        </div>
                        <button className="mt-2 w-full py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium">
                          🎧 Audio-Guide
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </div>

              {/* POI-Chips unter der Karte */}
              <div className="mt-3 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {filteredPois.map(poi => (
                    <button
                      key={poi.id}
                      onClick={() => setSelectedPoi(selectedPoi?.id === poi.id ? null : poi)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                        selectedPoi?.id === poi.id
                          ? 'bg-amber-400 text-indigo-950 font-medium'
                          : 'bg-white/10 text-white/70 hover:bg-white/15'
                      }`}
                    >
                      <span>{CATEGORY_ICONS[poi.category] || '📍'}</span>
                      {poi.name}
                    </button>
                  ))}
                </div>
              </div>

              {!userLocation && (
                <button
                  onClick={requestLocation}
                  className="mt-3 w-full py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition"
                >
                  📍 Meinen Standort anzeigen
                </button>
              )}
            </APIProvider>
          ) : (
            <div className="rounded-xl bg-white/5 border border-white/10 h-64 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl block mb-3">🗺️</span>
                <p className="text-white/50 text-sm">Google Maps API-Key nicht konfiguriert</p>
                <p className="text-white/30 text-xs mt-1">VITE_GOOGLE_MAPS_API_KEY fehlt</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-indigo-950/95 backdrop-blur border-t border-white/10 px-6 py-3">
        <div className="flex justify-around max-w-md mx-auto">
          <Link to="/" className="flex flex-col items-center text-white/50">
            <span className="text-lg">🏠</span>
            <span className="text-xs mt-1">Start</span>
          </Link>
          <Link to={`/city/${citySlug}`} className="flex flex-col items-center text-amber-400">
            <span className="text-lg">🏙</span>
            <span className="text-xs mt-1">City Guide</span>
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
