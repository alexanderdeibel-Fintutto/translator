'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useMuseum } from '@/lib/hooks'

type DashboardStats = {
  artworks_total: number
  artworks_published: number
  artworks_draft: number
  artworks_review: number
  tours_total: number
  audio_generated: number
  languages_active: number
}

type TopArtwork = {
  id: string
  title: unknown
  artist_name: string | null
  scan_count: number
  audio_plays: number
}

type RecentActivity = {
  type: string
  label: string
  time: string
  icon: string
}

function t(value: unknown, lang = 'de'): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const obj = value as Record<string, string>
    return obj[lang] || obj['de'] || obj['en'] || Object.values(obj)[0] || ''
  }
  return String(value)
}

export default function DashboardPage() {
  const { museum } = useMuseum()
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)
  const [topArtworks, setTopArtworks] = useState<TopArtwork[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [todayVisitors, setTodayVisitors] = useState<number | null>(null)

  useEffect(() => {
    if (!museum?.id) return
    const museumId = museum.id

    async function loadAll() {
      setLoading(true)
      try {
        // Load artworks stats
        const { data: artworks } = await supabase
          .from('ag_artworks')
          .select('id, status, audio_url, title, artist_name, created_at')
          .eq('museum_id', museumId)

        // Load tours count
        const { count: toursCount } = await supabase
          .from('ag_tours')
          .select('id', { count: 'exact', head: true })
          .eq('museum_id', museumId)

        // Load museum languages
        const langs = museum.languages || ['de', 'en']

        const arr = artworks || []
        setStats({
          artworks_total: arr.length,
          artworks_published: arr.filter((a: { status: string }) => a.status === 'published').length,
          artworks_draft: arr.filter((a: { status: string }) => a.status === 'draft').length,
          artworks_review: arr.filter((a: { status: string }) => a.status === 'review').length,
          tours_total: toursCount || 0,
          audio_generated: arr.filter((a: { audio_url: string | null }) => a.audio_url).length,
          languages_active: langs.length,
        })

        // Load top artworks from analytics events
        const { data: topEvents } = await supabase
          .from('ag_analytics_events')
          .select('artwork_id, event_type')
          .eq('museum_id', museumId)
          .in('event_type', ['qr_scan', 'audio_play'])
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

        if (topEvents && topEvents.length > 0) {
          // Aggregate by artwork
          const counts: Record<string, { scan_count: number; audio_plays: number }> = {}
          for (const ev of topEvents) {
            if (!ev.artwork_id) continue
            if (!counts[ev.artwork_id]) counts[ev.artwork_id] = { scan_count: 0, audio_plays: 0 }
            if (ev.event_type === 'qr_scan') counts[ev.artwork_id].scan_count++
            if (ev.event_type === 'audio_play') counts[ev.artwork_id].audio_plays++
          }
          const topIds = Object.entries(counts)
            .sort((a, b) => (b[1].scan_count + b[1].audio_plays) - (a[1].scan_count + a[1].audio_plays))
            .slice(0, 5)
            .map(([id]) => id)

          if (topIds.length > 0) {
            const { data: topArts } = await supabase
              .from('ag_artworks')
              .select('id, title, artist_name')
              .in('id', topIds)
            setTopArtworks((topArts || []).map(a => ({
              ...a,
              scan_count: counts[a.id]?.scan_count || 0,
              audio_plays: counts[a.id]?.audio_plays || 0,
            })))
          }
        }

        // Load today's visitor count
        const today = new Date().toISOString().split('T')[0]
        const { data: todayData } = await supabase
          .from('ag_analytics_daily')
          .select('visitors_total')
          .eq('museum_id', museumId)
          .eq('date', today)
          .single()
        setTodayVisitors(todayData?.visitors_total ?? null)

        // Recent activity from artwork changes
        const { data: recent } = await supabase
          .from('ag_artworks')
          .select('id, title, status, created_at, updated_at')
          .eq('museum_id', museumId)
          .order('updated_at', { ascending: false })
          .limit(5)

        if (recent) {
          setRecentActivity(recent.map((a: { id: string; title: unknown; status: string; created_at: string; updated_at: string }) => ({
            type: a.status,
            label: t(a.title) || 'Unbekanntes Werk',
            time: new Date(a.updated_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
            icon: a.status === 'published' ? '✅' : a.status === 'review' ? '👀' : '📝',
          })))
        }
      } catch (e) {
        console.error('Dashboard load error:', e)
        setStats({ artworks_total: 0, artworks_published: 0, artworks_draft: 0, artworks_review: 0, tours_total: 0, audio_generated: 0, languages_active: 0 })
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [museum?.id])

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
          {topArtworks.length > 0 ? (
            <div className="space-y-3">
              {topArtworks.map((artwork, i) => (
                <a
                  key={artwork.id}
                  href={`/dashboard/artworks/${artwork.id}`}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-400'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t(artwork.title)}</p>
                    <p className="text-xs text-gray-400">{artwork.artist_name || 'Unbekannt'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-gray-700">{artwork.scan_count} Scans</p>
                    <p className="text-xs text-gray-400">{artwork.audio_plays} Audio</p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm text-gray-500">Daten nach dem ersten QR-Scan verfügbar</p>
              <a href="/dashboard/artworks" className="text-xs text-indigo-600 hover:underline mt-1 block">QR-Codes generieren →</a>
            </div>
          )}
          {todayVisitors !== null && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Besucher heute</span>
              <span className="text-sm font-bold text-indigo-600">{todayVisitors}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">🕐 Letzte Änderungen</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs flex-shrink-0">
                    {activity.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{activity.label}</p>
                    <p className="text-xs text-gray-400 capitalize">{activity.type}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-400 flex-shrink-0">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">🕐</div>
              <p className="text-sm">Noch keine Aktivität</p>
              <a href="/dashboard/import/museum" className="text-xs text-indigo-600 hover:underline mt-1 block">Jetzt starten →</a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
