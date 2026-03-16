/**
 * School Student Join Page
 *
 * Entry point for students. School-branded with flag-based
 * language selection and accessibility toggle.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageFlags from '@/components/live/LanguageFlags'
import { LargeTextToggle } from '@/components/market/AccessibilityToggle'
import { detectBrowserLanguage } from '@/hooks/useLanguageDetect'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'

/** Priority languages for school contexts (common student languages in Germany) */
const SCHOOL_PRIORITY_LANGS = ['de', 'en', 'tr', 'ar', 'uk', 'ru', 'pl', 'fa', 'ku', 'ro', 'sq', 'fr', 'es']

export default function SchoolStudentJoinPage() {
  const navigate = useNavigate()
  const [sessionCode, setSessionCode] = useState('')
  const [language, setLanguage] = useState(() => detectBrowserLanguage())
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold">School Translator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.tagline}
        </p>
      </div>

      <Card className="w-full max-w-sm p-6 space-y-6">
        {/* Session Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t.enterCode}
          </label>
          <SessionCodeInput
            onSubmit={(code) => handleJoin(code)}
          />
        </div>

        {/* Language Selection — Flag Grid */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t.chooseLanguage}
          </label>
          <LanguageFlags
            selected={language}
            onSelect={setLanguage}
            priorityCodes={SCHOOL_PRIORITY_LANGS}
          />
        </div>

        {/* Join Button */}
        <Button
          onClick={handleJoin}
          disabled={!sessionCode.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {t.join}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 text-center max-w-xs">
        Gib den Code ein, den dein Lehrer dir gesagt hat, oder scanne den QR-Code an der Tafel.
      </p>
    </div>
  )
}
