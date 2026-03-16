/**
 * Conference Speaker Home Page
 *
 * Dashboard for conference organizers and speakers.
 * Primary: Start/manage live channels for large audiences.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Mic, ArrowRight, Settings, Users, BarChart3, Presentation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import ChannelSelector, { type Channel } from '@/components/market/ChannelSelector'
import { useI18n } from '@/context/I18nContext'
import { useUser } from '@/context/UserContext'

export default function ConferenceSpeakerHomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useUser()
  const [activateCode, setActivateCode] = useState('')

  // Demo channels — in production these come from the event config
  const [channels] = useState<Channel[]>([
    { id: 'main', name: 'Hauptbuehne', speakerName: 'Keynote', sourceLang: 'de', listenerCount: 0, isLive: false, topic: 'Eroeffnung' },
    { id: 'room-a', name: 'Raum A', sourceLang: 'en', listenerCount: 0, isLive: false, topic: 'Workshop' },
    { id: 'room-b', name: 'Raum B', sourceLang: 'de', listenerCount: 0, isLive: false, topic: 'Panel' },
  ])

  const handleActivate = () => {
    if (!activateCode.trim()) return
    const normalized = activateCode.trim().toUpperCase().startsWith('TR-') ? activateCode.trim().toUpperCase() : `TR-${activateCode.trim().toUpperCase()}`
    navigate(`/live/${normalized}`, {
      state: { role: 'speaker' },
    })
  }

  const handleNewSession = () => navigate('/live')

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <Presentation className="h-7 w-7 text-blue-700 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold">Conference Translator</h1>
        <p className="text-sm text-muted-foreground">
          {user?.email || 'Live-Uebersetzung fuer Events & Konferenzen'}
        </p>
      </div>

      {/* Primary: Start Broadcasting */}
      <Card className="p-6 space-y-4 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-blue-700" />
          <h2 className="font-semibold">Session starten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Starten Sie eine Live-Uebersetzung fuer Ihr Publikum. Zuhoerer empfangen die Uebersetzung in ihrer Sprache.
        </p>
        <Button
          onClick={handleNewSession}
          className="w-full bg-blue-700 hover:bg-blue-800"
          size="lg"
        >
          <Radio className="mr-2 h-4 w-4" />
          Neue Session erstellen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>

      {/* Activate existing session */}
      <Card className="p-5 space-y-3">
        <h3 className="text-sm font-medium">Bestehende Session aktivieren</h3>
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
        <Button
          onClick={() => handleActivate()}
          disabled={activateCode.trim().length < 4}
          variant="outline"
          className="w-full"
        >
          Session aktivieren
        </Button>
      </Card>

      {/* Channel Overview (for multi-room events) */}
      <ChannelSelector
        channels={channels}
        activeChannelId={null}
        onSelect={(id) => {
          const ch = channels.find((c) => c.id === id)
          if (ch) navigate(`/live/${id.toUpperCase()}`, { state: { role: 'speaker' } })
        }}
      />

      {/* Stats & Management */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/admin/sessions')}>
          <div className="space-y-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Dashboard</p>
            <p className="text-xs text-muted-foreground">Sessions & Statistik</p>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/settings')}>
          <div className="space-y-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">Einstellungen</p>
            <p className="text-xs text-muted-foreground">Event & Branding</p>
          </div>
        </Card>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Users className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Tipp:</strong> Drucken Sie den QR-Code gross aus und haengen Sie ihn im Saal auf. Teilnehmer scannen den Code mit ihrem Smartphone und empfangen die Uebersetzung sofort.
        </p>
      </div>
    </div>
  )
}
