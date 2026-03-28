/**
 * Hotel Staff Home Page
 *
 * Main screen for hotel reception, concierge, room service and housekeeping staff.
 * Primary action: Start a bidirectional conversation with a hotel guest.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, ArrowRight, Languages, Settings, BedDouble, Headphones, ConciergeBell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import QuickPhrases from '@/components/market/QuickPhrases'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

const HOTEL_PHRASES = [
  { id: 'h1', emoji: '👋', text: 'Herzlich willkommen im Hotel! Wie kann ich Ihnen helfen?', category: 'greeting' as const },
  { id: 'h2', emoji: '🪪', text: 'Darf ich Ihren Reisepass oder Ausweis sehen?', category: 'greeting' as const },
  { id: 'h3', emoji: '🔑', text: 'Hier ist Ihre Zimmerkarte. Sie haben Zimmer Nummer...', category: 'info' as const },
  { id: 'h4', emoji: '🕐', text: 'Check-out ist bis 11:00 Uhr. Frühstück ab 7:00 Uhr.', category: 'info' as const },
  { id: 'h5', emoji: '🛎️', text: 'Kann ich Ihnen mit Ihrem Gepäck helfen?', category: 'info' as const },
  { id: 'h6', emoji: '🍽️', text: 'Unser Restaurant ist von 7:00 bis 22:00 Uhr geöffnet.', category: 'info' as const },
  { id: 'h7', emoji: '🅿️', text: 'Die Tiefgarage befindet sich im Untergeschoss.', category: 'info' as const },
  { id: 'h8', emoji: '🛁', text: 'Benötigen Sie zusätzliche Handtücher oder Toilettenartikel?', category: 'info' as const },
  { id: 'h9', emoji: '📶', text: 'Das WLAN-Passwort lautet...', category: 'info' as const },
  { id: 'h10', emoji: '🚨', text: 'Ich kümmere mich sofort darum. Bitte entschuldigen Sie die Unannehmlichkeiten.', category: 'emergency' as const },
  { id: 'h11', emoji: '💳', text: 'Möchten Sie bar, mit Karte oder über die Zimmerrechnung zahlen?', category: 'info' as const },
  { id: 'h12', emoji: '👍', text: 'Vielen Dank! Wir wünschen Ihnen einen angenehmen Aufenthalt.', category: 'greeting' as const },
]

export default function HotelStaffHomePage() {
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30">
          <ConciergeBell className="h-7 w-7 text-amber-700 dark:text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold">Hotel Translator</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || 'Gäste verstehen — in jeder Sprache'}
        </p>
      </div>

      {/* Primary: Conversation Mode */}
      <Card className="p-6 space-y-4 border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-amber-700" />
          <h2 className="font-semibold">Gespräch mit Gast starten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Bidirektionale Übersetzung — Sie und Ihr Gast sprechen abwechselnd, beide sehen die Übersetzung.
        </p>
        <Button
          onClick={handleConversation}
          className="w-full bg-amber-700 hover:bg-amber-800"
          size="lg"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Gespräch öffnen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Secondary: Live Session */}
      <Card className="p-5 space-y-3 border-amber-100 dark:border-amber-900/50">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-sm">Live-Session für Gruppen</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Mehrere Gäste gleichzeitig — z.B. bei Gruppencheck-in oder Ausflugsbriefing.
        </p>
        <div className="flex gap-2">
          <SessionCodeInput
            value={activateCode}
            onChange={setActivateCode}
            onSubmit={handleActivate}
            compact
          />
          <Button onClick={() => handleActivate()} variant="outline" size="sm" className="shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleLive} variant="ghost" size="sm" className="w-full text-amber-700">
          Neue Session erstellen
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
          <p className="text-xs text-muted-foreground">Dokumente, Formulare, Schilder</p>
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
        phrases={HOTEL_PHRASES}
        onSpeak={(text) => navigate('/translator', { state: { prefill: text } })}
        title="Häufige Sätze am Empfang"
      />

      <p className="text-xs text-muted-foreground text-center max-w-xs mx-auto">
        Ihr Gast öffnet die Hotel Translator Gast-App auf seinem Smartphone — oder Sie nutzen den Gesprächsmodus auf einem geteilten Gerät.
      </p>
    </div>
  )
}
