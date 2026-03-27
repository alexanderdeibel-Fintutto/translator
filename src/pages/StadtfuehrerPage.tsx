// StadtfuehrerPage — Mobile-First für selbstständige Stadtführer & Freelancer
// Route: /loesungen/stadtfuehrer

import { Link } from 'react-router-dom'
import {
  Globe2, TrendingUp, Zap, QrCode, Star,
  ArrowRight, ChevronRight, Check, Mic, Smartphone, BookOpen,
  Radio, MessageCircleQuestion, Bluetooth, Wifi, ScanText
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const STATS = [
  { value: '29 EUR',  label: 'ab / Monat' },
  { value: '45+',     label: 'Sprachen' },
  { value: '5.000 %', label: 'ROI (Beispiel)' },
  { value: '< 30 s',  label: 'Setup-Zeit' },
]

const ROI_ROWS = [
  { label: 'Vorher (nur Deutsch)',    value: '2.340 EUR/Monat', highlight: false },
  { label: 'Nachher (+ 45 Sprachen)', value: '3.900 EUR/Monat', highlight: false },
  { label: 'Investition',             value: '29 EUR/Monat',    highlight: false },
  { label: 'ROI',                     value: '> 5.000 %',       highlight: true  },
]

const FEATURES = [
  { icon: Radio,                 color: 'text-violet-400', bg: 'bg-violet-500/15', title: 'Live-Modus',             desc: 'Sie sprechen — Gäste lesen die Übersetzung in Echtzeit.' },
  { icon: MessageCircleQuestion, color: 'text-sky-400',    bg: 'bg-sky-500/15',    title: 'Q&A-Moderation',         desc: 'Gäste stellen Fragen — Sie moderieren und senden an alle.' },
  { icon: BookOpen,              color: 'text-emerald-400',bg: 'bg-emerald-500/15',title: 'Skript-Modus',           desc: 'Vorbereitete Texte, Abschnitt für Abschnitt.' },
  { icon: ScanText,              color: 'text-amber-400',  bg: 'bg-amber-500/15',  title: 'Dokument-Scanner',       desc: 'Schilder und Tafeln fotografieren → sofort übersetzt.' },
  { icon: QrCode,                color: 'text-rose-400',   bg: 'bg-rose-500/15',   title: 'QR-Code je Station',     desc: 'Für jede Sehenswürdigkeit einen eigenen Code.' },
  { icon: Smartphone,            color: 'text-blue-400',   bg: 'bg-blue-500/15',   title: 'Keine App nötig',        desc: 'Browser genügt — kein Download, keine Registrierung.' },
  { icon: Zap,                   color: 'text-orange-400', bg: 'bg-orange-500/15', title: 'Offline-Modus',          desc: 'Kein WLAN in der Altstadt? Funktioniert trotzdem.' },
  { icon: Bluetooth,             color: 'text-indigo-400', bg: 'bg-indigo-500/15', title: 'BLE-Transport',          desc: 'Bluetooth — null Infrastruktur, überall einsetzbar.' },
  { icon: Wifi,                  color: 'text-teal-400',   bg: 'bg-teal-500/15',   title: 'Hotspot-Modus',          desc: 'Ihr Gerät wird zum WLAN-Router — kein Internet nötig.' },
  { icon: Globe2,                color: 'text-cyan-400',   bg: 'bg-cyan-500/15',   title: '45+ Sprachen',           desc: 'Inkl. Migrationssprachen — kein Gast ausgeschlossen.' },
  { icon: Star,                  color: 'text-yellow-400', bg: 'bg-yellow-500/15', title: 'Bewertungs-Widget',      desc: 'Gäste hinterlassen Bewertungen in ihrer Sprache.' },
  { icon: TrendingUp,            color: 'text-green-400',  bg: 'bg-green-500/15',  title: 'Mehr Buchungen',         desc: '70% der Nachfrage kommt von internationalen Gästen.' },
]

const STEPS = [
  { step: '1', title: 'Registrieren',          desc: 'Kostenlosen Account anlegen — in 2 Minuten.' },
  { step: '2', title: 'Tourskript hochladen',  desc: 'Word, PDF oder Text — KI übersetzt in 45+ Sprachen.' },
  { step: '3', title: 'QR-Code drucken',       desc: 'QR-Code generieren, ausdrucken oder als Bild speichern.' },
  { step: '4', title: 'Gäste scannen',         desc: 'Scannen → Sprache wählen → lesen oder hören. Keine App.' },
]

const PLANS = [
  { name: 'Basic', price: '29 EUR/Mo',  features: ['25 Hörer', '30 Sprachen', 'QR-Code-System', 'Live-Modus'],                                 cta: 'Kostenlos starten', href: '/pricing',  highlight: false },
  { name: 'Pro',   price: '49 EUR/Mo',  features: ['100 Hörer', '45+ Sprachen', 'Q&A-Moderation', 'Chirp 3 HD Audio', 'Offline-Modus'],         cta: 'Pro starten',       href: '/pricing',  highlight: true  },
  { name: 'Plus',  price: '99 EUR/Mo',  features: ['500 Hörer', 'Alle Sprachen', 'White-Label', 'BLE + Hotspot', 'Analytics'],                  cta: 'Plus starten',      href: '/pricing',  highlight: false },
]

export default function StadtfuehrerPage() {
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
            Für selbstständige Stadtführer & Freelancer
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Ihre Stadtführung. Jede Sprache. Kein Aufwand.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            Internationale Gäste verstehen Sie sofort — mit Q&A, Scanner und Offline-Modus. Ab 29 EUR/Monat.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Link to="/pricing">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Kostenlos starten <ArrowRight className="h-4 w-4" />
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

      {/* ROI */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-bold drop-shadow-lg">Ihr Mehrumsatz-Potenzial</h2>
        </div>
        <Card className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-2">
          <p className="text-xs text-white/60 mb-2">Beispiel: Stadtführer München, 3 Touren/Woche</p>
          {ROI_ROWS.map((row, i) => (
            <div key={i} className={`flex items-center justify-between gap-3 p-2 rounded-lg ${row.highlight ? 'bg-green-500/20 border border-green-400/30' : ''}`}>
              <p className={`text-xs ${row.highlight ? 'font-bold text-green-300' : 'text-white/75'}`}>{row.label}</p>
              <p className={`text-sm font-bold shrink-0 ${row.highlight ? 'text-green-300' : 'text-white'}`}>{row.value}</p>
            </div>
          ))}
        </Card>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Was Fintutto für Stadtführer bietet</h2>
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
        <h2 className="text-xl font-bold drop-shadow-lg">Preise für Stadtführer</h2>
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
