/**
 * MedicalPatientJoinPage — Angehörigen-/Mithör-App
 *
 * KONZEPT (nach Revision):
 * Diese App ist für Angehörige oder zusätzliche Mithörer auf ihrem eigenen Smartphone.
 * Sie scannen den QR-Code vom Klinik-Tablet und hören die Übersetzung auf ihrem Gerät.
 * NICHT für den Patienten selbst — der nutzt das Klinik-Tablet direkt.
 *
 * Use Cases:
 * - Ehepartner/Kind im Wartezimmer hört das Gespräch mit
 * - Zweite Pflegekraft hört die Übersetzung auf eigenem Gerät
 * - Patient mit Hörgerät kann Übersetzung lauter stellen
 * - Mehrere Familienmitglieder hören gleichzeitig in verschiedenen Sprachen
 *
 * Features:
 * - Sprache wählen (eigene Sprache, unabhängig vom Hauptgerät)
 * - Live-Übersetzung empfangen (wenn Session aktiv)
 * - Lautstärke-Kontrolle
 * - Eigene Spracheingabe (optional, für Rückfragen)
 * - BITV 2.0 Barrierefreiheit
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Heart, Volume2, VolumeX, Mic, MicOff, ChevronDown,
  ZoomIn, ZoomOut, Contrast, Wifi, WifiOff, QrCode,
  Headphones, MessageSquare, AlertCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { translateText } from '@/lib/translate'
import { speakText } from '@/lib/tts'

const LANGUAGES = [
  { code: 'ar', label: 'العربية',    flag: '🇸🇦', rtl: true,  name: 'Arabisch' },
  { code: 'tr', label: 'Türkçe',     flag: '🇹🇷', rtl: false, name: 'Türkisch' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦', rtl: false, name: 'Ukrainisch' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺', rtl: false, name: 'Russisch' },
  { code: 'fa', label: 'فارسی',      flag: '🇮🇷', rtl: true,  name: 'Persisch' },
  { code: 'ro', label: 'Română',     flag: '🇷🇴', rtl: false, name: 'Rumänisch' },
  { code: 'pl', label: 'Polski',     flag: '🇵🇱', rtl: false, name: 'Polnisch' },
  { code: 'so', label: 'Soomaali',   flag: '🇸🇴', rtl: false, name: 'Somali' },
  { code: 'ps', label: 'پښتو',       flag: '🇦🇫', rtl: true,  name: 'Pashto' },
  { code: 'ur', label: 'اردو',       flag: '🇵🇰', rtl: true,  name: 'Urdu' },
  { code: 'ti', label: 'ትግርኛ',       flag: '🇪🇷', rtl: false, name: 'Tigrinya' },
  { code: 'am', label: 'አማርኛ',       flag: '🇪🇹', rtl: false, name: 'Amharisch' },
  { code: 'zh', label: '中文',        flag: '🇨🇳', rtl: false, name: 'Chinesisch' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', rtl: false, name: 'Vietnamesisch' },
  { code: 'hi', label: 'हिन्दी',      flag: '🇮🇳', rtl: false, name: 'Hindi' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷', rtl: false, name: 'Französisch' },
  { code: 'en', label: 'English',    flag: '🇬🇧', rtl: false, name: 'Englisch' },
  { code: 'es', label: 'Español',    flag: '🇪🇸', rtl: false, name: 'Spanisch' },
]

// Begrüßungstext in verschiedenen Sprachen
const WELCOME: Record<string, string> = {
  ar: 'مرحباً بك. ستسمع ترجمة المحادثة هنا.',
  tr: 'Hoş geldiniz. Konuşmanın çevirisini burada duyacaksınız.',
  uk: 'Ласкаво просимо. Ви почуєте переклад розмови тут.',
  ru: 'Добро пожаловать. Вы услышите перевод разговора здесь.',
  fa: 'خوش آمدید. ترجمه مکالمه را اینجا خواهید شنید.',
  en: 'Welcome. You will hear the translation of the conversation here.',
  fr: 'Bienvenue. Vous entendrez la traduction de la conversation ici.',
  es: 'Bienvenido. Escuchará la traducción de la conversación aquí.',
  pl: 'Witamy. Tutaj usłyszysz tłumaczenie rozmowy.',
  ro: 'Bun venit. Veți auzi traducerea conversației aici.',
}

type RecordingState = 'idle' | 'recording' | 'translating' | 'speaking'

export default function MedicalPatientJoinPage() {
  const browserLang = navigator.language.split('-')[0]
  const defaultLang = LANGUAGES.find(l => l.code === browserLang) || LANGUAGES[0]

  const [selectedLang, setSelectedLang] = useState(defaultLang)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large') // Default groß
  const [highContrast, setHighContrast] = useState(false)
  const [muted, setMuted] = useState(false)
  const [recordState, setRecordState] = useState<RecordingState>('idle')
  const [spokenText, setSpokenText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [messages, setMessages] = useState<Array<{id: string; text: string; translated: string; time: string}>>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const rtl = selectedLang.rtl

  const fontSizeClass = {
    normal: 'text-base',
    large: 'text-xl',
    xlarge: 'text-2xl',
  }[fontSize]

  const handleSpeak = useCallback(async () => {
    if (recordState !== 'idle') return
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Spracherkennung nicht verfügbar. Bitte Chrome oder Edge verwenden.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = selectedLang.code
    recognition.continuous = false
    recognition.interimResults = false

    setRecordState('recording')

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      setSpokenText(text)
      setRecordState('translating')

      try {
        const translated = await translateText(text, selectedLang.code, 'de')
        setTranslatedText(translated)

        const now = new Date()
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        setMessages(prev => [...prev.slice(-19), { id: Date.now().toString(), text, translated, time }])

        setRecordState('speaking')
        if (!muted) {
          await speakText(translated, 'de') // Arzt hört Deutsch
        }
        setRecordState('idle')
      } catch {
        setRecordState('idle')
      }
    }

    recognition.onerror = () => setRecordState('idle')
    recognition.onend = () => { if (recordState === 'recording') setRecordState('idle') }
    recognition.start()
    recognitionRef.current = recognition
  }, [selectedLang, muted, recordState])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    setRecordState('idle')
  }, [])

  const welcomeText = WELCOME[selectedLang.code] || WELCOME['en']

  return (
    <div
      className={cn(
        "min-h-[100dvh] flex flex-col",
        highContrast ? "bg-black text-white" : "bg-slate-50",
        fontSizeClass
      )}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {/* ── Header ── */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b shadow-sm shrink-0",
        highContrast ? "bg-black border-white" : "bg-white"
      )}>
        <div className="flex items-center gap-2">
          <Headphones className={cn("h-5 w-5", highContrast ? "text-yellow-400" : "text-blue-600")} />
          <span className={cn("font-bold text-sm", highContrast ? "text-white" : "text-gray-800")}>
            Medical Translator
          </span>
          <Badge variant="outline" className={cn("text-xs h-5", isOnline ? "border-green-500 text-green-700" : "border-orange-500 text-orange-700")}>
            {isOnline ? <><Wifi className="h-3 w-3 mr-1" />Online</> : <><WifiOff className="h-3 w-3 mr-1" />Offline</>}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Stummschalten */}
          <button
            onClick={() => setMuted(m => !m)}
            className={cn("p-2 rounded-xl transition-colors", highContrast ? "text-white border border-white" : muted ? "bg-red-100 text-red-600" : "text-gray-500 hover:bg-gray-100")}
            aria-label={muted ? "Ton einschalten" : "Ton ausschalten"}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          {/* Schriftgröße */}
          <button
            onClick={() => setFontSize(s => s === 'normal' ? 'large' : s === 'large' ? 'xlarge' : 'normal')}
            className={cn("p-2 rounded-xl", highContrast ? "text-white border border-white" : "text-gray-500 hover:bg-gray-100")}
            aria-label="Schriftgröße"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          {/* Kontrast */}
          <button
            onClick={() => setHighContrast(h => !h)}
            className={cn("p-2 rounded-xl", highContrast ? "text-yellow-400 border border-yellow-400" : "text-gray-500 hover:bg-gray-100")}
            aria-label="Hoher Kontrast"
          >
            <Contrast className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Sprach-Auswahl ── */}
      <div className={cn("border-b shrink-0", highContrast ? "bg-black border-white" : "bg-white")}>
        <button
          onClick={() => setShowLangPicker(p => !p)}
          className={cn(
            "w-full flex items-center justify-between px-5 py-4",
            highContrast ? "text-white" : "text-gray-800"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedLang.flag}</span>
            <div className={rtl ? "text-right" : "text-left"}>
              <div className="font-bold">{selectedLang.name}</div>
              <div className={cn("text-sm", highContrast ? "text-gray-300" : "text-gray-500")}>{selectedLang.label}</div>
            </div>
          </div>
          <ChevronDown className={cn("h-5 w-5 transition-transform", showLangPicker && "rotate-180", highContrast ? "text-white" : "text-gray-400")} />
        </button>

        {showLangPicker && (
          <div className={cn("border-t grid grid-cols-2 gap-2 p-3 max-h-64 overflow-y-auto", highContrast ? "border-white bg-black" : "border-gray-100 bg-white")}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setSelectedLang(lang); setShowLangPicker(false) }}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all active:scale-95",
                  selectedLang.code === lang.code
                    ? highContrast ? "bg-yellow-400 text-black font-bold" : "bg-blue-600 text-white font-semibold"
                    : highContrast ? "text-white hover:bg-gray-800 border border-gray-700" : "hover:bg-gray-50 border border-gray-200"
                )}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <div className="font-medium text-sm">{lang.name}</div>
                  <div className={cn("text-xs", selectedLang.code === lang.code ? "opacity-70" : highContrast ? "text-gray-400" : "text-gray-500")}>{lang.label}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Hauptinhalt ── */}
      <div className="flex-1 flex flex-col px-5 py-5 gap-5 overflow-y-auto">

        {/* Willkommenstext */}
        <div className={cn(
          "rounded-2xl p-5 border",
          highContrast ? "bg-gray-900 border-white" : "bg-blue-50 border-blue-200"
        )}>
          <div className="flex items-start gap-3">
            <Heart className={cn("h-5 w-5 mt-0.5 shrink-0", highContrast ? "text-yellow-400" : "text-blue-600")} />
            <p className={cn("leading-relaxed", highContrast ? "text-white" : "text-blue-900", rtl && "text-right")}>
              {welcomeText}
            </p>
          </div>
        </div>

        {/* Aktuelle Übersetzung */}
        {(spokenText || translatedText) && (
          <div className={cn(
            "rounded-2xl p-5 border-2",
            highContrast ? "bg-gray-900 border-yellow-400" : "bg-white border-blue-300 shadow-md"
          )}>
            {spokenText && (
              <p className={cn("text-sm mb-2", highContrast ? "text-gray-400" : "text-gray-500", rtl && "text-right")}>
                {spokenText}
              </p>
            )}
            {translatedText && (
              <p className={cn("font-semibold leading-relaxed", highContrast ? "text-white" : "text-gray-900")}>
                {translatedText}
              </p>
            )}
          </div>
        )}

        {/* Nachrichtenverlauf */}
        {messages.length > 0 && (
          <div className="space-y-2">
            <p className={cn("text-xs font-medium uppercase tracking-wide", highContrast ? "text-gray-400" : "text-gray-500")}>
              Verlauf
            </p>
            {[...messages].reverse().map(msg => (
              <div
                key={msg.id}
                className={cn(
                  "rounded-xl p-3 border",
                  highContrast ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-xs", highContrast ? "text-gray-400" : "text-gray-400")}>{msg.time}</span>
                </div>
                <p className={cn("text-xs mb-1", highContrast ? "text-gray-400" : "text-gray-500", rtl && "text-right")}>{msg.text}</p>
                <p className={cn("font-medium text-sm", highContrast ? "text-white" : "text-gray-800", rtl && "text-right")}>{msg.translated}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Sprechen-Button (für Rückfragen) ── */}
      <div className={cn("px-5 pb-5 pt-3 border-t shrink-0", highContrast ? "bg-black border-white" : "bg-white border-gray-200")}>
        <p className={cn("text-xs text-center mb-3", highContrast ? "text-gray-400" : "text-gray-500")}>
          {selectedLang.code === 'ar' ? 'هل تريد قول شيء للطبيب؟' :
           selectedLang.code === 'tr' ? 'Doktora bir şey söylemek ister misiniz?' :
           selectedLang.code === 'uk' ? 'Хочете щось сказати лікарю?' :
           selectedLang.code === 'ru' ? 'Хотите что-то сказать врачу?' :
           'Möchten Sie dem Arzt etwas sagen?'}
        </p>
        <button
          onPointerDown={recordState === 'idle' ? handleSpeak : stopRecording}
          className={cn(
            "w-full rounded-2xl py-5 font-bold text-white text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg",
            recordState === 'recording'
              ? "bg-red-600 animate-pulse"
              : recordState !== 'idle'
                ? "bg-gray-400 cursor-wait"
                : highContrast
                  ? "bg-yellow-400 text-black"
                  : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {recordState === 'recording' ? (
            <><span className="text-2xl animate-bounce">🎙️</span>
              {selectedLang.code === 'ar' ? 'جارٍ التسجيل...' :
               selectedLang.code === 'tr' ? 'Kayıt ediyor...' :
               'Aufnahme...'}</>
          ) : recordState === 'translating' ? (
            <><span className="text-2xl">⏳</span> Übersetze...</>
          ) : recordState === 'speaking' ? (
            <><Volume2 className="h-6 w-6 animate-pulse" /> Sprachausgabe...</>
          ) : (
            <><Mic className="h-6 w-6" />
              {selectedLang.code === 'ar' ? 'تحدث إلى الطبيب' :
               selectedLang.code === 'tr' ? 'Doktora konuş' :
               selectedLang.code === 'uk' ? 'Говоріть до лікаря' :
               selectedLang.code === 'ru' ? 'Говорите врачу' :
               'Zum Arzt sprechen'}</>
          )}
        </button>
      </div>
    </div>
  )
}
