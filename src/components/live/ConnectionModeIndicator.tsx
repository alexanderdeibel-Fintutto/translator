import { Cloud, Wifi, Smartphone, Bluetooth, Loader2 } from 'lucide-react'
import { useI18n } from '@/context/I18nContext'

interface ConnectionModeIndicatorProps {
  mode: 'cloud' | 'local' | 'ble'
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
  const { t } = useI18n()

  if (isResolving) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>{t('live.connecting')}</span>
      </div>
    )
  }

  if (mode === 'ble') {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Bluetooth className="h-3.5 w-3.5" />
        <span className={isConnected
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-amber-600 dark:text-amber-400'
        }>
          {t('live.modeBle')}
        </span>
        {isConnected && (
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        )}
      </div>
    )
  }

  if (mode === 'local') {
    const Icon = isHotspotHost ? Smartphone : Wifi
    const label = isHotspotHost ? t('live.modeHotspot') : t('live.modeLocal')

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
        {t('live.modeCloud')}
      </span>
      {isConnected && (
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      )}
    </div>
  )
}
