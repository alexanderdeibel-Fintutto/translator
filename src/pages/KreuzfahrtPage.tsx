// KreuzfahrtPage — Mobile-First für Kreuzfahrt-Reedereien
// Route: /loesungen/kreuzfahrt

import { Link } from 'react-router-dom'
import {
  Globe2, TrendingDown, Shield, Zap, ArrowRight,
  ChevronRight, Check, BarChart3, Layers, Headphones,
  Radio, MessageCircleQuestion, Bluetooth, Wifi
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const STATS = [
  { value: '93 %',  label: 'Kostenersparnis' },
  { value: '130+',  label: 'Sprachen' },
  { value: '50+',   label: 'Häfen weltweit' },
  { value: '< 1 s', label: 'Latenz' },
]

const SAVINGS = [
  { label: 'Traditionell (10 Schiffe, 6 Sprachen)', value: '4.800.000 EUR/Jahr', highlight: false },
  { label: 'Mit Fintutto (Enterprise)',              value: '~ 325.000 EUR/Jahr', highlight: false },
  { label: 'Ersparnis',                              value: '93 % — 4.475.000 EUR/Jahr', highlight: true },
]

const FEATURES = [
  { icon: Radio,                 color: 'text-violet-400', bg: 'bg-violet-500/15', title: '1→N Live-Broadcasting',  desc: '1 Guide, beliebig viele Gäste — alle hören in ihrer Sprache.' },
  { icon: MessageCircleQuestion, color: 'text-sky-400',    bg: 'bg-sky-500/15',    title: 'Q&A-Moderation',         desc: 'Gäste stellen Fragen — Guide moderiert und sendet an alle.' },
  { icon: Headphones,            color: 'text-emerald-400',bg: 'bg-emerald-500/15',title: 'Chirp 3 HD Audio',       desc: 'Natürliche Stimme — Gäste hören statt lesen.' },
  { icon: Zap,                   color: 'text-amber-400',  bg: 'bg-amber-500/15',  title: 'Offline-Modus',          desc: 'Kein Internet auf hoher See? Funktioniert trotzdem.' },
  { icon: Bluetooth,             color: 'text-indigo-400', bg: 'bg-indigo-500/15', title: 'BLE-Transport',          desc: 'Bluetooth — null Infrastruktur, überall einsetzbar.' },
  { icon: Wifi,                  color: 'text-orange-400', bg: 'bg-orange-500/15', title: 'Hotspot-Modus',          desc: 'Guide-Gerät wird zum WLAN-Router — kein Internet nötig.' },
  { icon: Layers,                color: 'text-rose-400',   bg: 'bg-rose-500/15',   title: 'White-Label',            desc: 'Reederei-Branding — kein Fintutto-Logo.' },
  { icon: BarChart3,             color: 'text-blue-400',   bg: 'bg-blue-500/15',   title: 'Fleet Analytics',        desc: 'Aggregierte Auswertungen über alle Schiffe.' },
  { icon: Shield,                color: 'text-green-400',  bg: 'bg-green-500/15',  title: 'Enterprise Security',    desc: 'DSGVO · E2E-verschlüsselt · SSO · SLA.' },
  { icon: Globe2,                color: 'text-teal-400',   bg: 'bg-teal-500/15',   title: '130+ Sprachen',          desc: 'Von Japanisch bis Swahili — kein Hafen zu exotisch.' },
]

const STEPS = [
  { step: '1', title: 'Inhalte zentralisieren', desc: 'Skripte, Routen, POI-Beschreibungen — einmalig eingepflegt.' },
  { step: '2', title: 'KI übersetzt',           desc: 'Automatisch in 130+ Sprachen. Fachbegriffe korrekt.' },
  { step: '3', title: 'Guide führt',            desc: '1 Guide spricht — Gäste hören in ihrer Sprache. QR-Code genügt.' },
  { step: '4', title: 'Analytics auswerten',    desc: 'Welche Sprachen, welche Exkursionen? Daten für bessere Planung.' },
]

const TIERS = [
  { name: 'Pilot',  desc: '1 Schiff · 3 Monate Testphase',  cta: 'Pilot starten',       href: '/kontakt',           highlight: false },
  { name: 'Fleet',  desc: '2–5 Schiffe · Jahresvertrag',     cta: 'Angebot anfragen',    href: '/kontakt',           highlight: true  },
  { name: 'Armada', desc: '6+ Schiffe · Custom SLA',         cta: 'Enterprise-Gespräch', href: '/kontakt',           highlight: false },
]

export default function KreuzfahrtPage() {
  return (
    <div className="relative max-w-2xl mx-auto space-y-10 py-6 px-4 text-white">


      {/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[280px] h-[280px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Enterprise für Kreuzfahrt-Reedereien
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Shore Excursions in jeder Sprache. Für jedes Schiff.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            1 Guide + KI = 130+ Sprachen. 93% günstiger als mehrsprachige Guides. Offline-fähig auf hoher See.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Link to="/kontakt">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Pilot anfragen <ArrowRight className="h-4 w-4" />
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

      {/* Kostenersparnis */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-bold drop-shadow-lg">Ihre Ersparnis</h2>
        </div>
        <Card className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-2">
          {SAVINGS.map((row, i) => (
            <div key={i} className={`flex items-center justify-between gap-3 p-2 rounded-lg ${row.highlight ? 'bg-green-500/20 border border-green-400/30' : ''}`}>
              <p className={`text-xs ${row.highlight ? 'font-bold text-green-300' : 'text-white/75'}`}>{row.label}</p>
              <p className={`text-sm font-bold shrink-0 ${row.highlight ? 'text-green-300' : 'text-white'}`}>{row.value}</p>
            </div>
          ))}
          <p className="text-[11px] text-white/50 pt-1">Basis: 8 Guides/Schiff × 300 EUR/Tag × 200 Exkursionstage × 10 Schiffe</p>
        </Card>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Features für Reedereien</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div key={i} className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-1">
                <div className={`w-7 h-7 rounded-lg ${f.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${f.color}`} />
                </div>
                <p className="font-semibold text-xs leading-tight">{f.title}</p>
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

      {/* Enterprise-Tiers */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Einstiegsprogramme</h2>
        <div className="space-y-3">
          {TIERS.map((t, i) => (
            <Card key={i} className={`p-4 backdrop-blur-md border ${t.highlight ? 'bg-sky-500/20 border-sky-400/40' : 'bg-black/25 border-white/15'}`}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-bold text-sm">{t.name}</h3>
                  <p className="text-xs text-white/65">{t.desc}</p>
                </div>
                {t.highlight && <span className="text-[10px] bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded-full font-semibold shrink-0">Beliebt</span>}
              </div>
              <Link to={t.href}>
                <Button size="sm" className="w-full">{t.cta} <ChevronRight className="h-3 w-3 ml-1" /></Button>
              </Link>
            </Card>
          ))}
        </div>
        <p className="text-xs text-white/50 text-center">Enterprise-Pricing auf Anfrage · SLA · dedizierter Support</p>
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-2 py-2">
        <Link to="/features">
          <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
            Alle Features <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
        <Link to="/technology">
          <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
            Technologie <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

    </div>
  )
}
