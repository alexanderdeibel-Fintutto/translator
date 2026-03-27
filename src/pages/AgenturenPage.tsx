// AgenturenPage — Lösungsseite für Reise- & Stadtführungsagenturen
// Route: /loesungen/agenturen
import { Link } from 'react-router-dom'
import { Building2, Globe2, Users, BarChart3, Shield, Zap, ArrowRight, ChevronRight, Check, Settings, Map, Star, Layers } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ============================================================================
// Content
// ============================================================================
const HERO = {
  badge: 'Für Agenturen & Reiseveranstalter',
  title: 'Eine Agentur. Hunderte Touren. Jede Sprache.',
  subtitle:
    'Verwalten Sie alle Guides, Touren und Sprachen zentral — ohne Recruiting-Stress, ohne Qualitätsverlust. Ihre Guides sprechen, GuideTranslator übersetzt. Ab 99 EUR/Monat.',
}
const STATS = [
  { value: '99 EUR', label: 'ab / Monat' },
  { value: '∞', label: 'Guides & Touren' },
  { value: '30+', label: 'Sprachen' },
  { value: '100%', label: 'Qualitätskontrolle' },
]
const PAIN_POINTS = [
  {
    icon: Users,
    title: 'Guide-Recruiting ist teuer',
    description: 'Mehrsprachige Guides sind rar und teuer. Saisonale Schwankungen machen Planung unmöglich — und Ausfälle kosten Kunden.',
  },
  {
    icon: Shield,
    title: 'Qualität unkontrollierbar',
    description: 'Jeder Guide erklärt anders. Standardisierte Inhalte sind kaum durchsetzbar — besonders bei Freelancern.',
  },
  {
    icon: BarChart3,
    title: 'Kein Überblick über Performance',
    description: 'Welche Touren laufen gut? Welche Sprachen werden gefragt? Ohne Daten keine Entscheidungsgrundlage.',
  },
  {
    icon: Globe2,
    title: 'Exotische Sprachen fehlen',
    description: 'Für Japanisch, Koreanisch oder Arabisch gibt es kaum lokale Guides. Internationale Gruppen werden abgelehnt.',
  },
]
const FEATURES = [
  { icon: Settings, title: 'Zentrales Tour-Management', description: 'Alle Touren, Skripte und Medien an einem Ort. Änderungen gelten sofort für alle Guides.' },
  { icon: Users, title: 'Team-Verwaltung', description: 'Guides erhalten eigene Accounts mit definierten Berechtigungen. Kein Chaos mit geteilten Logins.' },
  { icon: Shield, title: 'Qualitätskontrolle', description: 'Standardisierte Skripte stellen sicher, dass jeder Gast dasselbe hochwertige Erlebnis bekommt.' },
  { icon: BarChart3, title: 'Analytics & Statistiken', description: 'Welche Touren, Sprachen und Guides performen? Datengestützte Entscheidungen statt Bauchgefühl.' },
  { icon: Layers, title: 'White-Label', description: 'Ihre Marke, Ihre Domain, Ihre Farben. Gäste sehen nur Ihr Branding — nicht GuideTranslator.' },
  { icon: Map, title: 'API-Integration', description: 'Verbinden Sie GuideTranslator mit Ihrem Buchungssystem, CRM oder Website über unsere REST-API.' },
]
const PRICING = {
  title: 'Preise für Agenturen',
  plans: [
    { name: 'Starter', price: '99 EUR/Mo', features: ['5 Guide-Accounts', '20 Touren', '30 Sprachen', 'Basis-Analytics'], cta: 'Starten', href: '/preise' },
    { name: 'Agency', price: '299 EUR/Mo', features: ['Unbegrenzte Guides', 'Unbegrenzte Touren', '130+ Sprachen', 'Erweiterte Analytics', 'White-Label'], cta: 'Demo anfragen', href: '/kontakt?type=demo', highlight: true },
    { name: 'Enterprise', price: 'Individuell', features: ['API-Integration', 'SLA', 'Dedizierter Support', 'Custom Onboarding'], cta: 'Kontakt aufnehmen', href: '/kontakt' },
  ],
}

// ============================================================================
// Component
// ============================================================================
export default function AgenturenPage() {
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
            Die größten Herausforderungen für Agenturen
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

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Was GuideTranslator für Agenturen leistet</h2>
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
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{PRICING.title}</h2>
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
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Die passenden Apps für Ihre Agentur</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { title: 'Enterprise App', desc: 'Zentrale Verwaltung aller Guides, Touren und Sessions.', href: '/apps/enterprise' },
              { title: 'Consumer App', desc: 'Guides erstellen und übersetzen Tourskripte.', href: '/apps/translator' },
              { title: 'Listener App', desc: 'Gäste folgen der Tour in ihrer Sprache.', href: '/apps/live' },
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
          <h2 className="text-2xl md:text-3xl font-bold">Bereit, Ihre Agentur zu skalieren?</h2>
          <p className="opacity-90">Wir zeigen Ihnen in 30 Minuten, wie GuideTranslator in Ihre bestehenden Abläufe passt.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/kontakt?type=demo">Demo vereinbaren <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
              <Link to="/preise">Alle Preise</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
