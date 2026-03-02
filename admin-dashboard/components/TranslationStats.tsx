'use client'

import { useEffect, useState } from 'react'

interface TranslationData {
  total: number
  byLang: Array<{ pair: string; count: number }>
  byProvider: Array<{ name: string; count: number }>
  byMode: Array<{ name: string; count: number }>
  latency: {
    avg: number
    p50: number
    p95: number
    p99: number
  } | null
}

export function TranslationStats({ range }: { range: string }) {
  const [data, setData] = useState<TranslationData | null>(null)

  useEffect(() => {
    fetch(`/api/metrics?range=${range}&metric=translations`)
      .then(r => r.json())
      .then(setData)
  }, [range])

  if (!data) return <div className="rounded-lg border bg-white dark:bg-gray-800 p-6 animate-pulse h-64" />

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Uebersetzungen ({data.total.toLocaleString('de-DE')})
      </h2>

      {/* Latency stats */}
      {data.latency && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {([['Avg', data.latency.avg], ['p50', data.latency.p50], ['p95', data.latency.p95], ['p99', data.latency.p99]] as const).map(([label, value]) => (
            <div key={label} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                {Math.round(value)}ms
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Top language pairs */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Top Sprachen</h3>
        <div className="space-y-1">
          {data.byLang.slice(0, 5).map(({ pair, count }) => {
            const pct = (count / data.total) * 100
            return (
              <div key={pair} className="flex items-center gap-2 text-sm">
                <span className="w-24 text-gray-700 dark:text-gray-300 truncate">{pair}</span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Provider + Mode breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Provider</h3>
          {data.byProvider.map(({ name, count }) => (
            <div key={name} className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{name}</span>
              <span className="text-gray-400">{count}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Modus</h3>
          {data.byMode.map(({ name, count }) => (
            <div key={name} className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">{name}</span>
              <span className="text-gray-400">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
