# TP-17: Offline-Sprachpakete & Whisper STT

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-17 |
| **Testbereich** | Offline — Sprachpaket-Download, Whisper-Modell, Offline-Übersetzung |
| **Geschätzte Dauer** | ~15 Minuten |
| **Vorbedingungen** | App geöffnet, stabile Internetverbindung für Downloads |
| **Benötigte Geräte** | Smartphone ODER Desktop (min. 200 MB freier Speicher) |

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

### A. Sprachpaket-Übersicht

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Einstellungen → **Offline-Sprachpakete** Sektion finden | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | Liste der verfügbaren Sprachpaare wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | Sprachpaare sind **nach Quellsprache gruppiert** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | Geschätzte **Dateigröße** pro Paket angezeigt (~35 MB) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Sprachpaket herunterladen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | **Deutsch → Englisch** Paket auswählen und Download starten | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **Fortschrittsbalken** während des Downloads sichtbar | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | Download-Geschwindigkeit ist akzeptabel | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | Nach Abschluss: Status wechselt auf **"Heruntergeladen"** / Häkchen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | **Löschen-Button** erscheint für heruntergeladene Pakete | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Zweites Sprachpaket

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | **Englisch → Französisch** Paket herunterladen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Download funktioniert parallel-frei (kein Konflikt mit erstem Paket) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Speicheranzeige aktualisiert sich nach Downloads | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Whisper STT Modell

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | **Whisper-Modell** Sektion finden in den Einstellungen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Status: "Nicht heruntergeladen" / Download-Button | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | Download starten → **Fortschrittsbalken** sichtbar | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | Nach Abschluss: Status **"Bereit"** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Offline-Übersetzung testen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | **Flugmodus aktivieren** (oder Netzwerk trennen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | Übersetzer → Deutsch → Englisch: "Guten Tag" eingeben | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Übersetzung kommt **offline** über das heruntergeladene Modell | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E4 | Provider-Badge zeigt **"Offline"** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E5 | Sprachpaar **ohne** heruntergeladenes Modell → sinnvolle Fehlermeldung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### F. Pivot-Übersetzung

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| F1 | DE→EN und EN→FR Pakete heruntergeladen: DE→FR testen (via Englisch-Pivot) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F2 | Pivot-Übersetzung liefert **sinnvolles Ergebnis** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### G. Sprachpaket löschen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| G1 | Heruntergeladenes Paket **löschen** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| G2 | Status wechselt zurück auf "Nicht heruntergeladen" | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| G3 | Speicher wird freigegeben | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Download-Erlebnis | |
| Offline-Übersetzungsqualität | |
| Pivot-Übersetzung | |
| Speicher-Management | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-17 Ende — Geschätzte Dauer: 15 Minuten_
