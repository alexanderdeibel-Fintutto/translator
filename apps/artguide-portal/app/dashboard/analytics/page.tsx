'use client'
import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

type DayData = {
  date: string
  visitors_total: number
  visitors_app: number
  visitors_qr: number
  visitors_web: number
  audio_plays: number
  avg_session_minutes: number
  artworks_viewed: number
  tours_started: number
  tours_completed: number
}

const RANGES = [
  { label: '7 Tage', value: '7d' },
  { label: '30 Tage', value: '30d' },
  { label: '90 Tage', value: '90d' },
]

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function shortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('30d')
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics?range=${range}`)
      .then(r => r.json())
      .then(d => { setData(d.analytics || []); setIsDemo(d.demo) })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [range])

  const totals = data.reduce((acc, d) => ({
    visitors: acc.visitors + d.visitors_total,
    audio: acc.audio + d.audio_plays,
    artworks: acc.artworks + d.artworks_viewed,
    tours: acc.tours + d.tours_started,
    completed: acc.completed + d.tours_completed,
  }), { visitors: 0, audio: 0, artworks: 0, tours: 0, completed: 0 })

  const avgSession = data.length > 0
    ? Math.round(data.reduce((a, d) => a + d.avg_session_minutes, 0) / data.length * 10) / 10
    : 0

  const completionRate = totals.tours > 0
    ? Math.round((totals.completed / totals.tours) * 100)
    : 0

  const statCards = [
    { label: 'Besucher gesamt', value: fmt(totals.visitors), icon: '👥', color: 'text-indigo-600', bg: 'bg-indigo-50', sub: `Ø ${Math.round(totals.visitors / (data.length || 1))}/Tag` },
    { label: 'Audio-Wiedergaben', value: fmt(totals.audio), icon: '🎙', color: 'text-purple-600', bg: 'bg-purple-50', sub: `Ø ${(totals.visitors > 0 ? (totals.audio / totals.visitors).toFixed(1) : 0)} pro Besucher` },
    { label: 'Ø Session-Dauer', value: `${avgSession} min`, icon: '⏱', color: 'text-green-600', bg: 'bg-green-50', sub: 'Pro Besucher' },
    { label: 'Fuehrungs-Abschluss', value: `${completionRate}%`, icon: '🗺', color: 'text-amber-600', bg: 'bg-amber-50', sub: `${totals.completed} von ${totals.tours} gestartet` },
  ]

  const accessData = data.length > 0 ? [
    { name: 'App', value: Math.round(data.reduce((a, d) => a + d.visitors_app, 0) / (totals.visitors || 1) * 100), color: '#6366f1' },
    { name: 'QR-Code', value: Math.round(data.reduce((a, d) => a + d.visitors_qr, 0) / (totals.visitors || 1) * 100), color: '#f59e0b' },
    { name: 'Web', value: Math.round(data.reduce((a, d) => a + d.visitors_web, 0) / (totals.visitors || 1) * 100), color: '#10b981' },
  ] : []

  const dateRange = range // keep for compatibility

  void dateRange // suppress unused warning

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">
            Besucher-Metriken und Nutzungsanalyse
            {isDemo && <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Demo-Daten</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map(r => (
            <button key={r.value} onClick={() => setRange(r.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                range === r.value ? 'bg-indigo-900 text-white border-indigo-900' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{loading ? '...' : s.value}</div>
            <div className="text-sm font-medium text-gray-900 mt-1">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">📈 Besucher-Verlauf</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">Lade Daten...</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAudio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} interval={Math.floor(data.length / 6)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={v => new Date(v).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any, name: any) => [v, name === 'visitors_total' ? 'Besucher' : 'Audio-Plays']}
              />
              <Legend formatter={v => v === 'visitors_total' ? 'Besucher' : 'Audio-Plays'} />
              <Area type="monotone" dataKey="visitors_total" stroke="#6366f1" fill="url(#colorVisitors)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="audio_plays" stroke="#a855f7" fill="url(#colorAudio)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📅 Besuche nach Wochentag</h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-gray-400">Lade...</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(() => {
                const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
                const counts = Array(7).fill(0)
                data.forEach(d => { counts[new Date(d.date).getDay()] += d.visitors_total })
                return days.map((name, i) => ({ name, Besucher: counts[i] }))
              })()} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Besucher" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📱 Zugangsarten</h3>
          {loading || accessData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">Lade...</div>
          ) : (
            <div className="space-y-4 pt-4">
              {accessData.map(item => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">{item.name}</span>
                    <span className="font-bold" style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">Basierend auf {fmt(totals.visitors)} Besuchen</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">🎯 Fuehrungs-Konversions-Trichter</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Besucher gesamt', value: totals.visitors, pct: 100, color: 'bg-indigo-500' },
            { label: 'Exponat aufgerufen', value: totals.artworks, pct: totals.visitors > 0 ? Math.min(100, Math.round(totals.artworks / totals.visitors * 100)) : 0, color: 'bg-blue-500' },
            { label: 'Fuehrung gestartet', value: totals.tours, pct: totals.visitors > 0 ? Math.round(totals.tours / totals.visitors * 100) : 0, color: 'bg-amber-500' },
            { label: 'Fuehrung abgeschlossen', value: totals.completed, pct: totals.visitors > 0 ? Math.round(totals.completed / totals.visitors * 100) : 0, color: 'bg-green-500' },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className={`${step.color} text-white rounded-xl py-4 px-3 mb-2`}>
                <div className="text-2xl font-bold">{loading ? '...' : fmt(step.value)}</div>
                <div className="text-xs opacity-80 mt-1">{step.pct}%</div>
              </div>
              <p className="text-xs text-gray-600 font-medium">{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">🔥 Besucher-Heatmap</h3>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">Erfordert Grundriss-Upload</span>
        </div>
        <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center text-gray-400">
            <span className="text-5xl block mb-3">🗺</span>
            <p className="font-medium text-gray-500">Grundriss hochladen um Heatmap zu aktivieren</p>
            <p className="text-sm mt-1">Zeigt Besucherstroeome und Verweildauer pro Bereich</p>
            <button className="mt-4 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition">
              Grundriss hochladen
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
