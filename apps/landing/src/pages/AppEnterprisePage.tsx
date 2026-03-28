import {
  ArrowRight, Radio, Settings, Users, Zap, Shield,
  Upload, BarChart3, ChevronRight, Check, Building
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const APP_URL = 'https://enterprise.fintutto.world'

export default function AppEnterprisePage() {
  return (
    <div className="relative max-w-4xl mx-auto space-y-16 py-8 px-4 text-white">
      {/* Page Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.65]" />
      </div>
      {/* Hero */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-95" />
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Fintutto Enterprise
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Live-Sessions verwalten.<br />
            Für Guides, Speaker & Events.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            Erstelle und steuere Live-Übersetzungssessions für dein Publikum.
            Teilnehmer-Management, Pre-Translation Uploads und Echtzeit-Kontrolle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={APP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700">
                Session starten
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={APP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                Anmelden
                <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Alles für Profis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Radio, title: 'Session-Management', desc: 'Sessions erstellen, konfigurieren und mit einem Klick live schalten. QR-Code wird automatisch generiert.' },
            { icon: Users, title: 'Teilnehmer-Verwaltung', desc: 'Sehe wer verbunden ist, in welcher Sprache, und verwalte Zugangsrechte in Echtzeit.' },
            { icon: Upload, title: 'Pre-Translation Uploads', desc: 'Tour-Texte vorab hochladen und übersetzen. Konsistente Qualität bei wiederkehrenden Sessions.' },
            { icon: BarChart3, title: 'Analytics & Export', desc: 'Session-Statistiken, Nutzungsberichte und Transkript-Export (TXT/MD).' },
            { icon: Shield, title: 'Team & Organisation', desc: 'Sub-Accounts für Guides, zentrale Abrechnung, individuelle Zugänge.' },
            { icon: Settings, title: 'Einstellungen', desc: 'Sprachen, TTS-Qualität, Glossare, White-Label-Branding und API-Zugang konfigurieren.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-sky-300" />
                </div>
                <h3 className="font-semibold drop-shadow-lg">{feat.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Zielgruppen */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Fuer wen?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, title: 'Guides & Museen', desc: 'Stadtführungen, Museumsführungen, Architektur-Touren — ohne Vox-Geräte.' },
            { icon: Building, title: 'Agenturen & Events', desc: 'Konferenzen, Messen, Firmenmeetings — bis zu 500 Teilnehmer.' },
            { icon: Zap, title: 'Techniker & Admins', desc: 'Sessions vorbereiten, Pre-Translations hochladen, Technik betreuen.' },
          ].map((seg, i) => {
            const Icon = seg.icon
            return (
              <Card key={i} className="p-5 space-y-2 text-center bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-6 h-6 text-sky-300 mx-auto" />
                <h3 className="font-semibold drop-shadow-lg">{seg.title}</h3>
                <p className="text-xs text-white/70">{seg.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Preise */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Plaene ab 19,90 EUR/Monat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { name: 'Guide Basic', price: '19,90 EUR/Mo', highlight: '10 Hörer' },
            { name: 'Agentur', price: 'ab 99 EUR/Mo', highlight: '30 Hörer, 3 Sessions' },
            { name: 'Event', price: 'ab 199 EUR/Mo', highlight: '500 Hörer' },
            { name: 'Cruise', price: 'ab 1.990 EUR/Mo', highlight: 'Unbegrenzt' },
          ].map((p, i) => (
            <Card key={i} className="p-4 text-center space-y-1 bg-black/30 backdrop-blur-sm border-white/10">
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-lg font-bold text-sky-300">{p.price}</p>
              <p className="text-xs text-white/70">{p.highlight}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={APP_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-violet-600 hover:bg-violet-700">
            Enterprise App öffnen
            <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Impressum Enterprise */}
      <div className="text-center text-xs text-white/70 border-t pt-6">
        <p>ai tour guide ug (haftungsbeschränkt) · GF: Alexander Deibel · Kolonie 2, 18317 Saal · info@fintutto.world</p>
      </div>
    </div>
  )
}
