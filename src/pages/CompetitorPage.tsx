// CompetitorPage — Mobile-First Wettbewerbervergleich
// Route: /compare

import { Link } from 'react-router-dom'
import {
  ArrowRight, Check, X, Shield, ChevronRight, Globe2,
  Wifi, Users, Bluetooth, Smartphone, TrendingDown,
  MessageCircleQuestion, ScanText
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ─── Feature-Matrix ───────────────────────────────────────────────────────────
interface Row {
  feature: string
  us: string | boolean
  google: string | boolean
  deepl: string | boolean
  microsoft: string | boolean
  itranslate: string | boolean
}

const MATRIX: Row[] = [
  { feature: 'Offline-Übersetzung',    us: '54 Paare (WASM)',      google: 'Begrenzt',  deepl: false,      microsoft: 'Begrenzt',  itranslate: false },
  { feature: '1→N Live-Broadcast',     us: '500 Hörer, 45 Spr.',   google: false,       deepl: false,      microsoft: '10 Spr.',   itranslate: false },
  { feature: 'Q&A-Moderation',         us: 'Inbox + Freigabe',     google: false,       deepl: false,      microsoft: false,       itranslate: false },
  { feature: 'BLE-Transport',          us: true,                   google: false,       deepl: false,      microsoft: false,       itranslate: false },
  { feature: 'WiFi-Hotspot-Modus',     us: true,                   google: false,       deepl: false,      microsoft: false,       itranslate: false },
  { feature: 'Dokument-Scanner (OCR)', us: 'Cloud Vision',         google: true,        deepl: false,      microsoft: true,        itranslate: true  },
  { feature: 'E2E-Verschlüsselung',    us: 'AES-256-GCM',          google: false,       deepl: false,      microsoft: false,       itranslate: false },
  { feature: 'Migrationssprachen',     us: '10 Sprachen',          google: 'Teilweise', deepl: false,      microsoft: 'Teilweise', itranslate: false },
  { feature: 'PWA (kein Download)',    us: true,                   google: false,       deepl: false,      microsoft: false,       itranslate: false },
  { feature: 'Gesprächsmodus 180°',   us: 'Split-Screen',         google: true,        deepl: false,      microsoft: true,        itranslate: true  },
  { feature: 'Phrasebook',             us: '18 Kategorien',        google: 'Begrenzt',  deepl: false,      microsoft: false,       itranslate: true  },
  { feature: 'Kontextmodi',            us: '6 Modi',               google: false,       deepl: false,      microsoft: false,       itranslate: false },
  { feature: 'Untertitel-Modus',       us: '6xl Großschrift',      google: false,       deepl: false,      microsoft: false,       itranslate: false },
  { feature: 'Session-Protokoll',      us: 'TXT/MD Export',        google: false,       deepl: false,      microsoft: false,       itranslate: false },
  { feature: 'Kostenlos (Basis)',       us: true,                   google: true,        deepl: 'Freemium', microsoft: true,        itranslate: 'Freemium' },
]

function Cell({ v }: { v: string | boolean }) {
  if (v === true)  return <Check className="w-4 h-4 text-green-400 mx-auto" />
  if (v === false) return <X    className="w-4 h-4 text-red-400/70 mx-auto" />
  return <span className="text-[10px] leading-tight text-center block">{v}</span>
}

// ─── Preisvergleiche ──────────────────────────────────────────────────────────
const PRICES = [
  {
    segment: 'Guided Tours',
    icon: Globe2,
    competitor: 'Vox-Flüsterkoffer',
    them: '~700 EUR/Mo (20 Touren)',
    us: '19,90 EUR/Mo',
    saving: '97%',
    note: 'Keine Hardware · Gäste nutzen eigene Smartphones · 45 Sprachen statt 3–5',
  },
  {
    segment: 'Events & Konferenzen',
    icon: Users,
    competitor: 'Wordly.ai / Dolmetscher',
    them: '~11.400 EUR/Tag',
    us: '199 EUR/Mo',
    saving: '97%',
    note: '500 Hörer · QR-Code auf Beamer · alle Sprachen inklusive',
  },
  {
    segment: 'Agenturen',
    icon: Users,
    competitor: 'KUDO',
    them: '~2.000 EUR/Mo (4 Events)',
    us: '99 EUR/Mo',
    saving: '80%',
    note: '1.500 Session-Minuten · zentrale Guide-Verwaltung · keine Pro-Event-Gebühr',
  },
  {
    segment: 'Kreuzfahrt',
    icon: Wifi,
    competitor: 'Menschliche Dolmetscher',
    them: '~84.000 EUR/Mo',
    us: '1.990 EUR/Mo',
    saving: '95%',
    note: 'Unbegrenzte Hörer · 8 Sprachen inkl. · funktioniert auf hoher See',
  },
  {
    segment: 'Persönlich',
    icon: Smartphone,
    competitor: 'iTranslate / DeepL',
    them: '5,99–8,74 EUR/Mo',
    us: '4,99 EUR/Mo',
    saving: '17–43%',
    note: 'Günstiger + Offline + Gesprächsmodus + Scanner + Phrasebook + Live',
  },
]

// ─── Alleinstellungsmerkmale ──────────────────────────────────────────────────
const MOATS = [
  { icon: Bluetooth,             title: 'Einziger mit BLE-Transport',       desc: 'Gruppen-Übersetzung per Bluetooth — null Infrastruktur, überall.' },
  { icon: Users,                 title: 'Einziger mit 1→N Broadcast',        desc: '1 Sprecher, 500 Hörer, 45 Sprachen — als reine Software-Lösung.' },
  { icon: MessageCircleQuestion, title: 'Einziger mit Q&A-Moderation',       desc: 'Besucher stellen Fragen, Host moderiert, alle erhalten die Übersetzung.' },
  { icon: Wifi,                  title: 'Einziger mit Hotspot-Modus',        desc: 'Das Smartphone wird zum WLAN-Router — kein Internet, kein Router nötig.' },
  { icon: ScanText,              title: 'Scanner + Übersetzung kombiniert',  desc: 'OCR → sofortige Übersetzung → vorlesen — in einem Schritt.' },
  { icon: Shield,                title: 'DSGVO Art. 9 + BSI-Grundschutz',   desc: 'Offline-First: keine Gesundheitsdaten verlassen das Gerät.' },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function CompetitorPage() {
  return (
    <div className="relative max-w-2xl mx-auto space-y-10 py-6 px-4 text-white">
{/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[280px] h-[280px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Wettbewerbervergleich
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Was uns einzigartig macht.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            Die einzige Plattform mit 1→N-Broadcast, Q&A-Moderation, BLE-Transport und vollständiger Offline-Fähigkeit — zu einem Bruchteil der Kosten.
          </p>
        </div>
      </div>

      {/* 6 Alleinstellungsmerkmale */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">6 Alleinstellungsmerkmale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MOATS.map((m, i) => {
            const Icon = m.icon
            return (
              <Card key={i} className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-sky-300 shrink-0" />
                  <h3 className="font-semibold text-sm leading-tight">{m.title}</h3>
                </div>
                <p className="text-xs text-white/70 leading-snug">{m.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Feature-Matrix — horizontal scrollbar auf Mobile */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Feature-Vergleich</h2>
        <div className="overflow-x-auto rounded-xl bg-black/25 backdrop-blur-md border border-white/15">
          <table className="w-full text-xs min-w-[520px]">
            <thead>
              <tr className="border-b border-white/15">
                <th className="text-left py-3 px-3 font-semibold text-white/80 w-36">Feature</th>
                <th className="text-center py-3 px-2 font-bold text-sky-300">Fintutto</th>
                <th className="text-center py-3 px-2 font-semibold text-white/60">Google</th>
                <th className="text-center py-3 px-2 font-semibold text-white/60">DeepL</th>
                <th className="text-center py-3 px-2 font-semibold text-white/60">Microsoft</th>
                <th className="text-center py-3 px-2 font-semibold text-white/60">iTranslate</th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr key={i} className="border-b border-white/10 last:border-0">
                  <td className="py-2.5 px-3 font-medium text-white/85">{row.feature}</td>
                  <td className="py-2.5 px-2 text-center bg-sky-500/10 text-sky-200"><Cell v={row.us} /></td>
                  <td className="py-2.5 px-2 text-center text-white/70"><Cell v={row.google} /></td>
                  <td className="py-2.5 px-2 text-center text-white/70"><Cell v={row.deepl} /></td>
                  <td className="py-2.5 px-2 text-center text-white/70"><Cell v={row.microsoft} /></td>
                  <td className="py-2.5 px-2 text-center text-white/70"><Cell v={row.itranslate} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preisvergleich — Karten */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold drop-shadow-lg">Preisvergleich</h2>
          <p className="text-sm text-white/70 mt-1">80–97% günstiger — bei mehr Features und Sprachen.</p>
        </div>
        <div className="space-y-3">
          {PRICES.map((p, i) => {
            const Icon = p.icon
            return (
              <Card key={i} className="p-4 bg-black/25 backdrop-blur-md border-white/15">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-sky-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-sm">{p.segment}</h3>
                      <span className="text-lg font-bold text-green-400 shrink-0">−{p.saving}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-1.5">
                      <div className="p-2 rounded-lg bg-red-500/15 border border-red-500/20">
                        <p className="text-[10px] text-red-300 font-medium">{p.competitor}</p>
                        <p className="text-xs font-bold text-red-200">{p.them}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-green-500/15 border border-green-500/20">
                        <p className="text-[10px] text-green-300 font-medium">Fintutto</p>
                        <p className="text-xs font-bold text-green-200">{p.us}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/60 leading-snug">{p.note}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-2 py-2">
        <Link to="/pricing">
          <Button size="lg" className="w-full gap-2">
            Jetzt kostenlos starten <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <div className="grid grid-cols-2 gap-2">
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

    </div>
  )
}
