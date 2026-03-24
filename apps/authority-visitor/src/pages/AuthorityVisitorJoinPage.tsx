/**
 * Authority Visitor Join Page — AmtTranslator (Bürger)
 *
 * Ultra-accessible entry screen for government office visitors.
 * BITV 2.0 compliant: large text, high contrast, RTL support, screen reader.
 * Supports URL param ?code=XXXX for QR-code direct join.
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Building2, ArrowRight, Globe, ZoomIn, ZoomOut, Sun, Moon, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageFlags from '@/components/live/LanguageFlags'
import PrivacyBanner from '@/components/market/PrivacyBanner'
import { LargeTextToggle } from '@/components/market/AccessibilityToggle'
import { detectBrowserLanguage } from '@/hooks/useLanguageDetect'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'

/** Priority languages for government office visitors — covers 95% of cases in Germany */
const AUTHORITY_PRIORITY_LANGS = [
  'de', 'en', 'tr', 'ar', 'fa', 'uk', 'ru', 'pl', 'ro', 'sq', 'ku', 'fr',
  'so', 'ti', 'am', 'ps', 'ur', 'vi', 'sr', 'hr', 'bs', 'mk', 'bg',
]

/** Multilingual welcome messages */
const WELCOME_MESSAGES: Record<string, string> = {
  de: 'Willkommen',
  en: 'Welcome',
  tr: 'Hoş geldiniz',
  ar: 'أهلاً وسهلاً',
  fa: 'خوش آمدید',
  uk: 'Ласкаво просимо',
  ru: 'Добро пожаловать',
  pl: 'Witamy',
  ro: 'Bun venit',
  sq: 'Mirë se vini',
  ku: 'Xêr hatî',
  fr: 'Bienvenue',
  so: 'Soo dhawoow',
  am: 'እንኳን ደህና መጡ',
  ps: 'ښه راغلاست',
  ur: 'خوش آمدید',
  vi: 'Chào mừng',
  sr: 'Добродошли',
}

export default function AuthorityVisitorJoinPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [sessionCode, setSessionCode] = useState(searchParams.get('code') || '')
  const [language, setLanguage] = useState(() => detectBrowserLanguage())
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal')
  const [highContrast, setHighContrast] = useState(false)

  const locale = detectListenerLocale()
  const t = getListenerStrings(locale)
  const rtl = isListenerRTL(locale)
  const welcomeMsg = WELCOME_MESSAGES[language] || WELCOME_MESSAGES['en']

  // Auto-join if code is in URL
  useEffect(() => {
    const urlCode = searchParams.get('code')
    if (urlCode && urlCode.length >= 4) {
      setTimeout(() => {
        navigate(`/${urlCode.toUpperCase()}`, { state: { listenerLang: language } })
      }, 600)
    }
  }, [])

  const handleJoin = () => {
    if (!sessionCode.trim()) return
    navigate(`/${sessionCode.trim().toUpperCase()}`, {
      state: { listenerLang: language },
    })
  }

  const fontSizeClass =
    fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base'

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors ${
        highContrast ? 'bg-black text-white' : 'bg-background'
      } ${fontSizeClass}`}
      dir={rtl ? 'rtl' : 'ltr'}
      lang={language}
    >
      {/* Accessibility toolbar — BITV 2.0 */}
      <div
        className={`fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 border-b z-50 ${
          highContrast ? 'bg-black border-white' : 'bg-background border-border'
        }`}
        role="toolbar"
        aria-label="Barrierefreiheit"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setFontSize((f) => (f === 'normal' ? 'large' : f === 'large' ? 'xlarge' : 'normal'))
            }
            className={`p-2 rounded-lg transition-colors ${
              highContrast ? 'hover:bg-white/20' : 'hover:bg-accent'
            }`}
            aria-label="Schriftgröße ändern"
            title="Schriftgröße"
          >
            {fontSize === 'xlarge' ? (
              <ZoomOut className="h-5 w-5" />
            ) : (
              <ZoomIn className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`p-2 rounded-lg transition-colors ${
              highContrast ? 'hover:bg-white/20' : 'hover:bg-accent'
            }`}
            aria-label="Hoher Kontrast umschalten"
            title="Kontrast"
          >
            {highContrast ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
        <LargeTextToggle />
      </div>

      {/* Main content */}
      <div className="w-full max-w-sm mt-16 space-y-6">
        {/* Branding */}
        <div className="text-center" role="banner">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 ${
              highContrast ? 'bg-white' : 'bg-teal-100 dark:bg-teal-900/30'
            }`}
          >
            <Building2
              className={`h-10 w-10 ${
                highContrast ? 'text-black' : 'text-teal-700 dark:text-teal-400'
              }`}
              aria-hidden="true"
            />
          </div>
          <h1
            className={`font-bold ${
              fontSize === 'xlarge' ? 'text-4xl' : fontSize === 'large' ? 'text-3xl' : 'text-2xl'
            }`}
          >
            AmtTranslator
          </h1>
          <p
            className={`mt-1 ${
              highContrast ? 'text-white/80' : 'text-muted-foreground'
            } ${fontSize === 'xlarge' ? 'text-xl' : 'text-sm'}`}
          >
            {welcomeMsg}
          </p>
        </div>

        <Card
          className={`p-6 space-y-6 ${
            highContrast ? 'bg-gray-900 border-white text-white' : ''
          }`}
          role="main"
        >
          {/* Session Code Input */}
          <div className="space-y-2">
            <label
              className={`font-medium ${
                fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-sm'
              }`}
            >
              {t.enterCode}
            </label>
            <SessionCodeInput
              onSubmit={(code) => {
                setSessionCode(code)
                if (code) handleJoin()
              }}
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <label
              className={`font-medium flex items-center gap-2 ${
                fontSize === 'xlarge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-sm'
              }`}
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              {t.chooseLanguage}
            </label>
            <LanguageFlags
              selected={language}
              onSelect={setLanguage}
              priorityCodes={AUTHORITY_PRIORITY_LANGS}
            />
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoin}
            disabled={!sessionCode.trim()}
            className={`w-full ${
              highContrast
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-teal-700 hover:bg-teal-800'
            } ${fontSize === 'xlarge' ? 'h-16 text-xl' : fontSize === 'large' ? 'h-14 text-lg' : ''}`}
            size="lg"
          >
            {t.join}
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Button>
        </Card>

        {/* Privacy Banner */}
        <PrivacyBanner compact />

        {/* QR hint */}
        <div className={`flex items-start gap-2 justify-center ${
          highContrast ? 'text-white/70' : 'text-muted-foreground'
        }`}>
          <QrCode className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <p className={fontSize === 'xlarge' ? 'text-base' : 'text-xs'}>
            Geben Sie den Code ein, den Sie am Schalter erhalten haben, oder scannen Sie den QR-Code.
          </p>
        </div>
      </div>
    </div>
  )
}
