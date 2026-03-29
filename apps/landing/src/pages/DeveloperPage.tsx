import { Link } from 'react-router-dom'
import {
  Code2, Zap, Globe2, Wifi, ArrowRight, Terminal,
  Package, Layers, Shield, ChevronRight, ExternalLink,
  Radio, Cpu, BookOpen
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const INTEGRATION_TIERS = [
  {
    icon: Globe2,
    name: 'REST API',
    subtitle: 'Pay-as-you-go',
    desc: 'Direkte HTTP-Integration. Übersetzung, TTS, STT und OCR über einfache API-Calls — in jede Sprache, jedes Framework.',
    color: 'bg-sky-600',
    price: 'Ab 15 € / 1 Mio. Zeichen',
    features: ['45 Sprachen', '6-Provider-Kaskade', '<1s Latenz', 'OpenAPI 3.1 Spec'],
    link: 'https://developer.fintutto.world/docs',
  },
  {
    icon: Package,
    name: 'SDKs',
    subtitle: 'NPM-Pakete',
    desc: 'Fertige Bausteine für React, Vue, Angular und React Native. Offline-Fähigkeit, Live-Broadcasting und Audio-Guides inklusive.',
    color: 'bg-violet-600',
    price: 'Ab 49 € / Monat',
    features: ['@fintutto/core', '@fintutto/live-sdk', '@fintutto/offline-sdk', 'TypeScript-first'],
    link: 'https://developer.fintutto.world/sdks',
  },
  {
    icon: Layers,
    name: 'White Label',
    subtitle: 'Vollständige App',
    desc: 'Eure App, unser Motor. Komplette Fintutto-Funktionalität unter eurem Branding — ohne eine Zeile Backend-Code.',
    color: 'bg-emerald-600',
    price: 'Auf Anfrage',
    features: ['Custom Branding', 'Eigene Domain', 'Vollständige App', 'Dedicated Support'],
    link: 'https://developer.fintutto.world/white-label',
  },
]

const USE_CASES = [
  {
    icon: Radio,
    title: 'Event- & Konferenz-Apps',
    desc: 'Live-Übersetzung direkt in eure bestehende App integrieren — ohne zweite App für Teilnehmer.',
  },
  {
    icon: BookOpen,
    title: 'Museen & Stadtmarketing',
    desc: 'Mehrsprachige Audio-Guides als SDK-Modul — fertig in Tagen statt Monaten.',
  },
  {
    icon: Wifi,
    title: 'Offline-fähige Lösungen',
    desc: 'Kreuzfahrtschiffe, Bergregionen, Tunnels — der Offline AI SDK funktioniert ohne Internet.',
  },
  {
    icon: Cpu,
    title: 'Enterprise-Systeme',
    desc: 'Krankenhaus-Informationssysteme, Behörden-Tablets — REST API mit SLA und dedizierter Infrastruktur.',
  },
]

const CODE_EXAMPLE = `// @fintutto/core — Schnellstart
import { FintuttoClient } from '@fintutto/core'

const client = new FintuttoClient({ apiKey: 'ft_...' })

const result = await client.translate({
  text: 'Willkommen in unserem Museum',
  from: 'de',
  to: ['en', 'fr', 'es', 'zh', 'ar']
})

// result.translations['en'] → "Welcome to our museum"
// result.provider → "azure" | "google" | "opus-mt"
// result.latency → 312 // ms`

const STATS = [
  { value: '45', label: 'Sprachen' },
  { value: '6', label: 'Provider-Kaskade' },
  { value: '<1s', label: 'Latenz' },
  { value: '99.9%', label: 'Uptime SLA' },
]

export default function DeveloperPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, oklch(0.08 0.03 270) 0%, oklch(0.12 0.05 290) 50%, oklch(0.10 0.04 260) 100%)',
        }}
      >
        {/* Orbit rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <div className="w-[600px] h-[600px] rounded-full border border-violet-400" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-6">
          <div className="w-[900px] h-[900px] rounded-full border border-sky-400" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white/80 border border-white/10">
            <Code2 className="w-3 h-3" />
            Ein Teil des Fintutto-Ökosystems
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight text-white">
            Sprache in deine<br />
            <span className="text-sky-300">App integrieren.</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Die Fintutto Translation API bringt 45 Sprachen, Echtzeit-Broadcasting
            und On-Device-KI in deine bestehende App — über REST, SDK oder White Label.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href="https://developer.fintutto.world" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white border-0">
                Zum Developer Portal
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
            <a href="https://developer.fintutto.world/playground" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                <Terminal className="w-4 h-4" />
                API ausprobieren
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 border-b border-border/50 bg-muted/20">
        <div className="container max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Tiers */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Drei Wege zur Integration</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Ob einzelner API-Call oder vollständige White-Label-App — wähle die Integrationsstufe,
              die zu eurem Produkt passt.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {INTEGRATION_TIERS.map((tier) => (
              <Card key={tier.name} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
                <div className={`${tier.color} p-6`}>
                  <div className="flex items-center gap-3 mb-2">
                    <tier.icon className="w-6 h-6 text-white" />
                    <div>
                      <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                      <p className="text-white/70 text-xs">{tier.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-4">{tier.desc}</p>
                  <ul className="space-y-1.5 mb-5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-muted-foreground font-medium mb-4">{tier.price}</div>
                  <a href={tier.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      Mehr erfahren <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">In Minuten integriert</h2>
              <p className="text-muted-foreground mb-6">
                Das SDK kapselt die gesamte Provider-Kaskade — Azure, Google, MyMemory, Opus-MT —
                hinter einem einzigen, typisierten Interface. Kein Provider-Lock-in, automatisches Fallback.
              </p>
              <div className="space-y-3">
                {[
                  'TypeScript-first, vollständige Typen',
                  'Automatisches Provider-Fallback',
                  'Offline-Modus für schlechte Verbindungen',
                  'React Hooks inklusive',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <a href="https://developer.fintutto.world/docs" target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2">
                    Zur Dokumentation <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
            <div>
              <div className="rounded-xl overflow-hidden border border-border/50 shadow-2xl">
                <div className="bg-zinc-900 px-4 py-2.5 flex items-center gap-2 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  </div>
                  <span className="text-xs text-white/40 ml-2">quick-start.ts</span>
                </div>
                <pre className="bg-zinc-950 text-emerald-300 text-xs p-5 overflow-x-auto leading-relaxed">
                  <code>{CODE_EXAMPLE}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Wer integriert die API?</h2>
            <p className="text-muted-foreground">
              Unternehmen, die bereits eine App haben und Mehrsprachigkeit nachrüsten wollen.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {USE_CASES.map((uc) => (
              <Card key={uc.title} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <uc.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground">{uc.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, oklch(0.08 0.03 270) 0%, oklch(0.12 0.05 290) 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-white">Bereit zum Integrieren?</h2>
          <p className="text-white/70">
            Kostenlos starten — API-Key in 30 Sekunden, erster Request in 5 Minuten.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://developer.fintutto.world" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700 text-white border-0 w-full sm:w-auto">
                Jetzt starten — kostenlos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href="https://developer.fintutto.world/white-label" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                White Label anfragen
              </Button>
            </a>
          </div>
          <p className="text-xs text-white/40 pt-2">
            Kein Kreditkarte erforderlich · Kostenloser Tier verfügbar · DSGVO-konform
          </p>
        </div>
      </section>

      {/* Back to ecosystem */}
      <div className="py-6 px-4 text-center border-t border-border/30">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Zurück zur Fintutto-Übersicht
        </Link>
      </div>
    </div>
  )
}
