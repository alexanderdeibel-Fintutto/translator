/**
 * Competition Page
 *
 * Comparison with Google Translate, DeepL, Microsoft, iTranslate.
 * Highlights the unique 4-tier offline architecture.
 */

import {
  Check, X, Shield, Bluetooth, Wifi,
  Radio, Smartphone, Globe2, Lock
} from 'lucide-react'
import { Card } from '@/components/ui/card'

const COMPARISON = [
  { feature: 'Offline-Uebersetzung', gt: 'Teilweise', deepl: 'Nein', ms: 'Teilweise', itranslate: 'Teilweise', fintutto: 'Ja (54 Paare)' },
  { feature: 'Live 1→N Broadcast', gt: 'Nein', deepl: 'Nein', ms: 'Ja (100)', itranslate: 'Nein', fintutto: 'Ja (500+)' },
  { feature: 'BLE-Transport', gt: 'Nein', deepl: 'Nein', ms: 'Nein', itranslate: 'Nein', fintutto: 'Ja' },
  { feature: 'WiFi-Hotspot-Modus', gt: 'Nein', deepl: 'Nein', ms: 'Nein', itranslate: 'Nein', fintutto: 'Ja' },
  { feature: 'Kein App-Download', gt: 'Nein', deepl: 'Nein', ms: 'Nein', itranslate: 'Nein', fintutto: 'Ja (PWA)' },
  { feature: 'Branchenspezifische Apps', gt: 'Nein', deepl: 'Nein', ms: 'Nein', itranslate: 'Nein', fintutto: '16 Varianten' },
  { feature: 'KI-Audioguide-System', gt: 'Nein', deepl: 'Nein', ms: 'Nein', itranslate: 'Nein', fintutto: 'Art Guide' },
  { feature: 'E2E-Verschluesselung', gt: 'Nein', deepl: 'Nein', ms: 'Nein', itranslate: 'Nein', fintutto: 'AES-256-GCM' },
  { feature: 'Gespraechsmodus', gt: 'Ja', deepl: 'Nein', ms: 'Ja', itranslate: 'Ja', fintutto: 'Ja (180°)' },
  { feature: 'Kamera-OCR', gt: 'Ja', deepl: 'Nein', ms: 'Ja', itranslate: 'Ja', fintutto: 'Ja' },
]

function CellValue({ value }: { value: string }) {
  if (value === 'Nein') return <span className="text-red-400 flex items-center justify-center"><X className="w-4 h-4" /></span>
  if (value.startsWith('Ja')) return <span className="text-green-400 text-xs font-medium">{value}</span>
  return <span className="text-white/70 text-xs">{value}</span>
}

export default function CompetitionPage() {
  return (
    <div className="relative max-w-5xl mx-auto space-y-16 py-8 px-4 text-white">
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
            Wettbewerb
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-white drop-shadow-lg">
            Was kein Wettbewerber kann:<br />
            <span className="text-sky-300">Offline-Gruppen-Broadcast.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto drop-shadow">
            Google Translate, DeepL, Microsoft — sie alle brauchen Internet.
            An den Orten, wo Uebersetzung am meisten gebraucht wird, gibt es keins.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Feature-Vergleich</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-white/60 font-medium">Feature</th>
                <th className="p-3 text-center text-white/60 font-medium">Google</th>
                <th className="p-3 text-center text-white/60 font-medium">DeepL</th>
                <th className="p-3 text-center text-white/60 font-medium">Microsoft</th>
                <th className="p-3 text-center text-white/60 font-medium">iTranslate</th>
                <th className="p-3 text-center text-sky-300 font-bold">Fintutto</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-white/80 text-xs font-medium">{row.feature}</td>
                  <td className="p-3 text-center"><CellValue value={row.gt} /></td>
                  <td className="p-3 text-center"><CellValue value={row.deepl} /></td>
                  <td className="p-3 text-center"><CellValue value={row.ms} /></td>
                  <td className="p-3 text-center"><CellValue value={row.itranslate} /></td>
                  <td className="p-3 text-center bg-sky-500/5"><CellValue value={row.fintutto} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moat */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Der Burggraben</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Bluetooth, title: 'BLE-Transport', desc: 'Custom GATT Protocol fuer Bluetooth-only Uebersetzung. Kein Internet, kein WiFi — nur Bluetooth genuegt.' },
            { icon: Wifi, title: 'WiFi-Hotspot', desc: 'Speaker erstellt eigenes lokales Netzwerk. Relay-Server laeuft auf dem Geraet. Kein Internet noetig.' },
            { icon: Radio, title: '1→500 Broadcast', desc: 'Live-Uebersetzung von einem Sprecher an bis zu 500 Zuhoerer gleichzeitig. Jeder in seiner Sprache.' },
            { icon: Lock, title: 'E2E in allen Tiers', desc: 'AES-256-GCM Verschluesselung in Cloud, WiFi, BLE und Offline. Auch im schlimmsten Fall verschluesselt.' },
          ].map((feat, i) => {
            const Icon = feat.icon
            return (
              <Card key={i} className="p-5 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
                <Icon className="w-5 h-5 text-sky-300" />
                <h3 className="font-semibold">{feat.title}</h3>
                <p className="text-sm text-white/70">{feat.desc}</p>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quote */}
      <div className="max-w-2xl mx-auto p-6 bg-sky-500/10 border border-sky-500/20 rounded-xl text-center">
        <p className="text-lg italic text-white/90 leading-relaxed">
          "Offline-Gruppen-Uebersetzung per Bluetooth + WiFi-Hotspot ist patentfaehig und
          von keinem Wettbewerber replizierbar ohne grundlegende Architektur-Aenderung."
        </p>
      </div>

      {/* 4-Tier */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center drop-shadow-lg">Die 4-Tier-Architektur</h2>
        <div className="max-w-md mx-auto space-y-3">
          {[
            { tier: '1', name: 'Cloud', desc: 'Supabase Realtime — globale Reichweite, <1s Latenz', condition: 'Internet verfuegbar', color: 'bg-sky-600' },
            { tier: '2', name: 'WiFi-Hotspot', desc: 'Lokales Netzwerk mit Relay-Server. Kein Internet', condition: 'Kein Internet, aber WiFi', color: 'bg-blue-600' },
            { tier: '3', name: 'Bluetooth LE', desc: 'GATT-Transport. Keine Infrastruktur', condition: 'Kein WiFi, nur BLE', color: 'bg-violet-600' },
            { tier: '4', name: 'On-Device KI', desc: 'Opus-MT + Whisper lokal. Komplett offline', condition: 'Gar kein Netzwerk', color: 'bg-purple-600' },
          ].map((t, i) => (
            <Card key={i} className="p-4 flex items-start gap-4 bg-black/30 backdrop-blur-sm border-white/10">
              <div className={`w-10 h-10 rounded-lg ${t.color} flex items-center justify-center shrink-0 font-bold text-white`}>
                {t.tier}
              </div>
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs text-white/70">{t.desc}</p>
                <p className="text-[10px] text-white/40 mt-1">→ {t.condition}</p>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-white/50">
          Jede Stufe degradiert automatisch zur naechsten. Nahtlos. Verschluesselt. In 45 Sprachen.
        </p>
      </div>
    </div>
  )
}
