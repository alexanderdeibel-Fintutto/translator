import { Languages, Mic, Volume2, History, Globe, Shield, Radio, MessageCircle, Camera, Wifi, WifiOff, Subtitles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

const FEATURES = [
  {
    icon: Languages,
    title: '54+ Offline-Sprachpaare',
    description: 'Übersetze zwischen 40+ Sprachen — von Deutsch über Arabisch bis Chinesisch, Japanisch, Koreanisch, Hindi und viele mehr. 54 Offline-Paare via Opus-MT.',
  },
  {
    icon: Radio,
    title: 'Live-Sessions (1→N)',
    description: 'Ein Speaker spricht, unbegrenzt viele Zuhörer hören die Übersetzung in ihrer Sprache. QR-Code scannen, fertig. Kein App-Download nötig.',
  },
  {
    icon: MessageCircle,
    title: 'Konversationsmodus',
    description: 'Face-to-Face Übersetzung: Zwei Personen sprechen abwechselnd, jede sieht und hört die Übersetzung. Ideal für Arztbesuche oder Behördengänge.',
  },
  {
    icon: Camera,
    title: 'Kamera-Übersetzer',
    description: 'Fotografiere Schilder, Menüs oder Dokumente — der Text wird erkannt und sofort übersetzt. OCR via Google Vision API.',
  },
  {
    icon: Subtitles,
    title: 'Live-Untertitel',
    description: 'Listener sehen Übersetzungen als Echtzeit-Untertitel — inklusive Vollbild-Modus mit großer Schrift auf schwarzem Hintergrund.',
  },
  {
    icon: Mic,
    title: 'Spracheingabe (Online + Offline)',
    description: 'Web Speech API für Chrome/Edge, Whisper-Modell (~40MB) für vollständig offline STT in Firefox und Safari.',
  },
  {
    icon: Volume2,
    title: 'HD-Sprachausgabe',
    description: 'Google Cloud TTS mit Neural2 und Chirp 3 HD Stimmen. Automatisches Caching für 30 Tage. Browser-Fallback wenn offline.',
  },
  {
    icon: WifiOff,
    title: '4-stufiges Offline-System',
    description: 'Cloud → Lokales WiFi → Hotspot → Bluetooth LE. Funktioniert auch in der U-Bahn, im Museumskeller, oder auf einem Boot ohne Internet.',
  },
  {
    icon: Shield,
    title: 'E2E-Verschlüsselung',
    description: 'AES-256-GCM Verschlüsselung für alle lokalen Transporte. PBKDF2 Key Derivation. Kein Server sieht eure Übersetzungen.',
  },
  {
    icon: Wifi,
    title: 'Auto-Spracherkennung',
    description: 'Erkennt automatisch die Quellsprache anhand von Unicode-Script-Analyse und Wortfrequenz-Matching — komplett offline, 20+ Sprachen.',
  },
  {
    icon: History,
    title: 'Session-Protokoll Export',
    description: 'Lade ein vollständiges Transkript als Text oder Markdown herunter — mit Zeitstempeln, Sprachen und allen Übersetzungen.',
  },
  {
    icon: Globe,
    title: 'Kostenlos & Open Source',
    description: 'Keine Kosten pro Zuhörer. Keine Kosten pro Minute. PWA-Installation für schnellen Offline-Zugriff.',
  },
]

const LANGUAGES = [
  '\uD83C\uDDE9\uD83C\uDDEA Deutsch', '\uD83C\uDDEC\uD83C\uDDE7 Englisch', '\uD83C\uDDEB\uD83C\uDDF7 Französisch', '\uD83C\uDDEA\uD83C\uDDF8 Spanisch',
  '\uD83C\uDDEE\uD83C\uDDF9 Italienisch', '\uD83C\uDDF5\uD83C\uDDF9 Portugiesisch', '\uD83C\uDDF3\uD83C\uDDF1 Niederländisch', '\uD83C\uDDF5\uD83C\uDDF1 Polnisch',
  '\uD83C\uDDF9\uD83C\uDDF7 Türkisch', '\uD83C\uDDF7\uD83C\uDDFA Russisch', '\uD83C\uDDFA\uD83C\uDDE6 Ukrainisch', '\uD83C\uDDF8\uD83C\uDDE6 Arabisch',
  '\uD83C\uDDE8\uD83C\uDDF3 Chinesisch', '\uD83C\uDDEF\uD83C\uDDF5 Japanisch', '\uD83C\uDDF0\uD83C\uDDF7 Koreanisch', '\uD83C\uDDEE\uD83C\uDDF3 Hindi',
  '\uD83C\uDDF8\uD83C\uDDEA Schwedisch', '\uD83C\uDDE9\uD83C\uDDF0 Dänisch', '\uD83C\uDDF3\uD83C\uDDF4 Norwegisch', '\uD83C\uDDE8\uD83C\uDDFF Tschechisch',
  '\uD83C\uDDF7\uD83C\uDDF4 Rumänisch', '\uD83C\uDDEC\uD83C\uDDF7 Griechisch', '\uD83C\uDDED\uD83C\uDDFA Ungarisch', '\uD83C\uDDEB\uD83C\uDDEE Finnisch',
  '\uD83C\uDDE7\uD83C\uDDEC Bulgarisch', '\uD83C\uDDED\uD83C\uDDF7 Kroatisch', '\uD83C\uDDEE\uD83C\uDDF1 Hebräisch', '\uD83C\uDDEA\uD83C\uDDEA Estnisch',
  '\uD83C\uDDFB\uD83C\uDDF3 Vietnamesisch', '\uD83C\uDDF9\uD83C\uDDED Thailändisch', '\uD83C\uDDEE\uD83C\uDDE9 Indonesisch', '\uD83C\uDDEE\uD83C\uDDF7 Farsi',
]

export default function InfoPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Über <span className="gradient-text-translator">guidetranslator</span>
        </h1>
        <p className="text-muted-foreground">
          Die einzige Übersetzungs-App mit Live-Broadcast an unbegrenzt viele Zuhörer — komplett offline.
          Für Stadtführungen, Museen, Behördengänge und den Alltag in Deutschland.
        </p>
        <div className="inline-flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
          v0.9.0 — 54 Offline-Sprachpaare, 4 Transport-Layer, E2E-Verschlüsselung
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(feature => (
          <Card key={feature.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg gradient-translator flex items-center justify-center mb-2">
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unterstützte Sprachen ({LANGUAGES.length})</CardTitle>
          <CardDescription>
            {LANGUAGES.length} Sprachen werden unterstützt. 54 Offline-Sprachpaare via Opus-MT (je ~35MB).
            Nicht-englische Paare werden automatisch über English als Pivot-Sprache übersetzt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {LANGUAGES.map(lang => (
              <div key={lang} className="text-sm px-3 py-2 rounded-lg bg-secondary text-secondary-foreground">
                {lang}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transport-Architektur</CardTitle>
          <CardDescription>
            4 Transport-Layer für maximale Verfügbarkeit — kein anderer Übersetzer bietet das.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-secondary space-y-1">
              <strong>1. Cloud (Supabase)</strong>
              <p className="text-muted-foreground text-xs">Echtzeit-Broadcast via WebSocket. Unbegrenzte Reichweite.</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary space-y-1">
              <strong>2. Lokales WiFi</strong>
              <p className="text-muted-foreground text-xs">WebSocket-Relay im lokalen Netzwerk. Kein Internet nötig.</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary space-y-1">
              <strong>3. Hotspot</strong>
              <p className="text-muted-foreground text-xs">Speaker-Handy erstellt eigenes WiFi + Relay-Server.</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary space-y-1">
              <strong>4. Bluetooth LE</strong>
              <p className="text-muted-foreground text-xs">GATT Server/Client. Funktioniert komplett ohne Netzwerk.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teil des ai tour Ökosystems</CardTitle>
          <CardDescription>
            guidetranslator ist Teil der ai tour Plattform für Finanzen, Immobilien und Verwaltung in Deutschland.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-secondary">
              <strong>ai tour Portal</strong> - Rechner, Checker & Formulare
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <strong>Vermietify</strong> - Immobilienverwaltung
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <strong>Ablesung</strong> - Zählerablesung & Energie
            </div>
            <div className="p-3 rounded-lg bg-secondary">
              <strong>BescheidBoxer</strong> - Steuerbescheid-Prüfung
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
