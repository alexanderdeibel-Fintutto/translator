'use client'
export default function AnalyticsPage() {
  const stats = [
    { label: 'Übersetzungsminuten', value: '1.247', change: '+12%' },
    { label: 'Aktive Teilnehmer', value: '384', change: '+8%' },
    { label: 'Sessions gesamt', value: '42', change: '+3' },
    { label: 'Sprachen genutzt', value: '12', change: '+2' },
  ]
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-sm mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-cyan-400 text-xs mt-1">{s.change}</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Top Sessions nach Teilnehmern</h2>
        <p className="text-slate-400 text-sm">Detaillierte Auswertungen werden nach der ersten Konferenz angezeigt.</p>
      </div>
    </div>
  )
}
