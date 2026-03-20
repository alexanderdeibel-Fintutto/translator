'use client'

/**
 * Tours Management Page — Create and manage guided tours
 *
 * Features:
 * - Tour list with status, audience, duration
 * - Drag & drop tour editor
 * - AI tour suggestion button
 * - Tour preview (simulates visitor experience)
 * - Audience-specific tours (children, youth, experts)
 */
export default function ToursPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fuehrungen</h1>
            <p className="text-gray-500 mt-1">Kuratierte und KI-generierte Touren verwalten</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">
              🤖 KI-Vorschlaege generieren
            </button>
            <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
              + Neue Fuehrung
            </button>
          </div>
        </div>

        {/* Tour Type Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            ['all', 'Alle'],
            ['curated', 'Kuratiert'],
            ['ai_generated', 'KI-generiert'],
            ['thematic', 'Thematisch'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                id === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tours List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
          <div className="py-12">
            <span className="text-5xl block mb-4">🗺</span>
            <p className="text-lg font-medium text-gray-600">Noch keine Fuehrungen erstellt</p>
            <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
              Erstelle deine erste Fuehrung manuell oder lass unsere KI basierend auf deiner Sammlung Vorschlaege machen.
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium">
                + Manuell erstellen
              </button>
              <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium">
                🤖 KI-Vorschlaege
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
