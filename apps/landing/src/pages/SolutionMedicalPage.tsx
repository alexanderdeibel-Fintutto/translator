/**
 * Medical Solution Page
 *
 * Landing page for the Medical market segment.
 * Highlights: Medical phrases, pain scale, privacy disclaimer, conversation mode.
 */

import {
  ArrowRight, ChevronRight, Check, Heart,
  Stethoscope, Shield, MessageSquare, AlertTriangle, Pill, Wifi
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const STAFF_URL = 'https://tl-medical-staff.fintutto.cloud'
const PATIENT_URL = 'https://tl-medical-patient.fintutto.cloud'

export default function SolutionMedicalPage() {
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
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-500/30 text-white">
            Medical Translator
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Patienten verstehen —<br />
            <span className="text-red-300">in jeder Sprache</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Arzt-Patient-Kommunikation ohne Sprachbarriere.
            28 medizinische Phrasen, visuelle Schmerzskala, Datenschutz-konform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a href={STAFF_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2 bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                Personal-App <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={PATIENT_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Patienten-App <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Fuer den medizinischen Alltag</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Stethoscope, title: '28 Med-Phrasen', desc: 'Vorgefertigte Saetze in 4 Kategorien: Notfall, Triage, Symptome, Anweisungen.' },
            { icon: Heart, title: 'Schmerzskala (0-10)', desc: 'Visuelle Wong-Baker-Skala mit Emojis — funktioniert ohne Worte, sprachneutral.' },
            { icon: MessageSquare, title: 'Patientengespraech', desc: 'Bidirektionale Uebersetzung: Arzt und Patient sprechen abwechselnd.' },
            { icon: AlertTriangle, title: 'Notfall-Modus', desc: 'Schnellzugriff auf kritische Phrasen: Atemnot, Allergien, Schmerzen.' },
            { icon: Pill, title: 'Medikamenten-Info', desc: 'Dosierung, Einnahmehinweise und Wechselwirkungen uebersetzen.' },
            { icon: Shield, title: 'Datenschutz', desc: 'Keine Speicherung von Patientendaten. DSGVO + Aerztliche Schweigepflicht.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-4 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-red-300" />
                <h3 className="font-semibold text-sm">{feat.title}</h3>
                <p className="text-xs text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pain Scale Demo */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Schmerzskala — ohne Worte</h2>
        <div className="flex justify-center gap-4 text-center">
          {[
            { emoji: '😊', value: 0, label: 'Kein' },
            { emoji: '🙂', value: 2, label: 'Leicht' },
            { emoji: '😐', value: 4, label: 'Maessig' },
            { emoji: '😟', value: 6, label: 'Stark' },
            { emoji: '😣', value: 8, label: 'Sehr stark' },
            { emoji: '😭', value: 10, label: 'Max' },
          ].map((p, i) => (
            <div key={i} className="space-y-1">
              <span className="text-3xl">{p.emoji}</span>
              <p className="text-xs font-bold text-white">{p.value}</p>
              <p className="text-[10px] text-white/50">{p.label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-white/50">Patient tippt auf ein Gesicht — fertig. Funktioniert in jeder Sprache.</p>
      </div>

      {/* Use Cases */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Arztpraxis', desc: 'Anamnese, Untersuchung, Befund — alles uebersetzt.' },
          { title: 'Notaufnahme', desc: 'Schnelle Triage auch ohne gemeinsame Sprache.' },
          { title: 'Apotheke', desc: 'Dosierung und Einnahme erklaeren, Wechselwirkungen warnen.' },
        ].map((uc, i) => (
          <Card key={i} className="p-5 space-y-2 text-center bg-black/30 backdrop-blur-sm border-white/10">
            <h3 className="font-semibold">{uc.title}</h3>
            <p className="text-xs text-white/70">{uc.desc}</p>
          </Card>
        ))}
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Preise fuer medizinische Einrichtungen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <p className="font-semibold">Praxis</p>
            <p className="text-2xl font-bold text-red-300">29,90 EUR/Mo</p>
            <p className="text-xs text-white/70">1 Arzt/Pfleger, unbegrenzte Patienten</p>
          </Card>
          <Card className="p-5 text-center space-y-2 bg-black/30 backdrop-blur-sm border-white/10 ring-1 ring-red-400">
            <p className="font-semibold">Klinik / Krankenhaus</p>
            <p className="text-2xl font-bold text-red-300">199 EUR/Mo</p>
            <p className="text-xs text-white/70">Unbegrenzte Nutzer + Admin</p>
          </Card>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-xl mx-auto p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-xs text-amber-200 text-center">
          <strong>Hinweis:</strong> Medical Translator ersetzt keinen professionellen medizinischen Dolmetscher.
          Bei kritischen Diagnosen oder Eingriffen ziehen Sie bitte einen zertifizierten Dolmetscher hinzu.
        </p>
      </div>

      {/* Trust */}
      <div className="flex flex-wrap justify-center gap-2">
        {['DSGVO-konform', 'Keine Patientendaten', 'Schweigepflicht-konform', 'Made in Germany'].map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-xs font-medium text-white">
            <Check className="w-3 h-3 text-red-300" /> {s}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <a href={STAFF_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="gap-2 bg-red-600 hover:bg-red-700">
            Jetzt testen <ArrowRight className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  )
}
