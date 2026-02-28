# TP-20: UI-Sprachen (9 Sprachen)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-20 |
| **Testbereich** | i18n — Vollständigkeit und Korrektheit aller UI-Übersetzungen |
| **Geschätzte Dauer** | ~12 Minuten |
| **Vorbedingungen** | App geöffnet |
| **Benötigte Geräte** | Smartphone ODER Desktop |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Gerät** | |
| **Browser + Version** | |
| **Muttersprache(n)** | |

---

## Testaufgaben

### A. Sprachwechsel-Funktion

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | **UI-Sprachauswahl** im Header finden (Globe-Icon / Dropdown) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | Dropdown zeigt **9 Sprachen** mit Flaggen-Emojis | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | Sprachwechsel ist **sofort** (kein Nachladen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | Seite neu laden → gewählte Sprache bleibt gespeichert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Deutsch (DE) — Basissprache

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | UI-Sprache: **Deutsch** → Navigation: "Übersetzer, Live, Phrasebook, Info, Einstellungen" | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | Übersetzer-Seite: alle Labels auf Deutsch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | Einstellungen: alle Texte auf Deutsch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | **Keine fehlenden Übersetzungen** (kein englischer Fallback-Text) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Englisch (EN)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | UI-Sprache: **English** → Alle Texte wechseln auf Englisch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Navigation: "Translator, Live, Phrasebook, Info, Settings" | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Keine fehlenden Übersetzungen sichtbar | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Arabisch (AR) — RTL-Sprache

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | UI-Sprache: **العربية** → Texte auf Arabisch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | **Leserichtung RTL**: Layout spiegelt sich (Navigation rechts-nach-links) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | Arabische Texte sind **grammatisch korrekt** (soweit beurteilbar) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Türkisch (TR)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | UI-Sprache: **Türkçe** → Texte auf Türkisch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | Sonderzeichen korrekt: ç, ş, ğ, ı, ö, ü | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Keine fehlenden Übersetzungen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### F. Farsi (FA) — RTL-Sprache

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| F1 | UI-Sprache: **فارسی** → Texte auf Farsi | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F2 | **RTL-Layout** korrekt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F3 | Persische Zahlen / Texte korrekt angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### G. Ukrainisch (UK)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| G1 | UI-Sprache: **Українська** → kyrillische Texte | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| G2 | Keine fehlenden Übersetzungen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### H. Russisch (RU)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| H1 | UI-Sprache: **Русский** → kyrillische Texte | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| H2 | Keine fehlenden Übersetzungen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### I. Französisch (FR) & Spanisch (ES)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| I1 | UI-Sprache: **Français** → Texte auf Französisch, Akzente korrekt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| I2 | UI-Sprache: **Español** → Texte auf Spanisch, ñ/ü korrekt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### J. Auto-Detection

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| J1 | Browser-Sprache auf Türkisch einstellen → App startet auf Türkisch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| J2 | Browser-Sprache auf unbekannte Sprache (z.B. Finnisch) → Fallback auf Deutsch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Vollständigkeit der Übersetzungen | |
| RTL-Unterstützung (AR, FA) | |
| Sprachwechsel-Erlebnis | |
| Auto-Detection | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-20 Ende — Geschätzte Dauer: 12 Minuten_
