// StadtfuehrerPage — Lösungsseite für selbstständige Stadtführer & Freelancer
// Route: /loesungen/stadtfuehrer
import { Link } from 'react-router-dom'
import { MapPin, Globe2, Users, Zap, QrCode, TrendingUp, Star, ArrowRight, ChevronRight, Check, Mic, Smartphone, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ============================================================================
// Content
// ============================================================================
const HERO = {
  badge: 'Für selbstständige Stadtführer & Freelancer',
  title: 'Ihre Stadtführung. Jede Sprache. Kein Aufwand.',
  subtitle:
    'Internationale Gäste verstehen Sie sofort — ohne mehrsprachige Guides, ohne Übersetzungsagentur. Laden Sie Ihr Tourskript hoch, drucken Sie einen QR-Code und starten Sie. Ab 29 EUR/Monat.',
}
const STATS = [
  { value: '29 EUR', label: 'ab / Monat' },
  { value: '30+', label: 'Sprachen' },
  { value: '5.000%', label: 'ROI (Beispiel)' },
  { value: '< 30 s', label: 'Setup-Zeit' },
]
const PAIN_POINTS = [
  {
    icon: Globe2,
    title: '70 % der Nachfrage geht verloren',
    description:
      'Internationale Gäste buchen lieber eine Tour in ihrer Sprache. Ohne Mehrsprachigkeit verlieren Sie den Großteil des Marktes.',
  },
  {
    icon: Users,
    title: 'Mehrsprachige Guides sind teuer',
    description:
      'Einen zweisprachigen Kollegen zu engagieren kostet 80–150 EUR pro Tour. Das frisst Ihre Marge — oder Sie verzichten auf internationale Buchungen.',
  },
  {
    icon: TrendingUp,
    title: 'Marketing nur auf Deutsch',
    description:
      'Ihre Bewertungen, Ihre Website, Ihre Buchungsplattform — alles auf Deutsch. Internationale Gäste finden Sie gar nicht erst.',
  },
]
const HOW_IT_WORKS = [
  { step: '1', title: 'Registrieren', desc: 'Kostenlosen Account anlegen — in 2 Minuten.' },
  { step: '2', title: 'Tourskript hochladen', desc: 'Laden Sie Ihr bestehendes Skript hoch (Word, PDF, Text) — die KI übersetzt automatisch in 30+ Sprachen.' },
  { step: '3', title: 'QR-Code drucken', desc: 'Einen QR-Code für Ihre Tour generieren und ausdrucken oder als Bild speichern.' },
  { step: '4', title: 'Gäste scannen', desc: 'Gäste scannen den Code mit ihrem Smartphone und lesen oder hören die Tour in ihrer Sprache — ohne App-Installation.' },
]
const FEATURES = [
  { icon: Mic, title: 'Live-Modus', description: 'Sie sprechen — Gäste lesen die Übersetzung in Echtzeit auf ihrem Gerät. Ideal für spontane Kommentare.' },
  { icon: BookOpen, title: 'Skript-Modus', description: 'Vorbereitete Texte werden Abschnitt für Abschnitt angezeigt. Gäste lesen in ihrem eigenen Tempo.' },
  { icon: QrCode, title: 'QR-Code je Station', description: 'Für jede Sehenswürdigkeit einen eigenen QR-Code — Gäste scannen und lesen die passende Erklärung.' },
  { icon: Smartphone, title: 'Keine App nötig', description: 'Gäste öffnen einen Link im Browser — kein Download, keine Registrierung, sofort bereit.' },
  { icon: Globe2, title: '30+ Sprachen', description: 'Englisch, Spanisch, Französisch, Japanisch, Chinesisch und viele mehr — alle im Basispaket enthalten.' },
  { icon: Star, title: 'Bewertungs-Widget', description: 'Nach der Tour können Gäste direkt eine Bewertung hinterlassen — in ihrer Sprache.' },
]
const ROI = {
  title: 'Ihr Mehrumsatz-Potenzial',
  example: 'Beispiel: Stadtführer München, 3 Touren/Woche',
  rows: [
    { label: 'Vorher (nur Deutsch)', value: '2.340 EUR/Monat' },
    { label: 'Nachher (+ 30 Sprachen)', value: '3.900 EUR/Monat' },
    { label: 'Investition', value: '29 EUR/Monat' },
    { label: 'ROI', value: '> 5.000 %', highlight: true },
  ],
}
const APPS = [
  { title: 'Consumer App', desc: 'Tourskripte erstellen, übersetzen und verwalten.', href: '/apps/translator', cta: 'Zur App' },
  { title: 'Listener App', desc: 'Ihre Gäste hören oder lesen die Tour live.', href: '/apps/live', cta: 'Zur App' },
  { title: 'Enterprise App', desc: 'Session-Management für mehrere Guides und Touren.', href: '/apps/enterprise', cta: 'Zur App' },
]

// ============================================================================
// Component
// ============================================================================
export default function StadtfuehrerPage() {
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
              <a href="https://consumer.guidetranslator.com" target="_blank" rel="noopener noreferrer">
                Kostenlos starten <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/apps/live">
                Live-Modus ansehen <ChevronRight className="h-4 w-4 ml-2" />
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
            Internationale Gäste — aber nur eine Sprache?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">So funktioniert's</h2>
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

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Was Sie bekommen</h2>
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

      {/* ── ROI ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">{ROI.title}</h2>
          <p className="text-center text-muted-foreground mb-8">{ROI.example}</p>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {ROI.rows.map((row, i) => (
                  <tr key={i} className={`border-b last:border-0 ${row.highlight ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-3 text-muted-foreground">{row.label}</td>
                    <td className={`px-6 py-3 text-right font-semibold ${row.highlight ? 'text-primary text-lg' : ''}`}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>

      {/* ── Apps ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Die passenden Apps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {APPS.map((app, i) => (
              <Card key={i} className="p-6 flex flex-col gap-3">
                <h3 className="font-semibold text-lg">{app.title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{app.desc}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={app.href}>{app.cta} <ChevronRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Bereit für internationale Gäste?</h2>
          <p className="opacity-90">Kostenlos starten — kein Kreditkarte, kein Risiko. Upgrade jederzeit möglich.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="https://consumer.guidetranslator.com" target="_blank" rel="noopener noreferrer">
                Kostenlos starten <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link to="/preise">Preise ansehen</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm opacity-80">
            {['Kostenloser Einstieg', 'Keine Kreditkarte', 'DSGVO-konform', 'Made in Germany'].map((t, i) => (
              <span key={i} className="flex items-center gap-1"><Check className="h-3.5 w-3.5" />{t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
