/**
 * School Student Join Page
 *
 * Entry point for students. School-branded version of the listener join page.
 * Simplified language and friendly design for younger users.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageChips from '@/components/live/LanguageChips'
import { useI18n } from '@/context/I18nContext'

export default function SchoolStudentJoinPage() {
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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-4">
          <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold">School Translator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Folge dem Unterricht in deiner Sprache
        </p>
      </div>

      <Card className="w-full max-w-sm p-6 space-y-6">
        {/* Session Code Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Code von deinem Lehrer
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
            Deine Sprache
          </label>
          <LanguageChips selected={language} onSelect={setLanguage} showLive />
        </div>

        {/* Join Button */}
        <Button
          onClick={handleJoin}
          disabled={!sessionCode.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          Mitmachen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 text-center max-w-xs">
        Gib den Code ein, den dein Lehrer dir gesagt hat, oder scanne den QR-Code an der Tafel.
      </p>
    </div>
  )
}
