import { useEffect, useState } from 'react'
import { Calendar, FileText, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { fetchSessionStats, type SessionStats as SessionStatsData } from '@/lib/session-management-api'

function StatCard({ label, value, icon: Icon, color }: {
  label: string
  value: number
  icon: typeof Calendar
  color: string
}) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  )
}

export default function SessionStatsView() {
  const [stats, setStats] = useState<SessionStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessionStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Lade Statistiken...</div>
  }

  if (!stats) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Session-Statistiken</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Sessions gesamt" value={stats.totalSessions} icon={Calendar} color="bg-blue-500" />
        <StatCard label="Entwuerfe" value={stats.draftSessions} icon={Clock} color="bg-slate-500" />
        <StatCard label="Vorbereitet" value={stats.preparedSessions} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard label="Aktiv" value={stats.activeSessions} icon={AlertCircle} color="bg-amber-500" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Teilnehmer" value={stats.totalParticipants} icon={Users} color="bg-violet-500" />
        <StatCard label="Pre-Translations" value={stats.totalPreTranslations} icon={FileText} color="bg-indigo-500" />
        <StatCard label="Ausstehende Uebersetzungen" value={stats.pendingTranslations} icon={Clock} color="bg-orange-500" />
      </div>
    </div>
  )
}
