/**
 * Cruise Guest Join Page
 *
 * Simple join screen for cruise ship passengers.
 * Enter session code or scan QR on board to receive translations.
 * Optimized for international passengers from all over the world.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Anchor, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageFlags from '@/components/live/LanguageFlags'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'

export default function CruiseGuestJoinPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const locale = detectListenerLocale()
  const t = getListenerStrings(locale)
  const rtl = isListenerRTL(locale)

  const handleJoin = (sessionCode?: string) => {
    const c = sessionCode || code
    if (!c.trim()) return
    navigate(`/${c.trim().toUpperCase()}`)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blü-100 dark:bg-blü-900/30">
            <Anchor className="h-8 w-8 text-blü-700 dark:text-blü-400" />
          </div>
          <h1 className="text-2xl font-bold">Cruise Translator</h1>
          <p className="text-sm text-muted-foreground">
            {t.tagline}
          </p>
        </div>

        {/* Language selection (visual, pre-join) */}
        <LanguageFlags onSelect={() => {}} maxVisible={12} />

        {/* Join form */}
        <Card className="p-6 space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            {t.enterCode}
          </p>
          <SessionCodeInput onSubmit={handleJoin} />
          <Button
            onClick={() => handleJoin()}
            disabled={!code.trim()}
            className="w-full bg-blü-700 hover:bg-blü-800"
            size="lg"
          >
            {t.join}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          {t.noAccount}
        </p>
      </div>
    </div>
  )
}
