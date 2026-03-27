// FeaturesPage — Mobile-First Feature-Showcase
// Route: /features
// Prinzip: Kurz, prägnant, tiefe Links, große Touch-Targets

import { Link } from 'react-router-dom'
import {
  ArrowRight, Mic, Globe2, Users, Wifi, Camera, MessageSquare,
  QrCode, Volume2, Radio, Headphones, BookOpen, Star,
  Download, Shield, Lock, Bluetooth, ChevronRight, Check,
  Languages, Clock, Smartphone, Layers, Eye, Heart, History,
  FileText, Settings, Zap, MessageCircleQuestion, ScanText
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ─── Produkte ────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: 'Live-Broadcasting',
    tagline: '1 Sprecher → 500 Zuhörer',
    icon: Radio,
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    description: 'QR-Code zeigen — Gäste scannen und hören in ihrer Sprache. Keine App, kein Account.',
    features: [
      'Bis zu 500 gleichzeitige Hörer',
      '45 Sprachen parallel',
      'Untertitel-Modus (6xl Großschrift)',
      'Q&A: Besucher stellen Fragen, Host moderiert',
      'Session-Protokoll-Export (TXT/MD)',
      'Latenz-Monitoring in Echtzeit',
      '4 Verbindungsmodi: Cloud, Hotspot, BLE, Router',
    ],
    link: '/live',
    linkLabel: 'Session starten',
  },
  {
    name: 'Q&A-Moderation',
    tagline: 'Fragen aus dem Publikum',
    icon: MessageCircleQuestion,
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
    description: 'Besucher tippen Fragen — Host sieht die Inbox, moderiert und sendet genehmigte Fragen an alle Teilnehmer in deren Sprache.',
    features: [
      'Texteingabe für alle Listener',
      'Moderations-Inbox beim Speaker',
      'Freigeben oder verwerfen',
      'Freigegebene Fragen erscheinen bei allen Hörern',
      'Übersetzt in die jeweilige Listener-Sprache',
      'Keine App nötig — funktioniert im Browser',
    ],
    link: '/live',
    linkLabel: 'Live testen',
  },
  {
    name: 'Gesprächsmodus',
    tagline: 'Face-to-Face — 1:1',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    description: '180°-Split-Screen: Zwei Personen sprechen abwechselnd — beide verstehen. Ideal beim Arzt, auf der Behörde, im Hotel.',
    features: [
      '180-Grad-Split-Screen',
      'Zwei unabhängige Spracherkennungen',
      'Auto-Speak: Übersetzung wird vorgelesen',
      'RTL-Unterstützung (AR, FA, UR)',
      'Offline-fähig',
      'Kein zweites Gerät nötig',
    ],
    link: '/conversation',
    linkLabel: 'Gespräch starten',
  },
  {
    name: 'Kamera & Dokument-Scanner',
    tagline: 'Foto → Text → Übersetzung',
    icon: ScanText,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    description: 'Schilder, Speisekarten, Formulare, Dokumente fotografieren — die Übersetzung erscheint sofort. Powered by Google Cloud Vision OCR.',
    features: [
      'Google Cloud Vision OCR',
      'Kamera-Aufnahme oder Galerie-Upload',
      'Automatische Texterkennung',
      'Sofortige Übersetzung in Zielsprache',
      'Kopieren oder vorlesen lassen',
      'Ideal für Behördengänge & Reisen',
    ],
    link: '/camera',
    linkLabel: 'Scanner öffnen',
  },
  {
    name: 'Text-Übersetzer',
    tagline: '45 Sprachen, 6 Provider',
    icon: Languages,
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    description: '6-Provider-Kaskade mit automatischem Fallback. Von Cloud-APIs bis On-Device ML — immer die beste Qualität.',
    features: [
      '6 Kontextmodi (Reise, Medizin, Recht, Business…)',
      'Sie/Du-Formalität (9 Sprachen)',
      'Wort-Alternativen (Top 5 Matches)',
      'Romanisierung nicht-lateinischer Schriften',
      'Qualitäts-Score pro Übersetzung',
      'RTL-Unterstützung (AR, FA, UR, HE)',
    ],
    link: '/',
    linkLabel: 'Übersetzer öffnen',
  },
  {
    name: 'Phrasebook',
    tagline: '18 Kategorien, offline',
    icon: BookOpen,
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    description: 'Vorgefertigte Sätze für Behörde, Arzt, Notfall, Unterkunft — in 16 Zielsprachen sofort abrufbar, auch ohne Internet.',
    features: [
      '18 Kategorien (Behörde, Medizin, Notfall…)',
      '4 Phrase-Packs: Alltag, Mittelmeer, Nordland, Migration',
      '62 Migrations-Phrasen (7 Kategorien)',
      'Favoriten speichern',
      '100% offline verfügbar',
      'Ideal für Geflüchtete und Expats',
    ],
    link: '/phrasebook',
    linkLabel: 'Phrasebook öffnen',
  },
  {
    name: 'Offline-Engine',
    tagline: '100% ohne Netzwerk',
    icon: Download,
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    description: '54 Offline-Sprachpaare via Opus-MT WASM (~35 MB/Paar). Whisper für Spracherkennung. Keine Daten verlassen das Gerät.',
    features: [
      '54 herunterladbare Sprachpaare',
      'Opus-MT via Transformers.js (WASM)',
      'Whisper STT (multilingual, ~150 MB)',
      'Browser-native TTS (alle Sprachen)',
      'English-Pivot für indirekte Paare',
      'Persistent Storage (Safari-safe)',
    ],
    link: '/offline-setup',
    linkLabel: 'Offline einrichten',
  },
  {
    name: 'BLE-Transport',
    tagline: 'Bluetooth — null Infrastruktur',
    icon: Bluetooth,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/15',
    description: 'Proprietäres Bluetooth Low Energy GATT Protocol. Gruppen-Übersetzung ohne Internet, ohne WLAN — funktioniert überall.',
    features: [
      'Custom GATT Server (Android + iOS)',
      '180-Byte Chunking (MTU-safe)',
      'Automatische Geräte-Discovery',
      'Session-Management + Presence',
      '10–30 m Reichweite',
      'E2E-Verschlüsselung auch über BLE',
    ],
    link: '/live',
    linkLabel: 'BLE-Session starten',
  },
]

// ─── Plattform-Features ───────────────────────────────────────────────────────
const PLATFORM = [
  { icon: Shield, title: 'E2E-Verschlüsselt', desc: 'AES-256-GCM' },
  { icon: Globe2, title: '9 UI-Sprachen', desc: 'DE EN FR ES RU UK AR FA TR' },
  { icon: Eye, title: 'DSGVO-konform', desc: 'Offline-First, kein Cloud-Zwang' },
  { icon: Heart, title: 'Favoriten', desc: 'Übersetzungen speichern' },
  { icon: History, title: 'Verlauf', desc: 'Export JSON/CSV' },
  { icon: FileText, title: 'Session-Protokoll', desc: 'TXT/MD Export' },
  { icon: Settings, title: 'Einstellungen', desc: 'API-Key, Offline, Cache' },
  { icon: Smartphone, title: 'PWA + Native', desc: 'Browser, Android, iOS' },
  { icon: Zap, title: '<1s Latenz', desc: 'End-to-End Echtzeit' },
  { icon: Lock, title: 'Security Headers', desc: 'CSP, HSTS, X-Frame' },
  { icon: Star, title: 'RTL-Support', desc: 'AR FA UR HE' },
  { icon: Layers, title: '4-Tier Transport', desc: 'Cloud→Hotspot→BLE→Offline' },
]

// ─── Sprachen ─────────────────────────────────────────────────────────────────
const LANGUAGE_CATEGORIES = [
  {
    name: 'Europäische Kernsprachen (22)',
    languages: 'Deutsch, Englisch, Französisch, Spanisch, Italienisch, Portugiesisch, Niederländisch, Polnisch, Türkisch, Russisch, Ukrainisch, Arabisch, Chinesisch, Japanisch, Koreanisch, Hindi, Schwedisch, Dänisch, Tschechisch, Rumänisch, Griechisch, Ungarisch',
  },
  {
    name: 'Migrationssprachen (10)',
    languages: 'Farsi/Dari, Paschtu, Kurdisch, Tigrinya, Amharisch, Somali, Urdu, Bengali, Suaheli, Albanisch',
  },
  {
    name: 'Tourismussprachen (13)',
    languages: 'Kroatisch, Bulgarisch, Serbisch, Slowakisch, Norwegisch, Finnisch, Thai, Vietnamesisch, Indonesisch, Malaiisch, Filipino, Hebräisch, Georgisch',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function FeaturesPage() {
  return (
    <div className="relative max-w-2xl mx-auto space-y-10 py-6 px-4 text-white">

      {/* Hintergrund-Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[600px] h-[600px] opacity-[0.28]" />
      </div>

      {/* Hero — kompakt, mobile-first */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[320px] h-[320px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            8 Module · 45 Sprachen · Offline-fähig
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-white drop-shadow-lg">
            Alles für mehrsprachige Kommunikation.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            Live-Broadcasting, Q&A, Gespräch, Scanner, Phrasebook — in einer App. Kostenlos starten.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-1">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Jetzt testen <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
                Preise & Pläne
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Produkt-Karten — vertikal gestapelt, mobile-optimiert */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold drop-shadow-lg">8 Module im Überblick</h2>
        {PRODUCTS.map((product, i) => {
          const Icon = product.icon
          return (
            <Card key={i} className="p-5 bg-black/25 backdrop-blur-md border-white/15">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${product.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${product.color}`} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-base leading-tight">{product.name}</h3>
                      <p className={`text-xs font-semibold ${product.color}`}>{product.tagline}</p>
                    </div>
                    <Link to={product.link} className="shrink-0">
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-white/25 text-white hover:bg-white/10 whitespace-nowrap">
                        {product.linkLabel} <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-sm text-white/75 leading-snug">{product.description}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 pt-1">
                    {product.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-1.5 text-xs text-white/80">
                        <Check className={`w-3 h-3 ${product.color} mt-0.5 shrink-0`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Plattform-Features — kompaktes Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold drop-shadow-lg">Plattform-Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PLATFORM.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div key={i} className="p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-1">
                <Icon className="w-4 h-4 text-sky-300" />
                <div className="font-semibold text-xs">{feat.title}</div>
                <div className="text-[11px] text-white/65">{feat.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sprachen */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold drop-shadow-lg">45 Sprachen in 3 Kategorien</h2>
          <p className="text-sm text-white/70">
            Inkl. 10 Migrationssprachen · vollständige RTL-Unterstützung
          </p>
        </div>
        <div className="space-y-2">
          {LANGUAGE_CATEGORIES.map((cat, i) => (
            <Card key={i} className="p-4 bg-black/25 backdrop-blur-md border-white/15">
              <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
              <p className="text-xs text-white/70 leading-relaxed">{cat.languages}</p>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-white/60">
          + 54 Offline-Sprachpaare via Opus-MT WASM · Romanisierung für nicht-lateinische Schriften
        </p>
      </div>

      {/* CTA — sticky-freundlich */}
      <div className="space-y-3 py-2">
        <div className="flex flex-col gap-2">
          <Link to="/">
            <Button size="lg" className="w-full gap-2">
              Übersetzer öffnen <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/pricing">
              <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
                Preise
              </Button>
            </Link>
            <Link to="/technology">
              <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
                Technologie
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
