/**
 * FirstRunWizard — Automatischer Einrichtungs-Assistent für Behörden-Tablets
 *
 * Wird ausgelöst durch:
 *   1. URL-Parameter ?setup=authority (aus dem Sales-Admin-Link)
 *   2. Oder automatisch beim allerersten Öffnen der App (kein localStorage-Flag)
 *
 * Führt den Sachbearbeiter in 3 Schritten durch:
 *   Schritt 1 — App zum Homescreen hinzufügen (PWA)
 *   Schritt 2 — Offline-Spracherkennung herunterladen (Whisper ~150 MB)
 *   Schritt 3 — Übersetzungspakete herunterladen (Behörden-Paket ~570 MB)
 *
 * Nach Abschluss: Weiterleitung zu /conversation
 * Jederzeit überspringbar → Flag wird trotzdem gesetzt, Wizard erscheint nicht erneut
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Smartphone, Mic, Languages, Check, Download, Loader2,
  ChevronRight, X, WifiOff, Share, ArrowRight, Wifi, Tablet, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOffline } from '@/context/OfflineContext'
import BrowserCompatBanner from '@/components/offline/BrowserCompatBanner'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { detectBrowser } from '@/lib/offline/browser-compat'
import { isWhisperAvailable, preloadWhisper } from '@/lib/offline/stt-engine'
import { getLanguagePairStatus } from '@/lib/offline/model-manager'
import { preloadModel } from '@/lib/offline/translation-engine'
import { requestPersistentStorage } from '@/lib/offline/storage-manager'

const FIRST_RUN_KEY = 'fintutto-first-run-done'
const SETUP_PAIRS = [
  { src: 'de', tgt: 'en' }, { src: 'en', tgt: 'de' },
  { src: 'de', tgt: 'ar' }, { src: 'ar', tgt: 'de' },
  { src: 'de', tgt: 'tr' }, { src: 'tr', tgt: 'de' },
  { src: 'de', tgt: 'uk' }, { src: 'uk', tgt: 'de' },
  { src: 'de', tgt: 'ru' }, { src: 'ru', tgt: 'de' },
  { src: 'de', tgt: 'fa' }, { src: 'fa', tgt: 'de' },
]

function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`w-full h-2 bg-white/20 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-white rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  )
}

interface Props {
  /** true wenn ?setup=authority in der URL steht */
  forcedByUrl?: boolean
  onDismiss: () => void
}

type WizardStep = 'welcome' | 'pwa' | 'whisper' | 'languages' | 'done'

export default function FirstRunWizard({ forcedByUrl = false, onDismiss }: Props) {
  const navigate = useNavigate()
  const { isOffline } = useOffline()
  const { canInstall, isInstalled, isIOSDevice, install } = usePWAInstall()
  const browserInfo = useMemo(() => detectBrowser(), [])
  const isIOS = browserInfo.isIOS

  const [step, setStep] = useState<WizardStep>('welcome')

  // Step 2 — Whisper
  const [whisperReady, setWhisperReady] = useState(false)
  const [whisperDownloading, setWhisperDownloading] = useState(false)
  const [whisperProgress, setWhisperProgress] = useState(0)
  const [whisperError, setWhisperError] = useState<string | null>(null)

  // Step 3 — Language pairs
  const [pairsDownloaded, setPairsDownloaded] = useState(0)
  const [pairsTotal] = useState(SETUP_PAIRS.length)
  const [pairsDownloading, setPairsDownloading] = useState(false)
  const [currentPairProgress, setCurrentPairProgress] = useState(0)
  const [currentPairLabel, setCurrentPairLabel] = useState('')
  const [pairsDone, setPairsDone] = useState(false)
  const [pairsError, setPairsError] = useState<string | null>(null)

  // Check initial state
  useEffect(() => {
    isWhisperAvailable().then(setWhisperReady)
    requestPersistentStorage().catch(() => {})
    getLanguagePairStatus().then(statuses => {
      const downloaded = statuses.filter(s => s.downloaded).length
      setPairsDownloaded(Math.min(downloaded, SETUP_PAIRS.length))
      if (downloaded >= SETUP_PAIRS.length) setPairsDone(true)
    })
  }, [])

  const markDone = useCallback(() => {
    try { localStorage.setItem(FIRST_RUN_KEY, '1') } catch { /* ignore */ }
  }, [])

  const handleFinish = useCallback(() => {
    markDone()
    onDismiss()
    navigate('/conversation')
  }, [markDone, onDismiss, navigate])

  const handleSkip = useCallback(() => {
    markDone()
    onDismiss()
  }, [markDone, onDismiss])

  // ── Whisper download ──
  const downloadWhisper = async () => {
    if (isOffline || whisperDownloading) return
    setWhisperDownloading(true)
    setWhisperProgress(0)
    setWhisperError(null)
    try {
      await preloadWhisper((pct) => setWhisperProgress(Math.round(pct)))
      setWhisperReady(true)
    } catch (err) {
      setWhisperError('Download fehlgeschlagen. Bitte Internetverbindung prüfen.')
    } finally {
      setWhisperDownloading(false)
    }
  }

  // ── Language pairs download ──
  const LANG_LABELS: Record<string, string> = {
    de: 'Deutsch', en: 'Englisch', ar: 'Arabisch', tr: 'Türkisch',
    uk: 'Ukrainisch', ru: 'Russisch', fa: 'Persisch',
  }
  const downloadAllPairs = async () => {
    if (isOffline || pairsDownloading) return
    setPairsDownloading(true)
    setPairsError(null)
    let done = pairsDownloaded
    for (const pair of SETUP_PAIRS) {
      const label = `${LANG_LABELS[pair.src] ?? pair.src} → ${LANG_LABELS[pair.tgt] ?? pair.tgt}`
      setCurrentPairLabel(label)
      setCurrentPairProgress(0)
      try {
        await preloadModel(pair.src, pair.tgt, (pct) => setCurrentPairProgress(Math.round(pct)))
        done++
        setPairsDownloaded(done)
      } catch {
        // Einzelner Fehler → weiter mit nächstem Paar
      }
    }
    setPairsDownloading(false)
    setPairsDone(true)
    setCurrentPairLabel('')
  }

  // ── Render ──
  const totalProgress = Math.round(
    ((step === 'welcome' ? 0 : step === 'pwa' ? 1 : step === 'whisper' ? 2 : step === 'languages' ? 3 : 4) / 4) * 100
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
          aria-label="Überspringen"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── WELCOME ── */}
        {step === 'welcome' && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white space-y-6">
            <div className="space-y-3 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <img src="/app-logo.svg" alt="Fintutto" className="h-10 w-10 rounded-xl" />
              </div>
              <h1 className="text-2xl font-bold">Willkommen beim<br />Amt-Übersetzer</h1>
              <p className="text-blue-100 text-sm leading-relaxed">
                Wir richten das Gerät jetzt in 3 kurzen Schritten ein —
                danach funktioniert die App <strong className="text-white">vollständig ohne Internet</strong>.
              </p>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: Smartphone, label: 'App zum Homescreen hinzufügen' },
                { icon: Mic, label: 'Offline-Spracherkennung aktivieren' },
                { icon: Languages, label: 'Sprachen herunterladen' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
                  <Icon className="h-4 w-4 text-blue-200 shrink-0" />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
            <Button
              className="w-full bg-white text-blue-700 hover:bg-blue-50 font-semibold"
              onClick={() => setStep('pwa')}
            >
              Einrichtung starten <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <p className="text-center text-xs text-blue-200">
              Dauert ca. 5–10 Minuten (je nach Internetgeschwindigkeit)
            </p>
            {/* Browser-Kompatibilitäts-Warnung */}
            <div className="[&>div]:bg-white/10 [&>div]:border-white/20 [&_p]:text-white/80 [&_a]:text-white [&_span]:text-white/80">
              <BrowserCompatBanner compact />
            </div>
          </div>
        )}

        {/* ── PWA ── */}
        {step === 'pwa' && (
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white space-y-5">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="bg-white/20 rounded-full px-2 py-0.5">Schritt 1 von 3</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">App installieren</h2>
              <p className="text-purple-100 text-sm leading-relaxed">
                Füge die App zum Homescreen hinzu. Dann bleibt alles gespeichert —
                auch wenn das Tablet ausgeschaltet wird.
              </p>
            </div>

            {isInstalled ? (
              <div className="flex items-center gap-2 bg-emerald-500/30 border border-emerald-400/40 rounded-xl px-4 py-3">
                <Check className="h-5 w-5 text-emerald-300 shrink-0" />
                <span className="text-sm font-medium">App ist bereits installiert</span>
              </div>
            ) : isIOSDevice ? (
              <div className="bg-white/10 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium">Auf dem iPad / iPhone:</p>
                <ol className="text-sm text-purple-100 space-y-1.5 list-none">
                  <li className="flex items-start gap-2">
                    <span className="bg-white/20 rounded-full h-5 w-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                    Tippe auf das <Share className="h-3.5 w-3.5 inline mx-0.5" /> Teilen-Symbol in Safari
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-white/20 rounded-full h-5 w-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                    Wähle <strong className="text-white">„Zum Home-Bildschirm"</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-white/20 rounded-full h-5 w-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                    Öffne die App dann vom Homescreen
                  </li>
                </ol>
              </div>
            ) : canInstall ? (
              <Button
                className="w-full bg-white text-purple-700 hover:bg-purple-50 font-semibold"
                onClick={install}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Jetzt installieren
              </Button>
            ) : (
              <div className="bg-white/10 rounded-xl p-3 text-sm text-purple-100">
                Öffne diese Seite in Chrome oder Edge und tippe auf „Installieren" in der Adressleiste.
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="ghost"
                className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setStep('whisper')}
              >
                Überspringen
              </Button>
              <Button
                className="flex-1 bg-white text-purple-700 hover:bg-purple-50 font-semibold"
                onClick={() => setStep('whisper')}
              >
                Weiter <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── WHISPER ── */}
        {step === 'whisper' && (
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 text-white space-y-5">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="bg-white/20 rounded-full px-2 py-0.5">Schritt 2 von 3</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Mic className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Offline-Mikrofon</h2>
              <p className="text-pink-100 text-sm leading-relaxed">
                Das Whisper-Modell (~150 MB) ermöglicht Spracherkennung ohne Internet —
                sicher, privat, auf dem Gerät.
              </p>
            </div>

{/* iOS-Whisper-Warnung — erscheint immer auf iPhone/iPad */}
            {isIOS && (
              <div className="rounded-xl bg-black/20 border border-white/20 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-300 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-yellow-200">
                      Offline-Spracherkennung auf iPhone/iPad nicht verfügbar
                    </p>
                    <p className="text-xs text-pink-200 leading-relaxed">
                      Whisper läuft auf iOS/WebKit technisch nicht zuverlässig — dies ist
                      eine bekannte Einschränkung von Apple’s Browser-Engine, unabhängig
                      vom verwendeten Browser.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 p-2 space-y-0.5">
                    <p className="font-semibold text-emerald-300">✅ Funktioniert auf iOS</p>
                    <p className="text-emerald-200">Online-Betrieb (vollständig)</p>
                    <p className="text-emerald-200">Offline-Übersetzung (Opus-MT)</p>
                  </div>
                  <div className="rounded-lg bg-red-500/20 border border-red-400/30 p-2 space-y-0.5">
                    <p className="font-semibold text-red-300">❌ Nicht möglich auf iOS</p>
                    <p className="text-red-200">Offline-Spracherkennung</p>
                    <p className="text-red-200">Vollständiger Offline-Betrieb</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-white/10 p-2.5">
                  <Tablet className="h-3.5 w-3.5 text-white/70 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-white/80 leading-relaxed">
                    <span className="font-semibold text-white">Empfehlung für Behörden-Tablets:</span>{' '}
                    Für vollständigen Offline-Betrieb bitte ein Android-Tablet verwenden
                    (z. B. Samsung Galaxy Tab A9, ca. 200 €).
                  </p>
                </div>
              </div>
            )}

            {/* Whisper-Download — nur auf Nicht-iOS anzeigen */}
            {!isIOS && (
              whisperReady ? (
                <div className="flex items-center gap-2 bg-emerald-500/30 border border-emerald-400/40 rounded-xl px-4 py-3">
                  <Check className="h-5 w-5 text-emerald-300 shrink-0" />
                  <span className="text-sm font-medium">Offline-Mikrofon ist bereit</span>
                </div>
              ) : whisperDownloading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Lade Whisper herunter…
                    </span>
                    <span className="font-mono">{whisperProgress}%</span>
                  </div>
                  <ProgressBar value={whisperProgress} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-white text-pink-700 hover:bg-pink-50 font-semibold"
                    onClick={downloadWhisper}
                    disabled={isOffline}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Whisper herunterladen (~150 MB)
                  </Button>
                  {isOffline && (
                    <p className="text-xs text-pink-200 flex items-center gap-1">
                      <WifiOff className="h-3 w-3" /> Internetverbindung erforderlich
                    </p>
                  )}
                  {whisperError && (
                    <p className="text-xs text-red-300">{whisperError}</p>
                  )}
                </div>
              )
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="ghost"
                className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setStep('languages')}
              >
                Überspringen
              </Button>
              <Button
                className="flex-1 bg-white text-pink-700 hover:bg-pink-50 font-semibold"
                onClick={() => setStep('languages')}
                disabled={whisperDownloading}
              >
                Weiter <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── LANGUAGES ── */}
        {step === 'languages' && (
          <div className="bg-gradient-to-br from-pink-600 to-orange-500 p-8 text-white space-y-5">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="bg-white/20 rounded-full px-2 py-0.5">Schritt 3 von 3</span>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Languages className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Sprachen laden</h2>
              <p className="text-orange-100 text-sm leading-relaxed">
                Lade jetzt das Behörden-Paket herunter: Deutsch ↔ Englisch, Arabisch,
                Türkisch, Ukrainisch, Russisch und Persisch.
              </p>
            </div>

            {/* Progress */}
            <div className="bg-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Behörden-Paket</span>
                <span className="font-mono">{pairsDownloaded}/{pairsTotal}</span>
              </div>
              <ProgressBar value={(pairsDownloaded / pairsTotal) * 100} />
              {pairsDownloading && currentPairLabel && (
                <p className="text-xs text-orange-200 flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                  {currentPairLabel} — {currentPairProgress}%
                </p>
              )}
              {pairsDone && (
                <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  Alle Sprachen sind bereit
                </p>
              )}
              {pairsError && (
                <p className="text-xs text-red-300">{pairsError}</p>
              )}
            </div>

            {!pairsDone && !pairsDownloading && (
              <Button
                className="w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold"
                onClick={downloadAllPairs}
                disabled={isOffline}
              >
                <Download className="h-4 w-4 mr-2" />
                Alle Sprachen herunterladen (~570 MB)
              </Button>
            )}
            {isOffline && !pairsDone && (
              <p className="text-xs text-orange-200 flex items-center gap-1">
                <WifiOff className="h-3 w-3" /> Internetverbindung erforderlich
              </p>
            )}

            <div className="flex gap-2 pt-1">
              {!pairsDone && (
                <Button
                  variant="ghost"
                  className="flex-1 text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setStep('done')}
                  disabled={pairsDownloading}
                >
                  Überspringen
                </Button>
              )}
              <Button
                className={`${pairsDone ? 'w-full' : 'flex-1'} bg-white text-orange-600 hover:bg-orange-50 font-semibold`}
                onClick={() => setStep('done')}
                disabled={pairsDownloading}
              >
                {pairsDone ? 'Fertig!' : 'Weiter'} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white space-y-6 text-center">
            <div className="space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Alles bereit!</h2>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Das Gerät ist eingerichtet. Die App funktioniert jetzt
                {whisperReady && pairsDone
                  ? ' vollständig ohne Internetverbindung.'
                  : ' — fehlende Pakete können jederzeit in der Offline-Einrichtung nachgeladen werden.'}
              </p>
            </div>

            <div className="space-y-2 text-left">
              {[
                { done: isInstalled, label: 'App installiert' },
                { done: whisperReady, label: 'Offline-Mikrofon aktiv' },
                { done: pairsDone, label: 'Sprachen geladen' },
              ].map(({ done, label }) => (
                <div key={label} className="flex items-center gap-2.5 bg-white/10 rounded-xl px-4 py-2.5">
                  {done
                    ? <Check className="h-4 w-4 text-emerald-300 shrink-0" />
                    : <Wifi className="h-4 w-4 text-white/40 shrink-0" />
                  }
                  <span className={`text-sm ${done ? '' : 'text-white/50'}`}>{label}</span>
                  {!done && <span className="ml-auto text-xs text-white/40">später nachholen</span>}
                </div>
              ))}
            </div>

            <Button
              className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-base py-6"
              onClick={handleFinish}
            >
              Zum Gespräch starten <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Prüft ob der Wizard angezeigt werden soll */
export function shouldShowFirstRunWizard(forcedByUrl: boolean): boolean {
  if (forcedByUrl) return true
  try {
    return !localStorage.getItem(FIRST_RUN_KEY)
  } catch {
    return false
  }
}
