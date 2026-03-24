/**
 * Region Guide Product Page
 *
 * From the city to the region. Nature, hikes, POIs.
 * Status: In Planung.
 */

import { Link } from 'react-router-dom'
import {
  ArrowRight, Mountain, Globe2, MapPin,
  Headphones, Trees, Compass, Sun, Map, Palette
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RegionGuidePage() {
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
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-500/30 text-white">
            In Planung
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Von der Stadt zur Region.<br />
            <span className="text-green-300">Vom Museum zur Landschaft.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Regionen mit allen Staedten, POIs, Naturerlebnissen.
            Ausfluege und Wanderungen mit KI-Audio in jeder Sprache.
          </p>
          <Link to="/contact">
            <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
              Interesse anmelden <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Geplante Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Mountain, title: 'Naturerlebnisse', desc: 'Wanderungen, Aussichtspunkte, Naturparks — mit KI-Audioguide.' },
            { icon: MapPin, title: 'Alle Staedte', desc: 'Regionen mit allen Staedten, Doerfern und Points of Interest.' },
            { icon: Compass, title: 'Ausfluege', desc: 'Kuratierte Tagesausfluege mit Navigation und Audio-Begleitung.' },
            { icon: Sun, title: 'Saisonale Angebote', desc: 'Regionale Partner und saisonale Highlights automatisch.' },
            { icon: Map, title: 'Vollbild-Karte', desc: 'Interaktive Karte mit allen Highlights der Region.' },
            { icon: Globe2, title: 'White-Label', desc: '[region].regionguide.fintutto.world — eigenes Branding.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-4 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-green-300" />
                <h3 className="font-semibold text-sm">{feat.title}</h3>
                <p className="text-xs text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Ecosystem */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Das Guide-Oekosystem</h2>
        <div className="max-w-md mx-auto space-y-3">
          {[
            { icon: Palette, name: 'Art Guide', level: 'Museum-Ebene', desc: 'Kunstwerke, Touren, Audio', color: 'text-violet-300', status: 'Live', link: '/products/artguide' },
            { icon: MapPin, name: 'City Guide', level: 'Stadt-Ebene', desc: 'POIs, Stadtfuehrungen, Partner', color: 'text-amber-300', status: 'Coming Soon', link: '/products/cityguide' },
            { icon: Mountain, name: 'Region Guide', level: 'Regions-Ebene', desc: 'Staedte, Natur, Ausfluege', color: 'text-green-300', status: 'In Planung', link: '' },
          ].map((g, i) => {
            const Icon = g.icon
            const content = (
              <Card className={`p-4 flex items-center gap-4 bg-black/30 backdrop-blur-sm border-white/10 ${i === 2 ? 'ring-1 ring-green-400' : ''} hover:bg-white/5 transition-colors`}>
                <Icon className={`w-8 h-8 ${g.color} shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{g.name}</h3>
                    <span className={`text-[10px] ${g.color}`}>{g.status}</span>
                  </div>
                  <p className="text-xs text-white/50">{g.level}: {g.desc}</p>
                </div>
                {i < 2 && <span className="text-white/30 text-lg">↑</span>}
              </Card>
            )
            return g.link ? <Link key={i} to={g.link}>{content}</Link> : <div key={i}>{content}</div>
          })}
        </div>
        <p className="text-center text-sm text-white/50">
          Alles vernetzt. Alles mehrsprachig. Alles KI-gestuetzt.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold drop-shadow-lg">Region Guide kommt 2027</h2>
        <p className="text-white/70">Interesse an einer Pilot-Region? Kontaktiere uns.</p>
        <Link to="/contact">
          <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700">
            Kontakt aufnehmen <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
