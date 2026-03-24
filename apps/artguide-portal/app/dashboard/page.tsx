'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useMuseum } from '../../lib/hooks'
import { createClient } from '@/lib/supabase-client'

interface DashboardStats {
  artworksTotal: number
  artworksPublished: number
  artworksDraft: number
  artworksReview: number
  audioGenerated: number
  importJobsRunning: number
}

interface RecentArtwork {
  id: string
  title: string
  artist_name: string | null
  status: string
  updated_at: string
}

export default function DashboardPage() {
  const { museum, loading: museumLoading } = useMuseum()
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentArtworks, setRecentArtworks] = useState<RecentArtwork[]>([])
  const [pendingReviews, setPendingReviews] = useState<RecentArtwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!museum?.id) return
    async function loadStats() {
      setLoading(true)
      const museumId = museum!.id
      const [
        { count: total },
        { count: published },
        { count: draft },
        { count: review },
        { count: audio },
        { count: jobs },
        { data: recent },
        { data: pending },
      ] = await Promise.all([
        supabase.from('ag_artworks').select('*', { count: 'exact', head: true }).eq('museum_id', museumId),
        supabase.from('ag_artworks').select('*', { count: 'exact', head: true }).eq('museum_id', museumId).eq('status', 'published'),
        supabase.from('ag_artworks').select('*', { count: 'exact', head: true }).eq('museum_id', museumId).eq('status', 'draft'),
        supabase.from('ag_artworks').select('*', { count: 'exact', head: true }).eq('museum_id', museumId).eq('status', 'review'),
        supabase.from('ag_audio_files').select('*', { count: 'exact', head: true }).eq('museum_id', museumId),
        supabase.from('ag_import_jobs').select('*', { count: 'exact', head: true }).eq('museum_id', museumId).in('status', ['pending', 'processing']),
        supabase.from('ag_artworks').select('id, title, artist_name, status, updated_at').eq('museum_id', museumId).order('updated_at', { ascending: false }).limit(5),
        supabase.from('ag_artworks').select('id, title, artist_name, status, updated_at').eq('museum_id', museumId).eq('status', 'review').order('updated_at', { ascending: false }).limit(5),
      ])
      setStats({ artworksTotal: total || 0, artworksPublished: published || 0, artworksDraft: draft || 0, artworksReview: review || 0, audioGenerated: audio || 0, importJobsRunning: jobs || 0 })
      setRecentArtworks(recent || [])
      setPendingReviews(pending || [])
      setLoading(false)
    }
    loadStats()
  }, [museum?.id])

  const statusColors: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', review: 'bg-yellow-100 text-yellow-700', published: 'bg-green-100 text-green-700', archived: 'bg-red-100 text-red-600' }
  const statusLabels: Record<string, string> = { draft: 'Entwurf', review: 'Review', published: 'Live', archived: 'Archiviert' }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{museumLoading ? 'Dashboard' : museum ? museum.name : 'Dashboard'}</h1>
          <p className="text-gray-500 mt-1">{museum?.address?.city ? `${museum.address.city} · ` : ''}Übersicht für dein Museum & City Guide</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/import/museum" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">📂 Importieren</Link>
          <Link href="/dashboard/artworks/new" className="px-4 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition">+ Kunstwerk hinzufügen</Link>
        </div>
      </div>

      {!museumLoading && !museum && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-8 text-center mb-8">
          <div className="text-5xl mb-4">🏛</div>
          <h2 className="text-xl font-bold text-indigo-900 mb-2">Willkommen im Art Guide CMS!</h2>
          <p className="text-indigo-700 mb-4">Erstelle zuerst dein Museum, um loszulegen.</p>
          <Link href="/dashboard/settings" className="inline-block px-6 py-3 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition">Museum einrichten →</Link>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Kunstwerke gesamt', value: stats.artworksTotal, icon: '🖼', href: '/dashboard/artworks', color: 'text-indigo-700' },
            { label: 'Veröffentlicht', value: stats.artworksPublished, icon: '✅', href: '/dashboard/artworks?status=published', color: 'text-green-700' },
            { label: 'In Review', value: stats.artworksReview, icon: '🔍', href: '/dashboard/artworks?status=review', color: 'text-yellow-700' },
            { label: 'Audio-Dateien', value: stats.audioGenerated, icon: '🎧', href: '/dashboard/audio', color: 'text-purple-700' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-xl p-5 border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition group">
              <div className="flex items-center justify-between mb-2"><span className="text-2xl">{stat.icon}</span><span className="text-xs text-gray-400 group-hover:text-indigo-500 transition">→</span></div>
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
            <p className="text-sm text-amber-700">Die KI verarbeitet deine Daten. Das kann einige Minuten dauern.</p>
          </div>
          <Link href="/dashboard/import" className="ml-auto px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition">Status ansehen →</Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">📋 Offene Reviews</h3>
            {pendingReviews.length > 0 && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{pendingReviews.length}</span>}
          </div>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Keine offenen Reviews ✓</div>
          ) : (
            <div className="space-y-2">
              {pendingReviews.map(a => (
                <Link key={a.id} href={`/dashboard/artworks/${a.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group">
                  <div><p className="font-medium text-gray-900 text-sm group-hover:text-indigo-700 transition">{a.title}</p><p className="text-xs text-gray-400">{a.artist_name || '—'}</p></div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Review</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">🕐 Zuletzt bearbeitet</h3>
            <Link href="/dashboard/artworks" className="text-xs text-indigo-600 hover:underline">Alle →</Link>
          </div>
          {recentArtworks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Noch keine Kunstwerke. <Link href="/dashboard/import/museum" className="text-indigo-600 hover:underline">Jetzt importieren →</Link></div>
          ) : (
            <div className="space-y-2">
              {recentArtworks.map(a => (
                <Link key={a.id} href={`/dashboard/artworks/${a.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group">
                  <div><p className="font-medium text-gray-900 text-sm group-hover:text-indigo-700 transition">{a.title}</p><p className="text-xs text-gray-400">{a.artist_name || '—'} · {new Date(a.updated_at).toLocaleDateString('de-DE')}</p></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[a.status] || 'bg-gray-100 text-gray-600'}`}>{statusLabels[a.status] || a.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">⚡ Schnellaktionen</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🏛', label: 'Museum Import', href: '/dashboard/import/museum' },
              { icon: '🏙', label: 'Stadt Import', href: '/dashboard/import/city' },
              { icon: '🎧', label: 'Audio generieren', href: '/dashboard/audio' },
              { icon: '📱', label: 'QR-Codes drucken', href: '/dashboard/artworks' },
            ].map(action => (
              <Link key={action.label} href={action.href} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 transition text-sm font-medium text-gray-700">
                <span>{action.icon}</span>{action.label}
              </Link>
            ))}
          </div>
        </div>

        {stats && (
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">📊 Sammlungs-Fortschritt</h3>
            {stats.artworksTotal === 0 ? (
              <div className="text-center py-4 text-gray-400 text-sm">Noch keine Kunstwerke importiert.</div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Veröffentlicht', count: stats.artworksPublished, color: 'bg-green-500' },
                  { label: 'In Review', count: stats.artworksReview, color: 'bg-yellow-400' },
                  { label: 'Entwurf', count: stats.artworksDraft, color: 'bg-gray-300' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{item.label}</span><span>{item.count} / {stats.artworksTotal}</span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${stats.artworksTotal > 0 ? (item.count / stats.artworksTotal) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
