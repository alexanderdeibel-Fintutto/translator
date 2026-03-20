'use client'

import { useState } from 'react'
import Link from 'next/link'

const importModes = [
  {
    key: 'museum',
    icon: '🏛',
    title: 'Museum / Galerie',
    description: 'Kunstwerke, Katalog-PDFs, Werkslisten importieren. KI generiert Beschreibungen, Uebersetzungen und Audio.',
    features: ['CSV/Excel Werksliste', 'Katalog-PDF Parser', 'Foto-Batch mit EXIF', 'Kuenstler-Datenbank-Abgleich', 'KI-Beschreibungen in 12 Sprachen'],
    href: '/dashboard/import/museum',
    color: 'indigo',
  },
  {
    key: 'city',
    icon: '🏙',
    title: 'Stadt / City Guide',
    description: 'POIs automatisch aus OpenStreetMap, Google Places und Wikipedia importieren und aufbereiten.',
    features: ['OpenStreetMap Auto-Import', 'Google Places Integration', 'Wikipedia-Extraktion', 'Automatische Kategorisierung', 'Walking-Tour-Generator'],
    href: '/dashboard/import/city',
    color: 'emerald',
  },
  {
    key: 'conference',
    icon: '🎤',
    title: 'Kongress / Konferenz',
    description: 'Programm-PDFs, Speaker-Listen und Raum-Plaene in einen interaktiven Guide verwandeln.',
    features: ['Programm-PDF Parser', 'Speaker-Bio Generator', 'Zeitbasierte Navigation', 'Session-Empfehlungen', 'Raumplan-Import'],
    href: '/dashboard/import/conference',
    color: 'amber',
  },
  {
    key: 'fair',
    icon: '🎪',
    title: 'Messe / Ausstellung',
    description: 'Ausstellerverzeichnisse und Hallenplaene digitalisieren fuer interaktive Messe-Navigation.',
    features: ['Ausstellerverzeichnis-Import', 'Hallenplan-Digitalisierung', 'Produkt-Kategorisierung', 'Besucher-Routing', 'Aussteller Self-Service'],
    href: '/dashboard/import/fair',
    color: 'rose',
  },
]

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-700' },
}

// Mock recent imports for dashboard
const recentImports = [
  { id: 'job-1', mode: 'museum', title: 'Werksliste_2024.xlsx', items: 347, status: 'completed', date: '2026-03-18' },
  { id: 'job-2', mode: 'city', title: 'Wien POIs (Google Places)', items: 1203, status: 'enriching', date: '2026-03-19' },
  { id: 'job-3', mode: 'conference', title: 'WebSummit_Programm.pdf', items: 89, status: 'review', date: '2026-03-20' },
]

const statusColors: Record<string, string> = {
  uploaded: 'bg-gray-100 text-gray-600',
  analyzing: 'bg-blue-100 text-blue-700',
  mapping: 'bg-purple-100 text-purple-700',
  enriching: 'bg-yellow-100 text-yellow-700',
  review: 'bg-orange-100 text-orange-700',
  importing: 'bg-cyan-100 text-cyan-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  uploaded: 'Hochgeladen',
  analyzing: 'KI analysiert...',
  mapping: 'Feld-Zuordnung',
  enriching: 'KI anreichern...',
  review: 'Zur Pruefung',
  importing: 'Wird importiert...',
  completed: 'Abgeschlossen',
  failed: 'Fehlgeschlagen',
}

export default function ImportHubPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Content Import-Zentrale</h1>
        <p className="text-gray-500 mt-1">
          Inhalte hochladen, KI analysieren und anreichern lassen, pruefen und importieren — alles an einem Ort.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Aktive Imports', value: '3', icon: '📥', color: 'bg-blue-50 text-blue-700' },
          { label: 'In Pruefung', value: '89', icon: '👁', color: 'bg-orange-50 text-orange-700' },
          { label: 'KI-Generierungen heute', value: '1.247', icon: '🤖', color: 'bg-purple-50 text-purple-700' },
          { label: 'Importiert gesamt', value: '4.892', icon: '✅', color: 'bg-green-50 text-green-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <span className={`text-2xl w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </span>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Import Mode Cards */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Neuen Import starten</h2>
      <div className="grid grid-cols-2 gap-5 mb-10">
        {importModes.map((mode) => {
          const colors = colorMap[mode.color]
          return (
            <Link
              key={mode.key}
              href={mode.href}
              className={`group rounded-xl border-2 ${colors.border} ${colors.bg} p-6 hover:shadow-lg transition-all hover:-translate-y-0.5`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{mode.icon}</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${colors.text} group-hover:underline`}>
                    {mode.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{mode.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mode.features.map((f) => (
                      <span key={f} className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <span className={`text-xl ${colors.text} opacity-50 group-hover:opacity-100 transition`}>
                  →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Imports */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Letzte Imports</h2>
      <div className="bg-white rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Typ</th>
              <th className="p-4 font-medium">Quelle</th>
              <th className="p-4 font-medium">Eintraege</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Datum</th>
              <th className="p-4 font-medium">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {recentImports.map((job) => (
              <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="p-4">
                  <span className="text-lg">
                    {job.mode === 'museum' ? '🏛' : job.mode === 'city' ? '🏙' : '🎤'}
                  </span>
                </td>
                <td className="p-4 text-sm font-medium text-gray-900">{job.title}</td>
                <td className="p-4 text-sm text-gray-600">{job.items.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                    {statusLabels[job.status]}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{job.date}</td>
                <td className="p-4">
                  <Link
                    href={`/dashboard/import/${job.id}`}
                    className="text-sm text-indigo-600 font-medium hover:underline"
                  >
                    Oeffnen
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
