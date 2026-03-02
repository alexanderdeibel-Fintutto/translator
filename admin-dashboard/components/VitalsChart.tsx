'use client'

import { useEffect, useState } from 'react'

interface VitalData {
  avg: number | null
  p75: number | null
  good: number
  needsImprovement: number
  poor: number
  total: number
}

type VitalsResponse = Record<string, VitalData>

const THRESHOLDS: Record<string, { good: number; poor: number; unit: string }> = {
  LCP: { good: 2500, poor: 4000, unit: 'ms' },
  CLS: { good: 0.1, poor: 0.25, unit: '' },
  INP: { good: 200, poor: 500, unit: 'ms' },
  FCP: { good: 1800, poor: 3000, unit: 'ms' },
  TTFB: { good: 800, poor: 1800, unit: 'ms' },
}

export function VitalsChart({ range }: { range: string }) {
  const [vitals, setVitals] = useState<VitalsResponse | null>(null)

  useEffect(() => {
    fetch(`/api/metrics?range=${range}&metric=vitals`)
      .then(r => r.json())
      .then(setVitals)
  }, [range])

  if (!vitals) return <div className="rounded-lg border bg-white dark:bg-gray-800 p-6 animate-pulse h-64" />

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Web Vitals</h2>
      <div className="space-y-4">
        {Object.entries(THRESHOLDS).map(([metric, threshold]) => {
          const data = vitals[metric]
          if (!data || data.total === 0) return (
            <div key={metric} className="text-sm text-gray-400">
              {metric}: Keine Daten
            </div>
          )

          const p75 = data.p75 ?? 0
          const rating = p75 <= threshold.good ? 'good' : p75 <= threshold.poor ? 'needs-improvement' : 'poor'
          const colors = {
            good: 'bg-green-500',
            'needs-improvement': 'bg-yellow-500',
            poor: 'bg-red-500',
          }

          const goodPct = (data.good / data.total) * 100
          const niPct = (data.needsImprovement / data.total) * 100
          const poorPct = (data.poor / data.total) * 100

          return (
            <div key={metric}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">{metric}</span>
                <span className={`font-mono ${
                  rating === 'good' ? 'text-green-600' : rating === 'poor' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  p75: {metric === 'CLS' ? p75.toFixed(3) : `${Math.round(p75)}${threshold.unit}`}
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-700">
                <div className="bg-green-500 transition-all" style={{ width: `${goodPct}%` }} />
                <div className="bg-yellow-500 transition-all" style={{ width: `${niPct}%` }} />
                <div className="bg-red-500 transition-all" style={{ width: `${poorPct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
