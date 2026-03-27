/**
 * OfflineSetupPage — Offline-Vorbereitung für Behörden-Tablets und Standalone-Einsatz
 *
 * Dieser Screen führt den Admin/Nutzer durch drei Schritte:
 *  1. PWA installieren (Zum Homescreen hinzufügen) → persistenter Speicher
 *  2. Whisper-Modell herunterladen (~150 MB) → Offline-Spracherkennung
 *  3. Sprach-Übersetzungspakete herunterladen (~35 MB pro Paar) → Offline-Übersetzung
 *
 * Hinweis: Alle Downloads benötigen eine Internetverbindung. Danach funktioniert
 * die App vollständig offline.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download, Check, Loader2, Smartphone, Mic, Languages,
  WifiOff, ChevronRight, Info, AlertTriangle, ArrowLeft, Tablet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useOffline } from '@/context/OfflineContext'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { isWhisperAvailable, preloadWhisper } from '@/lib/offline/stt-engine'
import { getLanguagePairStatus } from '@/lib/offline/model-manager'
import { preloadModel } from '@/lib/offline/translation-engine'
import { requestPersistentStorage } from '@/lib/offline/storage-manager'
import { getLanguageByCode } from '@/lib/languages'
import BrowserCompatBanner from '@/components/offline/BrowserCompatBanner'
import { detectBrowser } from '@/lib/offline/browser-compat'

// Empfohlene Sprachen für den Behörden-Einsatz (Authority Clerk)
const RECOMMENDED_LANGUAGE_PAIRS = [
  { src: 'de', tgt: 'en', label: 'Deutsch → Englisch' },
  { src: 'en', tgt: 'de', label: 'Englisch → Deutsch' },
  { src: 'de', tgt: 'ar', label: 'Deutsch → Arabisch', pivot: true },
  { src: 'ar', tgt: 'de', label: 'Arabisch → Deutsch', pivot: true },
  { src: 'de', tgt: 'tr', label: 'Deutsch → Türkisch', pivot: true },
  { src: 'tr', tgt: 'de', label: 'Türkisch → Deutsch', pivot: true },
  { src: 'de', tgt: 'uk', label: 'Deutsch → Ukrainisch', pivot: true },
  { src: 'uk', tgt: 'de', label: 'Ukrainisch → Deutsch', pivot: true },
  { src: 'de', tgt: 'ru', label: 'Deutsch → Russisch', pivot: true },
  { src: 'ru', tgt: 'de', label: 'Russisch → Deutsch', pivot: true },
  { src: 'de', tgt: 'fa', label: 'Deutsch → Persisch (Farsi)', pivot: true },
  { src: 'fa', tgt: 'de', label: 'Persisch → Deutsch', pivot: true },
]

// Alle weiteren verfügbaren Sprachen (aus model-manager)
const ALL_EXTRA_PAIRS = [
  { src: 'en', tgt: 'fr' }, { src: 'fr', tgt: 'en' },
  { src: 'en', tgt: 'es' }, { src: 'es', tgt: 'en' },
  { src: 'en', tgt: 'it' }, { src: 'it', tgt: 'en' },
  { src: 'en', tgt: 'pt' }, { src: 'pt', tgt: 'en' },
  { src: 'en', tgt: 'pl' }, { src: 'en', tgt: 'cs' },
  { src: 'en', tgt: 'ro' }, { src: 'ro', tgt: 'en' },
  { src: 'en', tgt: 'nl' }, { src: 'nl', tgt: 'en' },
  { src: 'en', tgt: 'sv' }, { src: 'en', tgt: 'zh' }, { src: 'zh', tgt: 'en' },
  { src: 'en', tgt: 'ja' }, { src: 'ja', tgt: 'en' },
  { src: 'en', tgt: 'ko' }, { src: 'ko', tgt: 'en' },
  { src: 'en', tgt: 'hi' }, { src: 'hi', tgt: 'en' },
  { src: 'en', tgt: 'vi' }, { src: 'vi', tgt: 'en' },
]

interface PairStatus {
  src: string
  tgt: string
  label: string
  downloaded: boolean
  downloading: boolean
  progress: number
  error: string | null
  isRecommended: boolean
  isPivot?: boolean
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export default function OfflineSetupPage() {
  const navigate = useNavigate()
  const { isOffline, refreshModels } = useOffline()
  const { canInstall, isInstalled, isIOSDevice, install } = usePWAInstall()
  const browserInfo = useMemo(() => detectBrowser(), [])
  const isIOS = browserInfo.isIOS

  // Step 1: PWA
  const [isPersistent, setIsPersistent] = useState(false)

  // Step 2: Whisper
  const [whisperReady, setWhisperReady] = useState(false)
  const [whisperDownloading, setWhisperDownloading] = useState(false)
  const [whisperProgress, setWhisperProgress] = useState(0)
  const [whisperError, setWhisperError] = useState<string | null>(null)

  // Step 3: Language pairs
  const [pairs, setPairs] = useState<PairStatus[]>([])
  const [showAllPairs, setShowAllPairs] = useState(false)
  const [bulkDownloading, setBulkDownloading] = useState(false)

  // Load initial state
  useEffect(() => {
    isWhisperAvailable().then(setWhisperReady)
    requestPersistentStorage().then(setIsPersistent).catch(() => {})
    loadPairStatus()
  }, [])

  const loadPairStatus = useCallback(async () => {
    const statusMap = await getLanguagePairStatus()
    const downloadedSet = new Set(
      statusMap.filter(s => s.downloaded).map(s => `${s.src}-${s.tgt}`)
    )

    const recommended: PairStatus[] = RECOMMENDED_LANGUAGE_PAIRS.map(p => ({
      ...p,
      downloaded: downloadedSet.has(`${p.src}-${p.tgt}`),
      downloading: false,
      progress: 0,
      error: null,
      isRecommended: true,
    }))

    const extra: PairStatus[] = ALL_EXTRA_PAIRS.map(p => {
      const srcLang = getLanguageByCode(p.src)
      const tgtLang = getLanguageByCode(p.tgt)
      return {
        ...p,
        label: `${srcLang?.name || p.src} → ${tgtLang?.name || p.tgt}`,
        downloaded: downloadedSet.has(`${p.src}-${p.tgt}`),
        downloading: false,
        progress: 0,
        error: null,
        isRecommended: false,
      }
    })

    setPairs([...recommended, ...extra])
  }, [])

  const downloadWhisper = async () => {
    if (isOffline) return
    setWhisperDownloading(true)
    setWhisperProgress(0)
    setWhisperError(null)
    try {
      await preloadWhisper((pct) => setWhisperProgress(Math.round(pct)))
      setWhisperReady(true)
      await refreshModels()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setWhisperError(`Download fehlgeschlagen: ${msg.slice(0, 80)}`)
    } finally {
      setWhisperDownloading(false)
    }
  }

  const downloadPair = async (src: string, tgt: string) => {
    if (isOffline) return
    setPairs(prev => prev.map(p =>
      p.src === src && p.tgt === tgt
        ? { ...p, downloading: true, progress: 0, error: null }
        : p
    ))
    try {
      await preloadModel(src, tgt, (pct) => {
        setPairs(prev => prev.map(p =>
          p.src === src && p.tgt === tgt ? { ...p, progress: Math.round(pct) } : p
        ))
      })
      await refreshModels()
      setPairs(prev => prev.map(p =>
        p.src === src && p.tgt === tgt
          ? { ...p, downloading: false, downloaded: true, progress: 100 }
          : p
      ))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setPairs(prev => prev.map(p =>
        p.src === src && p.tgt === tgt
          ? { ...p, downloading: false, error: `Fehler: ${msg.slice(0, 60)}` }
          : p
      ))
    }
  }

  const downloadAllRecommended = async () => {
    if (isOffline || bulkDownloading) return
    setBulkDownloading(true)
    const toDownload = pairs.filter(p => p.isRecommended && !p.downloaded)
    for (const pair of toDownload) {
      await downloadPair(pair.src, pair.tgt)
    }
    setBulkDownloading(false)
  }

  const recommendedPairs = pairs.filter(p => p.isRecommended)
  const extraPairs = pairs.filter(p => !p.isRecommended)
  const recommendedDownloaded = recommendedPairs.filter(p => p.downloaded).length
  const allRecommendedDone = recommendedDownloaded === recommendedPairs.length

  // Overall readiness
  const step1Done = isInstalled || isPersistent
  const step2Done = whisperReady
  const step3Done = allRecommendedDone
  const allDone = step1Done && step2Done && step3Done

  return (
    <div className="container py-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Zurück">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-primary" />
            Offline-Einrichtung
          </h1>
          <p className="text-sm text-muted-foreground">
            Bereite das Gerät für den Einsatz ohne Internet vor
          </p>
        </div>
      </div>

      {/* Browser-Kompatibilitäts-Warnung */}
      <BrowserCompatBanner />

      {/* Offline-Warnung */}
      {isOffline && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="text-sm">
            <strong>Kein Internet erkannt.</strong> Downloads sind nur online möglich.
            Bereits heruntergeladene Modelle sind weiterhin verfügbar.
          </p>
        </div>
      )}

      {/* Fertig-Banner */}
      {allDone && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">Gerät ist offline-bereit!</p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Die App funktioniert jetzt vollständig ohne Internetverbindung.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto shrink-0"
            onClick={() => navigate('/conversation')}
          >
            Zum Gespräch <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* ── SCHRITT 1: PWA installieren ── */}
      <Card className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${step1Done ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-muted'}`}>
            {step1Done
              ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              : <Smartphone className="h-4 w-4 text-muted-foreground" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm">Schritt 1 — App zum Homescreen hinzufügen</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Damit der Browser die heruntergeladenen Modelle dauerhaft speichert und nicht nach 7 Tagen löscht,
              muss die App als PWA installiert werden.
            </p>
          </div>
        </div>

        {step1Done ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pl-11">
            <Check className="h-3 w-3" /> App ist installiert — Speicher ist persistent
          </p>
        ) : isIOSDevice ? (
          <div className="pl-11 space-y-2">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>iPhone/iPad:</strong> Tippe auf das Teilen-Symbol (□↑) in Safari, dann auf
                „Zum Home-Bildschirm hinzufügen".
              </p>
            </div>
          </div>
        ) : canInstall ? (
          <div className="pl-11">
            <Button size="sm" onClick={install} className="gap-1.5">
              <Smartphone className="h-3.5 w-3.5" />
              App installieren
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground pl-11">
            Öffne diese Seite in Chrome oder Edge und tippe auf „Installieren" in der Adressleiste.
          </p>
        )}
      </Card>

      {/* ── SCHRITT 2: Whisper herunterladen ── */}
      <Card className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
            isIOS ? 'bg-amber-100 dark:bg-amber-900' :
            step2Done ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-muted'
          }`}>
            {isIOS
              ? <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              : step2Done
                ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                : <Mic className="h-4 w-4 text-muted-foreground" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm">Schritt 2 — Offline-Spracherkennung (Whisper)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isIOS
                ? 'Auf iPhone/iPad nicht verfügbar (iOS/WebKit-Einschränkung). Offline-Übersetzung funktioniert trotzdem.'
                : 'Das Whisper-Modell (~150 MB) ermöglicht Spracherkennung ohne Internet, in jedem Browser, für alle Sprachen gleichzeitig.'
              }
            </p>
          </div>
        </div>

        {/* iOS-spezifische Warnung */}
        {isIOS && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Offline-Spracherkennung auf iPhone/iPad nicht verfügbar
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  Whisper (Transformers.js) läuft auf iOS/WebKit technisch nicht zuverlässig.
                  Dies ist eine bekannte Einschränkung von Apples Browser-Engine — unabhängig
                  davon, ob Safari, Chrome oder Firefox auf dem Gerät verwendet wird.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">✅ Funktioniert auf iOS</p>
                <p className="text-emerald-600 dark:text-emerald-500">Online-Betrieb (vollständig)</p>
                <p className="text-emerald-600 dark:text-emerald-500">Offline-Übersetzung (Opus-MT)</p>
              </div>
              <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-2">
                <p className="font-semibold text-red-700 dark:text-red-400 mb-1">❌ Nicht möglich auf iOS</p>
                <p className="text-red-600 dark:text-red-500">Offline-Spracherkennung</p>
                <p className="text-red-600 dark:text-red-500">Vollständiger Offline-Betrieb</p>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 p-2.5">
              <Tablet className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                <span className="font-semibold">Empfehlung für Behörden-Tablets:</span>{' '}
                Für vollständigen Offline-Betrieb (Spracherkennung + Übersetzung ohne Internet)
                bitte ein Android-Tablet verwenden, z. B.{' '}
                <a
                  href="https://www.samsung.com/de/tablets/galaxy-tab-a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Samsung Galaxy Tab A9
                </a>{' '}
                (ca. 200 €).
              </p>
            </div>
          </div>
        )}

        {/* Download-Bereich — nur auf Nicht-iOS */}
        {!isIOS && (
          step2Done ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pl-11">
              <Check className="h-3 w-3" /> Whisper ist bereit — Spracherkennung funktioniert offline
            </p>
          ) : whisperDownloading ? (
            <div className="pl-11 space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Lade Whisper herunter… {whisperProgress}%
              </div>
              <ProgressBar value={whisperProgress} />
            </div>
          ) : (
            <div className="pl-11 space-y-1.5">
              <Button
                size="sm"
                onClick={downloadWhisper}
                disabled={isOffline}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Whisper herunterladen (~150 MB)
              </Button>
              {whisperError && (
                <p className="text-xs text-destructive">{whisperError}</p>
              )}
              {isOffline && (
                <p className="text-xs text-amber-600">Internetverbindung erforderlich</p>
              )}
            </div>
          )
        )}
      </Card>

      {/* ── SCHRITT 3: Sprach-Pakete ── */}
      <Card className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${step3Done ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-muted'}`}>
            {step3Done
              ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              : <Languages className="h-4 w-4 text-muted-foreground" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm">Schritt 3 — Übersetzungspakete</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Jedes Sprachpaar ist ~35 MB. Für Deutsch ↔ Arabisch/Türkisch/Ukrainisch/Russisch
              werden je 2 Pakete benötigt (Pivot über Englisch).
            </p>
          </div>
        </div>

        {/* Empfohlenes Paket — ein Klick für alle */}
        <div className="pl-11 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">Behörden-Paket ({recommendedDownloaded}/{recommendedPairs.length} geladen)</p>
              <p className="text-xs text-muted-foreground">DE ↔ EN, AR, TR, UK, RU, FA — ca. {(recommendedPairs.length - recommendedDownloaded) * 35} MB verbleibend</p>
            </div>
            {!allRecommendedDone && (
              <Button
                size="sm"
                variant="default"
                onClick={downloadAllRecommended}
                disabled={isOffline || bulkDownloading}
                className="gap-1.5 shrink-0"
              >
                {bulkDownloading
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Lädt…</>
                  : <><Download className="h-3.5 w-3.5" /> Alle laden</>
                }
              </Button>
            )}
            {allRecommendedDone && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Vollständig
              </span>
            )}
          </div>

          {/* Einzelne empfohlene Paare */}
          <div className="space-y-1.5">
            {recommendedPairs.map(pair => (
              <div key={`${pair.src}-${pair.tgt}`} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{pair.label}</span>
                    {pair.isPivot && (
                      <span className="text-[10px] text-muted-foreground">(via EN)</span>
                    )}
                  </div>
                  {pair.downloading && <ProgressBar value={pair.progress} />}
                  {pair.error && <p className="text-[10px] text-destructive">{pair.error}</p>}
                </div>
                {pair.downloaded ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                ) : pair.downloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs shrink-0"
                    onClick={() => downloadPair(pair.src, pair.tgt)}
                    disabled={isOffline}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Weitere Sprachen */}
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            onClick={() => setShowAllPairs(v => !v)}
          >
            <ChevronRight className={`h-3 w-3 transition-transform ${showAllPairs ? 'rotate-90' : ''}`} />
            {showAllPairs ? 'Weitere Sprachen ausblenden' : 'Weitere Sprachen anzeigen'}
          </button>

          {showAllPairs && (
            <div className="space-y-1.5 pt-1 border-t border-border">
              {extraPairs.map(pair => (
                <div key={`${pair.src}-${pair.tgt}`} className="flex items-center gap-2">
                  <span className="text-xs flex-1 min-w-0 truncate">{pair.label}</span>
                  {pair.downloaded ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : pair.downloading ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{pair.progress}%</span>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs shrink-0"
                      onClick={() => downloadPair(pair.src, pair.tgt)}
                      disabled={isOffline}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Info-Box */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Wie funktioniert das?</strong> Die Modelle werden einmalig aus dem Internet geladen
            und dauerhaft im Browser-Speicher (IndexedDB + Cache API) gespeichert.
          </p>
          <p>
            Danach läuft die gesamte Spracherkennung und Übersetzung lokal auf dem Gerät —
            keine Audiodaten verlassen das Tablet, kein Internet nötig.
          </p>
          <p>
            <strong>Speicherbedarf:</strong> Whisper ~150 MB + je ~35 MB pro Sprachpaar.
            Für das vollständige Behörden-Paket ca. 570 MB.
          </p>
        </div>
      </div>
    </div>
  )
}
