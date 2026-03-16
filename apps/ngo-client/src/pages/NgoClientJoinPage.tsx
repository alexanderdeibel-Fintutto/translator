/**
 * NGO Client Join Page
 *
 * Entry point for refugees/asylum seekers.
 * Extra-simple design with flag-based language selection,
 * multilingual trust signal, large touch targets.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageFlags from '@/components/live/LanguageFlags'
import TrustSignal from '@/components/market/TrustSignal'
import { LargeTextToggle } from '@/components/market/AccessibilityToggle'
import { detectBrowserLanguage } from '@/hooks/useLanguageDetect'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'

/** Priority languages for refugee contexts */
const NGO_PRIORITY_LANGS = ['ar', 'fa', 'ps', 'ku', 'tr', 'uk', 'ru', 'ti', 'am', 'so', 'ur', 'fr', 'en', 'de']

export default function NgoClientJoinPage() {
  const navigate = useNavigate()
  const [sessionCode, setSessionCode] = useState('')
  const [language, setLanguage] = useState(() => {
    const detected = detectBrowserLanguage()
    return detected === 'en' ? 'ar' : detected
  })
  const locale = detectListenerLocale()
  const t = getListenerStrings(locale)
  const rtl = isListenerRTL(locale)

  const handleJoin = (code?: string) => {
    const c = code || sessionCode
    if (!c.trim()) return
    navigate(`/${c.trim().toUpperCase()}`, {
      state: { listenerLang: language },
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4" dir={rtl ? 'rtl' : 'ltr'}>
      {/* Accessibility toggle */}
      <div className="absolute top-4 right-4">
        <LargeTextToggle />
      </div>

      {/* Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 mb-4">
          <Heart className="h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold">Refugee Translator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.tagline}
        </p>
        {/* Multilingual welcome hints */}
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Welcome</span>
          <span>Willkommen</span>
          <span dir="rtl">مرحبا</span>
          <span dir="rtl">خوش آمدید</span>
          <span>Bienvenue</span>
          <span>Hoş geldiniz</span>
        </div>
      </div>

      <Card className="w-full max-w-sm p-6 space-y-6">
        {/* Session Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Code / الرمز / کد
          </label>
          <SessionCodeInput onSubmit={handleJoin} />
        </div>

        {/* Language Selection — Flag Grid */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t.chooseLanguage}
          </label>
          <LanguageFlags
            selected={language}
            onSelect={setLanguage}
            priorityCodes={NGO_PRIORITY_LANGS}
          />
        </div>

        {/* Join Button — extra large */}
        <Button
          onClick={handleJoin}
          disabled={!sessionCode.trim()}
          className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
          size="lg"
        >
          Start
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Card>

      {/* Trust Signal */}
      <div className="w-full max-w-sm mt-6">
        <TrustSignal maxLanguages={6} />
      </div>
    </div>
  )
}
