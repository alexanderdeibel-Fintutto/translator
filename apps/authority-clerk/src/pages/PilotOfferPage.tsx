/**
 * Pilot Offer Page — AmtTranslator
 *
 * Zeigt das Pilot-Angebot für Behörden, wenn sie die App testen.
 * Dient als interaktives Sales-Material direkt in der App.
 *
 * Design: Behörden-Professionell — Teal/Slate
 */

import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  Shield,
  Wifi,
  WifiOff,
  Smartphone,
  Languages,
  FileText,
  Clock,
  Euro,
  Star,
  ChevronRight,
  Building2,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const PILOT_FEATURES = [
  {
    icon: WifiOff,
    title: '100% Offline',
    desc: 'Keine Internetverbindung nötig. Alle Daten bleiben auf dem Gerät.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: Languages,
    title: '24 Sprachen',
    desc: 'Arabisch, Türkisch, Ukrainisch, Persisch, Somali, Tigrinya und 18 weitere.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Smartphone,
    title: 'Bidirektional',
    desc: 'Sachbearbeiter und Bürger sprechen abwechselnd — auf einem Gerät.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Shield,
    title: 'DSGVO-konform',
    desc: 'Keine Datenspeicherung, kein Cloud-Transfer. Art. 9 DSGVO erfüllt.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: FileText,
    title: 'Gesprächsprotokoll',
    desc: 'DSGVO-konformes Protokoll für die Akte. Druckbar und exportierbar.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Wifi,
    title: 'QR-Code optional',
    desc: 'Bürger können optional auf eigenem Smartphone mithören.',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
  },
]

const PILOT_STEPS = [
  {
    step: '1',
    title: 'Kostenlose Testphase',
    desc: '4 Wochen kostenlos, kein Vertrag, keine Kreditkarte.',
    duration: 'Woche 1–4',
  },
  {
    step: '2',
    title: 'Schulung & Einrichtung',
    desc: '1 Stunde Einführung für Ihr Team. Remote oder vor Ort.',
    duration: 'Woche 1',
  },
  {
    step: '3',
    title: 'Pilotbetrieb',
    desc: 'Einsatz an 2–3 Schaltern. Wir sind jederzeit erreichbar.',
    duration: 'Woche 2–4',
  },
  {
    step: '4',
    title: 'Auswertung & Entscheidung',
    desc: 'Gemeinsame Auswertung. Kein Druck — Sie entscheiden.',
    duration: 'Woche 4',
  },
]

const PRICING = [
  {
    name: 'Pilot',
    price: '0',
    period: '4 Wochen',
    highlight: false,
    features: [
      'Alle Features freigeschaltet',
      '1 Gerät (Ihr Tablet)',
      'E-Mail-Support',
      'Keine Kündigung nötig',
    ],
  },
  {
    name: 'Schalter',
    price: '49',
    period: 'pro Monat',
    highlight: true,
    features: [
      'Alle Features',
      '1 Gerät',
      'Telefon-Support',
      'Updates inklusive',
      'Monatlich kündbar',
    ],
  },
  {
    name: 'Behörde',
    price: '199',
    period: 'pro Monat',
    highlight: false,
    features: [
      'Alle Features',
      'Bis zu 10 Geräte',
      'Persönlicher Ansprechpartner',
      'SLA 99,9%',
      'EVB-IT Vertrag',
      'Jährliche Abrechnung möglich',
    ],
  },
]

export default function PilotOfferPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück
        </Button>
      </div>

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 text-sm font-medium">
          <Star className="h-4 w-4" />
          Pilotprogramm für Ausländerbehörden
        </div>
        <h1 className="text-3xl font-bold">
          AmtTranslator — 4 Wochen kostenlos testen
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Der erste bidirektionale Offline-Übersetzer für Behördengespräche.
          Kein Internet. Kein zweites Gerät. Kein Dolmetscher-Engpass.
        </p>
        <Button
          size="lg"
          className="bg-teal-700 hover:bg-teal-800 text-white"
          onClick={() => navigate('/standalone')}
        >
          Jetzt testen
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Was AmtTranslator kann</h2>
        <div className="grid grid-cols-2 gap-4">
          {PILOT_FEATURES.map((f) => (
            <Card key={f.title} className="p-4 flex gap-3">
              <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center shrink-0`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* USP vs. Wettbewerb */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Warum nicht einfach Google Translate?</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold">Kriterium</th>
                <th className="text-center p-3 font-semibold text-teal-700">AmtTranslator</th>
                <th className="text-center p-3 font-semibold text-slate-500">Google Translate</th>
                <th className="text-center p-3 font-semibold text-slate-500">Dolmetscher</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                ['100% Offline (kein Internet)', '✅', '❌', '✅'],
                ['Kein Cloud-Transfer (DSGVO)', '✅', '❌', '✅'],
                ['Bidirektional auf 1 Gerät', '✅', '❌', '✅'],
                ['24/7 verfügbar', '✅', '✅', '❌'],
                ['Sofort einsatzbereit', '✅', '✅', '❌'],
                ['Gesprächsprotokoll', '✅', '❌', '❌'],
                ['Kosten pro Stunde', '~0,05 €', '~0 €', '80–150 €'],
              ].map(([crit, amt, google, dolm]) => (
                <tr key={crit} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-700">{crit}</td>
                  <td className="p-3 text-center font-medium text-teal-700">{amt}</td>
                  <td className="p-3 text-center text-slate-500">{google}</td>
                  <td className="p-3 text-center text-slate-500">{dolm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Pilot-Ablauf */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">So läuft der Pilot ab</h2>
        <div className="space-y-3">
          {PILOT_STEPS.map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold shrink-0">
                {s.step}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3">
                  <p className="font-semibold">{s.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {s.duration}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Preise */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Preise nach dem Pilot</h2>
        <div className="grid grid-cols-3 gap-4">
          {PRICING.map((plan) => (
            <Card
              key={plan.name}
              className={`p-5 space-y-4 ${plan.highlight ? 'border-teal-500 border-2 shadow-md' : ''}`}
            >
              {plan.highlight && (
                <div className="text-xs font-semibold text-teal-700 bg-teal-50 rounded-full px-3 py-1 text-center -mt-1">
                  Empfohlen
                </div>
              )}
              <div>
                <p className="font-bold text-lg">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold">{plan.price} €</span>
                  <span className="text-sm text-muted-foreground">/ {plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Alle Preise zzgl. MwSt. · EVB-IT Systemvertrag auf Anfrage · Rahmenvertrag für mehrere Behörden möglich
        </p>
      </section>

      {/* Referenzen / Trust */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Vertrauen und Compliance</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Shield, title: 'DSGVO Art. 9', desc: 'Besondere Kategorien — keine Datenspeicherung' },
            { icon: Shield, title: 'BSI-Grundschutz', desc: 'Offline-Architektur entspricht BSI IT-Grundschutz' },
            { icon: FileText, title: 'EVB-IT Vertrag', desc: 'Vergabekonformer Systemvertrag verfügbar' },
            { icon: Building2, title: 'Pilotbehörden', desc: 'Ausländerbehörde Rostock — Pilotstart April 2026' },
          ].map((t) => (
            <Card key={t.title} className="p-4 flex gap-3">
              <t.icon className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Kontakt */}
      <Card className="p-6 bg-teal-50 border-teal-200 space-y-4">
        <h2 className="text-xl font-bold text-teal-900">Interesse? Wir melden uns innerhalb von 24h.</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-teal-800">
            <Mail className="h-4 w-4" />
            <a href="mailto:pilot@amttranslator.de" className="underline">
              pilot@amttranslator.de
            </a>
          </div>
          <div className="flex items-center gap-2 text-teal-800">
            <Phone className="h-4 w-4" />
            <span>+49 (0) [Nummer]</span>
          </div>
        </div>
        <Button
          className="w-full bg-teal-700 hover:bg-teal-800"
          onClick={() => navigate('/standalone')}
        >
          App jetzt ausprobieren →
        </Button>
      </Card>
    </div>
  )
}
