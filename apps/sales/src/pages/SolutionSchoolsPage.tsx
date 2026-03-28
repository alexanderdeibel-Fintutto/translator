/**
 * Schools Solution Page
 *
 * Landing page for the Schools market segment.
 * Highlights: Classroom QR, parent letter, vocab export.
 */

import { Link } from 'react-router-dom'
import {
  ArrowRight, ChevronRight, Check, GraduationCap,
  QrCode, FileText, BookOpen, Users, Globe2, Wifi
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const TEACHER_URL = 'https://school-teacher.fintutto.world'
const STUDENT_URL = 'https://school-student.fintutto.world'

export default function SolutionSchoolsPage() {
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
            School Translator
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Unterricht verstehen —<br />
            <span className="text-blue-300">in jeder Sprache</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Live-Uebersetzung im Klassenzimmer. Der Lehrer spricht, die Schueler lesen mit —
            jeder in seiner Muttersprache. Kein Dolmetscher noetig.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={TEACHER_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                Lehrer-App oeffnen <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={STUDENT_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Schueler-App <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* 2 Apps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
          <GraduationCap className="w-6 h-6 text-blue-300" />
          <h3 className="font-bold text-lg">Lehrer-App</h3>
          <p className="text-sm text-white/70">Session starten, QR-Code im Klassenzimmer aufhaengen, sprechen. Die Uebersetzung laeuft automatisch.</p>
          <a href={TEACHER_URL} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700">Oeffnen <ArrowRight className="w-3 h-3" /></Button>
          </a>
        </Card>
        <Card className="p-6 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
          <Users className="w-6 h-6 text-blue-300" />
          <h3 className="font-bold text-lg">Schueler-App</h3>
          <p className="text-sm text-white/70">QR-Code scannen oder Code eingeben, Sprache waehlen — fertig. Keine Registrierung, kein Account.</p>
          <a href={STUDENT_URL} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-1 border-white/30 text-white hover:bg-white/10">Oeffnen <ArrowRight className="w-3 h-3" /></Button>
          </a>
        </Card>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Speziell fuer Schulen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: QrCode, title: 'Klassenzimmer-QR', desc: 'Druckfertiges QR-Poster fuer jedes Klassenzimmer. Schueler scannen und sind dabei.' },
            { icon: FileText, title: 'Elternbrief', desc: 'Automatisch generierter Brief fuer Eltern — erklaert die App in der Familiensprache.' },
            { icon: BookOpen, title: 'Vokabel-Export', desc: 'Neue Woerter aus dem Unterricht als Vokabelliste exportieren (CSV/PDF).' },
            { icon: Globe2, title: '45 Sprachen', desc: 'Inkl. Arabisch, Tuerkisch, Ukrainisch, Dari, Paschtu, Tigrinya und mehr.' },
            { icon: Wifi, title: 'Offline-faehig', desc: 'Funktioniert auch ohne Internet — wichtig fuer Schulen mit schlechtem WLAN.' },
            { icon: Users, title: 'Ganze Klasse', desc: 'Bis zu 30 Schueler gleichzeitig — jeder in seiner eigenen Sprache.' },
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
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Fuer Schulen kostenguenstig</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <p className="font-semibold">Einzellizenz</p>
            <p className="text-2xl font-bold text-blue-300">9,90 EUR/Mo</p>
            <p className="text-xs text-white/70">1 Lehrkraft, 30 Schueler</p>
          </Card>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 ring-1 ring-blue-400">
            <p className="font-semibold">Schullizenz</p>
            <p className="text-2xl font-bold text-blue-300">49,90 EUR/Mo</p>
            <p className="text-xs text-white/70">Unbegrenzte Lehrkraefte</p>
          </Card>
        </div>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-2">
        {['DSGVO-konform', 'Keine Schueler-Daten', 'Offline-faehig', 'Made in Germany'].map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-xs font-medium text-white">
            <Check className="w-3 h-3 text-blue-300" /> {s}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={TEACHER_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
            Jetzt ausprobieren <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  )
}
