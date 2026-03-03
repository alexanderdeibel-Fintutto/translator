// SalesLandingPage — Segment-specific landing page with value props + ROI calculator.
// Routes: /sales/guide, /sales/agency, /sales/event, /sales/cruise, /sales/personal

import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom'
import { ArrowRight, Mic, Globe2, Users, Wifi, Zap, Ship, Calendar, MapPin, Building, Smartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ROICalculator from '@/components/pricing/ROICalculator'
import LeadRegistrationForm from '@/components/sales/LeadRegistrationForm'

type SalesSegment = 'personal' | 'guide' | 'agency' | 'event' | 'cruise'
type CalcSegment = 'guide' | 'agency' | 'event' | 'cruise'

interface SegmentContent {
  hero: { title: string; subtitle: string }
  painPoints: { icon: typeof Mic; title: string; description: string }[]
  cta: string
  hasCalculator: boolean
}

const CONTENT: Record<SalesSegment, SegmentContent> = {
  personal: {
    hero: {
      title: 'Uebersetzen, sprechen, verstehen — ueberall.',
      subtitle: 'GuideTranslator macht Ihr Smartphone zum persoenlichen Dolmetscher. Beim Arzt, auf der Reise, im Alltag.',
    },
    painPoints: [
      {
        icon: Smartphone,
        title: 'Immer dabei',
        description: 'Kein Extra-Geraet noetig. Einfach Smartphone oeffnen und losreden.',
      },
      {
        icon: Globe2,
        title: '22+ Sprachen',
        description: 'Von Arabisch bis Vietnamesisch — die wichtigsten Sprachen sind abgedeckt.',
      },
      {
        icon: Wifi,
        title: 'Offline-faehig',
        description: 'Funktioniert auch ohne Internetverbindung dank lokalem Modell.',
      },
      {
        icon: Zap,
        title: 'Kostenlos starten',
        description: 'Der Free-Plan reicht fuer den taeglichen Bedarf. Pro ab 4,99 EUR/Monat.',
      },
    ],
    cta: 'Kostenlos testen',
    hasCalculator: false,
  },
  guide: {
    hero: {
      title: 'Vox-Geraete waren gestern.',
      subtitle: 'Mit GuideTranslator spricht Ihre Tour sofort in jeder Sprache — ohne Hardware, ohne Aufwand.',
    },
    painPoints: [
      {
        icon: Wifi,
        title: 'Keine Hardware noetig',
        description: 'Gaeste nutzen ihr eigenes Smartphone. Keine Geraete ausleihen, aufladen oder zuruecknehmen.',
      },
      {
        icon: Globe2,
        title: 'Alle Sprachen gleichzeitig',
        description: 'Sprechen Sie Deutsch — Ihre Gaeste lesen die Uebersetzung in Echtzeit in ihrer Sprache.',
      },
      {
        icon: Users,
        title: 'Unbegrenzte Teilnehmer',
        description: 'Von 5 bis 100+ Hoerer pro Tour. Skaliert ohne zusaetzliche Kosten pro Geraet.',
      },
      {
        icon: MapPin,
        title: 'Offline-faehig',
        description: 'Lokaler Modus ueber WLAN-Hotspot — perfekt fuer Orte ohne Mobilfunk.',
      },
    ],
    cta: 'Guide-Plan starten',
    hasCalculator: true,
  },
  agency: {
    hero: {
      title: 'Alle Guides, eine Plattform.',
      subtitle: 'Verwalten Sie mehrere Guides zentral — mit Sub-Accounts, Dashboard und guenstigen Team-Tarifen.',
    },
    painPoints: [
      {
        icon: Building,
        title: 'Team-Verwaltung',
        description: 'Sub-Accounts fuer jeden Guide. Zentrale Abrechnung, individuelle Nutzung.',
      },
      {
        icon: Globe2,
        title: 'Bis zu 15 Sprachen',
        description: 'Ihre Guides bieten mehrsprachige Touren an — ohne Vox-Geraete.',
      },
      {
        icon: Users,
        title: 'Bis zu 50 Hoerer gleichzeitig',
        description: 'QR-Code scannen, Sprache waehlen, mitlesen. Keine App noetig.',
      },
      {
        icon: Zap,
        title: '80% guenstiger als KUDO',
        description: 'Professionelle Uebersetzung fuer Agenturen zu einem Bruchteil der Kosten.',
      },
    ],
    cta: 'Agentur-Plan starten',
    hasCalculator: true,
  },
  event: {
    hero: {
      title: 'Konferenzen multilingual — ab sofort bezahlbar.',
      subtitle: 'Echtzeit-Uebersetzung fuer Events, ohne Dolmetscher-Honorare oder teure SaaS-Plattformen.',
    },
    painPoints: [
      {
        icon: Mic,
        title: 'Live-Broadcasting',
        description: 'Speaker spricht, Teilnehmer sehen die Uebersetzung sofort auf ihrem Geraet.',
      },
      {
        icon: Zap,
        title: '90% guenstiger als Wordly',
        description: 'Professionelle Echtzeitubersetzung zu einem Bruchteil der Kosten.',
      },
      {
        icon: Users,
        title: 'Bis zu 500 Teilnehmer',
        description: 'QR-Code scannen, Sprache waehlen, mitlesen. Keine App-Installation noetig.',
      },
      {
        icon: Calendar,
        title: 'Minutengenau abrechnen',
        description: 'Nur zahlen, was Sie nutzen. Inklusive Minuten + fairer Minutenpreis danach.',
      },
    ],
    cta: 'Event-Plan starten',
    hasCalculator: true,
  },
  cruise: {
    hero: {
      title: 'Landausfluege ohne Sprachbarriere.',
      subtitle: 'Ersetzen Sie 8 Dolmetscher durch eine App — auf jedem Schiff, bei jeder Exkursion.',
    },
    painPoints: [
      {
        icon: Ship,
        title: 'Multi-Schiff-Flotten',
        description: 'Ein Account fuer alle Schiffe. Zentrale Verwaltung, lokale Nutzung.',
      },
      {
        icon: Globe2,
        title: 'Bis zu 20 Sprachen parallel',
        description: 'Deckung aller Passagier-Sprachen — ohne fuer jede Sprache einen Dolmetscher zu buchen.',
      },
      {
        icon: Zap,
        title: 'ROI ab Tag 1',
        description: 'Dolmetscher kosten 350 EUR/Tag/Sprache. GuideTranslator kostet einen Bruchteil davon.',
      },
      {
        icon: Wifi,
        title: 'Auch ohne Internet',
        description: 'Lokaler Modus ueber Bord-WLAN — funktioniert auf hoher See.',
      },
    ],
    cta: 'Cruise-Plan starten',
    hasCalculator: true,
  },
}

const VALID_SEGMENTS: SalesSegment[] = ['personal', 'guide', 'agency', 'event', 'cruise']

export default function SalesLandingPage() {
  const { segment } = useParams<{ segment: string }>()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite')

  if (!segment || !VALID_SEGMENTS.includes(segment as SalesSegment)) {
    return <Navigate to="/pricing" replace />
  }

  const seg = segment as SalesSegment
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

      {/* ROI Calculator (not for personal) */}
      {content.hasCalculator && (
        <ROICalculator segment={seg as CalcSegment} />
      )}

      {/* Lead registration form */}
      <LeadRegistrationForm segment={seg} />

      {/* Bottom CTA */}
      <div className="text-center space-y-3 pb-4">
        <p className="text-muted-foreground">
          Bereit? Waehlen Sie den passenden Plan.
        </p>
        <Link to="/pricing">
          <Button size="lg" variant="outline" className="gap-2">
            Alle Plaene vergleichen
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
