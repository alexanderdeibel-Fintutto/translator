import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Users, TrendingUp, Trophy, XCircle, Calculator, MessageSquare } from 'lucide-react'
import { fetchAdminStats } from '@/lib/admin-api'
import type { AdminStatsData } from '@/lib/admin-types'

export default function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Lade Statistiken...</div>
  }

  if (!stats) return null

  const cards = [
    { label: 'Leads gesamt', value: stats.totalLeads, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Aktive Pipeline', value: stats.activePipeline, icon: TrendingUp, color: 'text-violet-600 dark:text-violet-400' },
    { label: 'Demo/Angebot', value: stats.demoAngebot, icon: Calculator, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Gewonnen', value: stats.gewonnen, icon: Trophy, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Verloren', value: stats.verloren, icon: XCircle, color: 'text-red-600 dark:text-red-400' },
    { label: 'Offene Anfragen', value: stats.openRequests, icon: MessageSquare, color: 'text-cyan-600 dark:text-cyan-400' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Statistik</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map(card => (
          <Card key={card.label} className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs text-muted-foreground">{card.label}</span>
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
