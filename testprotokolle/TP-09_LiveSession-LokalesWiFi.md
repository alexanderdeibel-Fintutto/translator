# TP-09: Live Session — Lokales WiFi (Router-Modus)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-09 |
| **Testbereich** | Live Session — Lokaler WebSocket-Relay über portablen Router |
| **Geschätzte Dauer** | ~15 Minuten |
| **Vorbedingungen** | Portabler WiFi-Router (z.B. GL.iNet) mit Relay-Server, 2 Geräte im gleichen WLAN |
| **Benötigte Geräte** | 1 Router + 2 Smartphones/Laptops |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Router-Modell** | |
| **Router-IP** | |
| **Speaker-Gerät** | |
| **Listener-Gerät** | |

---

## Testaufgaben

### A. Vorbereitung

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Relay-Server auf dem Router läuft (Port 8765) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | Beide Geräte sind mit dem **Router-WLAN** verbunden | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | Health-Check: `http://<router-ip>:8765/health` im Browser aufrufen → Antwort kommt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Session erstellen (Lokal)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | Live → Speaker → **"Lokales WiFi"** als Verbindungsmodus wählen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | App findet den lokalen Server **automatisch** (Auto-Discovery) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | Session wird erstellt → Session-Code wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | QR-Code enthält **?ws=ws://<ip>:8765** Parameter | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | Verbindungsmodus-Anzeige zeigt **"Lokal"** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Listener beitreten (Lokal)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | Listener-Gerät: QR-Code scannen ODER Session-Link öffnen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Verbindung über **lokalen WebSocket** (nicht Cloud) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Listener ist verbunden → Speaker sieht Listener | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Übersetzung über lokales Netz

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | Speaker spricht → Übersetzung kommt beim Listener an | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Latenz ist **niedrig** (< 3 Sek, da lokales Netz) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | Mehrere Sätze sprechen → alle werden korrekt übertragen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Ohne Internet testen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | Router-Internet trennen (nur LAN, kein WAN) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | WebSocket-Verbindung bleibt **bestehen** (lokal) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Übersetzung funktioniert weiterhin (wenn Offline-Modelle installiert) ODER sinnvolle Fehlermeldung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### F. Session beenden

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| F1 | Speaker beendet Session → Listener erhält Benachrichtigung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F2 | Verbindung wird sauber geschlossen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Auto-Discovery des Routers | |
| Verbindungsstabilität (Lokal) | |
| Latenz im lokalen Netz | |
| Funktionalität ohne Internet | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-09 Ende — Geschätzte Dauer: 15 Minuten_
