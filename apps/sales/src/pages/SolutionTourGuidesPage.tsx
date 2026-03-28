/**
 * Tour Guides / Stadtfuehrer Solution Page
 *
 * Sales landing page for independent tour guides and freelance city guides.
 * Highlights: Instant multilingual tours, QR-join, ROI calculator, pricing.
 * CTA: Kostenlos testen → consumer.fintutto.world
 */
import {
  ArrowRight, ChevronRight, Check, MapPin,
  QrCode, Users, Globe2, Wifi, TrendingUp, Star,
  Smartphone, Clock, Euro, Mic
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const CONSUMER_URL = 'https://consumer.fintutto.world'
const ENTERPRISE_URL = 'https://enterprise.fintutto.world'
const SALES_URL = 'https://sales.fintutto.world'

export default function SolutionTourGuidesPage() {
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
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/30 text-white">
            Guide Translator — fuer Stadtfuehrer & Freelancer
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Deine Tour. Jede Sprache.<br />
            <span className="text-emerald-300">Kein Dolmetscher.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Sprich auf Deutsch — deine Gaeste lesen live auf ihrem Smartphone in Englisch,
            Japanisch, Spanisch oder einer von 45 Sprachen. Ohne App-Download. Ohne Registrierung.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={CONSUMER_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-white">
                Kostenlos testen <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={SALES_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Demo buchen <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
          <p className="text-xs text-white/50">Kein Kreditkarte noetig. Kostenlos bis 3 Hoerer.</p>
        </div>
      </div>

      {/* ── DAS PROBLEM ── */}
      <div className="relative space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">
          Das Problem kennt jeder Guide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Globe2,
              title: '70% der Nachfrage geht verloren',
              desc: 'Internationale Touristen buchen keine Tour, wenn sie kein Deutsch oder Englisch sprechen. Du verlierst sie an Konkurrenten mit mehrsprachigen Guides.',
            },
            {
              icon: Euro,
              title: 'Mehrsprachige Guides sind teuer',
              desc: 'Einen zweiten Guide fuer Japanisch oder Arabisch anzuheuern kostet 200-400 EUR pro Tag. Das frisst deine Marge komplett auf.',
            },
            {
              icon: Clock,
              title: 'Vorbereitung kostet Zeit',
              desc: 'Tourskripte in mehrere Sprachen uebersetzen lassen? Wochen Vorlaufzeit, hohe Kosten, und bei jeder Aenderung von vorne.',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Card key={i} className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-6 h-6 text-red-400" />
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-white/70">{item.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── SO FUNKTIONIERT'S ── */}
      <div className="relative space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">
          In 4 Schritten zur mehrsprachigen Tour
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', icon: Smartphone, title: 'Registrieren', desc: 'Account erstellen auf consumer.fintutto.world — dauert 60 Sekunden.' },
            { step: '2', icon: QrCode, title: 'QR-Code drucken', desc: 'Dein persoenlicher QR-Code fuer die Tour. Einmal drucken, immer verwenden.' },
            { step: '3', icon: Mic, title: 'Sprechen', desc: 'Tour starten, sprechen wie immer. Die KI uebersetzt in Echtzeit.' },
            { step: '4', icon: Users, title: 'Gaeste lesen mit', desc: 'Gaeste scannen den QR, waehlen ihre Sprache — fertig. Kein Download.' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Card key={i} className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10 relative">
                <span className="absolute top-3 right-3 text-3xl font-black text-white/10">{item.step}</span>
                <Icon className="w-6 h-6 text-emerald-300" />
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-white/70">{item.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="relative space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">
          Alles, was ein Guide braucht
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Globe2, title: '45 Sprachen', desc: 'Inkl. Japanisch, Arabisch, Mandarin, Russisch, Hindi, Koreanisch und alle europaeischen Sprachen.' },
            { icon: Wifi, title: 'Offline-faehig', desc: 'Funktioniert auch ohne Mobilfunk — per WiFi-Hotspot vom Smartphone. Ideal in Museen und Kellern.' },
            { icon: QrCode, title: 'QR-Code-Join', desc: 'Gaeste brauchen keine App. QR-Code scannen, Sprache waehlen — sofort dabei.' },
            { icon: MapPin, title: 'Tourskript hochladen', desc: 'Skript vorab hochladen fuer bessere Uebersetzungsqualitaet bei Fachbegriffen und Eigennamen.' },
            { icon: TrendingUp, title: 'Session-Statistiken', desc: 'Wie viele Gaeste, welche Sprachen, wie lange? Daten fuer dein Marketing.' },
            { icon: Star, title: 'Bewertungs-Link', desc: 'Automatischer Google-Bewertungslink am Ende der Tour. Mehr 5-Sterne-Reviews.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-4 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-emerald-300" />
                <h3 className="font-semibold text-sm">{feat.title}</h3>
                <p className="text-xs text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── ROI RECHNER ── */}
      <div className="relative">
        <Card className="p-6 sm:p-8 space-y-6 bg-emerald-900/30 backdrop-blur-sm border-emerald-500/30">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-emerald-300 shrink-0" />
            <h2 className="text-xl sm:text-2xl font-bold drop-shadow-lg">Was bringt das konkret?</h2>
          </div>
          <p className="text-white/70 text-sm">Beispielrechnung: Stadtfuehrer in Muenchen, 3 Touren pro Woche</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-white/80 text-sm uppercase tracking-wide">Vorher (ohne GuideTranslator)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">Durchschnittliche Gruppengrösse</span><span>8 Personen</span></div>
                <div className="flex justify-between"><span className="text-white/70">Davon international</span><span>3 Personen</span></div>
                <div className="flex justify-between"><span className="text-white/70">Ticketpreis</span><span>25 EUR</span></div>
                <div className="flex justify-between font-semibold border-t border-white/10 pt-2"><span>Monatlicher Umsatz</span><span className="text-white/60">2.340 EUR</span></div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-emerald-300 text-sm uppercase tracking-wide">Nachher (mit GuideTranslator)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/70">Neue Gruppengrösse (intl. Gaeste)</span><span>+5 Personen</span></div>
                <div className="flex justify-between"><span className="text-white/70">Zusaetzlicher Umsatz/Monat</span><span className="text-emerald-300">+1.560 EUR</span></div>
                <div className="flex justify-between"><span className="text-white/70">Kosten GuideTranslator Guide Pro</span><span className="text-red-400">-69 EUR</span></div>
                <div className="flex justify-between font-bold border-t border-white/10 pt-2 text-base"><span>Monatlicher Umsatz</span><span className="text-emerald-300">3.831 EUR</span></div>
              </div>
            </div>
          </div>
          <div className="text-center pt-2">
            <p className="text-emerald-300 font-bold text-lg">ROI: +1.491 EUR/Monat bei 69 EUR Investition = <span className="text-2xl">2.161% ROI</span></p>
          </div>
        </Card>
      </div>

      {/* ── PREISE ── */}
      <div className="relative space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center drop-shadow-lg">
          Fuer jeden Guide der richtige Plan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: 'Free',
              price: '0 EUR',
              period: '',
              desc: 'Zum Ausprobieren',
              features: ['3 Hoerer pro Session', '5 Sprachen', 'QR-Code-Join', '60 Min/Monat'],
              cta: 'Jetzt starten',
              href: CONSUMER_URL,
              highlight: false,
            },
            {
              name: 'Guide Basic',
              price: '19,90 EUR',
              period: '/Mo',
              desc: 'Fuer selbststaendige Guides',
              features: ['10 Hoerer pro Session', '45 Sprachen', 'QR-Code-Join', 'Tourskript hochladen', 'Session-Statistiken', 'Bewertungs-Link'],
              cta: 'Kostenlos testen',
              href: CONSUMER_URL,
              highlight: false,
            },
            {
              name: 'Guide Pro',
              price: '69 EUR',
              period: '/Mo',
              desc: 'Fuer Profis & Vielbucher',
              features: ['30 Hoerer pro Session', '45 Sprachen', 'Alles aus Basic', 'Glossare & Fachbegriffe', 'Transkript-Export', 'Prioritaets-Support'],
              cta: 'Guide Pro testen',
              href: CONSUMER_URL,
              highlight: true,
            },
          ].map((tier, i) => (
            <Card key={i} className={`p-5 space-y-4 bg-black/30 backdrop-blur-sm border-white/10 flex flex-col ${tier.highlight ? 'ring-1 ring-emerald-400' : ''}`}>
              {tier.highlight && <span className="text-xs font-semibold text-emerald-300">Beliebtester Plan</span>}
              <div>
                <p className="font-bold text-lg">{tier.name}</p>
                <p className="text-2xl font-black text-emerald-300">{tier.price}<span className="text-sm font-normal text-white/60">{tier.period}</span></p>
                <p className="text-xs text-white/60 mt-1">{tier.desc}</p>
              </div>
              <ul className="space-y-1.5 flex-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={tier.href} target="_blank" rel="noopener noreferrer" className="block">
                <Button
                  size="sm"
                  className={`w-full gap-1 ${tier.highlight ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
                >
                  {tier.cta} <ArrowRight className="w-3 h-3" />
                </Button>
              </a>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-white/50">
          Alle Preise zzgl. MwSt. Jederzeit kuendbar. Keine Mindestlaufzeit.{' '}
          <Link to="/pricing" className="underline hover:text-white/80">Alle Preise ansehen</Link>
        </p>
      </div>

      {/* ── TRUST / SOCIAL PROOF ── */}
      <div className="relative space-y-4">
        <h2 className="text-xl font-bold text-center drop-shadow-lg">Warum Guides GuideTranslator waehlen</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            '✓ 45 Sprachen inklusive',
            '✓ Kein App-Download fuer Gaeste',
            '✓ Offline-faehig (WiFi-Hotspot)',
            '✓ DSGVO-konform',
            '✓ Made in Germany',
            '✓ Jederzeit kuendbar',
          ].map((badge, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80 border border-white/10">
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div className="relative text-center space-y-4 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">Bereit fuer deine erste mehrsprachige Tour?</h2>
        <p className="text-white/70 max-w-xl mx-auto">
          Starte kostenlos — keine Kreditkarte noetig. In 2 Minuten bist du bereit fuer internationale Gaeste.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={CONSUMER_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
              Jetzt kostenlos starten <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <a href={SALES_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
              Demo buchen <ChevronRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
        <p className="text-xs text-white/40">
          Fragen? <a href="mailto:hello@fintutto.world" className="underline hover:text-white/70">hello@fintutto.world</a>
        </p>
      </div>
    </div>
  )
}
