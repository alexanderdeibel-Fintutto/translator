# TP-16: Einstellungen & API-Key Konfiguration

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-16 |
| **Testbereich** | Settings — API-Key, Netzwerkstatus, Speicher |
| **Geschätzte Dauer** | ~12 Minuten |
| **Vorbedingungen** | App geöffnet, ein Google Cloud API Key zum Testen bereit |
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

### A. Einstellungsseite öffnen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Navigation → **Einstellungen** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | Seite zeigt **Titel und Untertitel** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | Netzwerk-Statusanzeige ist sichtbar (**Online / Degraded / Offline**) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Netzwerk & Speicher

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | **Offline-Support** Indikatoren: IndexedDB, Cache API, Service Worker, WebAssembly, Persistent Storage | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **Speicheranzeige**: Balken mit Prozentwert und Bytes | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | **"Dauerhaften Speicher anfordern"** Button klicken (falls verfügbar) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | Browser fragt nach Berechtigung oder gewährt automatisch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Google Cloud API Key

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | **API-Key-Feld** finden (Passwort-Eingabe) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | API Key eingeben → **Anzeigen/Verbergen-Toggle** funktioniert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | **Speichern** klicken → Erfolgsmeldung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | Statusanzeige wechselt auf **"Aktiv"** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C5 | Seite neu laden → API Key ist **gespeichert** (localStorage) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C6 | Übersetzer testen → Provider-Badge zeigt **"Google"** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C7 | API Key löschen und speichern → Status wechselt auf **"Inaktiv"** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C8 | Ohne API Key: Übersetzung funktioniert noch (Fallback auf MyMemory) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Cache-Verwaltung

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | **Übersetzungs-Cache**: Eintragsanzahl wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | "Cache leeren" klicken → Anzahl geht auf 0 | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | **TTS-Audio-Cache**: Clip-Anzahl wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | "Audio-Cache leeren" klicken → Anzahl geht auf 0 | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D5 | Nach Cache-Leerung: Übersetzungen dauern beim ersten Mal wieder länger | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. iOS Safari Hinweis

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | Auf iOS Safari: **Hinweis zur Homescreen-Installation** für 7-Tage-Speicher | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | Nur auf iOS/Safari prüfen |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Übersichtlichkeit der Einstellungen | |
| API-Key Verwaltung | |
| Cache-Management | |
| Speicheranzeige | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-16 Ende — Geschätzte Dauer: 12 Minuten_
