# TP-08: Live Session — Mehrere Listener, Multi-Sprache

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-08 |
| **Testbereich** | Live Session — Parallele Listener mit verschiedenen Zielsprachen |
| **Geschätzte Dauer** | ~15 Minuten |
| **Vorbedingungen** | Mindestens 3 Geräte, alle mit Internet |
| **Benötigte Geräte** | 1 Speaker + 2-3 Listener (Smartphones / Desktops) |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Gerät 1 (Speaker)** | |
| **Gerät 2 (Listener 1)** | |
| **Gerät 3 (Listener 2)** | |
| **Gerät 4 (Listener 3, optional)** | |

---

## Testaufgaben

### A. Multi-Listener Setup

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Speaker erstellt Session (Cloud, Deutsch) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | **Listener 1** tritt bei mit Zielsprache **Englisch** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | **Listener 2** tritt bei mit Zielsprache **Französisch** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | **Listener 3** (optional) tritt bei mit Zielsprache **Türkisch** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A5 | Speaker sieht **korrekte Listener-Anzahl** (2 bzw. 3) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A6 | Speaker sieht **Aufschlüsselung nach Sprache** (z.B. EN:1, FR:1, TR:1) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Parallele Übersetzung

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | Speaker spricht: "Wir fahren jetzt in den Hafen." | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **Listener 1** (EN) erhält: englische Übersetzung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | **Listener 2** (FR) erhält: französische Übersetzung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | **Listener 3** (TR, optional) erhält: türkische Übersetzung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | Jeder Listener erhält **NUR** seine Zielsprache (nicht die der anderen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B6 | Alle Listener erhalten die Übersetzung **ungefähr gleichzeitig** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Dynamisches Beitreten/Verlassen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | Listener 2 **verlässt** die Session → Speaker sieht aktualisierte Anzahl | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Speaker spricht weiter → Listener 1 erhält weiterhin Übersetzungen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Listener 2 tritt **erneut bei** (andere Sprache: Spanisch) → Speaker-Anzeige aktualisiert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | Listener 2 erhält jetzt **spanische** Übersetzungen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Sprachwechsel während der Session

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | Listener 1 wechselt Sprache von EN → **Arabisch** (über Chips) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Nächste Übersetzung kommt auf **Arabisch** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | Speaker-Anzeige aktualisiert sich (AR:1 statt EN:1) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Stresstest

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | Speaker spricht **5 Sätze schnell hintereinander** → alle werden bei allen Listenern übersetzt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | Keine Übersetzung geht verloren (Queue-basiertes System) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Reihenfolge der Übersetzungen stimmt (FIFO) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Multi-Listener Stabilität | |
| Parallelität der Übersetzungen | |
| Dynamisches Beitreten/Verlassen | |
| Sprachwechsel zur Laufzeit | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-08 Ende — Geschätzte Dauer: 15 Minuten_
