import { useState, useCallback, useRef } from 'react'
import { Mic, MicOff, ArrowUpDown, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LanguageSelector from '@/components/translator/LanguageSelector'
import { translateText } from '@/lib/translate'
import { getLanguageByCode, isRTL } from '@/lib/languages'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useI18n } from '@/context/I18nContext'

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
      console.error('[Conversation] Translation failed:', err)
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

  return (
    <div className="container py-4 space-y-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
          <span className="gradient-text-translator">Konversation</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Face-to-Face Übersetzung für zwei Personen
        </p>
      </div>

      {/* Language bar */}
      <div className="flex items-end justify-center gap-3">
        <LanguageSelector value={topLang} onChange={setTopLang} label="Person 1" />
        <Button variant="outline" size="icon" onClick={swapLanguages} className="mb-0.5 shrink-0">
          <ArrowUpDown className="h-4 w-4" />
        </Button>
        <LanguageSelector value={bottomLang} onChange={setBottomLang} label="Person 2" />
        <Button
          variant={autoSpeak ? 'default' : 'outline'}
          size="sm"
          onClick={() => setAutoSpeak(!autoSpeak)}
          className="mb-0.5 shrink-0 gap-1.5"
        >
          {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className="text-xs">{t('translator.auto')}</span>
        </Button>
      </div>

      {/* Conversation area — split screen */}
      <div className="grid grid-rows-2 gap-3 min-h-[60vh]">
        {/* Top person (rotated 180° for face-to-face) */}
        <div
          className={`relative rounded-xl border-2 p-4 flex flex-col transition-colors ${
            activeSide === 'top'
              ? 'border-primary bg-primary/5'
              : 'border-border'
          }`}
          style={{ transform: 'rotate(180deg)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {topLangData?.flag} {topLangData?.name}
            </span>
          </div>

          {/* Messages for this side */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-3">
            {messages.filter(m => m.speaker === 'top').slice(-3).map(msg => (
              <div key={msg.id} className="space-y-0.5">
                <p className="text-xs text-muted-foreground" dir={isRTL(topLang) ? 'rtl' : 'ltr'}>{msg.original}</p>
                <p className="text-base font-medium" dir={isRTL(bottomLang) ? 'rtl' : 'ltr'}>{msg.translated}</p>
              </div>
            ))}
            {/* Messages from bottom person (show translation for top) */}
            {messages.filter(m => m.speaker === 'bottom').slice(-3).map(msg => (
              <div key={msg.id} className="space-y-0.5 pl-4 border-l-2 border-muted">
                <p className="text-base font-medium" dir={isRTL(topLang) ? 'rtl' : 'ltr'}>{msg.translated}</p>
                <p className="text-xs text-muted-foreground" dir={isRTL(bottomLang) ? 'rtl' : 'ltr'}>{msg.original}</p>
              </div>
            ))}
            {activeSide === 'top' && currentTranscript && (
              <p className="text-sm italic text-muted-foreground/60">{currentTranscript}...</p>
            )}
          </div>

          {/* Mic button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              variant={activeSide === 'top' ? 'destructive' : 'default'}
              onClick={activeSide === 'top' ? stopAll : startTop}
              disabled={activeSide === 'bottom' || isTranslating}
              className="gap-2 rounded-full px-8"
            >
              {activeSide === 'top' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {activeSide === 'top' ? 'Stop' : 'Sprechen'}
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative -my-1.5 flex items-center justify-center z-10">
          <div className="absolute inset-x-0 border-t border-dashed border-border" />
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="relative bg-background px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Neu starten
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
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {bottomLangData?.flag} {bottomLangData?.name}
            </span>
          </div>

          {/* Messages for this side */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-3">
            {/* Messages from top person (show translation for bottom) */}
            {messages.filter(m => m.speaker === 'top').slice(-3).map(msg => (
              <div key={msg.id} className="space-y-0.5 pl-4 border-l-2 border-muted">
                <p className="text-base font-medium" dir={isRTL(bottomLang) ? 'rtl' : 'ltr'}>{msg.translated}</p>
                <p className="text-xs text-muted-foreground" dir={isRTL(topLang) ? 'rtl' : 'ltr'}>{msg.original}</p>
              </div>
            ))}
            {messages.filter(m => m.speaker === 'bottom').slice(-3).map(msg => (
              <div key={msg.id} className="space-y-0.5">
                <p className="text-xs text-muted-foreground" dir={isRTL(bottomLang) ? 'rtl' : 'ltr'}>{msg.original}</p>
                <p className="text-base font-medium" dir={isRTL(topLang) ? 'rtl' : 'ltr'}>{msg.translated}</p>
              </div>
            ))}
            {activeSide === 'bottom' && currentTranscript && (
              <p className="text-sm italic text-muted-foreground/60">{currentTranscript}...</p>
            )}
          </div>

          {/* Mic button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              variant={activeSide === 'bottom' ? 'destructive' : 'default'}
              onClick={activeSide === 'bottom' ? stopAll : startBottom}
              disabled={activeSide === 'top' || isTranslating}
              className="gap-2 rounded-full px-8"
            >
              {activeSide === 'bottom' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              {activeSide === 'bottom' ? 'Stop' : 'Sprechen'}
            </Button>
          </div>
        </div>
      </div>

      {isTranslating && (
        <p className="text-center text-sm text-muted-foreground animate-pulse">
          Wird übersetzt...
        </p>
      )}
    </div>
  )
}
