import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ArrowRightLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  Loader2,
  UserCheck,
  User,
  ThumbsUp,
  ThumbsDown,
  Share2,

  Send,
  Zap,
  AlignLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageSelector from './LanguageSelector'
import { translateText } from '@/lib/translate'
import { detectLanguage } from '@/lib/detect-language'
import { getLanguageByCode, isRTL } from '@/lib/languages'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { supportsFormality, convertToInformal } from '@/lib/formality'
import { useI18n } from '@/context/I18nContext'
import type { HistoryEntry } from '@/hooks/useTranslationHistory'

interface TranslationSegment {
  id: string
  sourceText: string
  translatedText: string
  isTranslating: boolean
}

interface TranslationPanelProps {
  initialText?: string
  initialSourceLang?: string
  initialTargetLang?: string
  onInitialTextConsumed?: () => void
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void
}

export default function TranslationPanel({ initialText, initialSourceLang, initialTargetLang, onInitialTextConsumed, addEntry }: TranslationPanelProps) {
  const { t } = useI18n()
  const [sourceLang, setSourceLang] = useState('de')
  const [targetLang, setTargetLang] = useState('en')
  const [autoDetect, setAutoDetect] = useState(false)
  const [detectedLang, setDetectedLang] = useState<string | null>(null)
  // Segment-based state for speech mode
  const [segments, setSegments] = useState<TranslationSegment[]>([])
  const [interimText, setInterimText] = useState('')

  // Stream mode: 'sentence' = auto-segment per sentence, 'paragraph' = accumulate until Send
  const [streamMode, setStreamMode] = useState<'sentence' | 'paragraph'>(() => {
    return (localStorage.getItem('translator-stream-mode') as 'sentence' | 'paragraph') || 'sentence'
  })

  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [provider, setProvider] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [autoSpeak, setAutoSpeak] = useState(() => {
    const saved = localStorage.getItem('translator-auto-speak')
    return saved !== null ? saved === 'true' : true
  })
  const [hdVoice, setHdVoice] = useState(() => {
    return localStorage.getItem('translator-hd-voice') === 'true'
  })
  const [useInformal, setUseInformal] = useState(() => {
    return localStorage.getItem('translator-informal') === 'true'
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoSpeakRef = useRef(autoSpeak)
  const targetLangRef = useRef(targetLang)
  const sourceLangRef = useRef(sourceLang)
  const useInformalRef = useRef(useInformal)
  const streamModeRef = useRef(streamMode)
  const prevIsListeningRef = useRef(false)

  // Keep refs in sync
  autoSpeakRef.current = autoSpeak
  targetLangRef.current = targetLang
  sourceLangRef.current = sourceLang
  useInformalRef.current = useInformal
  streamModeRef.current = streamMode

  const { isListening, interimTranscript, isSupported: micSupported, error: micError, startListening, stopListening } = useSpeechRecognition()
  const sourceSpeech = useSpeechSynthesis()
  const targetSpeech = useSpeechSynthesis()
  const targetSpeakRef = useRef(targetSpeech.speak)
  targetSpeakRef.current = targetSpeech.speak

  // Derived display values
  const sourceText = segments.map(s => s.sourceText).join(' ')
  const translatedText = segments.map(s => s.translatedText).join(' ')
  const isTranslating = segments.some(s => s.isTranslating)

  // Sync HD voice quality to both speech hooks
  useEffect(() => {
    const quality = hdVoice ? 'chirp3hd' as const : 'neural2' as const
    sourceSpeech.setVoiceQuality(quality)
    targetSpeech.setVoiceQuality(quality)
  }, [hdVoice, sourceSpeech.setVoiceQuality, targetSpeech.setVoiceQuality])

  // Show which TTS engine was last used
  const activeTtsEngine = sourceSpeech.ttsEngine || targetSpeech.ttsEngine

  // Handle initial text from quick phrases or history
  useEffect(() => {
    if (initialText) {
      const id = `seg_${Date.now()}`
      setSegments([{ id, sourceText: initialText, translatedText: '', isTranslating: false }])
      if (initialSourceLang) setSourceLang(initialSourceLang)
      if (initialTargetLang) setTargetLang(initialTargetLang)
      onInitialTextConsumed?.()
      // Trigger translation via debounce
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        doTranslateManual(initialText, id)
      }, 300)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText, initialSourceLang, initialTargetLang, onInitialTextConsumed])

  // --- Translation functions ---

  // Translate a single segment (for speech mode)
  const translateSegment = useCallback(async (segmentId: string, text: string) => {
    if (!text.trim()) return

    setSegments(prev => prev.map(s =>
      s.id === segmentId ? { ...s, isTranslating: true } : s
    ))
    setError(null)

    try {
      const result = await translateText(text, sourceLangRef.current, targetLangRef.current)
      let finalText = result.translatedText

      if (useInformalRef.current && supportsFormality(targetLangRef.current)) {
        finalText = convertToInformal(finalText, targetLangRef.current)
      }

      setSegments(prev => prev.map(s =>
        s.id === segmentId ? { ...s, translatedText: finalText, isTranslating: false } : s
      ))
      setMatchScore(result.match)
      setProvider(result.provider)

      // Auto-speak just this segment's translation
      if (autoSpeakRef.current && finalText) {
        const lang = getLanguageByCode(targetLangRef.current)
        targetSpeakRef.current(finalText, lang?.speechCode || targetLangRef.current)
      }
    } catch (err) {
      setSegments(prev => prev.map(s =>
        s.id === segmentId ? { ...s, isTranslating: false } : s
      ))
      setError(err instanceof Error ? err.message : 'Translation failed')
    }
  }, [])

  // Translate for manual typing (single-segment, with history entry)
  const doTranslateManual = useCallback(async (text: string, segId?: string) => {
    if (!text.trim()) {
      setSegments([])
      setError(null)
      setDetectedLang(null)
      return
    }

    const segmentId = segId || (segments.length === 1 ? segments[0].id : `seg_${Date.now()}`)
    if (!segId) {
      setSegments([{ id: segmentId, sourceText: text, translatedText: '', isTranslating: true }])
    } else {
      setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, isTranslating: true } : s))
    }
    setError(null)

    // Auto-detect source language if enabled
    let effectiveSourceLang = sourceLang
    if (autoDetect) {
      const detected = detectLanguage(text)
      if (detected && detected.confidence > 0.3) {
        effectiveSourceLang = detected.language
        setDetectedLang(detected.language)
      } else {
        setDetectedLang(null)
      }
    }

    try {
      const result = await translateText(text, effectiveSourceLang, targetLang)
      let finalText = result.translatedText

      if (useInformalRef.current && supportsFormality(targetLang)) {
        finalText = convertToInformal(finalText, targetLang)
      }

      setSegments(prev => prev.map(s =>
        s.id === segmentId ? { ...s, translatedText: finalText, isTranslating: false } : s
      ))
      setMatchScore(result.match)
      setProvider(result.provider)
      setFeedback(null)

      if (autoSpeakRef.current && finalText) {
        const lang = getLanguageByCode(targetLang)
        targetSpeakRef.current(finalText, lang?.speechCode || targetLang)
      }

      addEntry({
        sourceText: text,
        translatedText: finalText,
        sourceLang: effectiveSourceLang,
        targetLang,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      const errorMap: Record<string, string> = {
        OFFLINE_NO_MODEL: t('error.offlineNoModel'),
        ALL_PROVIDERS_FAILED: t('error.allProvidersFailed'),
      }
      setSegments(prev => prev.map(s =>
        s.id === segmentId ? { ...s, isTranslating: false } : s
      ))
      setError(errorMap[msg] || msg || t('error.unknown'))
    }
  }, [sourceLang, targetLang, autoDetect, addEntry, t])

  // Manual textarea editing: collapse to single segment, debounce translate
  const handleManualEdit = useCallback((newText: string) => {
    const id = segments.length === 1 ? segments[0].id : `seg_manual_${Date.now()}`
    setSegments([{ id, sourceText: newText, translatedText: segments.length === 1 ? segments[0].translatedText : '', isTranslating: false }])

    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!newText.trim()) {
      setSegments([])
      setError(null)
      return
    }
    debounceRef.current = setTimeout(() => {
      doTranslateManual(newText, id)
    }, 600)
  }, [segments, doTranslateManual])

  const swapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    const src = sourceText
    const tgt = translatedText
    if (src || tgt) {
      setSegments([{ id: `seg_swap_${Date.now()}`, sourceText: tgt, translatedText: src, isTranslating: false }])
    }
  }

  const [micWarning, setMicWarning] = useState<string | null>(null)

  // Refs for mic callbacks (to avoid stale closures)
  const onFinalResultRef = useRef<(text: string) => void>(() => {})
  const onInterimResultRef = useRef<(text: string) => void>(() => {})

  // Update callback refs based on streamMode
  useEffect(() => {
    onFinalResultRef.current = (text: string) => {
      if (streamModeRef.current === 'sentence') {
        // Sentence mode: each final result → new segment → translate immediately
        const id = `seg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
        setSegments(prev => [...prev, { id, sourceText: text, translatedText: '', isTranslating: false }])
        setInterimText('')
        translateSegment(id, text)
      } else {
        // Paragraph mode: accumulate into last segment, don't translate yet
        setSegments(prev => {
          if (prev.length === 0) {
            return [{ id: `seg_${Date.now()}`, sourceText: text, translatedText: '', isTranslating: false }]
          }
          const last = prev[prev.length - 1]
          // Only accumulate into the last segment if it hasn't been translated yet
          if (!last.translatedText && !last.isTranslating) {
            return [...prev.slice(0, -1), { ...last, sourceText: (last.sourceText + ' ' + text).trim() }]
          }
          // Otherwise start a new segment
          return [...prev, { id: `seg_${Date.now()}`, sourceText: text, translatedText: '', isTranslating: false }]
        })
        setInterimText('')
      }
    }

    onInterimResultRef.current = (text: string) => {
      setInterimText(text)
    }
  }, [translateSegment])

  const handleMicToggle = () => {
    if (!micSupported) {
      setMicWarning(t('translator.micUnavailable'))
      setTimeout(() => setMicWarning(null), 5000)
      return
    }
    setMicWarning(null)
    if (isListening) {
      stopListening()
    } else {
      const lang = getLanguageByCode(sourceLang)
      startListening(
        lang?.speechCode || sourceLang,
        (text) => onFinalResultRef.current(text),
        (text) => onInterimResultRef.current(text),
      )
    }
  }

  // Send button: force-finalize current audio + translate pending paragraph
  const handleSend = useCallback(() => {
    if (streamMode === 'paragraph') {
      // Find untranslated segments and translate them
      setSegments(prev => {
        const toTranslate = prev.filter(s => !s.translatedText && !s.isTranslating && s.sourceText.trim())
        for (const seg of toTranslate) {
          translateSegment(seg.id, seg.sourceText)
        }
        return prev
      })
    }

    // Force-finalize: stop triggers isFinal for pending audio, then restart
    stopListening()
    setTimeout(() => {
      const lang = getLanguageByCode(sourceLangRef.current)
      startListening(
        lang?.speechCode || sourceLangRef.current,
        (text) => onFinalResultRef.current(text),
        (text) => onInterimResultRef.current(text),
      )
    }, 250)
  }, [streamMode, stopListening, startListening, translateSegment])

  // History entry when recording stops
  useEffect(() => {
    if (!isListening && prevIsListeningRef.current && segments.length > 0) {
      const fullSource = segments.map(s => s.sourceText).join(' ').trim()
      const fullTarget = segments.map(s => s.translatedText).join(' ').trim()
      if (fullSource && fullTarget) {
        addEntry({
          sourceText: fullSource,
          translatedText: fullTarget,
          sourceLang,
          targetLang,
        })
      }
    }
    prevIsListeningRef.current = isListening
  }, [isListening, segments, sourceLang, targetLang, addEntry])

  const handleCopy = async () => {
    if (!translatedText) return
    await navigator.clipboard.writeText(translatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (!translatedText || !navigator.share) return
    try {
      await navigator.share({
        text: `${sourceText}\n\n→ ${translatedText}`,
      })
    } catch {
      // user cancelled share dialog
    }
  }

  const handleSpeakSource = () => {
    if (sourceSpeech.isSpeaking) {
      sourceSpeech.stop()
    } else {
      const lang = getLanguageByCode(sourceLang)
      sourceSpeech.speak(sourceText, lang?.speechCode || sourceLang)
    }
  }

  const handleSpeakTarget = () => {
    if (targetSpeech.isSpeaking) {
      targetSpeech.stop()
    } else {
      const lang = getLanguageByCode(targetLang)
      targetSpeech.speak(translatedText, lang?.speechCode || targetLang)
    }
  }

  const toggleAutoSpeak = () => {
    setAutoSpeak(prev => {
      const next = !prev
      localStorage.setItem('translator-auto-speak', String(next))
      return next
    })
  }

  const toggleHdVoice = () => {
    setHdVoice(prev => {
      const next = !prev
      localStorage.setItem('translator-hd-voice', String(next))
      return next
    })
  }

  const toggleStreamMode = () => {
    setStreamMode(prev => {
      const next = prev === 'sentence' ? 'paragraph' : 'sentence'
      localStorage.setItem('translator-stream-mode', next)
      return next
    })
  }

  const toggleFormality = () => {
    setUseInformal(prev => {
      const next = !prev
      localStorage.setItem('translator-informal', String(next))
      // Re-translate with new formality if we have text
      if (translatedText) {
        if (next && supportsFormality(targetLang)) {
          setSegments(prev => prev.map(s => ({
            ...s,
            translatedText: s.translatedText ? convertToInformal(s.translatedText, targetLang) : '',
          })))
        } else {
          // Re-trigger translation for all segments
          segments.forEach(s => {
            if (s.sourceText.trim()) translateSegment(s.id, s.sourceText)
          })
        }
      }
      return next
    })
  }

  const clearAll = () => {
    setSegments([])
    setInterimText('')
    setError(null)
  }

  // Keyboard shortcuts: Ctrl+Enter → translate now, Escape → clear
  useKeyboardShortcuts({
    'ctrl+enter': () => { if (sourceText.trim()) doTranslateManual(sourceText) },
    'escape': clearAll,
    'ctrl+shift+s': swapLanguages,
  })

  const sourceLangData = getLanguageByCode(sourceLang)
  const targetLangData = getLanguageByCode(targetLang)
  const showFormalityToggle = supportsFormality(targetLang) || supportsFormality(sourceLang)
  const formalityActive = supportsFormality(targetLang) // conversion only works on target

  return (
    <div className="space-y-4">
      {/* Language Selection Bar */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex items-end gap-1.5">
          <LanguageSelector value={sourceLang} onChange={(v) => { setSourceLang(v); setAutoDetect(false); setDetectedLang(null) }} label={t('translator.from')} />
          <Button
            variant={autoDetect ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setAutoDetect(!autoDetect); if (autoDetect) setDetectedLang(null) }}
            className="mb-0.5 shrink-0 text-xs"
            aria-pressed={autoDetect}
            aria-label={t('translator.autoDetect')}
          >
            {t('translator.auto')}
          </Button>
          {autoDetect && detectedLang && (
            <span className="mb-1 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-medium">
              {getLanguageByCode(detectedLang)?.flag} {getLanguageByCode(detectedLang)?.name || detectedLang}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={swapLanguages}
          className="mb-0.5 shrink-0"
          aria-label={t('translator.swap')}
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <LanguageSelector value={targetLang} onChange={setTargetLang} label={t('translator.to')} />
        <Button
          variant={autoSpeak ? 'default' : 'outline'}
          size="sm"
          onClick={toggleAutoSpeak}
          className="mb-0.5 shrink-0 gap-1.5"
          aria-pressed={autoSpeak}
          aria-label={autoSpeak ? t('translator.autoSpeakOn') : t('translator.autoSpeakOff')}
        >
          {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className="text-xs">{t('translator.auto')}</span>
        </Button>
        <Button
          variant={hdVoice ? 'default' : 'outline'}
          size="sm"
          onClick={toggleHdVoice}
          className="mb-0.5 shrink-0 gap-1.5"
          aria-pressed={hdVoice}
          aria-label={hdVoice ? t('translator.hdVoiceOn') : t('translator.sdVoice')}
        >
          <span className="text-xs">{hdVoice ? 'HD' : 'SD'}</span>
        </Button>
        {/* Stream mode toggle */}
        <Button
          variant={streamMode === 'sentence' ? 'default' : 'outline'}
          size="sm"
          onClick={toggleStreamMode}
          className="mb-0.5 shrink-0 gap-1.5"
          aria-pressed={streamMode === 'sentence'}
          aria-label={streamMode === 'sentence' ? t('translator.sentenceMode') : t('translator.paragraphMode')}
        >
          {streamMode === 'sentence' ? <Zap className="h-3.5 w-3.5" /> : <AlignLeft className="h-3.5 w-3.5" />}
          <span className="text-xs">{streamMode === 'sentence' ? t('translator.sentence') : t('translator.paragraph')}</span>
        </Button>
        {/* Sie/Du Toggle - shows when source or target supports formality */}
        {showFormalityToggle && (
          <Button
            variant={useInformal ? 'default' : 'outline'}
            size="sm"
            onClick={toggleFormality}
            className={`mb-0.5 shrink-0 gap-1.5 ${!formalityActive ? 'opacity-50' : ''}`}
            aria-pressed={useInformal}
            aria-label={!formalityActive
              ? t('translator.formalityHint')
              : useInformal ? t('translator.informal') : t('translator.formal')}
          >
            {useInformal ? <User className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
            <span className="text-xs">{useInformal ? t('translator.informal') : t('translator.formal')}</span>
          </Button>
        )}
      </div>

      {/* Translation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source */}
        <Card className="relative">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {autoDetect && detectedLang
                  ? <>{getLanguageByCode(detectedLang)?.flag} {getLanguageByCode(detectedLang)?.name} <span className="text-[10px] opacity-60">(auto)</span></>
                  : <>{sourceLangData?.flag} {sourceLangData?.name}</>
                }
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMicToggle}
                  className={isListening ? 'text-destructive pulse-mic' : !micSupported ? 'opacity-50' : ''}
                  aria-pressed={isListening}
                  aria-label={!micSupported ? t('translator.micNotAvailable') : isListening ? t('translator.stopRecording') : t('translator.speechInput')}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                {/* Send button: visible during recording */}
                {isListening && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSend}
                    className="text-primary"
                    aria-label={t('translator.send')}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
                {sourceSpeech.isSupported && sourceText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSpeakSource}
                    aria-label={sourceSpeech.isSpeaking ? t('translator.stop') : t('translator.speak')}
                  >
                    {sourceSpeech.isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                )}
                {activeTtsEngine && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${activeTtsEngine === 'cloud' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {activeTtsEngine === 'cloud' ? '\u2601 Cloud' : '\uD83D\uDDA5 Browser'}
                  </span>
                )}
                {sourceText && (
                  <Button variant="ghost" size="icon" onClick={clearAll} aria-label={t('translator.delete')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <textarea
              value={sourceText}
              onChange={e => handleManualEdit(e.target.value)}
              placeholder={t('translator.placeholder')}
              className="w-full min-h-[200px] bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/60 text-base leading-relaxed"
              dir={isRTL(sourceLang) ? 'rtl' : 'ltr'}
              aria-label={t('translator.placeholder')}

              readOnly={isListening}
            />
            {/* Interim text display during recording */}
            {isListening && interimText && (
              <p className="text-sm text-muted-foreground/60 italic px-1 -mt-2 mb-2">{interimText}...</p>
            )}
            <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {(sourceText.length + (interimText ? interimText.length + 1 : 0))} {t('translator.chars')}
                {sourceText.length === 0 && !interimText && (
                  <span className="hidden sm:inline ml-2 opacity-50">{t('translator.shortcutHint')}</span>
                )}
              </span>
              <span aria-live="assertive">
                {isListening && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" aria-hidden="true" />
                    {t('translator.recording')}
                    {streamMode === 'paragraph' && <span className="text-muted-foreground ml-1">({t('translator.paragraph')})</span>}
                  </span>
                )}
              </span>
              {(micError || micWarning) && (
                <span className="text-xs text-destructive" role="alert">{micError || micWarning}</span>
              )}
            </div>
          </div>
        </Card>

        {/* Target */}
        <Card className="relative">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                {targetLangData?.flag} {targetLangData?.name}
              </span>
              <div className="flex items-center gap-1">
                {targetSpeech.isSupported && translatedText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSpeakTarget}
                    aria-label={targetSpeech.isSpeaking ? t('translator.stop') : t('translator.speak')}
                  >
                    {targetSpeech.isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                )}
                {translatedText && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    aria-label={t('translator.copy')}
                  >
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
                {translatedText && typeof navigator.share === 'function' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    aria-label={t('translator.share')}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div
              className="w-full min-h-[200px] text-base leading-relaxed"
              dir={isRTL(targetLang) ? 'rtl' : 'ltr'}
              aria-live="polite"
              aria-label={t('translator.result')}
            >
              {segments.length === 0 && !isTranslating ? (
                <p className="text-muted-foreground/60">{t('translator.result')}</p>
              ) : error && !translatedText ? (
                <div className="text-destructive text-sm" role="alert">{error}</div>
              ) : (
                <p className="text-foreground">
                  {segments.map((seg, i) => (
                    <span key={seg.id}>
                      {seg.isTranslating ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin inline" />
                        </span>
                      ) : (
                        seg.translatedText
                      )}
                      {i < segments.length - 1 && seg.translatedText ? ' ' : ''}
                    </span>
                  ))}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
              <span className="text-xs text-muted-foreground">
                {translatedText.length} {t('translator.chars')}
              </span>
              <div className="flex items-center gap-2">
                {translatedText && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                      className={`p-1 rounded transition-colors ${feedback === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
                      aria-label={t('translator.goodTranslation')}
                      aria-pressed={feedback === 'up'}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                      className={`p-1 rounded transition-colors ${feedback === 'down' ? 'text-destructive' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
                      aria-label={t('translator.badTranslation')}
                      aria-pressed={feedback === 'down'}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {provider && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    provider === 'google' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    provider === 'offline' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' :
                    provider === 'cache' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {provider === 'google' ? 'Google' :
                     provider === 'offline' ? 'Offline' :
                     provider === 'cache' ? 'Cache' :
                     provider === 'libre' ? 'LibreTranslate' : 'MyMemory'}
                  </span>
                )}
                {matchScore !== null && matchScore > 0 && translatedText && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    matchScore >= 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    matchScore >= 0.5 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {Math.round(matchScore * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
