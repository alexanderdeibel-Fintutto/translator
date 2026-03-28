// Admin Dashboard — Main overview page
'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from '@/components/MetricCard'
import { VitalsChart } from '@/components/VitalsChart'
import { ErrorList } from '@/components/ErrorList'
import { TranslationStats } from '@/components/TranslationStats'

type Range = '7d' | '30d' | '90d'

interface Overview {
  totalEvents: number
  uniqueSessions: number
  totalErrors: number
  totalTranslations: number
  dailyTrend: Array<{ date: string; event: string; count: number; unique_sessions: number }>
}

export default function DashboardPage() {
  const [range, setRange] = useState<Range>('7d')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/metrics?range=${range}&metric=overview`)
      .then(r => r.json())
      .then(setOverview)
      .finally(() => setLoading(false))
  }, [range])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Fintutto Admin
          </h1>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  range === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Events gesamt"
            value={overview?.totalEvents ?? 0}
            loading={loading}
          />
          <MetricCard
            title="Unique Sessions"
            value={overview?.uniqueSessions ?? 0}
            loading={loading}
          />
          <MetricCard
            title="Uebersetzungen"
            value={overview?.totalTranslations ?? 0}
            loading={loading}
          />
          <MetricCard
            title="Fehler"
            value={overview?.totalErrors ?? 0}
            loading={loading}
            variant={overview && overview.totalErrors > 10 ? 'danger' : 'default'}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TranslationStats range={range} />
          <VitalsChart range={range} />
        </div>

        {/* Error list */}
        <ErrorList range={range} />
      </main>
    </div>
  )
}
