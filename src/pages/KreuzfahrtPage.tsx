// KreuzfahrtPage — Lösungsseite für Kreuzfahrt-Reedereien & Shore Excursion Manager
// Route: /loesungen/kreuzfahrt
import { Link } from 'react-router-dom'
import { Anchor, Globe2, TrendingDown, Users, Map, Shield, Zap, ArrowRight, ChevronRight, Check, BarChart3, Layers, Headphones } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ============================================================================
// Content
// ============================================================================
const HERO = {
  badge: 'Enterprise Solution für Kreuzfahrt-Reedereien',
  title: 'Shore Excursions in jeder Sprache. Für jedes Schiff.',
  subtitle:
    '1 Guide + KI = 130+ Sprachen. Eliminieren Sie mehrsprachige Guides in 50+ Häfen weltweit — und sparen Sie bis zu 93 % der Übersetzungskosten. Individuelles Enterprise-Pricing.',
}
const STATS = [
  { value: '93 %', label: 'Kostenersparnis' },
  { value: '130+', label: 'Sprachen' },
  { value: '50+', label: 'Häfen weltweit' },
  { value: '< 1 s', label: 'Übersetzungslatenz' },
]
const PAIN_POINTS = [
  {
    icon: TrendingDown,
    title: '480.000 EUR/Schiff/Jahr',
    description: '8 mehrsprachige Guides × 300 EUR/Tag × 200 Exkursionstage = 480.000 EUR — nur für 6 Sprachen. Für 10 Schiffe: 4,8 Mio. EUR.',
  },
  {
    icon: Globe2,
    title: 'Exotische Häfen ohne Guides',
    description: 'In Osaka, Mumbai oder Casablanca gibt es kaum deutschsprachige Guides. Japanisch, Hindi, Arabisch — unmöglich zu besetzen.',
  },
  {
    icon: Map,
    title: 'Logistik in 50+ Häfen',
    description: 'Guide-Koordination, Buchungen, Ausfälle, Vertretungen — in jedem Hafen weltweit. Der operative Aufwand ist enorm.',
  },
  {
    icon: Shield,
    title: 'Qualitätsinkonsistenz',
    description: 'Jeder lokale Guide erklärt anders. Standardisierte Inhalte und Markenbotschaften sind kaum durchsetzbar.',
  },
]
const HOW_IT_WORKS = [
  { step: '1', title: 'Inhalte zentralisieren', desc: 'Alle Exkursionsskripte, Routen und POI-Beschreibungen in einer Plattform — einmalig eingepflegt.' },
  { step: '2', title: 'KI übersetzt', desc: 'Automatische Übersetzung in 130+ Sprachen. Fachbegriffe und Markennamen werden korrekt behandelt.' },
  { step: '3', title: 'Guide führt', desc: '1 Guide spricht — alle Gäste lesen oder hören in ihrer Sprache. QR-Code auf dem Smartphone genügt.' },
  { step: '4', title: 'Analytics auswerten', desc: 'Welche Sprachen werden genutzt? Welche Exkursionen sind beliebt? Daten für bessere Planung.' },
]
const SAVINGS = {
  title: 'Ihre Ersparnis auf einen Blick',
  rows: [
    { label: 'Traditionell (10 Schiffe, 6 Sprachen)', value: '4.800.000 EUR/Jahr' },
    { label: 'Mit GuideTranslator (Enterprise)', value: '~ 325.000 EUR/Jahr' },
    { label: 'Ersparnis', value: '93 % — 4.475.000 EUR/Jahr', highlight: true },
  ],
  note: 'Kalkulationsbasis: 8 Guides/Schiff × 300 EUR/Tag × 200 Exkursionstage × 10 Schiffe. Enterprise-Pricing auf Anfrage.',
}
const TIERS = [
  { name: 'Pilot', desc: '1 Schiff, 3 Monate Testphase', cta: 'Pilot starten', href: '/kontakt' },
  { name: 'Fleet', desc: '2–5 Schiffe, Jahresvertrag', cta: 'Angebot anfragen', href: '/kontakt', highlight: true },
  { name: 'Armada', desc: '6+ Schiffe, Custom SLA', cta: 'Enterprise-Gespräch', href: '/kontakt' },
]
const FEATURES = [
  { icon: Headphones, title: 'Chirp 3 HD Audio', description: 'Gäste hören die Erklärungen in ihrer Sprache — natürliche Stimme, keine Robotersprache.' },
  { icon: Zap, title: 'Offline-Modus', description: 'Kein stabiles Internet im Hafen? GuideTranslator funktioniert auch offline — einzigartiger USP.' },
  { icon: Layers, title: 'White-Label', description: 'Ihre Reederei-Marke, Ihre Domain. Gäste sehen nur Ihr Branding.' },
  { icon: BarChart3, title: 'Fleet Analytics', description: 'Aggregierte Auswertungen über alle Schiffe — Sprachen, Nutzung, Beliebtheit.' },
  { icon: Shield, title: 'Enterprise Security', description: 'DSGVO-konform, E2E-verschlüsselt, SSO-Integration, dedizierter Support.' },
  { icon: Globe2, title: '130+ Sprachen', description: 'Alle Weltsprachen inklusive — von Japanisch bis Swahili. Kein Hafen ist zu exotisch.' },
]

// ============================================================================
// Component
// ============================================================================
export default function KreuzfahrtPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            {HERO.badge}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">{HERO.title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {HERO.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" asChild>
              <Link to="/kontakt">
                Ersparnis berechnen <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/kontakt?type=demo">
                Demo vereinbaren <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-lg bg-black/20 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pain Points ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Das kostet mehrsprachige Shore Excursions heute
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {PAIN_POINTS.map((pp, i) => (
              <Card key={i} className="p-6 space-y-3">
                <pp.icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">{pp.title}</h3>
                <p className="text-muted-foreground text-sm">{pp.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">1 Guide. 130+ Sprachen. So funktioniert's.</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                  {step.step}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Savings ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{SAVINGS.title}</h2>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {SAVINGS.rows.map((row, i) => (
                  <tr key={i} className={`border-b last:border-0 ${row.highlight ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-3 text-muted-foreground">{row.label}</td>
                    <td className={`px-6 py-3 text-right font-semibold ${row.highlight ? 'text-primary text-lg' : ''}`}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <p className="text-xs text-muted-foreground text-center mt-3">{SAVINGS.note}</p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Enterprise-Features für Reedereien</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Card key={i} className="p-5 space-y-3">
                <f.icon className="h-7 w-7 text-primary" />
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tiers ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Einstiegsprogramme</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TIERS.map((tier, i) => (
              <Card key={i} className={`p-6 flex flex-col gap-4 ${tier.highlight ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                {tier.highlight && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full self-start">Beliebt</span>
                )}
                <div>
                  <h3 className="font-bold text-xl">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tier.desc}</p>
                </div>
                <Button variant={tier.highlight ? 'default' : 'outline'} asChild className="mt-auto">
                  <Link to={tier.href}>{tier.cta}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Bereit für mehrsprachige Shore Excursions?</h2>
          <p className="opacity-90">Unser Enterprise-Team erstellt Ihnen eine individuelle Kostenanalyse für Ihre Flotte.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/kontakt">Kontakt aufnehmen <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <a href="mailto:enterprise@guidetranslator.com">enterprise@guidetranslator.com</a>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm opacity-80">
            {['Offline-Modus', 'DSGVO-konform', 'White-Label', 'Dedizierter Support'].map((t, i) => (
              <span key={i} className="flex items-center gap-1"><Check className="h-3.5 w-3.5" />{t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
