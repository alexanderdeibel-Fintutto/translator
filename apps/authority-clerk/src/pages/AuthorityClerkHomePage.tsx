/**
 * Authority Clerk Home Page
 *
 * Main screen for government office clerks. Optimized for desk/counter use:
 * 1. Quick-activate: Start translation for the current visitor
 * 2. Conversation: 1:1 bilingual dialogue at the counter
 * 3. Text translator: Translate forms, letters, documents
 * 4. Manage: Session admin
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Settings, MessageSquare, Zap, ArrowRight, Languages, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import QuickPhrases, { AUTHORITY_PHRASES } from '@/components/market/QuickPhrases'
import PrivacyBanner from '@/components/market/PrivacyBanner'
import FormTemplates from '@/components/market/FormTemplates'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

export default function AuthorityClerkHomePage() {
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

  const handleFormTemplates = () => {
    navigate('/form-templates')
  }

  const handleManage = () => {
    navigate('/admin/sessions')
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-900/30">
          <Building2 className="h-7 w-7 text-teal-700 dark:text-teal-400" />
        </div>
        <h1 className="text-2xl font-bold">Amt Translator</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || 'Verstaendigung im Buergerkontakt'}
        </p>
      </div>

      {/* Quick Activate — Primary Action */}
      <Card className="p-6 space-y-4 border-teal-200 dark:border-teal-800">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-teal-700" />
          <h2 className="font-semibold">Gespraech starten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Session-Code eingeben, um die Live-Uebersetzung fuer Ihren Besucher zu starten.
        </p>
        <SessionCodeInput
          onSubmit={(code) => handleActivate(code)}
        />
        <Button
          onClick={() => handleActivate()}
          disabled={!activateCode.trim()}
          className="w-full bg-teal-700 hover:bg-teal-800"
          size="lg"
        >
          Uebersetzung starten
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleConversation}
        >
          <div className="space-y-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Gespraech</p>
            <p className="text-xs text-muted-foreground">
              1:1 am Schalter
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
              Formulare & Briefe
            </p>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:bg-accent transition-colors"
          onClick={handleFormTemplates}
        >
          <div className="space-y-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Vorlagen</p>
            <p className="text-xs text-muted-foreground">
              Formulare uebersetzen
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
              Sessions & Nutzer
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Phrases */}
      <QuickPhrases
        phrases={AUTHORITY_PHRASES}
        onSpeak={(text) => navigate('/translator', { state: { prefill: text } })}
        title="Haeufige Saetze"
      />

      {/* Privacy Banner */}
      <PrivacyBanner />

      {/* Info hint */}
      <p className="text-xs text-muted-foreground text-center max-w-xs mx-auto">
        Ihr Besucher oeffnet die Amt Translator App auf seinem Smartphone und gibt den Session-Code ein.
      </p>
    </div>
  )
}
