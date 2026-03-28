/**
 * Pricing Page
 *
 * Complete pricing overview for all Fintutto products.
 * 3 Revenue Streams: SaaS, Guide SaaS, Transactions.
 */

import { Link } from 'react-router-dom'
import {
  ArrowRight, Check, ChevronRight, Users, Building, Ship,
  GraduationCap, Building2, HeartHandshake, Heart, Presentation,
  HandshakeIcon, Palette, MapPin, Mountain
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const TRANSLATOR_TIERS = [
  { name: 'Free', price: '0 EUR', period: '', desc: 'Fuer alle', features: ['22 Sprachen + Offline', '500 Uebersetzungen/Tag', 'Gespraechsmodus', 'Kamera-OCR', 'Phrasebook'], link: '/apps/translator' },
  { name: 'Personal Pro', price: '4,99 EUR', period: '/Mo', desc: 'Reisende & Expats', features: ['30 Sprachen', 'Azure-Qualitaet', 'Unbegrenzte Uebersetzungen', 'Live-Session (3 Hoerer)', 'Kein Werbebanner'], link: '/apps/translator' },
  { name: 'Guide Basic', price: '29 EUR', period: '/Mo', desc: 'Freiberufliche Guides', features: ['45 Sprachen', '10 Hoerer pro Session', 'QR-Code-Join', 'Pre-Translation Uploads', 'Session-Statistiken'], link: '/apps/enterprise' },
  { name: 'Guide Pro', price: '69 EUR', period: '/Mo', desc: 'Professionelle Guides', features: ['Alles aus Basic', '30 Hoerer', 'Glossare', 'Transkript-Export', 'Prioritaets-Support'], link: '/apps/enterprise', highlight: true },
]

const ENTERPRISE_TIERS = [
  { name: 'Agentur Standard', price: '99 EUR', period: '/Mo', desc: 'Agenturen', features: ['30 Hoerer, 3 Sessions', '3 Guide-Accounts', 'Zentrale Abrechnung', 'Team-Dashboard'] },
  { name: 'Agentur Premium', price: '249 EUR', period: '/Mo', desc: 'Grosse Agenturen', features: ['100 Hoerer, 10 Sessions', '10 Guide-Accounts', 'White-Label', 'API-Zugang'] },
  { name: 'Event Basic', price: '199 EUR', period: '/Mo', desc: 'Konferenzen', features: ['100 Hoerer', '3 Sessions/Mo', 'Multi-Kanal', 'QR-Poster'], highlight: true },
  { name: 'Event Pro', price: '499 EUR', period: '/Mo', desc: 'Grossveranstaltungen', features: ['500 Hoerer', '10 Sessions/Mo', 'Speaker-Dashboard', 'Transkripte'] },
]

const CRUISE_TIERS = [
  { name: 'Cruise Starter', price: '4.990 EUR', period: '/Mo', desc: '1 Schiff', features: ['500 Hoerer', '20 Sessions', '10 Guide-Accounts', 'Offline-Modus'] },
  { name: 'Cruise Fleet', price: '14.990 EUR', period: '/Mo', desc: '3 Schiffe', features: ['Unbegrenzte Hoerer', 'Unbegrenzte Sessions', 'Fleet-Dashboard', 'API + White-Label'], highlight: true },
  { name: 'Cruise Armada', price: '39.990 EUR', period: '/Mo', desc: '10+ Schiffe', features: ['Alles aus Fleet', 'Dedicated Server', 'SLA 99,9%', 'Custom Development'] },
]

const SEGMENT_TIERS = [
  { icon: GraduationCap, segment: 'Schulen', tiers: [{ name: 'Einzellizenz', price: '9,90 EUR/Mo' }, { name: 'Schullizenz', price: '49,90 EUR/Mo' }], color: 'text-blue-300', link: '/solutions/schools' },
  { icon: Building2, segment: 'Behoerden', tiers: [{ name: 'Einzelplatz', price: '14,90 EUR/Mo' }, { name: 'Behoerdenlizenz', price: '99 EUR/Mo' }], color: 'text-teal-300', link: '/solutions/authorities' },
  { icon: HeartHandshake, segment: 'NGO', tiers: [{ name: 'Ehrenamtlich', price: 'Kostenlos' }, { name: 'Organisation', price: '9,90 EUR/Mo' }], color: 'text-orange-300', link: '/solutions/ngo' },
  { icon: HandshakeIcon, segment: 'Hospitality', tiers: [{ name: 'Einzelplatz', price: '29,90 EUR/Mo' }, { name: 'Business', price: '99 EUR/Mo' }], color: 'text-violet-300', link: '/solutions/hospitality' },
  { icon: Heart, segment: 'Medizin', tiers: [{ name: 'Praxis', price: '29,90 EUR/Mo' }, { name: 'Klinik', price: '199 EUR/Mo' }], color: 'text-red-300', link: '/solutions/medical' },
  { icon: Presentation, segment: 'Events', tiers: [{ name: 'Basic', price: '199 EUR/Mo' }, { name: 'Pro', price: '499 EUR/Mo' }], color: 'text-blue-300', link: '/solutions/events' },
]

const GUIDE_TIERS = [
  { name: 'Starter', price: '49 EUR', period: '/Mo', desc: 'Kleine Museen', features: ['50 Werke', '2 Sprachen', 'QR-Positionierung', 'Basis-Analytics'], link: '/products/artguide' },
  { name: 'Professional', price: '199 EUR', period: '/Mo', desc: 'Mittlere Museen', features: ['500 Werke', '10 Sprachen', 'BLE + GPS', 'Heatmaps', 'KI-Chat'], link: '/products/artguide', highlight: true },
  { name: 'Enterprise', price: '599 EUR', period: '/Mo', desc: 'Grosse Museen & Staedte', features: ['Unbegrenzte Werke', 'Alle Sprachen', 'White-Label', 'API-Zugang', 'Dedicated Support'], link: '/products/artguide' },
]

export default function PricingPage() {
  return (
    <div className="relative max-w-5xl mx-auto space-y-20 py-8 px-4 text-white">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.65]" />
      </div>

      {/* Hero */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-95" />
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Preise & Plaene
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Transparent. Fair.<br />
            <span className="text-sky-300">Fuer jede Groesse.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Von kostenlos bis Enterprise — finde den Plan, der zu dir passt.
            Alle Preise netto zzgl. MwSt.
          </p>
        </div>
      </div>

      {/* Translator Plans */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">Translator — Persoenlich & Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRANSLATOR_TIERS.map((tier, i) => (
            <Card key={i} className={`p-5 space-y-4 bg-black/30 backdrop-blur-sm border-white/10 ${tier.highlight ? 'ring-1 ring-sky-400' : ''}`}>
              {tier.highlight && <span className="text-xs font-semibold text-sky-300">Beliebtester Plan</span>}
              <div>
                <h3 className="font-bold text-lg">{tier.name}</h3>
                <p className="text-xs text-white/60">{tier.desc}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-sky-300">{tier.price}</span>
                {tier.period && <span className="text-white/60 text-sm">{tier.period}</span>}
              </div>
              <ul className="space-y-1.5">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-sky-300 mt-0.5 shrink-0" />
                    <span className="text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={tier.link}>
                <Button size="sm" variant={tier.highlight ? 'default' : 'outline'} className={`w-full gap-1 ${!tier.highlight ? 'border-white/30 text-white hover:bg-white/10' : ''}`}>
                  Waehlen <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Enterprise */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">Agenturen & Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENTERPRISE_TIERS.map((tier, i) => (
            <Card key={i} className={`p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10 ${tier.highlight ? 'ring-1 ring-sky-400' : ''}`}>
              <h3 className="font-bold">{tier.name}</h3>
              <p className="text-xs text-white/60">{tier.desc}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-sky-300">{tier.price}</span>
                <span className="text-white/60 text-xs">{tier.period}</span>
              </div>
              <ul className="space-y-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs">
                    <Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Cruise */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">Kreuzfahrt & Flotten</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CRUISE_TIERS.map((tier, i) => (
            <Card key={i} className={`p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10 ${tier.highlight ? 'ring-1 ring-sky-400' : ''}`}>
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-sky-300" />
                <h3 className="font-bold">{tier.name}</h3>
              </div>
              <p className="text-xs text-white/60">{tier.desc}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-sky-300">{tier.price}</span>
                <span className="text-white/60 text-xs">{tier.period}</span>
              </div>
              <ul className="space-y-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs">
                    <Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Segment Prices */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">Branchenloesungen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SEGMENT_TIERS.map((seg, i) => {
            const Icon = seg.icon
            return (
              <Link key={i} to={seg.link}>
                <Card className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10 hover:bg-white/5 transition-colors h-full">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${seg.color}`} />
                    <h3 className="font-bold">{seg.segment}</h3>
                  </div>
                  <div className="space-y-2">
                    {seg.tiers.map((t, j) => (
                      <div key={j} className="flex justify-between items-center text-sm">
                        <span className="text-white/70">{t.name}</span>
                        <span className={`font-semibold ${seg.color}`}>{t.price}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-white/50 flex items-center gap-1">
                    Mehr erfahren <ChevronRight className="w-3 h-3" />
                  </span>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Guide SaaS */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">Art Guide / City Guide / Region Guide</h2>
        <p className="text-center text-white/60">KI-Audioguide-System fuer Museen, Staedte und Regionen</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {GUIDE_TIERS.map((tier, i) => (
            <Card key={i} className={`p-5 space-y-4 bg-black/30 backdrop-blur-sm border-white/10 ${tier.highlight ? 'ring-1 ring-violet-400' : ''}`}>
              {tier.highlight && <span className="text-xs font-semibold text-violet-300">Empfohlen</span>}
              <div>
                <h3 className="font-bold text-lg">{tier.name}</h3>
                <p className="text-xs text-white/60">{tier.desc}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-violet-300">{tier.price}</span>
                <span className="text-white/60 text-sm">{tier.period}</span>
              </div>
              <ul className="space-y-1.5">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-violet-300 mt-0.5 shrink-0" />
                    <span className="text-white/80">{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold drop-shadow-lg">Fragen zu Preisen?</h2>
        <p className="text-white/70">Kontaktiere uns fuer individuelle Angebote und Testlizenzen.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="mailto:info@fintutto.world">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Kontakt aufnehmen <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <Link to="/">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
              Zurueck zur Uebersicht <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
