// TechnologyPage — Technical architecture, 4-tier transport, security, performance metrics
// Route: /technology

import { Link } from 'react-router-dom'
import {
  ArrowRight, Shield, Wifi, Bluetooth, Cloud, Cpu, Lock, Zap,
  Globe2, Monitor, Signal, Server, Database, HardDrive, Radio,
  ChevronRight, Check, Clock, Layers, FileCode, TestTube,
  Gauge, Eye, Smartphone
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TechnologyPage() {
  return (
    <div className="relative max-w-4xl mx-auto space-y-16 py-8 px-4">
      {/* Page Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.04]" />
      </div>
      {/* Hero */}
      <div className="relative text-center space-y-4 py-12 sm:py-16 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] opacity-95" />
        </div>
        <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
            Technische Architektur v3.1
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Offline-First. Echtzeit. Verschlüsselt.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
            GuideTranslator ist die einzige Übersetzungsplattform mit 4-Tier-Transport, On-Device KI
            und E2E-Verschlüsselung — gebaut für Orte, an denen andere Lösungen versagen.
          </p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: '<1s', label: 'End-to-End Latenz', icon: Clock },
          { value: '87', label: 'Automatisierte Tests', icon: TestTube },
          { value: '407 KB', label: 'Bundle (gzip)', icon: Gauge },
          { value: '45', label: 'Sprachen', icon: Globe2 },
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

      {/* 4-Tier Transport Architecture */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">4-Tier Transport-Architektur</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Automatischer Fallback von Cloud bis völlig ohne Netzwerk. Jedes Tier degradiert transparent zum nächsten.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              tier: 'Tier 1',
              name: 'Cloud',
              icon: Cloud,
              color: 'text-blue-500',
              bg: 'bg-blue-500/10',
              tech: 'Supabase Realtime WebSocket',
              description: 'Globale Reichweite mit unter 30ms Broadcast-Latenz. Exponential Backoff bei Verbindungsabbruch (max 5 Retries). Skaliert auf 500+ gleichzeitige Listener.',
              requires: 'Internet-Verbindung',
            },
            {
              tier: 'Tier 2',
              name: 'Hotspot',
              icon: Wifi,
              color: 'text-green-500',
              bg: 'bg-green-500/10',
              tech: 'Embedded WebSocket Relay + WiFi AP',
              description: 'Das Speaker-Gerät erstellt ein eigenes WLAN-Netzwerk mit integriertem WebSocket-Server. Auto-Discovery über 6 gängige Router-IPs. WiFi-QR-Code für automatische Verbindung.',
              requires: 'Kein Internet — nur WiFi-fähige Geräte',
            },
            {
              tier: 'Tier 3',
              name: 'BLE GATT',
              icon: Bluetooth,
              color: 'text-indigo-500',
              bg: 'bg-indigo-500/10',
              tech: 'Custom Bluetooth GATT Protocol',
              description: 'Proprietäres BLE-Protokoll mit 180-Byte-Chunking (MTU-safe), automatischer Reassembly und Presence Management. Advertising-Name: GT-TR-XXXX. 10-30m Reichweite.',
              requires: 'Null Infrastruktur — funktioniert überall',
            },
            {
              tier: 'Tier 4',
              name: 'Offline',
              icon: HardDrive,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10',
              tech: 'Opus-MT + Whisper WASM (On-Device ML)',
              description: '54 Offline-Sprachpaare via Transformers.js (~35 MB pro Paar). Whisper für Spracherkennung (~40 MB). Alles lokal — keine Daten verlassen das Gerät. 0 externe Abhängigkeiten.',
              requires: 'Kein Netzwerk jeglicher Art',
            },
          ].map((tier, i) => {
            const Icon = tier.icon
            return (
              <Card key={i} className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${tier.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-6 h-6 ${tier.color}`} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-muted-foreground">{tier.tier}</span>
                      <h3 className="font-bold text-lg">{tier.name}</h3>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{tier.tech}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
                    <p className="text-xs text-primary font-medium">Voraussetzung: {tier.requires}</p>
                  </div>
                </div>
                {i < 3 && (
                  <div className="flex justify-center mt-3">
                    <span className="text-xs text-muted-foreground">↓ Automatischer Fallback ↓</span>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Translation Pipeline */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Übersetzungs-Pipeline</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            6-Provider-Kaskade mit 3-Tier-Cache, Circuit Breaker und automatischer Offline-Degradierung.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">3-Tier-Cache</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />In-Memory Cache (5 Min TTL, 500 Einträge)</li>
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />IndexedDB Cache (30 Tage TTL, 10.000 Einträge)</li>
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />In-Flight Request Deduplication</li>
            </ul>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Provider-Kaskade</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-xs font-mono text-primary shrink-0">1.</span>Vercel Edge Proxy (API-Key geschützt)</li>
              <li className="flex items-start gap-2"><span className="text-xs font-mono text-primary shrink-0">2.</span>Azure NMT / Google Cloud Translation</li>
              <li className="flex items-start gap-2"><span className="text-xs font-mono text-primary shrink-0">3.</span>MyMemory Translation Memory (kostenlos)</li>
              <li className="flex items-start gap-2"><span className="text-xs font-mono text-primary shrink-0">4.</span>LibreTranslate (Open Source)</li>
              <li className="flex items-start gap-2"><span className="text-xs font-mono text-primary shrink-0">5.</span>Opus-MT WASM (On-Device, offline)</li>
            </ul>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Resilienz</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Circuit Breaker pro Provider (3 Fehler → 30s Pause)</li>
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />HTTP 429 Retry-After Parsing</li>
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Automatische Cache-Eviction</li>
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Graceful Degradation → Offline</li>
            </ul>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Übersetzungs-Features</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />6 Kontextmodi (Reise, Medizin, Recht...)</li>
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Sie/Du-Formalität (9 Sprachen)</li>
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Wort-Alternativen (Top 5 Matches)</li>
              <li className="flex items-start gap-2"><Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />Romanisierung für nicht-lat. Schriften</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Speech Engines */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Sprach-Engines</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Radio className="w-5 h-5 text-primary" />
              Speech-to-Text (STT)
            </h3>
            <p className="text-sm text-muted-foreground">5-Engine-Kaskade mit automatischer Auswahl:</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>1. Apple SpeechAnalyzer (iOS nativ)</li>
              <li>2. Google Cloud STT (iOS Fallback)</li>
              <li>3. Web Speech API (Chrome/Edge/Android)</li>
              <li>4. Google Cloud STT (allg. Fallback)</li>
              <li>5. Whisper WASM (~40 MB, offline)</li>
            </ul>
            <p className="text-xs text-muted-foreground">+ Satz-Boundary-Erkennung für Echtzeit-Übersetzung</p>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Text-to-Speech (TTS)
            </h3>
            <p className="text-sm text-muted-foreground">4-stufige Qualitätshierarchie:</p>
            <div className="space-y-2">
              {[
                { name: 'Chirp 3 HD', quality: 'Höchste', langs: '24 Sprachen', latency: '~500ms' },
                { name: 'Neural2', quality: 'Hoch', langs: '10 Sprachen', latency: '~300ms' },
                { name: 'Standard', quality: 'Mittel', langs: '36 Sprachen', latency: '~200ms' },
                { name: 'Browser TTS', quality: 'Basis', langs: 'Alle', latency: '~50ms' },
              ].map((v, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="font-medium">{v.name}</span>
                  <span className="text-muted-foreground">{v.langs} · {v.latency}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">+ TTS-Audio wird in IndexedDB gecacht (Offline-Wiedergabe)</p>
          </Card>
        </div>
      </div>

      {/* Security */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Sicherheit & Datenschutz</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            DSGVO-konform by Design. Kein Cloud-Zwang. E2E-Verschlüsselung auch im Offline-Modus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">E2E-Verschlüsselung</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• AES-256-GCM (Web Crypto API)</li>
              <li>• PBKDF2 Key Derivation (100.000 Iterationen)</li>
              <li>• 12-Byte Random IV pro Nachricht</li>
              <li>• Key aus Session-Code abgeleitet</li>
              <li>• Kein externer Krypto-Abhängigkeit</li>
            </ul>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Security Headers</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Strict Content Security Policy (CSP)</li>
              <li>• HSTS mit Preload (2 Jahre)</li>
              <li>• X-Frame-Options: DENY</li>
              <li>• Permissions-Policy (Kamera, Mikrofon)</li>
              <li>• Referrer-Policy: strict-origin</li>
            </ul>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">DSGVO-Compliance</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Offline-Modus = keine Daten an Server</li>
              <li>• Keine Nutzerregistrierung erforderlich</li>
              <li>• Keine Speicherung von Gesprächen</li>
              <li>• EU-Hosting (Supabase, Vercel)</li>
              <li>• Export & Löschung jederzeit</li>
            </ul>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Native Security</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>• Capacitor 8 (Android API 24-36)</li>
              <li>• iOS 15+ mit CoreBluetooth</li>
              <li>• Granulare Berechtigungen (optional)</li>
              <li>• Kein Hardware-Zwang</li>
              <li>• PWA: Kein App-Store-Download nötig</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Performance */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Performance-Metriken</h2>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Latenz-Pipeline (typische Werte)</h3>
          <div className="space-y-3">
            {[
              { step: 'STT (Web Speech)', target: '<200ms', typical: '50-150ms', pct: 15 },
              { step: 'Übersetzung (Google)', target: '<300ms', typical: '100-250ms', pct: 25 },
              { step: 'Broadcast (Cloud)', target: '<50ms', typical: '10-30ms', pct: 5 },
              { step: 'TTS (Neural2)', target: '<500ms', typical: '200-400ms', pct: 40 },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.step}</span>
                  <span className="text-muted-foreground">{item.typical} (Ziel: {item.target})</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2 border-t">
              <span>Total End-to-End</span>
              <span className="text-primary">400-800ms (Ziel: &lt;1000ms)</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold">Bundle-Größen</h3>
            <div className="space-y-2">
              {[
                { name: 'Main Bundle', size: '369 KB', gzip: '116 KB' },
                { name: 'Transformers.js', size: '502 KB', gzip: '129 KB' },
                { name: 'ONNX Runtime', size: '398 KB', gzip: '109 KB' },
                { name: 'Supabase', size: '173 KB', gzip: '46 KB' },
                { name: 'Total (ohne WASM)', size: '~1.475 KB', gzip: '~407 KB' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground font-mono">{item.gzip} gzip</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-semibold">Speicheranforderungen</h3>
            <div className="space-y-2">
              {[
                { name: 'Basis-App (PWA)', size: '~5 MB' },
                { name: '+ 1 Offline-Sprachpaar', size: '+35 MB' },
                { name: '+ Whisper STT', size: '+40 MB' },
                { name: '+ TTS Audio Cache', size: '+10-50 MB' },
                { name: 'Voll-Offline', size: '~200 MB' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground font-mono">{item.size}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Tech Stack</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Monitor className="w-4 h-4 text-primary" />
              Frontend
            </h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>React 18.2 + TypeScript 5</li>
              <li>Vite 6.4 (Build: 12 Sekunden)</li>
              <li>Tailwind CSS 3.4 + Radix UI</li>
              <li>Framer Motion 11</li>
              <li>React Router 6.22</li>
            </ul>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              AI / ML
            </h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>Transformers.js 3.8 (Opus-MT)</li>
              <li>ONNX Runtime WASM (~21 MB)</li>
              <li>Whisper Small (multilingual)</li>
              <li>Google Cloud TTS/STT/Vision</li>
              <li>Azure Cognitive Translator</li>
            </ul>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              Backend / Cloud
            </h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>Supabase (Auth, Realtime, DB)</li>
              <li>Vercel (Hosting + Edge Functions)</li>
              <li>Stripe (Billing, Webhooks)</li>
              <li>Sentry (Error Monitoring)</li>
              <li>Google Analytics 4</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Testing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Qualitätssicherung</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TestTube className="w-4 h-4 text-primary" />
                87 Tests in 7 Suiten
              </h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>• connection-manager (17 Tests)</li>
                <li>• crypto (9 Tests)</li>
                <li>• local-ws-transport (14 Tests)</li>
                <li>• encrypted-transport (9 Tests)</li>
                <li>• translate (8 Tests)</li>
                <li>• detect-language (20 Tests)</li>
                <li>• latency (10 Tests)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                Build-Pipeline
              </h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>• <code className="text-xs bg-muted px-1 rounded">tsc && vite build</code> — 12 Sekunden</li>
                <li>• <code className="text-xs bg-muted px-1 rounded">vitest run</code> — 2,2 Sekunden</li>
                <li>• 100% Pass Rate</li>
                <li>• Capacitor Sync (Android + iOS)</li>
                <li>• Vercel Edge Deployment</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Patentable Innovations */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Patentfähige Innovationen</h2>
          <p className="text-muted-foreground">Technische Barrieren, die Wettbewerber 12-18 Monate zur Nachahmung brauchen</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: '4-Tier Auto-Fallback Transport',
              desc: 'Automatische Degradierung von Cloud → Hotspot → BLE → Offline mit transparentem Transport-Interface.',
              time: '3-4 Monate Nachahmungsaufwand',
            },
            {
              title: 'BLE GATT Translation Protocol',
              desc: 'Custom Bluetooth-Protokoll für Echtzeit-Übersetzungs-Broadcast mit Chunking, Presence und Session-Management.',
              time: '6-12 Monate Nachahmungsaufwand',
            },
            {
              title: 'Embedded Relay Server',
              desc: 'WebSocket-Server als native App-Komponente, der ein lokales Netzwerk für Gruppen-Übersetzung erstellt.',
              time: '3-6 Monate Nachahmungsaufwand',
            },
            {
              title: 'Hybrid ML Pipeline',
              desc: 'Nahtloser Wechsel zwischen Cloud-APIs und On-Device WASM-Modellen mit gemeinsamer Cache-Schicht.',
              time: '2-3 Monate Nachahmungsaufwand',
            },
          ].map((item, i) => (
            <Card key={i} className="p-5 space-y-2">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
              <p className="text-xs text-primary font-medium">{item.time}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <h2 className="text-2xl font-bold">Überzeugt?</h2>
        <p className="text-muted-foreground">
          Testen Sie die Technologie selbst oder erfahren Sie mehr über unser Produkt.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/pricing">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Jetzt starten
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/features">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Alle Features
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/investors">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              Für Investoren
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
