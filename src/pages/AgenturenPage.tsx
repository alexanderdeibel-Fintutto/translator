// AgenturenPage — Mobile-First für Reiseveranstalter & Guide-Agenturen
// Route: /loesungen/agenturen

import { Link } from 'react-router-dom'
import {
  Globe2, Users, BarChart3, Shield, Zap, ArrowRight,
  ChevronRight, Check, Settings, Layers, Radio,
  MessageCircleQuestion, Bluetooth, Wifi, QrCode
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const STATS = [
  { value: '99 EUR',  label: 'ab / Monat' },
  { value: '∞',       label: 'Guides & Touren' },
  { value: '130+',    label: 'Sprachen' },
  { value: '100 %',   label: 'Qualitätskontrolle' },
]

const FEATURES = [
  { icon: Radio,                 color: 'text-violet-400', bg: 'bg-violet-500/15', title: '1→N Live-Broadcasting',  desc: '1 Guide spricht — alle Gäste hören in ihrer Sprache.' },
  { icon: MessageCircleQuestion, color: 'text-sky-400',    bg: 'bg-sky-500/15',    title: 'Q&A-Moderation',         desc: 'Gäste stellen Fragen — Guide moderiert und sendet an alle.' },
  { icon: Settings,              color: 'text-emerald-400',bg: 'bg-emerald-500/15',title: 'Zentrales Management',   desc: 'Alle Touren, Skripte und Guides an einem Ort.' },
  { icon: Users,                 color: 'text-amber-400',  bg: 'bg-amber-500/15',  title: 'Team-Verwaltung',        desc: 'Sub-Accounts mit Berechtigungen. Zentrale Abrechnung.' },
  { icon: Zap,                   color: 'text-orange-400', bg: 'bg-orange-500/15', title: 'Offline-Modus',          desc: 'Kein Internet? Funktioniert trotzdem — BLE oder Hotspot.' },
  { icon: Bluetooth,             color: 'text-indigo-400', bg: 'bg-indigo-500/15', title: 'BLE-Transport',          desc: 'Bluetooth — null Infrastruktur, überall einsetzbar.' },
  { icon: Wifi,                  color: 'text-teal-400',   bg: 'bg-teal-500/15',   title: 'Hotspot-Modus',          desc: 'Guide-Gerät wird zum WLAN-Router — kein Internet nötig.' },
  { icon: QrCode,                color: 'text-rose-400',   bg: 'bg-rose-500/15',   title: 'QR-Code-Join',           desc: 'Scannen → Sprache wählen → fertig. Keine App.' },
  { icon: Shield,                color: 'text-green-400',  bg: 'bg-green-500/15',  title: 'Qualitätskontrolle',     desc: 'Standardisierte Skripte — jeder Gast, dasselbe Erlebnis.' },
  { icon: BarChart3,             color: 'text-yellow-400', bg: 'bg-yellow-500/15', title: 'Analytics',              desc: 'Welche Touren, Sprachen und Guides performen?' },
  { icon: Layers,                color: 'text-pink-400',   bg: 'bg-pink-500/15',   title: 'White-Label',            desc: 'Ihre Marke, Ihre Domain — kein Fintutto-Logo.' },
  { icon: Globe2,                color: 'text-blue-400',   bg: 'bg-blue-500/15',   title: 'API-Integration',        desc: 'Buchungssystem, CRM oder Website anbinden.' },
]

const STEPS = [
  { step: '1', title: 'Registrieren',       desc: 'Kostenlos starten — in 2 Minuten einsatzbereit.' },
  { step: '2', title: 'Guides einladen',    desc: 'Sub-Accounts erstellen, Berechtigungen vergeben.' },
  { step: '3', title: 'Session starten',    desc: 'QR-Code zeigen — Gäste scannen und sind dabei.' },
  { step: '4', title: 'Auswerten',          desc: 'Analytics: Sprachen, Nutzung, beliebteste Touren.' },
]

const PLANS = [
  { name: 'Starter',    price: '99 EUR/Mo',   features: ['5 Guide-Accounts', '20 Touren', '30 Sprachen', 'Basis-Analytics'],                                    cta: 'Starten',           href: '/pricing',           highlight: false },
  { name: 'Agency',     price: '299 EUR/Mo',  features: ['Unbegrenzte Guides', 'Unbegrenzte Touren', '130+ Sprachen', 'Q&A-Moderation', 'White-Label'],           cta: 'Demo anfragen',     href: '/kontakt?type=demo', highlight: true  },
  { name: 'Enterprise', price: 'Individuell', features: ['API-Integration', 'SLA', 'Dedizierter Support', 'Custom Onboarding'],                                   cta: 'Kontakt aufnehmen', href: '/kontakt',            highlight: false },
]

export default function AgenturenPage() {
  return (
    <div className="relative max-w-2xl mx-auto space-y-10 py-6 px-4 text-white">


      {/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[280px] h-[280px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Für Reiseveranstalter & Guide-Agenturen
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Eine Agentur. Hunderte Touren. Jede Sprache.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            Zentrale Verwaltung · Q&A-Moderation · 130+ Sprachen · Offline-fähig. Ab 99 EUR/Monat.
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

      {/* Features */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Was Fintutto für Agenturen bietet</h2>
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

      {/* Preise */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Preise für Agenturen</h2>
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
