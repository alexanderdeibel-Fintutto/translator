'use client'

import { useEffect, useState } from 'react'

interface ErrorEntry {
  id: number
  error_type: string
  message: string
  stack: string | null
  source: string | null
  count: number
  first_seen: string
  last_seen: string
}

export function ErrorList({ range }: { range: string }) {
  const [errors, setErrors] = useState<ErrorEntry[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/metrics?range=${range}&metric=errors`)
      .then(r => r.json())
      .then(data => setErrors(data.errors || []))
  }, [range])

  if (errors.length === 0) {
    return (
      <div className="rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fehler</h2>
        <p className="text-gray-400 text-sm">Keine Fehler im Zeitraum</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Fehler ({errors.length})
      </h2>
      <div className="space-y-2">
        {errors.map(err => (
          <div
            key={err.id}
            className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(expandedId === err.id ? null : err.id)}
              className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    err.error_type === 'js_error' ? 'bg-red-500' :
                    err.error_type === 'api_error' ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`} />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {err.error_type}
                  </span>
                  {err.count > 1 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5">
                      x{err.count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-900 dark:text-white truncate mt-1">
                  {err.message}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {new Date(err.last_seen).toLocaleString('de-DE')}
              </span>
            </button>
            {expandedId === err.id && err.stack && (
              <pre className="px-4 py-3 bg-gray-50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 overflow-x-auto border-t border-gray-100 dark:border-gray-700">
                {err.stack}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
