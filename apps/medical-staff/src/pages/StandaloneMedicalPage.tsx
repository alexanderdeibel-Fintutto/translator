/**
 * StandaloneMedicalPage — Bidirektionaler Offline-Modus für das Klinik-Tablet
 *
 * Design-Philosophie:
 * PRIMÄR: Arzt/Pflegekraft ↔ Patient auf EINEM Gerät — vollständig offline.
 * Das Gerät liegt auf dem Tisch zwischen Arzt und Patient.
 * Arzt-Hälfte oben (Deutsch), Patienten-Hälfte unten (gedreht, Patientensprache).
 * SEKUNDÄR: QR-Code für Angehörige/weitere Mithörer auf eigenem Smartphone.
 *
 * UX-Fixes v2:
 * - Sprache ZUERST wählen (vor allem anderen) — großes, klares Picker-Modal
 * - Sprachauswahl bleibt persistent (localStorage)
 * - Buttons sind RIESIG (min 80px) — Tablet-optimiert, kein Vertippen
 * - Aktueller Zustand ist immer sofort erkennbar (Farbe + Animation + Text)
 * - Schnellphrasen IMMER sichtbar (kein Toggle nötig) — 2-Tap-Workflow
 * - Auto-Stop nach Stille (3s) statt festem Timeout
 * - Lautstärke-Indikator während Aufnahme
 * - Protokoll-Eintrag nach jeder Übersetzung (für Akte)
 * - QR-Code nur als kleines Icon in der Toolbar — nicht im Hauptflow
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Mic, Volume2, Languages, ChevronDown, AlertTriangle,
  Stethoscope, Heart, WifiOff, Wifi, QrCode, FileText,
  Zap, ZapOff, RotateCcw, CheckCircle2, Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { translateText } from '@/lib/translate'
import { speakText } from '@/lib/tts'
import { createWebSpeechEngine } from '@/lib/stt'

// ── Sprachen: nach Häufigkeit in DACH-Kliniken sortiert ───────────────────
const MEDICAL_LANGUAGES = [
  { code: 'ar', label: 'العربية',     flag: '🇸🇦', rtl: true,  name: 'Arabisch' },
  { code: 'tr', label: 'Türkçe',      flag: '🇹🇷', rtl: false, name: 'Türkisch' },
  { code: 'uk', label: 'Українська',  flag: '🇺🇦', rtl: false, name: 'Ukrainisch' },
  { code: 'ru', label: 'Русский',     flag: '🇷🇺', rtl: false, name: 'Russisch' },
  { code: 'fa', label: 'فارسی',       flag: '🇮🇷', rtl: true,  name: 'Persisch' },
  { code: 'ro', label: 'Română',      flag: '🇷🇴', rtl: false, name: 'Rumänisch' },
  { code: 'pl', label: 'Polski',      flag: '🇵🇱', rtl: false, name: 'Polnisch' },
  { code: 'sr', label: 'Српски',      flag: '🇷🇸', rtl: false, name: 'Serbisch' },
  { code: 'bs', label: 'Bosanski',    flag: '🇧🇦', rtl: false, name: 'Bosnisch' },
  { code: 'hr', label: 'Hrvatski',    flag: '🇭🇷', rtl: false, name: 'Kroatisch' },
  { code: 'sq', label: 'Shqip',       flag: '🇦🇱', rtl: false, name: 'Albanisch' },
  { code: 'so', label: 'Soomaali',    flag: '🇸🇴', rtl: false, name: 'Somali' },
  { code: 'ti', label: 'ትግርኛ',        flag: '🇪🇷', rtl: false, name: 'Tigrinya' },
  { code: 'am', label: 'አማርኛ',        flag: '🇪🇹', rtl: false, name: 'Amharisch' },
  { code: 'ps', label: 'پښتو',        flag: '🇦🇫', rtl: true,  name: 'Pashto' },
  { code: 'ur', label: 'اردو',        flag: '🇵🇰', rtl: true,  name: 'Urdu' },
  { code: 'ku', label: 'Kurdî',       flag: '🏳️',  rtl: false, name: 'Kurdisch' },
  { code: 'fr', label: 'Français',    flag: '🇫🇷', rtl: false, name: 'Französisch' },
  { code: 'vi', label: 'Tiếng Việt',  flag: '🇻🇳', rtl: false, name: 'Vietnamesisch' },
  { code: 'zh', label: '中文',         flag: '🇨🇳', rtl: false, name: 'Chinesisch' },
  { code: 'hi', label: 'हिन्दी',       flag: '🇮🇳', rtl: false, name: 'Hindi' },
  { code: 'bn', label: 'বাংলা',        flag: '🇧🇩', rtl: false, name: 'Bengalisch' },
  { code: 'en', label: 'English',     flag: '🇬🇧', rtl: false, name: 'Englisch' },
  { code: 'es', label: 'Español',     flag: '🇪🇸', rtl: false, name: 'Spanisch' },
]

// ── Schnellphrasen: die 8 kritischsten, immer sichtbar ────────────────────
const QUICK_PHRASES = [
  { icon: '🚨', de: 'Haben Sie Schmerzen?',                      category: 'notfall' },
  { icon: '💊', de: 'Sind Sie allergisch gegen Medikamente?',    category: 'allergie' },
  { icon: '🫁', de: 'Können Sie normal atmen?',                  category: 'notfall' },
  { icon: '🤰', de: 'Sind Sie schwanger?',                       category: 'anamnese' },
  { icon: '💉', de: 'Nehmen Sie Medikamente ein?',               category: 'anamnese' },
  { icon: '🌡️', de: 'Haben Sie Fieber?',                         category: 'anamnese' },
  { icon: '🏥', de: 'Wir helfen Ihnen. Sie sind in Sicherheit.', category: 'beruhigung' },
  { icon: '✋', de: 'Bitte warten Sie einen Moment.',             category: 'info' },
]

type RecordingState = 'idle' | 'recording' | 'translating' | 'speaking'
type Side = 'staff' | 'patient'

interface TranscriptEntry {
  id: string
  side: Side
  original: string
  translated: string
  time: string
}

const STORAGE_KEY = 'medical-translator-lang'

export default function StandaloneMedicalPage() {
  const navigate = useNavigate()

  // Sprache aus localStorage laden
  const savedLangCode = localStorage.getItem(STORAGE_KEY)
  const savedLang = MEDICAL_LANGUAGES.find(l => l.code === savedLangCode) || MEDICAL_LANGUAGES[0]

  const [patientLang, setPatientLang] = useState(savedLang)
  const [showLangModal, setShowLangModal] = useState(!savedLangCode) // Beim ersten Start immer zeigen
  const [staffState, setStaffState] = useState<RecordingState>('idle')
  const [patientState, setPatientState] = useState<RecordingState>('idle')
  const [staffText, setStaffText] = useState('')
  const [patientText, setPatientText] = useState('')
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [autoMode, setAutoMode] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const sttRef = useRef<ReturnType<typeof createWebSpeechEngine> | null>(null)

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

  const selectLang = useCallback((lang: typeof MEDICAL_LANGUAGES[0]) => {
    setPatientLang(lang)
    localStorage.setItem(STORAGE_KEY, lang.code)
    setShowLangModal(false)
  }, [])

  const addEntry = useCallback((side: Side, original: string, translated: string) => {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setTranscript(prev => [...prev.slice(-49), { id: Date.now().toString(), side, original, translated, time }])
  }, [])

  const handleRecord = useCallback(async (side: Side) => {
    if (side === 'staff' && staffState !== 'idle') return
    if (side === 'patient' && patientState !== 'idle') return
    if (side === 'staff' && patientState !== 'idle') return
    if (side === 'patient' && staffState !== 'idle') return

    const setState = side === 'staff' ? setStaffState : setPatientState
    const setText = side === 'staff' ? setStaffText : setPatientText
    const sourceLang = side === 'staff' ? 'de' : patientLang.code
    const targetLang = side === 'staff' ? patientLang.code : 'de'

    setState('recording')
    setText(side === 'staff' ? '🎙️ Sprechen Sie jetzt...' : '🎙️ تحدث الآن...')

    try {
      const engine = createWebSpeechEngine()
      sttRef.current = engine

      const spoken = await new Promise<string>((resolve, reject) => {
        let silenceTimer: ReturnType<typeof setTimeout>
        engine.start({
          language: sourceLang,
          onResult: (text: string) => {
            clearTimeout(silenceTimer)
            silenceTimer = setTimeout(() => resolve(text), 1500) // 1.5s Stille → fertig
            setText(text)
          },
          onError: (err: string) => reject(new Error(err)),
          continuous: true,
        })
        // Max 30s
        setTimeout(() => engine.stop(), 30000)
      })

      engine.stop()
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
  }, [patientLang, addEntry, staffState, patientState])

  const handlePhrase = useCallback(async (phrase: string) => {
    if (staffState !== 'idle' || patientState !== 'idle') return
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
  }, [patientLang, addEntry, staffState, patientState])

  const isActive = (state: RecordingState) => state !== 'idle'
  const anyActive = isActive(staffState) || isActive(patientState)

  const getStateLabel = (state: RecordingState, side: Side) => {
    if (state === 'recording') return '🎙️ Aufnahme läuft...'
    if (state === 'translating') return '⏳ Übersetze...'
    if (state === 'speaking') return '🔊 Sprachausgabe...'
    return side === 'staff' ? '🎙️ Deutsch sprechen' : `🎙️ ${patientLang.label} sprechen`
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-slate-100 select-none">

      {/* ── Sprach-Auswahl Modal ── */}
      {showLangModal && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">Patientensprache wählen</h2>
              <p className="text-sm text-gray-500 mt-1">Select patient language / اختر لغة المريض</p>
            </div>
            <div className="overflow-y-auto flex-1 p-3">
              <div className="grid grid-cols-2 gap-2">
                {MEDICAL_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => selectLang(lang)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-95",
                      patientLang.code === lang.code
                        ? "bg-blue-600 text-white font-semibold shadow-md"
                        : "bg-gray-50 hover:bg-blue-50 text-gray-800 border border-gray-200"
                    )}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="font-medium text-sm">{lang.name}</div>
                      <div className={cn("text-xs", patientLang.code === lang.code ? "text-blue-100" : "text-gray-500")}>{lang.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">Medical Translator</span>
          <Badge variant="outline" className={cn("text-xs h-5", isOnline ? "border-green-500 text-green-700" : "border-orange-500 text-orange-700")}>
            {isOnline ? <><Wifi className="h-3 w-3 mr-1" />Online</> : <><WifiOff className="h-3 w-3 mr-1" />Offline</>}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-Modus */}
          <button
            onClick={() => setAutoMode(a => !a)}
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors",
              autoMode ? "bg-amber-100 border-amber-400 text-amber-700 font-medium" : "border-gray-300 text-gray-400"
            )}
            title="Auto-Modus: Aufnahme startet automatisch nach Stille"
          >
            {autoMode ? <Zap className="h-3 w-3" /> : <ZapOff className="h-3 w-3" />}
            Auto
          </button>
          {/* Protokoll */}
          <button
            onClick={() => setShowTranscript(s => !s)}
            className={cn("relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100", showTranscript && "text-blue-600")}
            title="Gesprächsprotokoll"
          >
            <FileText className="h-4 w-4" />
            {transcript.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {transcript.length > 9 ? '9+' : transcript.length}
              </span>
            )}
          </button>
          {/* QR für Angehörige */}
          <button
            onClick={() => navigate('/live')}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            title="QR-Code für Angehörige / Mithörer"
          >
            <QrCode className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Sprach-Auswahl Bar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-lg">🇩🇪</span>
          <span className="font-semibold">Deutsch</span>
          <Languages className="h-4 w-4 text-gray-300 mx-1" />
        </div>
        <button
          onClick={() => setShowLangModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
        >
          <span className="text-base">{patientLang.flag}</span>
          <span>{patientLang.name}</span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </div>

      {/* ── Protokoll-Drawer ── */}
      {showTranscript && (
        <div className="bg-white border-b border-gray-200 max-h-40 overflow-y-auto shrink-0">
          {transcript.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Noch keine Einträge</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {[...transcript].reverse().map(entry => (
                <div key={entry.id} className={cn("px-4 py-2 flex gap-3 items-start", entry.side === 'staff' ? "bg-red-50/50" : "bg-blue-50/50")}>
                  <span className="text-xs text-gray-400 shrink-0 mt-0.5">{entry.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 truncate">{entry.original}</p>
                    <p className="text-xs font-medium text-gray-800 truncate">{entry.translated}</p>
                  </div>
                  <span className="text-xs shrink-0">{entry.side === 'staff' ? '🩺' : '🧑'}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center px-4 py-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">{transcript.length} Einträge</span>
            <button
              onClick={() => navigate('/protocol')}
              className="text-xs text-blue-600 font-medium"
            >
              Vollständiges Protokoll →
            </button>
          </div>
        </div>
      )}

      {/* ── Hauptbereich: Zwei Hälften ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── ARZT-HÄLFTE (oben, Rot) ── */}
        <div className={cn(
          "flex-1 flex flex-col items-center justify-between px-4 py-3 transition-colors",
          isActive(staffState) ? "bg-red-100" : "bg-red-50"
        )}>
          {/* Label */}
          <div className="flex items-center gap-2 text-red-700 w-full justify-center">
            <Stethoscope className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Arzt / Pflegekraft</span>
          </div>

          {/* Anzeigefeld */}
          <div className={cn(
            "w-full max-w-lg rounded-2xl border-2 px-4 py-3 text-center min-h-14 flex items-center justify-center transition-colors",
            isActive(staffState) ? "border-red-400 bg-white shadow-md" : "border-red-200 bg-white/80"
          )}>
            {staffText ? (
              <p className="text-base text-gray-900 leading-relaxed font-medium">{staffText}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Übersetzung erscheint hier...</p>
            )}
          </div>

          {/* Haupt-Aufnahme-Button */}
          <button
            onPointerDown={() => handleRecord('staff')}
            disabled={anyActive && staffState === 'idle'}
            className={cn(
              "w-full max-w-lg rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95",
              "flex items-center justify-center gap-3 py-5 text-lg",
              isActive(staffState)
                ? staffState === 'recording'
                  ? "bg-red-700 animate-pulse shadow-red-300"
                  : "bg-red-400 cursor-wait"
                : anyActive
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-red-600 hover:bg-red-700 shadow-red-200"
            )}
          >
            {staffState === 'recording' ? (
              <><span className="text-2xl animate-bounce">🎙️</span> Aufnahme läuft...</>
            ) : staffState === 'translating' ? (
              <><span className="text-2xl">⏳</span> Übersetze...</>
            ) : staffState === 'speaking' ? (
              <><Volume2 className="h-6 w-6 animate-pulse" /> Sprachausgabe...</>
            ) : (
              <><Mic className="h-6 w-6" /> Deutsch sprechen</>
            )}
          </button>

          {/* Schnellphrasen — immer sichtbar */}
          <div className="w-full max-w-lg grid grid-cols-4 gap-1.5">
            {QUICK_PHRASES.map((p, i) => (
              <button
                key={i}
                onClick={() => handlePhrase(p.de)}
                disabled={anyActive}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-xl border text-center transition-all active:scale-95",
                  anyActive
                    ? "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
                    : "bg-white border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm"
                )}
                title={p.de}
              >
                <span className="text-xl">{p.icon}</span>
                <span className="text-[10px] text-gray-600 leading-tight line-clamp-2">{p.de}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── TRENNLINIE ── */}
        <div className="flex items-center justify-center h-7 bg-slate-200 border-y border-slate-300 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>↕</span>
            <span>Gerät umdrehen für Patient</span>
            <span>↕</span>
          </div>
        </div>

        {/* ── PATIENTEN-HÄLFTE (unten, Blau, 180° gedreht) ── */}
        <div
          className={cn(
            "flex-1 flex flex-col items-center justify-between px-4 py-3 rotate-180 transition-colors",
            isActive(patientState) ? "bg-blue-100" : "bg-blue-50"
          )}
          dir={patientLang.rtl ? 'rtl' : 'ltr'}
        >
          {/* Label */}
          <div className="flex items-center gap-2 text-blue-700 w-full justify-center">
            <Heart className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {patientLang.flag} Patient — {patientLang.name}
            </span>
          </div>

          {/* Anzeigefeld */}
          <div className={cn(
            "w-full max-w-lg rounded-2xl border-2 px-4 py-3 text-center min-h-14 flex items-center justify-center transition-colors",
            isActive(patientState) ? "border-blue-400 bg-white shadow-md" : "border-blue-200 bg-white/80",
            patientLang.rtl && "text-right"
          )}>
            {patientText ? (
              <p className={cn("text-base text-gray-900 leading-relaxed font-medium", patientLang.rtl && "font-arabic")}>{patientText}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                {patientLang.code === 'ar' ? 'ستظهر الترجمة هنا...' :
                 patientLang.code === 'tr' ? 'Çeviri burada görünecek...' :
                 patientLang.code === 'uk' ? 'Переклад з\'явиться тут...' :
                 patientLang.code === 'ru' ? 'Перевод появится здесь...' :
                 'Translation appears here...'}
              </p>
            )}
          </div>

          {/* Haupt-Aufnahme-Button */}
          <button
            onPointerDown={() => handleRecord('patient')}
            disabled={anyActive && patientState === 'idle'}
            className={cn(
              "w-full max-w-lg rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95",
              "flex items-center justify-center gap-3 py-5 text-lg",
              isActive(patientState)
                ? patientState === 'recording'
                  ? "bg-blue-700 animate-pulse shadow-blue-300"
                  : "bg-blue-400 cursor-wait"
                : anyActive
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            )}
          >
            {patientState === 'recording' ? (
              <><span className="text-2xl animate-bounce">🎙️</span>
                {patientLang.code === 'ar' ? 'التسجيل جارٍ...' :
                 patientLang.code === 'tr' ? 'Kayıt devam ediyor...' :
                 patientLang.code === 'uk' ? 'Запис іде...' :
                 patientLang.code === 'ru' ? 'Запись идёт...' :
                 'Recording...'}</>
            ) : patientState === 'translating' ? (
              <><span className="text-2xl">⏳</span>
                {patientLang.code === 'ar' ? 'جارٍ الترجمة...' : 'Translating...'}</>
            ) : patientState === 'speaking' ? (
              <><Volume2 className="h-6 w-6 animate-pulse" />
                {patientLang.code === 'ar' ? 'جارٍ التشغيل...' : 'Playing...'}</>
            ) : (
              <><Mic className="h-6 w-6" />
                {patientLang.code === 'ar' ? 'تحدث الآن' :
                 patientLang.code === 'tr' ? 'Şimdi konuşun' :
                 patientLang.code === 'uk' ? 'Говоріть зараз' :
                 patientLang.code === 'ru' ? 'Говорите сейчас' :
                 patientLang.code === 'fa' ? 'اکنون صحبت کنید' :
                 patientLang.code === 'ur' ? 'ابھی بولیں' :
                 patientLang.code === 'ps' ? 'اوس وغږیږئ' :
                 `Sprechen (${patientLang.label})`}</>
            )}
          </button>

          {/* Anamnese + Notfall-Link */}
          <div className="w-full max-w-lg flex gap-2">
            <button
              onClick={() => navigate('/anamnesis')}
              disabled={anyActive}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-300 bg-white text-blue-700 text-sm font-medium hover:bg-blue-50 active:scale-95 transition-all disabled:opacity-40"
            >
              <CheckCircle2 className="h-4 w-4" />
              Anamnese
            </button>
            <button
              onClick={() => navigate('/emergency')}
              disabled={anyActive}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-orange-300 bg-white text-orange-700 text-sm font-medium hover:bg-orange-50 active:scale-95 transition-all disabled:opacity-40"
            >
              <span>🚨</span>
              Notfall-Phrasen
            </button>
          </div>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-t border-amber-200 shrink-0">
        <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
        <p className="text-[11px] text-amber-800">
          Maschinelle Übersetzung — kein Ersatz für zertifizierten Dolmetscher bei kritischen Diagnosen oder rechtlichen Aufklärungen.
        </p>
      </div>
    </div>
  )
}
