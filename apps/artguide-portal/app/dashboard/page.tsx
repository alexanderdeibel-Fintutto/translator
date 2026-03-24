'use client'

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Uebersicht fuer dein Museum & City Guide</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
            + Kunstwerk hinzufuegen
          </button>
          <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">
            KI-Fuehrung erstellen
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Besucher heute', value: '—', icon: '👥' },
          { label: 'Audio-Wiedergaben', value: '—', icon: '🎧' },
          { label: 'Partner aktiv', value: '—', icon: '🤝' },
          { label: 'Buchungen (Monat)', value: '—', icon: '📅' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Offene Reviews</h3>
          <div className="text-center py-8 text-gray-400">Keine offenen Reviews</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">🤝 Neue Partner-Anfragen</h3>
          <div className="text-center py-8 text-gray-400">Keine neuen Anfragen</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">🏆 Beliebteste POIs</h3>
          <div className="text-center py-8 text-gray-400">Noch keine Besucherdaten</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">📅 Letzte Buchungen</h3>
          <div className="text-center py-8 text-gray-400">Noch keine Buchungen</div>
        </div>
      </div>
    </>
  )
}
