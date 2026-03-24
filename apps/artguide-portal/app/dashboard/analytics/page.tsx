'use client'

import { useState } from 'react'

/**
 * Analytics Dashboard — Visitor insights for museums
 *
 * Features:
 * - Visitor count over time (line chart)
 * - Top artworks by views
 * - Average visit duration
 * - Heatmap overlay on floorplan
 * - Demographics breakdown
 * - Audio play statistics
 * - AI chat usage
 * - Tour completion rates
 * - Language distribution
 * - Entry method stats (app, QR, NFC, web)
 * - Export to CSV/PDF
 */
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d')

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Besucherstatistiken und Engagement-Metriken</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
              {[
                ['7d', '7 Tage'],
                ['30d', '30 Tage'],
                ['90d', '90 Tage'],
                ['1y', '1 Jahr'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setDateRange(id)}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    dateRange === id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              📥 Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Besucher gesamt', value: '—', trend: '', icon: '👥' },
            { label: 'Ø Verweildauer', value: '—', trend: '', icon: '⏱' },
            { label: 'Audio-Plays', value: '—', trend: '', icon: '🎧' },
            { label: 'KI-Chats', value: '—', trend: '', icon: '💬' },
            { label: 'Ø Bewertung', value: '—', trend: '', icon: '⭐' },
          ].map(metric => (
            <div key={metric.label} className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{metric.icon}</span>
                {metric.trend && (
                  <span className="text-xs text-green-600 font-medium">{metric.trend}</span>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-500 mt-1">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Visitor Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">📈 Besucher-Verlauf</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <span className="text-4xl block mb-2">📊</span>
                <p className="text-sm">Diagramm wird geladen...</p>
                <p className="text-xs text-gray-300 mt-1">Recharts / Chart.js Integration</p>
              </div>
            </div>
          </div>

          {/* Top Artworks */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🏆 Beliebteste Werke</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <span className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                    {i}
                  </span>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-2 bg-gray-100 rounded w-1/2" />
                  </div>
                  <span className="text-sm text-gray-400">— Views</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Demographics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">👥 Altersverteilung</h3>
            <div className="space-y-3">
              {[
                ['Kind (6-12)', 0],
                ['Jugendlich (13-17)', 0],
                ['Jung (18-25)', 0],
                ['Erwachsen (26-59)', 0],
                ['Senior (60+)', 0],
              ].map(([label, pct]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="text-gray-400">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🌍 Sprachen</h3>
            <div className="text-center py-8 text-gray-400">
              Noch keine Sprachdaten
            </div>
          </div>

          {/* Entry Methods */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">📱 Zugangsarten</h3>
            <div className="space-y-3">
              {[
                ['App', '📱', 0],
                ['QR-Code', '📷', 0],
                ['NFC', '📡', 0],
                ['Web', '🌐', 0],
                ['Kiosk', '🖥', 0],
              ].map(([label, icon, pct]) => (
                <div key={label as string} className="flex items-center gap-3">
                  <span>{icon}</span>
                  <span className="text-sm text-gray-600 flex-1">{label}</span>
                  <span className="text-sm text-gray-400">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floorplan Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🔥 Besucher-Heatmap</h3>
          <p className="text-sm text-gray-500 mb-4">
            Zeigt wo Besucher die meiste Zeit verbringen. Basierend auf Positionierungsdaten.
          </p>
          <div className="aspect-video bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-400">
              <span className="text-4xl block mb-2">🗺</span>
              <p>Heatmap wird geladen...</p>
              <p className="text-xs mt-1">Benoetigt Positionierungsdaten</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
