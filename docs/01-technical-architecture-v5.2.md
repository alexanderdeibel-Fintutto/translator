# Fintutto Translator v5.2 — Technische Architektur

## Inhaltsverzeichnis

1. [Systemuebersicht](#1-systemuebersicht)
2. [Tech Stack](#2-tech-stack)
3. [Multi-App-Architektur (16 Varianten)](#3-multi-app-architektur-16-varianten)
4. [Marktsegmente & Spezialisierungen](#4-marktsegmente--spezialisierungen)
5. [Sprachunterstuetzung](#5-sprachunterstuetzung)
6. [Uebersetzungs-Pipeline](#6-uebersetzungs-pipeline)
7. [Speech-to-Text (STT)](#7-speech-to-text-stt)
8. [Text-to-Speech (TTS)](#8-text-to-speech-tts)
9. [Transport-Architektur (4 Tiers)](#9-transport-architektur-4-tiers)
10. [BLE GATT Protocol](#10-ble-gatt-protocol)
11. [Hotspot-Relay-Server](#11-hotspot-relay-server)
12. [Sicherheit & Verschluesselung](#12-sicherheit--verschluesselung)
13. [Offline-Faehigkeiten](#13-offline-faehigkeiten)
14. [Native App (Capacitor)](#14-native-app-capacitor)
15. [Seiten & Features](#15-seiten--features)
16. [Admin Dashboard](#16-admin-dashboard)
17. [Monorepo & Build-System](#17-monorepo--build-system)
18. [Datenfluss-Diagramme](#18-datenfluss-diagramme)
19. [Performance & Metriken](#19-performance--metriken)
20. [Test-Abdeckung](#20-test-abdeckung)

---

## 1. Systemuebersicht

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FINTUTTO TRANSLATOR v5.2                          │
│                  16 App-Varianten · 7 Maerkte                        │
│                                                                      │
│  PWA (Browser) ──── Capacitor (Android/iOS) ──── Relay Server        │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐        │
│  │ React 18 │  │ Vite 6   │  │ Tailwind │  │ Capacitor 8   │        │
│  │ TypeScript│  │ PWA      │  │ Radix UI │  │ Android + iOS │        │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  MONOREPO (pnpm + Turborepo)                                 │    │
│  │  src/ (Shared Core) + apps/ (16 marktspezifische Varianten)  │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │            TRANSPORT LAYER (4-Tier Fallback)                  │    │
│  │  Tier 1: Cloud (Supabase Realtime)                            │    │
│  │  Tier 2: Hotspot (Embedded WebSocket + WiFi AP)               │    │
│  │  Tier 3: BLE GATT (Direct Bluetooth, 0 Infrastruktur)        │    │
│  │  Tier 4: Offline (Lokale ML-Modelle, kein Netzwerk)           │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │            TRANSLATION ENGINE (Cascade)                       │    │
│  │  1. Google Cloud Translation API                              │    │
│  │  2. MyMemory Translation Memory (Free Fallback)               │    │
│  │  3. LibreTranslate (Open Source Fallback)                     │    │
│  │  4. Opus-MT via Transformers.js (Offline, On-Device)          │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │            7 MARKTSEGMENTE                                    │    │
│  │  General · Schools · Authorities · NGO · Hospitality          │    │
│  │  Medical · Events/Conferences                                 │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
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
| Radix UI | latest | Accessible Primitives (Dialog, Dropdown, Tabs, Select, Tooltip, Separator, Label) |
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

### Build & Monorepo

| Technologie | Zweck |
|-------------|-------|
| pnpm | Paketmanager (Workspace-Monorepo) |
| Turborepo | Task-Orchestrierung (parallele Builds) |
| Vitest | Unit- und Integrationstests |

### Storage / Caching

| Technologie | Zweck | TTL |
|-------------|-------|-----|
| IndexedDB (idb 8.0.3) | Translation Cache, TTS Audio Cache | 30 Tage |
| localStorage | Einstellungen, History, Favoriten, API Key | Permanent |
| Service Worker (Workbox) | Statische Assets, API-Responses | 24h-365 Tage |
| In-Memory Cache | Translation Dedup, Circuit Breaker | 5 Min |

---

## 3. Multi-App-Architektur (16 Varianten)

### Architektur-Prinzip

Eine gemeinsame Codebasis (`src/`) wird ueber `app.config.ts` in 16 marktspezifische App-Varianten kompiliert. Jede Variante hat eigenes Branding, eigene Farben, eigenes Icon-Set und eigene Capacitor-Konfiguration.

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED CODEBASE (src/)                     │
│  components/ · pages/ · lib/ · hooks/ · context/ · i18n/     │
│  41.436 Zeilen TypeScript · 295 Dateien                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 app.config.ts (16 Varianten)                 │
│                                                              │
│  4 Core Apps:           12 Markt-Varianten:                  │
│  ├── consumer           ├── school-teacher / school-student  │
│  ├── listener           ├── authority-clerk / authority-vis. │
│  ├── enterprise         ├── ngo-helper / ngo-client          │
│  └── landing            ├── counter-staff / counter-guest    │
│                         ├── medical-staff / medical-patient  │
│                         └── conf-speaker / conf-listener     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    apps/ (Markt-Verzeichnisse)                │
│  Jede App hat: src/pages/ · package.json · vite.config.ts    │
│  · capacitor.config.ts · eigenes Icon-Set                    │
└─────────────────────────────────────────────────────────────┘
```

### 4 Core App-Typen (Basis)

| Core App | Zweck | Typ |
|----------|-------|-----|
| **consumer** | Vollstaendiger Uebersetzer fuer Endbenutzer (Free/Pro) | Speaker + Translator |
| **listener** | Minimaler Empfaenger (QR-Join + Live-Stream) | Listener only |
| **enterprise** | Session-Management fuer Speaker/Techniker | Speaker + Admin |
| **landing** | Marketing- und Produktseite | Website |

### 16 App-Varianten

| # | Variante | Basis | Markt | App Name | App ID |
|---|----------|-------|-------|----------|--------|
| 1 | consumer | consumer | General | Fintutto Translator | com.fintutto.translator |
| 2 | listener | listener | General | Fintutto Live | com.fintutto.live |
| 3 | enterprise | enterprise | General | Fintutto Enterprise | com.fintutto.enterprise |
| 4 | landing | landing | General | Fintutto Translator | de.fintutto.translator |
| 5 | school-teacher | enterprise | Schools | School Translator - Lehrer | cloud.fintutto.school.teacher |
| 6 | school-student | listener | Schools | School Translator | cloud.fintutto.school.student |
| 7 | authority-clerk | enterprise | Authorities | Amt Translator - Sachbearbeiter | cloud.fintutto.authority.clerk |
| 8 | authority-visitor | listener | Authorities | Amt Translator | cloud.fintutto.authority.visitor |
| 9 | ngo-helper | enterprise | NGO | Refugee Translator - Helfer | cloud.fintutto.ngo.helper |
| 10 | ngo-client | listener | NGO | Refugee Translator | cloud.fintutto.ngo.client |
| 11 | counter-staff | enterprise | Hospitality | Counter Translator - Mitarbeiter | cloud.fintutto.counter.staff |
| 12 | counter-guest | listener | Hospitality | Counter Translator | cloud.fintutto.counter.guest |
| 13 | medical-staff | enterprise | Medical | Medical Translator - Personal | cloud.fintutto.medical.staff |
| 14 | medical-patient | listener | Medical | Medical Translator | cloud.fintutto.medical.patient |
| 15 | conference-speaker | enterprise | Events | Conference Translator - Speaker | cloud.fintutto.conference.speaker |
| 16 | conference-listener | listener | Events | Conference Translator | cloud.fintutto.conference.listener |

---

## 4. Marktsegmente & Spezialisierungen

### 7 Marktsegmente

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINTUTTO MARKT-MATRIX                          │
│                                                                  │
│  GENERAL        SCHOOLS        AUTHORITIES    NGO/REFUGEE        │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │consumer  │   │teacher   │   │clerk     │   │helper    │     │
│  │listener  │   │student   │   │visitor   │   │client    │     │
│  │enterprise│   └──────────┘   └──────────┘   └──────────┘     │
│  │landing   │                                                   │
│  └──────────┘   HOSPITALITY    MEDICAL        EVENTS            │
│                 ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│                 │staff     │   │staff     │   │speaker   │     │
│                 │guest     │   │patient   │   │listener  │     │
│                 └──────────┘   └──────────┘   └──────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Markt-Details

| Segment | Speaker App | Listener App | Primeaer-Branche | Key Features |
|---------|------------|-------------|-----------------|--------------|
| **General** | consumer, enterprise | listener | B2C Endverbraucher | Vollstaendiger Uebersetzer, alle Features |
| **Schools** | school-teacher | school-student | Willkommensklassen, VHS, Sprachkurse | Live-Broadcast im Unterricht, Auto-Speak, Elterngespraeche |
| **Authorities** | authority-clerk | authority-visitor | Auslaenderbehoerden, Sozialamt, Jobcenter | Gespraechsmodus, 10 Migrationssprachen, Phrasebook |
| **NGO/Refugee** | ngo-helper | ngo-client | Erstaufnahme, Beratungsstellen, Integrationshilfe | Kostenlos, Offline-First, Briefing-Broadcast |
| **Hospitality** | counter-staff | counter-guest | Hotels, Empfang, Messen, Einzelhandel, Gastronomie | Bidirektionale Uebersetzung, Counter-Modus, Tourismussprachen |
| **Medical** | medical-staff | medical-patient | Krankenhaeuser, Arztpraxen, Apotheken, Pflegeheime | Med. Phrasebook, Schmerzskala, Datenschutz-Modus, Notfall-Phrasen |
| **Events** | conference-speaker | conference-listener | Konferenzen, Gottesdienste, Messen, Grossevents | Multi-Kanal, 500+ Listener, Cloud-Skalierung, Protokoll-Export |

### Marktspezifische Icon-Sets

Jeder Markt hat ein dediziertes Icon-Set unter `public/icons/`:

| Verzeichnis | Markt | Stil |
|-------------|-------|------|
| `public/icons/core/` | General | Blau, universell |
| `public/icons/school/` | Schools | Blau, Bildung-Symbole |
| `public/icons/authority/` | Authorities | Teal, Behoerden-Stil |
| `public/icons/ngo/` | NGO/Refugee | Orange, Hilfs-Symbole |
| `public/icons/counter/` | Hospitality | Violett, Service-Symbole |
| `public/icons/medical/` | Medical | Rot, medizinische Symbole |
| `public/icons/conference/` | Events | Dunkelblau, Konferenz-Symbole |

---

## 5. Sprachunterstuetzung

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

### Marktspezifische Sprachprioritaeten

| Markt | Prioritaets-Sprachen |
|-------|---------------------|
| Schools | DE, AR, FA, UK, TR, PL, RU + alle Migrationssprachen |
| Authorities | DE + alle 10 Migrationssprachen + TR, RU, UK, PL |
| NGO/Refugee | Alle 10 Migrationssprachen + DE, EN |
| Medical | DE, EN, AR, FA, TR, RU, UK, PL + Migrationssprachen |
| Hospitality | DE, EN, FR, ES, IT, ZH, JA, KO, TH + Tourismussprachen |
| Events | Alle 45 Sprachen gleichzeitig |

---

## 6. Uebersetzungs-Pipeline

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

## 7. Speech-to-Text (STT)

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

## 8. Text-to-Speech (TTS)

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

## 9. Transport-Architektur (4 Tiers)

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

## 10. BLE GATT Protocol

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

## 11. Hotspot-Relay-Server

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

## 12. Sicherheit & Verschluesselung

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

## 13. Offline-Faehigkeiten

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

## 14. Native App (Capacitor)

### Konfiguration

```
App ID:       com.fintutto.translator (+ 15 weitere IDs)
App Name:     Fintutto Translator (marktabhaengig)
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

---

## 15. Seiten & Features

### 28 Seiten (Core + Markt-spezifisch)

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
| `/features` | FeaturesPage | Detaillierte Feature-Uebersicht |
| `/pricing` | PricingOverviewPage | Preise und Tarife |
| `/solutions` | SolutionsPage | Branchenloesungen |
| `/technology` | TechnologyPage | Technologie-Details |
| `/about` | AboutPage | Ueber Fintutto |
| `/contact` | ContactPage | Kontaktformular |
| `/account` | AccountPage | Benutzerkonto |
| `/auth` | AuthPage | Login/Registrierung |
| `/admin` | AdminPage | Admin-Dashboard |
| `/investor` | InvestorPage | Investor-Informationen |
| `/sales` | SalesLandingPage | Vertrieb und Lead-Generierung |
| `/competitor` | CompetitorPage | Wettbewerbsvergleich |
| `/crm-login` | CrmLoginPage | CRM-Login |
| `/listen/:code` | ListenerSessionPage | Listener-Ansicht einer Session |
| `/impressum` | ImpressumPage | Impressum (deutsches Recht) |
| `/datenschutz` | DatenschutzPage | Datenschutzerklaerung |
| `*` | NotFoundPage | 404 |

---

## 16. Admin Dashboard

Separates Next.js-Dashboard fuer Verwaltung und Analytics:

```
/admin-dashboard/
├── app/
│   ├── api/ (Next.js API routes fuer Events, Metriken)
│   └── dashboard/ (Dashboard-Seiten)
├── components/ (Dashboard UI-Komponenten)
├── lib/ (Hilfsfunktionen)
└── supabase/ (DB-Queries)
```

### Features
- Event-Management (Sessions erstellen/verwalten)
- Lead-Management (CRM)
- Nutzung-Analytics (Metriken, Diagramme)
- Nutzer-Verwaltung (Admin-Create, Rollen)

---

## 17. Monorepo & Build-System

### Verzeichnisstruktur

```
/translator
├── src/                  (Shared Core: 295 TypeScript-Dateien)
│   ├── components/       (UI-Komponenten: admin, layout, live, market, pricing, sales, settings, translator, ui)
│   ├── pages/            (28 Seiten)
│   ├── lib/              (translate, tts, stt, i18n, offline, transport)
│   ├── hooks/            (Custom React Hooks)
│   ├── context/          (State Management)
│   └── App.tsx           (Haupt-Router)
├── apps/                 (16 marktspezifische Varianten)
│   ├── consumer/         (Full Translator B2C)
│   ├── listener/         (Minimal Receiver)
│   ├── enterprise/       (Session Management)
│   ├── landing/          (Marketing-Seite)
│   ├── school-teacher/   (Lehrer-App)
│   ├── school-student/   (Schueler-App)
│   ├── authority-clerk/  (Sachbearbeiter-App)
│   ├── authority-visitor/ (Besucher-App)
│   ├── ngo-helper/       (Helfer-App)
│   ├── ngo-client/       (Klienten-App)
│   ├── counter-staff/    (Mitarbeiter-App)
│   ├── counter-guest/    (Gast-App)
│   ├── medical-staff/    (Aerzte/Pflege-App)
│   ├── medical-patient/  (Patienten-App)
│   ├── conference-speaker/ (Speaker-App)
│   └── conference-listener/ (Zuhoerer-App)
├── admin-dashboard/      (Next.js Admin-Panel)
├── api/                  (Standalone API-Endpunkte)
├── supabase/             (Edge Functions + Migrations)
├── relay-server/         (Self-hosted WebSocket Relay)
├── ios/                  (Xcode-Projekt)
├── android/              (Android-Projekt)
├── public/icons/         (7 marktspezifische Icon-Sets)
├── app.config.ts         (Master-Konfiguration 16 Varianten)
├── pnpm-workspace.yaml   (Monorepo-Definition)
├── turbo.json            (Task-Orchestrierung)
├── vite.config.ts        (Build-Konfiguration)
└── vite.shared.ts        (Shared Vite-Config)
```

### 60+ Build-Scripts (package.json)

```bash
# Core Apps
npm run dev               # Root PWA
npm run dev:consumer      # Consumer App
npm run dev:listener      # Listener App
npm run dev:enterprise    # Enterprise App
npm run dev:landing       # Landing Page

# Market Apps (jeweils dev + build)
npm run dev:school-teacher / build:school-teacher
npm run dev:school-student / build:school-student
npm run dev:authority-clerk / build:authority-clerk
npm run dev:authority-visitor / build:authority-visitor
npm run dev:ngo-helper / build:ngo-helper
npm run dev:ngo-client / build:ngo-client
npm run dev:counter-staff / build:counter-staff
npm run dev:counter-guest / build:counter-guest
npm run dev:medical-staff / build:medical-staff
npm run dev:medical-patient / build:medical-patient
npm run dev:conference-speaker / build:conference-speaker
npm run dev:conference-listener / build:conference-listener

# Bulk
npm run build:markets     # Baut alle 12 Markt-Apps parallel
```

### Backend-Services

| Service | Ort | Technologie |
|---------|-----|-------------|
| contact API | `/api/contact.ts` | Vercel Edge Function |
| translate API | `/api/translate.ts` | Vercel Edge Function |
| TTS API | `/api/tts.ts` | Vercel Edge Function |
| admin-create-user | `/supabase/functions/` | Supabase Edge Function |
| send-email | `/supabase/functions/` | Supabase Edge Function |
| stripe-checkout | `/supabase/functions/` | Supabase Edge Function |
| stripe-portal | `/supabase/functions/` | Supabase Edge Function |
| stripe-webhook | `/supabase/functions/` | Supabase Edge Function |
| Relay Server | `/relay-server/` | Node.js WebSocket |

---

## 18. Datenfluss-Diagramme

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

## 19. Performance & Metriken

### Codebase-Metriken

| Metrik | Wert |
|--------|------|
| **TypeScript-Zeilen** | 41.436 |
| **TypeScript-Dateien** | 295 |
| **App-Varianten** | 16 |
| **Marktsegmente** | 7 |
| **Seiten** | 28 |
| **UI-Sprachen** | 9 (DE, EN, FR, ES, RU, UK, AR, FA, TR) |

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

## 20. Test-Abdeckung

### 87+ Tests, 7+ Test-Suiten

| Suite | Tests | Bereich |
|-------|-------|---------|
| connection-manager.test.ts | 17 | Transport-Auswahl, Health-Checks |
| crypto.test.ts | 9 | AES-256-GCM Encrypt/Decrypt |
| local-ws-transport.test.ts | 14 | WebSocket Broadcast + Presence |
| encrypted-transport.test.ts | 9 | E2E-Encryption Wrapper |
| translate.test.ts | 8 | Provider-Kaskade, Circuit Breaker |
| detect-language.test.ts | 20 | Spracherkennung (20 Sprachen) |
| latency.test.ts | 10 | Pipeline-Latenz-Messung |
| market/ (__tests__) | div. | Marktspezifische Komponenten |

### Build-Pipeline

```bash
npm run build     # tsc && vite build (12s)
npm test          # vitest run (2.2s)
npm run cap:sync  # Capacitor sync
npm run build:markets  # Alle 12 Markt-Apps (parallel via Turborepo)
```

---

*Dokument generiert am 16.03.2026 | Fintutto Translator v5.2.0 | Build 520*
