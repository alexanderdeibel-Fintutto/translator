/**
 * Counter Stats Page
 *
 * Shows today's usage statistics for the counter staff.
 * Pulls data from sc_usage_stats and sc_sessions tables.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageSquare, Clock, Globe, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'

interface DayStats {
  total_sessions: number
  total_duration_seconds: number
  top_languages: { lang: string; count: number }[]
  avg_rating: number | null
}

export default function CounterStatsPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const [stats, setStats] = useState<DayStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [user])

  async function loadStats() {
    if (!user) return
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      // Heutige Sessions laden
      const { data: sessions } = await supabase
        .from('sc_sessions')
        .select('duration_seconds, guest_language, ended_at')
        .gte('started_at', `${today}T00:00:00`)
        .eq('staff_user_id', user.id)

      if (!sessions) {
        setStats({ total_sessions: 0, total_duration_seconds: 0, top_languages: [], avg_rating: null })
        return
      }

      // Sprachen zählen
      const langCount: Record<string, number> = {}
      let totalDuration = 0
      for (const s of sessions) {
        if (s.guest_language) {
          langCount[s.guest_language] = (langCount[s.guest_language] || 0) + 1
        }
        totalDuration += s.duration_seconds || 0
      }

      const topLangs = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang, count]) => ({ lang, count }))

      // Bewertungen laden
      const { data: feedback } = await supabase
        .from('sc_guest_feedback')
        .select('rating')
        .gte('created_at', `${today}T00:00:00`)

      const avgRating = feedback && feedback.length > 0
        ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length
        : null

      setStats({
        total_sessions: sessions.length,
        total_duration_seconds: totalDuration,
        top_languages: topLangs,
        avg_rating: avgRating,
      })
    } catch (err) {
      console.error('Stats-Fehler:', err)
      setStats({ total_sessions: 0, total_duration_seconds: 0, top_languages: [], avg_rating: null })
    } finally {
      setLoading(false)
    }
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    if (m < 60) return `${m} Min`
    return `${Math.floor(m / 60)}h ${m % 60}min`
  }

  const LANG_NAMES: Record<string, string> = {
    en: '🇬🇧 Englisch', de: '🇩🇪 Deutsch', fr: '🇫🇷 Französisch',
    es: '🇪🇸 Spanisch', it: '🇮🇹 Italienisch', ar: '🇸🇦 Arabisch',
    zh: '🇨🇳 Chinesisch', ja: '🇯🇵 Japanisch', ru: '🇷🇺 Russisch',
    pt: '🇵🇹 Portugiesisch', tr: '🇹🇷 Türkisch', pl: '🇵🇱 Polnisch',
    nl: '🇳🇱 Niederländisch', ko: '🇰🇷 Koreanisch', sv: '🇸🇪 Schwedisch',
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-bold">Heute am Counter</h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={loadStats} className="ml-auto">
          Aktualisieren
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Lade Statistiken...</div>
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-violet-700">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Gespräche</span>
              </div>
              <p className="text-3xl font-bold">{stats.total_sessions}</p>
              <p className="text-xs text-muted-foreground">heute</p>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-violet-700">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Gesamtzeit</span>
              </div>
              <p className="text-3xl font-bold">{formatDuration(stats.total_duration_seconds)}</p>
              <p className="text-xs text-muted-foreground">Übersetzungszeit</p>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-violet-700">
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Sprachen</span>
              </div>
              <p className="text-3xl font-bold">{stats.top_languages.length}</p>
              <p className="text-xs text-muted-foreground">verschiedene</p>
            </Card>

            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-violet-700">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Bewertung</span>
              </div>
              <p className="text-3xl font-bold">
                {stats.avg_rating ? `${stats.avg_rating.toFixed(1)} ★` : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Gäste-Feedback</p>
            </Card>
          </div>

          {/* Top Languages */}
          {stats.top_languages.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Häufigste Sprachen heute</h3>
              </div>
              <div className="space-y-2">
                {stats.top_languages.map(({ lang, count }) => (
                  <div key={lang} className="flex items-center gap-3">
                    <span className="text-sm flex-1">
                      {LANG_NAMES[lang] || lang.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-violet-500"
                        style={{ width: `${Math.max(20, (count / stats.total_sessions) * 120)}px` }}
                      />
                      <span className="text-xs text-muted-foreground w-6 text-right">{count}×</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Empty State */}
          {stats.total_sessions === 0 && (
            <Card className="p-8 text-center space-y-3">
              <Users className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="font-medium">Noch keine Gespräche heute</p>
              <p className="text-sm text-muted-foreground">
                Starten Sie ein Gespräch oder zeigen Sie Gästen den QR-Code.
              </p>
              <Button onClick={() => navigate('/')} variant="outline" className="mt-2">
                Zur Startseite
              </Button>
            </Card>
          )}
        </>
      ) : null}
    </div>
  )
}
