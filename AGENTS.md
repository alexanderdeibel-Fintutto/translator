# AGENTS.md — fintutto.world Workspace

> **Für jeden Agenten, der an diesem Repository arbeitet: Diese Datei zuerst lesen.**
> Sie enthält kritische Regeln, bekannte Fallstricke und Architektur-Entscheidungen,
> die durch echte Bugs und Regressionsfehler entstanden sind.

---

## 1. Plattform-Übersicht

**fintutto.world** ist eine KI-Übersetzungsplattform für Behörden, Gesundheitswesen, Museen und Events — offline-first, DSGVO-konform, auf einem einzigen Gerät.

| Produkt | Typ | Funktion |
|---|---|---|
| **GuideTranslator** | Translator (bidirektional) | Live-Übersetzung für Stadtführer, Kreuzfahrten, Agenturen |
| **AmtTranslator** | Translator (bidirektional) | Behörden-Kommunikation, B2G, EVB-IT-konform |
| **MedTranslator** | Translator (bidirektional) | Klinik/Arztpraxis, DSGVO Art.9, medizinisches Vokabular |
| **EventTranslator** | Translator (broadcast) | Konferenzen, Messen, Simultanübersetzung |
| **ArtGuide** | Guide (unidirektional) | Museum/Galerie, vorbereitete Audioinhalte |
| **CityGuide** | Guide (unidirektional) | Stadtführungen, GPS-basierte Inhalte |

**Wichtig:** Der Markenname ist **fintutto.world** — mit **N** (nicht "FitTutto" oder "FitTuto").

---

## 2. Kritische Regeln — NIEMALS verletzen

### 2.1 React: Keine Hook-Objekte in useEffect-Dependencies

```typescript
// ❌ FALSCH — verursacht Endlosschleife und App-Freeze
const session = useLiveSession(tierId)
useEffect(() => {
  if (code === 'new' && !session.role) {
    session.createSession(...)
  }
}, [code, session]) // ← session ist JEDES MAL ein neues Objekt

// ✅ RICHTIG — sessionRef-Pattern verwenden
const session = useLiveSession(tierId)
const sessionRef = useRef(session)
sessionRef.current = session
useEffect(() => {
  if (code === 'new' && !sessionRef.current.role) {
    sessionRef.current.createSession(...)
  }
}, [code]) // ← nur primitive Werte oder stabile Referenzen
```

**Warum:** `useLiveSession()`, `useLiveSession()` und ähnliche Hooks geben bei jedem Render ein **neues Objekt** zurück. React vergleicht Dependencies per Referenz (`===`). Neues Objekt → Effect läuft erneut → Render → neues Objekt → Endlosschleife → App friert ein.

**Gilt für alle Hooks, die Objekte zurückgeben:** `useLiveSession`, `useConnectionMode`, `useAudioBroadcast`, `useAudioReceiver`, `useI18n`, `useUserContext`.

---

### 2.2 Audio-Sequenz-Reset bei Session-Neustart

```typescript
// In useAudioBroadcast.ts → stopAudioStream()
// CRITICAL: seqRef MUSS auf 0 zurückgesetzt werden!
seqRef.current = 0  // ← NIEMALS entfernen
```

**Warum:** Das Live-Audio-System verwendet Sequenznummern (seq=0, 1, 2...). Das iPhone (Listener) nutzt `seq === 0` als Reset-Signal für den Jitter-Buffer. Wenn `seqRef` beim Stop nicht auf 0 zurückgesetzt wird, schickt der Sprecher nach einem Neustart seq=47, 48... — der Listener wartet aber auf seq=0 → Jitter-Buffer läuft nie ab → **kein Audio auf dem iPhone**.

**Betroffene Datei:** `src/hooks/useAudioBroadcast.ts` → Funktion `stopAudioStream`

---

### 2.3 connectionConfig-Stabilität

```typescript
// ❌ FALSCH — neues Objekt bei jedem Render
const connectionConfig = useMemo((): ConnectionConfig => {
  return { mode: 'cloud' }
}, [wsParam, bleParam])
// Wenn connectionConfig in useEffect-Dependencies steht → instabil

// ✅ RICHTIG — Ref für stabile Übergabe
const connectionConfigRef = useRef(connectionConfig)
connectionConfigRef.current = connectionConfig
```

**Gilt für:** `ListenerSessionPage.tsx`, `LiveSessionPage.tsx`

---

## 3. Architektur-Entscheidungen

### 3.1 Transport-Layer

Das System unterstützt drei Verbindungsmodi:

| Modus | Beschreibung | Wann |
|---|---|---|
| `cloud` | Supabase Broadcast/Presence | Standard, überall |
| `local` | WebSocket über lokales Netzwerk (`?ws=...`) | Hotspot-Modus |
| `ble` | Bluetooth Low Energy GATT | Offline ohne Internet |

Der QR-Code auf dem Speaker-Gerät kodiert die Session-URL inkl. Transport-Parameter. Die URL wird von `SessionQRCode.tsx` aus `session.sessionUrl` bezogen — nicht selbst konstruieren.

### 3.2 Audio-Streaming-Architektur

```
Speaker (Pixel)                    Listener (iPhone)
─────────────────                  ─────────────────
useAudioBroadcast                  useAudioReceiver
  └─ Mic → Web Audio API             └─ Jitter Buffer (Map<seq, chunk>)
  └─ Float32 → Int16 PCM             └─ scheduleChunk → AudioContext
  └─ base64 encode                   └─ seq=0 → Buffer reset
  └─ Supabase Broadcast              └─ seq>nextSeq+5 → skip ahead
       ↓ audio_chunk event ↑
```

- Chunk-Größe: ~500ms (konfigurierbar via `chunkMs`)
- Sample Rate: 16kHz, Mono, Int16 PCM
- Encoding: base64 (kein Opus, kein WebM — bewusste Entscheidung für maximale Browser-Kompatibilität)
- **iOS-Besonderheit:** `AudioContext` muss nach User-Gesture resumed werden → `resume()`-Button in `ListenerView`

### 3.3 Session-Lifecycle

```
Speaker: navigate('/live/new', { state: { role: 'speaker', sourceLang: 'de' } })
  → LiveSessionPage erkennt code==='new' && role==='speaker'
  → createSession() → neuer Code z.B. 'ABCD'
  → navigate('/live/ABCD', { replace: true })
  → SpeakerView wird gerendert

Listener (QR-Scan): URL = https://listener.fintutto.world/ABCD
  → ListenerSessionPage mit code='ABCD'
  → Sprachauswahl → joinSession('ABCD', 'en', { mode: 'cloud' })
  → ListenerView wird gerendert
```

---

## 4. Bekannte Fallstricke

| Problem | Ursache | Fix |
|---|---|---|
| App friert beim Session-Restart ein | `session`-Objekt in `useEffect`-Dependencies | `sessionRef`-Pattern (siehe 2.1) |
| Kein Audio nach Neustart | `seqRef` nicht auf 0 zurückgesetzt | `seqRef.current = 0` in `stopAudioStream` (siehe 2.2) |
| Listener sieht leeren Spinner | `joinSession` nur bei `state.listenerLang` aufgerufen | Sprachauswahl-UI zeigen wenn kein State vorhanden |
| iOS Audio startet nicht | `AudioContext` suspended | `resume()` nach User-Gesture aufrufen |
| Infinite re-render in Listener | `connectionConfig` als unstable Object in Dependencies | `connectionConfigRef`-Pattern (siehe 2.3) |

---

## 5. Deployment-Struktur

| App | URL | Vercel-Projekt |
|---|---|---|
| Haupt-App (GuideTranslator) | `guidetranslator.com` | `translator` |
| Enterprise-App | `enterprise.guidetranslator.com` | `translator` (monorepo) |
| Listener-App | `listener.guidetranslator.com` | `translator` (monorepo) |
| AmtTranslator | `amttranslator.de` | separates Repo |
| Investors-Seite | `guidetranslator.com/investors` | `translator` |

**Deployment:** Jeder Push auf `main` triggert automatisch einen Vercel-Deploy. Kein manueller Deploy nötig.

---

## 6. Checkliste vor jedem Commit

Bevor du Änderungen an Live-Session-Dateien pushst:

- [ ] Keine Hook-Objekte in `useEffect`-Dependencies (Regel 2.1)
- [ ] `seqRef.current = 0` in `stopAudioStream` vorhanden (Regel 2.2)
- [ ] `connectionConfig` via Ref übergeben (Regel 2.3)
- [ ] `git diff src/hooks/useLiveSession.ts src/hooks/useAudioBroadcast.ts src/hooks/useAudioReceiver.ts` geprüft
- [ ] Keine `console.error` oder TypeScript-Fehler in den geänderten Dateien

---

## 7. Dateien mit besonderer Vorsicht behandeln

Diese Dateien implementieren die **Kernfunktion** der Plattform. Änderungen hier haben sofortige Auswirkungen auf alle Nutzer:

```
src/hooks/useLiveSession.ts          ← Session-State-Machine
src/hooks/useAudioBroadcast.ts       ← Audio-Sender (Speaker)
src/hooks/useAudioReceiver.ts        ← Audio-Empfänger (Listener)
src/lib/transport/supabase-transport.ts  ← Cloud-Transport
src/pages/LiveSessionPage.tsx        ← Speaker-Einstieg
src/pages/ListenerSessionPage.tsx    ← Listener-Einstieg
src/components/live/SpeakerView.tsx  ← Speaker-UI
src/components/live/ListenerView.tsx ← Listener-UI
```

**Regel:** Vor Änderungen an diesen Dateien immer den aktuellen Stand lesen und verstehen, warum bestehende Kommentare mit `CRITICAL:` oder `IMPORTANT:` markiert sind.

---

---

## 8. ConversationPage — Bidirektionaler Modus (Schachuhr)

Die `ConversationPage` implementiert den Face-to-Face-Konversationsmodus. Folgende Regeln gelten:

**Push-to-Talk:** Die Mikrofon-Buttons verwenden `onPointerDown`/`onPointerUp` (nicht `onClick`). Das ist Absicht — gedrückt halten = aufnehmen, loslassen = übersetzen. Nicht auf `onClick` umstellen.

**Per-Seite Audio:** `autoSpeakTop` und `autoSpeakBottom` sind unabhängige States. Die Logik: wenn Person A spricht, wird die Übersetzung an Person B ausgegeben — aber nur wenn `autoSpeakBottom` (die Seite von B) aktiv ist. Nicht auf einen globalen `autoSpeak`-State vereinfachen.

**Kontext-Modus:** `contextMode` wird an `translateText(..., context)` übergeben. `translate.ts` hängt Glossar-Hints an den Text. Für MedTranslator: `contextMode='medical'` als Default setzen.

**Visibility-Resume:** Der `visibilitychange`-Handler in `ConversationPage` startet die STT neu wenn der Tab zurückkommt. Nicht entfernen.

---

## 9. STT-Engine-Auswahl

`getBestSTTEngine(preferOffline?: boolean)` in `src/lib/stt.ts`:

- `preferOffline=false` (Standard): Web Speech → Google Cloud → Whisper
- `preferOffline=true`: Whisper zuerst (für Behörden/medical ohne Internet)

`useSpeechRecognition(preferOffline?: boolean)` gibt den Parameter weiter.

**Für Offline-Deployments:** Vor dem ersten Start `preloadWhisper()` aus `src/lib/offline/stt-engine.ts` aufrufen, damit das Modell (~40MB) heruntergeladen wird. Dann `useSpeechRecognition(true)` verwenden.

**STT-Proxy (TODO):** In `stt.ts` Zeile 755 ist ein `TODO (STT-Proxy)` Kommentar. Dieser Proxy soll Audio an `/api/stt` senden statt direkt an Google — für DSGVO Art.9-Konformität in medizinischen/behördlichen Kontexten. Noch nicht implementiert.

---

## 10. PWA-Installation

`usePWAInstall` in `src/hooks/usePWAInstall.ts`:

- Dismiss wird in `localStorage` mit 7-Tage-TTL gespeichert (nicht sessionStorage)
- `isIOSDevice=true` → `PWAInstallBanner` zeigt manuelle Safari-Anleitung
- `isIOSDevice=false` → nativer `beforeinstallprompt`-Dialog

**Nicht auf sessionStorage zurückstellen** — Behörden-Tablets brauchen die 7-Tage-Erinnerung.

---

*Zuletzt aktualisiert: 2026-03-26 — Stability-Improvements Commit (Push-to-Talk, Kontext-Modus, Per-Seite-Audio, Visibility-Resume, PWA-iOS, Whisper-Offline)*
*Verantwortlich: Alexander Deibel / fintutto.world*
