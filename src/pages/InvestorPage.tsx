// InvestorPage — Investor-focused page with market size, business model, financials, team
// Route: /investors
// Updated: März 2026 — FitTutto World Multi-Sektor-Plattform (4 Säulen, 7 Apps, €156K Förderung)

import { Link } from 'react-router-dom'
import {
  ArrowRight, TrendingUp, Users, Globe2, ChevronRight, Shield,
  Target, DollarSign, Layers, Zap, Clock, Building, Star,
  BarChart3, Rocket, Award, Check, Smartphone, Wifi,
  Bluetooth, Lock, FileText, MapPin, Heart, Landmark, Mic2,
  BadgeCheck, Euro, Calendar, AlertCircle
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function InvestorPage() {
  return (
    <div className="relative max-w-4xl mx-auto space-y-16 py-8 px-4 text-white">
      {/* Page Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.30]" />
      </div>

      {/* Hero */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-95" />
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Investor Relations · März 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Sprache darf keine Mauer sein.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            FitTutto World ist die erste KI-Übersetzungsplattform für Behörden, Gesundheitswesen,
            Museen und Konferenzen — offline-first, DSGVO-konform, auf einem einzigen Gerät.
          </p>
          <p className="text-sm font-medium text-white/90 drop-shadow">
            4 Märkte · 7 Apps deployed · Production-Ready · €156K Förderpotenzial gesichert
          </p>
        </div>
      </div>

      {/* Key metrics — aktualisiert */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: '4', label: 'Zielmärkte (Säulen)', icon: Layers },
          { value: '40+', label: 'Sprachen inkl. RTL', icon: Globe2 },
          { value: '7', label: 'Apps deployed', icon: Smartphone },
          { value: '85%', label: 'Bruttomarge (Ziel)', icon: TrendingUp },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="text-center p-4 rounded-lg bg-black/30 backdrop-blur-sm space-y-1">
              <Icon className="w-5 h-5 text-sky-300 mx-auto" />
              <div className="text-2xl font-bold text-sky-300">{stat.value}</div>
              <div className="text-xs text-white/70">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Das Problem */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Das Problem</h2>
        <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
          <p className="text-center text-lg font-medium mb-6">
            Sprachbarrieren kosten Deutschland jährlich Milliarden — in Behörden, Kliniken, Museen und auf Konferenzen.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                problem: 'Behörde: Sachbearbeiter versteht Antragsteller nicht',
                affected: '18.000 Behörden in Deutschland',
                today: 'Dolmetscher (80–120 EUR/h) — nicht verfügbar, nicht skalierbar, DSGVO-kritisch'
              },
              {
                problem: 'Klinik: Arzt kann Symptome nicht erfragen',
                affected: '2.000+ Krankenhäuser, 100.000+ Praxen',
                today: 'Keine Lösung — Behandlungsfehler durch Sprachbarrieren dokumentiert'
              },
              {
                problem: 'Museum: Besucher versteht Führung nicht',
                affected: '6.500 Museen in Deutschland',
                today: 'Audio-Guide (3–5 Sprachen) — teuer, starr, keine Interaktion'
              },
              {
                problem: 'Konferenz: Nur 3 Sprachen verfügbar',
                affected: '30.000 int. Konferenzen/Jahr',
                today: 'Simultan-Dolmetscher — 10.000+ EUR/Tag, nur 3–4 Sprachen'
              },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-background space-y-1">
                <p className="font-semibold text-sm">{item.problem}</p>
                <p className="text-xs text-sky-300">{item.affected}</p>
                <p className="text-xs text-white/70">{item.today}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 border-primary/30 text-center bg-black/30 backdrop-blur-sm border-white/10">
          <p className="font-semibold">Der blinde Fleck aller Wettbewerber:</p>
          <p className="text-sm text-white/70 mt-2">
            Google Translate, DeepL, Lingomatch, Govocal — sie alle benötigen Internet und ein zweites Gerät.
            FitTutto World übersetzt offline, auf einem einzigen Tablet, bidirektional und DSGVO-konform.
            Kein Wettbewerber bietet alle drei Eigenschaften gleichzeitig.
          </p>
        </Card>
      </div>

      {/* Die 4 Säulen */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Die 4 Säulen — FitTutto World</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Landmark,
              name: 'AmtTranslator',
              subtitle: 'Behörden & Ämter',
              market: '€2,1 Mrd DACH-Markt',
              apps: 'Clerk App + Visitor App',
              price: 'Ab 99 EUR/Monat pro Behörde',
              status: 'Production · Pilot-Briefe versandbereit',
              color: 'text-blue-300',
            },
            {
              icon: Heart,
              name: 'MedTranslator',
              subtitle: 'Gesundheitswesen',
              market: '€4,8 Mrd DACH-Markt',
              apps: 'Staff App + Patient App',
              price: 'Ab 149 EUR/Monat pro Einrichtung',
              status: 'Production · Klinik-Piloten geplant',
              color: 'text-red-300',
            },
            {
              icon: Star,
              name: 'ArtGuide',
              subtitle: 'Museen & Kultureinrichtungen',
              market: '€800 Mio DACH-Markt',
              apps: 'Portal + Visitor App',
              price: 'Ab 39,90 EUR/Monat',
              status: 'Production · Live deployed',
              color: 'text-amber-300',
            },
            {
              icon: Mic2,
              name: 'EventTranslator',
              subtitle: 'Konferenzen & Events',
              market: '€2,4 Mrd DACH-Markt',
              apps: 'Speaker App + Listener App',
              price: 'Ab 199 EUR/Event',
              status: 'Production · White-Label ready',
              color: 'text-green-300',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Card key={i} className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${item.color} shrink-0`} />
                  <div>
                    <p className={`font-bold text-base ${item.color}`}>{item.name}</p>
                    <p className="text-xs text-white/70">{item.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/60">Markt (DACH)</span>
                    <span className="font-medium">{item.market}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Apps</span>
                    <span>{item.apps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Einstiegspreis</span>
                    <span>{item.price}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Check className="w-3 h-3 text-green-400 shrink-0" />
                    <span className="text-green-300">{item.status}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Die Lösung: 3 USPs */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">3 USPs — kein Wettbewerber hat alle drei</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Wifi,
              title: 'Offline-First',
              desc: 'Übersetzung ohne Internet — Opus-MT + Whisper WASM on-device. Kein Cloud-Zwang, kein Datenschutzproblem.',
              vs: 'DeepL, Google, Lingomatch: alle cloud-only',
            },
            {
              icon: Smartphone,
              title: 'Ein Gerät, zwei Seiten',
              desc: 'Bidirektionale Übersetzung auf einem einzigen Tablet — 180°-Ansicht. Kein zweites Gerät, keine App beim Gegenüber.',
              vs: 'Pocketalk: teures Hardwaregerät. Govocal: zwei Geräte nötig',
            },
            {
              icon: Shield,
              title: 'DSGVO + BSI-konform',
              desc: 'Keine Daten verlassen das Gerät. BITV 2.0, Art. 9 DSGVO, BSI-Grundschutz. EVB-IT Vertragsvorlagen vorhanden.',
              vs: 'Kein Wettbewerber hat öffentliche Compliance-Dokumentation',
            },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Card key={i} className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-6 h-6 text-sky-300" />
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-xs text-white/70">{item.desc}</p>
                <p className="text-xs text-white/40 italic border-t border-white/10 pt-2">{item.vs}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Marktgröße — aktualisiert */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Marktgröße (TAM / SAM / SOM)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-2 text-center bg-black/30 backdrop-blur-sm border-white/10">
            <p className="text-xs font-medium text-white/70">TAM</p>
            <p className="text-3xl font-bold text-sky-300">€65 Mrd</p>
            <p className="text-xs text-white/70">Globaler Übersetzungsmarkt (2025)</p>
            <p className="text-xs text-white/70">Davon maschinell: €8 Mrd</p>
            <p className="text-xs text-sky-300 font-medium">15% CAGR bis 2030</p>
          </Card>
          <Card className="p-5 space-y-2 text-center bg-black/30 backdrop-blur-sm border-white/10">
            <p className="text-xs font-medium text-white/70">SAM (DACH, 4 Säulen)</p>
            <p className="text-3xl font-bold text-sky-300">€10,1 Mrd</p>
            <p className="text-xs text-white/70">Behörden: €2,1 Mrd</p>
            <p className="text-xs text-white/70">Healthcare: €4,8 Mrd</p>
            <p className="text-xs text-white/70">Events: €2,4 Mrd · Museen: €0,8 Mrd</p>
          </Card>
          <Card className="p-5 space-y-2 text-center bg-black/30 backdrop-blur-sm border-white/10">
            <p className="text-xs font-medium text-white/70">SOM (3 Jahre)</p>
            <p className="text-3xl font-bold text-sky-300">€2,34 Mio</p>
            <p className="text-xs text-white/70">ARR-Ziel Monat 36</p>
            <p className="text-xs text-white/70">Break-even: Monat 10</p>
            <p className="text-xs text-sky-300 font-medium">MRR Monat 36: €50.000+</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <h3 className="font-semibold text-sm sm:col-span-2">Markttreiber</h3>
          {[
            { title: 'Migration & Integration', desc: '110 Mio Geflüchtete weltweit (UNHCR 2025). EU-Aufnahmerichtlinie fordert Kommunikation in Muttersprache. 18.000 Behörden in Deutschland ohne skalierbare Lösung.' },
            { title: 'Digitalisierungspflicht', desc: 'OZG-Umsetzung, E-Government-Gesetz, Onlinezugangsgesetz — Behörden müssen digitalisieren. Förderprogramme (BAFA, KfW, ZIM) zahlen bis zu 80%.' },
            { title: 'KI-Disruption On-Device', desc: 'ML-Modelle werden kleiner, schneller, besser — On-Device Inferenz wird Standard. Whisper WASM läuft heute im Browser ohne Server.' },
            { title: 'DSGVO als Markteintrittsbarriere', desc: 'Cloud-basierte Wettbewerber scheitern an Art. 9 DSGVO (Gesundheitsdaten). Unser Offline-Ansatz ist der einzige compliance-sichere Weg.' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-black/30 backdrop-blur-sm">
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-white/70 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Förderportfolio — NEU */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Förderportfolio — €156.000 gesichert</h2>
        <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
          <p className="text-sm text-white/70 mb-4 text-center">
            Öffentliche Förderung reduziert den Eigenkapitalbedarf auf netto €16.000 für die ersten 12 Monate.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 font-semibold text-white/70">Programm</th>
                  <th className="text-right py-2 font-semibold text-white/70">Betrag</th>
                  <th className="text-right py-2 font-semibold text-white/70">Quote</th>
                  <th className="text-right py-2 font-semibold text-white/70">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'BAFA Unternehmensberatung', amount: '4.000 EUR', quota: '50%', status: '🟡 Antrag diese Woche' },
                  { name: 'BAFA Außenwirtschaft (Messe)', amount: '7.500 EUR', quota: '50%', status: '🟡 Antrag diese Woche' },
                  { name: 'KfW StartGeld', amount: '25.000 EUR', quota: 'Darlehen', status: '🟡 Beratung buchen' },
                  { name: 'ZIM (Zentrales Innovationsprogramm)', amount: '100.000 EUR', quota: '45%', status: '🟡 Projektskizze Q2' },
                  { name: 'Digitalbonus Bayern/MV', amount: '10.000 EUR', quota: '50%', status: '🟡 Antrag Q2' },
                  { name: 'EU Digital Europe Programme', amount: '9.500 EUR', quota: 'variabel', status: '🔵 Recherche läuft' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-right font-medium text-sky-300">{row.amount}</td>
                    <td className="py-2 text-right text-white/70">{row.quota}</td>
                    <td className="py-2 text-right">{row.status}</td>
                  </tr>
                ))}
                <tr className="border-t border-white/20">
                  <td className="py-2 font-bold">Gesamt</td>
                  <td className="py-2 text-right font-bold text-sky-300">156.000 EUR</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Geschäftsmodell & Preise */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Geschäftsmodell: B2B SaaS + Pilotprogramme</h2>
        <p className="text-center text-sm text-white/70">
          Einstieg über kostenlose 3-Monats-Piloten → Conversion zu Jahresverträgen → Rahmenverträge mit Trägern
        </p>

        <div className="space-y-3">
          {[
            {
              segment: 'Behörden',
              plans: 'Pilot (0 EUR, 3 Mo) → 99–249 EUR/Mo',
              target: 'Ausländerbehörden, Jobcenter, Sozialämter',
              arpu: '~150 EUR/Mo',
              color: 'text-blue-300',
            },
            {
              segment: 'Healthcare',
              plans: 'Pilot (0 EUR, 3 Mo) → 149–499 EUR/Mo',
              target: 'Krankenhäuser, MVZ, Notaufnahmen',
              arpu: '~300 EUR/Mo',
              color: 'text-red-300',
            },
            {
              segment: 'Museen',
              plans: 'Basic (39,90 EUR) · Pro (79,90 EUR/Mo)',
              target: 'Stadtmuseen, Kunsthallen, Gedenkstätten',
              arpu: '~60 EUR/Mo',
              color: 'text-amber-300',
            },
            {
              segment: 'Events',
              plans: 'Basic (199 EUR) · Pro (499 EUR/Event)',
              target: 'Konferenzen, Messen, Hochschulen',
              arpu: '~350 EUR/Event',
              color: 'text-green-300',
            },
            {
              segment: 'White-Label',
              plans: 'Ab 2.000 EUR Setup + 500 EUR/Mo',
              target: 'Städte, Landkreise, Klinikverbünde',
              arpu: '~1.500 EUR/Mo',
              color: 'text-purple-300',
            },
          ].map((seg, i) => (
            <Card key={i} className="p-4 flex flex-col sm:flex-row gap-2 sm:items-center bg-black/30 backdrop-blur-sm border-white/10">
              <div className={`sm:w-1/6 font-bold text-sm ${seg.color}`}>{seg.segment}</div>
              <div className="sm:w-2/6 text-xs">{seg.plans}</div>
              <div className="sm:w-2/6 text-xs text-white/70">{seg.target}</div>
              <div className="sm:w-1/6 text-xs text-right font-medium">ARPU: {seg.arpu}</div>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-white/70">
          Jahresverträge = 2 Monate gratis (17% Rabatt) · Rahmenverträge mit Trägern ab 10 Standorten
        </p>
      </div>

      {/* Unit Economics */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Unit Economics (Ziel Jahr 2)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
            <h3 className="font-semibold flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-300" />
              B2G (Behörden / Healthcare)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/70">CAC (Pilot-Modell)</span><span className="font-medium">200 EUR</span></div>
              <div className="flex justify-between"><span className="text-white/70">LTV (36 Mo)</span><span className="font-medium">5.400 EUR</span></div>
              <div className="flex justify-between"><span className="text-white/70">LTV/CAC</span><span className="font-medium text-sky-300">27x</span></div>
              <div className="flex justify-between"><span className="text-white/70">Payback</span><span className="font-medium">1,3 Monate</span></div>
            </div>
          </Card>
          <Card className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
            <h3 className="font-semibold flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-300" />
              B2B (Museen / Events)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/70">CAC</span><span className="font-medium">800 EUR</span></div>
              <div className="flex justify-between"><span className="text-white/70">LTV (24 Mo)</span><span className="font-medium">3.576 EUR</span></div>
              <div className="flex justify-between"><span className="text-white/70">LTV/CAC</span><span className="font-medium text-sky-300">4,5x</span></div>
              <div className="flex justify-between"><span className="text-white/70">Payback</span><span className="font-medium">5,4 Monate</span></div>
            </div>
          </Card>
        </div>
        <Card className="p-5 bg-black/30 backdrop-blur-sm border-white/10">
          <h3 className="font-semibold mb-3">Gross Margin Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Bruttomarge (SaaS-typisch)</span>
              <span className="font-bold text-sky-300">85%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: '85%' }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
              <div>API-Kosten: 8%</div>
              <div>Infrastruktur: 4%</div>
              <div>Support: 3%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3-Jahres-Projektion — aktualisiert */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">3-Jahres-Projektion</h2>
        <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 font-semibold"></th>
                  <th className="text-right py-2 font-semibold">Monat 6</th>
                  <th className="text-right py-2 font-semibold">Monat 12</th>
                  <th className="text-right py-2 font-semibold">Monat 24</th>
                  <th className="text-right py-2 font-semibold text-sky-300">Monat 36</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Behörden-Kunden', m6: '5', m12: '25', m24: '120', m36: '350' },
                  { label: 'Healthcare-Kunden', m6: '3', m12: '15', m24: '80', m36: '250' },
                  { label: 'Museen / Events', m6: '10', m12: '50', m24: '200', m36: '500' },
                  { label: 'MRR', m6: '2.500 EUR', m12: '12.000 EUR', m24: '95.000 EUR', m36: '195.000 EUR' },
                  { label: 'ARR', m6: '30K EUR', m12: '144K EUR', m24: '1,14M EUR', m36: '2,34M EUR' },
                  { label: 'Break-even', m6: '–', m12: 'Monat 10', m24: 'erreicht', m36: 'profitabel' },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-white/5 last:border-0 ${row.label === 'ARR' ? 'font-bold' : ''}`}>
                    <td className="py-2 text-white/70">{row.label}</td>
                    <td className="py-2 text-right">{row.m6}</td>
                    <td className="py-2 text-right">{row.m12}</td>
                    <td className="py-2 text-right">{row.m24}</td>
                    <td className="py-2 text-right text-sky-300">{row.m36}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Go-to-Market — aktualisiert */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Go-to-Market Strategie</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              phase: 'Phase 1',
              period: 'Monat 1–6',
              title: 'Pilot & Referenz',
              items: [
                '2 Behörden-Piloten (Rostock + Schwerin)',
                '2 Klinik-Piloten (Diakonie + UKR)',
                'BAFA-Anträge gestellt',
                'Erste 5 zahlende Kunden',
                '30K EUR ARR',
              ],
            },
            {
              phase: 'Phase 2',
              period: 'Monat 6–18',
              title: 'Skalierung DACH',
              items: [
                'ZIM-Förderung bewilligt',
                '25 Behörden, 15 Kliniken',
                'IMEX Frankfurt (Messe)',
                'Rahmenvertrag Landkreis',
                '144K EUR ARR',
              ],
            },
            {
              phase: 'Phase 3',
              period: 'Monat 18–36',
              title: 'Expansion & White-Label',
              items: [
                'Österreich + Schweiz',
                'White-Label für Klinikverbünde',
                'API/SDK für Drittanbieter',
                'Series A vorbereiten',
                '2,34M EUR ARR',
              ],
            },
          ].map((phase, i) => (
            <Card key={i} className="p-5 space-y-3 bg-black/30 backdrop-blur-sm border-white/10">
              <div>
                <span className="text-xs font-mono text-sky-300">{phase.phase} · {phase.period}</span>
                <h3 className="font-bold text-lg">{phase.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {phase.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-white/70">
                    <Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Technologie-Status — aktualisiert */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Technologie-Status (März 2026)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'AmtTranslator (Clerk + Visitor App)', status: 'Production · deployed', ok: true },
            { label: 'MedTranslator (Staff + Patient App)', status: 'Production · deployed', ok: true },
            { label: 'ArtGuide Portal + Visitor App', status: 'Production · deployed', ok: true },
            { label: 'EventTranslator (Speaker + Listener)', status: 'Production · deployed', ok: true },
            { label: 'Offline-Engine (Opus-MT + Whisper WASM)', status: 'Production · 54 Sprachpaare', ok: true },
            { label: 'BLE GATT Transport (Android + iOS)', status: 'Production', ok: true },
            { label: '40+ Sprachen inkl. RTL (AR, FA, UR)', status: 'Production', ok: true },
            { label: 'E2E-Verschlüsselung (AES-256-GCM)', status: 'Production', ok: true },
            { label: 'DSGVO Art. 9 / BSI-Grundschutz', status: 'Dokumentiert · DSFA-Template fertig', ok: true },
            { label: 'BITV 2.0 / WCAG 2.1 AA', status: 'Audit-Template fertig', ok: true },
            { label: 'EVB-IT Vertragsvorlagen', status: 'Fertig · 3 Varianten', ok: true },
            { label: 'Ausschreibungs-Monitor (DTVP, evergabe)', status: 'Production · live', ok: true },
            { label: 'HD-TTS (Neural2 + Chirp 3 HD)', status: 'Production', ok: true },
            { label: 'Supabase Edge Functions (AI + TTS)', status: 'Production · 4 Functions', ok: true },
            { label: 'Android App (Google Play)', status: 'Beta · Play Ready', ok: true },
            { label: 'iOS App Store', status: 'Roadmap Q3 2026', ok: false },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded text-xs">
              <Check className={`w-3 h-3 mt-0.5 shrink-0 ${item.ok ? 'text-green-500' : 'text-white/30'}`} />
              <div>
                <span className="font-medium">{item.label}</span>
                <span className="text-white/50"> — {item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wettbewerbsvorteile */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Wettbewerbsvorteile & IP</h2>
        <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
          <h3 className="font-semibold mb-4">Patentfähige Innovationen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: '4-Tier Auto-Fallback Transport', time: '3–4 Monate Nachahmung' },
              { name: 'BLE GATT Translation Protocol', time: '6–12 Monate Nachahmung' },
              { name: 'Bidirektional 180°-Single-Device', time: '2–3 Monate Nachahmung' },
              { name: 'Hybrid ML Pipeline (On-Device + Cloud)', time: '4–6 Monate Nachahmung' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded bg-black/30 backdrop-blur-sm">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-xs text-white/70">{item.time}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-sky-300 font-medium mt-4 text-center">
            Gesamt-Nachahmungsaufwand: 12–18 Monate
          </p>
        </Card>

        {/* Wettbewerbsvergleich kompakt */}
        <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
          <h3 className="font-semibold mb-4">Wettbewerbsvergleich (Behörden-Markt)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2">Anbieter</th>
                  <th className="text-center py-2">Offline</th>
                  <th className="text-center py-2">1 Gerät</th>
                  <th className="text-center py-2">DSGVO Art.9</th>
                  <th className="text-center py-2">Behörden-Fokus</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'FitTutto World', offline: '✅', oneDevice: '✅', dsgvo: '✅', focus: '✅' },
                  { name: 'Govocal', offline: '❌', oneDevice: '❌', dsgvo: '⚠️', focus: '✅' },
                  { name: 'Lingomatch', offline: '❌', oneDevice: '❌', dsgvo: '⚠️', focus: '⚠️' },
                  { name: 'Pocketalk', offline: '⚠️', oneDevice: '✅', dsgvo: '❌', focus: '❌' },
                  { name: 'DeepL / Google', offline: '❌', oneDevice: '❌', dsgvo: '❌', focus: '❌' },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-white/5 last:border-0 ${i === 0 ? 'font-bold text-sky-300' : ''}`}>
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-center">{row.offline}</td>
                    <td className="py-2 text-center">{row.oneDevice}</td>
                    <td className="py-2 text-center">{row.dsgvo}</td>
                    <td className="py-2 text-center">{row.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Team */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <h3 className="font-semibold">Gründer & CEO</h3>
            <p className="text-sm font-medium">Alexander Deibel</p>
            <p className="text-xs text-white/70">fintutto ug (haftungsbeschränkt) · Fintutto-Ecosystem</p>
            <p className="text-xs text-white/70">7 Production-Apps in unter 6 Monaten gebaut und deployed</p>
            <p className="text-xs text-white/70">Full-Stack: React, TypeScript, Supabase, Edge Functions, PWA, BLE</p>
          </Card>
          <Card className="p-5 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <h3 className="font-semibold">Fintutto Ecosystem</h3>
            <ul className="space-y-1 text-xs text-white/70">
              <li>• AmtTranslator — Behörden-Übersetzung (Hauptprodukt)</li>
              <li>• MedTranslator — Healthcare-Übersetzung</li>
              <li>• ArtGuide — Museum & Kulturführer</li>
              <li>• EventTranslator — Konferenzen & Messen</li>
              <li>• Vermietify — Vermietungssoftware</li>
              <li>• BescheidBoxer — Dokumentenmanagement</li>
            </ul>
          </Card>
        </div>
        <Card className="p-5 bg-black/30 backdrop-blur-sm border-white/10">
          <h3 className="font-semibold mb-3">Einstellungsplan (mit Finanzierung)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { role: 'CTO', month: 'Mo 1', salary: '90–110K' },
              { role: 'Sales Lead', month: 'Mo 2', salary: '70–90K' },
              { role: 'Mobile Dev', month: 'Mo 3', salary: '70–85K' },
              { role: 'Customer Success', month: 'Mo 6', salary: '50–60K' },
              { role: 'Marketing', month: 'Mo 9', salary: '55–70K' },
            ].map((item, i) => (
              <div key={i} className="text-center p-2 rounded bg-black/30 backdrop-blur-sm">
                <p className="font-medium text-xs">{item.role}</p>
                <p className="text-xs text-sky-300">{item.month}</p>
                <p className="text-xs text-white/70">{item.salary} EUR</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Ask — aktualisiert */}
      <Card className="p-8 border-primary text-center space-y-4 bg-black/30 backdrop-blur-sm border-white/10">
        <h2 className="text-2xl font-bold drop-shadow-lg">Seed-Runde: 750.000 EUR</h2>
        <p className="text-sm text-white/70">Pre-Money Bewertung: 3 Mio EUR (verhandelbar) · Netto-Eigenkapitalbedarf: 16.000 EUR (nach Förderung)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
          <div>
            <h3 className="font-semibold text-sm mb-2">Was wir bieten:</h3>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />7 Production-Apps, alle deployed</li>
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />4 Märkte mit €10,1 Mrd SAM</li>
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />€156K Förderpotenzial identifiziert</li>
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />DSGVO + BSI + BITV 2.0 konform</li>
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />Pilot-Briefe & EVB-IT Verträge fertig</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Use of Funds:</h3>
            <ul className="space-y-1.5 text-xs text-white/70">
              <li>Team (65%): 487.500 EUR</li>
              <li>Produkt (15%): 112.500 EUR</li>
              <li>Go-to-Market (15%): 112.500 EUR</li>
              <li>Reserve (5%): 37.500 EUR</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { milestone: 'Erster Pilot-Kunde', time: 'Monat 1' },
              { milestone: '5 zahlende Kunden', time: 'Monat 3' },
              { milestone: 'Break-even', time: 'Monat 10' },
              { milestone: '2,34M EUR ARR', time: 'Monat 36' },
            ].map((m, i) => (
              <div key={i} className="p-2 rounded bg-black/30 backdrop-blur-sm">
                <p className="text-xs font-medium">{m.milestone}</p>
                <p className="text-xs text-sky-300">{m.time}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/70">
            Series A (~3M EUR) geplant bei 150K+ EUR ARR, 25+ Behörden-Kunden, &lt;3% monatliche Churn
          </p>
        </div>
      </Card>

      {/* Kontakt */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold drop-shadow-lg">Kontakt</h2>
        <div className="space-y-1">
          <p className="font-semibold">fintutto ug (haftungsbeschränkt)</p>
          <p className="text-sm text-white/70">Alexander Deibel · Geschäftsführer</p>
          <p className="text-sm text-white/70">info@guidetranslator.com</p>
          <p className="text-sm text-white/70">Kolonie 2, 18317 Saal, Deutschland</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/compare">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
              Wettbewerbervergleich
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/technology">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-white/30 text-white hover:bg-white/10">
              Technische Architektur
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Alle Pläne & Preise
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-white/70 pb-4">
        Stand: März 2026 · FitTutto World v4.0 · Vertraulich
      </p>
    </div>
  )
}
