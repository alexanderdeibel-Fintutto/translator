'use client'

interface MetricCardProps {
  title: string
  value: number
  loading?: boolean
  variant?: 'default' | 'danger'
}

export function MetricCard({ title, value, loading, variant = 'default' }: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-6 ${
      variant === 'danger'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
      ) : (
        <p className={`text-3xl font-bold mt-2 ${
          variant === 'danger'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-900 dark:text-white'
        }`}>
          {value.toLocaleString('de-DE')}
        </p>
      )}
    </div>
  )
}
