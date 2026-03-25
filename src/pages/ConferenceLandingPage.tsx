// ConferenceLandingPage — Dedicated sales landing page for conference centers & event agencies
// Route: /sales/conference
// Targets: Congress centers, event agencies, associations, scientific conferences
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mic, Globe2, Users, Zap, Calendar, Building2, Shield, Headphones,
  Volume2, Clock, Languages, Radio, Lock, ArrowRight, ChevronRight,
  Check, Star, Loader2, Wifi, Monitor, FileText, QrCode, TrendingUp,
  Cpu, Signal
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase-client'

// ============================================================================
// Content Definitions
// ============================================================================

const HERO = {
  badge: '90% günstiger als Simultandolmetscher',
  title: 'Ihre Konferenz spricht jede Sprache.',
  subtitle:
    'Echtzeit-Übersetzung für Kongresse, Tagungen und Workshops — ohne Dolmetscher, ohne teure Plattformen. Teilnehmer scannen einen QR-Code und lesen oder hören in ihrer Sprache. Ab 199 EUR/Monat.',
}

const STATS = [
  { value: '199 EUR', label: 'ab / Monat' },
  { value: '500', label: 'Teilnehmer max.' },
  { value: '130+', label: 'Sprachen (Pro)' },
  { value: '<1s', label: 'Latenz' },
]

const PAIN_POINTS = [
  {
    icon: Mic,
    title: 'Live-Broadcasting',
    description:
      'Der Speaker spricht — bis zu 500 Teilnehmer sehen die Übersetzung sofort auf ihrem eigenen Gerät. Latenz unter einer Sekunde.',
  },
  {
    icon: Zap,
    title: '90% günstiger',
    description:
      'Simultandolmetscher kosten 1.500–3.000 EUR pro Tag und Sprache. GuideTranslator: ab 199 EUR/Monat mit 2.000 Minuten für alle Sprachen inklusive.',
  },
  {
    icon: Users,
    title: 'Bis zu 500 Teilnehmer',
    description:
      'QR-Code auf den Beamer — 500 Teilnehmer joinen in 30 Sekunden. Jeder wählt seine Sprache. Keine App-Installation nötig.',
  },
  {
    icon: Calendar,
    title: 'Multi-Track-Konferenzen',
    description:
      'Bis zu 10 parallele Sessions (Pro-Plan). Hauptbühne, Workshops und Breakout-Sessions — alles mehrsprachig, gleichzeitig.',
  },
]

const FEATURES = [
  {
    icon: Languages,
    title: 'Unbegrenzte Sprachen (Pro)',
    description:
      'Basic: 20 Sprachen. Pro: Alle 130+ Sprachen inklusive — kein Teilnehmer wird ausgeschlossen.',
  },
  {
    icon: Volume2,
    title: 'Chirp 3 HD Audio (Pro)',
    description:
      'Höchste Sprachqualität — Teilnehmer können zuhören statt lesen. Ideal für Keynotes und Podiumsdiskussionen.',
  },
  {
    icon: Clock,
    title: 'Session-Protokoll',
    description:
      'Die gesamte Konferenz als Transkript exportierbar (TXT/MD). Mit Zeitstempeln und allen Übersetzungen.',
  },
  {
    icon: Shield,
    title: 'White-Label (Pro)',
    description:
      'Eigenes Konferenz-Branding. Kein GuideTranslator-Logo — Ihre Veranstaltung, Ihr Erscheinungsbild.',
  },
  {
    icon: Wifi,
    title: 'Offline-Edge-Modus',
    description:
      'Lokaler Edge-Server im Kongresszentrum für vollständige Unabhängigkeit vom Messe-WLAN. Null Latenz, maximale Zuverlässigkeit.',
  },
  {
    icon: Monitor,
    title: 'Kein App-Download',
    description:
      'Teilnehmer scannen den QR-Code und öffnen die Übersetzung direkt im Browser (PWA). Keine IT-Infrastruktur nötig.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Plan buchen',
    description:
      'Basic oder Pro wählen. In 5 Minuten einsatzbereit — kein IT-Projekt, keine Hardware-Beschaffung.',
  },
  {
    step: '2',
    title: 'QR-Code projizieren',
    description:
      'QR-Code auf die Leinwand oder in die Konferenz-App einbinden. Teilnehmer scannen und wählen ihre Sprache.',
  },
  {
    step: '3',
    title: 'Speaker spricht',
    description:
      'Echtzeit-Übersetzung auf allen Geräten. Unter 1 Sekunde Latenz. Das Protokoll wird automatisch erstellt.',
  },
]

const PRICING = [
  {
    name: 'Conference Basic',
    price: '199 EUR',
    period: '/Monat',
    highlights: [
      '100 Teilnehmer (bis zu 3 Sessions)',
      '20 Sprachen inklusive',
      '2.000 Min/Monat (~33h)',
      'Neural2-TTS Sprachausgabe',
      'Session-Protokoll-Export',
    ],
    cta: 'Basic starten',
    highlighted: false,
  },
  {
    name: 'Conference Pro',
    price: '499 EUR',
    period: '/Monat',
    highlights: [
      '500 Teilnehmer (bis zu 10 Sessions)',
      'Alle 130+ Sprachen',
      '8.000 Min/Monat (~133h)',
      'Chirp 3 HD + White-Label',
      'API-Zugang + Transkript-Export',
    ],
    cta: 'Pro starten',
    highlighted: true,
  },
  {
    name: 'Congress White-Label',
    price: '2.500 EUR',
    period: '/Monat',
    highlights: [
      'Eigene Domain & CI-Farben',
      'Lokaler Offline-Edge-Server',
      'Unbegrenzte Teilnehmer',
      'Audio-Anlage Integration (XLR/Dante)',
      'Dedizierter Support & SLA',
    ],
    cta: 'Angebot anfragen',
    highlighted: false,
  },
]

const USE_CASES = [
  'Wissenschaftliche Konferenzen — Vorträge in 20+ Sprachen simultan',
  'Firmenmeetings — Internationale Teams und Board Meetings',
  'NGO-Konferenzen — Delegierte aus aller Welt',
  'Kirchentage & Synoden — Mehrsprachige Gottesdienste und Vorträge',
  'Politische Veranstaltungen — Bürgerversammlungen mit Migrationssprachen',
  'Webinare — Remote-Teilnehmer mit Live-Untertiteln',
]

const TESTIMONIALS = [
  {
    quote:
      'Wir haben GuideTranslator auf unserem internationalen Symposium eingesetzt. 300 Teilnehmer aus 18 Ländern — und kein einziger Dolmetscher. Die Lösung hat uns über 8.000 EUR gespart.',
    author: 'Dr. Markus Hoffmann',
    role: 'Kongressorganisator',
    company: 'Medizinische Fachgesellschaft Berlin',
  },
  {
    quote:
      'Als Kongresszentrum bieten wir GuideTranslator nun als Standard-Service an. Unsere Kunden sind begeistert — und wir haben ein neues Alleinstellungsmerkmal.',
    author: 'Sandra Krüger',
    role: 'Veranstaltungsleiterin',
    company: 'Congress Center Hamburg',
  },
  {
    quote:
      'Der White-Label-Plan war genau das, was wir gesucht haben. Unsere eigene Marke, unsere Domain — und die Technologie von Fintutto im Hintergrund.',
    author: 'Thomas Bauer',
    role: 'Head of Events',
    company: 'Internationale Handelskammer',
  },
]

const TRUST_SIGNALS = [
  'E2E-verschlüsselt (AES-256-GCM)',
  'DSGVO-konform — kein Cloud-Zwang',
  '87 automatisierte Tests',
  'Made in Germany — Fintutto UG',
]

// ============================================================================
// Component
// ============================================================================

export default function ConferenceLandingPage() {
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  async function handleRegister() {
    if (!regEmail) return
    setRegistering(true)
    setRegError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: regEmail,
        options: {
          data: { organization: regName, segment: 'conference', source: 'landing_conference' },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      })
      if (error) throw error
      setRegistered(true)
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.')
    } finally {
      setRegistering(false)
    }
  }

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
              <a href="#registrierung">
                Kostenlos testen <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/features">
                Alle Features <ChevronRight className="h-4 w-4 ml-2" />
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

      {/* ── Pain Points ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Warum GuideTranslator für Ihre Konferenz?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PAIN_POINTS.map((pp, i) => {
              const Icon = pp.icon
              return (
                <Card key={i} className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{pp.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pp.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="so-funktionierts" className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            In 3 Schritten zur mehrsprachigen Konferenz
          </h2>
          <div className="space-y-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Features im Detail</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              return (
                <Card key={i} className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Use Cases ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Anwendungsfälle</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {USE_CASES.map((uc, i) => (
              <div key={i} className="flex items-start gap-2 p-4 rounded-lg bg-background">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{uc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="preise" className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Pläne & Preise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((plan, i) => (
              <Card
                key={i}
                className={`p-6 space-y-4 flex flex-col ${
                  plan.highlighted ? 'border-primary ring-2 ring-primary' : ''
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground self-start">
                    Empfohlen
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.highlights.map((h, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <a href="#registrierung">{plan.cta}</a>
                </Button>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Alle Preise netto, zzgl. gesetzlicher MwSt. Jährliche Zahlung auf Anfrage mit Rabatt verfügbar.
          </p>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Das sagen unsere Partner</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="p-6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{t.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role}, {t.company}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technical highlights ─────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Technische Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Signal className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">4-Tier Transport</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Cloud → Hotspot → Bluetooth → Offline. Automatischer Fallback — funktioniert immer,
                auch bei schlechtem WLAN auf Großveranstaltungen.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">E2E-Verschlüsselung</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                AES-256-GCM mit PBKDF2 Key Derivation (100.000 Iterationen). Vertrauliche
                Konferenzinhalte bleiben geschützt.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">On-Device KI (Offline)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Opus-MT und Whisper laufen als WASM direkt im Browser. Im Edge-Modus verlassen keine
                Daten das Kongresszentrum.
              </p>
            </Card>
            <Card className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Live-Broadcasting-Protokoll</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Proprietäres WebSocket-Protokoll für unter 1 Sekunde Latenz bei 500 gleichzeitigen
                Teilnehmern.
              </p>
            </Card>
          </div>
          <div className="text-center">
            <Link to="/technology">
              <Button variant="link" className="gap-1">
                Technische Architektur im Detail
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust signals ────────────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          {TRUST_SIGNALS.map((signal, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background text-xs font-medium shadow-sm"
            >
              <Shield className="w-3 h-3" />
              {signal}
            </span>
          ))}
        </div>
      </section>

      {/* ── Registration ─────────────────────────────────────────────────── */}
      <section id="registrierung" className="py-16 px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            {registered ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Willkommen!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Wir haben Ihnen eine E-Mail mit Ihren Zugangsdaten gesendet. Bitte prüfen Sie auch
                  Ihren Spam-Ordner.
                </p>
                <Button asChild>
                  <Link to="/auth">
                    Zum Login <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-center mb-2">30 Tage kostenlos testen</h3>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Keine Kreditkarte nötig. Sofort einsatzbereit.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Kongresszentrum / Organisation</Label>
                    <Input
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Name Ihrer Organisation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-Mail-Adresse</Label>
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ihre@organisation.de"
                    />
                  </div>
                  {regError && (
                    <p className="text-xs text-destructive">{regError}</p>
                  )}
                  <Button
                    className="w-full"
                    onClick={handleRegister}
                    disabled={registering || !regEmail}
                  >
                    {registering ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registriere...
                      </>
                    ) : (
                      'Kostenlos registrieren'
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Mit der Registrierung akzeptieren Sie unsere{' '}
                    <Link to="/datenschutz" className="underline">
                      Datenschutzerklärung
                    </Link>
                    .
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      </section>

      {/* ── Cross-links ──────────────────────────────────────────────────── */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-xl font-bold text-center">Mehr entdecken</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link to="/features" className="block">
              <Card className="p-4 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold text-sm">Alle Features</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  7 Produkte in einer App — von Live-Broadcasting bis Kamera-OCR
                </p>
              </Card>
            </Link>
            <Link to="/technology" className="block">
              <Card className="p-4 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold text-sm">Technische Architektur</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  4-Tier-Transport, On-Device KI, E2E-Verschlüsselung
                </p>
              </Card>
            </Link>
            <Link to="/compare" className="block">
              <Card className="p-4 hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold text-sm">Wettbewerbervergleich</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  vs. Wordly, KUDO, Interprefy und klassische Dolmetscher
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold">Bereit für mehrsprachige Konferenzen?</h2>
          <p className="text-muted-foreground">
            Starten Sie noch heute — oder sprechen Sie mit uns über Ihre individuelle Anforderung.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <a href="#registrierung">
                Kostenlos starten <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/kontakt">
                Demo anfragen <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
