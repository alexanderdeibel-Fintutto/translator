// AboutPage — Über uns / Team / Geschichte / Netzwerk
// Route: /ueber-uns

import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, Globe2, Award, Rocket, Clock,
  Building, Radio, Star, Lightbulb, Target, Heart, ExternalLink, Ship
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const TIMELINE = [
  { year: '2001', event: 'Gründung iGuide Media GmbH (Weimar/Berlin)', desc: 'Erste Audio-Stadtführungen.' },
  { year: '2005', event: 'Gründung itour city guide GmbH (Berlin)', desc: '80+ Projekte für Tourismusorganisationen.' },
  { year: '2007', event: 'iGuide Media GmbH (Bern, Schweiz)', desc: '250+ Audio-Touren in ganz Europa.' },
  { year: '2012', event: 'Gründung der Guiding Group', desc: 'Bündelung aller Unternehmen zu einem Netzwerk.' },
  { year: '2019', event: 'Smart Streaming Solutions / Voicetra (Potsdam)', desc: 'WLAN-basiertes Live Audio Streaming.' },
  { year: '2020', event: 'Weltneuheit: SmartGuide', desc: 'Weltweit erstes Smartphone-basiertes Tour Guide System.' },
  { year: '2026', event: 'Gründung ai tour UG — Launch Fintutto', desc: 'KI-Echtzeit-Übersetzung in 45+ Sprachen — die nächste Evolution.' },
]

const NETWORK = [
  { name: 'itour city guide GmbH', location: 'Berlin', desc: 'Content-Produktion & Distribution — 80+ Tourismusprojekte seit 2005', url: 'https://itour.de/' },
  { name: 'iGuide Media GmbH', location: 'Bern, Schweiz', desc: 'Audio-Touren & Hardware-Vertrieb — 250+ Touren seit 2007', url: 'https://www.iguide.ch/en/' },
  { name: 'Initree Software GmbH', location: 'Berlin', desc: 'App-Entwicklung & Systemarchitektur', url: null },
  { name: 'Smart Streaming Solutions GmbH', location: 'Potsdam', desc: 'Live Audio Streaming-Technologie (Voicetra)', url: null },
]

export default function AboutPage() {
  return (
    <div className="relative max-w-2xl mx-auto space-y-8 py-6 px-4 text-white">

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[600px] h-[600px] opacity-[0.28]" />
      </div>

      {/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[260px] h-[260px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Über uns
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Zwei Macher. Eine Mission.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            20+ Jahre Tourismustechnologie — jetzt mit KI.
          </p>
        </div>
      </div>

      {/* Key facts */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: '20+', label: 'Jahre', icon: Clock },
          { value: '250+', label: 'Audio-Touren', icon: Radio },
          { value: '80+', label: 'Kunden', icon: Building },
          { value: '4', label: 'Unternehmen', icon: Globe2 },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="text-center p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-1">
              <Icon className="w-4 h-4 text-sky-300 mx-auto" />
              <div className="text-xl font-bold text-sky-300">{stat.value}</div>
              <div className="text-[10px] text-white/60">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Mission */}
      <div className="p-5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 space-y-3">
        <h2 className="text-lg font-bold drop-shadow">Unsere Mission</h2>
        <p className="text-sm text-white/75 leading-relaxed">
          Jedes Jahr erleben Millionen Menschen geführte Touren — und stoßen auf dieselben Barrieren: Sprache, Technologie, Kosten.
          Wir glauben, dass Kultur keine Sprachgrenzen kennen sollte. Deshalb bauen wir die Technologien, die das möglich machen.
        </p>
        <p className="text-sm font-semibold text-sky-300 drop-shadow">
          "Making guided tours better" — seit 2001. Jetzt mit KI.
        </p>
      </div>

      {/* Team */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Die Köpfe hinter Fintutto</h2>

        {/* Alexander */}
        <div className="p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 space-y-3">
          <div>
            <h3 className="text-lg font-bold">Alexander Deibel</h3>
            <p className="text-xs text-sky-300 font-medium">CEO & CTO — ai tour UG</p>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">
            Kreativer Stratege mit tiefem Technologie-Verständnis und reichem Erfahrungsschatz aus Kultur, Medien und Veranstaltungsmanagement.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Lightbulb, title: 'Technologie-Architekt', desc: 'KI-Integration, Cloud-Architektur, Produktentwicklung.' },
              { icon: Star, title: 'Kreativ-strategisch', desc: 'Musik, Theater, Film — wo andere Technik sehen, sieht er Erlebnisse.' },
              { icon: Target, title: 'Unternehmerisch', desc: 'Ergebnisorientiert. Vom Konzept bis zum weltweiten Rollout.' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="p-2 rounded-lg bg-black/20 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1">
                    <Icon className="w-3 h-3 text-sky-300" />
                    <p className="font-semibold text-[11px]">{item.title}</p>
                  </div>
                  <p className="text-[10px] text-white/60">{item.desc}</p>
                </div>
              )
            })}
          </div>
          <blockquote className="border-l-2 border-sky-400/60 pl-3 text-xs italic text-white/60">
            "Technologie muss Erlebnisse schaffen, nicht ersetzen."
          </blockquote>
        </div>

        {/* Ulrich */}
        <div className="p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 space-y-3">
          <div>
            <h3 className="text-lg font-bold">Ulrich Berger</h3>
            <p className="text-xs text-sky-300 font-medium">CMO — ai tour UG · Gründer & CEO der Guiding Group</p>
          </div>
          <p className="text-sm text-white/75 leading-relaxed">
            Pionier der Tourismustechnologie und Seriengründer mit über 20 Jahren Erfahrung an der Schnittstelle von Tourismus, Technologie und Innovation.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Award, title: 'Erfinder & Innovator', desc: 'SmartGuide — weltweit erstes Smartphone-basiertes Tour Guide System.' },
              { icon: Globe2, title: 'Branchenkenner', desc: '250+ Audio-Touren, 80+ Tourismusorganisationen als Kunden.' },
              { icon: Heart, title: 'Visionär', desc: 'Kulturelle Erlebnisse durch Technologie erhalten und verbessern.' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="p-2 rounded-lg bg-black/20 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1">
                    <Icon className="w-3 h-3 text-sky-300" />
                    <p className="font-semibold text-[11px]">{item.title}</p>
                  </div>
                  <p className="text-[10px] text-white/60">{item.desc}</p>
                </div>
              )
            })}
          </div>
          <blockquote className="border-l-2 border-sky-400/60 pl-3 text-xs italic text-white/60">
            "Wir haben die Tür aufgestoßen. Echtzeit-Übertragung von Sprache ist unser Alleinstellungsmerkmal."
          </blockquote>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Unsere Geschichte</h2>
        <div className="space-y-2">
          {TIMELINE.map((item, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15">
              <div className="text-sky-300 font-bold text-sm w-10 shrink-0">{item.year}</div>
              <div>
                <p className="font-semibold text-sm leading-tight">{item.event}</p>
                <p className="text-xs text-white/60 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Network */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Unser Netzwerk</h2>
        <div className="grid grid-cols-2 gap-2">
          {NETWORK.map((company, i) => (
            <div key={i} className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-1">
              <p className="font-semibold text-sm leading-tight">{company.name}</p>
              <p className="text-[11px] text-sky-300">{company.location}</p>
              <p className="text-[11px] text-white/60">{company.desc}</p>
              {company.url && (
                <a href={company.url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300">
                  Website <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 text-center space-y-3">
        <h2 className="text-lg font-bold drop-shadow">Bereit loszulegen?</h2>
        <p className="text-sm text-white/70">Kostenlos starten — keine Kreditkarte nötig.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link to="/live">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              Jetzt testen <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/kontakt">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 gap-2">
              Demo anfragen <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

    </div>
  )
}
