/**
 * ConferenceSpeakerHomePage — Fintutto Conference Translator (Speaker/Veranstalter)
 *
 * KONZEPT (Revision März 2026):
 * Primäres Gerät: Laptop/Tablet des Redners oder AV-Technikers
 * USP: Offline-Modus (Edge-Server im Kongresszentrum) — kein Messe-WLAN nötig
 * Sekundär: Cloud-Modus für kleinere Events ohne lokale Infrastruktur
 *
 * Preismodell:
 * - Event Pay-per-Use: €490/Tag
 * - Agency Pro: €990/Monat
 * - Congress White-Label: €2.500/Monat (mit Edge-Server)
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  WifiOff, Cloud, Radio, QrCode, Settings, BarChart3,
  Users, Zap, Globe, Shield, Building2,
  Mic, Play, Star, ArrowRight, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import SessionCodeInput from '@/components/live/SessionCodeInput'
import ChannelSelector, { type Channel } from '@/components/market/ChannelSelector'
import { useI18n } from '@/context/I18nContext'
import { useLiveSession } from '@/hooks/useLiveSession'
import { useTierId } from '@/context/UserContext'
import { toast } from 'sonner'

const DEMO_CHANNELS: Channel[] = [
  { id: 'MAIN', name: 'Hauptsaal', speakerName: 'Keynote', sourceLang: 'de', listenerCount: 0, isLive: false, topic: 'Eröffnung' },
  { id: 'ROOM1', name: 'Breakout A', speakerName: '', sourceLang: 'en', listenerCount: 0, isLive: false, topic: 'Workshop' },
  { id: 'ROOM2', name: 'Breakout B', speakerName: '', sourceLang: 'de', listenerCount: 0, isLive: false, topic: 'Panel' },
]

export default function ConferenceSpeakerHomePage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const tierId = useTierId()
  const session = useLiveSession(tierId)
  const [activateCode, setActivateCode] = useState('')
  const [connectionMode, setConnectionMode] = useState<'cloud' | 'local' | 'ble'>('cloud')
  const [localServerUrl, setLocalServerUrl] = useState('ws://192.168.1.100:8765')

  const handleNewSession = async () => {
    const config =
      connectionMode === 'local' ? { mode: 'local' as const, localServerUrl } :
      connectionMode === 'ble'   ? { mode: 'ble' as const } :
                                   { mode: 'cloud' as const }
    const code = await session.createSession('de', config)
    if (code) {
      navigate(`/live/${code}`, { state: { role: 'speaker', sourceLang: 'de', connectionMode, localServerUrl } })
    }
  }

  const handleActivate = (code?: string) => {
    const c = code || activateCode
    if (!c.trim()) return
    navigate(`/live/${c.trim().toUpperCase()}`, { state: { role: 'speaker', sourceLang: 'de', connectionMode, localServerUrl } })
  }

  return (
    <div className="min-h-[100dvh] bg-background">

      {/* ── Hero-Banner: Offline-USP ── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white px-5 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Fintutto Conference</span>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs ml-auto">
            Speaker
          </Badge>
        </div>

        <h1 className="text-2xl font-bold leading-tight mb-2">
          KI-Simultanübersetzung<br />
          <span className="text-blue-400">auch ohne Internet</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Teilnehmer hören die Übersetzung auf ihrem Smartphone — live, in bis zu 40 Sprachen, offline-fähig.
        </p>

        {/* USP-Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: WifiOff, label: 'Offline-Modus', color: 'text-green-400' },
            { icon: Users, label: 'Unbegrenzte Hörer', color: 'text-blue-400' },
            { icon: Globe, label: '40 Sprachen', color: 'text-purple-400' },
            { icon: Zap, label: '<1s Latenz', color: 'text-yellow-400' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span className="text-xs text-white/90">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* ── Verbindungsmodus ── */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Verbindungsmodus</h2>
            <Badge variant={connectionMode === 'local' ? 'default' : 'secondary'} className="text-xs">
              {connectionMode === 'local' ? '🟢 Offline-Modus' : connectionMode === 'ble' ? '🔵 Bluetooth' : '☁️ Cloud'}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: 'cloud' as const, icon: Cloud, label: 'Cloud', desc: 'Internet nötig' },
              { mode: 'local' as const, icon: WifiOff, label: 'Edge/Lokal', desc: 'Kein Internet' },
              { mode: 'ble' as const, icon: Radio, label: 'Bluetooth', desc: 'Nahbereich' },
            ].map(({ mode, icon: Icon, label, desc }) => (
              <button
                key={mode}
                onClick={() => setConnectionMode(mode)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                  connectionMode === mode
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <Icon className={`h-5 w-5 ${connectionMode === mode ? 'text-blue-600' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${connectionMode === mode ? 'text-blue-700 dark:text-blue-400' : ''}`}>{label}</span>
                <span className="text-[10px] text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>

          {/* Edge-Server-Konfiguration */}
          {connectionMode === 'local' && (
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-green-800 dark:text-green-300">Edge-Server aktiv</p>
                  <p className="text-xs text-green-700 dark:text-green-400">Übersetzung läuft lokal im Kongresszentrum. Kein Messe-WLAN nötig.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={localServerUrl}
                  onChange={e => setLocalServerUrl(e.target.value)}
                  placeholder="ws://192.168.1.100:8765"
                  className="flex-1 text-xs border rounded-lg px-3 py-2 bg-background font-mono"
                />
                <Button size="sm" variant="outline" onClick={() => toast.success('Verbindung erfolgreich!')}>
                  Test
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Neue Session ── */}
        <Card className="p-4 space-y-3 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Play className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold">Neue Session starten</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Erstellt einen QR-Code und Session-Code für Ihre Teilnehmer.
          </p>
          <Button
            onClick={handleNewSession}
            className="w-full bg-blue-700 hover:bg-blue-800"
            size="lg"
          >
            <Radio className="mr-2 h-4 w-4" />
            Session starten
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>

        {/* ── Bestehende Session ── */}
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-medium">Bestehende Session fortsetzen</h3>
          <SessionCodeInput onSubmit={(code) => handleActivate(code)} />
          <Button
            onClick={() => handleActivate()}
            disabled={!activateCode.trim()}
            variant="outline"
            className="w-full"
          >
            Session aktivieren
          </Button>
        </Card>

        {/* ── Multi-Raum (Kongresszentrum) ── */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Multi-Raum Event</h3>
            </div>
            <Badge variant="outline" className="text-xs">Congress White-Label</Badge>
          </div>
          <ChannelSelector
            channels={DEMO_CHANNELS}
            activeChannelId={null}
            onSelect={(id) => {
              navigate(`/live/${id.toUpperCase()}`, { state: { role: 'speaker' } })
            }}
          />
          <p className="text-xs text-muted-foreground">
            Mehrere Säle gleichzeitig — jeder Raum hat seinen eigenen Kanal und QR-Code.
          </p>
        </Card>

        {/* ── Preismodell ── */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold px-1">Preismodell</h3>
          {[
            {
              name: 'Event Pay-per-Use',
              price: '€ 490 / Tag',
              features: ['Bis 500 Hörer', 'Cloud-basiert', '10 Sprachen'],
              highlight: false,
            },
            {
              name: 'Agency Pro',
              price: '€ 990 / Monat',
              features: ['Unbegrenzte Events', 'Bis 1.000 Hörer/Event', 'Cloud'],
              highlight: false,
            },
            {
              name: 'Congress White-Label',
              price: '€ 2.500 / Monat',
              features: ['Eigene Domain & CI', 'Edge-Server (Offline)', 'Unbegrenzte Hörer', 'API-Zugang'],
              highlight: true,
            },
          ].map(pkg => (
            <Card key={pkg.name} className={`p-4 ${pkg.highlight ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{pkg.name}</span>
                    {pkg.highlight && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <span className={`text-lg font-bold ${pkg.highlight ? 'text-blue-700 dark:text-blue-400' : ''}`}>{pkg.price}</span>
                </div>
                <Button
                  size="sm"
                  variant={pkg.highlight ? 'default' : 'outline'}
                  className={pkg.highlight ? 'bg-blue-700 hover:bg-blue-800' : ''}
                  onClick={() => toast.info('Kontaktieren Sie uns: sales@fintutto.com')}
                >
                  Anfragen
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {pkg.features.map(f => (
                  <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* ── Navigation ── */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/admin/sessions')}>
            <BarChart3 className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Dashboard</p>
            <p className="text-xs text-muted-foreground">Sessions & Statistik</p>
          </Card>
          <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Einstellungen</p>
            <p className="text-xs text-muted-foreground">Event & Branding</p>
          </Card>
          <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate('/live')}>
            <QrCode className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">QR-Code</p>
            <p className="text-xs text-muted-foreground">Drucken & Anzeigen</p>
          </Card>
          <Card className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => toast.info('White-Label-Portal: portal.fintutto.com')}>
            <Shield className="h-5 w-5 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">White-Label</p>
            <p className="text-xs text-muted-foreground">Eigene CI & Domain</p>
          </Card>
        </div>

        {/* ── Offline-USP-Hinweis ── */}
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
          <WifiOff className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">Offline-Modus: Ihr Wettbewerbsvorteil</p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
              Wordly, KUDO und Interactio benötigen stabiles Internet. Fintutto läuft auf einem lokalen Edge-Server im Kongresszentrum — auch wenn das Messe-WLAN überlastet ist.
            </p>
          </div>
        </div>

        {/* ── IMEX-Demo-Hinweis ── */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800 mb-6">
          <Star className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">IMEX Frankfurt 2026 — 19.–21. Mai</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Treffen Sie uns am Deutschlandstand (GCB). Live-Demo des Offline-Modus. Jetzt Termin vereinbaren:{' '}
              <span className="font-mono">imex@fintutto.com</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
