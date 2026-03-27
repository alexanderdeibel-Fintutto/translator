/**
 * BrowserCompatBanner — Zeigt Browser-Kompatibilitätswarnungen für Offline-Funktionen.
 *
 * Erscheint im Offline-Setup-Screen und im FirstRunWizard.
 * Gibt klare Handlungsempfehlungen: Browser wechseln oder App installieren.
 */
import { AlertTriangle, XCircle, ExternalLink, Smartphone, CheckCircle2 } from 'lucide-react'
import { useMemo } from 'react'
import { checkOfflineCompatibility, detectBrowser } from '@/lib/offline/browser-compat'

interface BrowserCompatBannerProps {
  /** Kompakte Darstellung (nur eine Zeile) */
  compact?: boolean
}

export default function BrowserCompatBanner({ compact = false }: BrowserCompatBannerProps) {
  const compat = useMemo(() => checkOfflineCompatibility(), [])
  const info = useMemo(() => detectBrowser(), [])

  // Alles OK und als PWA installiert → nichts zeigen
  if (compat.severity === 'ok' && info.isStandalone) return null
  // Alles OK und kein Problem → nichts zeigen
  if (compat.severity === 'ok' && !compat.message) return null

  if (compact) {
    if (compat.severity === 'error') {
      return (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Offline nicht unterstützt — Browser wechseln</span>
          {compat.recommendedBrowserUrl && (
            <a
              href={compat.recommendedBrowserUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline ml-1"
            >
              {compat.recommendedBrowser} →
            </a>
          )}
        </div>
      )
    }
    if (compat.severity === 'warning') {
      return (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{compat.message}</span>
        </div>
      )
    }
    return null
  }

  // Vollständige Darstellung
  const isError = compat.severity === 'error'
  const borderColor = isError
    ? 'border-red-200 dark:border-red-800'
    : 'border-amber-200 dark:border-amber-800'
  const bgColor = isError
    ? 'bg-red-50 dark:bg-red-950/20'
    : 'bg-amber-50 dark:bg-amber-950/20'
  const iconColor = isError
    ? 'text-red-600 dark:text-red-400'
    : 'text-amber-600 dark:text-amber-400'
  const titleColor = isError
    ? 'text-red-800 dark:text-red-300'
    : 'text-amber-800 dark:text-amber-300'
  const textColor = isError
    ? 'text-red-700 dark:text-red-400'
    : 'text-amber-700 dark:text-amber-400'

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4 space-y-3`}>
      <div className="flex items-start gap-3">
        {isError
          ? <XCircle className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
          : <AlertTriangle className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
        }
        <div className="flex-1 min-w-0 space-y-1">
          <p className={`text-sm font-semibold ${titleColor}`}>
            {isError ? 'Offline-Modus nicht verfügbar' : 'Eingeschränkte Offline-Unterstützung'}
          </p>
          <p className={`text-xs ${textColor} leading-relaxed`}>
            {compat.message}
          </p>
        </div>
      </div>

      {/* Empfehlung: Browser wechseln */}
      {compat.recommendedBrowser && compat.recommendedBrowserUrl && (
        <a
          href={compat.recommendedBrowserUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 text-xs font-medium ${textColor} hover:opacity-80 transition-opacity`}
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          {compat.recommendedBrowser} herunterladen →
        </a>
      )}

      {/* Empfehlung: App installieren (iOS ohne Browser-Wechsel) */}
      {!compat.recommendedBrowserUrl && compat.severity !== 'ok' && (
        <div className={`flex items-center gap-2 text-xs ${textColor}`}>
          <Smartphone className="h-3.5 w-3.5 shrink-0" />
          <span>
            Tippen Sie auf <strong>Teilen</strong> → <strong>Zum Home-Bildschirm</strong>
          </span>
        </div>
      )}

      {/* Feature-Checkliste bei Error */}
      {isError && (
        <div className="grid grid-cols-2 gap-1 pt-1">
          {[
            { label: 'WebAssembly', ok: compat.hasWebAssembly },
            { label: 'Cache API', ok: compat.hasCacheAPI },
            { label: 'Service Worker', ok: compat.hasServiceWorker },
            { label: 'PWA-Install', ok: compat.canInstallPWA },
          ].map(({ label, ok }) => (
            <div key={label} className={`flex items-center gap-1 text-[10px] ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {ok
                ? <CheckCircle2 className="h-3 w-3 shrink-0" />
                : <XCircle className="h-3 w-3 shrink-0" />
              }
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
