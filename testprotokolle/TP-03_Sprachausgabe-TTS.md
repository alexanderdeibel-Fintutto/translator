# TP-03: Sprachausgabe (Text-to-Speech)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-03 |
| **Testbereich** | Übersetzer — Sprachausgabe & Stimmqualität |
| **Geschätzte Dauer** | ~12 Minuten |
| **Vorbedingungen** | App geöffnet, Lautsprecher/Kopfhörer verfügbar |
| **Benötigte Geräte** | Smartphone ODER Desktop |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Gerät** | |
| **Browser + Version** | |
| **Betriebssystem** | |

---

## Testaufgaben

### A. Manuelle Sprachausgabe

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Text übersetzen (DE→EN). **Lautsprecher-Button** bei der Übersetzung klicken → Audio wird abgespielt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | Aussprache ist **verständlich und natürlich** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | **TTS-Engine-Badge** wird angezeigt (☁️ Cloud oder 💾 Browser) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | **Stop-Button** während der Wiedergabe klicken → Audio stoppt sofort | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A5 | Lautsprecher-Button beim **Quelltext** klicken → Quelltext wird vorgelesen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Auto-Speak Funktion

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | **Auto-Speak** ist standardmäßig aktiviert (Toggle prüfen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | Text eingeben → Übersetzung wird **automatisch vorgelesen** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | Auto-Speak **deaktivieren** → neuen Text eingeben → Übersetzung wird NICHT vorgelesen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | Auto-Speak wieder aktivieren → nächste Übersetzung wird wieder vorgelesen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. HD Voice (Chirp 3 HD)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | **HD-Voice-Toggle** finden und aktivieren | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Übersetzung abspielen → Stimme klingt **hochwertiger** als Standard | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | HD-Voice deaktivieren → Standard-Stimme (Neural2) wird wieder verwendet | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Verschiedene Sprachen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | Zielsprache **Englisch** → TTS spielt englische Aussprache | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Zielsprache **Französisch** → TTS spielt französische Aussprache | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | Zielsprache **Arabisch** → TTS spielt arabische Aussprache | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | Zielsprache **Japanisch** → TTS spielt japanische Aussprache | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D5 | Zielsprache **Türkisch** → TTS spielt türkische Aussprache | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D6 | Zielsprache **Hindi** → TTS spielt Hindi-Aussprache | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Edge Cases

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | **Sehr langen Text** übersetzen (100+ Wörter) → TTS spielt vollständig ab | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | Schnell hintereinander 3x auf Lautsprecher klicken → kein Audiochaos | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | TTS abspielen, dann sofort neue Übersetzung starten → alte Ausgabe stoppt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E4 | Gerät stumm geschaltet → kein Fehler in der App (Audio spielt eben nicht) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Stimmqualität (Standard) | |
| Stimmqualität (HD) | |
| Auto-Speak Zuverlässigkeit | |
| Sprachvielfalt | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-03 Ende — Geschätzte Dauer: 12 Minuten_
