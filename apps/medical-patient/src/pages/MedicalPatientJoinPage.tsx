/**
 * Medical Patient Join Page — Erweitert
 *
 * Patientenseite mit:
 * - Bidirektionaler Übersetzung (Bürger spricht, hört Arzt)
 * - Symptom-Schnelleingabe (Bilder + Symbole, kein Lesen nötig)
 * - Schmerzskala
 * - BITV 2.0 Barrierefreiheit (Hoher Kontrast, große Schrift)
 * - RTL-Support für Arabisch, Persisch, Urdu
 * - Automatische Spracherkennung
 */

import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart, ArrowRight, Volume2, Mic, MicOff, ChevronDown,
  ZoomIn, ZoomOut, Contrast, Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import PainScale from '@/components/market/PainScale'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'
import { translateText } from '@/lib/translate'
import { speakText } from '@/lib/tts'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', rtl: false },
  { code: 'uk', label: 'Українська', flag: '🇺🇦', rtl: false },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'ro', label: 'Română', flag: '🇷🇴', rtl: false },
  { code: 'pl', label: 'Polski', flag: '🇵🇱', rtl: false },
  { code: 'fr', label: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'en', label: 'English', flag: '🇬🇧', rtl: false },
  { code: 'so', label: 'Soomaali', flag: '🇸🇴', rtl: false },
  { code: 'ps', label: 'پښتو', flag: '🇦🇫', rtl: true },
  { code: 'ur', label: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'ti', label: 'ትግርኛ', flag: '🇪🇷', rtl: false },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹', rtl: false },
  { code: 'zh', label: '中文', flag: '🇨🇳', rtl: false },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
]

const SYMPTOM_CARDS = [
  { emoji: '🤕', de: 'Ich habe Kopfschmerzen.', id: 's1' },
  { emoji: '🤢', de: 'Mir ist schlecht.', id: 's2' },
  { emoji: '🌡️', de: 'Ich habe Fieber.', id: 's3' },
  { emoji: '💔', de: 'Ich habe Brustschmerzen.', id: 's4' },
  { emoji: '🫁', de: 'Ich habe Atemnot.', id: 's5' },
  { emoji: '🦷', de: 'Ich habe Zahnschmerzen.', id: 's6' },
  { emoji: '🤮', de: 'Ich muss mich übergeben.', id: 's7' },
  { emoji: '💩', de: 'Ich habe Durchfall.', id: 's8' },
  { emoji: '🦵', de: 'Ich habe Schmerzen im Bein.', id: 's9' },
  { emoji: '💪', de: 'Ich habe Schmerzen im Arm.', id: 's10' },
  { emoji: '👁️', de: 'Mein Auge schmerzt.', id: 's11' },
  { emoji: '👂', de: 'Mein Ohr schmerzt.', id: 's12' },
]

type ViewMode = 'home' | 'symptoms' | 'speak'

export default function MedicalPatientJoinPage() {
  const navigate = useNavigate()
  const locale = detectListenerLocale()
  const t = getListenerStrings(locale)

  // Detect language from browser
  const browserLang = navigator.language.split('-')[0]
  const defaultLang = LANGUAGES.find(l => l.code === browserLang) || LANGUAGES[0]

  const [selectedLang, setSelectedLang] = useState(defaultLang)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [painLevel, setPainLevel] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('home')
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [symptomTranslations, setSymptomTranslations] = useState<Record<string, string>>({})
  const [activeSymptom, setActiveSymptom] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const rtl = selectedLang.rtl

  const fontSizeClass = {
    normal: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl',
  }[fontSize]

  const handleSymptom = useCallback(async (symptom: typeof SYMPTOM_CARDS[0]) => {
    setActiveSymptom(symptom.id)
    try {
      let translated = symptomTranslations[`${symptom.id}_${selectedLang.code}`]
      if (!translated) {
        translated = await translateText(symptom.de, 'de', selectedLang.code)
        setSymptomTranslations(prev => ({ ...prev, [`${symptom.id}_${selectedLang.code}`]: translated }))
      }
      // Speak in patient's language
      await speakText(translated, selectedLang.code)
      // Also speak German for doctor
      await speakText(symptom.de, 'de')
    } catch {
      try { await speakText(symptom.de, 'de') } catch {}
    } finally {
      setActiveSymptom(null)
    }
  }, [selectedLang, symptomTranslations])

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Spracherkennung wird von diesem Browser nicht unterstützt.')
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = selectedLang.code
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      try {
        const translated = await translateText(text, selectedLang.code, 'de')
        setTranslatedText(translated)
        await speakText(translated, 'de')
      } catch {}
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }, [selectedLang])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return (
    <div
      className={cn(
        "min-h-[100dvh] flex flex-col",
        highContrast && "bg-black text-white",
        fontSizeClass
      )}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b",
        highContrast ? "bg-black border-white" : "bg-white shadow-sm"
      )}>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-600" />
          <span className={cn("font-semibold", highContrast ? "text-white" : "text-gray-800")}>
            Medical Translator
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Accessibility Controls */}
          <button
            onClick={() => setFontSize(s => s === 'normal' ? 'large' : s === 'large' ? 'xlarge' : 'normal')}
            className={cn("p-1.5 rounded-lg", highContrast ? "text-white border border-white" : "text-gray-500 hover:bg-gray-100")}
            aria-label="Schriftgröße ändern"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setHighContrast(h => !h)}
            className={cn("p-1.5 rounded-lg", highContrast ? "text-yellow-400 border border-yellow-400" : "text-gray-500 hover:bg-gray-100")}
            aria-label="Hoher Kontrast"
          >
            <Contrast className="h-4 w-4" />
          </button>

          {/* Language Picker */}
          <button
            onClick={() => setShowLangPicker(p => !p)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-sm",
              highContrast ? "border border-white text-white" : "bg-blue-50 border border-blue-200 text-blue-700"
            )}
          >
            {selectedLang.flag} {selectedLang.label} <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Language Picker Dropdown */}
      {showLangPicker && (
        <div className={cn(
          "border-b grid grid-cols-4 gap-1 p-3",
          highContrast ? "bg-black border-white" : "bg-white shadow-md"
        )}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setSelectedLang(lang); setShowLangPicker(false) }}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs",
                selectedLang.code === lang.code
                  ? highContrast ? "bg-yellow-400 text-black font-bold" : "bg-blue-100 text-blue-700 font-medium"
                  : highContrast ? "text-white hover:bg-gray-800" : "hover:bg-gray-100"
              )}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={cn(
        "flex border-b",
        highContrast ? "bg-black border-white" : "bg-white"
      )}>
        {[
          { id: 'home' as ViewMode, label: '🏠 Start' },
          { id: 'symptoms' as ViewMode, label: '🤕 Symptome' },
          { id: 'speak' as ViewMode, label: '🎙️ Sprechen' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              viewMode === tab.id
                ? highContrast ? "border-b-2 border-yellow-400 text-yellow-400" : "border-b-2 border-red-500 text-red-600"
                : highContrast ? "text-gray-400" : "text-gray-500"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* HOME TAB */}
        {viewMode === 'home' && (
          <div className="p-4 space-y-5 max-w-sm mx-auto">
            <div className="text-center pt-4">
              <p className={cn("text-lg font-medium", highContrast ? "text-white" : "text-gray-700")}>
                {selectedLang.code === 'ar' ? 'مرحباً بك في المستشفى' :
                 selectedLang.code === 'tr' ? 'Hastaneye hoş geldiniz' :
                 selectedLang.code === 'uk' ? 'Ласкаво просимо до лікарні' :
                 selectedLang.code === 'ru' ? 'Добро пожаловать в больницу' :
                 'Willkommen'}
              </p>
              <p className={cn("text-sm mt-1", highContrast ? "text-gray-300" : "text-gray-500")}>
                Medical Translator — {selectedLang.label}
              </p>
            </div>

            {/* Pain Scale */}
            <PainScale
              onSelect={(value) => setPainLevel(value)}
              selected={painLevel}
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setViewMode('symptoms')}
                className={cn(
                  "p-5 rounded-2xl text-center space-y-2 transition-all active:scale-95",
                  highContrast ? "bg-gray-800 border border-white text-white" : "bg-orange-50 border border-orange-200"
                )}
              >
                <div className="text-3xl">🤕</div>
                <p className={cn("text-sm font-semibold", highContrast ? "text-white" : "text-orange-800")}>
                  {selectedLang.code === 'ar' ? 'أعراضي' :
                   selectedLang.code === 'tr' ? 'Semptomlarım' :
                   selectedLang.code === 'uk' ? 'Мої симптоми' :
                   'Meine Symptome'}
                </p>
              </button>
              <button
                onClick={() => setViewMode('speak')}
                className={cn(
                  "p-5 rounded-2xl text-center space-y-2 transition-all active:scale-95",
                  highContrast ? "bg-gray-800 border border-white text-white" : "bg-blue-50 border border-blue-200"
                )}
              >
                <div className="text-3xl">🎙️</div>
                <p className={cn("text-sm font-semibold", highContrast ? "text-white" : "text-blue-800")}>
                  {selectedLang.code === 'ar' ? 'تحدث' :
                   selectedLang.code === 'tr' ? 'Konuş' :
                   selectedLang.code === 'uk' ? 'Говорити' :
                   'Sprechen'}
                </p>
              </button>
            </div>

            {/* Emergency Call */}
            <a
              href="tel:112"
              className={cn(
                "flex items-center justify-center gap-3 p-4 rounded-2xl font-bold text-white transition-all active:scale-95",
                "bg-red-600 hover:bg-red-700"
              )}
            >
              <Phone className="h-5 w-5" />
              Notruf 112
            </a>
          </div>
        )}

        {/* SYMPTOMS TAB */}
        {viewMode === 'symptoms' && (
          <div className="p-4 space-y-4">
            <p className={cn("text-sm text-center", highContrast ? "text-gray-300" : "text-gray-500")}>
              {selectedLang.code === 'ar' ? 'اضغط على الصورة التي تصف ألمك' :
               selectedLang.code === 'tr' ? 'Şikayetinizi gösteren resme dokunun' :
               selectedLang.code === 'uk' ? 'Натисніть на зображення, що описує ваш біль' :
               'Tippen Sie auf das Bild, das Ihren Schmerz beschreibt'}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {SYMPTOM_CARDS.map(symptom => {
                const translated = symptomTranslations[`${symptom.id}_${selectedLang.code}`]
                const isActive = activeSymptom === symptom.id
                return (
                  <button
                    key={symptom.id}
                    onClick={() => handleSymptom(symptom)}
                    disabled={!!activeSymptom}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95",
                      isActive ? "animate-pulse scale-95" : "",
                      highContrast
                        ? "bg-gray-800 border border-white text-white"
                        : "bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 shadow-sm"
                    )}
                  >
                    <span className="text-3xl">{symptom.emoji}</span>
                    <span className={cn(
                      "text-xs text-center leading-tight",
                      highContrast ? "text-gray-200" : "text-gray-600"
                    )}>
                      {translated || symptom.de}
                    </span>
                    {isActive && <Volume2 className="h-3 w-3 text-red-500 animate-pulse" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* SPEAK TAB */}
        {viewMode === 'speak' && (
          <div className="p-4 flex flex-col items-center gap-6 pt-8">
            <p className={cn("text-sm text-center max-w-xs", highContrast ? "text-gray-300" : "text-gray-500")}>
              {selectedLang.code === 'ar' ? 'اضغط على الزر وتحدث. سيترجم الطبيب ما تقوله.' :
               selectedLang.code === 'tr' ? 'Butona basın ve konuşun. Doktor ne söylediğinizi anlayacak.' :
               selectedLang.code === 'uk' ? 'Натисніть кнопку і говоріть. Лікар зрозуміє вас.' :
               'Drücken Sie den Knopf und sprechen Sie. Der Arzt hört Sie.'}
            </p>

            {/* Big Mic Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg",
                isListening
                  ? "bg-red-500 animate-pulse text-white"
                  : highContrast ? "bg-yellow-400 text-black" : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              aria-label={isListening ? 'Aufnahme stoppen' : 'Aufnahme starten'}
            >
              {isListening
                ? <MicOff className="h-12 w-12" />
                : <Mic className="h-12 w-12" />
              }
            </button>

            <p className={cn("text-sm font-medium", highContrast ? "text-yellow-400" : "text-gray-600")}>
              {isListening
                ? (selectedLang.code === 'ar' ? 'جارٍ الاستماع...' : selectedLang.code === 'tr' ? 'Dinleniyor...' : 'Aufnahme läuft...')
                : (selectedLang.code === 'ar' ? 'اضغط للتحدث' : selectedLang.code === 'tr' ? 'Konuşmak için basın' : 'Drücken zum Sprechen')
              }
            </p>

            {/* Transcript */}
            {transcript && (
              <Card className={cn("w-full p-4 space-y-3", highContrast && "bg-gray-800 border-white")}>
                <div>
                  <p className={cn("text-xs uppercase tracking-wide mb-1", highContrast ? "text-gray-400" : "text-gray-400")}>
                    {selectedLang.label}
                  </p>
                  <p className={cn("font-medium", highContrast ? "text-white" : "text-gray-800")} dir={rtl ? 'rtl' : 'ltr'}>
                    {transcript}
                  </p>
                </div>
                {translatedText && (
                  <div className="border-t pt-3">
                    <p className={cn("text-xs uppercase tracking-wide mb-1", highContrast ? "text-gray-400" : "text-gray-400")}>
                      Deutsch (für Arzt)
                    </p>
                    <p className={cn("font-medium", highContrast ? "text-yellow-300" : "text-blue-800")}>
                      {translatedText}
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 border-t",
        highContrast ? "bg-black border-white" : "bg-gray-50 border-gray-200"
      )}>
        <Heart className="h-3 w-3 text-red-500 shrink-0" />
        <p className={cn("text-xs", highContrast ? "text-gray-300" : "text-gray-500")}>
          Medical Translator — DSGVO-konform · Offline-fähig
        </p>
      </div>
    </div>
  )
}
