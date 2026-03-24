/**
 * Offline Mode Indicator — Authority Market
 *
 * Shows the current connectivity status prominently.
 * For government offices: offline mode is a FEATURE, not a bug.
 * Highlights that no data leaves the device in offline mode.
 */

import { useState, useEffect } from 'react'
import { WifiOff, Wifi, Shield, CheckCircle2 } from 'lucide-react'

interface OfflineModeIndicatorProps {
  /** Show expanded info panel */
  expanded?: boolean
  /** Compact inline badge */
  compact?: boolean
}

export default function OfflineModeIndicator({
  expanded = false,
  compact = false,
}: OfflineModeIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showExpanded, setShowExpanded] = useState(expanded)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
          isOnline
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline — Datenschutz-Modus
          </>
        )}
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 cursor-pointer transition-colors ${
        isOnline
          ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
          : 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
      }`}
      onClick={() => setShowExpanded(!showExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <WifiOff className="h-5 w-5 text-green-600 dark:text-green-400" />
          )}
          <div>
            <p className="text-sm font-semibold">
              {isOnline ? 'Online-Modus' : 'Offline-Modus aktiv'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isOnline
                ? 'Verbunden — Übersetzung via Cloud-KI'
                : 'Kein Internet — Lokale KI auf diesem Gerät'}
            </p>
          </div>
        </div>
        {!isOnline && (
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
        )}
      </div>

      {showExpanded && !isOnline && (
        <div className="space-y-2 pt-1 border-t border-green-200 dark:border-green-800">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">
            Datenschutz-Garantien im Offline-Modus
          </p>
          {[
            'Keine Daten verlassen dieses Gerät',
            'DSGVO Art. 9 — Besondere Kategorien geschützt',
            'Kein Cloud-Transfer von Gesprächsinhalten',
            'Lokale KI-Verarbeitung (On-Device)',
            'Geeignet für Asylverfahren und sensible Gespräche',
          ].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-600" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      )}

      {showExpanded && isOnline && (
        <div className="space-y-2 pt-1 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-muted-foreground">
            Für besonders sensible Gespräche (Asylverfahren, medizinische Daten) empfehlen wir,
            das WLAN zu deaktivieren, um in den Offline-Datenschutz-Modus zu wechseln.
          </p>
        </div>
      )}
    </div>
  )
}
