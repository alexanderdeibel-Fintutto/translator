import { Cloud, Wifi, Loader2 } from 'lucide-react'

interface ConnectionModeIndicatorProps {
  mode: 'cloud' | 'local'
  isConnected: boolean
  isResolving?: boolean
  serverUrl?: string
}

export default function ConnectionModeIndicator({
  mode,
  isConnected,
  isResolving,
  serverUrl,
}: ConnectionModeIndicatorProps) {
  if (isResolving) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Verbindung wird hergestellt...</span>
      </div>
    )
  }

  if (mode === 'local') {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Wifi className="h-3.5 w-3.5" />
        <span className={isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
          Lokales Netzwerk
        </span>
        {isConnected && (
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
        {serverUrl && (
          <span className="text-muted-foreground/60 font-mono text-[10px]">
            {serverUrl.replace('ws://', '')}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <Cloud className="h-3.5 w-3.5" />
      <span className={isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
        Cloud
      </span>
      {isConnected && (
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      )}
    </div>
  )
}
