import { Card } from '@/components/ui/card'

const NEWS = [
  {
    date: 'März 2026',
    title: 'v4.1 — Multi-Market Landing & Lösungs-Seiten',
    content: 'Neue Marketing-Landingpage mit zielgruppenspezifischen Lösungs-Seiten für Stadtführer, Agenturen, Kreuzfahrt-Reedereien und Großveranstalter. Dunkles Glasmorphism-Design mit optimierter Lesbarkeit.',
    tag: 'Release',
  },
  {
    date: 'März 2026',
    title: 'v4.0 — Multi-App-Architektur & Vercel Deployment',
    content: 'GuideTranslator wird zu Fintutto Translator und splittet sich in 3 spezialisierte Apps: Consumer (consumer.fintutto.world), Listener (listener.fintutto.world) und Enterprise (enterprise.fintutto.world). Jede App wird eigenständig auf Vercel deployed.',
    tag: 'Release',
  },
  {
    date: 'März 2026',
    title: 'Landingpage fintutto.world live',
    content: 'Die neue Produkt-Landingpage bündelt alle Informationen: App-Übersicht, Features, Preise, Investor Relations und Neuigkeiten. Verfügbar unter fintutto.world.',
    tag: 'Website',
  },
  {
    date: 'Februar 2026',
    title: '45 Sprachen + 10 Migrationssprachen',
    content: 'Dari, Paschtu, Tigrinya, Amharisch, Somali, Kurdisch, Urdu, Bengali, Suaheli und Albanisch sind ab sofort verfügbar — inkl. vollständiger RTL-Unterstützung für Arabisch, Farsi, Urdu und Hebräisch.',
    tag: 'Feature',
  },
  {
    date: 'Februar 2026',
    title: 'HD-Sprachausgabe mit Chirp 3 HD',
    content: 'Google Chirp 3 HD bietet die natürlichste TTS-Qualität aller Zeiten. Verfügbar in 24 Sprachen für Pro-, Premium- und Enterprise-Pläne.',
    tag: 'Feature',
  },
  {
    date: 'Januar 2026',
    title: 'BLE-Transport & Hotspot-Modus',
    content: 'Live-Übersetzung per Bluetooth Low Energy (Custom GATT Protocol) und lokalem WLAN-Hotspot. Funktioniert komplett ohne Internet — an Ruinen, auf Booten, in Bergen.',
    tag: 'Feature',
  },
  {
    date: 'Januar 2026',
    title: 'E2E-Verschlüsselung (AES-256-GCM)',
    content: 'Alle Live-Sessions sind ab sofort Ende-zu-Ende verschlüsselt mit AES-256-GCM und PBKDF2 Key Derivation (100.000 Iterationen). Auch im BLE-Modus.',
    tag: 'Security',
  },
  {
    date: 'Dezember 2025',
    title: 'Offline-Engine: 54 Sprachpaare',
    content: 'Opus-MT WASM-Modelle (~35 MB pro Paar) und Whisper STT (~40 MB) laufen komplett im Browser. Keine Daten verlassen das Gerät.',
    tag: 'Feature',
  },
  {
    date: 'November 2025',
    title: 'Sales CRM & Admin Dashboard',
    content: 'Integriertes CRM mit Lead-Management, Pipeline-Tracking und Segment-Zuordnung. Admin-Dashboard für Session-Verwaltung, Nutzungsstatistiken und Billing.',
    tag: 'Enterprise',
  },
  {
    date: 'Oktober 2025',
    title: 'Stripe Billing & 11-Tier Preismodell',
    content: '11 Pläne in 5 Segmenten — von Free (0 EUR) bis Cruise Armada Enterprise (19.990 EUR/Mo). Stripe-Integration mit automatischer Tier-Enforcement.',
    tag: 'Business',
  },
]

const TAG_COLORS: Record<string, string> = {
  Release: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Website: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Feature: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Security: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Enterprise: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function NewsPage() {
  return (
    <div className="relative max-w-3xl mx-auto py-8 px-4 space-y-8 text-white">
      {/* Page Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/fintutto-logo.svg" alt="" className="w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] opacity-[0.65]" />
      </div>
      <div className="relative text-center space-y-2 py-10 sm:py-14 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src="/fintutto-logo.svg" alt="" className="w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] opacity-95" />
        </div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Neuigkeiten</h1>
          <p className="text-white/80 drop-shadow">Updates, Releases und Meilensteine</p>
        </div>
      </div>

      <div className="space-y-4">
        {NEWS.map((item, i) => (
          <Card key={i} className="p-5 space-y-2 bg-black/30 backdrop-blur-sm border-white/10">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${TAG_COLORS[item.tag] || 'bg-black/30 backdrop-blur-sm text-white/70'}`}>
                {item.tag}
              </span>
              <span className="text-xs text-white/70">{item.date}</span>
            </div>
            <h2 className="font-semibold drop-shadow-lg">{item.title}</h2>
            <p className="text-sm text-white/70 leading-relaxed">{item.content}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
