/**
 * Authority Visitor Join Page
 *
 * Entry point for government office visitors.
 * Formal, clear design. Multi-language hints for common visitor languages.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageChips from '@/components/live/LanguageChips'

export default function AuthorityVisitorJoinPage() {
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4">
          <Building2 className="h-8 w-8 text-teal-700 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl font-bold">Amt Translator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verstehen Sie Ihren Termin — in Ihrer Sprache
        </p>
      </div>

      <Card className="w-full max-w-sm p-6 space-y-6">
        {/* Session Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Code vom Schalter
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
            Ihre Sprache / Your language
          </label>
          <LanguageChips selected={language} onSelect={setLanguage} showLive />
        </div>

        {/* Join Button */}
        <Button
          onClick={handleJoin}
          disabled={!sessionCode.trim()}
          className="w-full bg-teal-700 hover:bg-teal-800"
          size="lg"
        >
          Starten
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 text-center max-w-xs">
        Geben Sie den Code ein, den Sie am Schalter erhalten haben, oder scannen Sie den QR-Code.
      </p>
    </div>
  )
}
