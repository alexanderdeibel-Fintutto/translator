# Website-Audit: guidetranslator.com / guidetranslator.de
## Empfehlung: Erweitern, NICHT neu bauen

**Stand: Februar 2026**

---

## Executive Summary

Nach gruendlicher Analyse des gesamten Codebase lautet die Empfehlung:

**ERWEITERN, NICHT NEU BAUEN.**

Die bestehende App hat eine **hervorragende technische Grundlage** -- deutlich besser als erwartet. Die Offline-Architektur, der Live-Session-Modus und die PWA-Infrastruktur sind genau das, was fuer den Cruise-B2B-Markt gebraucht wird. Was fehlt, sind **Cruise-spezifische Features und B2B-Anpassungen**, die als Erweiterungen implementiert werden koennen, ohne die bestehende Architektur zu aendern.

---

## 1. Bestandsaufnahme: Was existiert bereits

### 1.1 Seiten/Routen (7 Seiten)

| Route | Seite | Beschreibung | B2B-Relevant? |
|---|---|---|---|
| `/` | TranslatorPage | Hauptuebersetzer (Text-Input, Spracheingabe, Sprachausgabe) | Nein (B2C) |
| `/live` | LiveLandingPage | Speaker/Listener Session erstellen oder beitreten | **JA -- Kern-Feature** |
| `/live/:code` | LiveSessionPage | Aktive Live-Session (Speaker- oder Listener-View) | **JA -- Kern-Feature** |
| `/settings` | SettingsPage | Offline-Sprachpakete, Whisper, Cache, Netzwerk-Status | **JA -- Offline-Management** |
| `/info` | InfoPage | Feature-Uebersicht, unterstuetzte Sprachen | Muss aktualisiert werden |
| `/impressum` | ImpressumPage | Rechtlich (ai tour ug, Alexander Deibel) | OK |
| `/datenschutz` | DatenschutzPage | DSGVO-Erklaerung | OK |

### 1.2 Uebersetzungs-Engine (Exzellent)

**4-stufiges Fallback-System** (translate.ts):
```
1. In-Memory Cache (5 Min. TTL) -- sofort
2. IndexedDB Persistent Cache (30 Tage TTL) -- Millisekunden
3. Online APIs (mit Circuit Breaker):
   a. Google Cloud Translate (primaer)
   b. MyMemory (Fallback)
   c. LibreTranslate (Fallback)
4. Offline: Opus-MT ONNX via Transformers.js (English-Pivot fuer indirekte Paare)
```

**Bewertung**: Professionelles Design mit Circuit-Breaker-Pattern, Multi-Provider-Fallback, und echtem Offline-Support. **Besser als die meisten kommerziellen Uebersetzungs-Apps.**

### 1.3 Offline-Infrastruktur (Sehr gut)

| Komponente | Status | Details |
|---|---|---|
| **Service Worker** | Aktiv | vite-plugin-pwa mit Workbox, autoUpdate |
| **Offline Translation** | Funktioniert | Opus-MT ONNX Modelle (~35 MB/Paar), 20+ Paare |
| **English-Pivot** | Funktioniert | src->en->tgt fuer indirekte Sprachpaare |
| **Offline STT** | Funktioniert | Whisper ONNX (~40 MB), browseruebergreifend |
| **Model Storage** | Cache API + IndexedDB | Metadata in IDB, Modelle in Cache API |
| **Network Detection** | 3 Modi | online / degraded / offline |
| **iOS Safari Support** | Ja | Hint fuer Home-Screen-Installation (7-Tage-Cache-Limit) |
| **Runtime Caching** | Umfangreich | Translation API, Google TTS, HuggingFace, WASM, Fonts |

**Bewertung**: Die Offline-Architektur ist **cruise-ready**. Passagiere koennen Sprachpakete im Hafen/an Bord vorladen und bei der Exkursion offline nutzen.

### 1.4 Live-Session-Modus (Kern-Feature -- funktioniert)

**Architektur**: Supabase Realtime (Broadcast Channels + Presence)

**Speaker-Flow**:
1. Speaker erstellt Session -> Code "TR-XXXX" generiert
2. QR-Code automatisch erzeugt (via SessionQRCode.tsx)
3. Speech Recognition -> Text -> Translate zu ALLEN Listener-Sprachen parallel -> Broadcast

**Listener-Flow**:
1. QR-Code scannen ODER Session-Code eingeben
2. Sprache waehlen (LanguageChips)
3. Uebersetzung empfangen als Text (grosse Schrift) + Auto-TTS
4. Sprache jederzeit wechselbar

**Presence**: Echtzeit-Anzeige welche Listener verbunden sind und welche Sprache sie hoeren.

**Reconnection**: Exponential backoff (5 Retries, 2s -> 4s -> 8s -> 16s -> 32s).

**Bewertung**: **Das IST das Produkt, das wir fuer Cruise-Exkursionen pitchen.** Guide spricht -> Passagiere hoeren in ihrer Sprache. Die Basis funktioniert. Was fehlt: Cruise-spezifische UX-Anpassungen.

### 1.5 Phrase Packs (Bereits cruise-fokussiert!)

3 Packs existieren bereits in `phrase-packs.ts`:
1. **Basis-Phrasen**: Begruessung, Navigation, Essen, Shopping, Notfall
2. **Mittelmeer-Kreuzfahrt**: Hafen, Sightseeing, Lokales Essen, Strand, Praktisch
3. **Nordland-Kreuzfahrt**: Fjorde, Wandern, Nordlichter, Bootstouren

**Bewertung**: Guter Anfang, aber noch nicht genug. Es fehlen: Tuerkei, Asien, Karibik, Suedamerika, Arabische Welt. Ausserdem fehlt **kultureller Kontext** (nicht nur Phrasen, sondern Erklaerungen).

### 1.6 Unterstuetzte Sprachen (22)

DE, EN, FR, ES, IT, PT, NL, PL, TR, RU, UK, AR, ZH, JA, KO, HI, SV, DA, CS, RO, EL, HU

**Bewertung**: Gute Abdeckung fuer den europaeischen Kreuzfahrt-Markt. Es fehlen fuer Cruise: **Norwegisch (NO), Thai (TH), Vietnamesisch (VI), Kroatisch (HR), Finnisch (FI), Indonesisch (ID)**.

### 1.7 Tech Stack

| Technologie | Version/Details | Bewertung |
|---|---|---|
| React | 18.x | Aktuell, gut |
| TypeScript | Ja | Gut |
| Vite | Build-System | Schnell, modern |
| Tailwind CSS | Styling | Gut |
| shadcn/ui | UI-Komponenten (Button, Card) | Modern, zugaenglich |
| Supabase | Realtime (Broadcast + Presence) | Gut fuer Live-Sessions |
| Transformers.js | Offline ML (Opus-MT, Whisper) | Hervorragend |
| Capacitor | iOS + Android Wrapper | Vorhanden aber sekundaer |
| Vercel | Deployment | Gut |
| Google Cloud | TTS + Translate API | Primaer-Provider |

### 1.8 PWA-Konfiguration

| Feature | Status |
|---|---|
| Web App Manifest | Ja (via vite-plugin-pwa) |
| Service Worker | Ja (Workbox, autoUpdate) |
| Installierbar | Ja |
| iOS Safari Support | Ja (apple-mobile-web-app-capable) |
| Offline Navigation | Ja (navigateFallback: /index.html) |
| Theme Color | #0369a1 (Blau) |
| Display | standalone |

---

## 2. Was FEHLT fuer den Cruise-B2B-Markt

### 2.1 Fehlende Seiten/Features (KRITISCH)

| Feature | Prioritaet | Beschreibung |
|---|---|---|
| **Landing Page / B2B-Hero** | HOCH | Aktuelle Startseite ist ein Texteingabe-Uebersetzer. Cruise-Kunden brauchen eine Erklaerseite mit dem Wertversprechen |
| **Guide-Dashboard** | HOCH | Dedizierte Ansicht fuer den Exkursions-Guide: Session starten, QR drucken, Statistiken sehen |
| **B2B Admin-Portal** | MITTEL | Tour-Operator kann Guides verwalten, Sessions einsehen, Analytics abrufen |
| **Hafen-Phrasebooks** | MITTEL | Pro-Hafen Phrasebooks (Santorini, Kusadasi, Dubrovnik, etc.) mit kulturellem Kontext |
| **Boarding-Timer** | MITTEL | Countdown bis Schiffs-Abfahrt (Passagiere verpassen das Schiff wegen Sprachverwirrung) |
| **Sprach-Analytics** | NIEDRIG | Welche Sprachen werden an welchem Hafen nachgefragt? Daten fuer Cruise-Lines |

### 2.2 UX-Probleme fuer Cruise-Nutzung

| Problem | Beschreibung | Loesung |
|---|---|---|
| **Startseite = Textuebersetzer** | Cruise-Passagiere brauchen Live-Session, nicht Texteingabe | Neuer Landing-Flow: Rolle waehlen (Guide/Passagier) -> direkt zur Live-Session |
| **Deutsche UI-Sprache** | Alle Labels, Buttons, Texte sind auf Deutsch | i18n-System einfuehren (mindestens EN+DE) |
| **Kein QR-Direkteinstieg** | URL `/live/TR-XXXX` funktioniert, aber Passagier muss noch Sprache waehlen | Sprache in URL encodieren: `/live/TR-XXXX?lang=en` |
| **Session-Code "TR-XXXX"** | Funktioniert, aber nicht Cruise-gebrandbar | Operator-konfigurierbarer Prefix (z.B. "MSC-XXXX", "COSTA-XXXX") |
| **Kein Guide-Onboarding** | Kein erklaertes "So geht's" fuer den Guide | 3-Step Tutorial beim ersten Start |
| **Listener-Ansicht zu klein** | Untertitel-Text (text-2xl) gut, aber koennte groesser fuer aeltere Passagiere | Einstellbare Schriftgroesse + Vollbild-Modus |

### 2.3 Fehlende Sprachen (fuer Cruise-Routen)

| Sprache | ISO | Cruise-Relevanz |
|---|---|---|
| Norwegisch | `no` | Fjord-Kreuzfahrten (AIDA, TUI, NCL) |
| Kroatisch | `hr` | Dubrovnik, Split (Top-Mittelmeer-Haefen) |
| Thai | `th` | Asien-Kreuzfahrten (Phuket, Bangkok) |
| Vietnamesisch | `vi` | Ha Long Bay (MSC, Royal Caribbean Asien) |
| Finnisch | `fi` | Ostsee-Kreuzfahrten |
| Indonesisch | `id` | Bali-Kreuzfahrten |
| Hebräisch | `he` | Östliches Mittelmeer |
| Katalanisch | `ca` | Barcelona (meistbesuchter EU-Hafen) |

### 2.4 Technische Luecken

| Luecke | Beschreibung | Auswirkung |
|---|---|---|
| **Kein i18n-Framework** | Alle Strings hardcoded auf Deutsch | Internationale Passagiere sehen deutsche UI |
| **API Key im Code** | Google API Key in translate.ts sichtbar | Sicherheitsrisiko -- muss serverseitig proxied werden |
| **Supabase-Abhaengigkeit** | Live-Session braucht Supabase Realtime | Offline Live-Session unmoeglich (WiFi/LAN noetig) |
| **Kein Persistentes Backend** | Keine Datenbank fuer Sessions, Nutzer, Analytics | B2B-Features brauchen Backend |
| **Kein Auth-System** | Kein Login fuer Guides/Operatoren | B2B Admin-Portal braucht Auth |
| **Kein White-Label-Support** | Farben/Branding nicht konfigurierbar | Cruise-Linien wollen eigenes Branding |

---

## 3. Empfehlung: Erweiterungs-Roadmap

### Phase 1: Quick Wins (1-2 Wochen) -- Cruise-Demo-Ready

Diese Aenderungen machen die App **sofort vorzeigbar** fuer Cruise-Pitches:

1. **Neuer Landing-Flow**: `/` zeigt Rollen-Auswahl (Guide / Passagier) statt Textuebersetzer
   - Textuebersetzer auf `/translate` verschieben
   - `/` wird zum Cruise-Einstieg: "Ich bin Guide" -> Session starten / "Ich bin Passagier" -> QR scannen

2. **URL-Sprach-Parameter**: `/live/TR-XXXX?lang=en` -> Passagier wird direkt mit Englisch verbunden
   - Spart einen Schritt fuer den Passagier

3. **Groessere Listener-Anzeige**: Vollbild-Modus fuer Untertitel (text-4xl, Dark Background)
   - Aeltere Passagiere koennen mitlesen

4. **Meta-Tags aktualisieren**: "guidetranslator -- Live-Uebersetzung fuer Exkursionen" statt "Kostenloser Online-Uebersetzer"

5. **Info-Seite aktualisieren**: Cruise-B2B-Positionierung statt "Behoerdengaenge und Wohnungssuche"

### Phase 2: B2B-Features (2-4 Wochen)

6. **Guide-Dashboard** (`/guide`):
   - Session starten mit Operator-Branding
   - QR-Code als PDF druckbar (fuer Bus-Fenster, Treffpunkt-Schild)
   - Aktive Listener-Uebersicht nach Sprache
   - Session-Historie

7. **i18n-System** (react-i18next oder lingui):
   - UI in min. 5 Sprachen: DE, EN, IT, FR, ES
   - Passagier-UI automatisch in Browser-Sprache

8. **Weitere Phrase-Packs**:
   - Tuerkei-Exkursion (Ephesus, Istanbul)
   - Griechische Inseln
   - Karibik
   - Japan
   - Kultureller Kontext pro Hafen

9. **Sprachen hinzufuegen**: NO, HR, TH, VI (Online-APIs unterstuetzen diese bereits; Offline-Modelle muessen geprueft werden)

### Phase 3: Enterprise-Features (1-3 Monate)

10. **Backend + Auth** (Supabase Auth + Database oder eigenes Backend):
    - Guide-Accounts
    - Operator-Accounts
    - Session-Persistenz
    - Analytics (Sprachen, Nutzung, Haefen)

11. **White-Label-System**:
    - Konfigurierbares Branding (Farben, Logo, Name)
    - `/msc/live/XXXX` oder `/costa/live/XXXX`

12. **API fuer Integration**:
    - REST API fuer Session-Erstellung
    - Webhook fuer Exkursions-Buchungssysteme (Shoretime, Oracle)

13. **Boarding-Timer**:
    - Guide setzt Abfahrtszeit
    - Countdown fuer alle Passagiere sichtbar
    - Push-Notification 30 Min. vor Abfahrt

14. **Offline Live-Session** (Hardest):
    - WebRTC / WiFi Direct fuer lokale Verbindung ohne Internet
    - Guide-Phone als lokaler Server
    - Passagiere verbinden sich via lokales Netz

---

## 4. Was NICHT neu gebaut werden muss

Diese Komponenten sind **production-ready** und muessen nicht angefasst werden:

| Komponente | Dateien | Warum beibehalten |
|---|---|---|
| Translation Engine | `translate.ts` | 4-stufiges Fallback, Circuit Breaker, Caching -- professionell |
| Offline Models | `model-manager.ts`, `translation-engine.ts` | Opus-MT + English Pivot funktioniert |
| Offline STT | `stt-engine.ts` | Whisper ONNX, browseruebergreifend |
| Live Broadcast | `useBroadcast.ts` | Supabase Realtime mit Auto-Reconnect |
| Presence System | `usePresence.ts` | Listener-Tracking nach Sprache |
| Live Session Hook | `useLiveSession.ts` | Orchestriert alles korrekt |
| PWA/Service Worker | `vite.config.ts` (Workbox) | Umfangreiches Runtime-Caching |
| Speaker View | `SpeakerView.tsx` | QR + Recording + Transcript -- funktioniert |
| Listener View | `ListenerView.tsx` | Grosser Text + Auto-TTS + Sprachauswahl |
| Settings/Offline | `SettingsPage.tsx` | Download-Management, Storage, iOS-Hints |
| Network Status | `network-status.ts` | Online/Degraded/Offline-Erkennung |

---

## 5. Kritische Sicherheits-Fixes (Sofort)

| Issue | Datei | Fix |
|---|---|---|
| **Google API Key exposed** | `translate.ts:7` | API Key aus dem Frontend entfernen, serverseitigen Proxy einrichten (Vercel Edge Function oder Supabase Edge Function) |
| **Supabase Keys** | `.env.example` | Sicherstellen, dass nur anon-Key im Frontend ist (Row Level Security aktivieren) |

---

## 6. Zusammenfassung: Erweitern vs. Neu bauen

### Gruende GEGEN Neubau:
- **Translation Engine ist exzellent** -- 4-stufiges Fallback mit Circuit Breaker, besser als viele kommerzielle Apps
- **Offline-Architektur ist cruise-ready** -- Opus-MT ONNX, Whisper, Cache API, iOS Safari Support
- **Live-Session funktioniert** -- Supabase Realtime, QR-Code, Presence, Auto-TTS
- **PWA-Infrastruktur komplett** -- Service Worker, Manifest, Workbox Runtime-Caching
- **Phrase Packs bereits cruise-fokussiert** -- Mittelmeer + Nordland existieren schon
- **Neubau wuerde 2-3 Monate kosten** fuer Features, die bereits funktionieren

### Gruende FUER gezielte Erweiterungen:
- UI/UX muss fuer Cruise-Nutzung angepasst werden (Landing, Guide-Dashboard, i18n)
- B2B-Features fehlen komplett (Auth, Admin, Analytics, White-Label)
- API Key Sicherheitsproblem muss sofort geloest werden
- Info-Seite beschreibt "Behoerdengaenge" statt Cruise-Exkursionen

### Geschaetzter Aufwand:

| Phase | Aufwand | Ergebnis |
|---|---|---|
| Phase 1 (Quick Wins) | 1-2 Wochen | Demo-ready fuer Cruise-Pitches |
| Phase 2 (B2B-Features) | 2-4 Wochen | Pilot-ready fuer Tour-Operatoren |
| Phase 3 (Enterprise) | 1-3 Monate | Cruise-Line-Integration-ready |
| **Neubau (zum Vergleich)** | **3-6 Monate** | **Gleicher Funktionsumfang** |

**Empfehlung: Phase 1 sofort starten, Phase 2 parallel zum Pilot, Phase 3 nach erstem Cruise-Line-Feedback.**

---

## Anhang: Datei-Inventar

### Seiten (src/pages/)
- `TranslatorPage.tsx` -- Hauptuebersetzer (Text-Input)
- `LiveLandingPage.tsx` -- Session erstellen/beitreten
- `LiveSessionPage.tsx` -- Aktive Live-Session
- `SettingsPage.tsx` -- Offline-Management
- `InfoPage.tsx` -- Feature-Info
- `ImpressumPage.tsx` -- Impressum
- `DatenschutzPage.tsx` -- Datenschutz

### Komponenten (src/components/)
- `layout/Header.tsx` -- Navigation, Netzwerk-Status, Dark Mode
- `layout/Footer.tsx` -- Impressum/Datenschutz Links
- `layout/Layout.tsx` -- Wrapper
- `translator/TranslationPanel.tsx` -- Haupt-Uebersetzungs-UI
- `translator/LanguageSelector.tsx` -- Sprach-Dropdown
- `translator/QuickPhrases.tsx` -- Phrasebook
- `translator/TranslationHistory.tsx` -- Verlauf
- `live/SpeakerView.tsx` -- Guide-Ansicht (QR, Mic, Transcript)
- `live/ListenerView.tsx` -- Passagier-Ansicht (Grosse Schrift, TTS)
- `live/SessionQRCode.tsx` -- QR-Code Generator
- `live/SessionCodeInput.tsx` -- Code-Eingabe
- `live/LanguageChips.tsx` -- Sprach-Auswahl-Chips
- `live/LiveTranscript.tsx` -- Transkript-Anzeige
- `live/ListenerStatus.tsx` -- Listener-Uebersicht
- `settings/LanguagePackCard.tsx` -- Sprachpaket Download-Karte
- `settings/StorageIndicator.tsx` -- Speicher-Anzeige
- `ui/button.tsx`, `ui/card.tsx` -- shadcn/ui Basis

### Hooks (src/hooks/)
- `useLiveSession.ts` -- Gesamter Live-Session-Flow
- `useBroadcast.ts` -- Supabase Realtime Broadcasting
- `usePresence.ts` -- Listener-Presence-Tracking
- `useSpeechRecognition.ts` -- Browser + Whisper STT
- `useSpeechSynthesis.ts` -- TTS
- `useTranslationHistory.ts` -- Verlauf-Verwaltung
- `useNetworkStatus.ts` -- Netzwerk-Ueberwachung

### Libs (src/lib/)
- `translate.ts` -- Multi-Provider Translation Engine
- `tts.ts` -- Google Cloud TTS
- `stt.ts` -- Speech-to-Text
- `supabase.ts` -- Supabase Client
- `session.ts` -- Session Code + Message Types
- `languages.ts` -- 22 Sprachen mit Codes + Flags
- `utils.ts` -- Tailwind cn() Helper
- `offline/translation-engine.ts` -- Opus-MT ONNX Pipeline
- `offline/model-manager.ts` -- Model Download/Storage
- `offline/stt-engine.ts` -- Whisper ONNX Pipeline
- `offline/phrase-packs.ts` -- Cruise Phrasebooks
- `offline/translation-cache.ts` -- IndexedDB Cache
- `offline/tts-cache.ts` -- TTS Audio Cache
- `offline/network-status.ts` -- Online/Offline Detection
- `offline/storage-manager.ts` -- Storage Quota Management
- `offline/db.ts` -- IndexedDB Schema (idb)

### Config
- `vite.config.ts` -- Build + PWA + Workbox
- `capacitor.config.ts` -- iOS/Android Wrapper
- `vercel.json` -- Deployment Rewrites
- `tailwind.config.js` -- Styling
- `tsconfig.json` -- TypeScript
- `package.json` -- Dependencies
