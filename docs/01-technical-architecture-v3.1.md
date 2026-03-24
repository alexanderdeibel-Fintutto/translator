# Fintutto Translator v3.1 — Technische Architektur

## Inhaltsverzeichnis

1. [Systemuebersicht](#1-systemuebersicht)
2. [Tech Stack](#2-tech-stack)
3. [Sprachunterstuetzung](#3-sprachunterstuetzung)
4. [Uebersetzungs-Pipeline](#4-uebersetzungs-pipeline)
5. [Speech-to-Text (STT)](#5-speech-to-text-stt)
6. [Text-to-Speech (TTS)](#6-text-to-speech-tts)
7. [Transport-Architektur (4 Tiers)](#7-transport-architektur-4-tiers)
8. [BLE GATT Protocol](#8-ble-gatt-protocol)
9. [Hotspot-Relay-Server](#9-hotspot-relay-server)
10. [Sicherheit & Verschluesselung](#10-sicherheit--verschluesselung)
11. [Offline-Faehigkeiten](#11-offline-faehigkeiten)
12. [Native App (Capacitor)](#12-native-app-capacitor)
13. [Seiten & Features](#13-seiten--features)
14. [Datenfluss-Diagramme](#14-datenfluss-diagramme)
15. [Performance & Metriken](#15-performance--metriken)
16. [Test-Abdeckung](#16-test-abdeckung)

---

## 1. Systemuebersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINTUTTO TRANSLATOR v3.1                     │
│                                                                 │
│  PWA (Browser) ──── Capacitor (Android/iOS) ──── Relay Server  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ React 18 │  │ Vite 6   │  │ Tailwind │  │ Capacitor 8   │  │
│  │ TypeScript│  │ PWA      │  │ Radix UI │  │ Android + iOS │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            TRANSPORT LAYER (4-Tier Fallback)              │  │
│  │  Tier 1: Cloud (Supabase Realtime)                        │  │
│  │  Tier 2: Hotspot (Embedded WebSocket + WiFi AP)           │  │
│  │  Tier 3: BLE GATT (Direct Bluetooth, 0 Infrastruktur)    │  │
│  │  Tier 4: Offline (Lokale ML-Modelle, kein Netzwerk)       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            TRANSLATION ENGINE (Cascade)                    │  │
│  │  1. Google Cloud Translation API                          │  │
│  │  2. MyMemory Translation Memory (Free Fallback)           │  │
│  │  3. LibreTranslate (Open Source Fallback)                 │  │
│  │  4. Opus-MT via Transformers.js (Offline, On-Device)      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Kernprinzip**: Offline-First. Jede Funktion degradiert gracefully — von Cloud bis voellig ohne Netzwerk.

---

## 2. Tech Stack

### Frontend

| Technologie | Version | Zweck |
|-------------|---------|-------|
| React | 18.2 | UI-Framework |
| TypeScript | 5.x | Typsicherheit |
| Vite | 6.4.1 | Build-Tool + Dev-Server |
| Tailwind CSS | 3.4 | Utility-First CSS |
| Radix UI | latest | Accessible Primitives (Dialog, Dropdown, Tabs, Select, Tooltip) |
| Framer Motion | 11 | Animationen |
| Lucide React | 0.358 | Icons (80+) |
| React Router | 6.22 | Client-Side Routing |
| qrcode.react | 4.2 | QR-Code-Generierung |
| Sonner | 1.4.3 | Toast-Benachrichtigungen |

### AI / ML

| Technologie | Zweck |
|-------------|-------|
| @huggingface/transformers 3.8.1 | Offline Translation (Opus-MT), Whisper STT |
| onnxruntime-web | WASM-basierte ML-Inferenz (~21 MB Runtime) |
| Web Speech API | Browser-natives STT (Chrome/Edge) |
| Google Cloud Translation API | Primaere Online-Uebersetzung |
| Google Cloud Text-to-Speech | Neural2 + Chirp 3 HD Stimmen |
| Google Cloud Speech-to-Text | iOS-Fallback STT |
| Google Cloud Vision | OCR / Kamera-Uebersetzung |

### Realtime / Transport

| Technologie | Zweck |
|-------------|-------|
| Supabase Realtime | Cloud-Transport (WebSocket) |
| WebSocket (native) | Lokaler Transport (Hotspot/Router) |
| @capacitor-community/bluetooth-le | BLE Scanning (Listener) |
| @capgo/capacitor-bluetooth-low-energy | BLE Advertising (Speaker) |
| Custom GATT Server (Java/Swift) | Direkter BLE-Datentransport |
| Java-WebSocket 1.5.7 | Embedded Relay Server (Android) |

### Native / Mobile

| Technologie | Version | Zweck |
|-------------|---------|-------|
| Capacitor | 8.1.0 | Native Bridge (Android + iOS) |
| Android SDK | API 24-36 (Android 7-15) | Native Android |
| iOS SDK | 15.0+ | Native iOS |
| CoreBluetooth (iOS) | - | BLE GATT Server |
| Android BluetoothGattServer | - | BLE GATT Server |

### Storage / Caching

| Technologie | Zweck | TTL |
|-------------|-------|-----|
| IndexedDB (idb 8.0.3) | Translation Cache, TTS Audio Cache | 30 Tage |
| localStorage | Einstellungen, History, Favoriten, API Key | Permanent |
| Service Worker (Workbox) | Statische Assets, API-Responses | 24h-365 Tage |
| In-Memory Cache | Translation Dedup, Circuit Breaker | 5 Min |

---

## 3. Sprachunterstuetzung

### 45 Sprachen in 3 Kategorien

**Europaeische Kernsprachen (22)**:
DE, EN, FR, ES, IT, PT, NL, PL, TR, RU, UK, AR, ZH, JA, KO, HI, SV, DA, CS, RO, EL, HU

**Migrationssprachen (10)**:
FA (Farsi/Dari), PS (Paschtu), KU (Kurdisch), TI (Tigrinya), AM (Amharisch), SO (Somali), UR (Urdu), BN (Bengali), SW (Suaheli), SQ (Albanisch)

**Tourismussprachen (13)**:
HR, BG, SR, SK, NO, FI, TH, VI, ID, MS, FIL, HE, KA

### RTL-Unterstuetzung
Vollstaendige Right-to-Left-Unterstuetzung fuer: AR, FA, PS, KU, UR, HE

### Romanisierung
Client-seitige Transliteration fuer: Arabisch, Persisch, Kyrillisch, Griechisch, Devanagari (Hindi/Bengali)

### Offline-Sprachpaare
54 herunterladbare Opus-MT Modelle (~35 MB pro Paar)

---

## 4. Uebersetzungs-Pipeline

```
Eingabetext
    │
    ▼
┌─────────────────────┐
│  1. In-Memory Cache  │ ◄── 5 Min TTL, max 500 Eintraege
│     (Map<key,result>)│     + In-Flight Request Dedup
└─────────┬───────────┘
          │ miss
          ▼
┌─────────────────────┐
│  2. IndexedDB Cache  │ ◄── 30 Tage TTL, persistent
└─────────┬───────────┘
          │ miss
          ▼
┌─────────────────────┐
│  3. Google Translate │ ◄── Circuit Breaker (3 Fehler → 30s Pause)
│     (API Key noetig) │     Retry-After Header Parsing
└─────────┬───────────┘
          │ fail
          ▼
┌─────────────────────┐
│  4. MyMemory API     │ ◄── Free, kein Key noetig
│     (TM + MT)        │     Circuit Breaker enabled
└─────────┬───────────┘
          │ fail
          ▼
┌─────────────────────┐
│  5. LibreTranslate   │ ◄── Open Source, public Instance
└─────────┬───────────┘
          │ fail
          ▼
┌─────────────────────┐
│  6. Opus-MT Offline  │ ◄── Transformers.js, ~35 MB WASM-Modell
│     (On-Device)      │     Kein Netzwerk erforderlich
└─────────────────────┘
```

### Resilienz-Features
- **Circuit Breaker**: Pro Provider, Threshold 3, Reset 30s
- **Request Dedup**: Identische gleichzeitige Anfragen teilen ein Promise
- **Retry-After**: HTTP-Header wird geparst und respektiert
- **Cache Eviction**: Automatisch bei >500 In-Memory-Eintraegen
- **Graceful Degradation**: Offline → nur Provider 6 aktiv

### Zusatz-Features pro Uebersetzung
- **Kontextmodi**: General, Travel, Medical, Legal, Business, Casual
- **Formalitaet**: Sie/Du-Konvertierung (9 Sprachen)
- **Wort-Alternativen**: MyMemory TM-Matches (Top 5)
- **Romanisierung**: Automatisch fuer nicht-lateinische Schriften
- **Match-Score**: Qualitaetsindikator pro Uebersetzung

---

## 5. Speech-to-Text (STT)

### Engine-Kaskade

```
┌─────────────────────────────────────────────────────┐
│  getBestSTTEngine() — Automatische Engine-Auswahl    │
│                                                      │
│  1. Apple SpeechAnalyzer  (iOS Native, Future)       │
│     └── Pruefe: window.fintuttoNative vorhanden?     │
│                                                      │
│  2. Google Cloud STT      (iOS Fallback)             │
│     └── Pruefe: isIOS() && API Key vorhanden?        │
│                                                      │
│  3. Web Speech API        (Chrome/Edge/Android)      │
│     └── Pruefe: SpeechRecognition in window?         │
│                                                      │
│  4. Google Cloud STT      (Allgemeiner Fallback)     │
│     └── Pruefe: API Key && getUserMedia vorhanden?   │
│                                                      │
│  5. Whisper Offline       (Letzter Ausweg, ~40 MB)   │
│     └── Pruefe: WebAssembly verfuegbar?              │
└─────────────────────────────────────────────────────┘
```

### Satz-Boundary-Erkennung
- Regex-basiert: `.!?;` + CJK-Interpunktion + Arabische Fragezeichen
- Erkennt Satzenden im laufenden Interim-Text
- Emittiert synthetische `isFinal=true` Events bei Satzgrenzen
- Ermoeglicht Echtzeit-Satz-fuer-Satz-Uebersetzung

### Google Cloud STT (iOS)
- PCM → LINEAR16 Encoding (Int16 → Base64)
- Polling-Intervall: 3 Sekunden
- Audio-Buffer: Max 30 Sekunden (Memory-Limit)
- Sende-Limit: Max 15 Sekunden pro Request
- Automatische Sample-Rate-Erkennung (iOS Safari: oft 48 kHz)

---

## 6. Text-to-Speech (TTS)

### Stimm-Hierarchie

| Prioritaet | Engine | Qualitaet | Latenz | Kosten |
|------------|--------|-----------|--------|--------|
| 1 | Chirp 3 HD (v1beta1) | Hoechste | ~500ms | $$$ |
| 2 | Neural2 (v1) | Hoch | ~300ms | $$ |
| 3 | Standard (v1) | Mittel | ~200ms | $ |
| 4 | Browser TTS | Niedrig | ~50ms | Kostenlos |

### Abdeckung
- **Chirp 3 HD**: 24 Sprachen (Premium)
- **Neural2**: 10 Sprachen
- **Standard**: 36 Sprachen
- **Browser Fallback**: Alle Sprachen (geraeteabhaengig)

### Caching
- Jede TTS-Antwort wird als MP3-Blob in IndexedDB gespeichert
- Offline-Wiedergabe aus dem Cache moeglich
- Kein erneuter API-Call fuer bereits gehoerte Texte

---

## 7. Transport-Architektur (4 Tiers)

```
┌─────────────────────────────────────────────────────────┐
│                   CONNECTION MANAGER                      │
│                                                          │
│  autoSelectTransport(config) ──────────────────────────► │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  BROADCAST  │  │  PRESENCE  │  │  ENCRYPTION        │ │
│  │  Transport  │  │  Transport │  │  (AES-256-GCM)     │ │
│  └──────┬─────┘  └──────┬─────┘  └────────────────────┘ │
│         │               │                                 │
│  ┌──────┴───────────────┴──────────────────────────────┐ │
│  │                                                      │ │
│  │  Tier 1: CLOUD (Supabase Realtime)                   │ │
│  │  ├── WebSocket via Supabase Channel                  │ │
│  │  ├── Exponential Backoff (max 5 Retries)             │ │
│  │  └── Global erreichbar, benoetigt Internet           │ │
│  │                                                      │ │
│  │  Tier 2: HOTSPOT (Embedded WebSocket Relay)          │ │
│  │  ├── Android: LocalOnlyHotspot (programmatisch)      │ │
│  │  ├── iOS: Personal Hotspot (manuell)                 │ │
│  │  ├── Embedded Java/Swift WebSocket Server            │ │
│  │  ├── WiFi-QR-Code fuer Auto-Connect                  │ │
│  │  └── Kein Internet noetig, 5-10 Geraete              │ │
│  │                                                      │ │
│  │  Tier 3: BLE GATT (Direct Bluetooth)                 │ │
│  │  ├── Custom GATT Server (Speaker)                    │ │
│  │  ├── GATT Client (Listener)                          │ │
│  │  ├── 180-Byte Chunks (MTU-safe)                      │ │
│  │  ├── Max 5 Verbindungen (Micro-Groups)               │ │
│  │  └── Null Infrastruktur, funktioniert ueberall       │ │
│  │                                                      │ │
│  │  Tier 4: OFFLINE (Lokal auf dem Geraet)              │ │
│  │  ├── Opus-MT WASM-Modelle (On-Device Translation)    │ │
│  │  ├── Whisper WASM (On-Device STT)                    │ │
│  │  ├── Browser TTS (On-Device Sprachausgabe)           │ │
│  │  └── Alles lokal, null externe Abhaengigkeiten       │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Auto-Discovery (Tier 2)
Probt 6 gaengige Router-IPs parallel:
```
192.168.8.1   (GL.iNet)
192.168.1.1   (Standard)
192.168.0.1   (Alternativ)
10.0.0.1      (Hotspots)
172.20.10.1   (iOS Personal Hotspot)
192.168.43.1  (Android Hotspot)
```

### Transport-Interface

```typescript
interface BroadcastTransport {
  type: 'supabase' | 'local-ws' | 'ble'
  isConnected: boolean
  subscribe(code: string, handlers: BroadcastHandlers): void
  broadcast(event: string, payload: Record<string, unknown>): void
  unsubscribe(): void
  onConnectionChange(cb: (connected: boolean) => void): () => void
}

interface PresenceTransport {
  type: 'supabase' | 'local-ws' | 'ble'
  join(code: string, data: PresenceState): void
  updatePresence(data: Partial<PresenceState>): void
  leave(): void
  onSync(cb: (listeners: PresenceState[]) => void): () => void
}
```

---

## 8. BLE GATT Protocol

### Service-UUIDs

| UUID | Zweck |
|------|-------|
| `d7e84cb1-...` | Discovery Service (Advertising) |
| `d7e84cb2-...` | Transport Service (GATT Server) |

### Characteristics

| UUID | Name | Typ | Richtung |
|------|------|-----|----------|
| `d7e84cb3-...` | Translation | Notify | Speaker → Listener |
| `d7e84cb4-...` | SessionInfo | Read | Speaker → Listener |
| `d7e84cb5-...` | PresenceWrite | Write | Listener → Speaker |
| `d7e84cb6-...` | PresenceSync | Notify | Speaker → Listener |

### Chunking-Protocol
```
Payload > 180 Bytes?
  ├── Ja: Split in 180-Byte Chunks
  │   ├── Chunk 1..N-1: Gesendet als einzelne Notifications
  │   └── Chunk N (letzter): Markiert als Final
  │   └── Listener: Reassembly aus Buffer
  └── Nein: Direkt als einzelne Notification
```

### Device-Discovery
- Advertising-Name Format: `GT-TR-XXXX` (Session-Code)
- Scan-Interval: Kontinuierlich
- Stale-Timeout: 10 Sekunden (nicht mehr gesehene Geraete werden entfernt)
- RSSI-Anzeige fuer Signalstaerke

### Native Implementierungen
- **Android**: `BleTransportPlugin.java` — `BluetoothGattServer`, Android 12+ Permission Decorators
- **iOS**: `BleTransportPlugin.swift` — `CBPeripheralManager`, CoreBluetooth Framework

---

## 9. Hotspot-Relay-Server

### Architektur

```
┌─────────────────────────────────────────────┐
│         SPEAKER-GERAET (Host)               │
│                                             │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │ App (WebView)    │  │ Native Plugin   │  │
│  │ ┌─────────────┐  │  │ ┌─────────────┐│  │
│  │ │ Translation  │  │  │ │ WiFi AP     ││  │
│  │ │ Pipeline     │──┤  │ │ (Hotspot)   ││  │
│  │ └─────────────┘  │  │ └──────┬──────┘│  │
│  │ ┌─────────────┐  │  │ ┌──────┴──────┐│  │
│  │ │ WS Client   │──┤  │ │ Embedded    ││  │
│  │ │ (Speaker)    │  │  │ │ WS Relay    ││  │
│  │ └─────────────┘  │  │ │ :8765       ││  │
│  └─────────────────┘  │  └─────────────┘│  │
│                        └─────────────────┘  │
└──────────────────────┬──────────────────────┘
                       │ WiFi
            ┌──────────┼──────────┐
            │          │          │
     ┌──────┴──┐ ┌────┴────┐ ┌──┴──────┐
     │Listener │ │Listener │ │Listener │
     │   1     │ │   2     │ │  ...N   │
     └─────────┘ └─────────┘ └─────────┘
```

### Relay-Server (Node.js / Embedded Java)
- **Port**: 8765 (Standard), 8766 (Embedded Fallback)
- **Protokoll**: JSON ueber WebSocket
- **Health-Check**: `GET /health` → 200 OK
- **Features**: Session-Routing, Presence Sync, Broadcast Fan-Out

### WiFi-QR-Code
Format: `WIFI:T:WPA;S:{SSID};P:{Password};;`
- iOS 11+ / Android 10+: Automatisches Verbindungs-Prompt
- Kein manuelles Tippen noetig

---

## 10. Sicherheit & Verschluesselung

### E2E-Verschluesselung (Transport)

```
Session Code: "TR-A3K9"
        │
        ▼
┌──────────────────────┐
│  PBKDF2 Key Derivation│
│  ├── Salt: "guidetranslator-e2e-v1"
│  ├── Iterations: 100.000
│  ├── Hash: SHA-256
│  └── Output: AES-256 Key
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  AES-256-GCM          │
│  ├── IV: 12 Bytes (random)
│  ├── Auth Tag: automatisch
│  └── Encoding: Base64(IV + Ciphertext + Tag)
└──────────────────────┘
```

### Sicherheitsmerkmale
- **Web Crypto API**: Keine externe Krypto-Bibliothek
- **Key Caching**: Pro Session, cleared bei Session-Ende
- **Transparent Wrapping**: EncryptedBroadcastTransport als Decorator
- **Fallback**: Plaintext wenn Web Crypto nicht verfuegbar
- **Envelope**: `{ _encrypted: base64_ciphertext }`

### API-Key-Management
- Google API Key in localStorage (Client-seitig)
- Schluessel wird nie an Drittanbieter weitergegeben
- Env-Variable als Fallback: `VITE_GOOGLE_TTS_API_KEY`

---

## 11. Offline-Faehigkeiten

### Service Worker (Workbox)

| Cache-Strategie | Ziel | TTL |
|-----------------|------|-----|
| Precache | JS, CSS, HTML, SVG, PNG, WOFF2 | Build-Version |
| StaleWhileRevalidate | MyMemory API | 24h |
| StaleWhileRevalidate | Google Translate API | 7 Tage |
| CacheFirst | Google TTS Audio | 30 Tage |
| CacheFirst | HuggingFace Modelle | 90 Tage |
| CacheFirst | WASM Runtime | 90 Tage |
| CacheFirst | Google Fonts | 1 Jahr |

### Offline-Modelle

| Modell | Groesse | Zweck |
|--------|---------|-------|
| Opus-MT (pro Sprachpaar) | ~35 MB | Offline-Uebersetzung |
| Whisper (multilingual) | ~40 MB | Offline-Spracherkennung |
| ONNX Runtime WASM | ~21 MB | ML-Inferenz-Engine |

### Offline-Feature-Matrix

| Feature | Online | Offline |
|---------|--------|---------|
| Text-Uebersetzung | Google → MyMemory → Libre | Opus-MT (wenn heruntergeladen) |
| Spracherkennung | Web Speech / Google Cloud | Whisper (wenn heruntergeladen) |
| Sprachausgabe | Google Cloud TTS | Browser TTS |
| Live-Session | Cloud (Supabase) | Hotspot / BLE |
| Kamera-OCR | Google Vision | Nicht verfuegbar |
| Favoriten/History | Sofort | Sofort (localStorage) |
| Spracherkennung (Auto) | Nicht noetig | Unicode-Script-Analyse |

---

## 12. Native App (Capacitor)

### Konfiguration

```
App ID:       com.fintutto.translator
App Name:     Fintutto Translator
Min Android:  API 24 (Android 7.0)
Target:       API 36 (Android 15)
Min iOS:      15.0
Capacitor:    8.1.0
```

### Android-Permissions

```xml
INTERNET, ACCESS_NETWORK_STATE
RECORD_AUDIO, CAMERA
CHANGE_WIFI_STATE, ACCESS_WIFI_STATE, ACCESS_FINE_LOCATION
NEARBY_WIFI_DEVICES (SDK 33+)
BLUETOOTH, BLUETOOTH_ADMIN (SDK < 30)
BLUETOOTH_SCAN, BLUETOOTH_ADVERTISE, BLUETOOTH_CONNECT
```

### iOS-Permissions

```xml
NSMicrophoneUsageDescription
NSCameraUsageDescription
NSSpeechRecognitionUsageDescription
NSLocalNetworkUsageDescription
NSBluetoothAlwaysUsageDescription
NSBluetoothPeripheralUsageDescription
UIBackgroundModes: bluetooth-central, bluetooth-peripheral
```

### Native Plugins

| Plugin | Plattform | Zweck |
|--------|-----------|-------|
| BleTransportPlugin | Android + iOS | GATT Server fuer BLE-Transport |
| HotspotRelayPlugin | Android + iOS | Embedded WebSocket Relay + WiFi AP |
| SplashScreen | Beide | Ladebildschirm |
| StatusBar | Beide | Status-Leiste Styling |
| Keyboard | Beide | Tastatur-Events |
| Haptics | Beide | Haptisches Feedback |

### Hardware-Features (optional, nicht required)

```xml
android.hardware.camera (required="false")
android.hardware.camera.autofocus (required="false")
android.hardware.bluetooth_le (required="false")
android.hardware.wifi (required="false")
android.hardware.microphone (required="false")
```

---

## 13. Seiten & Features

### 13 Routen

| Route | Seite | Kernfunktion |
|-------|-------|-------------|
| `/` | TranslatorPage | Hauptuebersetzer mit Text, Spracheingabe, TTS, Favoriten |
| `/live` | LiveLandingPage | Session erstellen (Speaker) oder beitreten (Listener) |
| `/live/:code` | LiveSessionPage | Aktive Live-Uebersetzungssession |
| `/conversation` | ConversationPage | Face-to-Face-Uebersetzung (2 Personen, 180-Grad-Split) |
| `/camera` | CameraTranslatePage | Kamera-OCR + Sofort-Uebersetzung |
| `/phrasebook` | PhrasebookPage | 16 Zielsprachen, 18 Kategorien, Batch-Uebersetzung |
| `/favorites` | FavoritesPage | Gespeicherte Uebersetzungen mit Suche/Filter |
| `/history` | HistoryPage | Uebersetzungs-Verlauf, Export (JSON/CSV) |
| `/settings` | SettingsPage | API-Key, Offline-Modelle, Storage, Cache, Export/Import |
| `/info` | InfoPage | Feature-Showcase, Sprachliste, Transport-Architektur |
| `/impressum` | ImpressumPage | Impressum (deutsches Recht) |
| `/datenschutz` | DatenschutzPage | Datenschutzerklaerung |
| `*` | NotFoundPage | 404 |

### Hauptuebersetzer (/)

```
┌─────────────────────────────────────┐
│  Quellsprache ▼    ⟷    Zielsprache ▼  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ Text eingeben oder sprechen...  │  │
│  │                                 │  │
│  │ 🎤  📋  ⭐  🔊  Sie/Du        │  │
│  └─────────────────────────────────┘  │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ Uebersetzung erscheint hier     │  │
│  │                                 │  │
│  │ 📖 Aussprache: ...              │  │
│  │ 🔄 Alternativen: ...            │  │
│  │ Provider: Google  Match: 98%    │  │
│  │ 👍 👎  📋  🔊  ⭐              │  │
│  └─────────────────────────────────┘  │
│                                       │
│  Kontext: 🌐 ✈️ 🏥 ⚖️ 💼 💬       │
│                                       │
│  Letzte 5 Uebersetzungen:            │
│  └── [klick = wieder laden]           │
└─────────────────────────────────────┘
```

### Live-Session (/live/:code)

**Speaker-Ansicht:**
- QR-Code(s): WiFi (Hotspot) + Session-Code
- Mikrofon-Steuerung (Start/Stop)
- Echtzeit-Transkript
- Listener-Statistik (Anzahl, Sprachen, Verteilung)
- Latenz-Monitoring (STT/Translate/Total)
- Session-Protokoll Export (TXT/MD)
- BLE-Advertising-Status

**Listener-Ansicht:**
- Grosse Uebersetzungsanzeige (2xl-3xl)
- Sprachauswahl-Chips
- Auto-Speak Toggle
- Vollbild-Untertitel-Modus (3xl-6xl, schwarzer Hintergrund)
- Letzte 5 Untertitel mit Fade-Effekt
- Verbindungsstatus-Indikator

### Gespraechsmodus (/conversation)
- Split-Screen mit 180-Grad-Rotation
- Zwei unabhaengige Spracherkennungs-Instanzen
- Auto-Speak: Uebersetzt und liest automatisch vor
- 6 Nachrichten pro Person sichtbar
- RTL-Text-Unterstuetzung

---

## 14. Datenfluss-Diagramme

### Live-Session: Speaker → Listeners

```
SPEAKER                                    LISTENERS
┌──────┐                                   ┌──────┐
│ Mic  │                                   │ Lang │
│ Input│                                   │Select│
└──┬───┘                                   └──┬───┘
   │                                          │
   ▼                                          │
┌──────────┐                                  │
│ STT      │ (Web Speech / Google / Whisper)  │
│ Engine   │                                  │
└──┬───────┘                                  │
   │ text + isFinal                           │
   ▼                                          │
┌──────────┐                                  │
│Translate │ (Fan-Out: 1x pro Listener-Sprache)
│Pipeline  │◄─────────────────────────────────┘
└──┬───────┘   targetLanguage
   │ TranslationChunk
   ▼
┌────────────────┐
│ Transport      │ (Cloud / Local WS / BLE GATT)
│ .broadcast()   │
└──┬─────────────┘
   │
   ├──► Listener 1 (DE) → TTS → Lautsprecher
   ├──► Listener 2 (AR) → TTS → Lautsprecher
   └──► Listener N (FR) → TTS → Lautsprecher
```

### Latenz-Pipeline

```
markSTTStart() ──► STT Processing ──► markSTTEnd()
                                           │
markTranslateStart() ──► API Call ──► markTranslateEnd()
                                           │
                              markBroadcast() ──► Transport
                                           │
                   markTTSStart() ──► TTS ──► markTTSEnd()
                                           │
                                    LatencyReport {
                                      sttMs, translateMs,
                                      broadcastMs, ttsMs,
                                      totalMs, provider
                                    }
```

---

## 15. Performance & Metriken

### Bundle-Groessen

| Chunk | Groesse | Gzip |
|-------|---------|------|
| Main Bundle (index) | 369 KB | 116 KB |
| Transformers | 502 KB | 129 KB |
| ONNX Runtime | 398 KB | 109 KB |
| Supabase | 173 KB | 46 KB |
| WASM Binary | 21.596 KB | 5.087 KB |
| CSS | 33 KB | 7 KB |
| **Total (ohne WASM)** | **~1.475 KB** | **~407 KB** |

### Speicheranforderungen

| Szenario | Storage |
|----------|---------|
| Basis-App (PWA) | ~5 MB |
| + 1 Offline-Sprachpaar | +35 MB |
| + Whisper STT | +40 MB |
| + TTS Audio Cache | +10-50 MB |
| **Voll-Offline** | **~200 MB** |

### Latenz-Ziele

| Pipeline-Schritt | Ziel | Typisch |
|-----------------|------|---------|
| STT (Web Speech) | <200ms | 50-150ms |
| Translation (Google) | <300ms | 100-250ms |
| Broadcast (Cloud) | <50ms | 10-30ms |
| TTS (Neural2) | <500ms | 200-400ms |
| **Total E2E** | **<1000ms** | **400-800ms** |

---

## 16. Test-Abdeckung

### 87 Tests, 7 Test-Suiten

| Suite | Tests | Bereich |
|-------|-------|---------|
| connection-manager.test.ts | 17 | Transport-Auswahl, Health-Checks |
| crypto.test.ts | 9 | AES-256-GCM Encrypt/Decrypt |
| local-ws-transport.test.ts | 14 | WebSocket Broadcast + Presence |
| encrypted-transport.test.ts | 9 | E2E-Encryption Wrapper |
| translate.test.ts | 8 | Provider-Kaskade, Circuit Breaker |
| detect-language.test.ts | 20 | Spracherkennung (20 Sprachen) |
| latency.test.ts | 10 | Pipeline-Latenz-Messung |

### Build-Pipeline

```bash
npm run build     # tsc && vite build (12s)
npm test          # vitest run (2.2s)
npm run cap:sync  # Capacitor sync
```

---

*Dokument generiert am 01.03.2026 | Fintutto Translator v3.1.0 | Build 310*
