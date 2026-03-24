/**
 * Agencies / Reiseagenturen Solution Page
 *
 * Sales landing page for tour agencies and travel operators.
 * Highlights: Team management, central billing, white-label, API.
 * CTA: Demo anfragen → sales.guidetranslator.com
 */
import {
  ArrowRight, ChevronRight, Check, Building2,
  Users, Globe2, BarChart3, Layers, Key, Headphones,
  TrendingUp, Euro, Shield, Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ENTERPRISE_URL = 'https://enterprise.guidetranslator.com'
const SALES_URL = 'https://sales.guidetranslator.com'

export default function SolutionAgenciesPage() {
  return (
    <div className="relative max-w-4xl mx-auto space-y-16 py-8 px-4 text-white">
      {/* Background logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.65]" />
      </div>

      {/* ── HERO ── */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-95" />
        </div>
        <div className="relative z-10 space-y-5">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/30 text-white">
            Enterprise — fuer Agenturen & Reiseveranstalter
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Eine Agentur. Hunderte Touren.<br />
            <span className="text-violet-300">Jede Sprache.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Zentrales Guide-Management, Team-Accounts, White-Label und API-Integration.
            Skaliere dein Angebot ohne mehr Guides einzustellen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={SALES_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700 w-full sm:w-auto text-white">
                Demo anfragen <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={ENTERPRISE_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Enterprise-App testen <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
          <p className="text-xs text-white/50">14 Tage kostenlos testen. Kein Kreditkarte noetig.</p>
        </div>
      </div>

      {/* ── DAS PROBLEM ── */}
      <div className="relative space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">
          Die groessten Probleme von Agenturen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Users,
              title: 'Guide-Recruiting ist teuer',
              desc: 'Mehrsprachige Guides sind rar und teuer. Fuer jede neue Sprache musst du einen neuen Guide einstellen oder ausbilden.',
            },
            {
              icon: Shield,
              title: 'Qualitaetskontrolle fehlt',
              desc: 'Jeder Guide macht die Tour anders. Standardisierte Skripte und Qualitaetssicherung sind kaum moeglich.',
            },
            {
              icon: TrendingUp,
              title: 'Saisonale Schwankungen',
              desc: 'Im Sommer zu wenig Guides, im Winter zu viele. Fixkosten fressen die Marge in der Nebensaison.',
            },
            {
              icon: Euro,
              title: 'Margendruck steigt',
              desc: 'Online-Plattformen (Viator, GetYourGuide) nehmen 20-30% Provision. Die Marge wird immer duenner.',
            },
            {
              icon: BarChart3,
              title: 'Kein Ueberblick',
              desc: 'Welcher Guide hat wie viele Touren gemacht? Welche Sprachen sind gefragt? Keine zentralen Daten.',
            },
            {
              icon: Layers,
              title: 'Keine Skalierbarkeit',
              desc: 'Mehr Touren = mehr Guides = mehr Kosten. Das Geschaeftsmodell skaliert nicht linear.',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Card key={i} className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-6 h-6 text-red-400" />
                <h3 className="font-bold text-sm">{item.title}</h3>
                <p className="text-xs text-white/70">{item.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── LOESUNG ── */}
      <div className="relative space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">
          GuideTranslator Enterprise — die Loesung
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Users,
              title: 'Team-Management',
              desc: 'Verwalte alle deine Guides zentral. Jeder Guide bekommt einen eigenen Account mit individuellen Berechtigungen und Limits.',
              link: '/apps/enterprise',
            },
            {
              icon: BarChart3,
              title: 'Zentrales Dashboard & Analytics',
              desc: 'Sieh in Echtzeit, welche Touren laufen, welche Sprachen gefragt sind und wie viele Gaeste dabei sind.',
              link: '/apps/enterprise',
            },
            {
              icon: Layers,
              title: 'Standardisierte Tourskripte',
              desc: 'Lade Tourskripte einmal hoch — alle Guides nutzen dieselbe Qualitaet. Aenderungen gelten sofort fuer alle.',
              link: null,
            },
            {
              icon: Key,
              title: 'White-Label',
              desc: 'Dein Logo, deine Farben, deine Domain. Die Gaeste sehen deine Marke — nicht GuideTranslator.',
              link: null,
            },
            {
              icon: Zap,
              title: 'API-Integration',
              desc: 'Verbinde GuideTranslator mit deinem Buchungssystem (Fareharbor, Bokun, Regiondo). Vollautomatisch.',
              link: null,
            },
            {
              icon: Headphones,
              title: 'Prioritaets-Support',
              desc: 'Dedizierter Account Manager, SLA-Garantie und direkter Telefon-Support. Kein Ticket-System.',
              link: null,
            },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-6 h-6 text-violet-300" />
                <h3 className="font-bold">{feat.title}</h3>
                <p className="text-sm text-white/70">{feat.desc}</p>
                {feat.link && (
                  <Link to={feat.link} className="text-xs text-violet-300 hover:text-violet-200 flex items-center gap-1">
                    Mehr erfahren <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── ROI RECHNER ── */}
      <div className="relative">
        <Card className="p-6 sm:p-8 space-y-6 bg-violet-900/30 backdrop-blur-sm border-violet-500/30">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-violet-300 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold drop-shadow-lg">Was bringt das fuer eine Agentur?</h2>
          </div>
          <p className="text-white/70 text-sm">Beispielrechnung: Agentur mit 5 Guides, 15 Touren/Woche in Muenchen</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-white/80 text-sm uppercase tracking-wide">Vorher (ohne GuideTranslator)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">Guides fuer 4 Sprachen</span><span>4 Guides × 2.800 EUR</span></div>
                <div className="flex justify-between"><span className="text-white/70">Personalkosten/Monat</span><span className="text-red-400">11.200 EUR</span></div>
                <div className="flex justify-between"><span className="text-white/70">Umsatz/Monat (60 Touren)</span><span>18.000 EUR</span></div>
                <div className="flex justify-between font-semibold border-t border-white/10 pt-2"><span>Marge</span><span className="text-white/60">38%</span></div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-violet-300 text-sm uppercase tracking-wide">Nachher (mit GuideTranslator)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">Guides (1 reicht fuer alle Sprachen)</span><span>1 Guide × 2.800 EUR</span></div>
                <div className="flex justify-between"><span className="text-white/70">GuideTranslator Agentur Premium</span><span className="text-red-400">249 EUR</span></div>
                <div className="flex justify-between"><span className="text-white/70">Umsatz/Monat (mehr intl. Gaeste)</span><span className="text-violet-300">+22.000 EUR</span></div>
                <div className="flex justify-between font-bold border-t border-white/10 pt-2 text-base"><span>Neue Marge</span><span className="text-violet-300">87%</span></div>
              </div>
            </div>
          </div>
          <div className="text-center pt-2">
            <p className="text-violet-300 font-bold text-lg">Ersparnis: <span className="text-2xl">~8.200 EUR/Monat</span> bei 249 EUR Investition</p>
          </div>
        </Card>
      </div>

      {/* ── PREISE ── */}
      <div className="relative space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">
          Preise fuer Agenturen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[
            {
              name: 'Agentur Standard',
              price: '99 EUR',
              period: '/Mo',
              desc: 'Kleine Agenturen bis 3 Guides',
              features: [
                '30 Hoerer, 3 Sessions gleichzeitig',
                '3 Guide-Accounts',
                'Zentrales Team-Dashboard',
                'Zentrale Abrechnung',
                '45 Sprachen',
                'E-Mail-Support',
              ],
              cta: 'Jetzt testen',
              href: ENTERPRISE_URL,
              highlight: false,
            },
            {
              name: 'Agentur Premium',
              price: '249 EUR',
              period: '/Mo',
              desc: 'Grosse Agenturen & Reiseveranstalter',
              features: [
                '100 Hoerer, 10 Sessions gleichzeitig',
                '10 Guide-Accounts',
                'White-Label (dein Logo & Domain)',
                'API-Integration (Fareharbor, Bokun)',
                'Tourskript-Bibliothek',
                'Prioritaets-Support & Account Manager',
              ],
              cta: 'Demo anfragen',
              href: SALES_URL,
              highlight: true,
            },
          ].map((tier, i) => (
            <Card key={i} className={`p-5 space-y-4 bg-black/30 backdrop-blur-sm border-white/10 flex flex-col ${tier.highlight ? 'ring-1 ring-violet-400' : ''}`}>
              {tier.highlight && <span className="text-xs font-semibold text-violet-300">Empfohlen fuer Agenturen</span>}
              <div>
                <p className="font-bold text-lg">{tier.name}</p>
                <p className="text-2xl font-black text-violet-300">{tier.price}<span className="text-sm font-normal text-white/60">{tier.period}</span></p>
                <p className="text-xs text-white/60 mt-1">{tier.desc}</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={tier.href} target="_blank" rel="noopener noreferrer" className="block">
                <Button
                  size="sm"
                  className={`w-full gap-1 ${tier.highlight ? 'bg-violet-600 hover:bg-violet-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
                >
                  {tier.cta} <ArrowRight className="w-3 h-3" />
                </Button>
              </a>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-white/60">
          Kreuzfahrt-Reedereien und grosse Flotten?{' '}
          <a href={SALES_URL} target="_blank" rel="noopener noreferrer" className="text-violet-300 underline hover:text-violet-200">
            Enterprise-Kalkulator nutzen
          </a>
        </p>
        <p className="text-center text-xs text-white/40">
          Alle Preise zzgl. MwSt. Jederzeit kuendbar.{' '}
          <Link to="/pricing" className="underline hover:text-white/60">Alle Preise ansehen</Link>
        </p>
      </div>

      {/* ── TRUST ── */}
      <div className="relative space-y-4">
        <h2 className="text-xl font-bold text-center drop-shadow-lg">Warum Agenturen GuideTranslator waehlen</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            '✓ 45 Sprachen inklusive',
            '✓ White-Label moeglich',
            '✓ API fuer Buchungssysteme',
            '✓ DSGVO-konform',
            '✓ Made in Germany',
            '✓ Offline-faehig',
            '✓ Kein App-Download fuer Gaeste',
            '✓ 14 Tage kostenlos testen',
          ].map((badge, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80 border border-white/10">
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="relative text-center space-y-4 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">
          Bereit, deine Agentur zu skalieren?
        </h2>
        <p className="text-white/70 max-w-xl mx-auto">
          Buch eine kostenlose Demo — wir zeigen dir in 20 Minuten, wie GuideTranslator
          in deinen Betrieb passt und was du konkret sparen kannst.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={SALES_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto">
              Demo anfragen <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <a href={ENTERPRISE_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
              Enterprise-App testen <ChevronRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
        <p className="text-xs text-white/40">
          Fragen? <a href="mailto:enterprise@guidetranslator.com" className="underline hover:text-white/70">enterprise@guidetranslator.com</a>
        </p>
      </div>
    </div>
  )
}
