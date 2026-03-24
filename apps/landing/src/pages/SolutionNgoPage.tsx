/**
 * NGO Solution Page
 *
 * Landing page for the NGO / Refugee Aid market segment.
 * Highlights: Emergency phrases, cultural hints, counseling protocol.
 */

import {
  ArrowRight, ChevronRight, Check, HeartHandshake,
  AlertTriangle, Globe2, BookOpen, Shield, FileText, Wifi
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const HELPER_URL = 'https://tl-helper.fintutto.cloud'
const CLIENT_URL = 'https://tl-client.fintutto.cloud'

export default function SolutionNgoPage() {
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
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-orange-500/30 text-white">
            Refugee Translator
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Hilfe verstehen —<br />
            <span className="text-orange-300">in jeder Sprache</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Kommunikation mit Gefluechteten ohne Sprachbarriere.
            Fuer Sozialarbeiter, Berater, Ehrenamtliche und Erstaufnahmen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={HELPER_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-orange-600 hover:bg-orange-700 w-full sm:w-auto">
                Helfer-App <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={CLIENT_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Klienten-App <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Fuer die Fluechtlingsarbeit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, title: 'Notfall-Phrasen', desc: 'Vorgefertigte Saetze fuer Erstaufnahme, medizinische Notfaelle und Orientierung.' },
            { icon: Globe2, title: 'Migrationssprachen', desc: 'Arabisch, Dari, Paschtu, Tigrinya, Somali, Ukrainisch, Farsi und mehr.' },
            { icon: BookOpen, title: 'Kulturelle Hinweise', desc: 'Kontextinformationen zu kulturellen Besonderheiten fuer bessere Verstaendigung.' },
            { icon: FileText, title: 'Beratungsprotokoll', desc: 'Strukturiertes Protokoll fuer Beratungsgespraeche — exportierbar als PDF.' },
            { icon: Shield, title: 'Datenschutz', desc: 'Keine Speicherung personenbezogener Daten. DSGVO-konform.' },
            { icon: Wifi, title: 'Offline-faehig', desc: 'Funktioniert auch in Unterkuenften ohne stabiles Internet.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-4 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-orange-300" />
                <h3 className="font-semibold text-sm">{feat.title}</h3>
                <p className="text-xs text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Soziale Preise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <p className="font-semibold">Ehrenamtlich</p>
            <p className="text-2xl font-bold text-orange-300">Kostenlos</p>
            <p className="text-xs text-white/70">Fuer verifizierte Ehrenamtliche</p>
          </Card>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 ring-1 ring-orange-400">
            <p className="font-semibold">Organisation</p>
            <p className="text-2xl font-bold text-orange-300">9,90 EUR/Mo</p>
            <p className="text-xs text-white/70">NGO-Lizenz, Team-Accounts</p>
          </Card>
        </div>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-2">
        {['DSGVO-konform', 'Kostenlos fuer Ehrenamtliche', 'Offline-faehig', 'Made in Germany'].map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-xs font-medium text-white">
            <Check className="w-3 h-3 text-orange-300" /> {s}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={HELPER_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-orange-600 hover:bg-orange-700">
            Jetzt starten <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  )
}
