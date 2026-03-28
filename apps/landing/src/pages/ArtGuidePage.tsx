/**
 * Art Guide Product Page
 *
 * KI-Audioguide system for museums.
 * 3 pillars: Visitor App, Portal/CMS, White-Label.
 */

import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, Check, Palette,
  Headphones, MessageSquare, MapPin, QrCode,
  Wifi, Users, BarChart3, Upload, Globe2, Paintbrush
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const VISITOR_URL = 'https://world.fintutto.world'
const PORTAL_URL = 'https://portal.fintutto.world'

export default function ArtGuidePage() {
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
            Fintutto Art Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Der KI-Audioguide, der jedes<br />
            <span className="text-violet-300">Museum in die Zukunft bringt.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            KI-generierte Audioguides in jeder Sprache. Interaktiver Chat zu jedem Kunstwerk.
            Portal fuer Museen. White-Label fuer eigenes Branding.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={VISITOR_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700 w-full sm:w-auto">
                Art Guide testen <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Museum-Portal <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: '∞', label: 'Sprachen' },
          { value: 'KI', label: 'Audioguides' },
          { value: 'CMS', label: 'Portal' },
          { value: 'WL', label: 'White-Label' },
        ].map((stat, i) => (
          <div key={i} className="text-center p-4 rounded-lg bg-black/30 backdrop-blur-sm">
            <div className="text-2xl font-bold text-violet-300">{stat.value}</div>
            <div className="text-sm text-white/70">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 3 Pillars */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Drei Saeulen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-6 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
            <Headphones className="w-8 h-8 text-violet-300" />
            <h3 className="font-bold text-lg">Fuer Besucher</h3>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li>KI-Audioguides in jeder Sprache</li>
              <li>Interaktiver KI-Chat zu jedem Werk</li>
              <li>Indoor-Positionierung (QR, BLE, GPS, NFC)</li>
              <li>Offline-Modus</li>
              <li>5 Beschreibungs-Levels (Kind bis Experte)</li>
            </ul>
            <a href={VISITOR_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1 bg-violet-600 hover:bg-violet-700">Testen <ArrowRight className="w-3 h-3" /></Button>
            </a>
          </Card>
          <Card className="p-6 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
            <BarChart3 className="w-8 h-8 text-violet-300" />
            <h3 className="font-bold text-lg">Portal / CMS</h3>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li>Kunstwerke verwalten, Touren erstellen</li>
              <li>Audio generieren (KI)</li>
              <li>Besucheranalytics & Heatmaps</li>
              <li>Content Hub: 5 Beschreibungs-Levels</li>
              <li>Team-Verwaltung & Rollen</li>
            </ul>
            <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1 border-white/30 text-white hover:bg-white/10">Portal oeffnen <ChevronRight className="w-3 h-3" /></Button>
            </a>
          </Card>
          <Card className="p-6 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
            <Paintbrush className="w-8 h-8 text-violet-300" />
            <h3 className="font-bold text-lg">White-Label</h3>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li>Eigene App im eigenen Branding</li>
              <li>world.fintutto.world/visitor/[museum]</li>
              <li>Custom Domain moeglich</li>
              <li>Farben, Logo, Schriftarten anpassen</li>
              <li>Volle API-Integration</li>
            </ul>
            <Link to="/contact">
              <Button size="sm" variant="outline" className="gap-1 border-white/30 text-white hover:bg-white/10">Anfragen <ChevronRight className="w-3 h-3" /></Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Visitor Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Besucher-Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Headphones, title: 'KI-Audio', desc: 'Natuerliche Stimmen in jeder Sprache — generiert, nicht aufgenommen.' },
            { icon: MessageSquare, title: 'KI-Chat', desc: '"Wer hat das gemalt?" — interaktive Fragen zu jedem Kunstwerk.' },
            { icon: QrCode, title: 'QR / BLE / NFC', desc: 'Indoor-Positionierung mit mehreren Technologien. Automatische Erkennung.' },
            { icon: Wifi, title: 'Offline', desc: 'Kompletter Audioguide auch ohne WLAN verfuegbar.' },
            { icon: Globe2, title: 'Alle Sprachen', desc: 'KI-basiert: keine Limitierung auf vorproduzierte Sprachen.' },
            { icon: Users, title: '5 Levels', desc: 'Kinder, Jugendliche, Erwachsene, Experten, Barrierefrei.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-4 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Starter', price: '49 EUR/Mo', desc: '50 Werke, 2 Sprachen, QR', highlight: false },
            { name: 'Professional', price: '199 EUR/Mo', desc: '500 Werke, 10 Sprachen, BLE + Heatmaps', highlight: true },
            { name: 'Enterprise', price: '599 EUR/Mo', desc: 'Unbegrenzt, White-Label, API', highlight: false },
          ].map((tier, i) => (
            <Card key={i} className={`p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 ${tier.highlight ? 'ring-1 ring-violet-400' : ''}`}>
              {tier.highlight && <span className="text-xs text-violet-300 font-semibold">Empfohlen</span>}
              <p className="font-bold text-lg">{tier.name}</p>
              <p className="text-2xl font-bold text-violet-300">{tier.price}</p>
              <p className="text-xs text-white/70">{tier.desc}</p>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Link to="/pricing">
            <Button variant="link" className="gap-1 text-violet-300">
              Alle Preise im Detail <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Guide Ecosystem */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Teil des Guide-Oekosystems</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Palette, name: 'Art Guide', desc: 'Museum-Ebene: Kunstwerke, Touren, Audio', active: true },
            { icon: MapPin, name: 'City Guide', desc: 'Stadt-Ebene: POIs, Stadtfuehrungen, Partner', active: false },
            { icon: Globe2, name: 'Region Guide', desc: 'Regions-Ebene: Staedte, Natur, Ausfluege', active: false },
          ].map((g, i) => {
            const Icon = g.icon
            return (
              <Card key={i} className={`p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 ${g.active ? 'ring-1 ring-violet-400' : 'opacity-70'}`}>
                <Icon className="w-6 h-6 text-violet-300 mx-auto" />
                <h3 className="font-semibold">{g.name}</h3>
                <p className="text-xs text-white/70">{g.desc}</p>
                {!g.active && <span className="text-[10px] text-white/40">Coming Soon</span>}
              </Card>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700">
            Museum-Portal oeffnen <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
        <p className="text-sm text-white/70">
          14 Tage kostenlos testen. Keine Kreditkarte noetig.
        </p>
      </div>
    </div>
  )
}
