/**
 * NGO Client Join Page
 *
 * Entry point for refugees/asylum seekers.
 * Extra-simple design with multilingual hints.
 * Large touch targets for accessibility.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageChips from '@/components/live/LanguageChips'

export default function NgoClientJoinPage() {
  const navigate = useNavigate()
  const [sessionCode, setSessionCode] = useState('')
  const [language, setLanguage] = useState('ar')

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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 mb-4">
          <Heart className="h-8 w-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold">Refugee Translator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verstehe die Beratung in deiner Sprache
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
            Deine Sprache / Your language / لغتك
          </label>
          <LanguageChips selected={language} onSelect={setLanguage} showLive />
        </div>

        {/* Join Button */}
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

      <p className="text-xs text-muted-foreground mt-6 text-center max-w-xs">
        Gib den Code ein, den du von deinem Berater erhalten hast.
      </p>
    </div>
  )
}
