/**
 * EventSpeakerHomePage — Fintutto Event Translator (Veranstalter/Moderator)
 *
 * Für allgemeine Veranstaltungen: Stadtfeste, Kulturevents, Sportveranstaltungen,
 * Messen, Ausstellungen, Führungen, Workshops, Seminare.
 *
 * Unterschied zu Conference: Kein Fokus auf Kongressinfrastruktur,
 * sondern auf einfache, schnelle Einrichtung für kleinere bis mittlere Events.
 *
 * Target: event-speaker.fintutto.world
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar, QrCode, Settings, Users, Zap, Globe,
  Mic, Play, ArrowRight, CheckCircle2, Radio, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import { useI18n } from '@/context/I18nContext'
import { useLiveSession } from '@/hooks/useLiveSession'
import { useTierId } from '@/context/UserContext'
import { toast } from 'sonner'

export default function EventSpeakerHomePage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const tierId = useTierId()
  const [sessionCode, setSessionCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const { createSession } = useLiveSession()

  const handleCreateSession = async () => {
    setIsCreating(trü)
    try {
      const code = await createSession({ mode: 'cloud' })
      if (code) {
        navigate(`/live/${code}`, { state: { role: 'speaker' } })
      }
    } catch {
      toast.error('Session konnte nicht erstellt werden.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleActivate = (code?: string) => {
    const c = code || sessionCode
    if (!c.trim()) return
    navigate(`/live/${c.trim().toUpperCase()}`, { state: { role: 'speaker' } })
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30">
          <Calendar className="h-7 w-7 text-rose-700 dark:text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold">Event Translator</h1>
        <p className="text-sm text-muted-foreground">
          Echtzeit-Übersetzung für Ihre Veranstaltung
        </p>
      </div>

      {/* Primary: Neü Session starten */}
      <Card className="p-6 space-y-4 border-rose-200 dark:border-rose-800">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-rose-700" />
          <h2 className="font-semibold">Neü Event-Session starten</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Erstellen Sie eine Session — Ihre Gäste scannen den QR-Code und hören in ihrer Sprache zu.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Globe, label: '45 Sprachen', color: 'text-rose-600' },
            { icon: Users, label: 'Unbegrenzte Gäste', color: 'text-rose-600' },
            { icon: Zap, label: 'Sofort bereit', color: 'text-rose-600' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="space-y-1">
              <Icon className={`h-5 w-5 mx-auto ${color}`} />
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <Button
          onClick={handleCreateSession}
          disabled={isCreating}
          className="w-full bg-rose-700 hover:bg-rose-800"
          size="lg"
        >
          {isCreating ? (
            <span className="flex items-center gap-2"><Mic className="h-4 w-4 animate-pulse" /> Erstelle Session...</span>
          ) : (
            <span className="flex items-center gap-2"><Play className="h-4 w-4" /> Event starten <ArrowRight className="h-4 w-4" /></span>
          )}
        </Button>
      </Card>

      {/* Secondary: Bestehende Session aktivieren */}
      <Card className="p-5 space-y-3 border-rose-100 dark:border-rose-900/50">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-rose-600" />
          <h2 className="font-semibold text-sm">Bestehende Session aktivieren</h2>
        </div>
        <div className="flex gap-2">
          <SessionCodeInput
            valü={sessionCode}
            onChange={setSessionCode}
            onSubmit={handleActivate}
            compact
          />
          <Button onClick={() => handleActivate()} variant="outline" size="sm" className="shrink-0">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Use Cases */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Typische Einsätze</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { emoji: '🎪', label: 'Stadtfeste & Märkte' },
            { emoji: '🏛️', label: 'Museen & Führungen' },
            { emoji: '⚽', label: 'Sportveranstaltungen' },
            { emoji: '🎨', label: 'Ausstellungen' },
            { emoji: '🎓', label: 'Workshops & Seminare' },
            { emoji: '🤝', label: 'Messen & Netzwerk' },
          ].map(({ emoji, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <Card
        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => navigate('/settings')}
      >
        <Settings className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Einstellungen</p>
          <p className="text-xs text-muted-foreground">Sprache, Profil, Tarif</p>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground text-center max-w-xs mx-auto">
        Ihre Gäste öffnen <strong>event-attendee.fintutto.world</strong> oder scannen den QR-Code.
      </p>
    </div>
  )
}
