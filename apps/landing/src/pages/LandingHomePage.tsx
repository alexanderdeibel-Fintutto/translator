import { Link } from 'react-router-dom'
import {
  ArrowRight, Globe2, Radio, Users, Smartphone, Wifi, Camera,
  MessageSquare, BookOpen, Shield, Bluetooth, Mic, ChevronRight,
  Languages, Zap, Building, Ship, Check, Star
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const APPS = [
  {
    name: 'Translator',
    desc: 'Fuer alle. Kostenlos uebersetzen, sprechen, fotografieren — in 45 Sprachen.',
    url: 'https://translatorconsumer.vercel.app',
    color: 'bg-sky-600',
    icon: Languages,
    link: '/apps/translator',
  },
  {
    name: 'Live',
    desc: 'Fuer Zuhoerer. QR-Code scannen, Sprache waehlen, Live-Uebersetzung empfangen.',
    url: 'https://translatorlistener.vercel.app',
    color: 'bg-emerald-600',
    icon: Radio,
    link: '/apps/live',
  },
  {
    name: 'Enterprise',
    desc: 'Fuer Guides, Speaker & Techniker. Sessions erstellen, verwalten und live gehen.',
    url: 'https://translatorenterprise.vercel.app',
    color: 'bg-violet-600',
    icon: Building,
    link: '/apps/enterprise',
  },
]

const PRODUCTS = [
  { icon: Languages, name: 'Text-Uebersetzer', desc: '45 Sprachen, 6-Provider-Kaskade, 6 Kontextmodi' },
  { icon: Radio, name: 'Live-Broadcasting', desc: '1→N Echtzeit-Broadcast fuer bis zu 500 Zuhoerer' },
  { icon: MessageSquare, name: 'Gespraechsmodus', desc: 'Face-to-Face mit 180-Grad Split-Screen' },
  { icon: Camera, name: 'Kamera-OCR', desc: 'Foto → Text → Uebersetzung (Google Vision)' },
  { icon: BookOpen, name: 'Phrasebook', desc: '18 Kategorien, 4 Packs, 16 Zielsprachen' },
  { icon: Wifi, name: 'Offline-Engine', desc: '54 Sprachpaare, Opus-MT + Whisper WASM' },
  { icon: Bluetooth, name: 'BLE-Transport', desc: 'Custom GATT Protocol, Bluetooth-only' },
]

const SEGMENTS = [
  { icon: Smartphone, name: 'Reisende & Expats', desc: 'Kostenlos uebersetzen, offline-faehig, Kamera-OCR', plan: 'Free / 4,99 EUR/Mo' },
  { icon: Users, name: 'Guides & Museen', desc: 'Live-Broadcasting fuer Touren, QR-Code-Join', plan: 'Ab 19,90 EUR/Mo' },
  { icon: Building, name: 'Agenturen & Events', desc: 'Team-Verwaltung, bis zu 500 Teilnehmer', plan: 'Ab 99 EUR/Mo' },
  { icon: Ship, name: 'Reedereien & Flotten', desc: 'Multi-Schiff-Management, unbegrenzte Hoerer', plan: 'Ab 1.990 EUR/Mo' },
]

const STATS = [
  { value: '45', label: 'Sprachen' },
  { value: '7', label: 'Produkte' },
  { value: '3', label: 'Apps' },
  { value: '<1s', label: 'Latenz' },
]

export default function LandingHomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-20 py-12 px-4">
      {/* Hero */}
      <div className="relative text-center space-y-6 py-12 sm:py-20 overflow-hidden rounded-2xl">
        {/* Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/fintutto-logo.svg"
            alt=""
            className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] opacity-10 dark:opacity-15"
          />
        </div>
        <div className="relative z-10 space-y-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            Die Uebersetzungsplattform
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
            Sprache darf keine<br />
            <span className="text-primary">Mauer</span> sein.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Fintutto Translator ist die Plattform fuer mehrsprachige Kommunikation —
            fuer Tourismus, Events, Migration und Alltag. 45 Sprachen, Offline-faehig,
            Live-Sessions fuer bis zu 500 Personen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href="https://translatorconsumer.vercel.app" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Kostenlos uebersetzen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link to="/investors">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                Fuer Investoren
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 3 Apps */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">3 Apps, ein Oekosystem</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Jede App ist auf einen Anwendungsfall optimiert — zusammen bilden sie die komplette Plattform.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {APPS.map((app, i) => {
            const Icon = app.icon
            return (
              <Card key={i} className="p-6 space-y-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg ${app.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Fintutto {app.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{app.desc}</p>
                </div>
                <div className="flex gap-2">
                  <Link to={app.link}>
                    <Button variant="outline" size="sm" className="gap-1">
                      Mehr erfahren <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  <a href={app.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1">
                      Oeffnen <ArrowRight className="w-3 h-3" />
                    </Button>
                  </a>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* 7 Produkte */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">7 Produkte in einer Plattform</h2>
          <p className="text-muted-foreground">Von Text-Uebersetzung bis Bluetooth-Transport</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRODUCTS.map((prod, i) => {
            const Icon = prod.icon
            return (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-sm">{prod.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{prod.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="text-center">
          <Link to="/features">
            <Button variant="link" className="gap-1">
              Alle Features im Detail <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Zielgruppen */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Fuer jede Zielgruppe der richtige Plan</h2>
          <p className="text-muted-foreground">Von Free bis Enterprise — 11 Plaene in 5 Segmenten</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SEGMENTS.map((seg, i) => {
            const Icon = seg.icon
            return (
              <Card key={i} className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{seg.name}</h3>
                  <p className="text-sm text-muted-foreground">{seg.desc}</p>
                  <p className="text-xs font-medium text-primary">{seg.plan}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Technische Highlights */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">Warum Fintutto Translator?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Wifi, title: 'Offline-faehig', desc: '54 Sprachpaare via On-Device KI (Opus-MT + Whisper). Keine Daten verlassen das Geraet.' },
            { icon: Bluetooth, title: '4-Tier Transport', desc: 'Cloud → Hotspot → BLE → Offline. Automatischer Fallback — funktioniert immer.' },
            { icon: Shield, title: 'E2E-verschluesselt', desc: 'AES-256-GCM mit PBKDF2. Auch im Offline-Modus verschluesselt.' },
            { icon: Zap, title: '<1s Latenz', desc: 'Echtzeit-Uebersetzung dank Supabase Realtime und lokaler KI-Pipeline.' },
            { icon: Globe2, title: '45 Sprachen', desc: 'Inkl. 10 Migrationssprachen, RTL-Unterstuetzung, Romanisierung.' },
            { icon: Mic, title: 'HD-Sprachausgabe', desc: 'Google Neural2 + Chirp 3 HD. Natuerliche Stimmen in 24+ Sprachen.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-5 space-y-2">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-sm">{feat.title}</h3>
                <p className="text-xs text-muted-foreground">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
        <div className="text-center">
          <Link to="/technology">
            <Button variant="link" className="gap-1">
              Technische Architektur im Detail <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          'E2E-verschluesselt (AES-256-GCM)',
          'DSGVO-konform',
          '87 automatisierte Tests',
          'Made in Germany',
          'PWA + Android',
        ].map((signal, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium">
            <Check className="w-3 h-3 text-primary" />
            {signal}
          </span>
        ))}
      </div>

      {/* News-Teaser */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Neuigkeiten</h2>
          <Link to="/news">
            <Button variant="link" className="gap-1">
              Alle News <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { date: 'Maerz 2026', title: 'v3.1 Release — Multi-App-Architektur', desc: '3 spezialisierte Apps: Consumer, Listener und Enterprise. Vercel-Deployment fuer alle Varianten.' },
            { date: 'Februar 2026', title: '45 Sprachen + 10 Migrationssprachen', desc: 'Dari, Paschtu, Tigrinya, Somali und weitere Migrationssprachen ab sofort verfuegbar.' },
            { date: 'Januar 2026', title: 'BLE-Transport & Hotspot-Modus', desc: 'Live-Uebersetzung per Bluetooth und lokalem WLAN — komplett ohne Internet.' },
          ].map((news, i) => (
            <Card key={i} className="p-5 space-y-2">
              <p className="text-xs text-primary font-medium">{news.date}</p>
              <h3 className="font-semibold text-sm">{news.title}</h3>
              <p className="text-xs text-muted-foreground">{news.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Jetzt starten</h2>
        <p className="text-muted-foreground">
          Kostenlos. Keine Registrierung. Keine Installation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://translatorconsumer.vercel.app" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Uebersetzer oeffnen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <Link to="/investors">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Investor Relations
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/apps/translator">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Apps entdecken
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
