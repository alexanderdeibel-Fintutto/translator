// TechnologyPage — Mobile-First Technologie-Architektur
// Route: /technology

import { Link } from 'react-router-dom'
import {
  ArrowRight, Shield, Wifi, Bluetooth, Cloud, Lock, Zap,
  Globe2, Server, Database, HardDrive, Radio,
  ChevronRight, Check, Clock, Layers, FileCode, TestTube,
  Gauge, MessageCircleQuestion, ScanText, Cpu
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ─── 4-Tier Transport ─────────────────────────────────────────────────────────
const TIERS = [
  {
    tier: 'Tier 1', name: 'Cloud', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-500/15',
    tech: 'Supabase Realtime WebSocket',
    desc: 'Globale Reichweite · <30 ms Broadcast-Latenz · 500+ Listener · Exponential Backoff',
    req: 'Internet',
  },
  {
    tier: 'Tier 2', name: 'Hotspot', icon: Wifi, color: 'text-green-400', bg: 'bg-green-500/15',
    tech: 'Embedded WebSocket Relay + WiFi AP',
    desc: 'Speaker-Gerät wird zum WLAN-Router · Auto-Discovery über 6 IPs · WiFi-QR-Code',
    req: 'Kein Internet — nur WiFi-fähige Geräte',
  },
  {
    tier: 'Tier 3', name: 'BLE GATT', icon: Bluetooth, color: 'text-indigo-400', bg: 'bg-indigo-500/15',
    tech: 'Custom Bluetooth GATT Protocol',
    desc: '180-Byte-Chunking (MTU-safe) · Presence Management · Advertising: GT-TR-XXXX · 10–30 m',
    req: 'Null Infrastruktur — überall',
  },
  {
    tier: 'Tier 4', name: 'Offline', icon: HardDrive, color: 'text-amber-400', bg: 'bg-amber-500/15',
    tech: 'Opus-MT + Whisper WASM (On-Device ML)',
    desc: '54 Sprachpaare (~35 MB/Paar) · Whisper STT (~150 MB) · 0 externe Abhängigkeiten',
    req: 'Kein Netzwerk jeglicher Art',
  },
]

// ─── Übersetzungs-Pipeline ────────────────────────────────────────────────────
const PIPELINE = [
  { icon: Cloud,    title: 'Provider-Kaskade',    desc: 'DeepL → Azure → Google → LibreTranslate → Opus-MT WASM · 6 Provider mit Circuit Breaker' },
  { icon: Database, title: '3-Tier-Cache',         desc: 'Memory (LRU 500) → IndexedDB (30 Tage) → Offline-Modell · Cache-Hit-Rate >80%' },
  { icon: Cpu,      title: 'On-Device ML',          desc: 'Transformers.js WASM · English-Pivot für indirekte Paare · Persistent Storage (Safari-safe)' },
  { icon: Zap,      title: 'Latenz-Monitoring',     desc: 'STT → Translate → Broadcast · LatencyReport mit Perzentilen · Live-Anzeige im Speaker-UI' },
]

// ─── Q&A-Architektur ──────────────────────────────────────────────────────────
const QA_FLOW = [
  { step: '1', label: 'Listener tippt Frage', desc: 'QuestionMessage via Transport an Speaker' },
  { step: '2', label: 'Speaker-Inbox',         desc: 'Moderations-UI: Freigeben oder Verwerfen' },
  { step: '3', label: 'Broadcast',             desc: 'BroadcastQuestionMessage an alle Listener' },
  { step: '4', label: 'Anzeige',               desc: 'Frage erscheint in Listener-Zielsprache' },
]

// ─── OCR-Pipeline ─────────────────────────────────────────────────────────────
const OCR_FLOW = [
  { step: '1', label: 'Foto aufnehmen',      desc: 'Kamera oder Galerie · max 2048 px (auto-resize)' },
  { step: '2', label: 'Server-Proxy',         desc: 'API-Key bleibt serverseitig · /api/vision Edge Function' },
  { step: '3', label: 'Google Cloud Vision', desc: 'Texterkennung · alle Schriften inkl. RTL' },
  { step: '4', label: 'Auto-Übersetzung',    desc: 'Erkannter Text → Provider-Kaskade → Zielsprache' },
]

// ─── Security ─────────────────────────────────────────────────────────────────
const SECURITY = [
  { icon: Lock,   title: 'E2E-Verschlüsselung', desc: 'AES-256-GCM · PBKDF2 Key Derivation · auch über BLE' },
  { icon: Shield, title: 'DSGVO Art. 9',         desc: 'Offline-First · keine Gesundheitsdaten in der Cloud' },
  { icon: Server, title: 'Security Headers',     desc: 'CSP · HSTS · X-Frame-Options · X-Content-Type' },
  { icon: Radio,  title: 'BSI-Grundschutz',      desc: 'DSFA-Template fertig · EVB-IT Vertragsvorlagen · BITV 2.0' },
]

// ─── Patentfähige Innovationen ────────────────────────────────────────────────
const PATENTS = [
  { title: '4-Tier Auto-Fallback Transport',    time: '3–4 Mo Nachahmung',  desc: 'Cloud → Hotspot → BLE → Offline mit transparentem Interface' },
  { title: 'BLE GATT Translation Protocol',     time: '6–12 Mo Nachahmung', desc: 'Custom Bluetooth-Protokoll mit Chunking, Presence, Session-Management' },
  { title: 'Q&A-Moderation über Transport',     time: '2–3 Mo Nachahmung',  desc: 'Bidirektionaler Q&A-Kanal in Live-Sessions mit Moderations-Workflow' },
  { title: 'Embedded Relay Server',             time: '3–6 Mo Nachahmung',  desc: 'WebSocket-Server als native App-Komponente — kein externer Server' },
  { title: 'Hybrid ML Pipeline',                time: '2–3 Mo Nachahmung',  desc: 'Cloud-APIs + On-Device WASM mit gemeinsamer Cache-Schicht' },
  { title: 'Bidirektional 180°-Single-Device',  time: '2–3 Mo Nachahmung',  desc: 'Face-to-Face-Übersetzung auf einem einzigen Gerät' },
]

// ─── Stack ────────────────────────────────────────────────────────────────────
const STACK = [
  { cat: 'Frontend',    items: ['React 18 + TypeScript', 'Vite + TailwindCSS', 'Capacitor (Android/iOS)', 'PWA + Service Worker'] },
  { cat: 'Backend',     items: ['Supabase (Realtime + Auth + DB)', 'Edge Functions (Deno)', 'Google Cloud Vision API', 'Google Neural2 / Chirp 3 HD TTS'] },
  { cat: 'KI / ML',     items: ['Transformers.js (Opus-MT WASM)', 'Whisper WASM (STT)', 'DeepL / Azure / Google Translate', 'LibreTranslate (Self-hosted)'] },
  { cat: 'Infrastruktur', items: ['Vercel (Hosting + Edge)', 'Stripe (Billing)', 'Sentry (Monitoring)', 'GitHub Actions (CI/CD)'] },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function TechnologyPage() {
  return (
    <div className="relative max-w-2xl mx-auto space-y-10 py-6 px-4 text-white">
{/* Hero */}
      <div className="relative text-center space-y-3 py-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[280px] h-[280px] opacity-90" />
        </div>
        <div className="relative z-10 space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Technische Architektur · März 2026
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight drop-shadow-lg">
            Offline-First. Echtzeit. Verschlüsselt.
          </h1>
          <p className="text-base text-white/80 max-w-md mx-auto drop-shadow">
            4-Tier-Transport · On-Device KI · Q&A-Moderation · OCR-Scanner — gebaut für Orte, an denen andere Lösungen versagen.
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { value: '<1s',    label: 'E2E-Latenz',    icon: Clock },
          { value: '87',     label: 'Tests (100%)',  icon: TestTube },
          { value: '407 KB', label: 'Bundle gzip',   icon: Gauge },
          { value: '45',     label: 'Sprachen',      icon: Globe2 },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="text-center p-3 rounded-xl bg-black/25 backdrop-blur-md border border-white/15 space-y-0.5">
              <Icon className="w-4 h-4 text-sky-300 mx-auto" />
              <div className="text-xl font-bold text-sky-300">{s.value}</div>
              <div className="text-[11px] text-white/65">{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* 4-Tier Transport */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold drop-shadow-lg">4-Tier Transport-Architektur</h2>
          <p className="text-sm text-white/70 mt-1">Automatischer Fallback — jedes Tier degradiert transparent zum nächsten.</p>
        </div>
        <div className="space-y-2">
          {TIERS.map((t, i) => {
            const Icon = t.icon
            return (
              <div key={i}>
                <Card className="p-4 bg-black/25 backdrop-blur-md border-white/15">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${t.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/50">{t.tier}</span>
                        <h3 className="font-bold text-sm">{t.name}</h3>
                      </div>
                      <p className="text-[11px] font-mono text-white/55 mt-0.5">{t.tech}</p>
                      <p className="text-xs text-white/75 mt-1 leading-snug">{t.desc}</p>
                      <p className={`text-[11px] font-semibold mt-1 ${t.color}`}>Voraussetzung: {t.req}</p>
                    </div>
                  </div>
                </Card>
                {i < 3 && (
                  <div className="flex justify-center py-1">
                    <span className="text-xs text-white/40">↓ Automatischer Fallback</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Übersetzungs-Pipeline */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Übersetzungs-Pipeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PIPELINE.map((p, i) => {
            const Icon = p.icon
            return (
              <Card key={i} className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-sky-300 shrink-0" />
                  <h3 className="font-semibold text-sm">{p.title}</h3>
                </div>
                <p className="text-xs text-white/70 leading-snug">{p.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Q&A-Architektur */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="w-5 h-5 text-sky-300" />
          <h2 className="text-xl font-bold drop-shadow-lg">Q&A-Moderation</h2>
        </div>
        <Card className="p-4 bg-black/25 backdrop-blur-md border-white/15">
          <div className="space-y-2">
            {QA_FLOW.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
                <div>
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-xs text-white/65">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* OCR-Pipeline */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ScanText className="w-5 h-5 text-amber-300" />
          <h2 className="text-xl font-bold drop-shadow-lg">Dokument-Scanner (OCR)</h2>
        </div>
        <Card className="p-4 bg-black/25 backdrop-blur-md border-white/15">
          <div className="space-y-2">
            {OCR_FLOW.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
                <div>
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-xs text-white/65">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Security */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Security & Compliance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SECURITY.map((s, i) => {
            const Icon = s.icon
            return (
              <Card key={i} className="p-4 bg-black/25 backdrop-blur-md border-white/15 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-sky-300 shrink-0" />
                  <h3 className="font-semibold text-sm">{s.title}</h3>
                </div>
                <p className="text-xs text-white/70 leading-snug">{s.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tech-Stack */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold drop-shadow-lg">Tech-Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STACK.map((s, i) => (
            <Card key={i} className="p-4 bg-black/25 backdrop-blur-md border-white/15">
              <h3 className="font-semibold text-sm text-sky-300 mb-2">{s.cat}</h3>
              <ul className="space-y-1">
                {s.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-xs text-white/75">
                    <Check className="w-3 h-3 text-sky-300 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Patentfähige Innovationen */}
      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-bold drop-shadow-lg">Patentfähige Innovationen</h2>
          <p className="text-sm text-white/70 mt-1">Technische Barrieren — 12–18 Monate Nachahmungsaufwand gesamt.</p>
        </div>
        <div className="space-y-2">
          {PATENTS.map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-white/12">
              <span className="text-xs font-mono text-sky-300 shrink-0 mt-0.5">{String(i+1).padStart(2,'0')}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{p.title}</p>
                <p className="text-xs text-white/65 mt-0.5">{p.desc}</p>
              </div>
              <span className="text-[10px] text-amber-300 font-medium shrink-0 text-right">{p.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Qualitätssicherung */}
      <Card className="p-4 bg-black/25 backdrop-blur-md border-white/15">
        <div className="flex items-center gap-2 mb-3">
          <TestTube className="w-4 h-4 text-sky-300" />
          <h2 className="font-bold text-sm">87 Tests · 7 Suiten · 100% Pass Rate</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            'connection-manager (17)', 'crypto (9)',
            'local-ws-transport (14)', 'encrypted-transport (9)',
            'translate (8)',           'detect-language (20)',
            'latency (10)',
          ].map((t, i) => (
            <p key={i} className="text-xs text-white/65">• {t}</p>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <div className="space-y-2 py-2">
        <Link to="/pricing">
          <Button size="lg" className="w-full gap-2">
            Jetzt starten <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/features">
            <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
              Alle Features <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
          <Link to="/investors">
            <Button size="default" variant="outline" className="w-full text-sm border-white/30 text-white hover:bg-white/10">
              Investoren <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

    </div>
  )
}
