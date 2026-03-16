/**
 * Counter Staff Home Page
 *
 * Main screen for hotel receptionists, retail staff, trade fair exhibitors.
 * Primary action: Start a bidirectional conversation with a guest.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Zap, ArrowRight, Languages, Settings, HandshakeIcon, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import QuickPhrases from '@/components/market/QuickPhrases'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

const COUNTER_PHRASES = [
  { id: 'c1', emoji: '👋', text: 'Herzlich willkommen! Wie kann ich Ihnen helfen?', category: 'greeting' as const },
  { id: 'c2', emoji: '🪪', text: 'Darf ich Ihren Ausweis oder Pass sehen?', category: 'greeting' as const },
  { id: 'c3', emoji: '📝', text: 'Bitte fuellen Sie dieses Formular aus.', category: 'info' as const },
  { id: 'c4', emoji: '⏳', text: 'Bitte warten Sie einen Moment.', category: 'info' as const },
  { id: 'c5', emoji: '💳', text: 'Moechten Sie bar oder mit Karte zahlen?', category: 'info' as const },
  { id: 'c6', emoji: '🔑', text: 'Hier ist Ihr Schluessel. Zimmer Nummer...', category: 'info' as const },
  { id: 'c7', emoji: '🕐', text: 'Check-out ist bis 11 Uhr.', category: 'info' as const },
  { id: 'c8', emoji: '📞', text: 'Ich rufe jemanden, der Ihnen helfen kann.', category: 'emergency' as const },
  { id: 'c9', emoji: '🗺️', text: 'Brauchen Sie eine Wegbeschreibung?', category: 'info' as const },
  { id: 'c10', emoji: '👍', text: 'Vielen Dank! Einen schoenen Tag noch.', category: 'greeting' as const },
]

export default function CounterStaffHomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useUser()
  const [activateCode, setActivateCode] = useState('')

  const handleConversation = () => navigate('/conversation')
  const handleTranslator = () => navigate('/translator')
  const handleLive = () => navigate('/live')

  const handleActivate = () => {
    if (!activateCode.trim()) return
    const normalized = activateCode.trim().toUpperCase().startsWith('TR-') ? activateCode.trim().toUpperCase() : `TR-${activateCode.trim().toUpperCase()}`
    navigate(`/live/${normalized}`, {
      state: { role: 'speaker' },
    })
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30">
          <HandshakeIcon className="h-7 w-7 text-violet-700 dark:text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold">Counter Translator</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || 'Gaeste verstehen — in jeder Sprache'}
        </p>
      </div>

      {/* Primary: Conversation Mode */}
      <Card className="p-6 space-y-4 border-violet-200 dark:border-violet-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-violet-700" />
          <h2 className="font-semibold">Gespraech starten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Bidirektionale Uebersetzung — Sie und Ihr Gast sprechen abwechselnd, beide sehen die Uebersetzung.
        </p>
        <Button
          onClick={handleConversation}
          className="w-full bg-violet-700 hover:bg-violet-800"
          size="lg"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Gespraech oeffnen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Session Code + Live */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Live-Session (1:many)</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Fuer Praesentationen, Fuehrungen oder Ankuendigungen an mehrere Gaeste.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); handleActivate() }}>
          <input
            type="text"
            value={activateCode}
            onChange={e => setActivateCode(e.target.value.toUpperCase())}
            placeholder="TR-XXXX"
            className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={7}
            autoFocus
          />
        </form>
        <div className="flex gap-2">
          <Button
            onClick={() => handleActivate()}
            disabled={activateCode.trim().length < 4}
            variant="outline"
            className="flex-1"
          >
            Code aktivieren
          </Button>
          <Button onClick={handleLive} variant="outline" className="flex-1">
            <Headphones className="mr-1 h-3.5 w-3.5" />
            Neue Session
          </Button>
        </div>
      </Card>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={handleTranslator}>
          <div className="space-y-2">
            <Languages className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Text uebersetzen</p>
            <p className="text-xs text-muted-foreground">Schilder, Menues, Formulare</p>
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

      {/* Quick Phrases */}
      <QuickPhrases
        phrases={COUNTER_PHRASES}
        onSpeak={(text) => navigate('/translator', { state: { prefill: text } })}
        title="Haeufige Saetze am Counter"
      />

      <p className="text-xs text-muted-foreground text-center max-w-xs mx-auto">
        Ihr Gast oeffnet die Counter Translator App auf seinem Smartphone — oder Sie nutzen den Gespraechsmodus auf einem geteilten Geraet.
      </p>
    </div>
  )
}
