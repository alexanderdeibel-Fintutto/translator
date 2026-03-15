/**
 * NGO Helper Home Page
 *
 * Main screen for social workers and volunteers.
 * Optimized for field and counseling use:
 * 1. Quick-activate: Start translation for current client
 * 2. Conversation: 1:1 bilingual counseling session
 * 3. Text translator: Documents, forms, letters
 * 4. Manage: Session admin
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Settings, MessageSquare, Zap, ArrowRight, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

export default function NgoHelperHomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useUser()
  const [activateCode, setActivateCode] = useState('')

  const handleActivate = (code?: string) => {
    const sessionCode = code || activateCode
    if (!sessionCode.trim()) return
    navigate(`/live/${sessionCode.trim().toUpperCase()}`, {
      state: { role: 'speaker' },
    })
  }

  const handleConversation = () => {
    navigate('/conversation')
  }

  const handleTranslator = () => {
    navigate('/translator')
  }

  const handleManage = () => {
    navigate('/admin/sessions')
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30">
          <Heart className="h-7 w-7 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold">Refugee Translator</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || 'Kommunikation ohne Sprachbarriere'}
        </p>
      </div>

      {/* Quick Activate — Primary Action */}
      <Card className="p-6 space-y-4 border-orange-200 dark:border-orange-800">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          <h2 className="font-semibold">Beratung starten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Session-Code eingeben und die Live-Uebersetzung fuer Ihr Gespraech starten.
        </p>
        <SessionCodeInput
          onSubmit={(code) => handleActivate(code)}
        />
        <Button
          onClick={() => handleActivate()}
          disabled={!activateCode.trim()}
          className="w-full bg-orange-600 hover:bg-orange-700"
          size="lg"
        >
          Beratung starten
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Secondary Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleConversation}
        >
          <div className="space-y-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Gespraech</p>
            <p className="text-xs text-muted-foreground">
              1:1 Beratung
            </p>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleTranslator}
        >
          <div className="space-y-2">
            <Languages className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Texte</p>
            <p className="text-xs text-muted-foreground">
              Dokumente & Antraege
            </p>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleManage}
        >
          <div className="space-y-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Verwalten</p>
            <p className="text-xs text-muted-foreground">
              Sessions & Team
            </p>
          </div>
        </Card>
      </div>

      {/* Info hint */}
      <p className="text-xs text-muted-foreground text-center max-w-xs mx-auto">
        Ihr Klient oeffnet die Refugee Translator App und gibt den Session-Code ein, um in seiner Sprache mitzulesen.
      </p>
    </div>
  )
}
