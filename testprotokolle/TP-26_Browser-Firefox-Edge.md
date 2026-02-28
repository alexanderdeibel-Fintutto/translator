# TP-26: Browser-Kompatibilität — Firefox & Edge

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-26 |
| **Testbereich** | Kompatibilität — Firefox und Microsoft Edge |
| **Geschätzte Dauer** | ~12 Minuten |
| **Vorbedingungen** | Firefox und Edge installiert |
| **Benötigte Geräte** | Desktop mit Firefox UND Edge |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Firefox-Version** | |
| **Edge-Version** | |
| **Betriebssystem** | |

---

## Testaufgaben

### A. Firefox

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | App lädt vollständig in Firefox | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | **Übersetzen** funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | **Spracheingabe**: Web Speech API (Firefox hat eingeschränkte Unterstützung) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | Falls STT nicht verfügbar: **Whisper-Fallback** oder Hinweis zum Modell-Download | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A5 | **Sprachausgabe** (Browser TTS) funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A6 | **Dark Mode** Toggle funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A7 | **Alle Seiten** navigierbar ohne Fehler | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A8 | **Service Worker** ist registriert (F12 → Application) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A9 | **IndexedDB** funktioniert (Cache-Zähler in Einstellungen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A10 | **Keine Konsolenfehler** in DevTools | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Microsoft Edge

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | App lädt vollständig in Edge | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **Übersetzen** funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | **Spracheingabe** (Web Speech API, basiert auf Chromium) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | **Sprachausgabe** funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | **Dark Mode** funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B6 | **Alle Seiten** laden ohne Fehler | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B7 | **PWA-Installation** wird angeboten (Edge unterstützt PWA gut) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B8 | **Keine Konsolenfehler** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Vergleich

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | Gleiche Übersetzung in Chrome/Firefox/Edge → **gleiches Ergebnis** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | **Visuelles Erscheinungsbild** konsistent über alle 3 Browser | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | **Performance** vergleichbar (keine großen Unterschiede) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Firefox Funktionalität | |
| Edge Funktionalität | |
| Cross-Browser Konsistenz | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-26 Ende — Geschätzte Dauer: 12 Minuten_
