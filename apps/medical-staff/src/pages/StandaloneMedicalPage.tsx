/**
 * StandaloneMedicalPage — Bidirektionaler Offline-Modus für das Klinik-Tablet
 *
 * Design-Philosophie: Medizinisch-professionell, hoher Kontrast, große Touch-Targets.
 * Primär: Arzt/Pflegekraft ↔ Patient auf EINEM Gerät, kein Internet nötig.
 * Sekundär: QR-Code für Patienten-Smartphone als optionales Feature.
 *
 * Farben: Rot (#DC2626) für Arzt-Seite, Blau (#2563EB) für Patienten-Seite.
 * Schrift: System-UI, groß (min 18px), BITV 2.0 konform.
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic, MicOff, Volume2, VolumeX, Languages, ChevronDown,
  AlertTriangle, Stethoscope, Pill, Heart, ArrowLeft,
  Wifi, WifiOff, Zap, ZapOff, QrCode, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { translateText } from '@/lib/translate'
import { speakText } from '@/lib/tts'
import { createWebSpeechEngine } from '@/lib/stt'

// ── Medical languages (most common in DACH hospitals) ──────────────────────
const MEDICAL_LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', rtl: false },
  { code: 'uk', label: 'Українська', flag: '🇺🇦', rtl: false },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'ro', label: 'Română', flag: '🇷🇴', rtl: false },
  { code: 'pl', label: 'Polski', flag: '🇵🇱', rtl: false },
  { code: 'sr', label: 'Српски', flag: '🇷🇸', rtl: false },
  { code: 'bs', label: 'Bosanski', flag: '🇧🇦', rtl: false },
  { code: 'hr', label: 'Hrvatski', flag: '🇭🇷', rtl: false },
  { code: 'sq', label: 'Shqip', flag: '🇦🇱', rtl: false },
  { code: 'so', label: 'Soomaali', flag: '🇸🇴', rtl: false },
  { code: 'ti', label: 'ትግርኛ', flag: '🇪🇷', rtl: false },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹', rtl: false },
  { code: 'fr', label: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
  { code: 'zh', label: '中文', flag: '🇨🇳', rtl: false },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', rtl: false },
  { code: 'ur', label: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'ps', label: 'پښتو', flag: '🇦🇫', rtl: true },
  { code: 'ku', label: 'Kurdî', flag: '🏳️', rtl: false },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩', rtl: false },
  { code: 'en', label: 'English', flag: '🇬🇧', rtl: false },
  { code: 'es', label: 'Español', flag: '🇪🇸', rtl: false },
]

// ── Quick Emergency Phrases ────────────────────────────────────────────────
const EMERGENCY_PHRASES = [
  { icon: '🚨', text: 'Haben Sie Schmerzen?' },
  { icon: '💊', text: 'Sind Sie allergisch gegen Medikamente?' },
  { icon: '🫁', text: 'Können Sie atmen?' },
  { icon: '🌡️', text: 'Haben Sie Fieber?' },
  { icon: '🤰', text: 'Sind Sie schwanger?' },
  { icon: '💉', text: 'Nehmen Sie Medikamente ein?' },
]

type Side = 'staff' | 'patient'
type RecordingState = 'idle' | 'recording' | 'translating' | 'speaking'

interface TranscriptEntry {
  id: string
  side: Side
  original: string
  translated: string
  timestamp: Date
}

export default function StandaloneMedicalPage() {
  const navigate = useNavigate()
  const [patientLang, setPatientLang] = useState(MEDICAL_LANGUAGES[0]) // Arabic default
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [staffState, setStaffState] = useState<RecordingState>('idle')
  const [patientState, setPatientState] = useState<RecordingState>('idle')
  const [staffText, setStaffText] = useState('')
  const [patientText, setPatientText] = useState('')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [autoMode, setAutoMode] = useState(false)
  const [showPhrases, setShowPhrases] = useState(false)
  const sttRef = useRef<ReturnType<typeof createWebSpeechEngine> | null>(null)

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  const addEntry = useCallback((side: Side, original: string, translated: string) => {
    setTranscript(prev => [...prev.slice(-19), {
      id: Date.now().toString(),
      side,
      original,
      translated,
      timestamp: new Date()
    }])
  }, [])

  const handleRecord = useCallback(async (side: Side) => {
    const setState = side === 'staff' ? setStaffState : setPatientState
    const setText = side === 'staff' ? setStaffText : setPatientText
    const sourceLang = side === 'staff' ? 'de' : patientLang.code
    const targetLang = side === 'staff' ? patientLang.code : 'de'

    setState('recording')
    setText('Aufnahme läuft...')

    try {
      const engine = createWebSpeechEngine()
      sttRef.current = engine

      const spoken = await new Promise<string>((resolve, reject) => {
        engine.start({
          language: sourceLang,
          onResult: (text: string) => resolve(text),
          onError: (err: string) => reject(new Error(err)),
          continuous: false,
        })
        // Auto-stop after 15s
        setTimeout(() => engine.stop(), 15000)
      })

      setState('translating')
      setText(spoken)

      const translated = await translateText(spoken, sourceLang, targetLang)

      setState('speaking')
      addEntry(side, spoken, translated)

      if (side === 'staff') {
        setPatientText(translated)
      } else {
        setStaffText(translated)
      }

      await speakText(translated, targetLang)
      setState('idle')
    } catch {
      setState('idle')
      setText('')
    }
  }, [patientLang, addEntry])

  const handlePhrase = useCallback(async (phrase: string) => {
    setStaffState('translating')
    setStaffText(phrase)
    try {
      const translated = await translateText(phrase, 'de', patientLang.code)
      setPatientText(translated)
      addEntry('staff', phrase, translated)
      setStaffState('speaking')
      await speakText(translated, patientLang.code)
      setStaffState('idle')
    } catch {
      setStaffState('idle')
    }
  }, [patientLang, addEntry])

  const getButtonLabel = (state: RecordingState, side: Side) => {
    if (state === 'recording') return 'Aufnahme läuft...'
    if (state === 'translating') return 'Übersetze...'
    if (state === 'speaking') return 'Sprachausgabe...'
    return side === 'staff' ? 'Sprechen (Deutsch)' : `Sprechen (${patientLang.label})`
  }

  const isActive = (state: RecordingState) => state !== 'idle'

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-gray-50">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm">
          <ArrowLeft className="h-4 w-4" />
          <span>Zurück</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Medical Translator</span>
          <Badge variant="outline" className={cn("text-xs", isOnline ? "border-green-500 text-green-700" : "border-red-500 text-red-700")}>
            {isOnline ? <><Wifi className="h-3 w-3 mr-1" />Online</> : <><WifiOff className="h-3 w-3 mr-1" />Offline</>}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoMode(a => !a)}
            className={cn("flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors",
              autoMode ? "bg-amber-100 border-amber-400 text-amber-700" : "border-gray-300 text-gray-500")}
          >
            {autoMode ? <Zap className="h-3 w-3" /> : <ZapOff className="h-3 w-3" />}
            Auto
          </button>
          <button onClick={() => navigate('/protocol')} className="text-gray-500 hover:text-gray-800">
            <FileText className="h-4 w-4" />
          </button>
          <button onClick={() => navigate('/live')} className="text-gray-500 hover:text-gray-800">
            <QrCode className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Language Selector ── */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">🇩🇪 Deutsch</span>
          <Languages className="h-4 w-4 text-gray-400" />
        </div>
        <button
          onClick={() => setShowLangPicker(p => !p)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
        >
          <span>{patientLang.flag}</span>
          <span>{patientLang.label}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* ── Language Picker Dropdown ── */}
      {showLangPicker && (
        <div className="absolute top-24 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg max-h-64 overflow-y-auto">
          <div className="grid grid-cols-3 gap-1 p-3">
            {MEDICAL_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => { setPatientLang(lang); setShowLangPicker(false) }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  patientLang.code === lang.code
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                )}
              >
                <span>{lang.flag}</span>
                <span className="truncate">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main: Two Halves ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── STAFF HALF (top, red) ── */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-4 bg-red-50 border-b-4 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <Stethoscope className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Arzt / Pflegekraft</span>
          </div>

          {/* Display area */}
          <div className="w-full max-w-md min-h-16 bg-white rounded-xl border border-red-200 p-3 text-center">
            {staffText ? (
              <p className="text-base text-gray-800 leading-relaxed">{staffText}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Sprechen Sie auf Deutsch...</p>
            )}
          </div>

          {/* Record Button */}
          <button
            onPointerDown={() => !isActive(staffState) && handleRecord('staff')}
            disabled={isActive(patientState)}
            className={cn(
              "w-full max-w-md py-5 rounded-2xl text-white font-semibold text-lg transition-all shadow-md active:scale-95",
              isActive(staffState)
                ? "bg-red-700 animate-pulse cursor-wait"
                : isActive(patientState)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
            )}
          >
            <div className="flex items-center justify-center gap-3">
              {isActive(staffState) ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              <span>{getButtonLabel(staffState, 'staff')}</span>
            </div>
          </button>

          {/* Quick Phrases Toggle */}
          <button
            onClick={() => setShowPhrases(p => !p)}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
          >
            <Pill className="h-3 w-3" />
            Schnellphrasen {showPhrases ? '▲' : '▼'}
          </button>

          {showPhrases && (
            <div className="w-full max-w-md grid grid-cols-2 gap-2">
              {EMERGENCY_PHRASES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePhrase(p.text)}
                  disabled={isActive(staffState) || isActive(patientState)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-red-200 rounded-lg text-xs text-gray-700 hover:bg-red-50 transition-colors text-left"
                >
                  <span>{p.icon}</span>
                  <span className="line-clamp-2">{p.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── DIVIDER ── */}
        <div className="flex items-center justify-center h-8 bg-gray-100 border-y border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>🔄</span>
            <span>Bidirektional — Gerät umdrehen für Patient</span>
          </div>
        </div>

        {/* ── PATIENT HALF (bottom, blue, rotated) ── */}
        <div
          className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-4 bg-blue-50 rotate-180"
          dir={patientLang.rtl ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center gap-2 text-blue-700 rotate-0">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              {patientLang.flag} Patient
            </span>
          </div>

          {/* Display area */}
          <div className="w-full max-w-md min-h-16 bg-white rounded-xl border border-blue-200 p-3 text-center">
            {patientText ? (
              <p className={cn("text-base text-gray-800 leading-relaxed", patientLang.rtl && "text-right")}>{patientText}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Warten auf Übersetzung...</p>
            )}
          </div>

          {/* Record Button */}
          <button
            onPointerDown={() => !isActive(patientState) && handleRecord('patient')}
            disabled={isActive(staffState)}
            className={cn(
              "w-full max-w-md py-5 rounded-2xl text-white font-semibold text-lg transition-all shadow-md active:scale-95",
              isActive(patientState)
                ? "bg-blue-700 animate-pulse cursor-wait"
                : isActive(staffState)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            <div className="flex items-center justify-center gap-3">
              {isActive(patientState) ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              <span className={patientLang.rtl ? "font-arabic" : ""}>
                {getButtonLabel(patientState, 'patient')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Medical Disclaimer ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-t border-amber-200">
        <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800">
          Maschinelle Übersetzung — kein Ersatz für zertifizierten Dolmetscher bei kritischen Diagnosen.
        </p>
      </div>
    </div>
  )
}
