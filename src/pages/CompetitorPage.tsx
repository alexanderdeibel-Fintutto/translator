// CompetitorPage — Wettbewerbervergleich mit Feature-Matrix
// Route: /compare

import { Link } from 'react-router-dom'
import {
  ArrowRight, Check, X, Minus, Shield, ChevronRight, Globe2,
  Wifi, Users, Bluetooth, Lock, Smartphone, Zap, TrendingDown
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CompetitorRow {
  feature: string
  guidetranslator: string | boolean
  google: string | boolean
  deepl: string | boolean
  microsoft: string | boolean
  itranslate: string | boolean
}

const FEATURE_MATRIX: CompetitorRow[] = [
  { feature: 'Offline-Uebersetzung', guidetranslator: 'WASM (54 Paare)', google: 'Begrenzt', deepl: false, microsoft: 'Begrenzt', itranslate: false },
  { feature: '1→N Live Broadcast', guidetranslator: '500 Hoerer, 45 Spr.', google: false, deepl: false, microsoft: '10 Sprachen', itranslate: false },
  { feature: 'BLE-Transport', guidetranslator: true, google: false, deepl: false, microsoft: false, itranslate: false },
  { feature: 'WiFi-Hotspot-Modus', guidetranslator: true, google: false, deepl: false, microsoft: false, itranslate: false },
  { feature: 'E2E-Verschluesselung', guidetranslator: 'AES-256-GCM', google: false, deepl: false, microsoft: false, itranslate: false },
  { feature: 'Migrationssprachen', guidetranslator: '10 Sprachen', google: 'Teilweise', deepl: false, microsoft: 'Teilweise', itranslate: false },
  { feature: 'PWA (kein Download)', guidetranslator: true, google: false, deepl: false, microsoft: false, itranslate: false },
  { feature: 'Gespraechsmodus', guidetranslator: '180-Grad Split', google: true, deepl: false, microsoft: true, itranslate: true },
  { feature: 'Kamera-OCR', guidetranslator: true, google: true, deepl: false, microsoft: true, itranslate: true },
  { feature: 'Phrasebook', guidetranslator: '18 Kategorien', google: 'Begrenzt', deepl: false, microsoft: false, itranslate: true },
  { feature: 'Kontextmodi', guidetranslator: '6 Modi', google: false, deepl: false, microsoft: false, itranslate: false },
  { feature: 'QR-Code Join', guidetranslator: true, google: false, deepl: false, microsoft: false, itranslate: false },
  { feature: 'Untertitel-Modus', guidetranslator: '6xl Grossschrift', google: false, deepl: false, microsoft: false, itranslate: false },
  { feature: 'Session-Protokoll', guidetranslator: 'TXT/MD Export', google: false, deepl: false, microsoft: false, itranslate: false },
  { feature: 'Kostenlos (Basis)', guidetranslator: true, google: true, deepl: 'Freemium', microsoft: true, itranslate: 'Freemium' },
]

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 text-green-500 mx-auto" />
  if (value === false) return <X className="w-4 h-4 text-red-400 mx-auto" />
  return <span className="text-xs">{value}</span>
}

const PRICE_COMPARISONS = [
  {
    segment: 'Guided Tours',
    icon: Globe2,
    competitor: 'Vox-Hardware (Fluesterkofferset)',
    competitorPrice: '3.000-8.000 EUR Anschaffung + 3,50 EUR/Geraet/Tag',
    competitorMonthly: '~700 EUR/Monat (20 Touren)',
    our: 'Guide Basic',
    ourPrice: '19,90 EUR/Monat',
    savings: '97%',
    details: 'Keine Hardware-Investition, keine Wartung, keine Desinfektion. Gaeste nutzen eigene Smartphones. 45 Sprachen statt 3-5.',
  },
  {
    segment: 'Agenturen',
    icon: Users,
    competitor: 'KUDO',
    competitorPrice: 'Ab 500 EUR/Event',
    competitorMonthly: '~2.000 EUR/Monat (4 Events)',
    our: 'Agentur Standard',
    ourPrice: '99 EUR/Monat',
    savings: '80%',
    details: '1.500 Session-Minuten inklusive. Zentrale Guide-Verwaltung. Keine Pro-Event-Gebuehr.',
  },
  {
    segment: 'Events',
    icon: Users,
    competitor: 'Wordly.ai',
    competitorPrice: '69 EUR/Stunde',
    competitorMonthly: '~2.275 EUR/Monat (33h)',
    our: 'Event Basic',
    ourPrice: '199 EUR/Monat',
    savings: '91%',
    details: '2.000 Session-Minuten inklusive (~33h). 100 Hoerer. QR-Code auf Leinwand — 500 Teilnehmer joinen in 30 Sekunden.',
  },
  {
    segment: 'Konferenzen (Premium)',
    icon: Users,
    competitor: 'Simultan-Dolmetscher (3 Sprachen)',
    competitorPrice: '6 Dolmetscher + 3 Kabinen + Technik',
    competitorMonthly: '~11.400 EUR/Tag',
    our: 'Event Pro',
    ourPrice: '499 EUR/Monat',
    savings: '97%',
    details: '500 Hoerer, alle 130+ Sprachen, Chirp 3 HD Audio. Session-Protokoll und White-Label inklusive.',
  },
  {
    segment: 'Kreuzfahrt',
    icon: Wifi,
    competitor: 'Menschliche Dolmetscher',
    competitorPrice: '350 EUR/Tag/Sprache x 8 Sprachen',
    competitorMonthly: '~84.000 EUR/Monat',
    our: 'Cruise Starter',
    ourPrice: '1.990 EUR/Monat',
    savings: '95%',
    details: 'Unbegrenzte Hoerer, 8 Sprachen inklusive. Funktioniert ueber Bord-WLAN auch auf hoher See.',
  },
  {
    segment: 'Persoenlich',
    icon: Smartphone,
    competitor: 'iTranslate / DeepL',
    competitorPrice: 'iTranslate: 5,99 EUR/Mo · DeepL: 8,74 EUR/Mo',
    competitorMonthly: '5,99-8,74 EUR/Monat',
    our: 'Personal Pro',
    ourPrice: '4,99 EUR/Monat',
    savings: '17-43%',
    details: 'Guenstiger + Offline-Modus + Gespraechsmodus + Kamera-OCR + Phrasebook + Live-Session. Alles in einer App.',
  },
]

const MOATS = [
  {
    category: 'Technischer Moat',
    items: [
      'BLE GATT Protocol (proprietaer, patentfaehig)',
      '4-Tier Transport mit Auto-Fallback',
      'Embedded Relay Server (Java/Swift)',
      'On-Device ML Pipeline (Opus-MT + Whisper)',
    ],
  },
  {
    category: 'Netzwerk-Moat',
    items: [
      'PWA: Kein Download → virale Verbreitung via QR',
      'Jeder Listener wird potentieller Speaker',
      'Phrasebook-Community (Translation Memory)',
    ],
  },
  {
    category: 'Markt-Moat',
    items: [
      'Erste Loesung fuer Offline-Gruppen-Uebersetzung',
      'Migrationssprachen-Fokus (unterversorgter Markt)',
      'B2B-Beziehungen zu Behoerden und Schulen',
    ],
  },
]

export default function CompetitorPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8 px-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
          Wettbewerbervergleich
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
          Was uns einzigartig macht.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          GuideTranslator ist die weltweit einzige Uebersetzungsplattform mit 1→N-Broadcasting,
          4-Tier-Transport und vollstaendiger Offline-Faehigkeit — zu einem Bruchteil der Kosten.
        </p>
      </div>

      {/* Unique selling points */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Bluetooth, title: 'Einziger Anbieter mit BLE-Transport', desc: 'Kein anderer Uebersetzer bietet Bluetooth Low Energy fuer Gruppen-Uebersetzung. Null Infrastruktur — funktioniert ueberall.' },
          { icon: Users, title: 'Einziger Anbieter mit 1→N Broadcast', desc: 'Ein Sprecher, 500 Zuhoerer, 45 Sprachen gleichzeitig. Kein Wettbewerber bietet das als Software-Loesung.' },
          { icon: Wifi, title: 'Einziger Anbieter mit Hotspot-Modus', desc: 'Das Smartphone erstellt ein eigenes WLAN. Keine Infrastruktur, kein Internet — die App bringt alles mit.' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <Card key={i} className="p-5 space-y-3 border-primary/30">
              <Icon className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </Card>
          )
        })}
      </div>

      {/* Feature Matrix */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Feature-Vergleich im Detail</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold">Feature</th>
                <th className="text-center py-3 px-2 font-semibold text-primary">GuideTranslator</th>
                <th className="text-center py-3 px-2 font-semibold">Google Translate</th>
                <th className="text-center py-3 px-2 font-semibold">DeepL</th>
                <th className="text-center py-3 px-2 font-semibold">Microsoft</th>
                <th className="text-center py-3 px-2 font-semibold">iTranslate</th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2.5 px-2 font-medium text-xs">{row.feature}</td>
                  <td className="py-2.5 px-2 text-center bg-primary/5"><FeatureCell value={row.guidetranslator} /></td>
                  <td className="py-2.5 px-2 text-center"><FeatureCell value={row.google} /></td>
                  <td className="py-2.5 px-2 text-center"><FeatureCell value={row.deepl} /></td>
                  <td className="py-2.5 px-2 text-center"><FeatureCell value={row.microsoft} /></td>
                  <td className="py-2.5 px-2 text-center"><FeatureCell value={row.itranslate} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Comparisons */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Preisvergleich nach Segment</h2>
          <p className="text-muted-foreground">
            80-97% guenstiger als traditionelle Loesungen — bei mehr Features und Sprachen.
          </p>
        </div>

        <div className="space-y-4">
          {PRICE_COMPARISONS.map((comp, i) => {
            const Icon = comp.icon
            return (
              <Card key={i} className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-1/3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-primary" />
                      <h3 className="font-bold">{comp.segment}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{comp.details}</p>
                  </div>
                  <div className="sm:w-2/3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Competitor */}
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 space-y-1">
                        <p className="text-xs font-medium text-red-700 dark:text-red-400">{comp.competitor}</p>
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">{comp.competitorMonthly}</p>
                        <p className="text-xs text-muted-foreground">{comp.competitorPrice}</p>
                      </div>
                      {/* Ours */}
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 space-y-1">
                        <p className="text-xs font-medium text-green-700 dark:text-green-400">{comp.our}</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">{comp.ourPrice}</p>
                        <p className="text-xs text-muted-foreground">GuideTranslator</p>
                      </div>
                      {/* Savings */}
                      <div className="p-3 rounded-lg bg-primary/10 space-y-1 flex flex-col items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-primary" />
                        <p className="text-2xl font-bold text-primary">{comp.savings}</p>
                        <p className="text-xs text-muted-foreground">guenstiger</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Moats */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Wettbewerbsvorteile (Moats)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MOATS.map((moat, i) => (
            <Card key={i} className="p-5 space-y-3">
              <h3 className="font-semibold text-sm text-primary">{moat.category}</h3>
              <ul className="space-y-2">
                {moat.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Geschaetzter Nachahmungsaufwand fuer Wettbewerber: <strong className="text-primary">12-18 Monate</strong>
        </p>
      </div>

      {/* The blind spot */}
      <Card className="p-8 bg-muted/30 text-center space-y-4">
        <h2 className="text-xl font-bold">Der blinde Fleck aller Wettbewerber</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Google Translate, DeepL, Microsoft Translator — sie alle setzen Internet voraus.
          An den Orten, wo Uebersetzung am meisten gebraucht wird, gibt es keins.
        </p>
        <p className="text-sm text-muted-foreground">
          Ruinen. Berge. Fluechtlingscamps. Boote. Busse. Schulen in laendlichen Gebieten. Behoerden mit gesperrten Netzwerken.
        </p>
        <p className="font-semibold text-primary">
          GuideTranslator funktioniert auch dort — dank 4-Tier-Transport und On-Device KI.
        </p>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold">Ueberzeugen Sie sich selbst</h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Jetzt kostenlos testen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Preise vergleichen
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
