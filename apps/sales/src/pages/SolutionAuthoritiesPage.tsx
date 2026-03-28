/**
 * Authorities Solution Page
 *
 * Landing page for the Government/Authorities market segment.
 * Highlights: Form templates, queue ticket, privacy, conversation mode.
 */

import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, Check, Building2,
  FileText, Shield, MessageSquare, Users, Clock, Languages
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const CLERK_URL = 'https://authority-clerk.fintutto.world'
const VISITOR_URL = 'https://authority-visitor.fintutto.world'

export default function SolutionAuthoritiesPage() {
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
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-teal-500/30 text-white">
            Amt Translator
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Verstaendigung am Schalter —<br />
            <span className="text-teal-300">ohne Sprachbarriere</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Live-Uebersetzung fuer Behoerden, Buergeraemter und Auslaenderbehoerden.
            Formulare uebersetzen, Gespraeche fuehren, Wartemarken verwalten.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={CLERK_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                Sachbearbeiter-App <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={VISITOR_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Besucher-App <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Fuer den Behoerdenalltag</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: FileText, title: 'Formular-Vorlagen', desc: 'Anmeldeformulare, Antraege und Bescheide vorgefertigt uebersetzen.' },
            { icon: MessageSquare, title: '1:1 Gespraech', desc: 'Bidirektionale Uebersetzung am Schalter — beide Seiten sprechen.' },
            { icon: Clock, title: 'Wartemarken', desc: 'Digitale Wartemarken mit automatischer Aufruf-Uebersetzung.' },
            { icon: Shield, title: 'DSGVO-konform', desc: 'Keine Speicherung personenbezogener Daten. Alle Gespraeche werden verworfen.' },
            { icon: Languages, title: '45 Sprachen', desc: 'Inkl. aller Migrationssprachen: Arabisch, Dari, Tigrinya, Ukrainisch.' },
            { icon: Users, title: 'Team-Accounts', desc: 'Zentrale Verwaltung fuer die ganze Behoerde. Pro Schalter ein Login.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-4 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-teal-300" />
                <h3 className="font-semibold text-sm">{feat.title}</h3>
                <p className="text-xs text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Preise fuer Behoerden</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <p className="font-semibold">Einzelplatz</p>
            <p className="text-2xl font-bold text-teal-300">14,90 EUR/Mo</p>
            <p className="text-xs text-white/70">1 Schalter, unbegrenzte Besucher</p>
          </Card>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 ring-1 ring-teal-400">
            <p className="font-semibold">Behoerdenlizenz</p>
            <p className="text-2xl font-bold text-teal-300">99 EUR/Mo</p>
            <p className="text-xs text-white/70">Unbegrenzte Schalter + Admin</p>
          </Card>
        </div>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-2">
        {['DSGVO-konform', 'BSI-Empfehlung', 'Keine Cloud-Speicherung', 'Made in Germany'].map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-xs font-medium text-white">
            <Check className="w-3 h-3 text-teal-300" /> {s}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={CLERK_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-teal-600 hover:bg-teal-700">
            Jetzt testen <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  )
}
