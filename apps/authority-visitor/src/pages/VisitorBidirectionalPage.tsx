/**
 * Visitor Bidirectional Page — AmtTranslator (Besucher-App)
 *
 * Bidirektionale Übersetzung für Besucher auf dem eigenen Smartphone.
 * Der Bürger kann sowohl hören (Sachbearbeiter → Bürger) als auch sprechen
 * (Bürger → Sachbearbeiter), wenn er am eigenen Gerät ist.
 *
 * Zwei Modi:
 *   1. Empfangen: Übersetzung vom Tablett empfangen und anhören
 *   2. Sprechen: In eigener Sprache sprechen → Übersetzung auf Tablett
 *
 * Design: Groß, klar, hoher Kontrast — für Menschen mit eingeschränkten
 * Deutschkenntnissen. RTL-Support für Arabisch/Persisch/Pashto/Urdu.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowLeft,
  ChevronDown,
  Shield,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { translateText } from '@/lib/translate'
import { speakText } from '@/lib/tts'
import { createWebSpeechEngine } from '@/lib/stt'

const LANGUAGES = [
  { code: 'ar', bcp47: 'ar-SA', label: 'العربية', flag: '🇸🇦', rtl: true,
    speak: 'اضغط مع الاستمرار وتحدث', listening: '…تسجيل', translate: 'جاري الترجمة…' },
  { code: 'tr', bcp47: 'tr-TR', label: 'Türkçe', flag: '🇹🇷', rtl: false,
    speak: 'Basılı tutun ve konuşun', listening: 'Kaydediliyor…', translate: 'Çevriliyor…' },
  { code: 'uk', bcp47: 'uk-UA', label: 'Українська', flag: '🇺🇦', rtl: false,
    speak: 'Утримуйте та говоріть', listening: 'Запис…', translate: 'Перекладаємо…' },
  { code: 'ru', bcp47: 'ru-RU', label: 'Русский', flag: '🇷🇺', rtl: false,
    speak: 'Держите и говорите', listening: 'Запись…', translate: 'Перевод…' },
  { code: 'fa', bcp47: 'fa-IR', label: 'فارسی', flag: '🇮🇷', rtl: true,
    speak: 'نگه دارید و صحبت کنید', listening: '…ضبط', translate: '…ترجمه' },
  { code: 'ps', bcp47: 'ps-AF', label: 'پښتو', flag: '🇦🇫', rtl: true,
    speak: 'ونیسئ او خبرې وکړئ', listening: '…ریکارډ', translate: '…ژباړه' },
  { code: 'so', bcp47: 'so-SO', label: 'Soomaali', flag: '🇸🇴', rtl: false,
    speak: 'Riix oo hadal', listening: 'Duubista…', translate: 'Turjumida…' },
  { code: 'fr', bcp47: 'fr-FR', label: 'Français', flag: '🇫🇷', rtl: false,
    speak: 'Maintenez et parlez', listening: 'Enregistrement…', translate: 'Traduction…' },
  { code: 'ro', bcp47: 'ro-RO', label: 'Română', flag: '🇷🇴', rtl: false,
    speak: 'Apăsați și vorbiți', listening: 'Înregistrare…', translate: 'Traducere…' },
  { code: 'pl', bcp47: 'pl-PL', label: 'Polski', flag: '🇵🇱', rtl: false,
    speak: 'Przytrzymaj i mów', listening: 'Nagrywanie…', translate: 'Tłumaczenie…' },
  { code: 'vi', bcp47: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳', rtl: false,
    speak: 'Giữ và nói', listening: 'Đang ghi…', translate: 'Đang dịch…' },
  { code: 'zh', bcp47: 'zh-CN', label: '中文', flag: '🇨🇳', rtl: false,
    speak: '按住说话', listening: '录音中…', translate: '翻译中…' },
  { code: 'hi', bcp47: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳', rtl: false,
    speak: 'दबाकर बोलें', listening: 'रिकॉर्डिंग…', translate: 'अनुवाद…' },
  { code: 'ur', bcp47: 'ur-PK', label: 'اردو', flag: '🇵🇰', rtl: true,
    speak: 'دبائیں اور بولیں', listening: '…ریکارڈنگ', translate: '…ترجمہ' },
  { code: 'de', bcp47: 'de-DE', label: 'Deutsch', flag: '🇩🇪', rtl: false,
    speak: 'Halten und sprechen', listening: 'Aufnahme…', translate: 'Übersetze…' },
]

const DEFAULT_LANG = LANGUAGES[0] // Arabic

export default function VisitorBidirectionalPage() {
  const { code } = useParams<{ code?: string }>()
  const navigate = useNavigate()

  const [myLang, setMyLang] = useState(DEFAULT_LANG)
  const [showLangPicker, setShowLangPicker] = useState(!code) // Show picker if no code
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [lastTranslation, setLastTranslation] = useState('')
  const [lastOriginal, setLastOriginal] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const sttRef = useRef(createWebSpeechEngine())
  const isRecordingRef = useRef(false)

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    return () => { sttRef.current.stop() }
  }, [])

  const translateAndSpeak = useCallback(async (text: string) => {
    if (!text.trim()) return
    setIsTranslating(true)
    setLastOriginal(text)
    try {
      // Visitor speaks their language → translate to German
      const result = await translateText(text, myLang.code, 'de')
      setLastTranslation(result.translatedText)
      // Speak German translation (for the clerk to hear via device speaker)
      if (!isMuted) {
        await speakText(result.translatedText, 'de-DE')
      }
    } catch (err) {
      console.error('Translation error:', err)
    } finally {
      setIsTranslating(false)
      setInterimText('')
    }
  }, [myLang, isMuted])

  const startRecording = useCallback(() => {
    if (isRecordingRef.current) return
    isRecordingRef.current = true
    setIsRecording(true)
    setInterimText('')
    setLastTranslation('')

    sttRef.current.start(
      myLang.bcp47,
      (result) => {
        if (result.isFinal) {
          isRecordingRef.current = false
          setIsRecording(false)
          translateAndSpeak(result.text)
        } else {
          setInterimText(result.text)
        }
      },
      (error) => {
        console.error('STT error:', error)
        isRecordingRef.current = false
        setIsRecording(false)
        setInterimText('')
      }
    )
  }, [myLang, translateAndSpeak])

  const stopRecording = useCallback(() => {
    sttRef.current.stop()
    isRecordingRef.current = false
    setIsRecording(false)
  }, [])

  const isRTL = myLang.rtl

  // ─── Language Picker ──────────────────────────────────────────────────────
  if (showLangPicker) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b">
          {code && (
            <button onClick={() => setShowLangPicker(false)} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold">AmtTranslator</h1>
            <p className="text-sm text-muted-foreground">Sprache wählen / Choose language</p>
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 p-4 grid grid-cols-2 gap-3 overflow-y-auto">
          {LANGUAGES.filter(l => l.code !== 'de').map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setMyLang(lang)
                setShowLangPicker(false)
              }}
              className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all active:scale-95 ${
                myLang.code === lang.code
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                  : 'hover:bg-accent'
              }`}
            >
              <span className="text-3xl">{lang.flag}</span>
              <span
                className="text-base font-medium"
                dir={lang.rtl ? 'rtl' : 'ltr'}
              >
                {lang.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Main Translation UI ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{myLang.flag}</span>
          <button
            onClick={() => setShowLangPicker(true)}
            className="flex items-center gap-1 text-sm font-medium"
          >
            {myLang.label}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg ${isMuted ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-muted-foreground'}`}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-6">

        {/* Session Code (if connected) */}
        {code && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Session</p>
            <p className="font-mono text-lg font-bold tracking-widest text-teal-700 dark:text-teal-400">
              {code}
            </p>
          </div>
        )}

        {/* Translation Display */}
        <div className="w-full max-w-sm space-y-4 text-center">
          {/* Interim text while recording */}
          {isRecording && interimText && (
            <div className="px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p
                className="text-base text-blue-800 dark:text-blue-200 italic"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {interimText}…
              </p>
            </div>
          )}

          {/* Translation result */}
          {lastTranslation && !isRecording && (
            <div className="space-y-2">
              {lastOriginal && (
                <p
                  className="text-sm text-muted-foreground"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {lastOriginal}
                </p>
              )}
              <div className="px-4 py-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800">
                <p className="text-lg font-medium text-teal-900 dark:text-teal-100">
                  🇩🇪 {lastTranslation}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {myLang.code === 'ar' ? 'تمت الترجمة إلى الألمانية' :
                 myLang.code === 'tr' ? 'Almancaya çevrildi' :
                 myLang.code === 'uk' ? 'Перекладено на німецьку' :
                 myLang.code === 'ru' ? 'Переведено на немецкий' :
                 myLang.code === 'fa' ? 'به آلمانی ترجمه شد' :
                 'Auf Deutsch übersetzt'}
              </p>
            </div>
          )}

          {/* Idle state */}
          {!isRecording && !isTranslating && !lastTranslation && (
            <p className="text-muted-foreground text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
              {myLang.code === 'ar' ? 'اضغط على الزر وتحدث' :
               myLang.code === 'tr' ? 'Düğmeye basın ve konuşun' :
               myLang.code === 'uk' ? 'Натисніть кнопку і говоріть' :
               myLang.code === 'ru' ? 'Нажмите кнопку и говорите' :
               myLang.code === 'fa' ? 'دکمه را فشار دهید و صحبت کنید' :
               myLang.code === 'fr' ? 'Appuyez sur le bouton et parlez' :
               'Taste drücken und sprechen'}
            </p>
          )}
        </div>

        {/* BIG Push-to-Talk Button */}
        <button
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          onPointerLeave={stopRecording}
          disabled={isTranslating}
          className={`w-40 h-40 rounded-full flex flex-col items-center justify-center gap-3 text-white font-bold text-base shadow-2xl transition-all select-none touch-none ${
            isRecording
              ? 'bg-red-600 scale-110 shadow-red-300 dark:shadow-red-900'
              : isTranslating
              ? 'bg-gray-400 cursor-wait'
              : 'bg-blue-700 hover:bg-blue-600 active:scale-95'
          } disabled:opacity-50`}
          style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
        >
          {isRecording ? (
            <>
              <Mic className="h-12 w-12 animate-pulse" />
              <span className="text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                {myLang.listening}
              </span>
            </>
          ) : isTranslating ? (
            <>
              <span className="text-2xl animate-spin">⟳</span>
              <span className="text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                {myLang.translate}
              </span>
            </>
          ) : (
            <>
              <Mic className="h-12 w-12" />
              <span className="text-sm text-center leading-tight px-2" dir={isRTL ? 'rtl' : 'ltr'}>
                {myLang.speak}
              </span>
            </>
          )}
        </button>

        {/* Muted warning */}
        {isMuted && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-xl">
            <VolumeX className="h-4 w-4" />
            <span>
              {myLang.code === 'ar' ? 'الصوت مكتوم' :
               myLang.code === 'tr' ? 'Ses kapalı' :
               myLang.code === 'uk' ? 'Звук вимкнено' :
               myLang.code === 'ru' ? 'Звук выключен' :
               'Ton ist stumm'}
            </span>
          </div>
        )}
      </div>

      {/* Privacy Footer */}
      <div className="px-4 py-3 border-t text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span dir={isRTL ? 'rtl' : 'ltr'}>
            {myLang.code === 'ar' ? 'لا يتم تخزين أي بيانات · جميع البيانات محلية' :
             myLang.code === 'tr' ? 'Veri saklanmaz · Tüm veriler yerel' :
             myLang.code === 'uk' ? 'Дані не зберігаються · Все локально' :
             myLang.code === 'ru' ? 'Данные не хранятся · Всё локально' :
             myLang.code === 'fa' ? 'داده‌ای ذخیره نمی‌شود · همه داده‌ها محلی است' :
             'Keine Datenspeicherung · Alles lokal'}
          </span>
        </div>
      </div>
    </div>
  )
}
