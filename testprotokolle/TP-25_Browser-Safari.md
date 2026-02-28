# TP-25: Browser-Kompatibilität — Safari (macOS + iOS)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-25 |
| **Testbereich** | Kompatibilität — Safari Desktop & Safari iOS |
| **Geschätzte Dauer** | ~12 Minuten |
| **Vorbedingungen** | Safari auf macOS und/oder iPhone |
| **Benötigte Geräte** | Mac mit Safari UND/ODER iPhone mit Safari |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Safari-Version (Desktop)** | |
| **Safari-Version (iOS)** | |
| **macOS-Version** | |
| **iOS-Version** | |

---

## Testaufgaben

### A. Safari Desktop (macOS)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | App lädt vollständig | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | **Übersetzen** funktioniert (Text + Ergebnis) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | **Spracheingabe**: Web Speech API (evtl. eingeschränkt in Safari) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | Falls Web Speech nicht verfügbar: Sinnvoller **Fallback/Hinweis** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A5 | **Sprachausgabe** funktioniert (Browser oder Cloud TTS) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A6 | **Dark Mode** funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A7 | Alle Seiten laden ohne Fehler | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Safari iOS (iPhone)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | App lädt vollständig auf Safari iOS | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **Touch-Bedienung** funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | **Spracheingabe**: Google Cloud STT wird als Fallback verwendet | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | **Sprachausgabe** spielt Audio ab (evtl. nur nach User-Interaktion) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | **Kamera-Zugriff** funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B6 | **Zum Home-Bildschirm hinzufügen** (Share → Add to Home Screen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B7 | App im Standalone-Modus (vom Home-Screen geöffnet) funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Safari-spezifische Probleme

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | **Audio Autoplay**: Erster TTS-Play braucht User-Interaktion (Safari-Einschränkung) → sauber gehandhabt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | **IndexedDB**: Daten werden gespeichert (Safari hat 7-Tage-Limit ohne PWA) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | **Persistent Storage**: Hinweis zur Homescreen-Installation für Datenpersistenz | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | **Safe Area**: Inhalte werden nicht durch Notch/Dynamic Island verdeckt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C5 | **Scroll-Bounce**: iOS-typisches Rubber-Banding stört nicht die Bedienung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C6 | **Tastatur**: Bei Eingabefeld-Fokus scrollt die Seite korrekt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. WebAssembly / Offline

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | **WebAssembly** wird unterstützt (Einstellungen → Offline-Support prüfen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Offline-Modell herunterladen funktioniert in Safari | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Safari Desktop Funktionalität | |
| Safari iOS Funktionalität | |
| STT-Fallback-Handling | |
| Audio/TTS auf iOS | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-25 Ende — Geschätzte Dauer: 12 Minuten_
