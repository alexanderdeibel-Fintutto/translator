// OfflineReadinessBanner — Kontextsensitiver Hinweis auf fehlende Offline-Vorbereitung.
// Erscheint nur, wenn Whisper ODER das aktuelle Sprachpaar noch nicht geladen ist.
// Zeigt einen direkten Link zum Offline-Setup-Screen.

import { Link } from 'react-router-dom'
import { WifiOff, Download, CheckCircle2 } from 'lucide-react'
import { useOffline } from '@/context/OfflineContext'
import { useEffect, useState } from 'react'
import { isWhisperAvailable } from '@/lib/offline/stt-engine'

interface OfflineReadinessBannerProps {
  /** Quellsprache der aktuellen Session (ISO-Code, z. B. 'de') */
  sourceLang?: string
  /** Zielsprache der aktuellen Session (ISO-Code, z. B. 'ar') */
  targetLang?: string
  /** Kompakte Darstellung (nur Icon + Text, kein Button-Block) */
  compact?: boolean
}

export default function OfflineReadinessBanner({
  sourceLang,
  targetLang,
  compact = false,
}: OfflineReadinessBannerProps) {
  const { isLanguagePairOffline, downloadedModels } = useOffline()
  const [whisperReady, setWhisperReady] = useState<boolean | null>(null)

  useEffect(() => {
    isWhisperAvailable().then(setWhisperReady)
  }, [downloadedModels])

  if (whisperReady === null) return null // noch am Laden

  const pairReady = sourceLang && targetLang
    ? isLanguagePairOffline(sourceLang, targetLang)
    : downloadedModels.some(m => m.type === 'translation')

  const fullyReady = whisperReady && pairReady

  // Wenn alles bereit ist: kleines grünes Badge zeigen
  if (fullyReady) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>Offline-Modus bereit</span>
      </div>
    )
  }

  const missing: string[] = []
  if (!whisperReady) missing.push('Offline-Mikrofon (Whisper)')
  if (!pairReady) missing.push('Übersetzungspaket')

  if (compact) {
    return (
      <Link
        to="/offline-setup"
        className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline"
      >
        <WifiOff className="h-3.5 w-3.5 shrink-0" />
        <span>Offline nicht vorbereitet — jetzt einrichten</span>
      </Link>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2">
      <div className="flex items-start gap-2">
        <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Offline-Fallback nicht vorbereitet
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            Fehlt: {missing.join(' · ')}
          </p>
        </div>
      </div>
      <Link
        to="/offline-setup"
        className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
      >
        <Download className="h-3.5 w-3.5 shrink-0" />
        Jetzt offline vorbereiten →
      </Link>
    </div>
  )
}
