import {
  ArrowRight, Languages, Radio, MessageSquare, Camera, BookOpen,
  Wifi, Mic, Volume2, Shield, Globe2, ChevronRight, Check, Star
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const FEATURES = [
  { icon: Languages, title: 'Text-Uebersetzer', desc: '45 Sprachen mit 6-Provider-Kaskade und automatischem Fallback. 6 Kontextmodi: Reise, Medizin, Recht, Business, Alltag, Technik.' },
  { icon: Radio, title: 'Live-Sessions', desc: 'Als Speaker oder Zuhoerer an Echtzeit-Uebersetzungssessions teilnehmen. QR-Code scannen und sofort mitlesen.' },
  { icon: MessageSquare, title: 'Gespraechsmodus', desc: 'Face-to-Face-Uebersetzung mit 180-Grad Split-Screen. Ideal beim Arzt, auf der Behoerde oder im Hotel.' },
  { icon: Camera, title: 'Kamera-OCR', desc: 'Schilder, Speisekarten und Dokumente fotografieren — die Uebersetzung erscheint sofort.' },
  { icon: BookOpen, title: 'Phrasebook', desc: '18 Kategorien mit vorgefertigten Saetzen: Behoerde, Arzt, Unterkunft, Notfall und mehr.' },
  { icon: Wifi, title: 'Offline-Modus', desc: '54 Sprachpaare via On-Device KI (Opus-MT). Spracherkennung mit Whisper — komplett ohne Internet.' },
  { icon: Mic, title: 'Spracheingabe', desc: 'Diktieren statt tippen. Browser-eigene Erkennung oder lokales Whisper-Modell.' },
  { icon: Volume2, title: 'HD-Sprachausgabe', desc: 'Google Neural2 + Chirp 3 HD. Natuerliche Stimmen in 24+ Sprachen.' },
]

const APP_URL = 'https://consumer.guidetranslator.com'

export default function AppConsumerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8 px-4">
      {/* Hero */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-[0.65]" />
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Fintutto Translator
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Uebersetze sofort. In 45 Sprachen.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            Der kostenlose Uebersetzer mit Spracheingabe, Kamera-OCR, Live-Sessions
            und Offline-Modus. Als PWA direkt im Browser — keine Installation noetig.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={APP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 w-full sm:w-auto bg-sky-600 hover:bg-sky-700">
                Jetzt uebersetzen — kostenlos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: '45', label: 'Sprachen' },
          { value: '54', label: 'Offline-Paare' },
          { value: '0 EUR', label: 'Einstiegspreis' },
          { value: '<1s', label: 'Latenz' },
        ].map((stat, i) => (
          <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-sky-600">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Alles, was du brauchst</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-sky-600" />
                </div>
                <h3 className="font-semibold">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Preise */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Preise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg">Free</h3>
            <div className="text-3xl font-bold">0 EUR</div>
            <ul className="space-y-2 text-sm">
              {['22 Sprachen + Offline', '500 Uebersetzungen/Tag', 'Gespraechsmodus', 'Kamera-OCR', 'Phrasebook'].map((h, j) => (
                <li key={j} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-6 space-y-4 border-sky-300 dark:border-sky-700">
            <h3 className="font-bold text-lg">Personal Pro</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">4,99 EUR</span>
              <span className="text-muted-foreground">/Mo</span>
            </div>
            <ul className="space-y-2 text-sm">
              {['30 Sprachen', 'Azure-Qualitaet', 'Unbegrenzte Uebersetzungen', 'Live-Session (3 Hoerer)', 'Kein Werbebanner'].map((h, j) => (
                <li key={j} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={APP_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-sky-600 hover:bg-sky-700">
            Jetzt kostenlos testen
            <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
        <p className="text-sm text-muted-foreground">
          Keine Registrierung noetig. Oeffne die App und leg los.
        </p>
      </div>
    </div>
  )
}
