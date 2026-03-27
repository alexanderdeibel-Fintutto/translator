// SalesLandingPage — Segment-specific landing page with value props, features, pricing, ROI calculator.
// Routes: /sales/guide, /sales/agency, /sales/event, /sales/cruise, /sales/personal
//         /sales/school, /sales/authority, /sales/ngo, /sales/counter, /sales/medical, /sales/conference

import { useParams, useSearchParams, Link, Navigate } from 'react-router-dom'
import {
  ArrowRight, Mic, Globe2, Users, Wifi, Zap, Ship, Calendar, MapPin,
  Building, Smartphone, Shield, Headphones, Camera, MessageSquare,
  QrCode, Signal, Bluetooth, ChevronRight, Check, Star, TrendingUp,
  Monitor, Clock, Languages, Volume2, Radio, Lock, Cpu, Download,
  GraduationCap, BookOpen, School, Building2, FileText, Heart,
  Stethoscope, Hotel, HandHelping, ClipboardList
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ROICalculator from '@/components/pricing/ROICalculator'
import LeadRegistrationForm from '@/components/sales/LeadRegistrationForm'

type SalesSegment = 'personal' | 'guide' | 'agency' | 'event' | 'cruise' | 'education' | 'authority' | 'hospitality' | 'medical' | 'conference'
type CalcSegment = 'guide' | 'agency' | 'event' | 'cruise' | 'authority' | 'medical' | 'hospitality' | 'education' | 'conference'

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

  education: {
    hero: {
      title: 'Jedes Kind versteht — in seiner Sprache.',
      subtitle: 'GuideTranslator macht Unterricht mehrsprachig. Lehrkraefte sprechen Deutsch — Schueler lesen und hoeren in ihrer Muttersprache. Einzellizenz ab 9,90 EUR/Monat, Schullizenz ab 49,90 EUR.',
      badge: 'Ab 9,90 EUR/Monat',
    },
    painPoints: [
      {
        icon: GraduationCap,
        title: 'Willkommensklassen',
        description: 'Neu zugewanderte Schueler verstehen den Unterricht sofort — ohne auf einen Dolmetscher zu warten. 15 Sprachen inkl. Arabisch, Ukrainisch, Dari.',
      },
      {
        icon: Globe2,
        title: '15-130+ Sprachen',
        description: 'Einzellizenz: 15 Sprachen. Schullizenz: Alle 130+ Sprachen inklusive. Deckung aller Herkunftssprachen Ihrer Schuelerschaft.',
      },
      {
        icon: Users,
        title: 'Bis zu 30 Schueler',
        description: 'QR-Code an die Tafel — alle Schueler scannen und lesen mit. Schullizenz: Unbegrenzte Schueler, 20 parallele Sessions.',
      },
      {
        icon: Smartphone,
        title: 'Kein Extra-Geraet',
        description: 'Laeuft auf Tablets und Smartphones der Schule oder BYOD. Keine App-Installation — einfach Browser oeffnen.',
      },
    ],
    features: [
      {
        icon: BookOpen,
        title: 'Gespraechsmodus',
        description: 'Elternabend, Beratungsgespraech, Aufnahmegespraech — Face-to-Face-Uebersetzung mit Split-Screen. Beide Seiten sprechen und verstehen.',
      },
      {
        icon: Camera,
        title: 'Kamera-Uebersetzer',
        description: 'Arbeitsblaetter, Infobriefe oder Aushänge fotografieren — die Uebersetzung erscheint sofort. Ideal fuer Eltern ohne Deutschkenntnisse.',
      },
      {
        icon: Volume2,
        title: 'Sprachausgabe',
        description: 'Schueler koennen sich Texte vorlesen lassen statt selbst zu lesen. Neural2-Stimmen klingen natuerlich und sind gut verstaendlich.',
      },
      {
        icon: School,
        title: 'Schullizenz',
        description: 'Unbegrenzte Lehrkraefte, alle Sprachen, 20 parallele Sessions. Eine Lizenz fuer die gesamte Schule — zentrale Abrechnung ueber den Schultraeger.',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Lizenz waehlen', description: 'Einzellizenz fuer eine Lehrkraft oder Schullizenz fuer alle. Kostenloser Testzeitraum.' },
      { step: '2', title: 'QR-Code zeigen', description: 'QR-Code an Tafel oder per Beamer zeigen. Schueler scannen mit Tablet oder Smartphone.' },
      { step: '3', title: 'Unterricht starten', description: 'Lehrkraft spricht Deutsch — Schueler lesen und hoeren in ihrer Muttersprache mit.' },
    ],
    pricing: [
      { name: 'Einzellizenz', price: '9,90 EUR', period: '/Monat', highlights: ['1 Lehrkraft, 30 Schueler', '15 Sprachen inkl.', '600 Min/Monat (~10h)', 'Gespraechsmodus + OCR', 'Offline-Modus'] },
      { name: 'Schullizenz', price: '49,90 EUR', period: '/Monat', highlights: ['Unbegrenzte Lehrkraefte', 'Alle 130+ Sprachen', 'Unbegrenzte Minuten', '20 parallele Sessions', 'Team-Verwaltung + Dashboard'] },
    ],
    useCases: [
      'Willkommensklasse — Unterricht fuer neu zugewanderte Schueler',
      'Elternabend — Eltern ohne Deutschkenntnisse einbinden',
      'Beratungsgespraech — Schulberatung mit Migrationsfamilien',
      'Projekttage — Internationale Schuelergruppen zusammenarbeiten',
      'Foerderschule — Individualisierter Sprachsupport',
      'Nachmittagsbetreuung — Hausaufgabenhilfe mehrsprachig',
    ],
    stats: [
      { value: '9,90 EUR', label: 'ab/Monat' },
      { value: '30', label: 'Schueler/Session' },
      { value: '130+', label: 'Sprachen (Schullizenz)' },
      { value: '0 EUR', label: 'Hardware-Kosten' },
    ],
    cta: 'Schul-Plan starten',
    hasCalculator: true,
  },

  authority: {
    hero: {
      title: 'Buergerservice ohne Sprachbarriere.',
      subtitle: 'Ob Buergeramt, Auslaenderbehoerde oder Jobcenter — GuideTranslator uebersetzt Gespraeche in Echtzeit. Kein Dolmetscher noetig. Einzelplatz ab 14,90 EUR/Monat.',
      badge: 'DSGVO-konform',
    },
    painPoints: [
      {
        icon: Building2,
        title: 'Sofort einsatzbereit',
        description: 'Kein IT-Projekt, keine Installation. Browser oeffnen, Sprache waehlen, losreden. Funktioniert auf jedem Rechner mit Mikrofon.',
      },
      {
        icon: Globe2,
        title: '20-130+ Sprachen',
        description: 'Einzelplatz: 20 Sprachen inkl. Migrationssprachen (Arabisch, Dari, Tigrinya, Ukrainisch). Behoerdenlizenz: Alle Sprachen unbegrenzt.',
      },
      {
        icon: Shield,
        title: 'DSGVO-konform',
        description: 'E2E-verschluesselt (AES-256-GCM). Offline-Modus verfuegbar — keine Daten verlassen das Geraet. Made in Germany.',
      },
      {
        icon: Zap,
        title: '90% guenstiger als Dolmetscher',
        description: 'Dolmetscher kosten 60-120 EUR/Stunde. GuideTranslator Einzelplatz: 14,90 EUR/Monat fuer unbegrenzte Gespraeche.',
      },
    ],
    features: [
      {
        icon: MessageSquare,
        title: 'Gespraechsmodus',
        description: 'Face-to-Face-Uebersetzung mit 180-Grad-Split-Screen. Sachbearbeiter und Buerger sprechen — beide verstehen. Ideal am Schalter.',
      },
      {
        icon: FileText,
        title: 'Formular-Hilfe (OCR)',
        description: 'Formulare, Bescheide und Antraege fotografieren — sofortige Uebersetzung. Buerger verstehen, was sie unterschreiben.',
      },
      {
        icon: Volume2,
        title: 'Sprachausgabe',
        description: 'Wichtige Informationen werden vorgelesen. Besonders hilfreich fuer Buerger, die nicht lesen koennen oder Analphabeten sind.',
      },
      {
        icon: Lock,
        title: 'Offline-Modus',
        description: 'Sensible Gespraeche komplett offline fuehren. Keine Cloud, keine Protokollierung. Volle DSGVO-Konformitaet.',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Platz einrichten', description: 'Browser oeffnen, anmelden. QR-Code auf den Tresen stellen oder Tablet bereithalten.' },
      { step: '2', title: 'Buerger kommt', description: 'Buerger scannt QR-Code oder nutzt das bereitgestellte Tablet. Sprache wird automatisch erkannt.' },
      { step: '3', title: 'Gespraech fuehren', description: 'Beide sprechen in ihrer Sprache. Die Uebersetzung erscheint in Echtzeit auf beiden Bildschirmen.' },
    ],
    pricing: [
      { name: 'Einzelplatz', price: '14,90 EUR', period: '/Monat', highlights: ['1 Schalter, unbegr. Buerger', '20 Sprachen inkl.', 'Unbegrenzte Minuten', 'Gespraechsmodus + OCR', 'Offline-Modus + DSGVO'] },
      { name: 'Behoerdenlizenz', price: '99 EUR', period: '/Monat', highlights: ['Unbegrenzte Schalter', 'Alle 130+ Sprachen', 'Unbegrenzte Minuten', 'Team-Verwaltung + Dashboard', 'Pre-Translation fuer Standardtexte'] },
    ],
    useCases: [
      'Buergeramt — Meldeangelegenheiten, Ausweisbeantragung',
      'Auslaenderbehoerde — Aufenthaltstitel, Visumverlaengerung',
      'Jobcenter — Beratungsgespraeche, Eingliederungsvereinbarungen',
      'Standesamt — Eheschließung, Geburtsurkunden',
      'Sozialamt — Antraege, Bescheide erklaeren',
      'Gesundheitsamt — Beratung, Impfaufklaerung',
    ],
    stats: [
      { value: '14,90 EUR', label: 'ab/Monat' },
      { value: '20+', label: 'Sprachen inkl.' },
      { value: '0 EUR', label: 'Hardware-Kosten' },
      { value: '100%', label: 'DSGVO-konform' },
    ],
    cta: 'Behoerden-Plan starten',
    hasCalculator: true,
  },

  hospitality: {
    hero: {
      title: 'Gaeste verstehen — in jeder Sprache.',
      subtitle: 'Hotel-Rezeption, Tourist-Info oder Empfang — GuideTranslator macht jeden Counter mehrsprachig. Gespraechsmodus fuer Face-to-Face-Kommunikation. Ab 29,90 EUR/Monat.',
      badge: 'Ab 29,90 EUR/Monat',
    },
    painPoints: [
      {
        icon: Hotel,
        title: 'Rezeption & Empfang',
        description: 'Check-in, Beschwerden, Concierge-Service — alles in der Sprache des Gastes. Kein mehrsprachiges Personal noetig.',
      },
      {
        icon: Globe2,
        title: '20-130+ Sprachen',
        description: 'Einzelplatz: 20 Sprachen. Business: Alle 130+ Sprachen inklusive. Deckung aller gaengigen Touristen-Sprachen.',
      },
      {
        icon: MessageSquare,
        title: 'Gespraechsmodus',
        description: 'Split-Screen fuer Mitarbeiter und Gast. Beide sprechen in ihrer Sprache — die Uebersetzung erscheint in Echtzeit.',
      },
      {
        icon: Zap,
        title: 'Sofort einsatzbereit',
        description: 'Tablet auf den Counter stellen, QR-Code zeigen oder Smartphone nutzen. Keine Installation, kein IT-Projekt.',
      },
    ],
    features: [
      {
        icon: Camera,
        title: 'Kamera-Uebersetzer',
        description: 'Speisekarten, Hausordnung, Infoblaetter — Gast fotografiert und liest in seiner Sprache. Keine manuellen Uebersetzungen noetig.',
      },
      {
        icon: QrCode,
        title: 'QR-Code am Counter',
        description: 'Gaeste scannen den QR-Code am Empfang und waehlen ihre Sprache. Keine App, kein Download — laeuft im Browser.',
      },
      {
        icon: Volume2,
        title: 'Sprachausgabe',
        description: 'Wichtige Infos werden vorgelesen. Ideal fuer Gaeste, die die lateinische Schrift nicht lesen (z.B. chinesische, arabische Gaeste).',
      },
      {
        icon: Users,
        title: 'Business: Multi-Counter',
        description: 'Mehrere Counter gleichzeitig. Team-Verwaltung, Dashboard-Analytics, Pre-Translation fuer Standardtexte (Willkommensgruss, Hausregeln).',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Counter einrichten', description: 'Tablet bereitstellen oder QR-Code-Aufsteller platzieren. Anmeldung in 2 Minuten.' },
      { step: '2', title: 'Gast kommt', description: 'Gast scannt QR-Code oder nutzt bereitgestelltes Tablet. Sprache wird automatisch erkannt.' },
      { step: '3', title: 'Kommunizieren', description: 'Gespraechsmodus: Beide Seiten sprechen, beide verstehen. Texte, Karten und Infos in Echtzeit uebersetzt.' },
    ],
    pricing: [
      { name: 'Einzelplatz', price: '29,90 EUR', period: '/Monat', highlights: ['1 Counter, unbegr. Gaeste', '20 Sprachen inkl.', 'Unbegrenzte Minuten', 'Gespraechsmodus + OCR', 'Offline-Modus'] },
      { name: 'Business', price: '99 EUR', period: '/Monat', highlights: ['Unbegrenzte Counter', 'Alle 130+ Sprachen', 'Unbegrenzte Minuten', '10 parallele Sessions', 'Team-Verwaltung + Dashboard'] },
    ],
    useCases: [
      'Hotel-Rezeption — Check-in, Concierge, Beschwerdemanagement',
      'Tourist-Information — Beratung internationaler Besucher',
      'Messe-Counter — Aussteller beraten Besucher mehrsprachig',
      'Flughafen-Info — Passagiere aus aller Welt',
      'Freizeitpark — Ticketverkauf und Gaesteinformation',
      'Kreuzfahrt-Terminal — Einschiffung und Auskunft',
    ],
    stats: [
      { value: '29,90 EUR', label: 'ab/Monat' },
      { value: '20+', label: 'Sprachen inkl.' },
      { value: '<1s', label: 'Latenz' },
      { value: '0 EUR', label: 'Hardware-Kosten' },
    ],
    cta: 'Counter-Plan starten',
    hasCalculator: true,
  },

  medical: {
    hero: {
      title: 'Patientengespraeche ohne Sprachbarriere.',
      subtitle: 'Arztpraxis, Klinik oder Apotheke — GuideTranslator uebersetzt medizinische Gespraeche in Echtzeit. Mit Schmerzskala, Med-Phrasen und DSGVO-konformem Offline-Modus. Ab 29,90 EUR/Monat.',
      badge: 'DSGVO-konform',
    },
    painPoints: [
      {
        icon: Stethoscope,
        title: 'Anamnese & Diagnose',
        description: 'Symptome, Vorerkrankungen, Medikamente — praezise uebersetzen statt mit Haenden und Fuessen erklaeren. Medizinische Fachbegriffe korrekt.',
      },
      {
        icon: Globe2,
        title: '25-130+ Sprachen',
        description: 'Praxis: 25 Sprachen inkl. Arabisch, Tuerkisch, Ukrainisch, Dari. Klinik: Alle 130+ Sprachen fuer jede Patientenkonstellation.',
      },
      {
        icon: Shield,
        title: 'DSGVO & Datenschutz',
        description: 'E2E-verschluesselt. Offline-Modus verfuegbar — keine Patientendaten verlassen das Geraet. Keine Aufzeichnung, keine Cloud.',
      },
      {
        icon: Zap,
        title: '95% guenstiger als Dolmetscher',
        description: 'Dolmetscherkosten: 80-150 EUR/Stunde + Wartezeit. GuideTranslator Praxis: 29,90 EUR/Monat fuer unbegrenzte Gespraeche.',
      },
    ],
    features: [
      {
        icon: MessageSquare,
        title: 'Gespraechsmodus',
        description: 'Face-to-Face mit Split-Screen. Arzt und Patient sprechen — beide verstehen sofort. Ideal im Sprechzimmer, in der Notaufnahme, am Bett.',
      },
      {
        icon: ClipboardList,
        title: 'Med-Phrasen & Schmerzskala',
        description: 'Vorgefertigte medizinische Phrasen: Anamnese-Fragen, Schmerzskala, Medikamenten-Anweisungen. In 25+ Sprachen sofort abrufbar.',
      },
      {
        icon: Camera,
        title: 'Befunde & Rezepte (OCR)',
        description: 'Befunde, Beipackzettel oder Einverstaendniserklaerungen fotografieren — Patient liest in seiner Sprache.',
      },
      {
        icon: Lock,
        title: 'Offline-Modus',
        description: 'Sensible Patientengespraeche komplett offline fuehren. 54 Sprachpaare lokal verfuegbar. Keine Internetverbindung noetig.',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Praxis anmelden', description: 'Online registrieren, Plan waehlen. In 2 Minuten einsatzbereit — auf Tablet, Laptop oder Smartphone.' },
      { step: '2', title: 'Patient kommt', description: 'Tablet bereithalten oder QR-Code im Wartezimmer. Patient waehlt Sprache — automatische Spracherkennung.' },
      { step: '3', title: 'Gespraech fuehren', description: 'Arzt spricht Deutsch, Patient antwortet in seiner Sprache. Echtzeit-Uebersetzung auf beiden Seiten.' },
    ],
    pricing: [
      { name: 'Praxis', price: '29,90 EUR', period: '/Monat', highlights: ['1 Arzt/Apotheker, 3 Patienten', '25 Sprachen inkl.', 'Unbegrenzte Minuten', 'Med-Phrasen + Schmerzskala', 'Offline-Modus + DSGVO'] },
      { name: 'Klinik', price: '199 EUR', period: '/Monat', highlights: ['Unbegrenzte Aerzte/Stationen', 'Alle 130+ Sprachen', 'Unbegrenzte Minuten', 'Chirp 3 HD Sprachqualitaet', 'Team-Verwaltung + Export'] },
    ],
    useCases: [
      'Hausarztpraxis — Anamnese mit Migranten und Gefluechteten',
      'Notaufnahme — Schnelle Verstaendigung in Akutsituationen',
      'Apotheke — Medikamenten-Beratung mehrsprachig',
      'Zahnarzt — Behandlungsaufklaerung in der Muttersprache',
      'Psychiatrie/Psychotherapie — Gespraeche mit sprachsensiblem Kontext',
      'Geburtshilfe — Kreißsaal, Vorsorge, Nachsorge',
    ],
    stats: [
      { value: '29,90 EUR', label: 'ab/Monat' },
      { value: '25+', label: 'Sprachen inkl.' },
      { value: '100%', label: 'DSGVO-konform' },
      { value: '54', label: 'Offline-Paare' },
    ],
    cta: 'Praxis-Plan starten',
    hasCalculator: true,
  },

  conference: {
    hero: {
      title: 'Ihre Konferenz spricht jede Sprache.',
      subtitle: 'Echtzeit-Uebersetzung fuer Konferenzen, Tagungen und Workshops — ohne Dolmetscher, ohne teure Plattformen. Teilnehmer scannen einen QR-Code und lesen/hoeren in ihrer Sprache. Ab 199 EUR/Monat.',
      badge: '90% guenstiger als Simultandolmetscher',
    },
    painPoints: [
      {
        icon: Mic,
        title: 'Live-Broadcasting',
        description: 'Speaker spricht, bis zu 500 Teilnehmer sehen die Uebersetzung sofort auf ihrem Geraet. Unter 1 Sekunde Latenz.',
      },
      {
        icon: Zap,
        title: '90% guenstiger',
        description: 'Simultandolmetscher: 1.500-3.000 EUR/Tag/Sprache. GuideTranslator: Ab 199 EUR/Monat mit 2.000 Minuten inklusive fuer alle Sprachen.',
      },
      {
        icon: Users,
        title: 'Bis zu 500 Teilnehmer',
        description: 'QR-Code auf den Beamer — 500 Teilnehmer joinen in 30 Sekunden. Jeder waehlt seine Sprache. Keine App noetig.',
      },
      {
        icon: Calendar,
        title: 'Multi-Track-Konferenzen',
        description: 'Bis zu 10 parallele Sessions (Pro). Hauptbuehne, Workshops und Breakout-Sessions — alles mehrsprachig.',
      },
    ],
    features: [
      {
        icon: Languages,
        title: 'Unbegrenzte Sprachen (Pro)',
        description: 'Basic: 20 Sprachen. Pro: Alle 130+ Sprachen inklusive. Kein Teilnehmer wird ausgeschlossen.',
      },
      {
        icon: Volume2,
        title: 'Chirp 3 HD Audio (Pro)',
        description: 'Hoechste Sprachqualitaet — Teilnehmer koennen zuhoeren statt lesen. Ideal fuer Keynotes und Podiumsdiskussionen.',
      },
      {
        icon: Clock,
        title: 'Session-Protokoll',
        description: 'Gesamte Konferenz als Transkript exportierbar (TXT/MD). Mit Zeitstempeln und allen Uebersetzungen.',
      },
      {
        icon: Shield,
        title: 'White-Label (Pro)',
        description: 'Eigenes Konferenz-Branding. Kein GuideTranslator-Logo — Ihre Veranstaltung, Ihr Erscheinungsbild.',
      },
    ],
    howItWorks: [
      { step: '1', title: 'Plan buchen', description: 'Basic oder Pro waehlen. In 5 Minuten einsatzbereit — kein IT-Projekt.' },
      { step: '2', title: 'QR-Code projizieren', description: 'QR-Code auf Leinwand oder in die Konferenz-App einbinden. Teilnehmer scannen und waehlen ihre Sprache.' },
      { step: '3', title: 'Speaker spricht', description: 'Echtzeit-Uebersetzung auf allen Geraeten. Unter 1 Sekunde Latenz. Protokoll wird automatisch erstellt.' },
    ],
    pricing: [
      { name: 'Conference Basic', price: '199 EUR', period: '/Monat', highlights: ['100 Teilnehmer (x3 Sessions)', '20 Sprachen inkl.', '2.000 Min/Monat (~33h)', 'Neural2-TTS', 'Session-Protokoll-Export'] },
      { name: 'Conference Pro', price: '499 EUR', period: '/Monat', highlights: ['500 Teilnehmer (x10 Sessions)', 'Alle 130+ Sprachen', '8.000 Min/Monat (~133h)', 'Chirp 3 HD + White-Label', 'API-Zugang + Transkript-Export'] },
    ],
    useCases: [
      'Wissenschaftliche Konferenzen — Vortraege in 20+ Sprachen simultan',
      'Firmenmeetings — Internationale Teams und Board Meetings',
      'NGO-Konferenzen — Delegierte aus aller Welt',
      'Kirchentage & Synoden — Mehrsprachige Gottesdienste und Vortraege',
      'Politische Veranstaltungen — Buergerversammlungen mit Migrationssprachen',
      'Webinare — Remote-Teilnehmer mit Live-Untertiteln',
    ],
    stats: [
      { value: '199 EUR', label: 'ab/Monat' },
      { value: '500', label: 'Teilnehmer max.' },
      { value: '130+', label: 'Sprachen (Pro)' },
      { value: '<1s', label: 'Latenz' },
    ],
    cta: 'Konferenz-Plan starten',
    hasCalculator: true,
  },
}

const TRUST_SIGNALS = [
  'E2E-verschlüsselt (AES-256-GCM)',
  'DSGVO-konform — kein Cloud-Zwang',
  '87 automatisierte Tests',
  'Made in Germany — ai tour ug',
]

const VALID_SEGMENTS: SalesSegment[] = ['personal', 'guide', 'agency', 'event', 'cruise', 'education', 'authority', 'hospitality', 'medical', 'conference']

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
    <div className="relative max-w-2xl mx-auto space-y-10 py-6 px-4 text-white">

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[600px] h-[600px] opacity-[0.28]" />
      </div>

      {/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[280px] h-[280px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          {content.hero.badge && (
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
              {content.hero.badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            {content.hero.title}
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            {content.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Link to="/pricing">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                {content.cta} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                Alle Features <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {content.stats.map((stat, i) => (
          <div key={i} className="text-center p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15">
            <div className="text-xl font-bold text-sky-300">{stat.value}</div>
            <div className="text-[11px] text-white/65">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pain points / value props */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Warum Fintutto?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.painPoints.map((pp, i) => {
            const Icon = pp.icon
            return (
              <Card key={i} className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-sky-300" />
                </div>
                <h3 className="font-semibold text-sm">{pp.title}</h3>
                <p className="text-xs text-white/70 leading-relaxed">{pp.description}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">So funktioniert es</h2>
        <Card className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-3">
          {content.howItWorks.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-500/25 text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">{step.step}</span>
              <div>
                <p className="font-semibold text-sm">{step.title}</p>
                <p className="text-xs text-white/65">{step.description}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Features im Detail</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
          {content.features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-3 bg-black/25 backdrop-blur-md border-white/15 space-y-1">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-sky-300" />
                </div>
                <h3 className="font-semibold text-xs">{feat.title}</h3>
                <p className="text-[11px] text-white/65 leading-snug">{feat.description}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ROI Calculator (not for personal) */}
      {content.hasCalculator && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold drop-shadow-lg">ROI-Rechner: Was sparen Sie?</h2>
          <ROICalculator segment={seg as CalcSegment} />
          {/* Demo CTA after calculator */}
          {(['authority', 'medical', 'hospitality', 'education', 'conference'] as SalesSegment[]).includes(seg) && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Überzeugt? Testen Sie es jetzt kostenlos.</p>
                <p className="text-sm text-muted-foreground mt-0.5">Keine Installation, kein Account — einfach ausprobieren.</p>
              </div>
              <Link to={`/conversation?setup=${seg}`} className="shrink-0">
                <Button className="gap-2">
                  Demo starten
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Pricing */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Preise</h2>
        <p className="text-xs text-white/60">Jährlich zahlen = 2 Monate gratis (17% Rabatt)</p>
        <div className="space-y-3">
          {content.pricing.map((plan, i) => (
            <Card key={i} className={`p-4 backdrop-blur-md border ${i === content.pricing.length - 1 ? 'bg-sky-500/20 border-sky-400/40' : 'bg-black/25 border-white/15'}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-bold text-sm">{plan.name}</h3>
                  <p className={`text-lg font-bold ${i === content.pricing.length - 1 ? 'text-sky-300' : 'text-white'}`}>{plan.price}<span className="text-xs font-normal text-white/60 ml-1">{plan.period}</span></p>
                </div>
                {i === content.pricing.length - 1 && <span className="text-[10px] bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded-full font-semibold shrink-0">Empfohlen</span>}
              </div>
              <ul className="space-y-1 mb-3">
                {plan.highlights.map((h, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-white/80">
                    <Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />{h}
                  </li>
                ))}
              </ul>
              <Link to="/pricing" className="block">
                <Button size="sm" className="w-full">Plan wählen <ChevronRight className="h-3 w-3 ml-1" /></Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Einsatzszenarien</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {content.useCases.map((uc, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-black/25 backdrop-blur-md border border-white/15">
              <Star className="w-3.5 h-3.5 text-sky-300 mt-0.5 shrink-0" />
              <span className="text-xs text-white/80">{uc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical highlights */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Technische Highlights</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { Icon: Signal,    title: '4-Tier Transport',      desc: 'Cloud → Hotspot → Bluetooth → Offline. Automatischer Fallback.' },
            { Icon: Lock,      title: 'E2E-Verschlüsselung',   desc: 'AES-256-GCM mit PBKDF2 (100.000 Iterationen). Auch offline.' },
            { Icon: Cpu,       title: 'On-Device KI',          desc: 'Opus-MT & Whisper als WASM — keine Daten verlassen das Gerät.' },
            { Icon: Bluetooth, title: 'BLE GATT Protocol',     desc: 'Bluetooth-Gruppen-Übersetzung. Null Infrastruktur.' },
          ].map(({ Icon, title, desc }, i) => (
            <Card key={i} className="p-3 bg-black/25 backdrop-blur-md border-white/15 space-y-1">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-sky-300" />
                <h3 className="font-semibold text-xs">{title}</h3>
              </div>
              <p className="text-[11px] text-white/65">{desc}</p>
            </Card>
          ))}
        </div>
        <Link to="/technology">
          <Button variant="outline" size="sm" className="w-full border-white/25 text-white hover:bg-white/10">
            Technische Architektur <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap justify-center gap-2">
        {TRUST_SIGNALS.map((signal, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/15 text-xs font-medium text-white/80">
            <Shield className="w-3 h-3 text-sky-300" />
            {signal}
          </span>
        ))}
      </div>

      {/* Lead registration / invite form */}
      <LeadRegistrationForm segment={seg} inviteToken={inviteToken} source={source} />

      {/* Cross-links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Link to="/features" className="block">
          <Card className="p-3 bg-black/25 backdrop-blur-md border-white/15 hover:bg-black/35 transition-colors">
            <h3 className="font-semibold text-xs">Alle Features</h3>
            <p className="text-[11px] text-white/60 mt-0.5">Live-Broadcasting, Q&A, Scanner, Offline & mehr</p>
          </Card>
        </Link>
        <Link to="/technology" className="block">
          <Card className="p-3 bg-black/25 backdrop-blur-md border-white/15 hover:bg-black/35 transition-colors">
            <h3 className="font-semibold text-xs">Technologie</h3>
            <p className="text-[11px] text-white/60 mt-0.5">4-Tier-Transport, On-Device KI, E2E-Verschlüsselung</p>
          </Card>
        </Link>
        <Link to="/compare" className="block">
          <Card className="p-3 bg-black/25 backdrop-blur-md border-white/15 hover:bg-black/35 transition-colors">
            <h3 className="font-semibold text-xs">Vergleich</h3>
            <p className="text-[11px] text-white/60 mt-0.5">vs. Google Translate, DeepL, Wordly, KUDO, Vox</p>
          </Card>
        </Link>
      </div>

      {/* Bottom CTA */}
      <div className="grid grid-cols-2 gap-2 pb-4">
        <Link to="/pricing">
          <Button size="default" className="w-full gap-2">
            Alle Pläne <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link to="/investors">
          <Button size="default" variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">
            Investoren <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
