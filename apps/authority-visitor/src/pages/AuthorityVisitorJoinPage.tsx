/**
 * Authority Visitor Join Page
 *
 * Entry point for government office visitors.
 * Formal, clear design with flag-based language selection,
 * privacy banner, and accessibility toggle.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageFlags from '@/components/live/LanguageFlags'
import PrivacyBanner from '@/components/market/PrivacyBanner'
import { LargeTextToggle } from '@/components/market/AccessibilityToggle'
import { detectBrowserLanguage } from '@/hooks/useLanguageDetect'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'

/** Priority languages for government office visitors */
const AUTHORITY_PRIORITY_LANGS = ['de', 'en', 'tr', 'ar', 'fa', 'uk', 'ru', 'pl', 'ro', 'sq', 'ku', 'fr']

export default function AuthorityVisitorJoinPage() {
  const navigate = useNavigate()
  const [sessionCode, setSessionCode] = useState('')
  const [language, setLanguage] = useState(() => detectBrowserLanguage())
  const locale = detectListenerLocale()
  const t = getListenerStrings(locale)
  const rtl = isListenerRTL(locale)

  const normalizeCode = (raw: string): string => {
    const cleaned = raw.trim().toUpperCase()
    return cleaned.startsWith('TR-') ? cleaned : `TR-${cleaned}`
  }

  const handleJoin = () => {
    if (!sessionCode.trim()) return
    const code = normalizeCode(sessionCode)
    navigate(`/${code}`, {
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
          <Building2 className="h-8 w-8 text-teal-700 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl font-bold">Amt Translator</h1>
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
          <form onSubmit={(e) => { e.preventDefault(); handleJoin() }}>
            <input
              type="text"
              value={sessionCode}
              onChange={e => setSessionCode(e.target.value.toUpperCase())}
              placeholder="TR-XXXX"
              className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={7}
              autoFocus
            />
          </form>
        </div>

        {/* Language Selection — Flag Grid */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
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
          disabled={sessionCode.trim().length < 4}
          className="w-full bg-teal-700 hover:bg-teal-800"
          size="lg"
        >
          {t.join}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Privacy Banner */}
      <div className="w-full max-w-sm mt-6">
        <PrivacyBanner compact />
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
        Geben Sie den Code ein, den Sie am Schalter erhalten haben, oder scannen Sie den QR-Code.
      </p>
    </div>
  )
}
