# TP-28: Barrierefreiheit (Accessibility)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-28 |
| **Testbereich** | Accessibility — Tastatur, Screenreader, Kontrast, ARIA |
| **Geschätzte Dauer** | ~12 Minuten |
| **Vorbedingungen** | Desktop mit Screenreader (VoiceOver/NVDA) oder Chrome Accessibility Tools |
| **Benötigte Geräte** | Desktop-PC/Laptop, optional: iPhone mit VoiceOver |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Gerät** | |
| **Screenreader (falls verwendet)** | |
| **Browser + Version** | |

---

## Testaufgaben

### A. Tastaturnavigation

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | **Tab-Taste**: Durch alle interaktiven Elemente navigieren → sinnvolle Reihenfolge | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | **Focus-Ring** sichtbar bei jedem fokussierten Element (blauer Rahmen o.ä.) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | **Enter-Taste**: Fokussierter Button wird aktiviert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | **Esc-Taste**: Offenes Dropdown/Modal schließt sich | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A5 | Sprachauswahl-Dropdown: mit Pfeiltasten navigierbar | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A6 | Kein Element ist mit der Tastatur **nicht erreichbar** (Tastaturfalle) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. ARIA-Labels & Rollen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | **Mikrofon-Button**: Hat sinnvolles aria-label (z.B. "Aufnahme starten") | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **Kopieren-Button**: Hat aria-label (z.B. "Übersetzung kopieren") | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | **Lautsprecher-Button**: Hat aria-label (z.B. "Übersetzung vorlesen") | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | **Eingabefelder**: Haben Placeholder-Text oder Label | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | **Statusanzeigen** (Online/Offline): Werden von Screenreader vorgelesen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Screenreader-Test (optional)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | **VoiceOver / NVDA** aktivieren → App ist **navigierbar** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Überschriften-Hierarchie (H1, H2) wird korrekt vorgelesen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Buttons werden mit ihrem **Zweck** vorgelesen (nicht nur "Button") | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | Übersetzer: Eingabefeld wird als **Textbereich** erkannt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C5 | Übersetzungsergebnis wird vorgelesen oder ist erreichbar | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Farbkontrast

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | **Text auf Hintergrund**: Kontrast ausreichend (WCAG AA: 4.5:1) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | **Buttons**: Text auf farbigem Hintergrund lesbar | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | **Placeholder-Text**: Mindest-Kontrast eingehalten | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | **Dark Mode**: Kontrast auch im Dark Mode ausreichend | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D5 | **Fehlermeldungen** (rot): Gut lesbar (nicht nur Farbe als Unterscheidung) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Sonstige Barrierefreiheit

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | **Schriftgröße** anpassen (Browser-Zoom 150%) → Layout bricht nicht | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | **200% Zoom** → App bleibt nutzbar | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | **Flaggen-Emojis** haben Textalternativen (Sprachname + Code) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E4 | **Loading-States**: Ladeanimation + Text (nicht nur visuell) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Tastaturnavigation | |
| ARIA-Labels | |
| Farbkontrast | |
| Screenreader-Kompatibilität | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-28 Ende — Geschätzte Dauer: 12 Minuten_
