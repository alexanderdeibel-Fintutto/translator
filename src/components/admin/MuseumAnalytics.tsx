// Fintutto World — Museum Analytics Dashboard
// Shows visitor stats, popular artworks, tour completions, and engagement metrics

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3, Users, Eye, Headphones, MessageCircle, Clock,
  TrendingUp, Route, Star, Loader2, Download,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'react-router-dom'

interface MuseumStats {
  total_visitors: number
  total_artworks_viewed: number
  total_audio_plays: number
  total_ai_chats: number
  avg_visit_duration_minutes: number
  tour_completion_rate: number
  avg_rating: number
  top_artworks: { artwork_id: string; title: string; views: number }[]
  daily_visitors: { date: string; count: number }[]
  languages: { language: string; count: number }[]
}

export default function MuseumAnalytics() {
  const [searchParams] = useSearchParams()
  const [museums, setMuseums] = useState<{ id: string; name: string }[]>([])
  const [museumId, setMuseumId] = useState(searchParams.get('museum') || '')
  const [stats, setStats] = useState<MuseumStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    supabase
      .from('ag_museums')
      .select('id, name')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) {
          setMuseums(data)
          if (!museumId && data.length === 1) setMuseumId(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (museumId) loadStats()
  }, [museumId, dateRange])

  async function loadStats() {
    setLoading(true)

    const now = new Date()
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365
    const dateFrom = new Date(now.getTime() - days * 86400000).toISOString().split('T')[0]

    // Fetch analytics data
    const [analyticsRes, topArtworksRes, visitsRes, aiChatsRes] = await Promise.all([
      supabase
        .from('ag_analytics_daily')
        .select('*')
        .eq('museum_id', museumId)
        .gte('date', dateFrom)
        .order('date'),
      supabase.rpc('ag_get_top_artworks', { p_museum_id: museumId, p_limit: 10 }),
      supabase
        .from('ag_visits')
        .select('duration_minutes, artworks_viewed, audio_plays, overall_rating, language, tour_id, tour_completed')
        .eq('museum_id', museumId)
        .gte('started_at', dateFrom),
      supabase
        .from('ag_ai_chats')
        .select('id', { count: 'exact', head: true })
        .eq('museum_id', museumId)
        .gte('created_at', dateFrom),
    ])

    const analytics = analyticsRes.data || []
    const visits = visitsRes.data || []

    // Compute stats
    const totalVisitors = analytics.reduce((s: number, d: Record<string, number>) => s + (d.unique_visitors || 0), 0) || visits.length
    const totalViews = visits.reduce((s: number, v: Record<string, number>) => s + (v.artworks_viewed || 0), 0)
    const totalAudio = visits.reduce((s: number, v: Record<string, number>) => s + (v.audio_plays || 0), 0)
    const totalAiChats = aiChatsRes.count || 0
    const avgDuration = visits.length > 0
      ? visits.reduce((s: number, v: Record<string, number>) => s + (v.duration_minutes || 0), 0) / visits.length
      : 0
    const ratings = visits.filter((v: Record<string, number | null>) => v.overall_rating != null)
    const avgRating = ratings.length > 0
      ? ratings.reduce((s: number, v: Record<string, number>) => s + v.overall_rating, 0) / ratings.length
      : 0

    // Tour completion rate
    const tourVisits = visits.filter((v: Record<string, unknown>) => v.tour_id != null)
    const completedTours = tourVisits.filter((v: Record<string, unknown>) => v.tour_completed === true)
    const tourCompletionRate = tourVisits.length > 0
      ? Math.round((completedTours.length / tourVisits.length) * 100)
      : 0

    // Language distribution
    const langCounts: Record<string, number> = {}
    for (const v of visits) {
      const lang = (v as Record<string, string>).language || 'de'
      langCounts[lang] = (langCounts[lang] || 0) + 1
    }
    const languages = Object.entries(langCounts)
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count)

    // Daily visitors from analytics
    const dailyVisitors = analytics.map((d: Record<string, unknown>) => ({
      date: d.date as string,
      count: (d.unique_visitors as number) || 0,
    }))

    // Fetch artwork titles for top artworks
    const artworkIds = (topArtworksRes.data || []).map((a: Record<string, unknown>) => a.artwork_id as string)
    const { data: artworkNames } = artworkIds.length > 0
      ? await supabase.from('ag_artworks').select('id, title').in('id', artworkIds)
      : { data: [] }
    const nameMap = Object.fromEntries((artworkNames || []).map((a: Record<string, unknown>) => [a.id, ((a.title as Record<string, string>)?.de || (a.title as Record<string, string>)?.en || 'Unbekannt')]))

    setStats({
      total_visitors: totalVisitors,
      total_artworks_viewed: totalViews,
      total_audio_plays: totalAudio,
      total_ai_chats: totalAiChats,
      avg_visit_duration_minutes: Math.round(avgDuration),
      tour_completion_rate: tourCompletionRate,
      avg_rating: Math.round(avgRating * 10) / 10,
      top_artworks: (topArtworksRes.data || []).map((a: Record<string, unknown>) => ({
        artwork_id: a.artwork_id as string,
        title: nameMap[a.artwork_id as string] || (a.artwork_id as string)?.slice(0, 8) + '...',
        views: (a.views as number) || 0,
      })),
      daily_visitors: dailyVisitors,
      languages,
    })
    setLoading(false)
  }

  function exportCsv() {
    if (!stats) return
    const museumName = museums.find(m => m.id === museumId)?.name || 'museum'

    const rows = [
      ['Metrik', 'Wert'],
      ['Besucher', String(stats.total_visitors)],
      ['Exponate angesehen', String(stats.total_artworks_viewed)],
      ['Audio abgespielt', String(stats.total_audio_plays)],
      ['KI-Gespraeche', String(stats.total_ai_chats)],
      ['Durchschn. Besuchsdauer (Min)', String(stats.avg_visit_duration_minutes)],
      ['Durchschn. Bewertung', String(stats.avg_rating)],
      ['', ''],
      ['Datum', 'Besucher'],
      ...stats.daily_visitors.map(d => [d.date, String(d.count)]),
      ['', ''],
      ['Sprache', 'Anzahl'],
      ...stats.languages.map(l => [l.language, String(l.count)]),
      ['', ''],
      ['Exponat', 'Views'],
      ...stats.top_artworks.map(a => [a.title, String(a.views)]),
    ]

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics_${museumName}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statCards = stats ? [
    { label: 'Besucher', value: stats.total_visitors, icon: Users, color: 'text-blue-500' },
    { label: 'Exponate angesehen', value: stats.total_artworks_viewed, icon: Eye, color: 'text-emerald-500' },
    { label: 'Audio abgespielt', value: stats.total_audio_plays, icon: Headphones, color: 'text-violet-500' },
    { label: 'KI-Gespraeche', value: stats.total_ai_chats, icon: MessageCircle, color: 'text-amber-500' },
    { label: 'Ø Besuchsdauer', value: `${stats.avg_visit_duration_minutes} Min.`, icon: Clock, color: 'text-cyan-500' },
    { label: 'Ø Bewertung', value: stats.avg_rating > 0 ? `${stats.avg_rating}/5` : '—', icon: Star, color: 'text-yellow-500' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Museum-Analysen
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Besucherstatistiken, beliebte Exponate und Engagement-Metriken.
          </p>
        </div>
        {stats && (
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" /> CSV Export
          </Button>
        )}
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <Label>Museum</Label>
          <Select value={museumId} onValueChange={setMuseumId}>
            <SelectTrigger>
              <SelectValue placeholder="Museum auswaehlen..." />
            </SelectTrigger>
            <SelectContent>
              {museums.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Zeitraum</Label>
          <Select value={dateRange} onValueChange={v => setDateRange(v as typeof dateRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Tage</SelectItem>
              <SelectItem value="30d">30 Tage</SelectItem>
              <SelectItem value="90d">90 Tage</SelectItem>
              <SelectItem value="all">Gesamt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : !stats ? (
        <Card className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">Waehle ein Museum</h3>
          <p className="text-sm text-muted-foreground">um die Analysen zu sehen.</p>
        </Card>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statCards.map(card => (
              <Card key={card.label} className="p-4 text-center">
                <card.icon className={`h-5 w-5 mx-auto mb-1 ${card.color}`} />
                <div className="text-xl font-bold">{card.value}</div>
                <div className="text-xs text-muted-foreground">{card.label}</div>
              </Card>
            ))}
          </div>

          {/* Daily visitors chart (simple bar representation) */}
          {stats.daily_visitors.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Besucher pro Tag
              </h3>
              <div className="flex items-end gap-1 h-32">
                {stats.daily_visitors.slice(-30).map((d, i) => {
                  const maxCount = Math.max(...stats.daily_visitors.map(x => x.count), 1)
                  const height = (d.count / maxCount) * 100
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors relative group"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 bg-foreground text-background px-1 rounded whitespace-nowrap">
                        {d.count}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Top artworks */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Beliebteste Exponate
              </h3>
              {stats.top_artworks.length > 0 ? (
                <div className="space-y-2">
                  {stats.top_artworks.map((a, i) => (
                    <div key={a.artwork_id} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs w-6 text-center">{i + 1}</Badge>
                      <span className="flex-1 truncate">{a.title}</span>
                      <span className="text-muted-foreground">{a.views} Views</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Daten vorhanden.</p>
              )}
            </Card>

            {/* Language distribution */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Route className="h-4 w-4" />
                Sprachen der Besucher
              </h3>
              {stats.languages.length > 0 ? (
                <div className="space-y-2">
                  {stats.languages.map(l => {
                    const total = stats.languages.reduce((s, x) => s + x.count, 0)
                    const pct = total > 0 ? Math.round((l.count / total) * 100) : 0
                    return (
                      <div key={l.language} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="uppercase font-mono">{l.language}</span>
                          <span className="text-muted-foreground">{pct}% ({l.count})</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Daten vorhanden.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
