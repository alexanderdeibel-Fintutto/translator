// PricingOverviewPage — Ausführliche Preisübersicht
// Route: /preise

import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, Check, MessageCircleQuestion, ScanText,
  Bluetooth, Wifi, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  href: string
}

const PLANS: PlanInfo[] = [
  {
    name: 'Kostenlos',
    segment: 'personal',
    segmentLabel: 'Privat',
    price: '0 EUR',
    yearlyPrice: '0 EUR',
    period: 'für immer',
    description: 'Übersetzen, Sprechen, Offline — ohne Kreditkarte.',
    highlights: ['22 Sprachen', '500 Übersetzungen/Tag', 'Offline-Modus', 'Kamera-Scanner (OCR)', 'Phrasebook'],
    href: '/pricing',
  },
  {
    name: 'Personal Pro',
    segment: 'personal',
    segmentLabel: 'Privat',
    price: '4,99 EUR',
    yearlyPrice: '49,90 EUR',
    period: '/Monat',
    description: 'Für Arzt, Behörde, Reise — professionelle Qualität.',
    highlights: ['30 Sprachen', 'Unbegrenzte Übersetzungen', 'Live-Session (3 Hörer)', 'Azure-Qualität', 'Offline + Neural-TTS'],
    href: '/pricing',
  },
  {
    name: 'Guide Basic',
    segment: 'guide',
    segmentLabel: 'Guide',
    price: '29 EUR',
    yearlyPrice: '290 EUR',
    period: '/Monat',
    description: 'Für einzelne Stadtführer und Freelancer.',
    highlights: ['10 Hörer pro Session', '5 Sprachen', '300 Min/Monat', 'QR-Code Join', 'Hotspot-Modus'],
    href: '/pricing',
  },
  {
    name: 'Guide Pro',
    segment: 'guide',
    segmentLabel: 'Guide',
    price: '49 EUR',
    yearlyPrice: '490 EUR',
    period: '/Monat',
    description: 'Professionelle Guides mit größeren Gruppen.',
    highlights: ['25 Hörer', '10 Sprachen', 'Q&A-Moderation', 'BLE-Transport', 'Neural2-TTS'],
    badge: 'Beliebt',
    href: '/pricing',
  },
  {
    name: 'Agentur Standard',
    segment: 'agency',
    segmentLabel: 'Business',
    price: '99 EUR',
    yearlyPrice: '990 EUR',
    period: '/Monat',
    description: 'Reiseagenturen mit mehreren Guides.',
    highlights: ['30 Hörer × 3 Sessions', '15 Sprachen', 'Guide-Management', 'Q&A-Moderation', 'Dashboard-Analytics'],
    href: '/pricing',
  },
  {
    name: 'Agentur Premium',
    segment: 'agency',
    segmentLabel: 'Business',
    price: '249 EUR',
    yearlyPrice: '2.490 EUR',
    period: '/Monat',
    description: 'Große Agenturen und Tour-Operatoren.',
    highlights: ['50 Hörer × 10 Sessions', 'Alle Sprachen', 'White-Label', 'Chirp 3 HD', 'API-Zugang'],
    badge: 'Beliebt',
    href: '/pricing',
  },
  {
    name: 'Event Basic',
    segment: 'event',
    segmentLabel: 'Event',
    price: '199 EUR',
    yearlyPrice: '1.990 EUR',
    period: '/Monat',
    description: 'Konferenzen, Messen und Workshops.',
    highlights: ['100 Hörer × 3 Sessions', '20 Sprachen', 'Q&A-Moderation', 'Protokoll-Export', 'Neural2-TTS'],
    href: '/sales/conference',
  },
  {
    name: 'Event Pro',
    segment: 'event',
    segmentLabel: 'Event',
    price: '499 EUR',
    yearlyPrice: '4.990 EUR',
    period: '/Monat',
    description: 'Große Konferenzen und Multi-Track-Events.',
    highlights: ['500 Hörer × 10 Sessions', 'Alle Sprachen', 'Q&A-Moderation', 'Chirp 3 HD', 'White-Label'],
    badge: 'Enterprise',
    href: '/sales/conference',
  },
  {
    name: 'Cruise Starter',
    segment: 'cruise',
    segmentLabel: 'Cruise',
    price: '1.990 EUR',
    yearlyPrice: '19.900 EUR',
    period: '/Monat',
    description: '1 Schiff mit unbegrenzten Hörern.',
    highlights: ['Unbegrenzte Hörer × 5 Sessions', '8 Sprachen', 'BLE + Neural2-TTS', 'Guide-Management', 'Protokoll-Export'],
    href: '/loesungen/kreuzfahrt',
  },
  {
    name: 'Cruise Fleet',
    segment: 'cruise',
    segmentLabel: 'Cruise',
    price: '6.990 EUR',
    yearlyPrice: '69.900 EUR',
    period: '/Monat',
    description: '5–10 Schiffe mit Premium-Stimmen und API.',
    highlights: ['Unbegrenzte Hörer × 50 Sessions', '12 Sprachen', 'Chirp 3 HD', 'White-Label', 'SLA 99,5%'],
    badge: 'Enterprise',
    href: '/loesungen/kreuzfahrt',
  },
  {
    name: 'Cruise Armada',
    segment: 'cruise',
    segmentLabel: 'Cruise',
    price: '19.990 EUR',
    yearlyPrice: '199.900 EUR',
    period: '/Monat',
    description: '10+ Schiffe — alle Sprachen, voller API-Zugang.',
    highlights: ['Unbegrenzte Hörer + Sessions', 'Alle Sprachen', 'Full-API + SSO', 'Dedicated Support', 'SLA 99,9%'],
    badge: 'Enterprise',
    href: '/loesungen/kreuzfahrt',
  },
]

const SEGMENT_COLORS: Record<string, string> = {
  personal: 'bg-blue-500/20 text-blue-300',
  guide:    'bg-green-500/20 text-green-300',
  agency:   'bg-purple-500/20 text-purple-300',
  event:    'bg-amber-500/20 text-amber-300',
  cruise:   'bg-cyan-500/20 text-cyan-300',
}

const NEW_FEATURES = [
  { icon: MessageCircleQuestion, title: 'Q&A-Moderation', desc: 'Ab Guide Pro — Publikum stellt Fragen, Host moderiert und sendet an alle.' },
  { icon: ScanText,              title: 'Dokument-Scanner', desc: 'In allen Plänen — Schilder & Dokumente fotografieren → sofort übersetzt.' },
  { icon: Bluetooth,             title: 'BLE-Transport', desc: 'Ab Guide Pro — Bluetooth-Gruppen ohne Internet.' },
  { icon: Wifi,                  title: 'Hotspot-Modus', desc: 'Ab Guide Basic — WLAN-Hotspot als lokaler Server.' },
  { icon: Zap,                   title: 'Offline-KI', desc: 'In allen Plänen — Übersetzung ohne Datenverbindung.' },
]

const FAQ = [
  { q: 'Kann ich jederzeit upgraden?', a: 'Ja, jederzeit. Beim Upgrade wird die Differenz anteilig berechnet.' },
  { q: 'Gibt es eine Mindestlaufzeit?', a: 'Nein bei Monatsplänen. Jahrespläne: 12 Monate mit 2 Monaten gratis (17% Rabatt).' },
  { q: 'Was passiert bei Minuten-Limit?', a: 'Faire Overage-Preise oder Upgrade. Bestehende Sessions laufen weiter.' },
  { q: 'Ist der Free-Plan wirklich kostenlos?', a: 'Ja. Dauerhaft kostenlos mit 22 Sprachen und 500 Übersetzungen/Tag. Keine Kreditkarte.' },
  { q: 'Was ist Q&A-Moderation?', a: 'Hörer können Textfragen stellen. Der Host sieht die Inbox, genehmigt Fragen und sendet sie an alle Teilnehmer in deren Sprache.' },
]

export default function PricingOverviewPage() {
  return (
    <div className="relative max-w-2xl mx-auto space-y-8 py-6 px-4 text-white">


      {/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[260px] h-[260px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Preise
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Transparente Preise. Kostenlos starten.
          </h1>
          <p className="text-sm text-white/80 max-w-md mx-auto drop-shadow">
            11 Pläne in 5 Segmenten — von 0 EUR bis Enterprise. Jährlich = 2 Monate gratis.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Link to="/pricing">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Plan wählen <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/compare">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 gap-2">
                Vergleich <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* New features callout */}
      <div className="p-4 rounded-2xl bg-sky-500/15 backdrop-blur-md border border-sky-400/30 space-y-3">
        <p className="text-xs font-semibold text-sky-300 uppercase tracking-wide">Neu in allen Plänen</p>
        <div className="grid grid-cols-1 gap-2">
          {NEW_FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 text-sky-300 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-semibold">{f.title}</span>
                  <span className="text-[11px] text-white/60"> — {f.desc}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* All plans */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Alle 11 Pläne</h2>
        <p className="text-xs text-white/60">Jährlich zahlen = 17% Rabatt (2 Monate gratis)</p>
        <div className="space-y-2">
          {PLANS.map((plan, i) => (
            <div key={i} className={`p-4 rounded-xl backdrop-blur-md border ${plan.badge ? 'bg-sky-500/15 border-sky-400/30' : 'bg-black/25 border-white/15'}`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${SEGMENT_COLORS[plan.segment] || ''}`}>
                    {plan.segmentLabel}
                  </span>
                  <h3 className="font-bold text-sm mt-1">{plan.name}</h3>
                  <p className="text-[11px] text-white/60">{plan.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-sky-300">{plan.price}</div>
                  <div className="text-[10px] text-white/50">{plan.period}</div>
                  {plan.yearlyPrice !== '0 EUR' && (
                    <div className="text-[10px] text-white/40">{plan.yearlyPrice}/Jahr</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {plan.highlights.map((h, j) => (
                  <div key={j} className="flex items-start gap-1 text-[11px] text-white/70">
                    <Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />{h}
                  </div>
                ))}
              </div>
              <Link to={plan.href}>
                <Button size="sm" className="w-full" variant={plan.badge ? 'default' : 'outline'}>
                  {plan.badge ? 'Jetzt wählen' : 'Plan ansehen'}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Overage */}
      <div className="p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 space-y-3">
        <h2 className="text-lg font-bold drop-shadow">Overage-Preise</h2>
        <p className="text-xs text-white/60">Wenn Sie die inkludierten Minuten überschreiten:</p>
        <div className="space-y-1">
          {[
            { segment: 'Guide Basic', overage: '0,15 EUR/Min', lang: '+2,99 EUR/Sprache' },
            { segment: 'Guide Pro', overage: '0,12 EUR/Min', lang: '+1,99 EUR/Sprache' },
            { segment: 'Agentur Standard', overage: '0,10 EUR/Min', lang: '+1,49 EUR/Sprache' },
            { segment: 'Agentur Premium', overage: '0,08 EUR/Min', lang: 'Alle inkl.' },
            { segment: 'Event Basic', overage: '0,08 EUR/Min', lang: '+0,99 EUR/Sprache' },
            { segment: 'Event Pro', overage: '0,06 EUR/Min', lang: 'Alle inkl.' },
            { segment: 'Cruise Starter', overage: '0,80 EUR/Min', lang: '+49 EUR/Sprache' },
            { segment: 'Cruise Fleet', overage: '0,60 EUR/Min', lang: '+39 EUR/Sprache' },
            { segment: 'Cruise Armada', overage: '0,40 EUR/Min', lang: 'Alle inkl.' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between text-[11px] py-1 border-b border-white/10 last:border-0">
              <span className="text-white/80">{row.segment}</span>
              <span className="text-sky-300 font-mono">{row.overage}</span>
              <span className="text-white/50">{row.lang}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Häufige Fragen</h2>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15">
              <p className="font-semibold text-xs mb-1">{item.q}</p>
              <p className="text-[11px] text-white/65">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 text-center space-y-3">
        <h2 className="text-lg font-bold drop-shadow">Noch Fragen?</h2>
        <p className="text-sm text-white/70">Wir beraten Sie gerne — kostenlos und unverbindlich.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/kontakt?type=demo">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              Demo anfragen <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 gap-2">
              Plan-Vergleich <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

    </div>
  )
}
