// FeaturesPage — Complete feature showcase for all 7 products
// Route: /features

import { Link } from 'react-router-dom'
import {
  ArrowRight, Mic, Globe2, Users, Wifi, Camera, MessageSquare,
  QrCode, Volume2, Radio, Monitor, Headphones, BookOpen, Star,
  Download, Shield, Lock, Bluetooth, ChevronRight, Check,
  Languages, Clock, Smartphone, Layers, Eye, Heart, History,
  FileText, Settings, Zap
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const PRODUCTS = [
  {
    name: 'Live-Broadcasting',
    tagline: '1→N Echtzeit-Broadcast',
    icon: Radio,
    description: 'Ein Sprecher, unbegrenzt viele Zuhörer. Jeder wählt seine Sprache und liest/hört die Übersetzung in Echtzeit auf dem eigenen Smartphone.',
    features: [
      'QR-Code scannen — keine App-Installation',
      'Bis zu 500 gleichzeitige Hörer',
      '45 Sprachen parallel',
      'Untertitel-Modus (6xl Großschrift)',
      'Session-Protokoll-Export (TXT/MD)',
      'Latenz-Monitoring in Echtzeit',
      '3 Verbindungsmodi: Cloud, Hotspot, BLE',
    ],
    segment: 'guide',
  },
  {
    name: 'Text-Übersetzer',
    tagline: '45 Sprachen, 6 Provider',
    icon: Languages,
    description: 'Professionelle Übersetzung mit 6-Provider-Kaskade und automatischem Fallback. Von Cloud-APIs bis On-Device ML — immer die beste verfügbare Qualität.',
    features: [
      '6 Kontextmodi (Reise, Medizin, Recht, Business...)',
      'Sie/Du-Formalität (9 Sprachen)',
      'Wort-Alternativen (Top 5 Matches)',
      'Romanisierung nicht-lateinischer Schriften',
      'Qualitäts-Score pro Übersetzung',
      '3-Tier-Cache (Memory, IndexedDB, Offline)',
      'RTL-Unterstützung (Arabisch, Farsi, Urdu, Hebräisch)',
    ],
    segment: 'personal',
  },
  {
    name: 'Gesprächsmodus',
    tagline: 'Face-to-Face-Übersetzung',
    icon: MessageSquare,
    description: 'Split-Screen mit 180-Grad-Rotation. Zwei Personen sprechen abwechselnd — beide verstehen. Ideal beim Arzt, auf der Behörde oder im Hotel.',
    features: [
      '180-Grad-Split-Screen',
      'Zwei unabhängige Spracherkennungen',
      'Auto-Speak: Übersetzung wird vorgelesen',
      '6 Nachrichten pro Person sichtbar',
      'RTL-Text-Unterstützung',
      'Offline-fähig',
      'Perfekt für 1:1-Situationen',
    ],
    segment: 'personal',
  },
  {
    name: 'Kamera-Übersetzer',
    tagline: 'Foto → Text → Übersetzung',
    icon: Camera,
    description: 'Fotografieren Sie Schilder, Speisekarten, Dokumente oder Formulare — die Übersetzung erscheint sofort. Powered by Google Cloud Vision OCR.',
    features: [
      'Google Cloud Vision OCR',
      'Kamera-Aufnahme oder Galerie-Upload',
      'Sofortige Übersetzung des erkannten Texts',
      'Kopieren oder vorlesen lassen',
      'Ideal für Reisen und Behördengänge',
    ],
    segment: 'personal',
  },
  {
    name: 'Phrasebook',
    tagline: '18 Kategorien, 16 Sprachen',
    icon: BookOpen,
    description: 'Vorgefertigte Sätze für typische Situationen — von der Behörde über den Arztbesuch bis zum Notfall. In 16 Zielsprachen sofort abrufbar.',
    features: [
      '18 Kategorien (Behörde, Medizin, Unterkunft, Notfall...)',
      '4 Phrase-Packs: Alltag, Mittelmeer, Nordland, Migration',
      '62 Migrations-Phrasen (7 Kategorien)',
      'Batch-Übersetzung in Zielsprache',
      'Favoriten speichern',
      'Offline verfügbar',
      'Ideal für Geflüchtete und Expats',
    ],
    segment: 'personal',
  },
  {
    name: 'Offline-Engine',
    tagline: '100% ohne Netzwerk',
    icon: Download,
    description: '54 Offline-Sprachpaare via Opus-MT WASM-Modelle (~35 MB pro Paar). Whisper für Spracherkennung (~40 MB). Keine Daten verlassen das Gerät.',
    features: [
      '54 herunterladbare Sprachpaare',
      'Opus-MT via Transformers.js (WASM)',
      'Whisper STT (multilingual, ~40 MB)',
      'Browser-native TTS (alle Sprachen)',
      'English-Pivot für indirekte Paare',
      'Service Worker + IndexedDB Caching',
      'Persistent Storage (Safari-safe)',
    ],
    segment: 'personal',
  },
  {
    name: 'BLE-Transport',
    tagline: 'Bluetooth-only Übersetzung',
    icon: Bluetooth,
    description: 'Proprietäres Bluetooth Low Energy GATT Protocol für Gruppen-Übersetzung. Null Infrastruktur — funktioniert an jedem Ort der Welt.',
    features: [
      'Custom GATT Server (Android + iOS)',
      '180-Byte Chunking (MTU-safe)',
      'Automatische Geräte-Discovery',
      'Session-Management + Presence',
      '10-30m Reichweite',
      'Max 5 gleichzeitige Verbindungen',
      'E2E-Verschlüsselung auch über BLE',
    ],
    segment: 'guide',
  },
]

const PLATFORM_FEATURES = [
  { icon: Shield, title: 'E2E-Verschlüsselung', desc: 'AES-256-GCM mit PBKDF2 Key Derivation' },
  { icon: Globe2, title: '9 UI-Sprachen', desc: 'DE, EN, FR, ES, RU, UK, AR, FA, TR' },
  { icon: Eye, title: 'DSGVO-konform', desc: 'Offline-First, kein Cloud-Zwang' },
  { icon: Heart, title: 'Favoriten', desc: 'Übersetzungen speichern und wiederverwenden' },
  { icon: History, title: 'Verlauf', desc: 'Alle Übersetzungen mit Export (JSON/CSV)' },
  { icon: FileText, title: 'Session-Protokoll', desc: 'Touren als Transkript exportieren' },
  { icon: Settings, title: 'Einstellungen', desc: 'API-Key, Offline-Modelle, Cache, Storage' },
  { icon: Smartphone, title: 'PWA + Native', desc: 'Browser, Android (Play Store), iOS' },
  { icon: Zap, title: 'Echtzeit', desc: '<1s End-to-End-Latenz' },
  { icon: Lock, title: 'Security Headers', desc: 'CSP, HSTS, X-Frame-Options' },
  { icon: Star, title: 'RTL-Unterstützung', desc: 'Arabisch, Farsi, Urdu, Hebräisch' },
  { icon: Layers, title: '4-Tier Transport', desc: 'Cloud → Hotspot → BLE → Offline' },
]

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

export default function FeaturesPage() {
  return (
    <div className="relative max-w-4xl mx-auto space-y-16 py-8 px-4">
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
            7 Produkte in einer App
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Alles, was Sie für mehrsprachige Kommunikation brauchen.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            Von Live-Broadcasting für 500 Personen bis zum persönlichen Gesprächsmodus beim Arzt.
            45 Sprachen, Offline-fähig, E2E-verschlüsselt.
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="space-y-8">
        {PRODUCTS.map((product, i) => {
          const Icon = product.icon
          return (
            <Card key={i} className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="sm:w-2/5 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">{product.name}</h2>
                  <p className="text-sm font-medium text-primary">{product.tagline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                  <Link to={`/sales/${product.segment}`}>
                    <Button variant="link" className="px-0 gap-1 text-sm">
                      Mehr erfahren <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <div className="sm:w-3/5">
                  <ul className="space-y-2">
                    {product.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
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

      {/* Platform features grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Plattform-Features</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PLATFORM_FEATURES.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1">
                <Icon className="w-4 h-4 text-primary" />
                <div className="font-medium text-sm">{feat.title}</div>
                <div className="text-xs text-muted-foreground">{feat.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">45 Sprachen in 3 Kategorien</h2>
          <p className="text-muted-foreground">
            Inkl. 10 Migrationssprachen und vollständige RTL-Unterstützung für Arabisch, Farsi, Paschtu, Kurdisch, Urdu und Hebräisch.
          </p>
        </div>
        <div className="space-y-4">
          {LANGUAGE_CATEGORIES.map((cat, i) => (
            <Card key={i} className="p-5 space-y-2">
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-sm text-muted-foreground">{cat.languages}</p>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          + 54 Offline-Sprachpaare via Opus-MT WASM-Modelle + Romanisierung für nicht-lateinische Schriften
        </p>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold">Jetzt testen</h2>
        <p className="text-muted-foreground">
          Alle Features sind im Free-Plan verfügbar. Keine Registrierung nötig.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Übersetzer öffnen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Preise & Pläne
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/technology">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Technische Architektur
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
