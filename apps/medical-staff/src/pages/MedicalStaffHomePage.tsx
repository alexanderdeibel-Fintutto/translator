/**
 * Medical Staff Home Page
 *
 * Main screen for doctors, nurses, pharmacists.
 * Primary actions: Conversation with patient, medical phrases, pain scale.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageSquare, ArrowRight, Stethoscope, Settings, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import MedicalPhrases from '@/components/market/MedicalPhrases'
import PainScale from '@/components/market/PainScale'
import PrivacyBanner from '@/components/market/PrivacyBanner'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

export default function MedicalStaffHomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useUser()
  const [painLevel, setPainLevel] = useState<number | null>(null)

  const handleConversation = () => navigate('/conversation')
  const handleTranslator = () => navigate('/translator')

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30">
          <Heart className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">Medical Translator</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || 'Arzt-Patient-Kommunikation ohne Sprachbarriere'}
        </p>
      </div>

      {/* Privacy Banner — medical data sensitivity */}
      <PrivacyBanner />

      {/* Primary: Patient Conversation */}
      <Card className="p-6 space-y-4 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-600" />
          <h2 className="font-semibold">Patientengespraech</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Bidirektionale Uebersetzung mit Ihrem Patienten — beide Seiten sprechen abwechselnd.
        </p>
        <Button
          onClick={handleConversation}
          className="w-full bg-red-600 hover:bg-red-700"
          size="lg"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Gespraech starten
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Pain Scale — visual, works without words */}
      <PainScale
        onSelect={(value, label) => {
          setPainLevel(value)
          // Could integrate with conversation/notes
        }}
        selected={painLevel}
      />

      {/* Medical Phrases */}
      <MedicalPhrases
        onSpeak={(text) => navigate('/translator', { state: { prefill: text } })}
      />

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={handleTranslator}>
          <div className="space-y-2">
            <Stethoscope className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Text uebersetzen</p>
            <p className="text-xs text-muted-foreground">Befunde, Rezepte</p>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/settings')}>
          <div className="space-y-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Einstellungen</p>
            <p className="text-xs text-muted-foreground">Sprache & Profil</p>
          </div>
        </Card>
      </div>

      {/* Medical disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          <strong>Hinweis:</strong> Maschinelle Uebersetzung ersetzt keinen professionellen medizinischen Dolmetscher. Bei kritischen Diagnosen oder Eingriffen ziehen Sie bitte einen zertifizierten Dolmetscher hinzu.
        </p>
      </div>
    </div>
  )
}
