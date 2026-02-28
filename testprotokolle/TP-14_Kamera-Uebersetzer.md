# TP-14: Kamera-Übersetzer (OCR)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-14 |
| **Testbereich** | Kamera — Texterkennung & Übersetzung von Bildern |
| **Geschätzte Dauer** | ~12 Minuten |
| **Vorbedingungen** | App geöffnet, Google Cloud API Key konfiguriert, Kamera-Zugriff |
| **Benötigte Geräte** | Smartphone mit Kamera, gedruckte Texte zum Fotografieren |

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

## Vorbereitung

Halten Sie folgende Texte zum Fotografieren bereit:
- Ein **deutsches Schild** oder Dokument (z.B. Speisekarte, Straßenschild)
- Ein **englischer Text** (z.B. Buch, Verpackung)
- Optional: Text in einer **nicht-lateinischen Schrift** (z.B. Arabisch, Chinesisch)

---

## Testaufgaben

### A. Kamera-Seite öffnen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Navigation → **Kamera** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | Kamera-Interface wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | Sprachpaar-Auswahl (Quell- und Zielsprache) ist sichtbar | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | Falls kein API-Key konfiguriert: **Warnhinweis** wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Foto aufnehmen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | Kamera-Berechtigung wird angefragt (beim ersten Mal) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **Foto aufnehmen** von einem deutschen Text | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | **Bildvorschau** wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | Ladeanzeige: "Text wird extrahiert..." | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | **Extrahierter Text** wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B6 | Text stimmt mit dem fotografierten Text überein | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Übersetzung des extrahierten Textes

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | Übersetzung startet **automatisch** nach OCR | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Übersetzte Version wird unterhalb/neben dem Originaltext angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | **Kopieren-Button** bei der Übersetzung → Text in Zwischenablage | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | **Sprechen-Button** → Übersetzung wird vorgelesen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Galerie-Upload

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | **Galerie-Button** klicken → Bildauswahl öffnet sich | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Bestehendes Foto auswählen → OCR + Übersetzung funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Verschiedene Texte

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | **Englischen Text** fotografieren → DE-Übersetzung korrekt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | **Gedruckten Text** (gute Qualität) → hohe OCR-Genauigkeit | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | **Handschriftlichen Text** → OCR versucht zu erkennen (evtl. weniger genau) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E4 | **Schlechte Beleuchtung** → sinnvolle Fehlermeldung oder Hinweis | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E5 | **Bild ohne Text** (z.B. Landschaft) → Meldung "Kein Text gefunden" | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### F. RTL-Text

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| F1 | Arabischen/hebräischen Text fotografieren → Text wird RTL angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F2 | Übersetzung ins Deutsche → korrekte LTR-Anzeige | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| OCR-Genauigkeit | |
| Übersetzungsqualität | |
| Benutzerfreundlichkeit | |
| Geschwindigkeit (OCR + Übersetzung) | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-14 Ende — Geschätzte Dauer: 12 Minuten_
