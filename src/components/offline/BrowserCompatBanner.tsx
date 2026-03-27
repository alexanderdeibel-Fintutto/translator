/**
 * BrowserCompatBanner — Zeigt Browser-Kompatibilitätswarnungen für Offline-Funktionen.
 *
 * Erscheint im Offline-Setup-Screen und im FirstRunWizard.
 * Gibt klare Handlungsempfehlungen: Browser wechseln, App installieren oder Android-Tablet nutzen.
 *
 * iOS-Whisper-Problem (Stand 2026):
 *   Whisper (Transformers.js) läuft auf iOS/WebKit nicht zuverlässig.
 *   Offenes Issue: https://github.com/huggingface/transformers.js/issues/1298
 *   Offline-Übersetzung (Opus-MT) funktioniert auf iOS trotzdem.
 *   Für vollständigen Offline-Betrieb → Android-Tablet empfehlen.
 */
import { AlertTriangle, XCircle, ExternalLink, Smartphone, CheckCircle2, Cpu, Tablet } from 'lucide-react'
import { useMemo } from 'react'
import { checkOfflineCompatibility, detectBrowser } from '@/lib/offline/browser-compat'

interface BrowserCompatBannerProps {
  /** Kompakte Darstellung (nur eine Zeile) */
  compact?: boolean
}

export default function BrowserCompatBanner({ compact = false }: BrowserCompatBannerProps) {
  const compat = useMemo(() => checkOfflineCompatibility(), [])
  const info = useMemo(() => detectBrowser(), [])

  // Alles OK und als PWA installiert und kein iOS → nichts zeigen
  if (compat.severity === 'ok' && info.isStandalone && !compat.isIOSWhisperUnsupported) return null
  if (compat.severity === 'ok' && !compat.message && !compat.isIOSWhisperUnsupported) return null

  if (compact) {
    if (compat.isIOSWhisperUnsupported) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>iPhone/iPad: Offline-Spracherkennung nicht verfügbar — Android empfohlen</span>
        </div>
      )
    }
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
  const isIOSWarning = compat.isIOSWhisperUnsupported

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

  const ramLabel = compat.estimatedRAMgb > 0
    ? `${compat.estimatedRAMgb} GB RAM`
    : 'RAM unbekannt'

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4 space-y-3`}>
      <div className="flex items-start gap-3">
        {isError
          ? <XCircle className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
          : <AlertTriangle className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
        }
        <div className="flex-1 min-w-0 space-y-1">
          <p className={`text-sm font-semibold ${titleColor}`}>
            {isIOSWarning
              ? 'Offline-Spracherkennung auf iPhone/iPad nicht verfügbar'
              : isError
                ? 'Offline-Modus nicht verfügbar'
                : 'Eingeschränkte Offline-Unterstützung'
            }
          </p>
          <p className={`text-xs ${textColor} leading-relaxed`}>
            {compat.message}
          </p>
        </div>
      </div>

      {/* iOS-spezifischer Hinweis: Was funktioniert, was nicht */}
      {isIOSWarning && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2">
              <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                ✅ Funktioniert auf iPhone/iPad
              </p>
              <ul className="text-[10px] text-emerald-600 dark:text-emerald-500 space-y-0.5">
                <li>• Online-Betrieb (vollständig)</li>
                <li>• Offline-Übersetzung (Opus-MT)</li>
                <li>• App-Installation (PWA)</li>
              </ul>
            </div>
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-2">
              <p className="text-[10px] font-semibold text-red-700 dark:text-red-400 mb-1">
                ❌ Nicht möglich auf iPhone/iPad
              </p>
              <ul className="text-[10px] text-red-600 dark:text-red-500 space-y-0.5">
                <li>• Offline-Spracherkennung (Whisper)</li>
                <li>• Vollständiger Offline-Betrieb</li>
                <li>• (iOS/WebKit-Einschränkung)</li>
              </ul>
            </div>
          </div>

          {/* Android-Empfehlung */}
          <div className={`flex items-start gap-2 rounded-md border ${borderColor} bg-white dark:bg-gray-900 p-2.5`}>
            <Tablet className={`h-4 w-4 ${iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${titleColor}`}>
                Empfehlung für vollständigen Offline-Betrieb
              </p>
              <p className={`text-[10px] ${textColor} mt-0.5`}>
                Für Behörden-Tablets empfehlen wir ein Android-Gerät mit Chrome.
                Dort funktioniert Whisper-Spracherkennung vollständig offline.
              </p>
              {compat.recommendedBrowserUrl && (
                <a
                  href={compat.recommendedBrowserUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-[10px] font-medium ${textColor} hover:opacity-80 transition-opacity mt-1`}
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  {compat.recommendedBrowser} →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empfehlung: Browser wechseln (Nicht-iOS) */}
      {!isIOSWarning && compat.recommendedBrowser && compat.recommendedBrowserUrl && (
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

      {/* Empfehlung: App installieren (iOS ohne Browser-Wechsel, nicht iOS-Whisper-Problem) */}
      {!isIOSWarning && !compat.recommendedBrowserUrl && compat.severity !== 'ok' && !compat.recommendedBrowser && (
        <div className={`flex items-center gap-2 text-xs ${textColor}`}>
          <Smartphone className="h-3.5 w-3.5 shrink-0" />
          <span>
            Tippen Sie auf <strong>Teilen</strong> → <strong>Zum Home-Bildschirm</strong>
          </span>
        </div>
      )}

      {/* Feature-Checkliste (nur bei Error oder Nicht-iOS) */}
      {(isError || (!isIOSWarning && compat.severity !== 'ok')) && (
        <div className="grid grid-cols-2 gap-1 pt-1">
          {[
            { label: 'WebAssembly', ok: compat.hasWebAssembly },
            { label: 'Cache API', ok: compat.hasCacheAPI },
            { label: 'Service Worker', ok: compat.hasServiceWorker },
            { label: 'SharedArrayBuffer', ok: compat.hasSharedArrayBuffer },
            { label: 'PWA-Install', ok: compat.canInstallPWA },
            { label: ramLabel, ok: compat.hasEnoughRAM, icon: 'cpu' },
          ].map(({ label, ok, icon }) => (
            <div
              key={label}
              className={`flex items-center gap-1 text-[10px] ${
                ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              }`}
            >
              {icon === 'cpu'
                ? <Cpu className="h-3 w-3 shrink-0" />
                : ok
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
