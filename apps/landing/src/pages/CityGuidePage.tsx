/**
 * City Guide Product Page
 *
 * Interactive city guide with AI audio in any language.
 * Status: Coming Soon.
 */

import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, MapPin, Globe2,
  Headphones, Map, ShoppingBag, Calendar, Wifi, Users, Palette
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CityGuidePage() {
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
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/30 text-white">
            Coming Soon
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Jede Stadt. Jede Sprache.<br />
            <span className="text-amber-300">Ein Guide.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Interaktive Stadtfuehrungen mit KI-Audio in jeder Sprache.
            POIs entdecken, Touren folgen, Angebote nutzen — offline-faehig.
          </p>
          <Link to="/contact">
            <Button size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700">
              Interesse anmelden <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Was City Guide kann</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Headphones, title: 'KI-Audioguides', desc: 'Interaktive Stadtfuehrungen mit natuerlicher KI-Stimme in jeder Sprache.' },
            { icon: MapPin, title: 'POI-Entdeckung', desc: 'Points of Interest entdecken, Touren folgen, versteckte Perlen finden.' },
            { icon: ShoppingBag, title: 'Lokale Partner', desc: 'Restaurants, Shops, Museen — regionale Empfehlungen und Angebote.' },
            { icon: Calendar, title: 'Buchungssystem', desc: 'Touren und Erlebnisse direkt buchen. Integration mit lokalen Anbietern.' },
            { icon: Map, title: 'Offline-Karten', desc: 'Komplette Stadt-Karte auch ohne Roaming oder WLAN verfuegbar.' },
            { icon: Globe2, title: 'Alle Sprachen', desc: 'KI-basiert: keine Limitierung. Perfekt fuer internationalen Tourismus.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-4 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-amber-300" />
                <h3 className="font-semibold text-sm">{feat.title}</h3>
                <p className="text-xs text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Target Groups */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Fuer wen?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, title: 'Tourismusverbaende & DMOs', desc: 'Destination Management fuer die ganze Stadt — digital, mehrsprachig, messbar.' },
            { icon: MapPin, title: 'Staedte & Gemeinden', desc: 'Eigene Stadt-App im eigenen Branding: cityguide.fintutto.world/[stadt]' },
            { icon: ShoppingBag, title: 'Lokale Partner', desc: 'Restaurants, Shops, Museen — als Partner sichtbar werden und Besucher gewinnen.' },
          ].map((seg, i) => {
            const Icon = seg.icon
            return (
              <Card key={i} className="p-5 space-y-2 text-center bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-6 h-6 text-amber-300 mx-auto" />
                <h3 className="font-semibold">{seg.title}</h3>
                <p className="text-xs text-white/70">{seg.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* White-Label */}
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold drop-shadow-lg">White-Label fuer Staedte</h2>
        <p className="text-white/70 max-w-xl mx-auto">
          Jede Stadt bekommt ihre eigene App unter eigener Subdomain.
          Farben, Logo, Inhalte — alles anpassbar. Powered by Fintutto.
        </p>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          {['cityguide.fintutto.world/muenchen', 'cityguide.fintutto.world/berlin', 'cityguide.fintutto.world/hamburg'].map((url, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full bg-black/30 text-amber-300 font-mono text-xs">
              {url}
            </span>
          ))}
        </div>
      </div>

      {/* Guide Ecosystem */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Das Guide-Oekosystem</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/products/artguide">
            <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 hover:bg-white/5 transition-colors">
              <Palette className="w-6 h-6 text-violet-300 mx-auto" />
              <h3 className="font-semibold">Art Guide</h3>
              <p className="text-xs text-white/70">Museum-Ebene</p>
              <span className="text-[10px] text-violet-300">Live</span>
            </Card>
          </Link>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 ring-1 ring-amber-400">
            <MapPin className="w-6 h-6 text-amber-300 mx-auto" />
            <h3 className="font-semibold">City Guide</h3>
            <p className="text-xs text-white/70">Stadt-Ebene</p>
            <span className="text-[10px] text-amber-300">Coming Soon</span>
          </Card>
          <Link to="/products/regionguide">
            <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 opacity-70 hover:bg-white/5 transition-colors">
              <Globe2 className="w-6 h-6 text-green-300 mx-auto" />
              <h3 className="font-semibold">Region Guide</h3>
              <p className="text-xs text-white/70">Regions-Ebene</p>
              <span className="text-[10px] text-white/40">In Planung</span>
            </Card>
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold drop-shadow-lg">City Guide kommt Q3/2026</h2>
        <p className="text-white/70">Interesse? Melde dich fuer Updates an.</p>
        <Link to="/contact">
          <Button size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700">
            Interesse anmelden <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
