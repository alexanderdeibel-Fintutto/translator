// InvestorPage — Investor-focused page with market size, business model, financials, team
// Route: /investors

import { Link } from 'react-router-dom'
import {
  ArrowRight, TrendingUp, Users, Globe2, ChevronRight, Shield,
  Target, DollarSign, Layers, Zap, Clock, Building, Star,
  BarChart3, Rocket, Award, Check, Smartphone, Wifi,
  Bluetooth, Lock, FileText, MapPin
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function InvestorPage() {
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
            Investor Relations
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Sprache darf keine Mauer sein.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            GuideTranslator ist die weltweit erste Übersetzungsplattform, die auch ohne Internet funktioniert —
            per Bluetooth, WiFi-Hotspot oder lokale KI-Modelle. Live, in Echtzeit, für Gruppen bis 500 Personen.
          </p>
          <p className="text-sm font-medium text-white/90 drop-shadow">
            v3.1 · Production-Ready · 87 Tests · Google Play Ready
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: '11', label: 'Tarif-Pläne', icon: Layers },
          { value: '45', label: 'Sprachen', icon: Globe2 },
          { value: '5', label: 'Zielgruppen-Segmente', icon: Target },
          { value: '85%', label: 'Bruttomarge (Ziel)', icon: TrendingUp },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="text-center p-4 rounded-lg bg-muted/50 space-y-1">
              <Icon className="w-5 h-5 text-primary mx-auto" />
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Das Problem */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Das Problem</h2>
        <Card className="p-6 bg-muted/30">
          <p className="text-center text-lg font-medium mb-6">
            1,2 Milliarden Menschen reisen jährlich international. 68% sprechen die Landessprache nicht.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { problem: 'Tourist versteht Guide nicht', affected: '600 Mio Touristen/Jahr', today: 'Audio-Guide (3-5 Sprachen) — teuer, starr, keine Interaktion' },
              { problem: 'Geflüchteter versteht Sachbearbeiter nicht', affected: '110 Mio Geflüchtete weltweit', today: 'Dolmetscher (80-120 EUR/h) — nicht verfügbar, nicht skalierbar' },
              { problem: 'Konferenz hat nur 3 Sprachen', affected: '30.000 int. Konferenzen/Jahr', today: 'Simultan-Dolmetscher — 10.000+ EUR/Tag, nur 3-4 Sprachen' },
              { problem: 'Kein Internet am touristischen Ort', affected: 'Millionen Orte weltweit', today: 'Keine Lösung — bisherige Translator-Apps versagen komplett' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-lg bg-background space-y-1">
                <p className="font-semibold text-sm">{item.problem}</p>
                <p className="text-xs text-primary">{item.affected}</p>
                <p className="text-xs text-muted-foreground">{item.today}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 border-primary/30 text-center">
          <p className="font-semibold">Der blinde Fleck aller Wettbewerber:</p>
          <p className="text-sm text-muted-foreground mt-2">
            Google Translate, DeepL, Microsoft — sie alle setzen Internet voraus.
            An den Orten, wo Übersetzung am meisten gebraucht wird, gibt es keins.
            Ruinen. Berge. Flüchtlingscamps. Boote. Schulen in ländlichen Gebieten.
          </p>
        </Card>
      </div>

      {/* Die Lösung */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Die Lösung: 4-Tier Architektur</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Globe2, tier: 'Tier 1: Cloud', desc: 'Supabase Realtime — globale Reichweite, <1s Latenz' },
            { icon: Wifi, tier: 'Tier 2: Hotspot', desc: 'Eigenes WLAN + Embedded Relay — kein Internet nötig' },
            { icon: Bluetooth, tier: 'Tier 3: BLE', desc: 'Bluetooth GATT — null Infrastruktur, überall' },
            { icon: Smartphone, tier: 'Tier 4: Offline', desc: 'Opus-MT + Whisper WASM — komplett lokal' },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <Card key={i} className="p-4 flex items-start gap-3">
                <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{item.tier}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Card>
            )
          })}
        </div>
        <div className="text-center">
          <Link to="/technology">
            <Button variant="link" className="gap-1">
              Technische Architektur im Detail <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 7 Produkte */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">7 Kernprodukte in einer App</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Text-Übersetzer', desc: '45 Sprachen, 6-Provider-Kaskade, 6 Kontextmodi' },
            { name: 'Live-Broadcasting', desc: '1→N Echtzeit-Broadcast, QR-Join, Untertitel-Modus' },
            { name: 'Gesprächsmodus', desc: 'Split-Screen, 180-Grad, Auto-Speak für 2 Personen' },
            { name: 'Kamera-OCR', desc: 'Foto → Text → Übersetzung (Google Vision)' },
            { name: 'Phrasebook', desc: '18 Kategorien, 4 Packs, 16 Zielsprachen' },
            { name: 'Offline-Engine', desc: '54 Sprachpaare, Opus-MT + Whisper WASM' },
            { name: 'BLE-Transport', desc: 'Custom GATT Protocol, Bluetooth-only' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
              <span className="text-xs font-mono text-primary shrink-0 mt-0.5">{i + 1}.</span>
              <div>
                <span className="font-medium text-sm">{item.name}</span>
                <span className="text-xs text-muted-foreground"> — {item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marktgröße */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Marktgröße (TAM / SAM / SOM)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-2 text-center">
            <p className="text-xs font-medium text-muted-foreground">TAM</p>
            <p className="text-3xl font-bold text-primary">$65 Mrd</p>
            <p className="text-xs text-muted-foreground">Globaler Übersetzungsmarkt (2025)</p>
            <p className="text-xs text-muted-foreground">Davon maschinell: $8 Mrd</p>
            <p className="text-xs text-primary font-medium">15% CAGR bis 2030</p>
          </Card>
          <Card className="p-5 space-y-2 text-center">
            <p className="text-xs font-medium text-muted-foreground">SAM</p>
            <p className="text-3xl font-bold text-primary">$4,4 Mrd</p>
            <p className="text-xs text-muted-foreground">Live-Übersetzung: $2,4 Mrd</p>
            <p className="text-xs text-muted-foreground">Behörden/NGO: $1,2 Mrd</p>
            <p className="text-xs text-muted-foreground">Tourismus: $0,8 Mrd</p>
          </Card>
          <Card className="p-5 space-y-2 text-center">
            <p className="text-xs font-medium text-muted-foreground">SOM (3 Jahre)</p>
            <p className="text-3xl font-bold text-primary">$12 Mio</p>
            <p className="text-xs text-muted-foreground">ARR-Ziel in 3 Jahren</p>
            <p className="text-xs text-muted-foreground">DACH-Region zuerst: $180 Mio</p>
            <p className="text-xs text-primary font-medium">Bei 5.000 zahlenden Kunden</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <h3 className="font-semibold text-sm sm:col-span-2">Markttreiber</h3>
          {[
            { title: 'Migration', desc: '110 Mio Geflüchtete weltweit (UNHCR 2025), steigend. EU-Aufnahmerichtlinie fordert Kommunikation in Muttersprache.' },
            { title: 'Tourismus-Rebound', desc: '+15% internationaler Tourismus post-COVID. Asiatische Märkte wachsen am schnellsten.' },
            { title: 'KI-Disruption', desc: 'ML-Modelle werden kleiner, schneller, besser — On-Device Inferenz wird Standard.' },
            { title: 'PWA-Akzeptanz', desc: 'Progressive Web Apps sind etabliert. Kein App-Store-Download = niedrigste Einstiegshürde.' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30">
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Geschäftsmodell & Preise */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Geschäftsmodell: Freemium + B2B SaaS</h2>
        <p className="text-center text-muted-foreground">
          11 Pläne in 5 Segmenten — von 0 EUR (Free) bis 19.990 EUR/Monat (Cruise Armada Enterprise)
        </p>

        <div className="space-y-3">
          {[
            { segment: 'Personal', plans: 'Free (0 EUR) · Personal Pro (4,99 EUR/Mo)', target: 'Reisende, Expats, Alltag', arpu: '~2,50 EUR' },
            { segment: 'Guide', plans: 'Basic (19,90 EUR) · Pro (39,90 EUR/Mo)', target: 'Freelance-Guides, Museumsführer', arpu: '~30 EUR' },
            { segment: 'Agentur', plans: 'Standard (99 EUR) · Premium (249 EUR/Mo)', target: 'Reiseagenturen, Tourismusverbände', arpu: '~175 EUR' },
            { segment: 'Event', plans: 'Basic (199 EUR) · Pro (499 EUR/Mo)', target: 'Konferenzen, Messen, Hochschulen', arpu: '~350 EUR' },
            { segment: 'Cruise', plans: 'Starter (1.990 EUR) · Fleet (6.990 EUR) · Armada (19.990 EUR/Mo)', target: 'Reedereien, Kreuzfahrt-Flotten', arpu: '~10.000 EUR' },
          ].map((seg, i) => (
            <Card key={i} className="p-4 flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="sm:w-1/6 font-bold text-sm text-primary">{seg.segment}</div>
              <div className="sm:w-2/6 text-xs">{seg.plans}</div>
              <div className="sm:w-2/6 text-xs text-muted-foreground">{seg.target}</div>
              <div className="sm:w-1/6 text-xs text-right font-medium">ARPU: {seg.arpu}</div>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Jährlich zahlen = 2 Monate gratis (17% Rabatt) · Overage-Abrechnung pro Minute
        </p>
      </div>

      {/* Unit Economics */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Unit Economics (Ziel Jahr 2)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              B2C (Personal)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">CAC</span><span className="font-medium">15 EUR</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">LTV (12 Mo)</span><span className="font-medium">60 EUR</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">LTV/CAC</span><span className="font-medium text-primary">4x</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payback</span><span className="font-medium">3 Monate</span></div>
            </div>
          </Card>
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Building className="w-4 h-4 text-primary" />
              B2B (Guide/Agentur/Event)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">CAC</span><span className="font-medium">800 EUR</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">LTV (24 Mo)</span><span className="font-medium">3.576 EUR</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">LTV/CAC</span><span className="font-medium text-primary">4,5x</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payback</span><span className="font-medium">5,4 Monate</span></div>
            </div>
          </Card>
        </div>
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Gross Margin Breakdown</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Bruttomarge (SaaS-typisch)</span>
              <span className="font-bold text-primary">85%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: '85%' }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>API-Kosten: 8%</div>
              <div>Infrastruktur: 4%</div>
              <div>Support: 3%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 3-Jahres-Projektion */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">3-Jahres-Projektion</h2>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold"></th>
                  <th className="text-right py-2 font-semibold">Jahr 1</th>
                  <th className="text-right py-2 font-semibold">Jahr 2</th>
                  <th className="text-right py-2 font-semibold text-primary">Jahr 3</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Free-Nutzer', y1: '10.000', y2: '50.000', y3: '200.000' },
                  { label: 'Pro-Nutzer (B2C)', y1: '500', y2: '2.000', y3: '10.000' },
                  { label: 'B2B-Kunden', y1: '100', y2: '500', y3: '2.000' },
                  { label: 'Events', y1: '20', y2: '100', y3: '400' },
                  { label: 'MRR (Ende)', y1: '12,5K EUR', y2: '210K EUR', y3: '1,0M EUR' },
                  { label: 'ARR', y1: '150K EUR', y2: '2,5M EUR', y3: '12,0M EUR' },
                  { label: 'Free→Paid Conversion', y1: '5%', y2: '8%', y3: '12%' },
                  { label: 'Monatliche Churn', y1: '5%', y2: '3%', y3: '2%' },
                ].map((row, i) => (
                  <tr key={i} className={`border-b last:border-0 ${row.label === 'ARR' ? 'font-bold' : ''}`}>
                    <td className="py-2 text-muted-foreground">{row.label}</td>
                    <td className="py-2 text-right">{row.y1}</td>
                    <td className="py-2 text-right">{row.y2}</td>
                    <td className="py-2 text-right text-primary">{row.y3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Go-to-Market */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Go-to-Market Strategie</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              phase: 'Phase 1',
              period: 'Monat 1-12',
              title: 'DACH',
              items: ['Google Play Launch', '10.000 Free-Nutzer', '50 B2B-Piloten', '100 zahlende B2B-Kunden', '150K EUR ARR'],
            },
            {
              phase: 'Phase 2',
              period: 'Monat 12-24',
              title: 'Europa',
              items: ['Lokalisierung (9 UI-Sprachen fertig)', 'EU-Förderprogramme', 'Partnerschaften mit Reiseveranstaltern', '2.000 Pro, 500 B2B', '2,5 Mio EUR ARR'],
            },
            {
              phase: 'Phase 3',
              period: 'Monat 24-36',
              title: 'Global',
              items: ['iOS App Store', 'API/SDK für Drittanbieter', 'White-Label für Großunternehmen', '10.000 Pro, 2.000 B2B', '12 Mio EUR ARR'],
            },
          ].map((phase, i) => (
            <Card key={i} className="p-5 space-y-3">
              <div>
                <span className="text-xs font-mono text-primary">{phase.phase} · {phase.period}</span>
                <h3 className="font-bold text-lg">{phase.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {phase.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Technologie-Status */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Technologie-Status (v3.1, März 2026)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'PWA Frontend (React 18 + TypeScript) — Production',
            '45 Sprachen + RTL-Unterstützung — Production',
            '6-Provider Translation Cascade — Production (87 Tests)',
            'Live-Session mit Cloud-Transport — Production',
            'Gesprächsmodus (180-Grad Split) — Production',
            'Kamera-OCR (Google Vision) — Production',
            'Phrasebook (18 Kategorien, 16 Sprachen) — Production',
            'E2E-Verschlüsselung (AES-256-GCM) — Production',
            'Offline Translation (54 Opus-MT Paare) — Production',
            'HD-TTS (Neural2 + Chirp 3 HD) — Production',
            '9 UI-Sprachen (DE, EN, FR, ES, RU, UK, AR, FA, TR) — Production',
            'BLE GATT Transport (Android + iOS) — Production',
            'Hotspot Relay Server — Production',
            'Sales CRM + Admin Dashboard — Production',
            'Stripe Billing + Tier Enforcement — Production',
            'Android App — Beta (Google Play Ready)',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded text-xs">
              <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wettbewerbsvorteile */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Wettbewerbsvorteile & IP</h2>
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Patentfähige Innovationen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: '4-Tier Auto-Fallback Transport', time: '3-4 Monate' },
              { name: 'BLE GATT Translation Protocol', time: '6-12 Monate' },
              { name: 'Embedded Relay Server', time: '3-6 Monate' },
              { name: 'Hybrid ML Pipeline', time: '2-3 Monate' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded bg-muted/30">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.time} Nachahmung</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-primary font-medium mt-4 text-center">
            Gesamt-Nachahmungsaufwand: 12-18 Monate
          </p>
        </Card>
      </div>

      {/* Team */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-2">
            <h3 className="font-semibold">Gründer & CEO</h3>
            <p className="text-sm font-medium">Alexander Deibel</p>
            <p className="text-xs text-muted-foreground">fintutto ug (haftungsbeschränkt) · Fintutto-Ecosystem</p>
            <p className="text-xs text-muted-foreground">Komplette v3.1 Codebase in weniger als 6 Monaten gebaut</p>
          </Card>
          <Card className="p-5 space-y-2">
            <h3 className="font-semibold">Fintutto Ecosystem</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• ai tour Portal — Tourismusplattform</li>
              <li>• Vermietify — Vermietungssoftware</li>
              <li>• Ablesung — Smart Metering</li>
              <li>• BescheidBoxer — Dokumentenmanagement</li>
            </ul>
          </Card>
        </div>
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Einstellungsplan (mit Finanzierung)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { role: 'CTO', month: 'Mo 1', salary: '90-110K' },
              { role: 'Sales Lead', month: 'Mo 2', salary: '70-90K' },
              { role: 'Mobile Dev', month: 'Mo 3', salary: '70-85K' },
              { role: 'Customer Success', month: 'Mo 6', salary: '50-60K' },
              { role: 'Marketing', month: 'Mo 9', salary: '55-70K' },
            ].map((item, i) => (
              <div key={i} className="text-center p-2 rounded bg-muted/30">
                <p className="font-medium text-xs">{item.role}</p>
                <p className="text-xs text-primary">{item.month}</p>
                <p className="text-xs text-muted-foreground">{item.salary} EUR</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Ask */}
      <Card className="p-8 border-primary text-center space-y-4">
        <h2 className="text-2xl font-bold">Seed-Runde: 750.000 EUR</h2>
        <p className="text-sm text-muted-foreground">Pre-Money Bewertung: 3 Mio EUR (verhandelbar)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
          <div>
            <h3 className="font-semibold text-sm mb-2">Was wir bieten:</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />Production-Ready v3.1</li>
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />87 Tests, 100% Pass Rate</li>
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />Google Play Ready</li>
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />4-Tier-Transport (patentfähig)</li>
              <li className="flex items-start gap-1.5"><Check className="w-3 h-3 text-primary mt-0.5 shrink-0" />Sales CRM + Stripe integriert</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Use of Funds:</h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
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
              { milestone: 'Play Store Launch', time: 'Monat 1' },
              { milestone: '1.000 Free-Nutzer', time: 'Monat 3' },
              { milestone: '10K EUR MRR', time: 'Monat 9' },
              { milestone: '150K EUR ARR', time: 'Monat 12' },
            ].map((m, i) => (
              <div key={i} className="p-2 rounded bg-muted/30">
                <p className="text-xs font-medium">{m.milestone}</p>
                <p className="text-xs text-primary">{m.time}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Series A (~3M EUR) geplant bei 150K+ EUR ARR, 100+ B2B-Kunden, &lt;3% monatliche Churn
          </p>
        </div>
      </Card>

      {/* Kontakt */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold">Kontakt</h2>
        <div className="space-y-1">
          <p className="font-semibold">fintutto ug (haftungsbeschränkt)</p>
          <p className="text-sm text-muted-foreground">Alexander Deibel · Geschäftsführer</p>
          <p className="text-sm text-muted-foreground">info@guidetranslator.com</p>
          <p className="text-sm text-muted-foreground">Kolonie 2, 18317 Saal, Deutschland</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/compare">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Wettbewerbervergleich
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/technology">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Technische Architektur
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Alle 11 Pläne
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground pb-4">
        Stand: März 2026 · GuideTranslator v3.1.0 · Vertraulich
      </p>
    </div>
  )
}
