/**
 * Hospitality Solution Page
 *
 * Landing page for the Hospitality / Counter market segment.
 * Highlights: Bidirectional conversation, counter phrases, walk-in guests.
 */

import {
  ArrowRight, ChevronRight, Check, HandshakeIcon,
  MessageSquare, Languages, Mic, Users, Hotel, CreditCard
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const STAFF_URL = 'https://tl-counter-staff.fintutto.cloud'
const GUEST_URL = 'https://tl-counter-guest.fintutto.cloud'

export default function SolutionHospitalityPage() {
  return (
    <div className="relative max-w-4xl mx-auto space-y-16 py-8 px-4 text-white">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.65]" />
      </div>

      {/* Hero */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-95" />
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/30 text-white">
            Counter Translator
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Gaeste verstehen —<br />
            <span className="text-violet-300">in jeder Sprache</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Bidirektionale Gespraechsuebersetzung am Empfang, Schalter, Counter und auf Messen.
            Beide Seiten sprechen — beide verstehen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={STAFF_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700 w-full sm:w-auto">
                Mitarbeiter-App <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={GUEST_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Gast-App <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Wo Counter Translator hilft</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Hotel, title: 'Hotel & Rezeption', desc: 'Check-in, Zimmerservice, Beschwerden — alles in der Sprache des Gastes.' },
            { icon: CreditCard, title: 'Retail & Handel', desc: 'Beratung, Reklamation, Kasse — internationales Publikum bedienen.' },
            { icon: Users, title: 'Messe & Events', desc: 'Am Stand Besucher beraten, ohne auf Englisch umzusteigen.' },
          ].map((uc, i) => {
            const Icon = uc.icon
            return (
              <Card key={i} className="p-5 space-y-2 text-center bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-6 h-6 text-violet-300 mx-auto" />
                <h3 className="font-semibold">{uc.title}</h3>
                <p className="text-xs text-white/70">{uc.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Funktionen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: MessageSquare, title: 'Bidirektionaler Modus', desc: 'Zwei-Wege-Mikrofon: Mitarbeiter und Gast sprechen abwechselnd, beide sehen die Uebersetzung.' },
            { icon: Mic, title: 'Counter-Phrasen', desc: '10+ vorgefertigte Saetze fuer typische Situationen am Empfang und Schalter.' },
            { icon: Languages, title: '45 Sprachen', desc: 'Von Chinesisch bis Arabisch — die haeufigsten Touristensprachen sofort verfuegbar.' },
            { icon: Users, title: 'Walk-in Gaeste', desc: 'Kein Account noetig. Gast scannt QR-Code, waehlt Sprache, fertig.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-5 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-violet-300" />
                <h3 className="font-semibold text-sm">{feat.title}</h3>
                <p className="text-xs text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Preise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <p className="font-semibold">Einzelplatz</p>
            <p className="text-2xl font-bold text-violet-300">29,90 EUR/Mo</p>
            <p className="text-xs text-white/70">1 Counter, unbegrenzte Gaeste</p>
          </Card>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 ring-1 ring-violet-400">
            <p className="font-semibold">Business</p>
            <p className="text-2xl font-bold text-violet-300">99 EUR/Mo</p>
            <p className="text-xs text-white/70">Unbegrenzte Counter + Team</p>
          </Card>
        </div>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-2">
        {['Kein Gast-Account noetig', 'DSGVO-konform', 'Sofort einsatzbereit', 'Made in Germany'].map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-xs font-medium text-white">
            <Check className="w-3 h-3 text-violet-300" /> {s}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={STAFF_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700">
            Jetzt testen <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  )
}
