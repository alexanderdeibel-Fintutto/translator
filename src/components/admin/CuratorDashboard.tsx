// Fintutto World — Curator Dashboard
// Uebersichtseite mit Statistik-Karten, Schnellzugriff und letzten Aenderungen
// Erste Seite die ein Kurator sieht nach dem Login

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Globe, FileText, Languages, Eye, Image, Volume2,
  AlertTriangle, CheckCircle2, Clock, ArrowRight,
  Plus, Upload, Sparkles, BarChart3, TrendingUp,
  Landmark, Star, Send, Search as SearchIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ── Types ───────────────────────────────────────────────────────────

interface DashboardStats {
  totalItems: number
  published: number
  drafts: number
  inReview: number
  archived: number
  highlights: number
  withMedia: number
  withAudio: number
  avgCompleteness: number
  recentlyUpdated: number
  totalViews: number
}

interface RecentChange {
  id: string
  name: string
  status: string
  content_type: string
  domain: string
  updated_at: string
  parent_name: string | null
  cover_image_url: string | null
}

interface QuickAction {
  label: string
  description: string
  icon: typeof Globe
  path: string
  color: string
}

// ── Component ───────────────────────────────────────────────────────

export default function CuratorDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentItems, setRecentItems] = useState<RecentChange[]>([])
  const [needsAttention, setNeedsAttention] = useState<RecentChange[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)

    // Load all items for stats
    const { data: all, count: totalCount } = await supabase
      .from('fw_content_items')
      .select('id, status, is_highlight, cover_image_url, content_brief, content_standard, view_count, updated_at', { count: 'exact' })
      .limit(1000)

    const items = all || []

    const published = items.filter(i => i.status === 'published').length
    const drafts = items.filter(i => i.status === 'draft').length
    const inReview = items.filter(i => i.status === 'review').length
    const archived = items.filter(i => i.status === 'archived').length
    const highlights = items.filter(i => i.is_highlight).length
    const withMedia = items.filter(i => i.cover_image_url).length
    const totalViews = items.reduce((sum, i) => sum + (i.view_count || 0), 0)

    // Audio count (simplified check)
    const { count: audioCount } = await supabase
      .from('fw_content_items')
      .select('id', { count: 'exact', head: true })
      .not('domain_data->audio_url', 'is', null)

    // Completeness: items with at least content_brief AND content_standard in DE
    const complete = items.filter(i => {
      const brief = (i.content_brief as Record<string, string>)?.de
      const standard = (i.content_standard as Record<string, string>)?.de
      return brief && standard
    }).length

    const avgCompleteness = items.length > 0 ? Math.round((complete / items.length) * 100) : 0

    // Recently updated (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const recentlyUpdated = items.filter(i => i.updated_at > weekAgo).length

    setStats({
      totalItems: totalCount || items.length,
      published,
      drafts,
      inReview,
      archived,
      highlights,
      withMedia,
      withAudio: audioCount || 0,
      avgCompleteness,
      recentlyUpdated,
      totalViews,
    })

    // Load recent changes
    const { data: recent } = await supabase
      .from('fw_content_items')
      .select('id, name, status, content_type, domain, updated_at, parent_name, cover_image_url')
      .order('updated_at', { ascending: false })
      .limit(8)

    setRecentItems((recent || []).map(r => ({
      ...r,
      name: (r.name as Record<string, string>)?.de || r.id,
    })))

    // Items needing attention: drafts without content_brief or description
    const { data: attention } = await supabase
      .from('fw_content_items')
      .select('id, name, status, content_type, domain, updated_at, parent_name, cover_image_url')
      .eq('status', 'draft')
      .order('created_at', { ascending: true })
      .limit(5)

    setNeedsAttention((attention || []).map(a => ({
      ...a,
      name: (a.name as Record<string, string>)?.de || a.id,
    })))

    setLoading(false)
  }

  const quickActions: QuickAction[] = [
    { label: 'Neuer Inhalt', description: 'POI manuell anlegen', icon: Plus, path: '/admin/content', color: 'text-blue-500' },
    { label: 'Import', description: 'CSV/JSON importieren', icon: Upload, path: '/admin/content-import', color: 'text-green-500' },
    { label: 'KI anreichern', description: 'Texte generieren', icon: Sparkles, path: '/admin/ai-content', color: 'text-purple-500' },
    { label: 'Analysen', description: 'Nutzungsstatistiken', icon: BarChart3, path: '/admin/museum-analytics', color: 'text-amber-500' },
  ]

  const statusColor: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    review: 'bg-amber-100 text-amber-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-600',
  }

  const statusLabel: Record<string, string> = {
    draft: 'Entwurf',
    review: 'Review',
    published: 'Live',
    archived: 'Archiviert',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Landmark className="h-6 w-6" />
          Curator Dashboard
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ueberblick ueber alle Inhalte, Status und naechste Schritte.
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard icon={Globe} label="Gesamt" value={stats.totalItems} />
          <StatCard icon={CheckCircle2} label="Live" value={stats.published} color="text-green-500" />
          <StatCard icon={FileText} label="Entwuerfe" value={stats.drafts} color="text-slate-500" />
          <StatCard icon={Clock} label="In Review" value={stats.inReview} color="text-amber-500" />
          <StatCard icon={Image} label="Mit Bild" value={stats.withMedia} color="text-blue-500" />
          <StatCard icon={Volume2} label="Mit Audio" value={stats.withAudio} color="text-purple-500" />
        </div>
      )}

      {/* Completeness + Views Row */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Inhaltsqualitaet</span>
              <span className="text-2xl font-bold">{stats.avgCompleteness}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${stats.avgCompleteness}%`,
                  backgroundColor: stats.avgCompleteness >= 80 ? '#22c55e' :
                    stats.avgCompleteness >= 50 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Anteil der Eintraege mit Kurz- und Standardbeschreibung.
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Seitenaufrufe</span>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-2xl font-bold">{stats.totalViews.toLocaleString('de-DE')}</span>
            <p className="text-xs text-muted-foreground mt-1">
              Gesamte Views aller Inhalte.
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Letzte 7 Tage</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-2xl font-bold">{stats.recentlyUpdated}</span>
            <p className="text-xs text-muted-foreground mt-1">
              Eintraege aktualisiert in den letzten 7 Tagen.
            </p>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Schnellzugriff</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(action => (
            <Card
              key={action.path}
              className="p-4 cursor-pointer hover:border-primary transition group"
              onClick={() => navigate(action.path)}
            >
              <action.icon className={`h-6 w-6 mb-2 ${action.color}`} />
              <h4 className="font-semibold text-sm">{action.label}</h4>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Changes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Letzte Aenderungen</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/content')}>
              Alle anzeigen <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          <div className="space-y-1.5">
            {recentItems.map(item => (
              <Card
                key={item.id}
                className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition"
                onClick={() => navigate('/admin/content')}
              >
                {item.cover_image_url ? (
                  <img src={item.cover_image_url} alt="" className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.parent_name || item.domain} — {formatTimeAgo(item.updated_at)}
                  </p>
                </div>
                <Badge className={`text-[10px] ${statusColor[item.status] || ''}`}>
                  {statusLabel[item.status] || item.status}
                </Badge>
              </Card>
            ))}
            {recentItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Noch keine Inhalte vorhanden.</p>
            )}
          </div>
        </div>

        {/* Needs Attention */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Braucht Aufmerksamkeit
            </h3>
          </div>
          <div className="space-y-1.5">
            {needsAttention.map(item => (
              <Card
                key={item.id}
                className="p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition"
                onClick={() => navigate('/admin/content')}
              >
                <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Entwurf — erstellt {formatTimeAgo(item.updated_at)}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-7">
                  Bearbeiten
                </Button>
              </Card>
            ))}
            {needsAttention.length === 0 && (
              <Card className="p-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Alles erledigt!</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      {stats && stats.totalItems > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Status-Verteilung</h3>
          <div className="flex h-4 rounded-full overflow-hidden bg-muted">
            {stats.published > 0 && (
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(stats.published / stats.totalItems) * 100}%` }}
                title={`${stats.published} Live`}
              />
            )}
            {stats.inReview > 0 && (
              <div
                className="bg-amber-500 transition-all"
                style={{ width: `${(stats.inReview / stats.totalItems) * 100}%` }}
                title={`${stats.inReview} Review`}
              />
            )}
            {stats.drafts > 0 && (
              <div
                className="bg-slate-400 transition-all"
                style={{ width: `${(stats.drafts / stats.totalItems) * 100}%` }}
                title={`${stats.drafts} Entwuerfe`}
              />
            )}
            {stats.archived > 0 && (
              <div
                className="bg-red-400 transition-all"
                style={{ width: `${(stats.archived / stats.totalItems) * 100}%` }}
                title={`${stats.archived} Archiviert`}
              />
            )}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Live ({stats.published})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Review ({stats.inReview})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Entwurf ({stats.drafts})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Archiviert ({stats.archived})</span>
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Helper Components ───────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'text-foreground',
}: {
  icon: typeof Globe
  label: string
  value: number
  color?: string
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-1">
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  )
}

// ── Utilities ───────────────────────────────────────────────────────

export function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'gerade eben'
  if (minutes < 60) return `vor ${minutes} Min.`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `vor ${hours} Std.`

  const days = Math.floor(hours / 24)
  if (days < 7) return `vor ${days} Tagen`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `vor ${weeks} Wo.`

  const months = Math.floor(days / 30)
  return `vor ${months} Mon.`
}
