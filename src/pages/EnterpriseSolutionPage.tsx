// EnterpriseSolutionPage — Lösungsseite für Museen, Konferenzen, Messen & Events
// Route: /loesungen/enterprise
import { Link } from 'react-router-dom'
import { Building2, Mic, Map, Users, Globe2, BarChart3, Shield, Zap, ArrowRight, ChevronRight, Check, Headphones, Layers, QrCode } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ============================================================================
// Content
// ============================================================================
const HERO = {
  badge: 'Für Museen, Konferenzen, Messen & Events',
  title: 'Events ohne Sprachbarrieren.',
  subtitle:
    'Ob Museumstour, Kongress, Messe oder Werkführung — GuideTranslator macht jede Veranstaltung mehrsprachig. Ohne Dolmetscher. Ohne teure Hardware. Ab 99 EUR/Monat.',
}
const STATS = [
  { value: '99 EUR', label: 'ab / Monat' },
  { value: '130+', label: 'Sprachen' },
  { value: '500', label: 'Teilnehmer max.' },
  { value: '90 %', label: 'Kostenersparnis' },
]
const USE_CASES = [
  {
    icon: Building2,
    title: 'Museen & Ausstellungen',
    description: 'QR-Code statt Audio-Guide-Gerät. Besucher scannen und hören oder lesen die Erklärung in ihrer Sprache — ohne App-Installation, ohne Leihgerät.',
    link: '/museum',
    linkLabel: 'Museum-Lösung ansehen',
  },
  {
    icon: Mic,
    title: 'Konferenzen & Kongresse',
    description: 'Echtzeit-Übersetzung für bis zu 500 Teilnehmer. 90 % günstiger als Simultandolmetscher — und keine Kabinen, keine Kopfhörer-Logistik.',
    link: '/sales/conference',
    linkLabel: 'Conference-Lösung ansehen',
  },
  {
    icon: Map,
    title: 'Messen & Ausstellungen',
    description: 'Standpräsentationen in jeder Sprache. Internationale Besucher verstehen Ihr Produkt sofort — ohne Sprachbarriere, ohne Dolmetscher am Stand.',
    link: '/loesungen/agenturen',
    linkLabel: 'Mehr erfahren',
  },
  {
    icon: Users,
    title: 'Werkführungen & Schulungen',
    description: 'Onboarding internationaler Mitarbeiter, Besuchergruppen aus dem Ausland, mehrsprachige Sicherheitsunterweisungen — alles mit einem QR-Code.',
    link: '/kontakt',
    linkLabel: 'Demo anfragen',
  },
]
const HOW_IT_WORKS = [
  { step: '1', title: 'Inhalte hochladen', desc: 'Skripte, PDFs, Präsentationen oder Webseiten — die KI analysiert und übersetzt automatisch.' },
  { step: '2', title: 'Session starten', desc: 'Erstellen Sie eine Live-Session oder einen QR-Code für Ihre Veranstaltung — in 2 Minuten.' },
  { step: '3', title: 'Teilnehmer joinen', desc: 'QR-Code scannen, Sprache wählen, fertig. Keine App, keine Registrierung, keine Hardware.' },
  { step: '4', title: 'Auswerten', desc: 'Welche Sprachen wurden genutzt? Wie lange? Analytics für bessere Planung der nächsten Veranstaltung.' },
]
const FEATURES = [
  { icon: Headphones, title: 'Audio & Text', description: 'Teilnehmer können zuhören oder lesen — je nach Präferenz und Situation.' },
  { icon: Zap, title: 'Offline-Modus', description: 'Kein stabiles WLAN in der Messehalle? GuideTranslator funktioniert auch offline.' },
  { icon: QrCode, title: 'QR-Code-System', description: 'Ein QR-Code für die gesamte Veranstaltung oder je Station/Session — flexibel konfigurierbar.' },
  { icon: Layers, title: 'White-Label', description: 'Ihre Marke, Ihre Domain. Teilnehmer sehen nur Ihr Branding.' },
  { icon: BarChart3, title: 'Event Analytics', description: 'Sprachverteilung, Nutzungsdauer, beliebteste Inhalte — alles im Dashboard.' },
  { icon: Shield, title: 'Enterprise Security', description: 'DSGVO-konform, E2E-verschlüsselt, SSO, dedizierter Support, SLA.' },
]
const PRICING = {
  plans: [
    { name: 'Starter', price: '99 EUR/Mo', features: ['1 Event gleichzeitig', '30 Sprachen', '100 Teilnehmer', 'Basis-Analytics'], cta: 'Starten', href: '/preise' },
    { name: 'Pro', price: '499 EUR/Mo', features: ['5 Events gleichzeitig', '130+ Sprachen', '500 Teilnehmer', 'HD Audio', 'White-Label'], cta: 'Demo anfragen', href: '/kontakt?type=demo', highlight: true },
    { name: 'Enterprise', price: 'Individuell', features: ['Unbegrenzte Events', 'API-Integration', 'SLA', 'Dedizierter Support', 'Custom Onboarding'], cta: 'Kontakt aufnehmen', href: '/kontakt' },
  ],
}

// ============================================================================
// Component
// ============================================================================
export default function EnterpriseSolutionPage() {
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
              <Link to="/kontakt?type=demo">
                Demo anfragen <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/apps/enterprise">
                Enterprise App ansehen <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-lg bg-background shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Use Cases ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Für welche Veranstaltungen?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {USE_CASES.map((uc, i) => (
              <Card key={i} className="p-6 space-y-3 flex flex-col">
                <uc.icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">{uc.title}</h3>
                <p className="text-muted-foreground text-sm flex-1">{uc.description}</p>
                <Button variant="outline" size="sm" asChild className="self-start">
                  <Link to={uc.link}>{uc.linkLabel} <ChevronRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">In 4 Schritten mehrsprachig</h2>
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Enterprise-Features</h2>
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

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Preise</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.plans.map((plan, i) => (
              <Card key={i} className={`p-6 flex flex-col gap-4 ${plan.highlight ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                {plan.highlight && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full self-start">Empfohlen</span>
                )}
                <div>
                  <h3 className="font-bold text-xl">{plan.name}</h3>
                  <div className="text-2xl font-bold text-primary mt-1">{plan.price}</div>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.highlight ? 'default' : 'outline'} asChild>
                  <Link to={plan.href}>{plan.cta}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Apps ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Die passenden Apps</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Enterprise App', desc: 'Session-Management, Analytics, Team-Verwaltung.', href: '/apps/enterprise' },
              { title: 'Listener App', desc: 'Teilnehmer folgen der Veranstaltung in ihrer Sprache.', href: '/apps/live' },
              { title: 'Consumer App', desc: 'Inhalte vorbereiten, übersetzen und verwalten.', href: '/apps/translator' },
            ].map((app, i) => (
              <Card key={i} className="p-6 flex flex-col gap-3">
                <h3 className="font-semibold text-lg">{app.title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{app.desc}</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={app.href}>Zur App <ChevronRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Bereit für mehrsprachige Veranstaltungen?</h2>
          <p className="opacity-90">Wir zeigen Ihnen in 30 Minuten, wie GuideTranslator Ihre nächste Veranstaltung mehrsprachig macht.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/kontakt?type=demo">Demo vereinbaren <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link to="/preise">Alle Preise</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-2 text-sm opacity-80">
            {['Offline-Modus', 'DSGVO-konform', 'White-Label', 'Made in Germany'].map((t, i) => (
              <span key={i} className="flex items-center gap-1"><Check className="h-3.5 w-3.5" />{t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
