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
    desc: 'Für alle. Kostenlos übersetzen, sprechen, fotografieren — in 45 Sprachen.',
    url: 'https://consumer.guidetranslator.com',
    color: 'bg-sky-600',
    icon: Languages,
    link: '/apps/translator',
  },
  {
    name: 'Live',
    desc: 'Für Zuhörer. QR-Code scannen, Sprache wählen, Live-Übersetzung empfangen.',
    url: 'https://listener.guidetranslator.com',
    color: 'bg-emerald-600',
    icon: Radio,
    link: '/apps/live',
  },
  {
    name: 'Enterprise',
    desc: 'Für Guides, Speaker & Techniker. Sessions erstellen, verwalten und live gehen.',
    url: 'https://enterprise.guidetranslator.com',
    color: 'bg-violet-600',
    icon: Building,
    link: '/apps/enterprise',
  },
]

const PRODUCTS = [
  { icon: Languages, name: 'Text-Übersetzer', desc: '45 Sprachen, 6-Provider-Kaskade, 6 Kontextmodi' },
  { icon: Radio, name: 'Live-Broadcasting', desc: '1→N Echtzeit-Broadcast für bis zu 500 Zuhörer' },
  { icon: MessageSquare, name: 'Gesprächsmodus', desc: 'Face-to-Face mit 180-Grad Split-Screen' },
  { icon: Camera, name: 'Kamera-OCR', desc: 'Foto → Text → Übersetzung (Google Vision)' },
  { icon: BookOpen, name: 'Phrasebook', desc: '18 Kategorien, 4 Packs, 16 Zielsprachen' },
  { icon: Wifi, name: 'Offline-Engine', desc: '54 Sprachpaare, Opus-MT + Whisper WASM' },
  { icon: Bluetooth, name: 'BLE-Transport', desc: 'Custom GATT Protocol, Bluetooth-only' },
]

const SEGMENTS = [
  { icon: Smartphone, name: 'Reisende & Expats', desc: 'Kostenlos übersetzen, offline-fähig, Kamera-OCR', plan: 'Free / 4,99 EUR/Mo' },
  { icon: Users, name: 'Guides & Museen', desc: 'Live-Broadcasting für Touren, QR-Code-Join', plan: 'Ab 19,90 EUR/Mo' },
  { icon: Building, name: 'Agenturen & Events', desc: 'Team-Verwaltung, bis zu 500 Teilnehmer', plan: 'Ab 99 EUR/Mo' },
  { icon: Ship, name: 'Reedereien & Flotten', desc: 'Multi-Schiff-Management, unbegrenzte Hörer', plan: 'Ab 1.990 EUR/Mo' },
]

const STATS = [
  { value: '45', label: 'Sprachen' },
  { value: '7', label: 'Produkte' },
  { value: '3', label: 'Apps' },
  { value: '<1s', label: 'Latenz' },
]

export default function LandingHomePage() {
  return (
    <div className="relative max-w-5xl mx-auto space-y-20 py-12 px-4 text-white">
      {/* Page Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.65]" />
      </div>
      {/* Hero */}
      <div className="relative text-center space-y-6 py-12 sm:py-20 overflow-hidden rounded-2xl">
        {/* Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/fintutto-logo.svg"
            alt=""
            className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] opacity-95"
          />
        </div>
        <div className="relative z-10 space-y-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Die Übersetzungsplattform
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight text-white drop-shadow-lg">
            Sprache darf keine<br />
            <span className="text-sky-300">Mauer</span> sein.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            Fintutto Translator ist die Plattform für mehrsprachige Kommunikation —
            für Tourismus, Events, Migration und Alltag. 45 Sprachen, Offline-fähig,
            Live-Sessions für bis zu 500 Personen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href="https://consumer.guidetranslator.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Kostenlos übersetzen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link to="/investors">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                Für Investoren
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="text-center p-4 rounded-lg bg-black/30 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-white/70">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 3 Apps */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">3 Apps, ein Ökosystem</h2>
          <p className="text-white/70 max-w-xl mx-auto drop-shadow">
            Jede App ist auf einen Anwendungsfall optimiert — zusammen bilden sie die komplette Plattform.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {APPS.map((app, i) => {
            const Icon = app.icon
            return (
              <Card key={i} className="p-6 space-y-4 hover:shadow-md transition-shadow bg-black/30 backdrop-blur-sm border-white/10">
                <div className={`w-12 h-12 rounded-lg ${app.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Fintutto {app.name}</h3>
                  <p className="text-sm text-white/70 mt-1">{app.desc}</p>
                </div>
                <div className="flex gap-2">
                  <Link to={app.link}>
                    <Button variant="outline" size="sm" className="gap-1 border-white/30 text-white hover:bg-white/10">
                      Mehr erfahren <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  <a href={app.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1">
                      Öffnen <ArrowRight className="w-3 h-3" />
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
          <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">7 Produkte in einer Plattform</h2>
          <p className="text-white/70 drop-shadow">Von Text-Übersetzung bis Bluetooth-Transport</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRODUCTS.map((prod, i) => {
            const Icon = prod.icon
            return (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-black/30 backdrop-blur-sm">
                <Icon className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-sm text-white">{prod.name}</span>
                  <p className="text-xs text-white/70 mt-0.5">{prod.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="text-center">
          <Link to="/features">
            <Button variant="link" className="gap-1 text-sky-300">
              Alle Features im Detail <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Zielgruppen */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">Für jede Zielgruppe der richtige Plan</h2>
          <p className="text-white/70 drop-shadow">Von Free bis Enterprise — 11 Pläne in 5 Segmenten</p>
          <Link to="/preise">
            <Button variant="link" className="gap-1 text-sky-300">
              Alle Preise ansehen <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SEGMENTS.map((seg, i) => {
            const Icon = seg.icon
            return (
              <Card key={i} className="p-5 flex items-start gap-4 bg-black/30 backdrop-blur-sm border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-sky-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-white">{seg.name}</h3>
                  <p className="text-sm text-white/70">{seg.desc}</p>
                  <p className="text-xs font-medium text-sky-300">{seg.plan}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Technische Highlights */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">Warum Fintutto Translator?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Wifi, title: 'Offline-fähig', desc: '54 Sprachpaare via On-Device KI (Opus-MT + Whisper). Keine Daten verlassen das Gerät.' },
            { icon: Bluetooth, title: '4-Tier Transport', desc: 'Cloud → Hotspot → BLE → Offline. Automatischer Fallback — funktioniert immer.' },
            { icon: Shield, title: 'E2E-verschlüsselt', desc: 'AES-256-GCM mit PBKDF2. Auch im Offline-Modus verschlüsselt.' },
            { icon: Zap, title: '<1s Latenz', desc: 'Echtzeit-Übersetzung dank Supabase Realtime und lokaler KI-Pipeline.' },
            { icon: Globe2, title: '45 Sprachen', desc: 'Inkl. 10 Migrationssprachen, RTL-Unterstützung, Romanisierung.' },
            { icon: Mic, title: 'HD-Sprachausgabe', desc: 'Google Neural2 + Chirp 3 HD. Natürliche Stimmen in 24+ Sprachen.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-5 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-sky-300" />
                <h3 className="font-semibold text-sm text-white">{feat.title}</h3>
                <p className="text-xs text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
        <div className="text-center">
          <Link to="/technology">
            <Button variant="link" className="gap-1 text-sky-300">
              Technische Architektur im Detail <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          'E2E-verschlüsselt (AES-256-GCM)',
          'DSGVO-konform',
          '87 automatisierte Tests',
          'Made in Germany',
          'PWA + Android',
        ].map((signal, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm text-xs font-medium text-white">
            <Check className="w-3 h-3 text-sky-300" />
            {signal}
          </span>
        ))}
      </div>

      {/* News-Teaser */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold drop-shadow-lg">Neuigkeiten</h2>
          <Link to="/news">
            <Button variant="link" className="gap-1 text-sky-300">
              Alle News <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { date: 'März 2026', title: 'v4.1 Release — Multi-Market Landing', desc: 'Zielgruppenspezifische Lösungs-Seiten, dunkles Glasmorphism-Design und optimierte App-Verlinkung.' },
            { date: 'Februar 2026', title: '45 Sprachen + 10 Migrationssprachen', desc: 'Dari, Paschtu, Tigrinya, Somali und weitere Migrationssprachen ab sofort verfügbar.' },
            { date: 'Januar 2026', title: 'BLE-Transport & Hotspot-Modus', desc: 'Live-Übersetzung per Bluetooth und lokalem WLAN — komplett ohne Internet.' },
          ].map((news, i) => (
            <Card key={i} className="p-5 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
              <p className="text-xs text-sky-300 font-medium">{news.date}</p>
              <h3 className="font-semibold text-sm text-white">{news.title}</h3>
              <p className="text-xs text-white/70">{news.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">Jetzt starten</h2>
        <p className="text-white/70 drop-shadow">
          Kostenlos. Keine Registrierung. Keine Installation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://consumer.guidetranslator.com" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Übersetzer öffnen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <Link to="/investors">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
              Investor Relations
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/apps/translator">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
              Apps entdecken
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
