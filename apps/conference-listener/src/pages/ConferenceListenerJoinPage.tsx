/**
 * ConferenceListenerJoinPage — Fintutto Conference Translator (Teilnehmer/BYOD)
 *
 * KONZEPT (Revision März 2026):
 * Teilnehmer scannen QR-Code am Platz → landen hier
 * Primär: Sprache wählen → sofort hören (kein Account, kein Login)
 * BYOD: Eigenes Smartphone, eigene Kopfhörer
 * Offline-fähig: Wenn Edge-Server im Saal → funktioniert ohne Internet
 *
 * UX-Prinzipien:
 * - Max. 2 Taps bis zur Übersetzung
 * - Sprache automatisch aus Browser-Einstellungen
 * - Große Buttons (Tablet + Smartphone)
 * - Mehrsprachige UI
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Headphones, ChevronDown, Radio, WifiOff, Wifi,
  Zap, CheckCircle2, ArrowRight, Volume2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'

const LANGUAGES = [
  { code: 'ar', label: 'العربية',    flag: '🇸🇦', rtl: true,  name: 'Arabisch',      join: 'استمع الآن' },
  { code: 'tr', label: 'Türkçe',     flag: '🇹🇷', rtl: false, name: 'Türkisch',      join: 'Şimdi dinle' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦', rtl: false, name: 'Ukrainisch',    join: 'Слухати зараз' },
  { code: 'ru', label: 'Русский',    flag: '🇷🇺', rtl: false, name: 'Russisch',      join: 'Слушать сейчас' },
  { code: 'fa', label: 'فارسی',      flag: '🇮🇷', rtl: true,  name: 'Persisch',      join: 'اکنون گوش دهید' },
  { code: 'zh', label: '中文',        flag: '🇨🇳', rtl: false, name: 'Chinesisch',    join: '立即收听' },
  { code: 'ja', label: '日本語',      flag: '🇯🇵', rtl: false, name: 'Japanisch',     join: '今すぐ聴く' },
  { code: 'ko', label: '한국어',      flag: '🇰🇷', rtl: false, name: 'Koreanisch',    join: '지금 듣기' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷', rtl: false, name: 'Französisch',   join: 'Écouter maintenant' },
  { code: 'es', label: 'Español',    flag: '🇪🇸', rtl: false, name: 'Spanisch',      join: 'Escuchar ahora' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹', rtl: false, name: 'Italienisch',   join: 'Ascolta ora' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹', rtl: false, name: 'Portugiesisch', join: 'Ouvir agora' },
  { code: 'pl', label: 'Polski',     flag: '🇵🇱', rtl: false, name: 'Polnisch',      join: 'Słuchaj teraz' },
  { code: 'ro', label: 'Română',     flag: '🇷🇴', rtl: false, name: 'Rumänisch',     join: 'Ascultați acum' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', rtl: false, name: 'Niederländisch',join: 'Nu luisteren' },
  { code: 'sv', label: 'Svenska',    flag: '🇸🇪', rtl: false, name: 'Schwedisch',    join: 'Lyssna nu' },
  { code: 'da', label: 'Dansk',      flag: '🇩🇰', rtl: false, name: 'Dänisch',       join: 'Lyt nu' },
  { code: 'fi', label: 'Suomi',      flag: '🇫🇮', rtl: false, name: 'Finnisch',      join: 'Kuuntele nyt' },
  { code: 'el', label: 'Ελληνικά',   flag: '🇬🇷', rtl: false, name: 'Griechisch',    join: 'Ακούστε τώρα' },
  { code: 'cs', label: 'Čeština',    flag: '🇨🇿', rtl: false, name: 'Tschechisch',   join: 'Poslouchejte nyní' },
  { code: 'hu', label: 'Magyar',     flag: '🇭🇺', rtl: false, name: 'Ungarisch',     join: 'Hallgasson most' },
  { code: 'hr', label: 'Hrvatski',   flag: '🇭🇷', rtl: false, name: 'Kroatisch',     join: 'Slušajte sada' },
  { code: 'sk', label: 'Slovenčina', flag: '🇸🇰', rtl: false, name: 'Slowakisch',    join: 'Počúvajte teraz' },
  { code: 'bg', label: 'Български',  flag: '🇧🇬', rtl: false, name: 'Bulgarisch',    join: 'Слушайте сега' },
  { code: 'sr', label: 'Српски',     flag: '🇷🇸', rtl: false, name: 'Serbisch',      join: 'Слушајте сада' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', rtl: false, name: 'Vietnamesisch', join: 'Nghe ngay' },
  { code: 'th', label: 'ภาษาไทย',    flag: '🇹🇭', rtl: false, name: 'Thailändisch',  join: 'ฟังเดี๋ยวนี้' },
  { code: 'id', label: 'Indonesia',  flag: '🇮🇩', rtl: false, name: 'Indonesisch',   join: 'Dengarkan sekarang' },
  { code: 'hi', label: 'हिन्दी',      flag: '🇮🇳', rtl: false, name: 'Hindi',         join: 'अभी सुनें' },
  { code: 'bn', label: 'বাংলা',       flag: '🇧🇩', rtl: false, name: 'Bengalisch',    join: 'এখন শুনুন' },
  { code: 'ur', label: 'اردو',        flag: '🇵🇰', rtl: true,  name: 'Urdu',          join: 'ابھی سنیں' },
  { code: 'ps', label: 'پښتو',        flag: '🇦🇫', rtl: true,  name: 'Pashto',        join: 'اوس واورئ' },
  { code: 'so', label: 'Soomaali',   flag: '🇸🇴', rtl: false, name: 'Somali',        join: 'Dhageyso hadda' },
  { code: 'ti', label: 'ትግርኛ',        flag: '🇪🇷', rtl: false, name: 'Tigrinya',      join: 'ሕጂ ስምዑ' },
  { code: 'am', label: 'አማርኛ',        flag: '🇪🇹', rtl: false, name: 'Amharisch',     join: 'አሁን ያዳምጡ' },
  { code: 'sw', label: 'Kiswahili',  flag: '🇰🇪', rtl: false, name: 'Swahili',       join: 'Sikiliza sasa' },
  { code: 'he', label: 'עברית',       flag: '🇮🇱', rtl: true,  name: 'Hebräisch',     join: 'האזן עכשיו' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪', rtl: false, name: 'Deutsch',       join: 'Jetzt zuhören' },
  { code: 'en', label: 'English',    flag: '🇬🇧', rtl: false, name: 'Englisch',      join: 'Listen now' },
]

export default function ConferenceListenerJoinPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const browserLang = navigator.language.split('-')[0]
  const defaultLang = LANGUAGES.find(l => l.code === browserLang) || LANGUAGES.find(l => l.code === 'en')!

  const [selectedLang, setSelectedLang] = useState(defaultLang)
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [sessionCode, setSessionCode] = useState(searchParams.get('code') || '')
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

  const handleJoin = () => {
    if (!sessionCode.trim()) return
    navigate(`/${sessionCode.trim().toUpperCase()}`, {
      state: { listenerLang: selectedLang.code }
    })
  }

  const langLabel = (key: string) => {
    const lc = selectedLang.code
    const map: Record<string, Record<string, string>> = {
      chooseLanguage: { ar: 'اختر لغتك', tr: 'Dilinizi seçin', uk: 'Оберіть мову', ru: 'Выберите язык', zh: '选择您的语言', fr: 'Choisissez votre langue', es: 'Elige tu idioma', default: 'Choose your language' },
      enterCode:      { ar: 'أدخل رمز الجلسة', tr: 'Oturum kodunu girin', uk: 'Введіть код сесії', ru: 'Введите код сессии', zh: '输入会议代码', fr: 'Entrez le code', es: 'Ingrese el código', default: 'Enter session code' },
      noAccount:      { ar: 'لا حاجة لتسجيل حساب', tr: 'Hesap gerekmez', ru: 'Аккаунт не нужен', zh: '无需注册账户', fr: 'Aucun compte requis', es: 'Sin cuenta necesaria', default: 'No account required' },
      ownHeadphones:  { ar: 'استخدم سماعاتك الخاصة', tr: 'Kendi kulaklığınızı kullanın', ru: 'Используйте свои наушники', zh: '使用您自己的耳机', fr: 'Utilisez vos propres écouteurs', es: 'Usa tus propios auriculares', default: 'Use your own headphones' },
      worksOffline:   { ar: 'يعمل بدون إنترنت', tr: 'İnternet olmadan çalışır', ru: 'Работает без интернета', zh: '无需互联网', fr: 'Fonctionne hors ligne', es: 'Funciona sin internet', default: 'Works offline in the venue' },
    }
    return map[key]?.[lc] ?? map[key]?.['default'] ?? key
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950" dir={rtl ? 'rtl' : 'ltr'}>

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white px-5 pt-8 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 mb-4">
          <Headphones className="h-8 w-8 text-blue-300" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Conference Translator</h1>
        <p className="text-sm text-slate-300">
          {selectedLang.code === 'ar' ? 'استمع إلى الترجمة الفورية' :
           selectedLang.code === 'tr' ? 'Canlı çeviriyi dinleyin' :
           selectedLang.code === 'uk' ? 'Слухайте живий переклад' :
           selectedLang.code === 'ru' ? 'Слушайте живой перевод' :
           selectedLang.code === 'zh' ? '收听实时翻译' :
           selectedLang.code === 'fr' ? 'Écoutez la traduction en direct' :
           selectedLang.code === 'es' ? 'Escuche la traducción en vivo' :
           'Live translation — no app needed'}
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge className={`text-xs ${isOnline ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'}`}>
            {isOnline ? <><Wifi className="h-3 w-3 mr-1" />Online</> : <><WifiOff className="h-3 w-3 mr-1" />Offline</>}
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
            <Zap className="h-3 w-3 mr-1" />{langLabel('noAccount')}
          </Badge>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4 max-w-sm mx-auto w-full">

        {/* ── Sprach-Auswahl ── */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            {langLabel('chooseLanguage')}
          </p>
          <button
            onClick={() => setShowLangPicker(p => !p)}
            className="w-full flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500 shadow-sm"
          >
            <span className="text-4xl">{selectedLang.flag}</span>
            <div className={`flex-1 ${rtl ? 'text-right' : 'text-left'}`}>
              <div className="font-bold text-lg">{selectedLang.name}</div>
              <div className="text-sm text-muted-foreground">{selectedLang.label}</div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${showLangPicker ? 'rotate-180' : ''}`} />
          </button>

          {showLangPicker && (
            <div className="mt-2 bg-white dark:bg-slate-900 rounded-2xl border shadow-lg overflow-hidden">
              <div className="grid grid-cols-2 gap-1 p-2 max-h-72 overflow-y-auto">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { setSelectedLang(lang); setShowLangPicker(false) }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all active:scale-95 ${
                      selectedLang.code === lang.code
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <div className="text-sm font-medium">{lang.name}</div>
                      <div className={`text-xs ${selectedLang.code === lang.code ? 'text-blue-200' : 'text-muted-foreground'}`}>{lang.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Session-Code ── */}
        {!searchParams.get('code') && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              {langLabel('enterCode')}
            </p>
            <input
              type="text"
              value={sessionCode}
              onChange={e => setSessionCode(e.target.value.toUpperCase())}
              placeholder="z.B. MAIN"
              className="w-full text-center text-3xl font-mono font-bold tracking-widest border-2 rounded-2xl px-4 py-4 bg-white dark:bg-slate-900 uppercase focus:border-blue-500 focus:outline-none"
              maxLength={8}
            />
          </div>
        )}

        {/* ── Join-Button ── */}
        <button
          onClick={handleJoin}
          disabled={!sessionCode.trim()}
          className={`w-full rounded-2xl py-6 font-bold text-white text-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
            sessionCode.trim()
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
          }`}
        >
          <Volume2 className="h-6 w-6" />
          {selectedLang.join}
          <ArrowRight className="h-6 w-6" />
        </button>

        {/* ── Hinweise ── */}
        <div className="space-y-2">
          {[
            { icon: CheckCircle2, text: langLabel('noAccount'), color: 'text-green-600' },
            { icon: Headphones, text: langLabel('ownHeadphones'), color: 'text-blue-600' },
            { icon: WifiOff, text: langLabel('worksOffline'), color: 'text-orange-600' },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-3 px-1">
              <Icon className={`h-4 w-4 ${color} shrink-0`} />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-semibold text-blue-600">Fintutto Conference</span>
          </p>
        </div>

      </div>
    </div>
  )
}
