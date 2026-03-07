/**
 * Listener Join Page
 *
 * Single-screen entry point for the listener app.
 * User enters a session code (or arrives via QR code deep link)
 * and selects their preferred language.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Headphones, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageChips from '@/components/live/LanguageChips'
import { useI18n } from '@/context/I18nContext'

export default function ListenerJoinPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [sessionCode, setSessionCode] = useState('')
  const [language, setLanguage] = useState('en')

  const handleJoin = () => {
    if (!sessionCode.trim()) return
    navigate(`/${sessionCode.trim().toUpperCase()}`, {
      state: { listenerLang: language },
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
          <Headphones className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold">Fintutto Live</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('listener.subtitle') || 'Live-Übersetzung empfangen'}
        </p>
      </div>

      <Card className="w-full max-w-sm p-6 space-y-6">
        {/* Session Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('liveSession.sessionCode') || 'Session-Code'}
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
          <label className="text-sm font-medium">
            {t('liveSession.chooseLanguage') || 'Deine Sprache'}
          </label>
          <LanguageChips selected={language} onSelect={setLanguage} />
        </div>

        {/* Join Button */}
        <Button
          onClick={handleJoin}
          disabled={!sessionCode.trim()}
          className="w-full"
          size="lg"
        >
          {t('liveSession.join') || 'Beitreten'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 text-center max-w-xs">
        {t('listener.hint') || 'Gib den Code ein, den du vom Veranstalter erhalten hast, oder scanne den QR-Code.'}
      </p>
    </div>
  )
}
