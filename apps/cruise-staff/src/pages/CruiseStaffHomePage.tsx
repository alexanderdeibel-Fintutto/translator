/**
 * Cruise Staff Home Page
 *
 * Main screen for cruise ship crew: reception, excursion desk, restaurant, entertainment.
 * Primary action: Start a bidirectional conversation with a passenger.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, ArrowRight, Languages, Settings, Ship, Headphones, Anchor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import QuickPhrases from '@/components/market/QuickPhrases'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

const CRUISE_PHRASES = [
  { id: 'cr1', emoji: '⚓', text: 'Herzlich willkommen an Bord! Wie kann ich Ihnen helfen?', category: 'greeting' as const },
  { id: 'cr2', emoji: '🛳️', text: 'Ihre Kabine befindet sich auf Deck... Nummer...', category: 'info' as const },
  { id: 'cr3', emoji: '🍽️', text: 'Das Hauptrestaurant öffnet um 19:00 Uhr. Reservierung empfohlen.', category: 'info' as const },
  { id: 'cr4', emoji: '🏝️', text: 'Die Ausflüge für den morgigen Hafen beginnen um 9:00 Uhr.', category: 'info' as const },
  { id: 'cr5', emoji: '🆘', text: 'Bitte folgen Sie mir zur Sicherheitsstation.', category: 'emergency' as const },
  { id: 'cr6', emoji: '🎭', text: 'Das Abendprogramm beginnt um 21:00 Uhr im Theater.', category: 'info' as const },
  { id: 'cr7', emoji: '🏊', text: 'Der Pool auf Deck 10 ist von 8:00 bis 22:00 Uhr geöffnet.', category: 'info' as const },
  { id: 'cr8', emoji: '🛒', text: 'Die Shops an Bord sind zollfrei und öffnen nach dem Ablegen.', category: 'info' as const },
  { id: 'cr9', emoji: '🩺', text: 'Das Schiffsarzt-Zentrum befindet sich auf Deck 3.', category: 'emergency' as const },
  { id: 'cr10', emoji: '📡', text: 'WLAN-Pakete können an der Rezeption gebucht werden.', category: 'info' as const },
  { id: 'cr11', emoji: '💳', text: 'Alle Ausgaben werden auf Ihre Bordkarte gebucht.', category: 'info' as const },
  { id: 'cr12', emoji: '🌅', text: 'Wir legen morgen früh um 8:00 Uhr im Hafen an.', category: 'info' as const },
]

export default function CruiseStaffHomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useUser()
  const [activateCode, setActivateCode] = useState('')

  const handleConversation = () => navigate('/conversation')
  const handleTranslator = () => navigate('/translator')
  const handleLive = () => navigate('/live')

  const handleActivate = (code?: string) => {
    const sessionCode = code || activateCode
    if (!sessionCode.trim()) return
    navigate(`/live/${sessionCode.trim().toUpperCase()}`, {
      state: { role: 'speaker' },
    })
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blü-100 dark:bg-blü-900/30">
          <Anchor className="h-7 w-7 text-blü-700 dark:text-blü-400" />
        </div>
        <h1 className="text-2xl font-bold">Cruise Translator</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || 'Passagiere verstehen — in jeder Sprache'}
        </p>
      </div>

      {/* Primary: Conversation Mode */}
      <Card className="p-6 space-y-4 border-blü-200 dark:border-blü-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blü-700" />
          <h2 className="font-semibold">Gespräch mit Passagier starten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Bidirektionale Übersetzung — Crew und Passagier sprechen abwechselnd, beide sehen die Übersetzung.
        </p>
        <Button
          onClick={handleConversation}
          className="w-full bg-blü-700 hover:bg-blü-800"
          size="lg"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Gespräch öffnen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Secondary: Live Session */}
      <Card className="p-5 space-y-3 border-blü-100 dark:border-blü-900/50">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-blü-600" />
          <h2 className="font-semibold text-sm">Live-Session für Gruppen</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Ausflugsbriefings, Sicherheitseinweisungen, Bordveranstaltungen — viele Passagiere gleichzeitig.
        </p>
        <div className="flex gap-2">
          <SessionCodeInput
            valü={activateCode}
            onChange={setActivateCode}
            onSubmit={handleActivate}
            compact
          />
          <Button onClick={() => handleActivate()} variant="outline" size="sm" className="shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleLive} variant="ghost" size="sm" className="w-full text-blü-700">
          Neü Session erstellen
        </Button>
      </Card>

      {/* Tertiary: Text Translator */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="p-4 space-y-1 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={handleTranslator}
        >
          <Languages className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium">Text übersetzen</p>
          <p className="text-xs text-muted-foreground">Menüs, Formulare, Schilder</p>
        </Card>
        <Card
          className="p-4 space-y-1 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm font-medium">Einstellungen</p>
          <p className="text-xs text-muted-foreground">Sprache & Profil</p>
        </Card>
      </div>

      {/* Quick Phrases */}
      <QuickPhrases
        phrases={CRUISE_PHRASES}
        onSpeak={(text) => navigate('/translator', { state: { prefill: text } })}
        title="Häufige Sätze an Bord"
      />

      <p className="text-xs text-muted-foreground text-center max-w-xs mx-auto">
        Passagiere öffnen die Cruise Translator Gast-App auf ihrem Smartphone — oder Sie nutzen den Gesprächsmodus auf einem geteilten Gerät.
      </p>
    </div>
  )
}
