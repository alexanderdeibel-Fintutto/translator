'use client'

/**
 * Venue Management Page — Manage physical locations
 *
 * Features:
 * - Venue list (indoor, outdoor, mixed)
 * - Floor plan upload & editor
 * - Room management
 * - Artwork positioning (drag on floorplan)
 * - Mapbox integration for outdoor venues
 * - Beacon management
 * - GPS zone editor
 * - WiFi fingerprint calibration
 */
export default function VenuePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Standort & Raeume</h1>
            <p className="text-gray-500 mt-1">Grundrisse, Karten und Positionierung verwalten</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            + Neuer Standort
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            ['venues', '🏛 Standorte'],
            ['floorplans', '📐 Grundrisse'],
            ['map', '🗺 Karte (Outdoor)'],
            ['beacons', '📡 Beacons'],
            ['positioning', '📍 Positionierung'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                id === 'venues'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-2 gap-6">
          {/* Indoor Venue Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">🏛 Indoor-Standort</h3>
            <p className="text-sm text-gray-500 mb-4">
              Fuer klassische Museen und Galerien. Lade Grundrisse hoch und positioniere Kunstwerke darauf.
            </p>
            <button className="w-full py-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition text-sm">
              + Indoor-Standort anlegen
            </button>
          </div>

          {/* Outdoor Venue Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">🌳 Outdoor / Freilicht</h3>
            <p className="text-sm text-gray-500 mb-4">
              Fuer Freilichtmuseen, Naturparks und Skulpturengaerten. GPS-basierte Navigation mit Mapbox-Karten.
            </p>
            <button className="w-full py-3 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition text-sm">
              + Outdoor-Standort anlegen
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
