# TP-21: RTL-Sprachen (Arabisch, Farsi)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-21 |
| **Testbereich** | Right-to-Left — Layout, Textausrichtung, Spezialzeichen |
| **Geschätzte Dauer** | ~12 Minuten |
| **Vorbedingungen** | App geöffnet, idealerweise Tester mit Arabisch- oder Farsi-Kenntnissen |
| **Benötigte Geräte** | Smartphone ODER Desktop |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Gerät** | |
| **Browser + Version** | |
| **Arabisch/Farsi-Kenntnisse** | ☐ Muttersprachler  ☐ Grundkenntnisse  ☐ Keine |

---

## Testaufgaben

### A. RTL-Layout (UI-Sprache Arabisch)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | UI-Sprache auf **Arabisch** stellen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | **Navigation**: Reihenfolge spiegelt sich (von rechts nach links) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | **Header**: Logo links, Sprache rechts → spiegelt zu Logo rechts, Sprache links | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | **Buttons**: Icons und Text korrekt ausgerichtet | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A5 | **Eingabefelder**: Text beginnt von rechts | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A6 | **Cards und Layouts**: Padding/Margin korrekt gespiegelt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. RTL-Übersetzung

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | Quellsprache **Deutsch**, Zielsprache **Arabisch** → Übersetzung RTL angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | Quellsprache **Arabisch**, Zielsprache **Deutsch** → Quelltext RTL, Zieltext LTR | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | **Gemischter Text** (Arabisch + Zahlen + Latein): korrekte Bidi-Anzeige | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | Kopieren-Button: Arabischer Text wird korrekt in Zwischenablage kopiert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. RTL-Layout (UI-Sprache Farsi)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | UI-Sprache auf **Farsi** stellen → RTL-Layout | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Persische Texte korrekt dargestellt (ی statt ي, ک statt ك) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Navigation und Layout korrekt gespiegelt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. RTL in speziellen Bereichen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | **Phrasebook** mit arabischen Phrasen: Text RTL, Kategorie-Tags korrekt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | **Live Session** Listener-View: Arabische Übersetzung RTL angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | **Konversation**: Arabischer Text in Nachrichten RTL | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | **Sprachauswahl-Dropdown**: Arabische/Farsi Sprachnamen korrekt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Wechsel RTL → LTR

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | Von Arabisch zu **Deutsch** wechseln → Layout wechselt sofort zurück zu LTR | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | Kein Layout-Flackern beim Wechsel | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Alle Elemente sind wieder korrekt LTR ausgerichtet | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| RTL-Layout Korrektheit | |
| Bidirektionaler Text | |
| Arabisch/Farsi Textqualität | |
| LTR↔RTL Wechsel | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-21 Ende — Geschätzte Dauer: 12 Minuten_
