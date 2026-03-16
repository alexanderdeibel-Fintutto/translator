/**
 * Medical Patient Join Page
 *
 * Simple join screen for patients. Includes visual pain scale
 * that can be used even before joining a session.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import LanguageFlags from '@/components/live/LanguageFlags'
import PainScale from '@/components/market/PainScale'

export default function MedicalPatientJoinPage() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [painLevel, setPainLevel] = useState<number | null>(null)

  const handleJoin = (sessionCode?: string) => {
    const c = sessionCode || code
    if (!c.trim()) return
    navigate(`/${c.trim().toUpperCase()}`)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30">
            <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold">Medical Translator</h1>
          <p className="text-sm text-muted-foreground">
            Understand your doctor — in your language
          </p>
        </div>

        {/* Language selection */}
        <LanguageFlags onSelect={() => {}} maxVisible={12} />

        {/* Join form */}
        <Card className="p-6 space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            Enter the code from your doctor or nurse
          </p>
          <SessionCodeInput onSubmit={handleJoin} />
          <Button
            onClick={() => handleJoin()}
            disabled={!code.trim()}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            Join
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        {/* Pain Scale — usable standalone */}
        <PainScale
          onSelect={(value) => setPainLevel(value)}
          selected={painLevel}
          compact
        />

        <p className="text-xs text-muted-foreground text-center">
          No account needed. Your data is not stored.
        </p>
      </div>
    </div>
  )
}
