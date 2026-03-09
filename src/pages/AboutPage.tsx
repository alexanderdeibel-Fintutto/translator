// AboutPage — Ueber uns / Team / Geschichte / Netzwerk
// Route: /ueber-uns

import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, Users, Globe2, Award, Rocket, Clock,
  Building, MapPin, Ship, Radio, Smartphone, Star, Check, Lightbulb,
  Target, Heart, ExternalLink
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const TIMELINE = [
  { year: '2001', event: 'Gruendung iGuide Media GmbH (Weimar/Berlin)', desc: 'Die Reise beginnt: Erste Audio-Stadtfuehrungen.' },
  { year: '2005', event: 'Gruendung itour city guide GmbH (Berlin)', desc: '80+ Projekte fuer Tourismusorganisationen und Destinationen.' },
  { year: '2007', event: 'iGuide Media GmbH (Bern, Schweiz)', desc: '250+ Audio-Touren in ganz Europa.' },
  { year: '2012', event: 'Gruendung der Guiding Group', desc: 'Buendelung aller Unternehmen zu einem Netzwerk.' },
  { year: '2019', event: 'Smart Streaming Solutions / Voicetra (Potsdam)', desc: 'WLAN-basiertes Live Audio Streaming.' },
  { year: '2020', event: 'Weltneuheit: SmartGuide', desc: 'Weltweit erstes Smartphone-basiertes Tour Guide System.' },
  { year: '2026', event: 'Gruendung fintutto UG — Launch GuideTranslator', desc: 'KI-Echtzeit-Uebersetzung in 45+ Sprachen — die naechste Evolution.' },
]

const NETWORK = [
  {
    name: 'itour city guide GmbH',
    location: 'Berlin',
    desc: 'Content-Produktion & Distribution — 80+ Tourismusprojekte seit 2005',
    url: 'https://itour.de/',
  },
  {
    name: 'iGuide Media GmbH',
    location: 'Bern, Schweiz',
    desc: 'Audio-Touren & Hardware-Vertrieb — 250+ Touren seit 2007',
    url: 'https://www.iguide.ch/en/',
  },
  {
    name: 'Initree Software GmbH',
    location: 'Berlin',
    desc: 'App-Entwicklung & Systemarchitektur',
    url: null,
  },
  {
    name: 'Smart Streaming Solutions GmbH',
    location: 'Potsdam',
    desc: 'Live Audio Streaming-Technologie (Voicetra)',
    url: null,
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8 px-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
          Ueber uns
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
          Zwei Macher. Eine Mission. Die Zukunft der Fuehrung.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Wir verbinden 20+ Jahre Erfahrung in Tourismustechnologie mit modernster KI —
          um gefuehrte Touren fuer immer zu veraendern.
        </p>
      </div>

      {/* Key facts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: '20+', label: 'Jahre Erfahrung', icon: Clock },
          { value: '250+', label: 'Audio-Touren', icon: Radio },
          { value: '80+', label: 'Tourismus-Kunden', icon: Building },
          { value: '4', label: 'Unternehmen im Netzwerk', icon: Globe2 },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="text-center p-4 rounded-lg bg-muted/50 space-y-1">
              <Icon className="w-5 h-5 text-primary mx-auto" />
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Mission */}
      <Card className="p-6 sm:p-8 bg-muted/30">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold">Unsere Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            Jedes Jahr erleben Millionen von Menschen gefuehrte Touren — Stadtfuehrungen,
            Museumsbesuche, Kreuzfahrt-Ausfluege. Und jedes Jahr stossen sie auf
            dieselben Barrieren: Sprache, Technologie, Kosten.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Wir glauben, dass Kultur und Reiseerlebnisse keine Sprachgrenzen kennen
            sollten. Deshalb bauen wir die Technologien, die das moeglich machen — von
            der Hardware bis zur KI, von der Walking Tour bis zur Kreuzfahrtflotte.
          </p>
          <p className="font-semibold text-primary">
            "Making guided tours better" — seit 2001. Jetzt mit KI.
          </p>
        </div>
      </Card>

      {/* Team */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Die Koepfe hinter itour.guide</h2>

        <div className="space-y-6">
          {/* Alexander */}
          <Card className="p-6 sm:p-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">Alexander Deibel</h3>
                <p className="text-sm text-primary font-medium">CEO & CTO — fintutto UG</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Alexander ist ein kreativer Stratege mit einem ungewoehnlichen Profil:
                Er verbindet tiefes Technologie-Verstaendnis mit einem reichen
                Erfahrungsschatz aus Kultur, Medien und Veranstaltungsmanagement.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium text-sm flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    Technologie-Architekt
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Als CTO verantwortet er die gesamte technische Infrastruktur — von KI-Integration
                    ueber Cloud-Architektur bis zur Produktentwicklung. Er denkt in Systemen und baut sie auch.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium text-sm flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-primary" />
                    Kreativ-strategisch
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aus seiner Karriere in Musik, Theater, Film und Kunst bringt er eine
                    einzigartige Perspektive ein — wo andere nur Technik sehen, sieht er Erlebnisse.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium text-sm flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-primary" />
                    Unternehmerisch
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ergebnisorientiert, analytisch und mit der Faehigkeit, unter Druck ruhig
                    und strukturiert zu arbeiten. Vom Konzept bis zum weltweiten Rollout.
                  </p>
                </div>
              </div>
              <blockquote className="border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
                "Technologie muss Erlebnisse schaffen, nicht ersetzen."
              </blockquote>
            </div>
          </Card>

          {/* Ulrich */}
          <Card className="p-6 sm:p-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">Ulrich Berger</h3>
                <p className="text-sm text-primary font-medium">CMO — fintutto UG · Gruender & CEO der Guiding Group</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ulrich ist ein Pionier der Tourismustechnologie und Seriengruender
                mit ueber 20 Jahren Erfahrung an der Schnittstelle von Tourismus,
                Technologie und Innovation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary" />
                    Erfinder & Innovator
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mehrere Weltneuheiten entwickelt — darunter der SmartGuide, das weltweit
                    erste System, das Gaeste-Smartphones als Tour-Guide-Empfaenger nutzt.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium text-sm flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4 text-primary" />
                    Branchenkenner
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    250+ Audio-Touren produziert, 80+ Tourismusorganisationen als Kunden,
                    namhafte Reedereien beliefert. Jahrzehntelange Praxis.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium text-sm flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-primary" />
                    Visionaer
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sein Antrieb: Durch Technologie nicht nur Touren besser machen, sondern
                    kulturelle Erlebnisse erhalten. Nachhaltigkeit durch Digitalisierung.
                  </p>
                </div>
              </div>
              <blockquote className="border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
                "Wir haben die Tuer aufgestossen und werden dieses Feld weiter
                ausbauen. Die Echtzeit-Uebertragung von Sprache ist unser
                Alleinstellungsmerkmal."
              </blockquote>
            </div>
          </Card>
        </div>
      </div>

      {/* Warum itour.guide */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Warum Kunden weltweit auf uns vertrauen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Clock,
              title: '20+ Jahre Branchenexpertise',
              desc: 'Seit 2001 entwickeln wir Technologien fuer gefuehrte Touren. Was als Audio-Stadtfuehrung begann, ist heute ein vollstaendiges Oekosystem von Hardware, Software und KI.',
            },
            {
              icon: Award,
              title: 'Erfinder-DNA',
              desc: 'Mehrere Weltneuheiten — vom ersten Smartphone-basierten Tour Guide System (SmartGuide) bis zur KI-Echtzeit-Uebersetzung (GuideTranslator). Unsere Innovationen setzen die Standards.',
            },
            {
              icon: Rocket,
              title: 'Alles aus einer Hand',
              desc: 'Content-Produktion, Hardware, Software, Streaming, KI — wir decken die gesamte Wertschoepfungskette ab. Ein Ansprechpartner, ein Oekosystem.',
            },
            {
              icon: Ship,
              title: 'Von Walking Tour bis Kreuzfahrtflotte',
              desc: 'Ob ein einzelner Stadtfuehrer oder eine Reederei mit 10 Schiffen — unsere Loesungen skalieren mit Ihren Anforderungen.',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Card key={i} className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Unsere Geschichte</h2>
        <div className="space-y-3">
          {TIMELINE.map((item, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-16 shrink-0 text-right">
                <span className="text-sm font-mono font-bold text-primary">{item.year}</span>
              </div>
              <div className="w-px bg-border shrink-0 relative">
                <div className="absolute top-1 -left-1 w-2.5 h-2.5 rounded-full bg-primary" />
              </div>
              <div className="pb-4">
                <p className="font-medium text-sm">{item.event}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guiding Group Network */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Die Guiding Group — unser Netzwerk</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            itour.guide ist die neue Plattform der fintutto UG und buendelt die
            Innovationskraft eines gewachsenen Netzwerks.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NETWORK.map((company, i) => (
            <Card key={i} className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{company.name}</h3>
                {company.url && (
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {company.location}
              </p>
              <p className="text-xs text-muted-foreground">{company.desc}</p>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Gemeinsame Mission: Gefuehrte Touren durch benutzerfreundliche Technologie kontinuierlich besser machen.
        </p>
      </div>

      {/* Fintutto Ecosystem */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Das Fintutto Ecosystem</h2>
        <p className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
          GuideTranslator ist Teil des Fintutto Ecosystems — einer Reihe spezialisierter SaaS-Loesungen.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'GuideTranslator', desc: 'KI-Echtzeit-Uebersetzung' },
            { name: 'ai tour Portal', desc: 'Tourismusplattform' },
            { name: 'Vermietify', desc: 'Vermietungssoftware' },
            { name: 'BescheidBoxer', desc: 'Dokumentenmanagement' },
          ].map((product, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 text-center">
              <p className="font-medium text-sm">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <Card className="p-6 text-center space-y-3">
        <h2 className="text-xl font-bold">Kontakt</h2>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">fintutto UG (haftungsbeschraenkt)</p>
          <p>Kolonie 2, 18317 Saal, Deutschland</p>
          <p>info@fintutto.de · enterprise@itour.guide</p>
          <p>+49 30 440 40 740</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/kontakt">
            <Button className="gap-2 w-full sm:w-auto">
              Kontakt aufnehmen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/kontakt?type=demo">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              Demo anfragen
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
