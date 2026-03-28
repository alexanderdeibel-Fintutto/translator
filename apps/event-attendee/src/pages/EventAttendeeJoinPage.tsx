/**
 * Event Attendee Join Page
 *
 * Simple join screen for event guests / visitors.
 * Enter session code or scan QR at the event to receive live translations.
 * Works for any event: festivals, exhibitions, sports, guided tours, workshops.
 *
 * Target: event-attendee.fintutto.world
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ArrowRight, CheckCircle2, Headphones, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageFlags from '@/components/live/LanguageFlags'
import { getListenerStrings, detectListenerLocale, isListenerRTL } from '@/lib/listener-i18n'

export default function EventAttendeeJoinPage() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30">
            <Calendar className="h-8 w-8 text-rose-700 dark:text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold">Event Translator</h1>
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
            className="w-full bg-rose-700 hover:bg-rose-800"
            size="lg"
          >
            {t.join}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        {/* Hints */}
        <div className="space-y-2">
          {[
            { icon: CheckCircle2, text: t.noAccount, color: 'text-green-600' },
            { icon: Headphones, text: t.ownHeadphones ?? 'Eigene Kopfhörer empfohlen', color: 'text-rose-600' },
            { icon: WifiOff, text: t.worksOffline ?? 'Funktioniert auch offline', color: 'text-orange-600' },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-3 px-1">
              <Icon className={`h-4 w-4 ${color} shrink-0`} />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-muted-foreground">
            Powered by <span className="font-semibold text-rose-600">Fintutto Event</span>
          </p>
        </div>
      </div>
    </div>
  )
}
