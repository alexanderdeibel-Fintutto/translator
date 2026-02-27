import { Cloud, Wifi, Smartphone, Loader2 } from 'lucide-react'

interface ConnectionModeIndicatorProps {
  mode: 'cloud' | 'local'
  isConnected: boolean
  isResolving?: boolean
  serverUrl?: string
  /** True when this device is the hotspot host (speaker in hotspot mode) */
  isHotspotHost?: boolean
}

export default function ConnectionModeIndicator({
  mode,
  isConnected,
  isResolving,
  serverUrl,
  isHotspotHost,
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
    const Icon = isHotspotHost ? Smartphone : Wifi
    const label = isHotspotHost ? 'Hotspot-Modus' : 'Lokales Netzwerk'

    return (
      <div className="flex items-center gap-2 text-xs">
        <Icon className="h-3.5 w-3.5" />
        <span className={isConnected
          ? isHotspotHost
            ? 'text-sky-600 dark:text-sky-400'
            : 'text-emerald-600 dark:text-emerald-400'
          : 'text-amber-600 dark:text-amber-400'
        }>
          {label}
        </span>
        {isConnected && (
          <span className={`h-2 w-2 rounded-full animate-pulse ${
            isHotspotHost ? 'bg-sky-500' : 'bg-emerald-500'
          }`} />
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
