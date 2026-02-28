# TP-10: Live Session — Hotspot-Modus

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-10 |
| **Testbereich** | Live Session — Speaker als WiFi-Hotspot mit eingebettetem Relay |
| **Geschätzte Dauer** | ~15 Minuten |
| **Vorbedingungen** | 2 Smartphones, Speaker kann Hotspot erstellen |
| **Benötigte Geräte** | 2 Smartphones (Speaker: Android empfohlen, Listener: beliebig) |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Speaker-Gerät (Hotspot)** | |
| **Listener-Gerät** | |
| **Speaker-OS** | |
| **Listener-OS** | |

---

## Testaufgaben

### A. Hotspot-Erstellung

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Live → Speaker → **"Hotspot"** als Verbindungsmodus wählen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | **Android**: Hotspot wird automatisch erstellt (SSID + Passwort angezeigt) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | **iOS**: Hinweis erscheint, manuell den persönlichen Hotspot zu aktivieren | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | **WiFi-QR-Code** wird angezeigt (Schritt 1) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A5 | SSID und Passwort werden als Text angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Listener verbindet sich mit Hotspot

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | Listener scannt den **WiFi-QR-Code** mit der Kamera → verbindet sich automatisch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | Alternativ: Listener verbindet sich **manuell** mit dem WiFi (SSID + Passwort) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | Listener ist im **Hotspot-Netzwerk** verbunden | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Session beitreten über Hotspot

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | Speaker zeigt **Session-QR-Code** (Schritt 2) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Listener scannt Session-QR oder gibt Code ein | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Verbindung über **lokalen WebSocket** (eingebetteter Relay) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | Speaker sieht Listener in der Anzeige | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Übersetzung über Hotspot

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | Speaker spricht → Übersetzung kommt beim Listener an | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Übersetzung funktioniert **ohne Internetverbindung** (wenn Offline-Modelle vorhanden) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | Mehrere Sätze → alle korrekt übertragen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Stabilität

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | 5 Minuten ununterbrochen sprechen → Verbindung bleibt stabil | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | Listener-Gerät kurz sperren und entsperren → Verbindung hält oder reconnected | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Session sauber beenden → Hotspot kann geschlossen werden | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Hotspot-Erstellung | |
| WiFi-QR-Verbindung | |
| Übersetzungsqualität über Hotspot | |
| Stabilität | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-10 Ende — Geschätzte Dauer: 15 Minuten_
