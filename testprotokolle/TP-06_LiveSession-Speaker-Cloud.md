# TP-06: Live Session — Speaker (Cloud-Modus)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-06 |
| **Testbereich** | Live Session — Speaker-Rolle über Cloud (Supabase) |
| **Geschätzte Dauer** | ~15 Minuten |
| **Vorbedingungen** | 2 Geräte, beide mit Internet, Mikrofon am Speaker-Gerät |
| **Benötigte Geräte** | 2 Smartphones ODER 1 Smartphone + 1 Desktop |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Speaker-Gerät** | |
| **Listener-Gerät** | |
| **Browser (Speaker)** | |
| **Browser (Listener)** | |

---

## Testaufgaben

### A. Session erstellen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Navigation → **Live** (in der Hauptnavigation) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | Landing-Page zeigt **Speaker** und **Listener** Auswahl | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | **Speaker** auswählen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | Quellsprache auswählen (z.B. Deutsch) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A5 | Verbindungsmodus **Cloud** wählen (Standard) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A6 | Session wird erstellt → **Session-Code** wird angezeigt (z.B. "TR-A3K9") | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A7 | **QR-Code** wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A8 | Verbindungsstatus zeigt **"Cloud"** an | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Listener beitreten lassen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | Auf dem **2. Gerät**: App öffnen → Live → **Listener** wählen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | Session-Code eingeben ODER QR-Code scannen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | Zielsprache wählen (z.B. Englisch) und beitreten | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | **Speaker sieht**: Listener-Anzahl erhöht sich auf 1 | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | Speaker sieht Aufschlüsselung nach Sprache (z.B. "EN: 1") | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Sprechen & Übersetzen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | Speaker: **Aufnahme starten** (Mikrofon-Button) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Aufnahme-Indikator ist sichtbar (rot pulsierend) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Deutlich sagen: "Willkommen an Bord. Heute besuchen wir die Altstadt." | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | **Speaker-Seite**: Transkript erscheint in Echtzeit | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C5 | **Listener-Seite**: Übersetzung erscheint in der Zielsprache | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C6 | Latenzanzeige beim Speaker: STT ms, Translate ms, Total ms | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C7 | Gesamtlatenz ist unter **5 Sekunden** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Aufnahme pausieren & fortsetzen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | **Pause** klicken → Aufnahme stoppt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Sprechen → wird NICHT mehr erfasst | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | **Fortsetzen** klicken → Aufnahme geht weiter | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | Neuer Text wird wieder erfasst und übersetzt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Session beenden

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | **Session beenden** klicken | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | **Listener** erhält Benachrichtigung: "Session beendet" | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Speaker wird zurück zur Landing-Page geleitet | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E4 | Listener wird aufgefordert, die Session zu verlassen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Session-Erstellung | |
| QR-Code / Beitritt | |
| Echtzeit-Übersetzung | |
| Latenz | |
| Session-Beendigung | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-06 Ende — Geschätzte Dauer: 15 Minuten_
