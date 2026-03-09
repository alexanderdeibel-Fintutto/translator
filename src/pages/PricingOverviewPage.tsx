// PricingOverviewPage — Ausfuehrliche Preisuebersicht mit allen 11 Plaenen
// Route: /preise

import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, Check, X, Users, Globe2, Clock,
  Mic, Volume2, Shield, Wifi, Bluetooth, QrCode, FileText,
  Building, Settings, Zap, Star, ExternalLink, Calculator
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const SALES_BASE = 'https://sales.guidetranslator.com'

interface PlanInfo {
  name: string
  segment: string
  segmentLabel: string
  price: string
  yearlyPrice: string
  period: string
  description: string
  highlights: string[]
  badge?: string
  salesSlug?: string
}

const PLANS: PlanInfo[] = [
  {
    name: 'Kostenlos',
    segment: 'personal',
    segmentLabel: 'Privat',
    price: '0 EUR',
    yearlyPrice: '0 EUR',
    period: 'fuer immer',
    description: 'Fuer den Einstieg — Uebersetzen, Sprechen, Offline.',
    highlights: [
      '22 Sprachen',
      '500 Uebersetzungen/Tag',
      'Offline-Modus (54 Paare)',
      'Gespraechsmodus',
      'Kamera-OCR',
      'Phrasebook (18 Kategorien)',
      'Browser-TTS',
    ],
    salesSlug: 'fintutto',
  },
  {
    name: 'Personal Pro',
    segment: 'personal',
    segmentLabel: 'Privat',
    price: '4,99 EUR',
    yearlyPrice: '49,90 EUR',
    period: '/Monat',
    description: 'Professionelle Uebersetzung fuer Arzt, Behoerde, Reise.',
    highlights: [
      '30 Sprachen',
      'Unbegrenzte Uebersetzungen',
      'Azure-Uebersetzungsqualitaet',
      'Live-Session (3 Hoerer)',
      'Kein Werbebanner',
      'Offline + Standard-TTS',
    ],
    salesSlug: 'fintutto',
  },
  {
    name: 'Guide Basic',
    segment: 'guide',
    segmentLabel: 'Guide',
    price: '19,90 EUR',
    yearlyPrice: '199 EUR',
    period: '/Monat',
    description: 'Fuer einzelne Stadtfuehrer und Freelancer.',
    highlights: [
      '10 Hoerer pro Session',
      '5 Sprachen (+2,99 EUR/Sprache)',
      '300 Min/Monat (~5h)',
      'QR-Code Join',
      'Hotspot-Modus',
      '3 Custom-Glossare',
      'Basis-Analytics',
    ],
    salesSlug: 'stadtfuehrer',
  },
  {
    name: 'Guide Pro',
    segment: 'guide',
    segmentLabel: 'Guide',
    price: '39,90 EUR',
    yearlyPrice: '399 EUR',
    period: '/Monat',
    description: 'Professionelle Guides mit groesseren Gruppen.',
    highlights: [
      '25 Hoerer pro Session',
      '10 Sprachen (+1,99 EUR/Sprache)',
      '600 Min/Monat (~10h)',
      'Neural2-TTS + BLE-Transport',
      '10 Glossare + Pre-Translation',
      'Cloud STT',
      'Erweiterte Analytics',
    ],
    badge: 'Beliebt',
    salesSlug: 'stadtfuehrer',
  },
  {
    name: 'Agentur Standard',
    segment: 'agency',
    segmentLabel: 'Business',
    price: '99 EUR',
    yearlyPrice: '990 EUR',
    period: '/Monat',
    description: 'Reiseagenturen mit mehreren Guides.',
    highlights: [
      '30 Hoerer (x3 Sessions)',
      '15 Sprachen (+1,49 EUR/Sprache)',
      '1.500 Min/Monat (~25h)',
      'Guide-Management Dashboard',
      '15 Glossare + Pre-Translation',
      'Neural2-TTS + BLE',
    ],
    salesSlug: 'agentur',
  },
  {
    name: 'Agentur Premium',
    segment: 'agency',
    segmentLabel: 'Business',
    price: '249 EUR',
    yearlyPrice: '2.490 EUR',
    period: '/Monat',
    description: 'Grosse Agenturen und Tour-Operatoren.',
    highlights: [
      '50 Hoerer (x10 Sessions)',
      'Alle Sprachen inklusive',
      '5.000 Min/Monat (~83h)',
      'White-Label + Chirp 3 HD',
      'API-Zugang (read)',
      'Transkript-Export',
    ],
    badge: 'Beliebt',
    salesSlug: 'agentur',
  },
  {
    name: 'Event Basic',
    segment: 'event',
    segmentLabel: 'Event',
    price: '199 EUR',
    yearlyPrice: '1.990 EUR',
    period: '/Monat',
    description: 'Konferenzen, Messen und Workshops.',
    highlights: [
      '100 Hoerer (x3 Sessions)',
      '20 Sprachen (+0,99 EUR/Sprache)',
      '2.000 Min/Monat (~33h)',
      'Neural2-TTS',
      'Session-Protokoll-Export',
      '10 Glossare + Pre-Translation',
    ],
    salesSlug: 'veranstalter',
  },
  {
    name: 'Event Pro',
    segment: 'event',
    segmentLabel: 'Event',
    price: '499 EUR',
    yearlyPrice: '4.990 EUR',
    period: '/Monat',
    description: 'Grosse Konferenzen und Multi-Track-Events.',
    highlights: [
      '500 Hoerer (x10 Sessions)',
      'Alle Sprachen inklusive',
      '8.000 Min/Monat (~133h)',
      'Chirp 3 HD + White-Label',
      'API-Zugang (read)',
      'Transkript-Export',
    ],
    badge: 'Enterprise',
    salesSlug: 'veranstalter',
  },
  {
    name: 'Cruise Starter',
    segment: 'cruise',
    segmentLabel: 'Cruise',
    price: '1.990 EUR',
    yearlyPrice: '19.900 EUR',
    period: '/Monat',
    description: '1 Schiff mit unbegrenzten Hoerern.',
    highlights: [
      'Unbegrenzte Hoerer (x5 Sessions)',
      '8 Sprachen (+49 EUR/Sprache)',
      '1.500 Min/Monat',
      'Neural2-TTS + BLE',
      'Guide-Management',
      'Transkript-Export',
    ],
    salesSlug: 'kreuzfahrt',
  },
  {
    name: 'Cruise Fleet',
    segment: 'cruise',
    segmentLabel: 'Cruise',
    price: '6.990 EUR',
    yearlyPrice: '69.900 EUR',
    period: '/Monat',
    description: '5-10 Schiffe mit Premium-Stimmen und API.',
    highlights: [
      'Unbegrenzte Hoerer (x50 Sessions)',
      '12 Sprachen (+39 EUR/Sprache)',
      '8.000 Min/Monat',
      'Chirp 3 HD + White-Label',
      'API-Zugang (read)',
      'SLA 99,5%',
    ],
    badge: 'Enterprise',
    salesSlug: 'kreuzfahrt',
  },
  {
    name: 'Cruise Armada',
    segment: 'cruise',
    segmentLabel: 'Cruise',
    price: '19.990 EUR',
    yearlyPrice: '199.900 EUR',
    period: '/Monat',
    description: '10+ Schiffe — alle Sprachen, voller API-Zugang.',
    highlights: [
      'Unbegrenzte Hoerer + Sessions',
      'Alle Sprachen inklusive',
      '30.000 Min/Monat (~500h)',
      'Chirp 3 HD + Full-API',
      'Dedicated Support',
      'SLA 99,9%',
    ],
    badge: 'Enterprise',
    salesSlug: 'kreuzfahrt',
  },
]

const SEGMENT_COLORS: Record<string, string> = {
  personal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  guide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  agency: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  event: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  cruise: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
}

const FAQ = [
  {
    q: 'Kann ich jederzeit upgraden oder downgraden?',
    a: 'Ja, jederzeit. Beim Upgrade wird die Differenz anteilig berechnet. Beim Downgrade gilt der neue Preis ab der naechsten Periode.',
  },
  {
    q: 'Gibt es eine Mindestlaufzeit?',
    a: 'Nein bei Monatsplaenen. Jahresplaene: 12 Monate mit 2 Monaten gratis (17% Rabatt).',
  },
  {
    q: 'Was passiert bei Minuten-Limit-Erreichen?',
    a: 'Sie koennen zum fairen Overage-Preis weitermachen oder upgraden. Bestehende Sessions funktionieren weiter.',
  },
  {
    q: 'Ist das wirklich kostenlos?',
    a: 'Ja. Der Free-Plan ist dauerhaft kostenlos mit 22 Sprachen und 500 Uebersetzungen/Tag. Keine Kreditkarte noetig.',
  },
  {
    q: 'Was ist der Unterschied zwischen Azure und Google Translation?',
    a: 'Beide sind hochwertige NMT-Engines. Azure ist im Pro/Business-Plan als primaerer Provider inkludiert. Google wird als Fallback genutzt. Free-Nutzer verwenden MyMemory + LibreTranslate.',
  },
  {
    q: 'Sind die Overage-Kosten gedeckelt?',
    a: 'Nein, aber Sie erhalten Warnungen bei 80% und 100% Verbrauch. Bei regelmaessigem Overage empfehlen wir ein Upgrade.',
  },
]

export default function PricingOverviewPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8 px-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
          Transparente Preise. Starten Sie kostenlos.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          11 Plaene in 5 Segmenten — von 0 EUR bis Enterprise. Jaehrlich zahlen = 2 Monate gratis.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/pricing">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Direkt zum Plan-Vergleich
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href={SALES_BASE} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Calculator className="h-4 w-4" />
              Ersparnis berechnen
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>

      {/* All plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Alle 11 Plaene im Ueberblick</h2>
        <p className="text-center text-sm text-muted-foreground">
          Jaehrlich zahlen = 17% Rabatt (2 Monate gratis)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <Card
              key={i}
              className={`p-5 space-y-3 flex flex-col ${plan.badge ? 'border-primary' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${SEGMENT_COLORS[plan.segment] || ''}`}>
                    {plan.segmentLabel}
                  </span>
                  <h3 className="font-bold text-lg mt-1">{plan.name}</h3>
                </div>
                {plan.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                    {plan.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
              <div>
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm"> {plan.period}</span>
              </div>
              {plan.yearlyPrice !== '0 EUR' && (
                <p className="text-xs text-muted-foreground">
                  oder {plan.yearlyPrice}/Jahr (17% Rabatt)
                </p>
              )}
              <ul className="space-y-1.5 flex-1">
                {plan.highlights.map((h, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 space-y-2">
                <Link to="/pricing" className="block">
                  <Button className="w-full" size="sm" variant={plan.badge ? 'default' : 'outline'}>
                    Plan waehlen
                  </Button>
                </Link>
                {plan.salesSlug && (
                  <a
                    href={`${SALES_BASE}/${plan.salesSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full gap-1" size="sm" variant="ghost">
                      <Calculator className="w-3 h-3" />
                      ROI berechnen
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Overage pricing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Overage-Preise</h2>
        <p className="text-center text-sm text-muted-foreground">
          Wenn Sie die inkludierten Minuten ueberschreiten, zahlen Sie pro Minute:
        </p>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Segment</th>
                  <th className="text-right py-2 font-semibold">Overage/Minute</th>
                  <th className="text-right py-2 font-semibold">Zusatzsprache/Monat</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { segment: 'Guide Basic', overage: '0,15 EUR', lang: '2,99 EUR' },
                  { segment: 'Guide Pro', overage: '0,12 EUR', lang: '1,99 EUR' },
                  { segment: 'Agentur Standard', overage: '0,10 EUR', lang: '1,49 EUR' },
                  { segment: 'Agentur Premium', overage: '0,08 EUR', lang: 'Alle inkl.' },
                  { segment: 'Event Basic', overage: '0,08 EUR', lang: '0,99 EUR' },
                  { segment: 'Event Pro', overage: '0,06 EUR', lang: 'Alle inkl.' },
                  { segment: 'Cruise Starter', overage: '0,80 EUR', lang: '49 EUR' },
                  { segment: 'Cruise Fleet', overage: '0,60 EUR', lang: '39 EUR' },
                  { segment: 'Cruise Armada', overage: '0,40 EUR', lang: 'Alle inkl.' },
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2">{row.segment}</td>
                    <td className="py-2 text-right font-mono">{row.overage}</td>
                    <td className="py-2 text-right">{row.lang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Feature comparison by segment */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Feature-Vergleich nach Segment</h2>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Feature</th>
                  <th className="text-center py-2 font-semibold">Free</th>
                  <th className="text-center py-2 font-semibold">Personal</th>
                  <th className="text-center py-2 font-semibold">Guide</th>
                  <th className="text-center py-2 font-semibold">Agentur</th>
                  <th className="text-center py-2 font-semibold">Event</th>
                  <th className="text-center py-2 font-semibold">Cruise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feat: 'Uebersetzungs-Provider', free: 'MyMemory', personal: 'Azure', guide: 'Azure', agency: 'Azure', event: 'Azure', cruise: 'Azure' },
                  { feat: 'TTS-Qualitaet', free: 'Browser', personal: 'Standard', guide: 'Neural2', agency: 'Chirp HD*', event: 'Chirp HD*', cruise: 'Chirp HD*' },
                  { feat: 'Live-Session', free: '—', personal: '3 Hoerer', guide: '10-25', agency: '30-50', event: '100-500', cruise: 'Unbegr.' },
                  { feat: 'Sprachen', free: '22', personal: '30', guide: '5-10+', agency: '15-Alle', event: '20-Alle', cruise: '8-Alle' },
                  { feat: 'Offline-Modus', free: 'Ja', personal: 'Ja', guide: 'Ja', agency: 'Ja', event: '—', cruise: 'Ja' },
                  { feat: 'BLE-Transport', free: '—', personal: '—', guide: 'Pro', agency: 'Ja', event: '—', cruise: 'Ja' },
                  { feat: 'Hotspot-Relay', free: '—', personal: '—', guide: 'Ja', agency: 'Ja', event: '—', cruise: 'Ja' },
                  { feat: 'QR-Code Join', free: '—', personal: '—', guide: 'Ja', agency: 'Ja', event: 'Ja', cruise: 'Ja' },
                  { feat: 'White-Label', free: '—', personal: '—', guide: '—', agency: 'Premium', event: 'Pro', cruise: 'Fleet+' },
                  { feat: 'API-Zugang', free: '—', personal: '—', guide: '—', agency: 'Read*', event: 'Read*', cruise: 'Read/Full' },
                  { feat: 'Guide-Management', free: '—', personal: '—', guide: '—', agency: 'Ja', event: '—', cruise: 'Ja' },
                  { feat: 'Transkript-Export', free: '—', personal: '—', guide: '—', agency: 'Premium', event: 'Ja', cruise: 'Ja' },
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-medium">{row.feat}</td>
                    <td className="py-2 text-center text-muted-foreground">{row.free}</td>
                    <td className="py-2 text-center">{row.personal}</td>
                    <td className="py-2 text-center">{row.guide}</td>
                    <td className="py-2 text-center">{row.agency}</td>
                    <td className="py-2 text-center">{row.event}</td>
                    <td className="py-2 text-center">{row.cruise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">* Chirp 3 HD und API-Zugang nur in Premium-/Pro-Varianten</p>
        </Card>
      </div>

      {/* ROI Calculator links */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Berechnen Sie Ihre Ersparnis</h2>
        <p className="text-center text-sm text-muted-foreground">
          Unser Sales-Tool berechnet Ihren individuellen ROI und erstellt ein massgeschneidertes Angebot.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Stadtfuehrer', slug: 'stadtfuehrer', desc: '97% guenstiger als Vox-Hardware' },
            { label: 'Agenturen', slug: 'agentur', desc: '80% guenstiger als KUDO' },
            { label: 'Events', slug: 'veranstalter', desc: '91% guenstiger als Wordly.ai' },
            { label: 'Kreuzfahrt', slug: 'kreuzfahrt', desc: '95% guenstiger als Dolmetscher' },
            { label: 'Enterprise', slug: 'enterprise', desc: 'Individuelle Konditionen' },
            { label: 'Einzelunternehmer', slug: 'fintutto', desc: 'Guenstiger als DeepL & iTranslate' },
          ].map((item, i) => (
            <a
              key={i}
              href={`${SALES_BASE}/${item.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="p-4 hover:bg-muted/50 transition-colors h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{item.label}</h3>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-xs text-primary mt-1">{item.desc}</p>
              </Card>
            </a>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Haeufig gestellte Fragen</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <Card key={i} className="p-5">
              <h3 className="font-semibold text-sm">{item.q}</h3>
              <p className="text-xs text-muted-foreground mt-2">{item.a}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold">Bereit?</h2>
        <p className="text-muted-foreground">
          Starten Sie kostenlos — keine Kreditkarte, kein Account noetig.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Kostenlos starten
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/kontakt?type=demo">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Demo anfragen
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href={SALES_BASE} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Enterprise Sales Tool
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
