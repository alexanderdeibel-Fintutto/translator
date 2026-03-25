'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'

interface ConferenceDashboardStats {
  sessionsTotal: number
  speakersTotal: number
  attendeesTotal: number
  translationMinutesUsed: number
  importJobsRunning: number
}

export default function ConferenceDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<ConferenceDashboardStats | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
    setTimeout(() => {
      setStats({ sessionsTotal: 0, speakersTotal: 0, attendeesTotal: 0, translationMinutesUsed: 0, importJobsRunning: 0 })
      setLoading(false)
    }, 600)
  }, [])

  const orgName = userEmail ? (userEmail.split('@')[1]?.split('.')[0] ?? 'Ihr Kongresszentrum') : 'Ihr Kongresszentrum'
  const orgLabel = orgName.charAt(0).toUpperCase() + orgName.slice(1)

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{loading ? 'Dashboard' : `${orgLabel} · Dashboard`}</h1>
          <p className="text-gray-500 mt-1">Übersicht für Ihr Kongresszentrum & Ihre Events</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/import/conference" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">📂 Programm importieren</Link>
          <Link href="/dashboard/live-translation" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition">🔊 Live-Übersetzung starten</Link>
        </div>
      </div>

      {!loading && stats?.sessionsTotal === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center mb-8">
          <div className="text-5xl mb-4">🎤</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Willkommen im Conference Portal!</h2>
          <p className="text-slate-600 mb-4">Importieren Sie Ihr Konferenzprogramm oder starten Sie direkt eine Live-Übersetzungssession.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/import/conference" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition">Programm importieren →</Link>
            <Link href="/dashboard/live-translation" className="inline-block px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition">Live-Session starten →</Link>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Sessions gesamt', value: stats.sessionsTotal, icon: '🎤', href: '/dashboard/sessions', color: 'text-slate-700' },
            { label: 'Sprecher', value: stats.speakersTotal, icon: '🎙', href: '/dashboard/speakers', color: 'text-blue-700' },
            { label: 'Teilnehmer', value: stats.attendeesTotal, icon: '👥', href: '/dashboard/attendees', color: 'text-green-700' },
            { label: 'Übersetzungs-Min.', value: stats.translationMinutesUsed, icon: '🔊', href: '/dashboard/live-translation', color: 'text-purple-700' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-xl p-5 border border-gray-200 hover:border-slate-400 hover:shadow-sm transition group">
              <div className="flex items-center justify-between mb-2"><span className="text-2xl">{stat.icon}</span><span className="text-xs text-gray-400 group-hover:text-slate-600 transition">→</span></div>
              <div className={`text-3xl font-bold ${stat.color}`}>{loading ? <span className="text-gray-300 animate-pulse">—</span> : stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </Link>
          ))}
        </div>
      )}

      {stats && stats.importJobsRunning > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl animate-spin">⚙️</span>
          <div>
            <p className="font-medium text-amber-900">{stats.importJobsRunning} Import-Job{stats.importJobsRunning > 1 ? 's' : ''} läuft gerade</p>
            <p className="text-sm text-amber-700">Die KI verarbeitet Ihr Konferenzprogramm. Das kann einige Minuten dauern.</p>
          </div>
          <Link href="/dashboard/import" className="ml-auto px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition">Status ansehen →</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">⚡ Schnellaktionen</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🎤', label: 'Programm importieren', href: '/dashboard/import/conference' },
              { icon: '🔊', label: 'Live-Übersetzung', href: '/dashboard/live-translation' },
              { icon: '📨', label: 'Einladungen senden', href: '/dashboard/invite-campaigns' },
              { icon: '📈', label: 'Analytics', href: '/dashboard/analytics' },
            ].map(action => (
              <Link key={action.label} href={action.href} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-slate-100 hover:text-slate-800 transition text-sm font-medium text-gray-700">
                <span>{action.icon}</span>{action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">💳 Plan & Nutzung</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aktueller Plan</span>
              <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">Conference Basic</span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Übersetzungsminuten</span>
                <span>{stats?.translationMinutesUsed ?? 0} / 2.000 Min.</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-600 rounded-full transition-all" style={{ width: `${Math.min(((stats?.translationMinutesUsed ?? 0) / 2000) * 100, 100)}%` }} />
              </div>
            </div>
            <Link href="/dashboard/billing" className="block text-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition">Auf Pro upgraden →</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">📅 Nächste Sessions</h3>
            <Link href="/dashboard/sessions" className="text-xs text-slate-600 hover:underline">Alle →</Link>
          </div>
          <div className="text-center py-8 text-gray-400 text-sm">
            Noch keine Sessions. <Link href="/dashboard/import/conference" className="text-slate-600 hover:underline">Programm importieren →</Link>
          </div>
        </div>
      </div>
    </>
  )
}
