// SalesLandingPage — Segment-specific landing page with value props, features, pricing, ROI calculator.
// Routes: /sales/guide, /sales/agency, /sales/event, /sales/cruise, /sales/personal

import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowRight, Mic, Globe2, Users, Wifi, Zap, Ship, Calendar, MapPin,
  Building, Smartphone, Shield, Headphones, Camera, MessageSquare,
  QrCode, Signal, Bluetooth, ChevronRight, Check, Star, TrendingUp,
  Monitor, Clock, Languages, Volume2, Radio, Lock, Cpu, Download
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ROICalculator from '@/components/pricing/ROICalculator'
import LeadRegistrationForm from '@/components/sales/LeadRegistrationForm'

type SalesSegment = 'personal' | 'guide' | 'agency' | 'event' | 'cruise'
type CalcSegment = 'guide' | 'agency' | 'event' | 'cruise'

interface SegmentContent {
  hero: { title: string; subtitle: string; badge?: string }
  painPoints: { icon: typeof Mic; title: string; description: string }[]
  features: { icon: typeof Mic; title: string; description: string }[]
  howItWorks: { step: string; title: string; description: string }[]
  pricing: { name: string; price: string; period: string; highlights: string[] }[]
  useCases: string[]
  stats: { value: string; label: string }[]
  cta: string
  hasCalculator: boolean
}

const CONTENT: Record<SalesSegment, SegmentContent> = {
  personal: {
    hero: {
      title: 'Übersetzen, sprechen, verstehen — überall.',
      subtitle: 'GuideTranslator macht Ihr Smartphone zum persönlichen Dolmetscher. Beim Arzt, auf der Reise, im Alltag. 45 Sprachen, Offline-Modus, Kamera-Übersetzer — kostenlos starten.',
      badge: 'Kostenlos verfügbar',
    },
    painPoints: [
      {
        icon: Smartphone,
        title: 'Immer dabei',
        description: 'Kein Extra-Gerät nötig. Einfach Smartphone öffnen und losreden. Als PWA läuft die App direkt im Browser — kein App-Store-Download erforderlich.',
      },
      {
        icon: Globe2,
        title: '45 Sprachen',
        description: 'Von Arabisch bis Vietnamesisch — inkl. 10 Migrationssprachen wie Dari, Tigrinya und Paschtu. Vollständige RTL-Unterstützung für Arabisch, Farsi und Urdu.',
      },
      {
        icon: Wifi,
        title: '100% Offline-fähig',
        description: 'Funktioniert komplett ohne Internet dank lokaler KI-Modelle (Opus-MT). 54 Sprachpaare offline verfügbar — perfekt für Reisen ohne Mobilfunk.',
      },
      {
        icon: Zap,
        title: 'Kostenlos starten',
        description: 'Der Free-Plan deckt den täglichen Bedarf ab: 22 Sprachen, 500 Übersetzungen/Tag, Offline-Modus. Pro ab 4,99 EUR/Monat für 30 Sprachen und Azure-Qualität.',
      },
    ],
    features: [
      {
        icon: MessageSquare,
        title: 'Gesprächsmodus',
        description: 'Face-to-Face-Übersetzung mit 180-Grad-Split-Screen. Ideal beim Arzt, auf der Behörde oder im Hotel. Beide Seiten sprechen — beide verstehen.',
      },
      {
        icon: Camera,
        title: 'Kamera-Übersetzer',
        description: 'Fotografieren Sie Speisekarten, Schilder oder Dokumente — die Übersetzung erscheint sofort. Powered by Google Cloud Vision OCR.',
      },
      {
        icon: Volume2,
        title: 'Sprachein- und -ausgabe',
        description: 'Diktieren statt tippen. Vorlesen lassen statt lesen. Mit HD-Sprachausgabe (Neural2/Chirp 3 HD) klingt es natürlich, nicht roboterhaft.',
      },
      {
        icon: Download,
        title: 'Phrasebook',
        description: '18 Kategorien mit vorgefertigten Sätzen: Behörde, Arzt, Unterkunft, Notfall, Einkaufen und mehr. In 16 Zielsprachen sofort abrufbar.',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Öffnen', description: 'guidetranslator.com im Browser aufrufen. Keine Installation, kein Account nötig.' },
      { step: '2', title: 'Sprache wählen', description: 'Quell- und Zielsprache aus 45 Sprachen wählen. Kontextmodus setzen (Reise, Medizin, Recht...).' },
      { step: '3', title: 'Sprechen oder tippen', description: 'Text eingeben oder per Mikrofon diktieren. Die Übersetzung erscheint in Echtzeit.' },
    ],
    pricing: [
      { name: 'Free', price: '0 EUR', period: 'für immer', highlights: ['22 Sprachen + Offline', '500 Übersetzungen/Tag', 'Gesprächsmodus', 'Kamera-OCR', 'Phrasebook'] },
      { name: 'Personal Pro', price: '4,99 EUR', period: '/Monat', highlights: ['30 Sprachen', 'Azure-Übersetzungsqualität', 'Unbegrenzte Übersetzungen', 'Live-Session (3 Hörer)', 'Kein Werbebanner'] },
    ],
    useCases: [
      'Arztbesuch im Ausland — Symptome und Diagnosen korrekt übersetzen',
      'Behördengang — Formulare und Anweisungen in der Muttersprache verstehen',
      'Reise — Speisekarten, Wegbeschreibungen und lokale Tipps',
      'Alltag als Expat — Handwerker, Vermieter, Nachbarn',
      'Sprachkurs — Vokabeln mit Aussprache üben',
    ],
    stats: [
      { value: '45', label: 'Sprachen' },
      { value: '54', label: 'Offline-Paare' },
      { value: '<1s', label: 'Latenz' },
      { value: '0 EUR', label: 'Einstiegspreis' },
    ],
    cta: 'Kostenlos testen',
    hasCalculator: false,
  },

  guide: {
    hero: {
      title: 'Vox-Geräte waren gestern.',
      subtitle: 'Mit GuideTranslator spricht Ihre Tour sofort in jeder Sprache — ohne Hardware, ohne Aufwand. Gäste scannen einen QR-Code und hören in ihrer Sprache mit. Ab 19,90 EUR/Monat.',
      badge: '97% günstiger als Vox-Hardware',
    },
    painPoints: [
      {
        icon: Wifi,
        title: 'Keine Hardware nötig',
        description: 'Gäste nutzen ihr eigenes Smartphone. Keine Geräte ausleihen, aufladen, desinfizieren oder zurücknehmen. Null Investitionskosten.',
      },
      {
        icon: Globe2,
        title: 'Alle Sprachen gleichzeitig',
        description: 'Sprechen Sie Deutsch — Ihre Gäste lesen und hören die Übersetzung in Echtzeit in ihrer Sprache. Bis zu 10 Sprachen mit 5 inkl. + Zukauf.',
      },
      {
        icon: Users,
        title: 'Bis zu 25 Hörer pro Tour',
        description: 'Guide Basic: 10 Hörer. Guide Pro: 25 Hörer. Jeder scannt den QR-Code und ist sofort dabei — keine App-Installation nötig.',
      },
      {
        icon: MapPin,
        title: 'Offline-fähig',
        description: 'Hotspot-Modus: Ihr Smartphone erstellt ein eigenes WLAN. BLE-Modus: Funktioniert per Bluetooth — ganz ohne Internet, Router oder Strom.',
      },
    ],
    features: [
      {
        icon: QrCode,
        title: 'QR-Code Join',
        description: 'QR-Code zeigen — Gäste scannen und sind verbunden. Keine App, kein Account, kein Aufwand. Funktioniert auf jedem Smartphone mit Browser.',
      },
      {
        icon: Radio,
        title: '1→N Live-Broadcasting',
        description: 'Ein Sprecher, beliebig viele Zuhörer. Jeder wählt seine Sprache. Echtzeit-Übersetzung mit unter 1 Sekunde Latenz.',
      },
      {
        icon: Monitor,
        title: 'Untertitel-Modus',
        description: 'Großschrift-Anzeige (bis 6xl) auf schwarzem Hintergrund — perfekt lesbar auch bei Sonnenlicht. Die letzten 5 Sätze bleiben sichtbar.',
      },
      {
        icon: Volume2,
        title: 'HD-Sprachausgabe',
        description: 'Google Neural2 und Chirp 3 HD: Gäste können zuhören statt lesen. Klingt wie ein echter Reiseleiter — in jeder Sprache.',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Session starten', description: 'Live-Modus öffnen, Sprache wählen, Session erstellen. Ein QR-Code wird generiert.' },
      { step: '2', title: 'QR-Code zeigen', description: 'Gäste scannen den QR-Code mit ihrem Smartphone. Keine App nötig — es öffnet sich der Browser.' },
      { step: '3', title: 'Sprechen', description: 'Sie sprechen — die Übersetzung erscheint in Echtzeit auf allen Geräten. Fertig.' },
    ],
    pricing: [
      { name: 'Guide Basic', price: '19,90 EUR', period: '/Monat', highlights: ['10 Hörer', '5 Sprachen inkl.', '300 Min/Monat (~5h)', 'QR-Code + Hotspot', '3 Custom-Glossare'] },
      { name: 'Guide Pro', price: '39,90 EUR', period: '/Monat', highlights: ['25 Hörer', '10 Sprachen inkl.', '600 Min/Monat (~10h)', 'Neural2-TTS + BLE', '10 Glossare + Pre-Translation'] },
    ],
    useCases: [
      'Stadtführung — Guide spricht, 20 Touristen aus 8 Ländern lesen mit',
      'Museum — Führung ohne teure Audio-Guide-Geräte',
      'Architektur-Tour — Draußen, kein WiFi → BLE-Modus',
      'Weinverkostung — Winzer erklärt, internationale Gäste verstehen',
      'Historische Stätte — Kein Mobilfunk → Hotspot-Modus',
      'Hop-on-Hop-off-Bus — QR im Bus, Gäste steigen ein und sind verbunden',
    ],
    stats: [
      { value: '19,90 EUR', label: 'ab/Monat' },
      { value: '97%', label: 'günstiger als Vox' },
      { value: '<1s', label: 'Latenz' },
      { value: '0 EUR', label: 'Hardware-Kosten' },
    ],
    cta: 'Guide-Plan starten',
    hasCalculator: true,
  },

  agency: {
    hero: {
      title: 'Alle Guides, eine Plattform.',
      subtitle: 'Verwalten Sie mehrere Guides zentral — mit Sub-Accounts, Dashboard und günstigen Team-Tarifen. Bis zu 50 Hörer pro Session, unbegrenzte Sprachen im Premium-Plan.',
      badge: '80% günstiger als KUDO',
    },
    painPoints: [
      {
        icon: Building,
        title: 'Team-Verwaltung',
        description: 'Sub-Accounts für jeden Guide. Zentrale Abrechnung, individuelle Nutzung. Bis zu 3 gleichzeitige Sessions (Standard) oder 10 (Premium).',
      },
      {
        icon: Globe2,
        title: 'Bis zu unbegrenzte Sprachen',
        description: 'Standard: 15 Sprachen + Zukauf. Premium: Alle 130+ Sprachen inklusive. Ihre Guides bieten mehrsprachige Touren ohne Einschränkung.',
      },
      {
        icon: Users,
        title: 'Bis zu 50 Hörer gleichzeitig',
        description: 'QR-Code scannen, Sprache wählen, mitlesen. Keine App nötig. Standard: 30 Hörer, Premium: 50 Hörer pro Guide.',
      },
      {
        icon: Zap,
        title: 'Bis zu 80% günstiger als KUDO',
        description: 'KUDO kostet ab 500 EUR/Event. GuideTranslator Agentur ab 99 EUR/Monat für bis zu 1.500 Session-Minuten inkl.',
      },
    ],
    features: [
      {
        icon: TrendingUp,
        title: 'Analytics Dashboard',
        description: 'Nutzungsstatistiken pro Guide: Session-Minuten, Sprachen, Hörer, Overage-Kosten. Alles auf einen Blick im Dashboard.',
      },
      {
        icon: Shield,
        title: 'White-Label (Premium)',
        description: 'Eigenes Branding für Ihre Agentur. Kein GuideTranslator-Logo sichtbar — Ihre Marke, Ihre App.',
      },
      {
        icon: Headphones,
        title: 'Chirp 3 HD Audio (Premium)',
        description: 'Höchste TTS-Qualität mit Google Chirp 3 HD. Natürliche Stimmen in 24 Sprachen — Gäste hören statt lesen.',
      },
      {
        icon: Lock,
        title: 'Pre-Translation Scripts',
        description: 'Standard-Tourtexte vorab übersetzen und als Glossar hinterlegen. Konsistente Qualität bei wiederkehrenden Touren.',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Agentur-Account erstellen', description: 'Registrieren, Plan wählen, Sub-Accounts für Ihre Guides anlegen.' },
      { step: '2', title: 'Guides einladen', description: 'Jeder Guide erhält eigene Zugangsdaten. Zentrale Abrechnung über Ihren Account.' },
      { step: '3', title: 'Touren durchführen', description: 'Guides starten Sessions, Gäste scannen QR-Codes. Sie sehen alles im Dashboard.' },
    ],
    pricing: [
      { name: 'Agentur Standard', price: '99 EUR', period: '/Monat', highlights: ['30 Hörer (x3 Sessions)', '15 Sprachen inkl.', '1.500 Min/Monat (~25h)', 'Guide-Management', 'Dashboard-Analytics'] },
      { name: 'Agentur Premium', price: '249 EUR', period: '/Monat', highlights: ['50 Hörer (x10 Sessions)', 'Alle 130+ Sprachen', '5.000 Min/Monat (~83h)', 'White-Label + Chirp HD', 'API-Zugang (read) + Export'] },
    ],
    useCases: [
      'Reiseagentur mit 5-20 Freelance-Guides',
      'Museumsbetrieb mit mehreren Standorten',
      'Tourismus-Verband mit regionalen Führungen',
      'Busreise-Unternehmen mit internationaler Kundschaft',
      'Kreuzfahrt-Landausflüge mit wechselnden Guides',
    ],
    stats: [
      { value: '99 EUR', label: 'ab/Monat' },
      { value: '10', label: 'Guides parallel' },
      { value: '50', label: 'Hörer/Session' },
      { value: '83h', label: 'inkl. Minuten (Premium)' },
    ],
    cta: 'Agentur-Plan starten',
    hasCalculator: true,
  },

  event: {
    hero: {
      title: 'Konferenzen multilingual — ab sofort bezahlbar.',
      subtitle: 'Echtzeit-Übersetzung für Events mit bis zu 500 Teilnehmern, ohne Dolmetscher-Honorare oder teure SaaS-Plattformen. QR-Code auf die Leinwand — fertig.',
      badge: '90% günstiger als Wordly.ai',
    },
    painPoints: [
      {
        icon: Mic,
        title: 'Live-Broadcasting',
        description: 'Speaker spricht, Teilnehmer sehen die Übersetzung sofort auf ihrem Gerät. Bis zu 500 gleichzeitige Zuhörer mit Event Pro.',
      },
      {
        icon: Zap,
        title: '90% günstiger als Wordly',
        description: 'Wordly.ai kostet 69 EUR/Stunde. GuideTranslator Event Basic ab 199 EUR/Monat mit 2.000 Minuten inklusive.',
      },
      {
        icon: Users,
        title: 'Bis zu 500 Teilnehmer',
        description: 'QR-Code auf Beamer zeigen — 500 Teilnehmer joinen in 30 Sekunden. Jeder wählt seine Sprache. Keine App-Installation.',
      },
      {
        icon: Calendar,
        title: 'Minutengenau abrechnen',
        description: 'Nur zahlen, was Sie nutzen. 2.000-8.000 Minuten inklusive je nach Plan. Danach fairer Overage ab 0,06 EUR/Min.',
      },
    ],
    features: [
      {
        icon: Languages,
        title: 'Unbegrenzte Sprachen (Pro)',
        description: 'Event Basic: 20 Sprachen. Event Pro: Alle 130+ Sprachen inklusive. Kein Teilnehmer wird ausgeschlossen.',
      },
      {
        icon: Volume2,
        title: 'Chirp 3 HD Audio (Pro)',
        description: 'Höchste Sprachqualität mit Google Chirp 3 HD. Teilnehmer können zuhören statt lesen — ideal für Keynotes.',
      },
      {
        icon: Clock,
        title: 'Session-Protokoll',
        description: 'Gesamte Konferenz als Transkript exportierbar (TXT/MD). Mit Zeitstempeln, Sprecherzuordnung und allen Übersetzungen.',
      },
      {
        icon: Shield,
        title: 'White-Label (Pro)',
        description: 'Eigenes Event-Branding. Kein GuideTranslator-Logo — Ihre Konferenz, Ihr Erscheinungsbild.',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Event-Plan buchen', description: 'Event Basic oder Pro wählen. Bis zu 10 parallele Sessions für Multi-Track-Konferenzen.' },
      { step: '2', title: 'QR-Code projizieren', description: 'QR-Code auf Leinwand oder in die Konferenz-App einbinden. Teilnehmer scannen und wählen ihre Sprache.' },
      { step: '3', title: 'Speaker spricht', description: 'Echtzeit-Übersetzung auf allen Geräten. Unter 1 Sekunde Latenz. Protokoll wird automatisch erstellt.' },
    ],
    pricing: [
      { name: 'Event Basic', price: '199 EUR', period: '/Monat', highlights: ['100 Hörer (x3 Sessions)', '20 Sprachen inkl.', '2.000 Min/Monat (~33h)', 'Neural2-TTS', 'Session-Protokoll-Export'] },
      { name: 'Event Pro', price: '499 EUR', period: '/Monat', highlights: ['500 Hörer (x10 Sessions)', 'Alle 130+ Sprachen', '8.000 Min/Monat (~133h)', 'Chirp 3 HD + White-Label', 'API-Zugang + Transkript-Export'] },
    ],
    useCases: [
      'Internationale Konferenzen — Keynotes in 20+ Sprachen simultan',
      'Firmenmeetings — Internationale Teams, Board Meetings',
      'Messen & Produktpräsentationen — Stand-Vorträge mehrsprachig',
      'Hochschulen — Vorlesungen für internationale Studierende',
      'Kommunale Events — Bürgerversammlungen mit Migrationssprachen',
      'Webinare — Remote-Teilnehmer mit Live-Untertiteln',
    ],
    stats: [
      { value: '199 EUR', label: 'ab/Monat' },
      { value: '500', label: 'Teilnehmer max.' },
      { value: '130+', label: 'Sprachen (Pro)' },
      { value: '<1s', label: 'Latenz' },
    ],
    cta: 'Event-Plan starten',
    hasCalculator: true,
  },

  cruise: {
    hero: {
      title: 'Landausflüge ohne Sprachbarriere.',
      subtitle: 'Ersetzen Sie 8 Dolmetscher durch eine App — auf jedem Schiff, bei jeder Exkursion. Von einem Schiff bis zur Großflotte. Unbegrenzte Hörer, ab 1.990 EUR/Monat.',
      badge: 'Enterprise — 95% günstiger als Dolmetscher',
    },
    painPoints: [
      {
        icon: Ship,
        title: 'Multi-Schiff-Flotten',
        description: 'Ein Account für alle Schiffe. Starter: 1 Schiff. Fleet: 5-10 Schiffe. Armada: Unbegrenzt. Zentrale Verwaltung, lokale Nutzung.',
      },
      {
        icon: Globe2,
        title: 'Bis zu alle 130+ Sprachen',
        description: 'Starter: 8 Sprachen. Fleet: 12 Sprachen. Armada: Alle Sprachen inklusive. Deckung aller Passagier-Sprachen ohne zusätzliche Dolmetscher.',
      },
      {
        icon: Zap,
        title: 'ROI ab Tag 1',
        description: 'Dolmetscher kosten 350 EUR/Tag/Sprache. Bei 8 Sprachen = 2.800 EUR/Tag = 84.000 EUR/Monat. GuideTranslator Cruise Starter: 1.990 EUR/Monat.',
      },
      {
        icon: Wifi,
        title: 'Auch auf hoher See',
        description: 'Lokaler Modus über Bord-WLAN — funktioniert auch ohne Satellitenverbindung. BLE-Modus für Landausflüge an Orten ohne Internet.',
      },
    ],
    features: [
      {
        icon: Users,
        title: 'Unbegrenzte Hörer',
        description: 'Alle Cruise-Pläne: Unbegrenzte Teilnehmer pro Session. Sicherheitsbriefings für 3.000 Passagiere — kein Problem.',
      },
      {
        icon: Shield,
        title: 'White-Label (Fleet/Armada)',
        description: 'Eigenes Reederei-Branding. Integration in die Bord-App. Kein sichtbares GuideTranslator-Logo.',
      },
      {
        icon: Cpu,
        title: 'API-Zugang',
        description: 'Fleet: Read-API. Armada: Full-API. Integration in bestehende Bord-Systeme, Entertainment-Plattformen und Informations-Kiosks.',
      },
      {
        icon: Headphones,
        title: 'Chirp 3 HD (Fleet/Armada)',
        description: 'Höchste TTS-Qualität. Durchsagen, Entertainment-Programm und Exkursions-Kommentare in natürlicher Sprachqualität.',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Fleet-Plan wählen', description: 'Starter, Fleet oder Armada — je nach Flottengröße und Sprachbedarf.' },
      { step: '2', title: 'Bord-WLAN nutzen', description: 'GuideTranslator läuft über das bestehende Bord-WLAN. Keine zusätzliche Hardware nötig.' },
      { step: '3', title: 'Passagiere scannen', description: 'QR-Code bei Exkursion oder Briefing zeigen. Passagiere scannen und hören in ihrer Sprache.' },
    ],
    pricing: [
      { name: 'Cruise Starter', price: '1.990 EUR', period: '/Monat', highlights: ['1 Schiff, unbegr. Hörer', '8 Sprachen (+49 EUR/Sprache)', '1.500 Min/Monat', 'Neural2-TTS', '5 gleichzeitige Sessions'] },
      { name: 'Cruise Fleet', price: '6.990 EUR', period: '/Monat', highlights: ['5-10 Schiffe, unbegr. Hörer', '12 Sprachen (+39 EUR/Sprache)', '8.000 Min/Monat', 'Chirp 3 HD + White-Label', 'API (read) + SLA 99,5%'] },
      { name: 'Cruise Armada', price: '19.990 EUR', period: '/Monat', highlights: ['10+ Schiffe, unbegr. Hörer', 'Alle 130+ Sprachen inkl.', '30.000 Min/Monat (~500h)', 'Chirp 3 HD + Full-API', 'SLA 99,9% + Dedicated Support'] },
    ],
    useCases: [
      'Sicherheitsbriefings — 3.000 Passagiere verstehen gleichzeitig',
      'Landausflüge — Guide spricht, Passagiere hören in ihrer Sprache',
      'Entertainment-Programm — Shows und Durchsagen multilingual',
      'Gastronomie — Menükarten und Spezialitäten-Erklärungen',
      'Hafenstopps — Lokale Guides nutzen die Plattform',
      'Wellness & Spa — Behandlungsanweisungen in der Muttersprache',
    ],
    stats: [
      { value: '1.990 EUR', label: 'ab/Monat' },
      { value: '95%', label: 'günstiger als Dolmetscher' },
      { value: '500h', label: 'inkl. Min (Armada)' },
      { value: '99,9%', label: 'SLA (Armada)' },
    ],
    cta: 'Cruise-Plan starten',
    hasCalculator: true,
  },
}

const TRUST_SIGNALS = [
  'E2E-verschlüsselt (AES-256-GCM)',
  'DSGVO-konform — kein Cloud-Zwang',
  '87 automatisierte Tests',
  'Made in Germany — ai tour ug',
]

const VALID_SEGMENTS: SalesSegment[] = ['personal', 'guide', 'agency', 'event', 'cruise']

export default function SalesLandingPage() {
  const { segment } = useParams<{ segment: string }>()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('invite')
  const source = searchParams.get('source')

  if (!segment || !VALID_SEGMENTS.includes(segment as SalesSegment)) {
    return <Navigate to="/pricing" replace />
  }

  const seg = segment as SalesSegment
  const content = CONTENT[seg]

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8 px-4">
      {/* Hero */}
      <div className="text-center space-y-4">
        {content.hero.badge && (
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            {content.hero.badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
          {content.hero.title}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          {content.hero.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/pricing">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              {content.cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/features">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Alle Features entdecken
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {content.stats.map((stat, i) => (
          <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pain points / value props */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Warum GuideTranslator?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.painPoints.map((pp, i) => {
            const Icon = pp.icon
            return (
              <Card key={i} className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{pp.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pp.description}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">So funktioniert es</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {content.howItWorks.map((step, i) => (
            <div key={i} className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-xl font-bold">
                {step.step}
              </div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Features im Detail</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ROI Calculator (not for personal) */}
      {content.hasCalculator && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">ROI-Rechner: Was sparen Sie?</h2>
          <ROICalculator segment={seg as CalcSegment} />
        </div>
      )}

      {/* Pricing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Preise</h2>
        <p className="text-center text-muted-foreground">Jährlich zahlen = 2 Monate gratis (17% Rabatt)</p>
        <div className={`grid grid-cols-1 gap-4 ${content.pricing.length <= 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
          {content.pricing.map((plan, i) => (
            <Card key={i} className={`p-6 space-y-4 ${i === content.pricing.length - 1 ? 'border-primary' : ''}`}>
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2">
                {plan.highlights.map((h, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <Link to="/pricing" className="block">
                <Button className="w-full" variant={i === content.pricing.length - 1 ? 'default' : 'outline'}>
                  Plan wählen
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Einsatzszenarien</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.useCases.map((uc, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Star className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-sm">{uc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical highlights */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Technische Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Signal className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">4-Tier Transport</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Cloud → Hotspot → Bluetooth → Offline. Automatischer Fallback — funktioniert immer, überall.
            </p>
          </Card>
          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">E2E-Verschlüsselung</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AES-256-GCM mit PBKDF2 Key Derivation (100.000 Iterationen). Auch im Offline-Modus verschlüsselt.
            </p>
          </Card>
          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">On-Device KI</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Opus-MT und Whisper laufen als WASM direkt im Browser. Keine Daten verlassen das Gerät im Offline-Modus.
            </p>
          </Card>
          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Bluetooth className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">BLE GATT Protocol</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Proprietäres Bluetooth-Protokoll für Gruppen-Übersetzung. Null Infrastruktur — funktioniert überall.
            </p>
          </Card>
        </div>
        <div className="text-center">
          <Link to="/technology">
            <Button variant="link" className="gap-1">
              Technische Architektur im Detail
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap justify-center gap-4">
        {TRUST_SIGNALS.map((signal, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-medium">
            <Shield className="w-3 h-3" />
            {signal}
          </span>
        ))}
      </div>

      {/* Lead registration / invite form */}
      <LeadRegistrationForm segment={seg} inviteToken={inviteToken} source={source} />

      {/* Cross-links */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Mehr entdecken</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/features" className="block">
            <Card className="p-4 hover:bg-muted/50 transition-colors">
              <h3 className="font-semibold text-sm">Alle Features</h3>
              <p className="text-xs text-muted-foreground mt-1">7 Produkte in einer App — von Live-Broadcasting bis Kamera-OCR</p>
            </Card>
          </Link>
          <Link to="/technology" className="block">
            <Card className="p-4 hover:bg-muted/50 transition-colors">
              <h3 className="font-semibold text-sm">Technische Architektur</h3>
              <p className="text-xs text-muted-foreground mt-1">4-Tier-Transport, On-Device KI, E2E-Verschlüsselung</p>
            </Card>
          </Link>
          <Link to="/compare" className="block">
            <Card className="p-4 hover:bg-muted/50 transition-colors">
              <h3 className="font-semibold text-sm">Wettbewerbervergleich</h3>
              <p className="text-xs text-muted-foreground mt-1">vs. Google Translate, DeepL, Wordly, KUDO und Vox</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center space-y-3 pb-4">
        <p className="text-muted-foreground">
          Bereit? Wählen Sie den passenden Plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/pricing">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Alle Pläne vergleichen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/investors">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Für Investoren
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
