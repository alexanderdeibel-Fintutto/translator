// ConversationPage — bidirektionaler Gesprächsmodus (Schachuhr-Prinzip)
// Design: zwei Panels gegenüberstehend (180° rotiert), Push-to-Talk, Kontext-Modus, Per-Seite-Audio
//
// CRITICAL RULES (do not remove):
// - activeSide: nur eine Seite kann gleichzeitig sprechen — nie beide gleichzeitig aktiv
// - Push-to-Talk: onPointerDown startet, onPointerUp stoppt — kein Toggle-Klick
// - autoSpeakTop / autoSpeakBottom: unabhängige Audio-Toggles pro Seite
// - contextMode: wird an translateText übergeben für domänenspezifische Übersetzung
// - Visibility-Resume: wenn Tab zurückkommt, aktive STT-Session neu starten
// - Refs statt Objekte in useEffect-Dependencies (AGENTS.md Regel 2.1)

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Mic, MicOff, ArrowUpDown, Volume2, VolumeX, RotateCcw,
  Stethoscope, Scale, Briefcase, Globe, Plane, MessageCircle,
  WifiOff, Wifi
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import LanguageSelector from '@/components/translator/LanguageSelector'
import { translateText } from '@/lib/translate'
import { getLanguageByCode, isRTL } from '@/lib/languages'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useI18n } from '@/context/I18nContext'
import { useTierId } from '@/context/UserContext'
import { hasFeature } from '@/lib/tiers'
import { UpgradePrompt } from '@/components/pricing/UpgradePrompt'
import { CONTEXT_MODES, type TranslationContext } from '@/lib/context-modes'
import { useOffline } from '@/context/OfflineContext'
import { isWhisperAvailable } from '@/lib/offline/stt-engine'
import DocumentScanner from '@/components/translator/DocumentScanner'
import { ScanLine } from 'lucide-react'

const shortTimeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })

interface Message {
  id: string
  speaker: 'top' | 'bottom'
  original: string
  translated: string
  timestamp: number
}

const CONTEXT_ICONS: Record<TranslationContext, React.ReactNode> = {
  general:  <Globe className="h-3.5 w-3.5" />,
  travel:   <Plane className="h-3.5 w-3.5" />,
  medical:  <Stethoscope className="h-3.5 w-3.5" />,
  legal:    <Scale className="h-3.5 w-3.5" />,
  business: <Briefcase className="h-3.5 w-3.5" />,
  casual:   <MessageCircle className="h-3.5 w-3.5" />,
}

export default function ConversationPage() {
  const { t } = useI18n()
  const tierId = useTierId()
  const canConversation = hasFeature(tierId, 'conversationMode')
  const { isOffline, isLanguagePairOffline } = useOffline()

  const [topLang, setTopLang] = useState('en')
  const [bottomLang, setBottomLang] = useState('de')
  const [activeSide, setActiveSide] = useState<'top' | 'bottom' | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [contextMode, setContextMode] = useState<TranslationContext>('general')
  const [activeTab, setActiveTab] = useState<'conversation' | 'document'>('conversation')
  const [docSourceLang, setDocSourceLang] = useState('en')
  const [docTargetLang, setDocTargetLang] = useState('de')

  // Per-side audio toggles — independent for each conversation partner
  const [autoSpeakTop, setAutoSpeakTop] = useState(true)
  const [autoSpeakBottom, setAutoSpeakBottom] = useState(true)

  // Offline-First STT: prefer Whisper when available (downloaded), fall back to Web Speech
  const [whisperReady, setWhisperReady] = useState(false)
  useEffect(() => {
    isWhisperAvailable().then(setWhisperReady)
  }, [])

  // Use offline (Whisper) engine when available — no internet needed for STT
  const topRecognition = useSpeechRecognition(whisperReady)
  const bottomRecognition = useSpeechRecognition(whisperReady)
  const tts = useSpeechSynthesis()

  // Refs for stable access in callbacks (AGENTS.md Rule 2.1 — no objects in useEffect deps)
  const isTranslatingRef = useRef(false)
  const autoSpeakTopRef = useRef(autoSpeakTop)
  autoSpeakTopRef.current = autoSpeakTop
  const autoSpeakBottomRef = useRef(autoSpeakBottom)
  autoSpeakBottomRef.current = autoSpeakBottom
  const ttsRef = useRef(tts.speak)
  ttsRef.current = tts.speak
  const isAnyListeningRef = useRef(false)
  isAnyListeningRef.current = topRecognition.isListening || bottomRecognition.isListening
  const activeSideRef = useRef<'top' | 'bottom' | null>(null)
  activeSideRef.current = activeSide
  const topLangRef = useRef(topLang)
  topLangRef.current = topLang
  const bottomLangRef = useRef(bottomLang)
  bottomLangRef.current = bottomLang
  const contextModeRef = useRef(contextMode)
  contextModeRef.current = contextMode

  // Push-to-Talk state — tracks whether pointer is currently held down
  const pttActiveRef = useRef<'top' | 'bottom' | null>(null)
  const accumulatedTranscriptRef = useRef('')
  const interimTextRef = useRef('')

  // DSGVO Auto-Reset: clear conversation after 5 minutes of inactivity
  // Protects sensitive data (medical, legal, authority) between appointments
  const [showAutoResetWarning, setShowAutoResetWarning] = useState(false)
  const autoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoResetWarnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const AUTO_RESET_MS = 5 * 60 * 1000      // 5 minutes → clear
  const AUTO_RESET_WARN_MS = 4 * 60 * 1000  // 4 minutes → show warning

  const resetAutoResetTimer = useCallback(() => {
    if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current)
    if (autoResetWarnTimerRef.current) clearTimeout(autoResetWarnTimerRef.current)
    setShowAutoResetWarning(false)
    autoResetWarnTimerRef.current = setTimeout(() => {
      setShowAutoResetWarning(true)
    }, AUTO_RESET_WARN_MS)
    autoResetTimerRef.current = setTimeout(() => {
      setMessages([])
      setCurrentTranscript('')
      setShowAutoResetWarning(false)
    }, AUTO_RESET_MS)
  }, [])

  // Start timer on mount; restart whenever a message is added or PTT is used
  useEffect(() => {
    resetAutoResetTimer()
    return () => {
      if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current)
      if (autoResetWarnTimerRef.current) clearTimeout(autoResetWarnTimerRef.current)
    }
  }, [messages, resetAutoResetTimer])

  const handleResult = useCallback(async (text: string, side: 'top' | 'bottom') => {
    if (isTranslatingRef.current || !text.trim()) return
    isTranslatingRef.current = true
    setIsTranslating(true)
    setCurrentTranscript('')

    const srcLang = side === 'top' ? topLangRef.current : bottomLangRef.current
    const tgtLang = side === 'top' ? bottomLangRef.current : topLangRef.current

    setError(null)
    try {
      const result = await translateText(text, srcLang, tgtLang, undefined, contextModeRef.current)
      const msg: Message = {
        id: `msg_${Date.now()}`,
        speaker: side,
        original: text,
        translated: result.translatedText,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, msg])

      // Per-side audio: only speak to the target side's partner
      const targetSideAutoSpeak = side === 'top' ? autoSpeakBottomRef.current : autoSpeakTopRef.current
      if (targetSideAutoSpeak && result.translatedText && !isAnyListeningRef.current) {
        const lang = getLanguageByCode(tgtLang)
        ttsRef.current(result.translatedText, lang?.speechCode || tgtLang)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(msg === 'OFFLINE_NO_MODEL' ? t('error.offlineNoModel') : t('error.allProvidersFailed'))
    } finally {
      isTranslatingRef.current = false
      setIsTranslating(false)
      setActiveSide(null)
    }
  }, [t])

  // Push-to-Talk: start listening on pointer down
  const handlePTTDown = useCallback((side: 'top' | 'bottom') => {
    if (activeSideRef.current !== null && activeSideRef.current !== side) return
    if (isTranslatingRef.current) return

    tts.warmup() // Unlock iOS audio during user gesture
    pttActiveRef.current = side
    setActiveSide(side)
    setCurrentTranscript('')
    accumulatedTranscriptRef.current = ''
    interimTextRef.current = ''

    const lang = getLanguageByCode(side === 'top' ? topLangRef.current : bottomLangRef.current)
    const langCode = lang?.speechCode || (side === 'top' ? topLangRef.current : bottomLangRef.current)
    const recognition = side === 'top' ? topRecognition : bottomRecognition

    recognition.startListening(
      langCode, 
      (text) => {
        // onFinalResult: append to accumulated text with simple dedup
        const currentAcc = accumulatedTranscriptRef.current
        if (!currentAcc.endsWith(text)) {
          accumulatedTranscriptRef.current += (currentAcc ? ' ' : '') + text
        }
        interimTextRef.current = ''
        setCurrentTranscript(accumulatedTranscriptRef.current)
      },
      (text) => {
        // onInterimResult: show accumulated + interim
        interimTextRef.current = text
        setCurrentTranscript(accumulatedTranscriptRef.current + (accumulatedTranscriptRef.current ? ' ' : '') + text)
      }
    )
  }, [topRecognition, bottomRecognition, tts])

  // Push-to-Talk: stop on pointer up / leave
  const handlePTTUp = useCallback((side: 'top' | 'bottom') => {
    if (pttActiveRef.current !== side) return
    pttActiveRef.current = null
    const recognition = side === 'top' ? topRecognition : bottomRecognition
    recognition.stopListening()
    
    // Translate the accumulated text + any pending interim text on release
    const finalText = (accumulatedTranscriptRef.current + (accumulatedTranscriptRef.current && interimTextRef.current ? ' ' : '') + interimTextRef.current).trim()
    
    if (finalText) {
      handleResult(finalText, side)
    } else {
      setActiveSide(null)
      setCurrentTranscript('')
    }
  }, [topRecognition, bottomRecognition, handleResult])

  const stopAll = useCallback(() => {
    pttActiveRef.current = null
    topRecognition.stopListening()
    bottomRecognition.stopListening()
    setActiveSide(null)
    setCurrentTranscript('')
  }, [topRecognition, bottomRecognition])

  const swapLanguages = () => {
    setTopLang(bottomLang)
    setBottomLang(topLang)
  }

  const clearMessages = () => {
    setMessages([])
  }

  // Visibility-Resume: wenn Tab in den Hintergrund geht und zurückkommt,
  // aktive STT-Session neu starten — verhindert stille Mikrofone nach Tab-Wechsel
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && activeSideRef.current !== null) {
        const side = activeSideRef.current
        const recognition = side === 'top' ? topRecognition : bottomRecognition
        const lang = getLanguageByCode(side === 'top' ? topLangRef.current : bottomLangRef.current)
        const langCode = lang?.speechCode || (side === 'top' ? topLangRef.current : bottomLangRef.current)

        // Brief delay to let browser audio subsystem re-initialize
        setTimeout(() => {
          if (activeSideRef.current === side) {
            recognition.startListening(
              langCode, 
              (text) => {
                const currentAcc = accumulatedTranscriptRef.current
                if (!currentAcc.endsWith(text)) {
                  accumulatedTranscriptRef.current += (currentAcc ? ' ' : '') + text
                }
                interimTextRef.current = ''
                setCurrentTranscript(accumulatedTranscriptRef.current)
              },
              (text) => {
                interimTextRef.current = text
                setCurrentTranscript(accumulatedTranscriptRef.current + (accumulatedTranscriptRef.current ? ' ' : '') + text)
              }
            )
          }
        }, 300)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [topRecognition, bottomRecognition, handleResult])

  const topLangData = getLanguageByCode(topLang)
  const bottomLangData = getLanguageByCode(bottomLang)

  // Auto-scroll conversation to bottom
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  if (!canConversation) {
    return (
      <div className="container py-6 space-y-6 max-w-2xl mx-auto">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">
            <span className="gradient-text-translator">{t('conversation.title')}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{t('conversation.subtitle')}</p>
        </div>
        <UpgradePrompt tierId={tierId} limitType="feature_locked" featureName="Konversationsmodus" />
      </div>
    )
  }

  return (
    <div className="container py-4 space-y-3 max-w-2xl mx-auto">
      {/* Tab switcher: Gespräch | Dokument */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab('conversation')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'conversation'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mic className="h-4 w-4" />
          Gespräch
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'document'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ScanLine className="h-4 w-4" />
          Dokument
        </button>
      </div>

      {/* Document scanner tab */}
      {activeTab === 'document' && (
        <DocumentScanner
          sourceLang={docSourceLang}
          onSourceLangChange={setDocSourceLang}
          targetLang={docTargetLang}
          onTargetLangChange={setDocTargetLang}
        />
      )}

      {/* Conversation tab — only render when active */}
      {activeTab !== 'conversation' ? null : <>
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
          <span className="gradient-text-translator">{t('conversation.title')}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('conversation.subtitle')}
        </p>
        {/* Offline / STT status indicator */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {isOffline ? (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <WifiOff className="h-3 w-3" />
              Offline-Modus
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Wifi className="h-3 w-3" />
              Online
            </span>
          )}
          {whisperReady ? (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <Mic className="h-3 w-3" />
              Offline-Mikrofon aktiv
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              <Mic className="h-3 w-3" />
              Cloud-Mikrofon
            </span>
          )}
          {isLanguagePairOffline(topLang, bottomLang) && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Offline-Übersetzung bereit
            </span>
          )}
        </div>
      </div>

      {/* DSGVO Auto-Reset Warning */}
      {showAutoResetWarning && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="text-base">&#9888;&#65039;</span>
            <span>Gespräch wird in 1 Minute automatisch gelöscht (Datenschutz).</span>
          </span>
          <button
            onClick={resetAutoResetTimer}
            className="shrink-0 font-medium underline underline-offset-2 hover:no-underline"
          >
            Weiter
          </button>
        </div>
      )}

      {/* Context mode selector */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {CONTEXT_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => setContextMode(mode.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
              contextMode === mode.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            }`}
            aria-pressed={contextMode === mode.id}
          >
            {CONTEXT_ICONS[mode.id]}
            <span>{t(mode.i18nKey)}</span>
          </button>
        ))}
      </div>

      {/* Language bar */}
      <div className="flex items-end justify-center gap-3">
        <LanguageSelector value={topLang} onChange={setTopLang} label={t('conversation.person1')} />
        <Button variant="outline" size="icon" onClick={swapLanguages} className="mb-0.5 shrink-0" aria-label={t('translator.swap')}>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        <LanguageSelector value={bottomLang} onChange={setBottomLang} label={t('conversation.person2')} />
      </div>

      {/* Conversation area — split screen */}
      <div className="grid grid-rows-[1fr_auto_1fr] gap-2 min-h-[60vh]">

        {/* Top person (rotated 180° for face-to-face use) */}
        <div
          className={`relative rounded-xl border-2 p-4 flex flex-col transition-colors select-none ${
            activeSide === 'top'
              ? 'border-primary bg-primary/5'
              : 'border-border'
          }`}
          style={{ transform: 'rotate(180deg)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {topLangData?.flag} {topLangData?.name}
              </span>
              {/* Per-side audio toggle for top person */}
              <button
                onClick={() => setAutoSpeakTop(v => !v)}
                className={`p-1 rounded-full transition-colors ${autoSpeakTop ? 'text-primary' : 'text-muted-foreground/40'}`}
                aria-label={autoSpeakTop ? 'Audio aus' : 'Audio an'}
                title={autoSpeakTop ? 'Audio deaktivieren' : 'Audio aktivieren'}
              >
                {autoSpeakTop ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Push-to-Talk button — gedrückt halten zum Sprechen */}
            <Button
              size="sm"
              variant={activeSide === 'top' ? 'destructive' : 'default'}
              onPointerDown={() => handlePTTDown('top')}
              onPointerUp={() => handlePTTUp('top')}
              onPointerLeave={() => handlePTTUp('top')}
              onPointerCancel={() => handlePTTUp('top')}
              disabled={activeSide === 'bottom' || isTranslating}
              className="gap-1.5 rounded-full touch-none"
              aria-pressed={activeSide === 'top'}
            >
              {activeSide === 'top'
                ? <><MicOff className="h-4 w-4" aria-hidden="true" />{t('conversation.stop')}</>
                : <><Mic className="h-4 w-4" aria-hidden="true" />{t('conversation.speak')}</>
              }
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.slice(-6).map(msg => {
              const isOwnMessage = msg.speaker === 'top'
              const originalDir = isRTL(isOwnMessage ? topLang : bottomLang) ? 'rtl' : 'ltr'
              const translatedDir = isRTL(isOwnMessage ? bottomLang : topLang) ? 'rtl' : 'ltr'
              const time = shortTimeFormat.format(new Date(msg.timestamp))
              return (
                <div
                  key={msg.id}
                  className={`rounded-lg p-2.5 space-y-0.5 ${
                    isOwnMessage ? 'bg-primary/10 ml-6' : 'bg-muted/60 mr-6 border-l-2 border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{isOwnMessage ? (topLangData?.flag || '') : (bottomLangData?.flag || '')}</span>
                    <span>{isOwnMessage ? t('conversation.you') : t('conversation.other')}</span>
                    <span className="ml-auto">{time}</span>
                  </div>
                  {isOwnMessage ? (
                    <>
                      <p className="text-sm" dir={originalDir}>{msg.original}</p>
                      <p className="text-xs text-muted-foreground" dir={translatedDir}>→ {msg.translated}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium" dir={translatedDir}>{msg.translated}</p>
                      <p className="text-xs text-muted-foreground" dir={originalDir}>({msg.original})</p>
                    </>
                  )}
                </div>
              )
            })}
            {activeSide === 'top' && currentTranscript && (
              <p className="text-sm italic text-muted-foreground/60 ml-6">{currentTranscript}...</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center z-10 py-1">
          <div className="absolute inset-x-0 border-t border-dashed border-border" />
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="relative bg-background px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              aria-label={t('conversation.restart')}
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              {t('conversation.restart')}
            </button>
          )}
        </div>

        {/* Bottom person (normal orientation) */}
        <div
          className={`relative rounded-xl border-2 p-4 flex flex-col transition-colors select-none ${
            activeSide === 'bottom'
              ? 'border-primary bg-primary/5'
              : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {bottomLangData?.flag} {bottomLangData?.name}
              </span>
              {/* Per-side audio toggle for bottom person */}
              <button
                onClick={() => setAutoSpeakBottom(v => !v)}
                className={`p-1 rounded-full transition-colors ${autoSpeakBottom ? 'text-primary' : 'text-muted-foreground/40'}`}
                aria-label={autoSpeakBottom ? 'Audio aus' : 'Audio an'}
                title={autoSpeakBottom ? 'Audio deaktivieren' : 'Audio aktivieren'}
              >
                {autoSpeakBottom ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Push-to-Talk button */}
            <Button
              size="sm"
              variant={activeSide === 'bottom' ? 'destructive' : 'default'}
              onPointerDown={() => handlePTTDown('bottom')}
              onPointerUp={() => handlePTTUp('bottom')}
              onPointerLeave={() => handlePTTUp('bottom')}
              onPointerCancel={() => handlePTTUp('bottom')}
              disabled={activeSide === 'top' || isTranslating}
              className="gap-1.5 rounded-full touch-none"
              aria-pressed={activeSide === 'bottom'}
            >
              {activeSide === 'bottom'
                ? <><MicOff className="h-4 w-4" aria-hidden="true" />{t('conversation.stop')}</>
                : <><Mic className="h-4 w-4" aria-hidden="true" />{t('conversation.speak')}</>
              }
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2">
            {messages.slice(-6).map(msg => {
              const isOwnMessage = msg.speaker === 'bottom'
              const originalDir = isRTL(isOwnMessage ? bottomLang : topLang) ? 'rtl' : 'ltr'
              const translatedDir = isRTL(isOwnMessage ? topLang : bottomLang) ? 'rtl' : 'ltr'
              const time = shortTimeFormat.format(new Date(msg.timestamp))
              return (
                <div
                  key={msg.id}
                  className={`rounded-lg p-2.5 space-y-0.5 ${
                    isOwnMessage ? 'bg-primary/10 ml-6' : 'bg-muted/60 mr-6 border-l-2 border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{isOwnMessage ? (bottomLangData?.flag || '') : (topLangData?.flag || '')}</span>
                    <span>{isOwnMessage ? t('conversation.you') : t('conversation.other')}</span>
                    <span className="ml-auto">{time}</span>
                  </div>
                  {isOwnMessage ? (
                    <>
                      <p className="text-sm" dir={originalDir}>{msg.original}</p>
                      <p className="text-xs text-muted-foreground" dir={translatedDir}>→ {msg.translated}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium" dir={translatedDir}>{msg.translated}</p>
                      <p className="text-xs text-muted-foreground" dir={originalDir}>({msg.original})</p>
                    </>
                  )}
                </div>
              )
            })}
            {activeSide === 'bottom' && currentTranscript && (
              <p className="text-sm italic text-muted-foreground/60 ml-6">{currentTranscript}...</p>
            )}
          </div>
        </div>
      </div>

      <div aria-live="polite">
        {isTranslating && (
          <p className="text-center text-sm text-muted-foreground animate-pulse">
            {t('conversation.translating')}
          </p>
        )}
      </div>
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg text-center" role="alert">
          {error}
        </div>
      )}
      </> /* end conversation tab */}
    </div>
  )
}
