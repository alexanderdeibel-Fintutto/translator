'use client'
import { useState, useEffect } from 'react'

type DashboardStats = {
  artworks_total: number
  artworks_published: number
  artworks_draft: number
  artworks_review: number
  tours_total: number
  audio_generated: number
  languages_active: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)

  useEffect(() => {
    fetch('/api/artworks')
      .then(r => r.json())
      .then(d => {
        const artworks = d.artworks || []
        setStats({
          artworks_total: artworks.length,
          artworks_published: artworks.filter((a: { status: string }) => a.status === 'published').length,
          artworks_draft: artworks.filter((a: { status: string }) => a.status === 'draft').length,
          artworks_review: artworks.filter((a: { status: string }) => a.status === 'review').length,
          tours_total: 0,
          audio_generated: artworks.filter((a: { audio_url: string | null }) => a.audio_url).length,
          languages_active: 2,
        })
      })
      .catch(() => setStats({ artworks_total: 0, artworks_published: 0, artworks_draft: 0, artworks_review: 0, tours_total: 0, audio_generated: 0, languages_active: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const onboardingSteps = [
    { id: 'import', label: 'Exponate importieren', icon: '📥', done: (stats?.artworks_total || 0) > 0, href: '/dashboard/import/museum', action: 'Import starten' },
    { id: 'enrich', label: 'KI-Anreicherung', icon: '✨', done: (stats?.artworks_published || 0) > 0, href: '/dashboard/artworks', action: 'Anreichern' },
    { id: 'audio', label: 'Audio generieren', icon: '🎙', done: (stats?.audio_generated || 0) > 0, href: '/dashboard/audio', action: 'Audio erstellen' },
    { id: 'tour', label: 'Erste Fuehrung', icon: '🗺', done: (stats?.tours_total || 0) > 0, href: '/dashboard/tours', action: 'Fuehrung erstellen' },
    { id: 'publish', label: 'Veroeffentlichen', icon: '🚀', done: false, href: '/dashboard/artworks', action: 'Jetzt live gehen' },
  ]

  const completedSteps = onboardingSteps.filter(s => s.done).length
  const onboardingComplete = completedSteps === onboardingSteps.length

  const statCards = [
    { label: 'Exponate gesamt', value: loading ? '...' : String(stats?.artworks_total || 0), icon: '🖼', color: 'text-indigo-600', bg: 'bg-indigo-50', sub: `${stats?.artworks_published || 0} veroeffentlicht` },
    { label: 'In Review', value: loading ? '...' : String(stats?.artworks_review || 0), icon: '👀', color: 'text-yellow-600', bg: 'bg-yellow-50', sub: 'Warten auf Freigabe' },
    { label: 'Fuehrungen', value: loading ? '...' : String(stats?.tours_total || 0), icon: '🗺', color: 'text-green-600', bg: 'bg-green-50', sub: 'KI-generiert & kuratiert' },
    { label: 'Audio-Tracks', value: loading ? '...' : String(stats?.audio_generated || 0), icon: '🎙', color: 'text-purple-600', bg: 'bg-purple-50', sub: `${stats?.languages_active || 0} Sprachen aktiv` },
  ]

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Willkommen im Fintutto Art Guide CMS</p>
        </div>
        <div className="flex gap-3">
          <a href="/dashboard/import/museum" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition">📥 Import</a>
          <a href="/dashboard/tours" className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition">🤖 KI-Fuehrung erstellen</a>
          <a href="/dashboard/artworks" className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">+ Exponat hinzufuegen</a>
        </div>
      </div>

      {!onboardingDismissed && !onboardingComplete && (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">🚀 Dein Museum in 5 Schritten live bringen</h3>
              <p className="text-indigo-200 text-sm mt-1">{completedSteps} von {onboardingSteps.length} Schritten abgeschlossen</p>
            </div>
            <button onClick={() => setOnboardingDismissed(true)} className="text-indigo-300 hover:text-white transition text-sm">Spaeter</button>
          </div>
          <div className="w-full bg-indigo-800 rounded-full h-1.5 mb-5">
            <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(completedSteps / onboardingSteps.length) * 100}%` }} />
          </div>
          <div className="grid grid-cols-5 gap-3">
            {onboardingSteps.map((step, idx) => (
              <a key={step.id} href={step.href}
                className={`p-3 rounded-xl transition text-center ${step.done ? 'bg-green-500/20 border border-green-400/30' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}>
                <div className="text-2xl mb-1">{step.done ? '✅' : step.icon}</div>
                <div className="text-xs font-medium text-white">{step.label}</div>
                <div className="text-xs text-indigo-300 mt-0.5">{step.done ? 'Erledigt' : step.action}</div>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold mx-auto mt-2">{idx + 1}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-xl mb-3`}>{stat.icon}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm font-medium text-gray-900 mt-1">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">📋 Workflow-Status</h3>
            <a href="/dashboard/workflow" className="text-xs text-indigo-600 hover:underline">Alle anzeigen →</a>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Entwurf', count: stats?.artworks_draft || 0, color: 'bg-gray-300', textColor: 'text-gray-600' },
              { label: 'In Review', count: stats?.artworks_review || 0, color: 'bg-yellow-300', textColor: 'text-yellow-700' },
              { label: 'Veroeffentlicht', count: stats?.artworks_published || 0, color: 'bg-green-400', textColor: 'text-green-700' },
            ].map(col => (
              <div key={col.label} className="flex items-center gap-3">
                <span className={`text-xs font-medium ${col.textColor} w-28`}>{col.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className={`${col.color} h-2 rounded-full transition-all`}
                    style={{ width: stats?.artworks_total ? `${(col.count / stats.artworks_total) * 100}%` : '0%' }} />
                </div>
                <span className="text-sm font-bold text-gray-700 w-6 text-right">{col.count}</span>
              </div>
            ))}
          </div>
          {(stats?.artworks_total || 0) === 0 && (
            <div className="text-center py-4 mt-2">
              <p className="text-sm text-gray-400">Noch keine Exponate</p>
              <a href="/dashboard/import/museum" className="text-xs text-indigo-600 hover:underline mt-1 block">Import starten →</a>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">⚡ Schnellaktionen</h3>
          <div className="space-y-2">
            {[
              { icon: '📥', label: 'CSV importieren', desc: 'Exponate aus Tabelle laden', href: '/dashboard/import/museum', color: 'hover:bg-indigo-50 hover:border-indigo-200' },
              { icon: '🤖', label: 'KI-Fuehrung generieren', desc: 'In 30 Sekunden fertig', href: '/dashboard/tours', color: 'hover:bg-amber-50 hover:border-amber-200' },
              { icon: '🎙', label: 'Audio generieren', desc: 'Alle Werke auf Knopfdruck', href: '/dashboard/audio', color: 'hover:bg-purple-50 hover:border-purple-200' },
              { icon: '📱', label: 'QR-Codes drucken', desc: 'PDF fuer alle Exponate', href: '/dashboard/artworks', color: 'hover:bg-green-50 hover:border-green-200' },
            ].map(action => (
              <a key={action.label} href={action.href}
                className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 transition ${action.color}`}>
                <span className="text-xl">{action.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{action.label}</div>
                  <div className="text-xs text-gray-400">{action.desc}</div>
                </div>
                <span className="ml-auto text-gray-300">→</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">🏆 Beliebteste Exponate</h3>
            <a href="/dashboard/analytics" className="text-xs text-indigo-600 hover:underline">Analytics →</a>
          </div>
          <div className="text-center py-8 text-gray-400">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm text-gray-500">Besucherdaten werden nach dem ersten Scan verfuegbar</p>
            <p className="text-xs text-gray-400 mt-1">QR-Codes generieren und aushaengen um Daten zu sammeln</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">🕐 Letzte Aktivitaet</h3>
          {(stats?.artworks_total || 0) > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs">✅</span>
                <div><span className="font-medium text-gray-900">{stats?.artworks_total} Exponate</span> <span className="text-gray-500">importiert</span></div>
                <span className="ml-auto text-xs text-gray-400">Heute</span>
              </div>
              {(stats?.audio_generated || 0) > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs">🎙</span>
                  <div><span className="font-medium text-gray-900">{stats?.audio_generated} Audio-Tracks</span> <span className="text-gray-500">generiert</span></div>
                  <span className="ml-auto text-xs text-gray-400">Heute</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🕐</div>
              <p className="text-sm">Noch keine Aktivitaet</p>
              <a href="/dashboard/import/museum" className="text-xs text-indigo-600 hover:underline mt-1 block">Jetzt starten →</a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
