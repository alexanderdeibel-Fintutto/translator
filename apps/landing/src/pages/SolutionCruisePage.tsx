/**
 * Events / Conference Solution Page
 *
 * Landing page for the Conference / Events market segment.
 * Highlights: Multi-channel, large audience, QR-poster, speaker dashboard.
 */

import {
  ArrowRight, ChevronRight, Check, Presentation,
  Radio, Users, QrCode, BarChart3, Wifi, Globe2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const SPEAKER_URL = 'https://cruise-staff.fintutto.world'
const LISTENER_URL = 'https://cruise-guest.fintutto.world'

export default function SolutionEventsPage() {
  return (
    <div className="relative max-w-4xl mx-auto space-y-16 py-8 px-4 text-white">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.65]" />
      </div>

      {/* Hero */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-95" />
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/30 text-white">
            Conference Translator
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Events uebersetzen —<br />
            <span className="text-blue-300">fuer jedes Publikum</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Multi-Kanal Live-Uebersetzung fuer Konferenzen, Messen, Gottesdienste und Events.
            Bis zu 500 Teilnehmer, jeder in seiner Sprache.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={SPEAKER_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                Speaker-App <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={LISTENER_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Teilnehmer-App <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Einsatzbereiche</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Konferenzen', desc: 'Multi-Track mit Kanalwechsel zwischen Raeumen' },
            { title: 'Messen', desc: 'Am Stand praesentieren — Besucher lesen mit' },
            { title: 'Gottesdienste', desc: 'Predigt simultan in 45 Sprachen' },
            { title: 'Firmenmeetings', desc: 'Internationale Teams, ein Stream' },
          ].map((uc, i) => (
            <Card key={i} className="p-4 text-center space-y-1 bg-black/30 backdrop-blur-sm border-white/10">
              <h3 className="font-semibold text-sm">{uc.title}</h3>
              <p className="text-xs text-white/70">{uc.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Funktionen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Radio, title: 'Multi-Kanal', desc: 'Mehrere Speaker gleichzeitig — Zuhoerer wechseln per Tap zwischen Kanaelen.' },
            { icon: Users, title: '500 Teilnehmer', desc: 'Skaliert fuer grosses Publikum. Echtzeit-Broadcasting via Supabase Realtime.' },
            { icon: QrCode, title: 'QR-Poster', desc: 'Druckfertiger QR-Code zum Aufhaengen im Saal. Scannen, Sprache waehlen, fertig.' },
            { icon: BarChart3, title: 'Speaker-Dashboard', desc: 'Live-Statistiken: Wie viele Zuhoerer, welche Sprachen, Session-Dauer.' },
            { icon: Globe2, title: '45 Sprachen', desc: 'Simultane Uebersetzung in alle unterstuetzten Sprachen parallel.' },
            { icon: Wifi, title: 'Offline-Fallback', desc: 'Bei Netzwerkproblemen automatischer Wechsel auf lokale Uebersetzung.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-4 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-blue-300" />
                <h3 className="font-semibold text-sm">{feat.title}</h3>
                <p className="text-xs text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Event-Preise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <p className="font-semibold">Event Basic</p>
            <p className="text-2xl font-bold text-blue-300">199 EUR/Mo</p>
            <p className="text-xs text-white/70">100 Hoerer, 3 Sessions</p>
          </Card>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 ring-1 ring-blue-400">
            <p className="font-semibold">Event Pro</p>
            <p className="text-2xl font-bold text-blue-300">499 EUR/Mo</p>
            <p className="text-xs text-white/70">500 Hoerer, 10 Sessions</p>
          </Card>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <p className="font-semibold">Einzel-Event</p>
            <p className="text-2xl font-bold text-blue-300">Auf Anfrage</p>
            <p className="text-xs text-white/70">Tageslizenzen, White-Label</p>
          </Card>
        </div>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-2">
        {['Kein Account fuer Teilnehmer', 'DSGVO-konform', 'Echtzeit < 1s', 'Made in Germany'].map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-xs font-medium text-white">
            <Check className="w-3 h-3 text-blue-300" /> {s}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={SPEAKER_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
            Speaker-App oeffnen <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  )
}
