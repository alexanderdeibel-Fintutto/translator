'use client'

export default function RegionPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Region Guide</h1>
          <p className="text-gray-500 mt-1">Verwalte mehrere Staedte und Regionen auf einer Plattform</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">
          + Neue Region
        </button>
      </div>

      {/* Region Overview */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Regionen</h3>
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-3">🌄</span>
            <p className="text-sm">Noch keine Regionen angelegt</p>
            <button className="mt-3 px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium">
              + Region anlegen
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Staedte in dieser Region</h3>
          <div className="text-center py-8 text-gray-400">
            <span className="text-4xl block mb-3">🏙</span>
            <p className="text-sm">Zuerst eine Region anlegen</p>
          </div>
        </div>
      </div>

      {/* Region Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Regionen', value: '0' },
          { label: 'Staedte', value: '0' },
          { label: 'POIs (Region)', value: '0' },
          { label: 'Partner (Region)', value: '0' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Region Features */}
      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="font-semibold text-indigo-900 mb-3">Region Guide Features</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: 'Multi-Stadt', desc: 'Mehrere Staedte unter einer Region buendeln' },
            { title: 'Regionale Touren', desc: 'Tagesausfluege ueber mehrere Staedte hinweg' },
            { title: 'Partner-Netzwerk', desc: 'Regionale Partner uebergreifend verwalten' },
          ].map(f => (
            <div key={f.title}>
              <h4 className="font-medium text-indigo-900 text-sm">{f.title}</h4>
              <p className="text-xs text-indigo-700 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
