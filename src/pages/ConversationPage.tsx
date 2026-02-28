import { useState, useCallback, useRef, useEffect } from 'react'
import { Mic, MicOff, ArrowUpDown, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LanguageSelector from '@/components/translator/LanguageSelector'
import { translateText } from '@/lib/translate'
import { getLanguageByCode, isRTL } from '@/lib/languages'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useI18n } from '@/context/I18nContext'

const shortTimeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })

interface Message {
  id: string
  speaker: 'top' | 'bottom'
  original: string
  translated: string
  timestamp: number
}

export default function ConversationPage() {
  const { t } = useI18n()
  const [topLang, setTopLang] = useState('en')
  const [bottomLang, setBottomLang] = useState('de')
  const [activeSide, setActiveSide] = useState<'top' | 'bottom' | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const topRecognition = useSpeechRecognition()
  const bottomRecognition = useSpeechRecognition()
  const tts = useSpeechSynthesis()

  const isTranslatingRef = useRef(false)
  const autoSpeakRef = useRef(autoSpeak)
  autoSpeakRef.current = autoSpeak
  const ttsRef = useRef(tts.speak)
  ttsRef.current = tts.speak

  const handleResult = useCallback(async (text: string, side: 'top' | 'bottom') => {
    if (isTranslatingRef.current || !text.trim()) return
    isTranslatingRef.current = true
    setIsTranslating(true)
    setCurrentTranscript('')

    const srcLang = side === 'top' ? topLang : bottomLang
    const tgtLang = side === 'top' ? bottomLang : topLang

    setError(null)
    try {
      const result = await translateText(text, srcLang, tgtLang)
      const msg: Message = {
        id: `msg_${Date.now()}`,
        speaker: side,
        original: text,
        translated: result.translatedText,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, msg])

      if (autoSpeakRef.current && result.translatedText) {
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
  }, [topLang, bottomLang])

  const startTop = useCallback(() => {
    setActiveSide('top')
    setCurrentTranscript('')
    const lang = getLanguageByCode(topLang)
    topRecognition.startListening(lang?.speechCode || topLang, (text) => {
      setCurrentTranscript(text)
      handleResult(text, 'top')
    })
  }, [topLang, topRecognition, handleResult])

  const startBottom = useCallback(() => {
    setActiveSide('bottom')
    setCurrentTranscript('')
    const lang = getLanguageByCode(bottomLang)
    bottomRecognition.startListening(lang?.speechCode || bottomLang, (text) => {
      setCurrentTranscript(text)
      handleResult(text, 'bottom')
    })
  }, [bottomLang, bottomRecognition, handleResult])

  const stopAll = useCallback(() => {
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

  const topLangData = getLanguageByCode(topLang)
  const bottomLangData = getLanguageByCode(bottomLang)

  // Auto-scroll conversation to bottom
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div className="container py-4 space-y-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
          <span className="gradient-text-translator">{t('conversation.title')}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('conversation.subtitle')}
        </p>
      </div>

      {/* Language bar */}
      <div className="flex items-end justify-center gap-3">
        <LanguageSelector value={topLang} onChange={setTopLang} label={t('conversation.person1')} />
        <Button variant="outline" size="icon" onClick={swapLanguages} className="mb-0.5 shrink-0" aria-label={t('translator.swap')}>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        <LanguageSelector value={bottomLang} onChange={setBottomLang} label={t('conversation.person2')} />
        <Button
          variant={autoSpeak ? 'default' : 'outline'}
          size="sm"
          onClick={() => setAutoSpeak(!autoSpeak)}
          className="mb-0.5 shrink-0 gap-1.5"
          aria-pressed={autoSpeak}
          aria-label={autoSpeak ? t('translator.autoSpeakOn') : t('translator.autoSpeakOff')}
        >
          {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className="text-xs">{t('translator.auto')}</span>
        </Button>
      </div>

      {/* Conversation area — split screen */}
      <div className="grid grid-rows-[1fr_auto_1fr] gap-2 min-h-[60vh]">
        {/* Top person (rotated 180° for face-to-face) */}
        <div
          className={`relative rounded-xl border-2 p-4 flex flex-col transition-colors ${
            activeSide === 'top'
              ? 'border-primary bg-primary/5'
              : 'border-border'
          }`}
          style={{ transform: 'rotate(180deg)' }}
        >
          {/* Mic button (at visual top for rotated user) */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {topLangData?.flag} {topLangData?.name}
            </span>
            <Button
              size="sm"
              variant={activeSide === 'top' ? 'destructive' : 'default'}
              onClick={activeSide === 'top' ? stopAll : startTop}
              disabled={activeSide === 'bottom' || isTranslating}
              className="gap-1.5 rounded-full"
            >
              {activeSide === 'top' ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
              {activeSide === 'top' ? t('conversation.stop') : t('conversation.speak')}
            </Button>
          </div>

          {/* Chronological messages for top person's view */}
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
                    isOwnMessage
                      ? 'bg-primary/10 ml-6'
                      : 'bg-muted/60 mr-6 border-l-2 border-primary/30'
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
          className={`relative rounded-xl border-2 p-4 flex flex-col transition-colors ${
            activeSide === 'bottom'
              ? 'border-primary bg-primary/5'
              : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {bottomLangData?.flag} {bottomLangData?.name}
            </span>
            <Button
              size="sm"
              variant={activeSide === 'bottom' ? 'destructive' : 'default'}
              onClick={activeSide === 'bottom' ? stopAll : startBottom}
              disabled={activeSide === 'top' || isTranslating}
              className="gap-1.5 rounded-full"
            >
              {activeSide === 'bottom' ? <MicOff className="h-4 w-4" aria-hidden="true" /> : <Mic className="h-4 w-4" aria-hidden="true" />}
              {activeSide === 'bottom' ? t('conversation.stop') : t('conversation.speak')}
            </Button>
          </div>

          {/* Chronological messages for bottom person's view */}
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
                    isOwnMessage
                      ? 'bg-primary/10 ml-6'
                      : 'bg-muted/60 mr-6 border-l-2 border-primary/30'
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
    </div>
  )
}
