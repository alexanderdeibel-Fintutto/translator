# Fintutto Translator — Abschlussbericht

**Datum:** 23. Februar 2026
**Projekt:** Fintutto Translator
**Version:** 2.0 (Vollständiger Rewrite)
**Status:** Funktionsfähiger Prototyp

---

## Inhaltsverzeichnis

1. [Executive Summary](#1-executive-summary)
2. [Projektübersicht](#2-projektübersicht)
3. [Architektur & Technologie-Stack](#3-architektur--technologie-stack)
4. [Feature-Dokumentation](#4-feature-dokumentation)
5. [Live-Session-System](#5-live-session-system)
6. [Sprachunterstützung](#6-sprachunterstützung)
7. [API-Integrationen & Resilienz](#7-api-integrationen--resilienz)
8. [Sicherheitsbewertung](#8-sicherheitsbewertung)
9. [Wettbewerbsanalyse: Wordly](#9-wettbewerbsanalyse-wordly)
10. [Kostenanalyse](#10-kostenanalyse)
11. [Entwicklungshistorie & Transformation](#11-entwicklungshistorie--transformation)
12. [Offene Punkte & Empfehlungen](#12-offene-punkte--empfehlungen)

---

## 1. Executive Summary

### Was der Fintutto Translator HEUTE ist

Der Fintutto Translator ist eine **vollständig funktionsfähige, webbasierte Übersetzungs-App** mit folgenden Kernfähigkeiten:

- **Echtzeit-Textübersetzung** in 22 Sprachen via Dual-Provider-System (MyMemory + LibreTranslate)
- **Spracheingabe** per Mikrofon (Web Speech API, Chrome/Edge)
- **Hochwertige Sprachausgabe** via Google Cloud TTS (Neural2/WaveNet-Stimmen) mit Browser-Fallback
- **Live-Sessions** für Echtzeit-Gruppenübersetzung (Speaker → mehrere Listener gleichzeitig)
- **Progressive Web App (PWA)** mit Offline-Caching und Installierbarkeit
- **Professionelle UI** mit Dark Mode, responsivem Design und deutschem Interface

### Transformation seit der Architektur-Revision

| Aspekt | Alter Zustand (vor Revision) | Aktueller Zustand |
|--------|------------------------------|-------------------|
| **Übersetzung** | Nicht vorhanden | 22 Sprachen, Dual-Provider mit Circuit Breaker |
| **Sprachausgabe (TTS)** | Nicht vorhanden | Google Cloud TTS (Neural2/WaveNet) + Browser-Fallback |
| **Spracheingabe (STT)** | Nicht vorhanden | Web Speech API mit Mikrofon-Management |
| **Live-Sessions** | Nicht vorhanden | Supabase Realtime mit Broadcast + Presence |
| **Codestruktur** | 2 monolithische JSX-Dateien (1.600+ Zeilen) | 21+ TypeScript-Module, modulare Hooks-Architektur |
| **Sprache** | JavaScript (JSX) | TypeScript (TSX) |
| **Offline** | Nicht vorhanden | PWA mit Service Worker und Runtime-Caching |
| **Styling** | Inline-Styles | Tailwind CSS + shadcn/ui |
| **State Management** | Flaches useState | Custom Hooks mit Ref-basiertem State |

### Kennzahlen

| Metrik | Wert |
|--------|------|
| Produktiver Code | ~2.400 Zeilen TypeScript |
| Komponenten/Seiten | 15+ |
| Custom Hooks | 6 |
| Unterstützte Sprachen | 22 |
| Übersetzungs-Provider | 2 (MyMemory + LibreTranslate) |
| TTS-Provider | 2 (Google Cloud + Browser) |
| API-Integrationen | 4 (MyMemory, LibreTranslate, Google Cloud TTS, Supabase) |
| npm-Pakete | 25+ |

---

## 2. Projektübersicht

### 2.1 Zweck

Der Fintutto Translator dient als kostenloser Online-Übersetzer mit dem Fokus auf:

1. **Textübersetzung** — Eingabe per Tastatur oder Mikrofon, Ausgabe als Text und Audio
2. **Live-Gruppenübersetzung** — Ein Sprecher wird in Echtzeit für mehrere Zuhörer in deren jeweilige Sprache übersetzt

Der primäre Use Case ist die Übersetzung bei Kreuzfahrt-Landausflügen, wo ein Guide in seiner Sprache spricht und Gäste die Übersetzung in ihrer Sprache auf dem Smartphone hören.

### 2.2 Zielgruppen

- **Kreuzfahrt-Reedereien** — Ersetzen/ergänzen menschliche Dolmetscher bei Landausflügen
- **Guides/Reiseleiter** — Sprechen in ihrer Sprache, Gäste hören in ihrer
- **Endnutzer/Gäste** — Scannen QR-Code, wählen Sprache, hören Übersetzung

### 2.3 Deployment

- **Plattform:** Vercel (Static SPA)
- **Domain:** translator.fintutto.cloud
- **PWA:** Installierbar auf allen Geräten
- **Browser-Support:** Chrome, Edge, Safari, Firefox (Spracheingabe nur Chrome/Edge)

---

## 3. Architektur & Technologie-Stack

### 3.1 Technologie-Stack

```
Frontend:     React 18.2.0 + TypeScript 5.2.2
Bundler:      Vite 5.1.6
Styling:      Tailwind CSS 3.4.1 + shadcn/ui (Radix UI)
Animation:    Framer Motion 11.0.8
Realtime:     Supabase Realtime (Broadcast + Presence)
TTS:          Google Cloud Text-to-Speech API
Translation:  MyMemory API + LibreTranslate API (Fallback)
STT:          Web Speech API (Browser-nativ)
QR-Codes:     qrcode.react 4.2.0
Icons:        Lucide React 0.358.0
PWA:          vite-plugin-pwa + Workbox
```

### 3.2 Projektstruktur

```
/home/user/translator/
├── src/
│   ├── components/
│   │   ├── layout/                 # Header, Footer, Layout-Wrapper
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── translator/             # Hauptübersetzungs-UI
│   │   │   ├── TranslationPanel.tsx    (363 Zeilen) — Dual-Panel Übersetzung
│   │   │   ├── LanguageSelector.tsx    — 22-Sprachen-Dropdown
│   │   │   ├── QuickPhrases.tsx        — Schnelle Redewendungen
│   │   │   └── TranslationHistory.tsx  — Lokaler Verlauf
│   │   ├── live/                   # Live-Session-Komponenten
│   │   │   ├── SpeakerView.tsx         (97 Zeilen)  — Speaker-Controls + QR
│   │   │   ├── ListenerView.tsx        (113 Zeilen) — Live-Anzeige
│   │   │   ├── LanguageChips.tsx       — Sprachauswahl-Chips
│   │   │   ├── ListenerStatus.tsx      — Verbundene Zuhörer
│   │   │   ├── LiveTranscript.tsx      — Nachrichten-Verlauf
│   │   │   ├── SessionCodeInput.tsx    — Code-Eingabe
│   │   │   └── SessionQRCode.tsx       — QR-Code-Generator
│   │   └── ui/                     # Radix-UI-Basiskomponenten
│   │       ├── button.tsx, card.tsx, dialog.tsx, ...
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useSpeechRecognition.ts     (192 Zeilen) — Web Speech API
│   │   ├── useSpeechSynthesis.ts       (147 Zeilen) — Cloud TTS + Browser
│   │   ├── useLiveSession.ts           (244 Zeilen) — Session-Orchestrierung
│   │   ├── useBroadcast.ts             (134 Zeilen) — Supabase Broadcast
│   │   ├── usePresence.ts              (81 Zeilen)  — Anwesenheits-Tracking
│   │   └── useTranslationHistory.ts    (64 Zeilen)  — Verlaufs-Verwaltung
│   ├── lib/                        # Kern-Bibliotheken
│   │   ├── translate.ts                (168 Zeilen) — Übersetzungs-Engine
│   │   ├── tts.ts                      (97 Zeilen)  — Google Cloud TTS
│   │   ├── languages.ts                (37 Zeilen)  — Sprach-Definitionen
│   │   ├── session.ts                  (52 Zeilen)  — Session-Verwaltung
│   │   ├── supabase.ts                 (7 Zeilen)   — Supabase-Client
│   │   └── utils.ts                    — Utility-Funktionen
│   ├── pages/                      # Routen-Seiten
│   │   ├── TranslatorPage.tsx          (86 Zeilen)  — Hauptübersetzung
│   │   ├── LiveLandingPage.tsx         (75 Zeilen)  — Live-Session-Einstieg
│   │   ├── LiveSessionPage.tsx         (64 Zeilen)  — Aktive Session
│   │   └── InfoPage.tsx                (116 Zeilen) — Informationsseite
│   ├── App.tsx                     (30 Zeilen)  — Routing
│   ├── main.tsx                    — React Entry Point
│   └── index.css                   — Globale Styles
├── package.json
├── vite.config.ts                  (72 Zeilen)  — PWA-Konfiguration
├── tailwind.config.js
├── tsconfig.json
├── index.html
└── vercel.json
```

### 3.3 Architektur-Diagramm (IST-Zustand)

```
┌──────────────────────────────────────────────────────────────┐
│                       Browser (PWA)                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              React SPA (Vite + TypeScript)               │ │
│  │                                                          │ │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐ │ │
│  │  │ Translator   │  │ Live Landing  │  │ Live Session │ │ │
│  │  │ Page         │  │ Page          │  │ Page         │ │ │
│  │  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘ │ │
│  │         │                  │                  │          │ │
│  │  ┌──────▼──────────────────▼──────────────────▼───────┐ │ │
│  │  │              Custom Hooks Layer                     │ │ │
│  │  │  useSpeechRecognition  useSpeechSynthesis           │ │ │
│  │  │  useLiveSession        useBroadcast                 │ │ │
│  │  │  usePresence           useTranslationHistory        │ │ │
│  │  └──────┬───────────────────────────────┬─────────────┘ │ │
│  └─────────┼───────────────────────────────┼───────────────┘ │
│            │                               │                  │
│   ┌────────▼─────────┐           ┌────────▼──────────┐      │
│   │  Web Speech API  │           │   Service Worker   │      │
│   │  (Mikrofon STT)  │           │   (PWA/Cache)      │      │
│   └──────────────────┘           └───────────────────┘      │
└────────────┬───────────────────────────────┬─────────────────┘
             │                               │
     ┌───────▼───────┐              ┌───────▼────────┐
     │  Translation   │              │   Supabase     │
     │  APIs          │              │   Realtime     │
     │                │              │                │
     │  ┌──────────┐  │              │  ┌──────────┐  │
     │  │ MyMemory │  │              │  │Broadcast │  │
     │  │ (Primär) │  │              │  │Channels  │  │
     │  └──────────┘  │              │  └──────────┘  │
     │  ┌──────────┐  │              │  ┌──────────┐  │
     │  │ Libre    │  │              │  │Presence  │  │
     │  │Translate │  │              │  │Tracking  │  │
     │  │(Fallback)│  │              │  └──────────┘  │
     │  └──────────┘  │              └────────────────┘
     └────────────────┘
             │
     ┌───────▼────────┐
     │  Google Cloud   │
     │  TTS API        │
     │  (Neural2/      │
     │   WaveNet)      │
     └────────────────┘
```

### 3.4 Datenfluss

```
STANDARD-ÜBERSETZUNG:
  Texteingabe/Mikrofon → [600ms Debounce] → MyMemory API → Übersetzung → TTS → Audio

LIVE-SESSION (Speaker):
  Mikrofon → Web Speech API → Text → translateText() (parallel für alle Sprachen)
  → Broadcast via Supabase → Alle verbundenen Listener

LIVE-SESSION (Listener):
  Supabase Channel → Filter nach Zielsprache → Textanzeige → Auto-TTS → Audio
```

---

## 4. Feature-Dokumentation

### 4.1 Textübersetzung

| Feature | Details |
|---------|---------|
| Provider | MyMemory (primär), LibreTranslate (Fallback) |
| Sprachen | 22 (siehe Abschnitt 6) |
| Eingabe | Tastatur + Mikrofon |
| Debouncing | 600ms Verzögerung vor API-Aufruf |
| Caching | 5 Minuten TTL, max. 500 Einträge im Memory |
| Qualitätsanzeige | Match-Score (%) vom Provider |
| Provider-Anzeige | Zeigt aktiven Provider und Qualitätsbewertung |

### 4.2 Spracheingabe (STT)

| Feature | Details |
|---------|---------|
| Technologie | Web Speech API (Browser-nativ) |
| Browser-Support | Chrome, Edge (einzige mit Web Speech API) |
| Echtzeit | Interim-Ergebnisse während des Sprechens |
| Mikrofon-Management | Explizite Stream-Anforderung und -Freigabe |
| Fehlerbehandlung | Permission-Denial, No-Speech, Netzwerk-Fehler |
| Auto-Restart | Neustart bei Verbindungsabbruch |

### 4.3 Sprachausgabe (TTS)

| Feature | Details |
|---------|---------|
| Primär | Google Cloud TTS (Neural2/WaveNet-Stimmen) |
| Fallback | Browser Web Speech Synthesis |
| Queue-System | Serialisierte Wiedergabe, kein Überlappen |
| Stimm-Auswahl | Sprachspezifische Stimmen mit Fallback-Kette |
| Sprechrate | 0.95 (Cloud) / 0.9 (Browser) für natürlichen Klang |
| Auto-Speak | Konfigurierbar, persistiert in localStorage |

### 4.4 Übersetzungsverlauf

| Feature | Details |
|---------|---------|
| Speicher | localStorage (persistent) |
| Max. Einträge | 50 (FIFO-Eviction) |
| Funktionen | Hinzufügen, Löschen, Komplett leeren |
| Fehlertoleranz | Stille Fehlerbehandlung bei Quota-Überschreitung |

### 4.5 Schnelle Redewendungen

- Vorgefertigte Phrasen für häufige Anwendungsfälle
- Ein-Klick-Übernahme in das Übersetzungsfeld

### 4.6 Progressive Web App

| Feature | Details |
|---------|---------|
| Service Worker | Workbox mit Auto-Update |
| Offline-Assets | JS, CSS, HTML, SVG, PNG, WOFF2 |
| API-Caching | Translation-API: StaleWhileRevalidate (1h TTL, 200 Einträge) |
| Font-Caching | Google Fonts: CacheFirst (1 Jahr TTL, 20 Einträge) |
| Installierbarkeit | Manifest mit Theme-Farbe #0369a1 |

### 4.7 Dark Mode

- Vollständiger Tailwind CSS Dark Mode
- Automatische Erkennung der Systemeinstellung
- Toggle in der Header-Navigation

---

## 5. Live-Session-System

### 5.1 Konzept

Das Live-Session-System ermöglicht die Echtzeit-Übersetzung eines Sprechers für beliebig viele Zuhörer in deren jeweilige Zielsprache.

```
                    ┌─────────────┐
                    │   Speaker   │
                    │  (Guide)    │
                    │  🎤 Deutsch │
                    └──────┬──────┘
                           │
                    Supabase Broadcast
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼───────┐ ┌─▼──────────┐
       │  Listener 1 │ │Listener 2│ │ Listener 3  │
       │  🇬🇧 Englisch │ │🇫🇷 Franz. │ │ 🇪🇸 Spanisch │
       │  📱 iPhone   │ │📱 Android│ │ 📱 Browser  │
       └─────────────┘ └──────────┘ └────────────┘
```

### 5.2 Session-Ablauf

**Speaker-Seite:**
1. Sprecher wählt Quellsprache auf der Live-Landing-Page
2. System generiert 4-stelligen Session-Code (Format: `TR-XXXX`)
3. QR-Code und Session-URL werden angezeigt
4. Sprecher startet Aufnahme per Mikrofon-Button
5. Gesprochener Text wird erkannt → in alle Listener-Sprachen übersetzt → via Supabase gebroadcastet
6. Speaker sieht Anzahl der Listener pro Sprache in Echtzeit

**Listener-Seite:**
1. Zuhörer scannt QR-Code oder gibt Session-Code ein
2. Wählt gewünschte Zielsprache
3. Empfängt übersetzte Texte in Echtzeit
4. Auto-TTS liest Übersetzungen vor (konfigurierbar)
5. Kann Zielsprache jederzeit wechseln

### 5.3 Technische Umsetzung

| Komponente | Technologie | Details |
|------------|-------------|---------|
| Broadcast | Supabase Realtime Channels | Translation-Chunks an alle Listener |
| Presence | Supabase Presence | Echtzeit-Listener-Tracking mit Geräteerkennung |
| Reconnection | Exponential Backoff | Max. 5 Versuche, 2s Basis-Delay |
| Session-Codes | 4 Zeichen (ohne 0/O/I/1/L) | Verwechslungssichere Codes |
| Geräte-Erkennung | User-Agent-Parsing | iPhone, iPad, Android, Mac, Windows, Browser |

### 5.4 Nachrichten-Typen

```typescript
// Translation-Chunk (Speaker → Listener)
{
  type: 'translation',
  text: string,           // Originaltext
  translated: string,     // Übersetzter Text
  sourceLang: string,     // Quellsprache
  targetLang: string,     // Zielsprache
  timestamp: number
}

// Session-Info (Metadaten)
{
  type: 'session_info',
  listenerCount: number,
  speakerLang: string,
  isRecording: boolean
}

// Status-Nachricht (Session-Ende etc.)
{
  type: 'status',
  message: string
}
```

---

## 6. Sprachunterstützung

### 6.1 Unterstützte Sprachen (22)

| Code | Sprache | Nativ | Flag | Speech-Code |
|------|---------|-------|------|-------------|
| DE | Deutsch | Deutsch | 🇩🇪 | de-DE |
| EN | Englisch | English | 🇬🇧 | en-US |
| FR | Französisch | Français | 🇫🇷 | fr-FR |
| ES | Spanisch | Español | 🇪🇸 | es-ES |
| IT | Italienisch | Italiano | 🇮🇹 | it-IT |
| PT | Portugiesisch | Português | 🇵🇹 | pt-PT |
| NL | Niederländisch | Nederlands | 🇳🇱 | nl-NL |
| PL | Polnisch | Polski | 🇵🇱 | pl-PL |
| TR | Türkisch | Türkçe | 🇹🇷 | tr-TR |
| RU | Russisch | Русский | 🇷🇺 | ru-RU |
| UK | Ukrainisch | Українська | 🇺🇦 | uk-UA |
| AR | Arabisch | العربية | 🇸🇦 | ar-XA |
| ZH | Chinesisch | 中文 | 🇨🇳 | cmn-CN |
| JA | Japanisch | 日本語 | 🇯🇵 | ja-JP |
| KO | Koreanisch | 한국어 | 🇰🇷 | ko-KR |
| HI | Hindi | हिन्दी | 🇮🇳 | hi-IN |
| SV | Schwedisch | Svenska | 🇸🇪 | sv-SE |
| DA | Dänisch | Dansk | 🇩🇰 | da-DK |
| CS | Tschechisch | Čeština | 🇨🇿 | cs-CZ |
| RO | Rumänisch | Română | 🇷🇴 | ro-RO |
| EL | Griechisch | Ελληνικά | 🇬🇷 | el-GR |
| HU | Ungarisch | Magyar | 🇭🇺 | hu-HU |

### 6.2 Stimm-Zuordnung (Google Cloud TTS)

Jede Sprache hat eine priorisierte Stimmenkonfiguration:
- **Bevorzugt:** Neural2-Stimmen (natürlichster Klang)
- **Fallback:** WaveNet-Stimmen
- **Letzter Fallback:** Standard-Stimmen

Beispiel: `de-DE` → `de-DE-Neural2-B` (männlich, Neural2-Qualität)

---

## 7. API-Integrationen & Resilienz

### 7.1 Übersetzungs-Engine

```
Request → Cache-Check → [Cache Hit] → Sofortige Rückgabe
                      → [Cache Miss] → MyMemory API
                                        → [Erfolg] → Cache + Rückgabe
                                        → [Fehler] → Circuit Breaker Check
                                                      → LibreTranslate (Fallback)
                                                        → [Erfolg] → Cache + Rückgabe
                                                        → [Fehler] → Fehler-Rückgabe
```

**Circuit Breaker:**
- Nach 3 aufeinanderfolgenden MyMemory-Fehlern: Automatischer Wechsel zu LibreTranslate
- Cooldown: 30 Sekunden, dann erneuter Versuch mit MyMemory
- Verhindert Kaskadenfehler bei API-Ausfällen

**Caching:**
- In-Memory-Cache mit 5-Minuten-TTL
- Max. 500 Einträge (älteste werden bei Überschreitung entfernt)
- Cache-Key: `sourceLang|targetLang|normalizedText`

### 7.2 Text-to-Speech

```
speakText() → Cloud TTS verfügbar?
               → [Ja] → Google Cloud TTS API → Base64-Audio → HTMLAudioElement
               → [Nein/Fehler] → Browser speechSynthesis → Stimm-Matching → Ausgabe
```

**Queue-Management:**
- Nur eine Audiodatei gleichzeitig
- Warteschlange für mehrere Anfragen
- Automatische Aufräumung von Blob-URLs

### 7.3 Supabase Realtime

**Reconnection-Strategie:**
```
Verbindungsfehler → Retry 1 (2s) → Retry 2 (4s) → Retry 3 (8s) → Retry 4 (16s) → Retry 5 (32s) → Aufgeben
```

- Exponential Backoff mit Basis-Delay von 2 Sekunden
- Max. 5 Wiederholungsversuche
- Automatische Re-Subscription nach erfolgreicher Wiederverbindung

---

## 8. Sicherheitsbewertung

### 8.1 Befunde

| # | Befund | Schwere | Datei | Details |
|---|--------|---------|-------|---------|
| 1 | Google TTS API-Key hardcoded | **HOCH** | `src/lib/tts.ts:4` | Fallback-Key im Quellcode, exponiert im Client-Bundle |
| 2 | Supabase-URL hardcoded | **MITTEL** | `src/lib/supabase.ts:3` | URL und Anon-Key als Fallback im Quellcode |
| 3 | Supabase Anon-Key hardcoded | **MITTEL** | `src/lib/supabase.ts:4` | JWT im Quellcode (Anon-Keys sind per Design öffentlich, aber Hardcoding ist schlechte Praxis) |
| 4 | Kein Rate-Limiting | **MITTEL** | Systemweit | Keine Begrenzung der API-Aufrufe pro Nutzer |
| 5 | Kein Input-Sanitizing | **NIEDRIG** | `src/lib/translate.ts` | Texte werden direkt an APIs weitergereicht |
| 6 | Keine Authentifizierung | **INFO** | Systemweit | Öffentliche App ohne Login (by Design für Gäste) |

### 8.2 Empfehlungen

1. **API-Key aus Quellcode entfernen** — Nur über Umgebungsvariablen laden, keinen Fallback-Key einbetten
2. **Backend-Proxy** — Google Cloud TTS über eigenen Backend-Endpunkt aufrufen, API-Key nur serverseitig
3. **Rate-Limiting** — Cloudflare oder Vercel Edge Functions für API-Schutz
4. **Content Security Policy** — CSP-Header für XSS-Schutz konfigurieren

### 8.3 DSGVO-Status

| Anforderung | Status |
|-------------|--------|
| Keine personenbezogenen Daten gespeichert | ✅ Erfüllt (nur localStorage, kein Server-Speicher) |
| Datenschutzerklärung | ❌ Nicht vorhanden |
| Cookie-Consent | ✅ Nicht erforderlich (keine Cookies/Tracking) |
| Drittanbieter-Übermittlung | ⚠️ MyMemory, Google Cloud — Auftragsverarbeitung klären |

---

## 9. Wettbewerbsanalyse: Wordly

### 9.1 Vergleich

| Kriterium | Fintutto Translator | Wordly |
|-----------|---------------------|--------|
| **Status** | Funktionsfähiger Prototyp | Etablierte SaaS-Plattform |
| **Sprachen** | 22 (erweiterbar auf 130+ via Google) | 60+ |
| **Nutzer** | Prototyp-Phase | 5 Mio+ Nutzer, 3.000+ Organisationen |
| **Zielgruppe** | Kreuzfahrt-Landausflüge | Events, Meetings, Konferenzen |
| **Kosten** | API-Kosten (Bruchteil/Zeichen) | $0.08–$0.30/Wort |
| **Offline** | PWA-Grundlage vorhanden | Nicht vorhanden |
| **TTS** | Google Cloud Neural2/WaveNet | Proprietär |
| **STT** | Web Speech API (Browser) | Proprietär (Multi-Engine) |
| **Setup** | QR-Code in Sekunden | QR-Code/URL in Minuten |
| **Plattform** | Web (PWA) | Web + native Integrationen |
| **Glossare** | Nicht vorhanden | Custom Glossaries (bis 3.000 Begriffe) |
| **Integrationen** | Standalone | 20+ (Zoom, Teams, Webex, etc.) |
| **Zertifizierungen** | Keine | SOC 2 Type 2 + ISO 27001 |

### 9.2 Wordlys bekannte Schwächen

1. **Kein Offline-Modus** — Komplett cloudbasiert
2. **Glossar-Probleme** — Custom Glossary unzuverlässig bei Akronymen und Eigennamen
3. **Audio-Aussetzer** — Nutzerberichte über "cutting in and out randomly"
4. **Akzent-Schwäche** — Probleme mit starken Akzenten und Hintergrundgeräuschen
5. **Support-Qualität** — Berichte über mangelnden Post-Sale-Support
6. **API nicht frei zugänglich** — Allow-List erforderlich
7. **Intransparente Preise** — Sales-Kontakt für Preisinfo erforderlich

### 9.3 Differenzierungspotenzial Fintutto

1. **Nischenfokus Kreuzfahrt** — Wordly adressiert den Kreuzfahrt-Markt nicht
2. **Kosten-Vorteil** — API-basiert statt per-Wort-Pricing
3. **Offline-Potenzial** — PWA-Grundlage mit Service Worker bereits vorhanden
4. **Erweiterbar auf 130+ Sprachen** — Via Google Cloud Translation
5. **Kreuzfahrt-spezifische Features** — Tour-Pre-Caching, Schiffs-WLAN, Destinationsprofile (geplant)

### 9.4 Strategische Positionierung

```
              Preis
              hoch │
                   │  [Menschliche Dolmetscher]
                   │       €2.400/Ausflug
                   │
                   │            [Wordly]
                   │          Events/Meetings
                   │
              ─────┼──────────────────────── Breite
             wenig │                    viel
                   │
                   │   [Fintutto Translator]  ← ZIEL
                   │   Kreuzfahrt-Spezialist
                   │   22+ Sprachen, PWA
              nied.│   API-basierte Kosten
```

---

## 10. Kostenanalyse

### 10.1 Aktuelle API-Kosten (Stand Februar 2026)

| Service | Tier | Preis (USD) | Preis (EUR ~) |
|---------|------|-------------|---------------|
| MyMemory Translation | Free Tier | $0 (10.000 Wörter/Tag) | €0 |
| LibreTranslate | Free Tier | $0 (Rate-Limited) | €0 |
| Google Cloud TTS | Neural2 | $16/1M Zeichen | ~€14,80/1M Zeichen |
| Google Cloud TTS | WaveNet | $16/1M Zeichen | ~€14,80/1M Zeichen |
| Google Cloud TTS | Chirp 3 HD | $30/1M Zeichen | ~€27,80/1M Zeichen |
| Supabase | Free Tier | $0 (500MB, 50k MAU) | €0 |

### 10.2 Geschätzte Betriebskosten (Prototyp)

Bei moderater Nutzung (100 Sessions/Tag, ~500 TTS-Aufrufe/Tag):

| Position | Geschätzt/Monat |
|----------|----------------|
| Übersetzung (MyMemory Free) | €0 |
| Google Cloud TTS | €5–20 |
| Supabase (Free Tier) | €0 |
| Vercel (Free/Pro) | €0–20 |
| **Gesamt** | **€5–40/Monat** |

### 10.3 Skalierungskosten (Produktions-Szenario)

**Szenario: 1 Kreuzfahrtschiff, 4.000 Gäste, 200 Tage/Jahr, 2 Ausflüge/Tag, 90 Min/Ausflug, 8 Sprachen**

| Position | Geschätzt/Jahr |
|----------|---------------|
| Google Cloud Translation (Advanced) | ~€4.665 |
| Google Cloud TTS (Neural2) | ~€3.733 |
| Google Cloud STT (Chirp 2) | ~€540 |
| Supabase (Pro) | ~€300 |
| Infrastruktur (Vercel Pro + CDN) | ~€600 |
| **Gesamt pro Schiff** | **~€9.838/Jahr** |

**Vergleich:** Menschliche Dolmetscher kosten ~€2.400/Ausflug × 400 Ausflüge = **€960.000/Jahr** pro Schiff.
→ **Ersparnis: ~99% gegenüber menschlichen Dolmetschern**

---

## 11. Entwicklungshistorie & Transformation

### 11.1 Commit-Historie

| Datum | Commit | Beschreibung |
|-------|--------|-------------|
| 22.02.2026 | `666d7f8` | Initial Commit |
| 22.02.2026 | `cc1053d` | Fintutto Translator App — erste Version |
| 22.02.2026 | `e72a1b7` | Live Speaker/Listener Translation Mode |
| 22.02.2026 | `bcc031f` | Admin-Panel + Registration-Bugfix |
| 22.02.2026 | `bc4ff2e` | GuideTranslator Sales App mit Admin-Panel |
| 22.02.2026 | `389cf60` | Alte Config-Dateien bereinigt |
| 22.02.2026 | `1daa471` | Vollständige Architektur-Revision + WaveNet-Preiskorrektur |
| 22.02.2026 | `46db982` | Revisionsbericht mit Wordly/Apple-Recherche |
| 22.02.2026 | `ba5693f` | Merge PR #3: Architektur-Analyse |
| 23.02.2026 | `a43f593` | Production Hardening — Reconnection, TTS Queue, Caching, UX |
| 23.02.2026 | `9c5956c` | PWA Support, Translation Fallback, Quality Badge |
| 23.02.2026 | `7bc7a2f` | Google Cloud Translation, Chirp 3 HD, STT Abstraction |
| 23.02.2026 | `1847eff` | Merge PR #4: Architektur-Analyse |

### 11.2 Wichtige Meilensteine

1. **Initiale Sales-App** — B2B-Kalkulator für Reedereien (JSX, monolithisch)
2. **Architektur-Revision** — Kritische Analyse: kein funktionierendes Übersetzungsprodukt
3. **Vollständiger Rewrite** — TypeScript, modulare Hooks, echte Übersetzungsfunktionalität
4. **Live-Sessions** — Echtzeit-Gruppenübersetzung via Supabase Realtime
5. **Production Hardening** — Reconnection, Caching, Queue-Management, Fehlerbehandlung
6. **PWA & Offline** — Service Worker, Runtime-Caching, Installierbarkeit

### 11.3 Code-Transformation

| Metrik | Alter Zustand | Neuer Zustand | Veränderung |
|--------|---------------|---------------|-------------|
| Dateien | 4 (App.jsx, Admin.jsx, main.jsx, supabaseClient.js) | 21+ Module | +425% |
| Sprache | JavaScript (JSX) | TypeScript (TSX) | Typsicherheit |
| Architektur | 2 monolithische Dateien | Modulare Hooks + Komponenten | Komplett neu |
| Übersetzung | Nicht vorhanden | Dual-Provider mit Circuit Breaker | Neu |
| TTS | Nicht vorhanden | Google Cloud + Browser Fallback | Neu |
| STT | Nicht vorhanden | Web Speech API | Neu |
| Live-Modus | Nicht vorhanden | Supabase Realtime Broadcast + Presence | Neu |
| Offline | Nicht vorhanden | PWA mit Service Worker | Neu |
| Styling | Inline-Styles | Tailwind CSS + shadcn/ui | Komplett neu |
| Tests | 0 | Vitest konfiguriert | Bereit |

---

## 12. Offene Punkte & Empfehlungen

### 12.1 Sofort-Maßnahmen (Kritisch)

| # | Maßnahme | Priorität |
|---|----------|-----------|
| 1 | Google TTS API-Key aus Quellcode entfernen, nur ENV-Variable | **KRITISCH** |
| 2 | Backend-Proxy für API-Aufrufe einrichten (API-Keys serverseitig) | **HOCH** |
| 3 | Datenschutzerklärung erstellen (DSGVO) | **HOCH** |
| 4 | Übersetzungs-Provider auf Google Cloud Translation Advanced upgraden | **HOCH** |

### 12.2 Kurzfristig (Nächster Sprint)

| # | Maßnahme | Details |
|---|----------|---------|
| 1 | Google Cloud Translation API integrieren | Ersetzt MyMemory/LibreTranslate für Produktionsqualität |
| 2 | Rate-Limiting implementieren | Schutz vor Missbrauch |
| 3 | Error-Monitoring einrichten | Sentry oder ähnlich |
| 4 | Unit-Tests für Kernlogik schreiben | translate.ts, tts.ts, session.ts |
| 5 | E2E-Tests für Live-Session | Playwright |

### 12.3 Mittelfristig (Produkt-MVP)

| # | Maßnahme | Details |
|---|----------|---------|
| 1 | Tour-Pre-Caching | Häufige Touren vorab übersetzen und cachen |
| 2 | Custom Glossar | Kreuzfahrt-spezifische Terminologie |
| 3 | Erweiterte Offline-Fähigkeit | Tour-Pakete downloadbar machen |
| 4 | Admin-Dashboard (neu) | Session-Analytics, Nutzungsstatistiken |
| 5 | Mehrere TTS-Qualitätsstufen | Neural2/WaveNet/Chirp 3 HD wählbar für Endnutzer |

### 12.4 Langfristig (Enterprise-Ready)

| # | Maßnahme | Details |
|---|----------|---------|
| 1 | Edge-Server-Konzept für Schiffe | Lokaler Server auf dem Schiff für STT/TTS/Translation |
| 2 | Hybrid Apple Translation | iOS-Offline-Fallback für Top-20-Sprachen |
| 3 | Multi-Tenant-Architektur | Mehrere Reedereien/Flotten gleichzeitig |
| 4 | SOC 2 / ISO 27001 | Enterprise-Zertifizierung |
| 5 | SLA-fähige Infrastruktur | 99.9% Uptime Garantie |
| 6 | Monitoring & Alerting | Datadog/Sentry für Production |

---

## Anhang A: Architektur-Patterns im Code

### Circuit Breaker (translate.ts)

```typescript
// Automatischer Wechsel zu Fallback nach 3 Fehlern
let myMemoryFailCount = 0;
let myMemoryCircuitOpen = false;

// Bei Fehler:
myMemoryFailCount++;
if (myMemoryFailCount >= 3) {
  myMemoryCircuitOpen = true;
  setTimeout(() => { myMemoryCircuitOpen = false; }, 30000);
}
```

### Exponential Backoff (useBroadcast.ts)

```typescript
// Reconnection mit exponentiell steigender Wartezeit
const BASE_DELAY = 2000;
const MAX_RETRIES = 5;
const delay = BASE_DELAY * Math.pow(2, retriesRef.current);
```

### Queue-basiertes TTS (useSpeechSynthesis.ts)

```typescript
// Verhindert überlappende Audiowiedergabe
const queue: Array<() => Promise<void>> = [];
const isProcessing = useRef(false);

async function processQueue() {
  if (isProcessing.current) return;
  isProcessing.current = true;
  while (queue.length > 0) {
    await queue.shift()!();
  }
  isProcessing.current = false;
}
```

## Anhang B: Google Cloud Pricing-Referenz (Februar 2026)

| Service | Tier | Preis |
|---------|------|-------|
| Cloud Translation v3 | Advanced | $20/1M Zeichen |
| Cloud TTS | Standard | $4/1M Zeichen |
| Cloud TTS | WaveNet | $16/1M Zeichen |
| Cloud TTS | Neural2 | $16/1M Zeichen |
| Cloud TTS | Chirp 3 HD | $30/1M Zeichen |
| Cloud TTS | Studio | $160/1M Zeichen |
| Cloud STT | Chirp 2 | $0.016/Minute |
| Cloud STT | Standard | $0.024/Minute |
| Cloud STT | Enhanced | $0.036/Minute |

## Anhang C: Wettbewerber-Quellen

- Wordly Pricing: https://www.wordly.ai/pricing
- Wordly Features: https://www.wordly.ai/real-time-translation
- Wordly API: https://api.wordly.ai/reference (v1.10.2)
- Apple Translation Framework: https://developer.apple.com/documentation/translation/
- iOS 26 SpeechAnalyzer: https://developer.apple.com/documentation/speechanalyzer/
