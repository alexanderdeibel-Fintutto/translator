/**
 * Conference Listener Join Page
 *
 * Join screen for conference attendees. Scan QR or enter code.
 * Shows available channels for multi-room events.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Presentation, ArrowRight, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import LanguageFlags from '@/components/live/LanguageFlags'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'

export default function ConferenceListenerJoinPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const locale = detectListenerLocale()
  const t = getListenerStrings(locale)
  const rtl = isListenerRTL(locale)

  const handleJoin = () => {
    if (!code.trim()) return
    const normalized = code.trim().toUpperCase().startsWith('TR-') ? code.trim().toUpperCase() : `TR-${code.trim().toUpperCase()}`
    navigate(`/${normalized}`)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            <Presentation className="h-8 w-8 text-blue-700 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold">Conference Translator</h1>
          <p className="text-sm text-muted-foreground">
            {t.tagline}
          </p>
        </div>

        {/* Language selection */}
        <LanguageFlags onSelect={() => {}} maxVisible={12} />

        {/* Join form */}
        <Card className="p-6 space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            {t.enterCode}
          </p>
          <form onSubmit={(e) => { e.preventDefault(); handleJoin() }}>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="TR-XXXX"
              className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={7}
              autoFocus
            />
          </form>
          <Button
            onClick={() => handleJoin()}
            disabled={code.trim().length < 4}
            className="w-full bg-blue-700 hover:bg-blue-800"
            size="lg"
          >
            <Radio className="mr-2 h-4 w-4" />
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
