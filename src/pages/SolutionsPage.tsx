// SolutionsPage — Lösungsübersicht
// Route: /solutions

import { Link } from 'react-router-dom'
import {
  ArrowRight, MapPin, Building, Calendar, Ship, Briefcase, User,
  Globe2, Wifi, Bluetooth, Shield, Zap, ChevronRight,
  Check, Smartphone, MessageCircleQuestion, ScanText
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Solution {
  icon: typeof MapPin
  title: string
  tagline: string
  description: string
  keyFeatures: string[]
  pricing: string
  savings: string
  href: string
  highlight?: boolean
}

const SOLUTIONS: Solution[] = [
  {
    icon: MapPin,
    title: 'Stadtführer & Guides',
    tagline: 'Vox-Geräte waren gestern.',
    description: 'Gäste scannen einen QR-Code und hören die Tour in ihrer Sprache — auf dem eigenen Smartphone. Keine Hardware, kein Aufwand.',
    keyFeatures: [
      'QR-Code scannen — keine App nötig',
      'Bis zu 25 Hörer pro Tour',
      'Q&A-Moderation',
      'Hotspot + BLE: Offline-fähig',
      'Dokument-Scanner (OCR)',
    ],
    pricing: 'Ab 29 EUR/Monat',
    savings: '97% günstiger als Vox-Hardware',
    href: '/loesungen/stadtfuehrer',
  },
  {
    icon: Building,
    title: 'Agenturen & Reiseveranstalter',
    tagline: 'Alle Guides, eine Plattform.',
    description: 'Mehrere Guides zentral verwalten — Sub-Accounts, Dashboard, zentrale Abrechnung. Analytics pro Guide inklusive.',
    keyFeatures: [
      'Sub-Accounts für jeden Guide',
      'Bis zu 50 Hörer pro Session',
      'Bis zu 10 gleichzeitige Sessions',
      'Dashboard-Analytics',
      'White-Label (Premium)',
    ],
    pricing: 'Ab 99 EUR/Monat',
    savings: '80% günstiger als KUDO',
    href: '/loesungen/agenturen',
  },
  {
    icon: Calendar,
    title: 'Events & Konferenzen',
    tagline: 'Multilingual — ab sofort bezahlbar.',
    description: 'Echtzeit-Übersetzung für bis zu 500 Teilnehmer. QR-Code auf die Leinwand — alle joinen in 30 Sekunden. Mit Q&A-Moderation.',
    keyFeatures: [
      'Bis zu 500 Teilnehmer',
      'Q&A-Moderation für Publikum',
      'Alle 130+ Sprachen (Pro)',
      'Session-Protokoll-Export',
      'Chirp 3 HD Audio',
    ],
    pricing: 'Ab 199 EUR/Monat',
    savings: '91% günstiger als Wordly.ai',
    href: '/sales/conference',
    highlight: true,
  },
  {
    icon: Ship,
    title: 'Kreuzfahrt & Reedereien',
    tagline: 'Landausflüge ohne Sprachbarriere.',
    description: '8 Dolmetscher durch eine App ersetzen — auf jedem Schiff, bei jeder Exkursion. Von einem Schiff bis zur Großflotte.',
    keyFeatures: [
      'Unbegrenzte Hörer pro Session',
      'Multi-Schiff-Flotten',
      'Bord-WLAN-kompatibel',
      'SLA 99,9% (Armada)',
      'API-Zugang + White-Label',
    ],
    pricing: 'Ab 1.990 EUR/Monat',
    savings: '95% günstiger als Dolmetscher',
    href: '/loesungen/kreuzfahrt',
  },
  {
    icon: Briefcase,
    title: 'Enterprise & Unternehmen',
    tagline: 'Maßgeschneidert für Großunternehmen.',
    description: 'Individuelle Konfiguration, dedizierter Support, SLA-Garantien und Full-API-Zugang. Für mehrsprachige Kommunikation im großen Maßstab.',
    keyFeatures: [
      'Individuelle Preisgestaltung',
      'Dedizierter Account Manager',
      'SLA-Garantien (bis 99,9%)',
      'Full-API-Zugang + SSO',
      'On-Premise-Option',
    ],
    pricing: 'Auf Anfrage',
    savings: 'Enterprise-Konditionen',
    href: '/loesungen/enterprise',
  },
  {
    icon: User,
    title: 'Einzelunternehmer & Freelancer',
    tagline: 'Ihr persönlicher Dolmetscher — überall.',
    description: 'Für selbstständige Guides, Berater und Coaches. 45 Sprachen, Offline-Modus, Kamera-Scanner — kostenlos starten.',
    keyFeatures: [
      '45 Sprachen + Offline-Modus',
      'Gesprächsmodus (Face-to-Face)',
      'Kamera-Scanner (OCR)',
      'Live-Session (bis 3 Hörer)',
      'Phrasebook (18 Kategorien)',
    ],
    pricing: 'Ab 4,99 EUR/Monat',
    savings: 'Günstiger als iTranslate & DeepL',
    href: '/sales/personal',
  },
]

const CROSS_FEATURES = [
  { icon: Wifi,                  title: '4-Tier-Transport',        desc: 'Cloud → Hotspot → Bluetooth → Offline. Automatischer Fallback.' },
  { icon: Shield,                title: 'E2E-Verschlüsselung',     desc: 'AES-256-GCM mit PBKDF2. DSGVO-konform. Auch offline.' },
  { icon: Globe2,                title: '45+ Sprachen',            desc: 'Inkl. 10 Migrationssprachen: Dari, Tigrinya, Paschtu, Kurdisch.' },
  { icon: Smartphone,            title: 'PWA — kein Download',     desc: 'Browser genügt. QR-Code scannen = sofort dabei.' },
  { icon: MessageCircleQuestion, title: 'Q&A-Moderation',          desc: 'Publikum stellt Fragen — Host moderiert und sendet an alle.' },
  { icon: ScanText,              title: 'Dokument-Scanner',        desc: 'Schilder & Dokumente fotografieren → sofort übersetzt.' },
  { icon: Bluetooth,             title: 'BLE-Transport',           desc: 'Bluetooth-Gruppen-Übersetzung. Null Infrastruktur.' },
  { icon: Zap,                   title: 'Offline-KI',              desc: 'Opus-MT & Whisper als WASM — keine Daten verlassen das Gerät.' },
]

export default function SolutionsPage() {
  return (
    <div className="relative max-w-2xl mx-auto space-y-10 py-6 px-4 text-white">

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[600px] h-[600px] opacity-[0.28]" />
      </div>

      {/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[280px] h-[280px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Lösungen
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Die richtige Lösung für Ihre Branche.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            Ob Stadtführung, Konferenz oder Kreuzfahrt — Fintutto passt sich Ihrem Bedarf an.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Link to="/pricing">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Alle Pläne <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                Alle Features <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Solutions */}
      <div className="space-y-3">
        {SOLUTIONS.map((solution, i) => {
          const Icon = solution.icon
          return (
            <Card key={i} className={`p-4 backdrop-blur-md border ${solution.highlight ? 'bg-sky-500/20 border-sky-400/40' : 'bg-black/25 border-white/15'}`}>
              <div className="flex items-start gap-3 mb-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${solution.highlight ? 'bg-sky-500/25' : 'bg-sky-500/15'}`}>
                  <Icon className="w-4 h-4 text-sky-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-sm leading-tight">{solution.title}</h2>
                    {solution.highlight && <span className="text-[10px] bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded-full font-semibold shrink-0">Neu: Q&A</span>}
                  </div>
                  <p className={`text-xs font-medium ${solution.highlight ? 'text-sky-300' : 'text-sky-400'}`}>{solution.tagline}</p>
                </div>
              </div>
              <p className="text-xs text-white/70 mb-2 leading-relaxed">{solution.description}</p>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {solution.keyFeatures.map((feat, j) => (
                  <div key={j} className="flex items-start gap-1 text-[11px] text-white/75">
                    <Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />{feat}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-bold text-sky-300">{solution.pricing}</span>
                  <span className="text-[11px] text-white/50 ml-2">{solution.savings}</span>
                </div>
                <Link to={solution.href}>
                  <Button size="sm" className="shrink-0 gap-1">
                    Details <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Cross-cutting features */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">In allen Lösungen enthalten</h2>
        <div className="grid grid-cols-2 gap-2">
          {CROSS_FEATURES.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div key={i} className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-sky-300" />
                  <h3 className="font-semibold text-xs">{feat.title}</h3>
                </div>
                <p className="text-[11px] text-white/65">{feat.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="grid grid-cols-3 gap-2">
        <Link to="/features" className="block">
          <Card className="p-3 bg-black/25 backdrop-blur-md border-white/15 hover:bg-black/35 transition-colors">
            <h3 className="font-semibold text-xs">Features</h3>
            <p className="text-[11px] text-white/60 mt-0.5">Alle 8 Produkte</p>
          </Card>
        </Link>
        <Link to="/compare" className="block">
          <Card className="p-3 bg-black/25 backdrop-blur-md border-white/15 hover:bg-black/35 transition-colors">
            <h3 className="font-semibold text-xs">Vergleich</h3>
            <p className="text-[11px] text-white/60 mt-0.5">vs. Wettbewerber</p>
          </Card>
        </Link>
        <Link to="/investors" className="block">
          <Card className="p-3 bg-black/25 backdrop-blur-md border-white/15 hover:bg-black/35 transition-colors">
            <h3 className="font-semibold text-xs">Investoren</h3>
            <p className="text-[11px] text-white/60 mt-0.5">Markt & Zahlen</p>
          </Card>
        </Link>
      </div>

    </div>
  )
}
