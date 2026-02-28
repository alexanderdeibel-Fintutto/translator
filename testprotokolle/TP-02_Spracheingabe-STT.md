# TP-02: Spracheingabe (Speech-to-Text)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-02 |
| **Testbereich** | Übersetzer — Mikrofon & Spracherkennung |
| **Geschätzte Dauer** | ~12 Minuten |
| **Vorbedingungen** | App geöffnet, Mikrofon-Berechtigung erteilt, ruhige Umgebung |
| **Benötigte Geräte** | Smartphone ODER Desktop mit Mikrofon |

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

### A. Mikrofon-Aktivierung

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Mikrofon-Button ist sichtbar auf der Übersetzer-Seite | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | Mikrofon-Button klicken → Browser fragt nach Mikrofon-Berechtigung (beim ersten Mal) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | Berechtigung erteilen → Aufnahme startet (roter Indikator / Animation sichtbar) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | Erneut klicken → Aufnahme stoppt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Spracherkennung Deutsch

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | Quellsprache: Deutsch. Aufnahme starten und deutlich sagen: "Ich möchte einen Kaffee bestellen" | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **Interim-Text** erscheint während des Sprechens (live-Vorschau) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | Nach Pause/Stop: Text wird als **final** übernommen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | Übersetzung erscheint automatisch nach Erkennung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | Erkannter Text stimmt inhaltlich mit dem Gesprochenen überein | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Spracherkennung andere Sprachen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | Quellsprache: **Englisch**. Sagen: "Where is the nearest hospital?" → korrekt erkannt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Quellsprache: **Französisch**. Sagen: "Bonjour, comment allez-vous?" → korrekt erkannt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Quellsprache: **Spanisch**. Sagen: "Buenos días, necesito ayuda" → korrekt erkannt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | Quellsprache: **Türkisch**. Sagen: "Merhaba, yardıma ihtiyacım var" → korrekt erkannt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Satzerkennung & Streaming

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | Mehrere Sätze hintereinander sprechen → jeder Satz wird einzeln erkannt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Pause mitten im Satz → System wartet geduldig weiter | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | Schnelles, zusammenhängendes Sprechen (20+ Sekunden) → Text wird vollständig erfasst | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | Leise Umgebung: Erkennung funktioniert zuverlässig | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D5 | Mäßige Hintergrundgeräusche: Erkennung funktioniert noch akzeptabel | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Fehlerfälle

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | Mikrofon-Berechtigung verweigern → sinnvolle Fehlermeldung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | Aufnahme starten, aber nichts sagen (10 Sek.) → kein Absturz, kein Fehler | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Während der Aufnahme die Seite wechseln → Aufnahme stoppt sauber | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E4 | Mikrofon mehrmals schnell ein/aus schalten → kein Absturz | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Erkennungsgenauigkeit Deutsch | |
| Erkennungsgenauigkeit Fremdsprachen | |
| Reaktionsgeschwindigkeit (Interim-Text) | |
| Umgang mit Fehlern | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-02 Ende — Geschätzte Dauer: 12 Minuten_
