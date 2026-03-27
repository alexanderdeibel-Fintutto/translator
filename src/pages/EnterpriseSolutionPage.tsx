// EnterpriseSolutionPage — Mobile-First Enterprise-Übersicht
// Route: /loesungen/enterprise

import { Link } from 'react-router-dom'
import {
  Building2, Mic, Map, Users, Globe2, BarChart3, Shield, Zap,
  ArrowRight, ChevronRight, Check, Headphones, Layers, QrCode,
  MessageCircleQuestion, Bluetooth, Wifi, ScanText
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const STATS = [
  { value: '99 EUR',  label: 'ab / Monat' },
  { value: '130+',    label: 'Sprachen' },
  { value: '500',     label: 'Teilnehmer max.' },
  { value: '90 %',    label: 'Kostenersparnis' },
]

const USE_CASES = [
  {
    icon: Building2, color: 'text-violet-400', bg: 'bg-violet-500/15',
    title: 'Museen & Ausstellungen',
    desc: 'QR-Code statt Audio-Guide-Gerät. Besucher scannen und hören in ihrer Sprache — ohne App, ohne Leihgerät.',
    link: '/museum', linkLabel: 'Museum-Lösung',
  },
  {
    icon: Mic, color: 'text-sky-400', bg: 'bg-sky-500/15',
    title: 'Konferenzen & Kongresse',
    desc: '500 Teilnehmer · Q&A-Moderation · 90% günstiger als Simultandolmetscher.',
    link: '/sales/conference', linkLabel: 'Conference-Lösung',
  },
  {
    icon: Map, color: 'text-emerald-400', bg: 'bg-emerald-500/15',
    title: 'Messen & Ausstellungen',
    desc: 'Standpräsentationen in jeder Sprache — internationale Besucher verstehen Ihr Produkt sofort.',
    link: '/loesungen/agenturen', linkLabel: 'Agenturen-Lösung',
  },
  {
    icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/15',
    title: 'Werkführungen & Schulungen',
    desc: 'Onboarding, Besuchergruppen, Sicherheitsunterweisungen — alles mit einem QR-Code.',
    link: '/kontakt', linkLabel: 'Demo anfragen',
  },
]

const FEATURES = [
  { icon: Headphones,            title: 'Audio & Text',          desc: 'Zuhören oder lesen — je nach Präferenz.' },
  { icon: MessageCircleQuestion, title: 'Q&A-Moderation',        desc: 'Publikum stellt Fragen, Host moderiert.' },
  { icon: Zap,                   title: 'Offline-Modus',          desc: 'Kein WLAN? Funktioniert trotzdem.' },
  { icon: QrCode,                title: 'QR-Code-System',         desc: 'Pro Station oder für die gesamte Veranstaltung.' },
  { icon: Bluetooth,             title: 'BLE-Transport',          desc: 'Bluetooth — null Infrastruktur nötig.' },
  { icon: Wifi,                  title: 'Hotspot-Modus',          desc: 'Eigenes WLAN ohne Router oder Internet.' },
  { icon: ScanText,              title: 'Dokument-Scanner',       desc: 'Schilder, Formulare, Speisekarten — sofort übersetzt.' },
  { icon: Layers,                title: 'White-Label',            desc: 'Ihre Marke, Ihre Domain.' },
  { icon: BarChart3,             title: 'Event Analytics',        desc: 'Sprachverteilung, Nutzungsdauer, Insights.' },
  { icon: Shield,                title: 'Enterprise Security',    desc: 'DSGVO · E2E-verschlüsselt · SSO · SLA.' },
]

const STEPS = [
  { step: '1', title: 'Session starten',       desc: 'Live-Session oder QR-Code erstellen — in 2 Minuten.' },
  { step: '2', title: 'Teilnehmer joinen',      desc: 'QR-Code scannen, Sprache wählen, fertig. Keine App.' },
  { step: '3', title: 'Speaker spricht',        desc: 'Echtzeit-Übersetzung auf allen Geräten. Q&A inklusive.' },
  { step: '4', title: 'Auswerten',              desc: 'Analytics: Sprachen, Nutzungsdauer, beliebteste Inhalte.' },
]

const PLANS = [
  { name: 'Starter',    price: '99 EUR/Mo',   features: ['1 Event gleichzeitig', '30 Sprachen', '100 Teilnehmer', 'Basis-Analytics'],                          cta: 'Starten',           href: '/pricing',          highlight: false },
  { name: 'Pro',        price: '499 EUR/Mo',  features: ['5 Events gleichzeitig', '130+ Sprachen', '500 Teilnehmer', 'HD Audio', 'White-Label', 'Q&A'],         cta: 'Demo anfragen',     href: '/kontakt?type=demo', highlight: true  },
  { name: 'Enterprise', price: 'Individuell', features: ['Unbegrenzte Events', 'API-Integration', 'SLA', 'Dedizierter Support', 'Custom Onboarding'],            cta: 'Kontakt aufnehmen', href: '/kontakt',           highlight: false },
]

export default function EnterpriseSolutionPage() {
  return (
    <div className="relative max-w-2xl mx-auto space-y-10 py-6 px-4 text-white">


      {/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[280px] h-[280px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Museen · Kongresse · Messen · Events
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Events ohne Sprachbarrieren.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            Ohne Dolmetscher. Ohne Hardware. Mit Q&A-Moderation. Ab 99 EUR/Monat.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Link to="/pricing">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Jetzt starten <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/live">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                Live-Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STATS.map((s, i) => (
          <div key={i} className="text-center p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15">
            <div className="text-xl font-bold text-sky-300">{s.value}</div>
            <div className="text-[11px] text-white/65">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Anwendungsfälle */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Für wen?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {USE_CASES.map((uc, i) => {
            const Icon = uc.icon
            return (
              <Card key={i} className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${uc.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${uc.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm leading-tight">{uc.title}</h3>
                </div>
                <p className="text-xs text-white/70 leading-snug">{uc.desc}</p>
                <Link to={uc.link}>
                  <Button size="sm" variant="outline" className="w-full text-xs border-white/25 text-white hover:bg-white/10 mt-1">
                    {uc.linkLabel} <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Alle Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-1">
                <Icon className="w-4 h-4 text-sky-300" />
                <p className="font-semibold text-xs">{f.title}</p>
                <p className="text-[11px] text-white/65 leading-snug">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* So funktioniert's */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">In 4 Schritten</h2>
        <Card className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-500/25 text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
              <div>
                <p className="font-semibold text-sm">{s.title}</p>
                <p className="text-xs text-white/65">{s.desc}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Preise */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Preise</h2>
        <div className="space-y-3">
          {PLANS.map((p, i) => (
            <Card key={i} className={`p-4 backdrop-blur-md border ${p.highlight ? 'bg-sky-500/20 border-sky-400/40' : 'bg-black/25 border-white/15'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-bold text-sm">{p.name}</h3>
                  <p className={`text-lg font-bold ${p.highlight ? 'text-sky-300' : 'text-white'}`}>{p.price}</p>
                </div>
                {p.highlight && <span className="text-[10px] bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded-full font-semibold shrink-0">Empfohlen</span>}
              </div>
              <ul className="space-y-1 mb-3">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-white/80">
                    <Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to={p.href}>
                <Button size="sm" className="w-full">{p.cta} <ChevronRight className="h-3 w-3 ml-1" /></Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-2 py-2">
        <Link to="/features">
          <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
            Alle Features <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
        <Link to="/compare">
          <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
            Vergleich <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

    </div>
  )
}
