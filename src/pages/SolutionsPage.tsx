// SolutionsPage — Loesungsuebersicht mit Links zu den externen Sales-Seiten
// Route: /solutions

import { Link } from 'react-router-dom'
import {
  ArrowRight, MapPin, Building, Calendar, Ship, Briefcase, User,
  Globe2, Users, Wifi, Bluetooth, Shield, Zap, ChevronRight,
  Mic, Camera, MessageSquare, Volume2, Check, Smartphone, Star
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const SALES_BASE = 'https://sales.guidetranslator.com'

interface Solution {
  slug: string
  icon: typeof MapPin
  title: string
  tagline: string
  description: string
  targetAudience: string
  keyFeatures: string[]
  pricing: string
  savings: string
  cta: string
  highlight?: string
}

const SOLUTIONS: Solution[] = [
  {
    slug: 'stadtfuehrer',
    icon: MapPin,
    title: 'Stadtfuehrer & Guides',
    tagline: 'Vox-Geraete waren gestern.',
    description: 'Ihre Gaeste scannen einen QR-Code und hoeren die Tour in ihrer Sprache — auf dem eigenen Smartphone. Keine Hardware, kein Aufwand, keine Desinfektion.',
    targetAudience: 'Freelance-Guides, Museumsfuehrer, Reiseleitende, Tourismus-Guides',
    keyFeatures: [
      'QR-Code scannen — keine App noetig',
      'Bis zu 25 Hoerer pro Tour',
      '10 Sprachen gleichzeitig',
      'Hotspot + BLE: Offline-faehig',
      'HD-Sprachausgabe (Neural2)',
    ],
    pricing: 'Ab 19,90 EUR/Monat',
    savings: '97% guenstiger als Vox-Hardware',
    cta: 'Loesung fuer Guides',
  },
  {
    slug: 'agentur',
    icon: Building,
    title: 'Agenturen & Reiseveranstalter',
    tagline: 'Alle Guides, eine Plattform.',
    description: 'Verwalten Sie mehrere Guides zentral mit Sub-Accounts und Dashboard. Zentrale Abrechnung, individuelle Nutzung, Analytics pro Guide.',
    targetAudience: 'Reiseagenturen, Tourismusverbaende, Museumsbetriebe, Busreise-Unternehmen',
    keyFeatures: [
      'Sub-Accounts fuer jeden Guide',
      'Bis zu 50 Hoerer pro Session',
      'Bis zu 10 gleichzeitige Sessions',
      'Dashboard-Analytics',
      'White-Label (Premium)',
    ],
    pricing: 'Ab 99 EUR/Monat',
    savings: '80% guenstiger als KUDO',
    cta: 'Loesung fuer Agenturen',
  },
  {
    slug: 'veranstalter',
    icon: Calendar,
    title: 'Events & Konferenzen',
    tagline: 'Konferenzen multilingual — ab sofort bezahlbar.',
    description: 'Echtzeit-Uebersetzung fuer Events mit bis zu 500 Teilnehmern. QR-Code auf die Leinwand projizieren — 500 Teilnehmer joinen in 30 Sekunden.',
    targetAudience: 'Konferenz-Veranstalter, Messen, Hochschulen, Kommunen, Firmen-Events',
    keyFeatures: [
      'Bis zu 500 gleichzeitige Teilnehmer',
      'Alle 130+ Sprachen (Pro)',
      'Session-Protokoll-Export (TXT/MD)',
      'Chirp 3 HD Audio (Pro)',
      'White-Label (Pro)',
    ],
    pricing: 'Ab 199 EUR/Monat',
    savings: '91% guenstiger als Wordly.ai',
    cta: 'Loesung fuer Events',
  },
  {
    slug: 'kreuzfahrt',
    icon: Ship,
    title: 'Kreuzfahrt & Reedereien',
    tagline: 'Landausfluege ohne Sprachbarriere.',
    description: 'Ersetzen Sie 8 Dolmetscher durch eine App — auf jedem Schiff, bei jeder Exkursion. Von einem Schiff bis zur Grossflotte mit unbegrenzten Hoerern.',
    targetAudience: 'Reedereien, Kreuzfahrt-Flotten, Flusskreuzfahrten, Expeditionsschiffe',
    keyFeatures: [
      'Unbegrenzte Hoerer pro Session',
      'Multi-Schiff-Flotten (bis 10+ Schiffe)',
      'Funktioniert ueber Bord-WLAN',
      'SLA 99,9% (Armada)',
      'API-Zugang + White-Label',
    ],
    pricing: 'Ab 1.990 EUR/Monat',
    savings: '95% guenstiger als Dolmetscher',
    cta: 'Loesung fuer Kreuzfahrt',
  },
  {
    slug: 'enterprise',
    icon: Briefcase,
    title: 'Enterprise & Unternehmen',
    tagline: 'Massgeschneiderte Loesung fuer Grossunternehmen.',
    description: 'Individuelle Konfiguration, dedizierter Support, SLA-Garantien und API-Zugang. Fuer Unternehmen, die mehrsprachige Kommunikation im grossen Massstab brauchen.',
    targetAudience: 'Konzerne, Behoerden, NGOs, internationale Organisationen, Grossunternehmen',
    keyFeatures: [
      'Individuelle Preisgestaltung',
      'Dedizierter Account Manager',
      'SLA-Garantien (bis 99,9%)',
      'Full-API-Zugang + SSO',
      'On-Premise-Option',
    ],
    pricing: 'Auf Anfrage',
    savings: 'Enterprise-Konditionen',
    cta: 'Enterprise kontaktieren',
    highlight: 'Enterprise',
  },
  {
    slug: 'fintutto',
    icon: User,
    title: 'Einzelunternehmer & Freelancer',
    tagline: 'Ihr persoenlicher Dolmetscher — ueberall.',
    description: 'Fuer selbstaendige Guides, Berater, Coaches und Freelancer, die international arbeiten. Alles, was Sie brauchen, in einem guenstigen Plan.',
    targetAudience: 'Freelance-Guides, Berater, Coaches, Dolmetscher, Sprach-Mediatoren',
    keyFeatures: [
      '45 Sprachen + Offline-Modus',
      'Gespraechsmodus (Face-to-Face)',
      'Kamera-Uebersetzer (OCR)',
      'Live-Session (bis 3 Hoerer)',
      'Phrasebook (18 Kategorien)',
    ],
    pricing: 'Ab 4,99 EUR/Monat',
    savings: 'Guenstiger als iTranslate & DeepL',
    cta: 'Loesung fuer Einzelunternehmer',
  },
]

const CROSS_CUTTING_FEATURES = [
  {
    icon: Wifi,
    title: '4-Tier-Transport',
    description: 'Cloud → Hotspot → Bluetooth → Offline. Funktioniert immer, ueberall — auch ohne Internet.',
  },
  {
    icon: Shield,
    title: 'E2E-Verschluesselung',
    description: 'AES-256-GCM mit PBKDF2. DSGVO-konform. Keine Daten in der Cloud im Offline-Modus.',
  },
  {
    icon: Globe2,
    title: '45 Sprachen + 10 Migrationssprachen',
    description: 'Inkl. Dari, Tigrinya, Paschtu, Kurdisch. Vollstaendige RTL-Unterstuetzung.',
  },
  {
    icon: Smartphone,
    title: 'PWA — kein Download',
    description: 'Laeuft direkt im Browser. Kein App-Store, kein Account noetig. QR-Code scannen = fertig.',
  },
]

export default function SolutionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8 px-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
          Loesungen
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
          Die richtige Loesung fuer Ihre Branche.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Ob Stadtfuehrung, Konferenz oder Kreuzfahrt — GuideTranslator passt sich Ihrem Bedarf an.
          Von einem Hoerer bis 500 Teilnehmer, von kostenlos bis Enterprise.
        </p>
      </div>

      {/* Solutions grid */}
      <div className="space-y-6">
        {SOLUTIONS.map((solution, i) => {
          const Icon = solution.icon
          return (
            <Card key={i} className={`p-6 sm:p-8 ${solution.highlight ? 'border-primary' : ''}`}>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Left: Info */}
                <div className="sm:w-1/2 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{solution.title}</h2>
                      <p className="text-sm font-medium text-primary">{solution.tagline}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {solution.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Zielgruppe: </span>{solution.targetAudience}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="px-3 py-1.5 rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {solution.pricing}
                    </div>
                    <span className="text-xs text-muted-foreground">{solution.savings}</span>
                  </div>
                </div>

                {/* Right: Features + CTA */}
                <div className="sm:w-1/2 space-y-4">
                  <h3 className="font-semibold text-sm">Highlights</h3>
                  <ul className="space-y-2">
                    {solution.keyFeatures.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <a
                      href={`${SALES_BASE}/${solution.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full gap-2">
                        {solution.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Cross-cutting features */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">In allen Loesungen enthalten</h2>
          <p className="text-muted-foreground">
            Egal welchen Plan Sie waehlen — diese Features sind immer dabei.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CROSS_CUTTING_FEATURES.map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">{feat.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{feat.description}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Comparison hint */}
      <Card className="p-6 bg-muted/30 text-center space-y-3">
        <h2 className="text-lg font-bold">Nicht sicher, welche Loesung passt?</h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Vergleichen Sie unsere 11 Plaene im Detail oder berechnen Sie Ihren ROI mit unserem Rechner.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/pricing">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              Alle 11 Plaene vergleichen
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/compare">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              Wettbewerbervergleich
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>

      {/* All solutions link */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Ausfuehrliche Informationen zu allen Loesungen finden Sie auf unserer Sales-Seite:
        </p>
        <a
          href={SALES_BASE}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" className="gap-2">
            sales.guidetranslator.com
            <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Further links */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Mehr erfahren</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/features" className="block">
            <Card className="p-4 hover:bg-muted/50 transition-colors h-full">
              <h3 className="font-semibold text-sm">Alle Features</h3>
              <p className="text-xs text-muted-foreground mt-1">7 Produkte — von Live-Broadcasting bis Kamera-OCR</p>
            </Card>
          </Link>
          <Link to="/technology" className="block">
            <Card className="p-4 hover:bg-muted/50 transition-colors h-full">
              <h3 className="font-semibold text-sm">Technische Architektur</h3>
              <p className="text-xs text-muted-foreground mt-1">4-Tier-Transport, On-Device KI, E2E-Verschluesselung</p>
            </Card>
          </Link>
          <Link to="/investors" className="block">
            <Card className="p-4 hover:bg-muted/50 transition-colors h-full">
              <h3 className="font-semibold text-sm">Fuer Investoren</h3>
              <p className="text-xs text-muted-foreground mt-1">Marktgroesse, Geschaeftsmodell, Finanzen</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
