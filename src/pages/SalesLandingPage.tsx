// SalesLandingPage — Segment-specific landing page with value props + ROI calculator.
// Routes: /sales/guide, /sales/event, /sales/cruise

import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowRight, Mic, Globe2, Users, Wifi, Zap, Ship, Calendar, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ROICalculator from '@/components/pricing/ROICalculator'

type CalcSegment = 'guide' | 'event' | 'cruise'

interface SegmentContent {
  hero: { title: string; subtitle: string }
  painPoints: { icon: typeof Mic; title: string; description: string }[]
  cta: string
}

const CONTENT: Record<CalcSegment, SegmentContent> = {
  guide: {
    hero: {
      title: 'Vox-Geräte waren gestern.',
      subtitle: 'Mit GuideTranslator spricht Ihre Tour sofort in jeder Sprache — ohne Hardware, ohne Aufwand.',
    },
    painPoints: [
      {
        icon: Wifi,
        title: 'Keine Hardware nötig',
        description: 'Gäste nutzen ihr eigenes Smartphone. Keine Geräte ausleihen, aufladen oder zurücknehmen.',
      },
      {
        icon: Globe2,
        title: 'Alle Sprachen gleichzeitig',
        description: 'Sprechen Sie Deutsch — Ihre Gäste lesen die Übersetzung in Echtzeit in ihrer Sprache.',
      },
      {
        icon: Users,
        title: 'Unbegrenzte Teilnehmer',
        description: 'Von 5 bis 100+ Hörer pro Tour. Skaliert ohne zusätzliche Kosten pro Gerät.',
      },
      {
        icon: MapPin,
        title: 'Offline-fähig',
        description: 'Lokaler Modus über WLAN-Hotspot — perfekt für Orte ohne Mobilfunk.',
      },
    ],
    cta: 'Guide-Plan starten',
  },
  event: {
    hero: {
      title: 'Konferenzen multilingual — ab sofort bezahlbar.',
      subtitle: 'Echtzeit-Übersetzung für Events, ohne Dolmetscher-Honorare oder teure SaaS-Plattformen.',
    },
    painPoints: [
      {
        icon: Mic,
        title: 'Live-Broadcasting',
        description: 'Speaker spricht, Teilnehmer sehen die Übersetzung sofort auf ihrem Gerät.',
      },
      {
        icon: Zap,
        title: '90% günstiger als Wordly',
        description: 'Professionelle Echtzeitübersetzung zu einem Bruchteil der Kosten.',
      },
      {
        icon: Users,
        title: 'Bis zu 500 Teilnehmer',
        description: 'QR-Code scannen, Sprache wählen, mitlesen. Keine App-Installation nötig.',
      },
      {
        icon: Calendar,
        title: 'Minutengenau abrechnen',
        description: 'Nur zahlen, was Sie nutzen. Inklusive Minuten + fairer Minutenpreis danach.',
      },
    ],
    cta: 'Event-Plan starten',
  },
  cruise: {
    hero: {
      title: 'Landausflüge ohne Sprachbarriere.',
      subtitle: 'Ersetzen Sie 8 Dolmetscher durch eine App — auf jedem Schiff, bei jeder Exkursion.',
    },
    painPoints: [
      {
        icon: Ship,
        title: 'Multi-Schiff-Flotten',
        description: 'Ein Account für alle Schiffe. Zentrale Verwaltung, lokale Nutzung.',
      },
      {
        icon: Globe2,
        title: 'Bis zu 20 Sprachen parallel',
        description: 'Deckung aller Passagier-Sprachen — ohne für jede Sprache einen Dolmetscher zu buchen.',
      },
      {
        icon: Zap,
        title: 'ROI ab Tag 1',
        description: 'Dolmetscher kosten €350/Tag/Sprache. GuideTranslator kostet einen Bruchteil davon.',
      },
      {
        icon: Wifi,
        title: 'Auch ohne Internet',
        description: 'Lokaler Modus über Bord-WLAN — funktioniert auf hoher See.',
      },
    ],
    cta: 'Cruise-Plan starten',
  },
}

const VALID_SEGMENTS: CalcSegment[] = ['guide', 'event', 'cruise']

export default function SalesLandingPage() {
  const { segment } = useParams<{ segment: string }>()

  if (!segment || !VALID_SEGMENTS.includes(segment as CalcSegment)) {
    return <Navigate to="/pricing" replace />
  }

  const seg = segment as CalcSegment
  const content = CONTENT[seg]

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-8 px-4">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          {content.hero.title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {content.hero.subtitle}
        </p>
        <Link to="/pricing">
          <Button size="lg" className="gap-2 mt-2">
            {content.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Pain points / value props */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {content.painPoints.map((pp, i) => {
          const Icon = pp.icon
          return (
            <Card key={i} className="p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold">{pp.title}</h3>
              <p className="text-sm text-muted-foreground">{pp.description}</p>
            </Card>
          )
        })}
      </div>

      {/* ROI Calculator */}
      <ROICalculator segment={seg} />

      {/* Bottom CTA */}
      <div className="text-center space-y-3 pb-4">
        <p className="text-muted-foreground">
          Bereit? Wählen Sie den passenden Plan.
        </p>
        <Link to="/pricing">
          <Button size="lg" variant="outline" className="gap-2">
            Alle Pläne vergleichen
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
