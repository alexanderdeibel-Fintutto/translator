/**
 * EmergencyPhrasesPage — Notaufnahme-Schnellphrasen
 *
 * Großflächige Touch-Buttons für die häufigsten Notfall-Phrasen.
 * Kein Tippen nötig — Antippen → sofortige Übersetzung + TTS.
 * Optimiert für Stress-Situationen: große Schrift, hoher Kontrast.
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Volume2, ChevronDown, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { translateText } from '@/lib/translate'
import { speakText } from '@/lib/tts'

const LANGUAGES = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', rtl: false },
  { code: 'uk', label: 'Українська', flag: '🇺🇦', rtl: false },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', rtl: false },
  { code: 'fa', label: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'ro', label: 'Română', flag: '🇷🇴', rtl: false },
  { code: 'pl', label: 'Polski', flag: '🇵🇱', rtl: false },
  { code: 'en', label: 'English', flag: '🇬🇧', rtl: false },
  { code: 'fr', label: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'zh', label: '中文', flag: '🇨🇳', rtl: false },
  { code: 'so', label: 'Soomaali', flag: '🇸🇴', rtl: false },
  { code: 'ps', label: 'پښتو', flag: '🇦🇫', rtl: true },
]

interface Phrase {
  id: string
  emoji: string
  de: string
  category: 'critical' | 'assessment' | 'instruction' | 'consent'
}

const PHRASES: Phrase[] = [
  // Critical
  { id: 'c1', emoji: '🚨', de: 'Können Sie mich hören?', category: 'critical' },
  { id: 'c2', emoji: '💔', de: 'Haben Sie Brustschmerzen?', category: 'critical' },
  { id: 'c3', emoji: '🫁', de: 'Haben Sie Atemnot?', category: 'critical' },
  { id: 'c4', emoji: '🧠', de: 'Haben Sie starke Kopfschmerzen?', category: 'critical' },
  { id: 'c5', emoji: '🤢', de: 'Sind Sie bewusstlos gewesen?', category: 'critical' },
  { id: 'c6', emoji: '🩸', de: 'Bluten Sie stark?', category: 'critical' },
  // Assessment
  { id: 'a1', emoji: '📍', de: 'Wo tut es weh?', category: 'assessment' },
  { id: 'a2', emoji: '⏱️', de: 'Seit wann haben Sie diese Beschwerden?', category: 'assessment' },
  { id: 'a3', emoji: '🌡️', de: 'Haben Sie Fieber?', category: 'assessment' },
  { id: 'a4', emoji: '💊', de: 'Sind Sie allergisch gegen Medikamente?', category: 'assessment' },
  { id: 'a5', emoji: '💉', de: 'Nehmen Sie Blutverdünner?', category: 'assessment' },
  { id: 'a6', emoji: '🤰', de: 'Sind Sie schwanger?', category: 'assessment' },
  // Instructions
  { id: 'i1', emoji: '🛏️', de: 'Bitte legen Sie sich hin.', category: 'instruction' },
  { id: 'i2', emoji: '✋', de: 'Bitte bleiben Sie ruhig.', category: 'instruction' },
  { id: 'i3', emoji: '🩺', de: 'Ich muss Sie jetzt untersuchen.', category: 'instruction' },
  { id: 'i4', emoji: '💧', de: 'Wir geben Ihnen jetzt eine Infusion.', category: 'instruction' },
  { id: 'i5', emoji: '😮‍💨', de: 'Bitte tief einatmen.', category: 'instruction' },
  { id: 'i6', emoji: '⏳', de: 'Der Arzt kommt gleich.', category: 'instruction' },
  // Consent
  { id: 'co1', emoji: '✅', de: 'Verstehen Sie mich?', category: 'consent' },
  { id: 'co2', emoji: '📋', de: 'Wir müssen Sie jetzt operieren.', category: 'consent' },
  { id: 'co3', emoji: '📞', de: 'Dürfen wir Ihre Familie anrufen?', category: 'consent' },
  { id: 'co4', emoji: '🏥', de: 'Sie müssen stationär aufgenommen werden.', category: 'consent' },
]

const CATEGORY_CONFIG = {
  critical: { label: 'Kritisch', color: 'bg-red-500 hover:bg-red-600 text-white', badge: 'bg-red-100 text-red-700' },
  assessment: { label: 'Befunderhebung', color: 'bg-orange-500 hover:bg-orange-600 text-white', badge: 'bg-orange-100 text-orange-700' },
  instruction: { label: 'Anweisungen', color: 'bg-blue-500 hover:bg-blue-600 text-white', badge: 'bg-blue-100 text-blue-700' },
  consent: { label: 'Einwilligung', color: 'bg-purple-500 hover:bg-purple-600 text-white', badge: 'bg-purple-100 text-purple-700' },
}

export default function EmergencyPhrasesPage() {
  const navigate = useNavigate()
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0])
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [activePhrase, setActivePhrase] = useState<string | null>(null)
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<Phrase['category'] | 'all'>('all')

  const handlePhrase = useCallback(async (phrase: Phrase) => {
    if (activePhrase === phrase.id) return
    setActivePhrase(phrase.id)

    try {
      let translated = translatedTexts[`${phrase.id}_${selectedLang.code}`]
      if (!translated) {
        translated = await translateText(phrase.de, 'de', selectedLang.code)
        setTranslatedTexts(prev => ({ ...prev, [`${phrase.id}_${selectedLang.code}`]: translated }))
      }
      await speakText(translated, selectedLang.code)
    } catch {
      // fallback: speak German
      try { await speakText(phrase.de, 'de') } catch {}
    } finally {
      setActivePhrase(null)
    }
  }, [activePhrase, selectedLang, translatedTexts])

  const filtered = filter === 'all' ? PHRASES : PHRASES.filter(p => p.category === filter)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </button>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="font-semibold text-gray-800">Notfall-Phrasen</span>
        </div>
        <button
          onClick={() => setShowLangPicker(p => !p)}
          className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700"
        >
          {selectedLang.flag} {selectedLang.label} <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Language Picker */}
      {showLangPicker && (
        <div className="bg-white border-b shadow-md grid grid-cols-4 gap-1 p-3 sticky top-14 z-10">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setSelectedLang(lang); setShowLangPicker(false) }}
              className={cn("flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs",
                selectedLang.code === lang.code ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100")}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b">
        <button
          onClick={() => setFilter('all')}
          className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
            filter === 'all' ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
        >
          Alle
        </button>
        {(Object.keys(CATEGORY_CONFIG) as Phrase['category'][]).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              filter === cat ? CATEGORY_CONFIG[cat].color : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
          >
            {CATEGORY_CONFIG[cat].label}
          </button>
        ))}
      </div>

      {/* Phrases Grid */}
      <div className="flex-1 p-4 grid grid-cols-2 gap-3">
        {filtered.map(phrase => {
          const config = CATEGORY_CONFIG[phrase.category]
          const translated = translatedTexts[`${phrase.id}_${selectedLang.code}`]
          const isActive = activePhrase === phrase.id

          return (
            <button
              key={phrase.id}
              onClick={() => handlePhrase(phrase)}
              disabled={!!activePhrase}
              className={cn(
                "flex flex-col items-start gap-2 p-4 rounded-2xl text-left shadow-sm transition-all active:scale-95",
                isActive ? "opacity-70 animate-pulse scale-95" : "",
                config.color,
                activePhrase && activePhrase !== phrase.id ? "opacity-50" : ""
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-2xl">{phrase.emoji}</span>
                {isActive && <Volume2 className="h-4 w-4 animate-pulse" />}
              </div>
              <p className="text-sm font-semibold leading-snug">{phrase.de}</p>
              {translated && (
                <p className={cn("text-xs opacity-80 leading-snug", selectedLang.rtl && "text-right w-full")}>
                  {translated}
                </p>
              )}
            </button>
          )
        })}
      </div>

      {/* Hint */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-t border-amber-200">
        <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800">
          Antippen → sofortige Übersetzung + Sprachausgabe in {selectedLang.label}
        </p>
      </div>
    </div>
  )
}
