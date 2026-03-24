/**
 * Standalone Translate Page — AmtTranslator (Primäre Haupt-UI)
 *
 * Bidirektionale Echtzeit-Übersetzung auf einem einzigen Gerät.
 * Kein zweites Gerät, kein Internet, kein QR-Code erforderlich.
 *
 * Ablauf:
 *   Sachbearbeiter drückt "DE" → spricht Deutsch → KI übersetzt → TTS spielt in Zielsprache ab
 *   Bürger drückt "Zielsprache" → spricht in seiner Sprache → KI übersetzt → TTS spielt Deutsch ab
 *
 * Modi:
 *   - Push-to-Talk (Standardmodus): Taste gedrückt halten → sprechen → loslassen → Übersetzung
 *   - Kontinuierlich (Auto): Automatische Satzerkennung, sofortige Übersetzung
 *
 * Design: Tablet-optimiert, zwei große Hälften (oben = Sachbearbeiter, unten = Bürger),
 * hoher Kontrast, große Touch-Targets (BITV 2.0)
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowLeftRight,
  Settings,
  QrCode,
  ChevronDown,
  RotateCcw,
  Wifi,
  WifiOff,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { translateText } from '@/lib/translate'
import { speakText } from '@/lib/tts'
import { createWebSpeechEngine } from '@/lib/stt'

// ─── Language Registry ────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'ar', bcp47: 'ar-SA', label: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'tr', bcp47: 'tr-TR', label: 'Türkçe', flag: '🇹🇷', rtl: false },
  { code: 'uk', bcp47: 'uk-UA', label: 'Українська', flag: '🇺🇦', rtl: false },
  { code: 'ru', bcp47: 'ru-RU', label: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'fa', bcp47: 'fa-IR', label: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'ps', bcp47: 'ps-AF', label: 'پښتو', flag: '🇦🇫', rtl: true },
  { code: 'so', bcp47: 'so-SO', label: 'Soomaali', flag: '🇸🇴', rtl: false },
  { code: 'ti', bcp47: 'ti-ET', label: 'ትግርኛ', flag: '🇪🇷', rtl: false },
  { code: 'am', bcp47: 'am-ET', label: 'አማርኛ', flag: '🇪🇹', rtl: false },
  { code: 'fr', bcp47: 'fr-FR', label: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'ro', bcp47: 'ro-RO', label: 'Română', flag: '🇷🇴', rtl: false },
  { code: 'pl', bcp47: 'pl-PL', label: 'Polski', flag: '🇵🇱', rtl: false },
  { code: 'vi', bcp47: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  { code: 'ku', bcp47: 'ku', label: 'Kurdî', flag: '🏳️', rtl: true },
  { code: 'sr', bcp47: 'sr-RS', label: 'Српски', flag: '🇷🇸', rtl: false },
  { code: 'bs', bcp47: 'bs-BA', label: 'Bosanski', flag: '🇧🇦', rtl: false },
  { code: 'sq', bcp47: 'sq-AL', label: 'Shqip', flag: '🇦🇱', rtl: false },
  { code: 'mk', bcp47: 'mk-MK', label: 'Македонски', flag: '🇲🇰', rtl: false },
  { code: 'ka', bcp47: 'ka-GE', label: 'ქართული', flag: '🇬🇪', rtl: false },
  { code: 'hy', bcp47: 'hy-AM', label: 'Հայերեն', flag: '🇦🇲', rtl: false },
  { code: 'zh', bcp47: 'zh-CN', label: '中文', flag: '🇨🇳', rtl: false },
  { code: 'hi', bcp47: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳', rtl: false },
  { code: 'ur', bcp47: 'ur-PK', label: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'bn', bcp47: 'bn-BD', label: 'বাংলা', flag: '🇧🇩', rtl: false },
]

const DE = { code: 'de', bcp47: 'de-DE', label: 'Deutsch', flag: '🇩🇪', rtl: false }

// ─── Types ────────────────────────────────────────────────────────────────────

type Speaker = 'clerk' | 'visitor'
type TranslateMode = 'push' | 'auto'

interface Utterance {
  id: string
  speaker: Speaker
  original: string
  translated: string
  timestamp: Date
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StandaloneTranslatePage() {
  const navigate = useNavigate()

  // Language state
  const [visitorLang, setVisitorLang] = useState(LANGUAGES[0]) // Arabic default
  const [showLangPicker, setShowLangPicker] = useState(false)

  // Mode
  const [mode, setMode] = useState<TranslateMode>('push')
  const [isMuted, setIsMuted] = useState(false)

  // Recording state
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null)
  const [interimText, setInterimText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  // History
  const [utterances, setUtterances] = useState<Utterance[]>([])
  const historyRef = useRef<HTMLDivElement>(null)

  // STT engine
  const sttRef = useRef(createWebSpeechEngine())
  const isRecordingRef = useRef(false)

  // Online status
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Auto-scroll history
  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: 'smooth' })
  }, [utterances])

  // ─── Core: Translate + Speak ────────────────────────────────────────────────

  const translateAndSpeak = useCallback(
    async (text: string, speaker: Speaker) => {
      if (!text.trim()) return

      const fromCode = speaker === 'clerk' ? 'de' : visitorLang.code
      const toCode = speaker === 'clerk' ? visitorLang.code : 'de'
      const toBcp47 = speaker === 'clerk' ? visitorLang.bcp47 : DE.bcp47

      setIsTranslating(true)
      try {
        const result = await translateText(text, fromCode, toCode)
        const translated = result.translatedText

        // Add to history
        const utterance: Utterance = {
          id: Date.now().toString(),
          speaker,
          original: text,
          translated,
          timestamp: new Date(),
        }
        setUtterances((prev) => [...prev.slice(-20), utterance]) // Keep last 20

        // Speak translation
        if (!isMuted) {
          await speakText(translated, toBcp47)
        }
      } catch (err) {
        console.error('Translation error:', err)
      } finally {
        setIsTranslating(false)
        setInterimText('')
      }
    },
    [visitorLang, isMuted]
  )

  // ─── STT Handlers ──────────────────────────────────────────────────────────

  const startListening = useCallback(
    (speaker: Speaker) => {
      if (isRecordingRef.current) return
      isRecordingRef.current = true
      setActiveSpeaker(speaker)
      setInterimText('')

      const lang = speaker === 'clerk' ? DE.bcp47 : visitorLang.bcp47

      sttRef.current.start(
        lang,
        (result) => {
          if (result.isFinal) {
            isRecordingRef.current = false
            setActiveSpeaker(null)
            translateAndSpeak(result.text, speaker)
          } else {
            setInterimText(result.text)
          }
        },
        (error) => {
          console.error('STT error:', error)
          isRecordingRef.current = false
          setActiveSpeaker(null)
          setInterimText('')
        }
      )
    },
    [visitorLang, translateAndSpeak]
  )

  const stopListening = useCallback(() => {
    sttRef.current.stop()
    isRecordingRef.current = false
    // In push mode: stop triggers final result → translateAndSpeak
    // In auto mode: keep listening until sentence boundary
  }, [])

  // Auto mode: start listening for both sides alternately
  useEffect(() => {
    if (mode === 'auto') {
      // In auto mode, clerk side is always listening
      // (simplified: just show the mode is active)
    }
  }, [mode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sttRef.current.stop()
    }
  }, [])

  // ─── Render ────────────────────────────────────────────────────────────────

  const clerkIsActive = activeSpeaker === 'clerk'
  const visitorIsActive = activeSpeaker === 'visitor'

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Menü
          </button>
          <span className="text-sm font-semibold">AmtTranslator</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-medium">
            Standalone
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Online/Offline indicator */}
          <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Mode toggle */}
          <button
            onClick={() => setMode(mode === 'push' ? 'auto' : 'push')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              mode === 'auto'
                ? 'bg-teal-700 text-white border-teal-700'
                : 'border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            {mode === 'push' ? 'Push-to-Talk' : 'Auto'}
          </button>

          {/* Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-1.5 rounded-lg transition-colors ${
              isMuted ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* QR Code */}
          <button
            onClick={() => navigate('/qr-poster')}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            title="QR-Code für Besucher"
          >
            <QrCode className="h-4 w-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate('/settings')}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Language Bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 bg-muted/30 border-b shrink-0">
        {/* Clerk side */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border">
          <span className="text-lg">{DE.flag}</span>
          <span className="text-sm font-medium">{DE.label}</span>
        </div>

        {/* Swap icon */}
        <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />

        {/* Visitor language picker */}
        <button
          onClick={() => setShowLangPicker(!showLangPicker)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border hover:bg-accent transition-colors"
        >
          <span className="text-lg">{visitorLang.flag}</span>
          <span className="text-sm font-medium">{visitorLang.label}</span>
          <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showLangPicker ? 'rotate-180' : ''}`} />
        </button>

        {/* Clear history */}
        <button
          onClick={() => setUtterances([])}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          title="Verlauf löschen"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Language Picker Dropdown */}
      {showLangPicker && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 w-80 bg-card border rounded-2xl shadow-xl p-3 grid grid-cols-3 gap-1.5 max-h-72 overflow-y-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setVisitorLang(lang)
                setShowLangPicker(false)
              }}
              className={`flex items-center gap-2 px-2 py-2 rounded-xl text-sm transition-colors ${
                visitorLang.code === lang.code
                  ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 font-medium'
                  : 'hover:bg-accent'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="truncate">{lang.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Main Area: Two Halves ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* ── CLERK HALF (top) ─────────────────────────────────────────────── */}
        <div
          className={`flex-1 flex flex-col items-center justify-center gap-4 p-6 transition-colors ${
            clerkIsActive
              ? 'bg-teal-50 dark:bg-teal-900/20'
              : 'bg-background'
          }`}
        >
          {/* Label */}
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="text-base">{DE.flag}</span>
            Sachbearbeiter spricht Deutsch
          </div>

          {/* Interim text */}
          {clerkIsActive && interimText && (
            <p className="text-sm text-muted-foreground italic text-center max-w-sm">
              „{interimText}…"
            </p>
          )}

          {/* Last translation for clerk */}
          {!clerkIsActive && utterances.length > 0 && utterances[utterances.length - 1].speaker === 'clerk' && (
            <div className="text-center max-w-sm space-y-1">
              <p className="text-xs text-muted-foreground">Zuletzt übersetzt:</p>
              <p className={`text-base font-medium ${visitorLang.rtl ? 'text-right' : ''}`} dir={visitorLang.rtl ? 'rtl' : 'ltr'}>
                {utterances[utterances.length - 1].translated}
              </p>
            </div>
          )}

          {/* Push-to-Talk Button */}
          {mode === 'push' ? (
            <button
              onPointerDown={() => startListening('clerk')}
              onPointerUp={stopListening}
              onPointerLeave={stopListening}
              disabled={visitorIsActive || isTranslating}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 text-white font-semibold text-sm shadow-lg transition-all select-none touch-none ${
                clerkIsActive
                  ? 'bg-teal-600 scale-110 shadow-teal-300 dark:shadow-teal-900'
                  : isTranslating
                  ? 'bg-gray-400 cursor-wait'
                  : 'bg-teal-700 hover:bg-teal-600 active:scale-95'
              } disabled:opacity-40`}
            >
              {clerkIsActive ? (
                <>
                  <Mic className="h-8 w-8 animate-pulse" />
                  <span>Aufnahme…</span>
                </>
              ) : isTranslating ? (
                <>
                  <ArrowLeftRight className="h-8 w-8 animate-spin" />
                  <span>Übersetzt…</span>
                </>
              ) : (
                <>
                  <Mic className="h-8 w-8" />
                  <span>Halten</span>
                </>
              )}
            </button>
          ) : (
            /* Auto mode button */
            <button
              onClick={() =>
                activeSpeaker === 'clerk' ? stopListening() : startListening('clerk')
              }
              disabled={visitorIsActive || isTranslating}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 text-white font-semibold text-sm shadow-lg transition-all ${
                clerkIsActive
                  ? 'bg-red-600 shadow-red-300'
                  : 'bg-teal-700 hover:bg-teal-600'
              } disabled:opacity-40`}
            >
              {clerkIsActive ? (
                <>
                  <MicOff className="h-8 w-8" />
                  <span>Stopp</span>
                </>
              ) : (
                <>
                  <Mic className="h-8 w-8" />
                  <span>Starten</span>
                </>
              )}
            </button>
          )}

          <p className="text-xs text-muted-foreground">
            {mode === 'push' ? 'Taste gedrückt halten und sprechen' : 'Klicken zum Starten/Stoppen'}
          </p>
        </div>

        {/* ── Divider with history ─────────────────────────────────────────── */}
        <div className="border-y bg-muted/20 shrink-0">
          <div
            ref={historyRef}
            className="flex gap-3 overflow-x-auto px-4 py-2 scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {utterances.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-1 w-full justify-center">
                <Shield className="h-3 w-3" />
                Gespräch beginnt — alle Daten bleiben auf diesem Gerät
              </div>
            ) : (
              utterances.slice(-6).map((u) => (
                <div
                  key={u.id}
                  className={`shrink-0 max-w-xs px-3 py-2 rounded-xl text-xs ${
                    u.speaker === 'clerk'
                      ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-900 dark:text-teal-100'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                  }`}
                >
                  <p className="font-medium opacity-60 mb-0.5">
                    {u.speaker === 'clerk' ? `🇩🇪 → ${visitorLang.flag}` : `${visitorLang.flag} → 🇩🇪`}
                  </p>
                  <p className="line-clamp-2">{u.translated}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── VISITOR HALF (bottom) ────────────────────────────────────────── */}
        <div
          className={`flex-1 flex flex-col items-center justify-center gap-4 p-6 transition-colors ${
            visitorIsActive
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'bg-background'
          }`}
          style={{ transform: 'rotate(180deg)' }} // Rotated for visitor facing the tablet
        >
          {/* (Content rotated 180° so visitor can read from their side) */}
          <div style={{ transform: 'rotate(180deg)', display: 'contents' }}>

            {/* Label */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="text-base">{visitorLang.flag}</span>
              <span dir={visitorLang.rtl ? 'rtl' : 'ltr'}>{visitorLang.label}</span>
            </div>

            {/* Interim text */}
            {visitorIsActive && interimText && (
              <p
                className="text-sm text-muted-foreground italic text-center max-w-sm"
                dir={visitorLang.rtl ? 'rtl' : 'ltr'}
              >
                „{interimText}…"
              </p>
            )}

            {/* Last translation for visitor */}
            {!visitorIsActive && utterances.length > 0 && utterances[utterances.length - 1].speaker === 'visitor' && (
              <div className="text-center max-w-sm space-y-1">
                <p className="text-xs text-muted-foreground">Zuletzt übersetzt:</p>
                <p className="text-base font-medium">
                  {utterances[utterances.length - 1].translated}
                </p>
              </div>
            )}

            {/* Push-to-Talk Button */}
            {mode === 'push' ? (
              <button
                onPointerDown={() => startListening('visitor')}
                onPointerUp={stopListening}
                onPointerLeave={stopListening}
                disabled={clerkIsActive || isTranslating}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 text-white font-semibold text-sm shadow-lg transition-all select-none touch-none ${
                  visitorIsActive
                    ? 'bg-blue-600 scale-110 shadow-blue-300 dark:shadow-blue-900'
                    : isTranslating
                    ? 'bg-gray-400 cursor-wait'
                    : 'bg-blue-700 hover:bg-blue-600 active:scale-95'
                } disabled:opacity-40`}
              >
                {visitorIsActive ? (
                  <>
                    <Mic className="h-8 w-8 animate-pulse" />
                    <span>
                      {visitorLang.rtl ? '…تسجيل' : 'Aufnahme…'}
                    </span>
                  </>
                ) : isTranslating ? (
                  <>
                    <ArrowLeftRight className="h-8 w-8 animate-spin" />
                    <span>…</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-8 w-8" />
                    <span dir={visitorLang.rtl ? 'rtl' : 'ltr'}>
                      {visitorLang.code === 'ar' ? 'اضغط' :
                       visitorLang.code === 'tr' ? 'Basın' :
                       visitorLang.code === 'uk' ? 'Тримати' :
                       visitorLang.code === 'ru' ? 'Держать' :
                       visitorLang.code === 'fa' ? 'نگه دارید' :
                       visitorLang.code === 'fr' ? 'Appuyer' :
                       'Halten'}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() =>
                  activeSpeaker === 'visitor' ? stopListening() : startListening('visitor')
                }
                disabled={clerkIsActive || isTranslating}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center gap-2 text-white font-semibold text-sm shadow-lg transition-all ${
                  visitorIsActive
                    ? 'bg-red-600 shadow-red-300'
                    : 'bg-blue-700 hover:bg-blue-600'
                } disabled:opacity-40`}
              >
                {visitorIsActive ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </button>
            )}

            <p className="text-xs text-muted-foreground" dir={visitorLang.rtl ? 'rtl' : 'ltr'}>
              {mode === 'push'
                ? visitorLang.code === 'ar' ? 'اضغط مع الاستمرار وتحدث'
                  : visitorLang.code === 'tr' ? 'Basılı tutun ve konuşun'
                  : visitorLang.code === 'uk' ? 'Утримуйте та говоріть'
                  : visitorLang.code === 'ru' ? 'Держите и говорите'
                  : visitorLang.code === 'fa' ? 'نگه دارید و صحبت کنید'
                  : 'Taste halten und sprechen'
                : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
