# TP-11: Live Session — BLE (Bluetooth Direct)

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-11 |
| **Testbereich** | Live Session — Bluetooth Low Energy (GATT) |
| **Geschätzte Dauer** | ~15 Minuten |
| **Vorbedingungen** | 2 Smartphones mit nativer App (Capacitor), Bluetooth aktiviert |
| **Benötigte Geräte** | 2 Smartphones (iOS oder Android, native App installiert) |

---

## Tester-Information

| Feld | Eintrag |
|------|---------|
| **Tester-Name** | |
| **Datum** | |
| **Speaker-Gerät** | |
| **Listener-Gerät** | |
| **Speaker-OS + Version** | |
| **Listener-OS + Version** | |

---

## Testaufgaben

### A. BLE-Vorbereitung

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Bluetooth auf **beiden** Geräten aktiviert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | App hat **Bluetooth-Berechtigung** auf beiden Geräten | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | Live → Speaker → **"BLE"** als Verbindungsmodus verfügbar | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. BLE-Session erstellen (Speaker)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | BLE-Modus auswählen → Session wird erstellt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **GATT-Server** startet (Indikator sichtbar) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | BLE-Advertising beginnt (Gerät ist für Listener sichtbar) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | Session-Code oder BLE-Gerätename wird angezeigt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. BLE-Discovery (Listener)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | Listener: Live → Listener → **BLE** wählen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | **BLE-Scan** startet automatisch | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Speaker-Session erscheint in der Liste mit **RSSI-Signalstärke** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | Signalstärke-Anzeige (3-stufig) zeigt sinnvollen Wert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C5 | Session antippen → Verbindung wird hergestellt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Übersetzung über BLE

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | Speaker spricht → Übersetzung kommt via BLE beim Listener an | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Text wird korrekt übertragen (keine Zeichenverstümmelung) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | **Lange Texte** (100+ Zeichen) werden korrekt fragmentiert und reassembliert | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | Kein Internet benötigt (wenn Offline-Modelle vorhanden) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Reichweite & Stabilität

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | Geräte **1 Meter** entfernt → Verbindung stabil | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | Geräte **5 Meter** entfernt → Verbindung stabil | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Geräte **10+ Meter** entfernt → Verbindung noch möglich? | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E4 | Bei Verbindungsabbruch → automatischer Reconnect | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### F. Session beenden

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| F1 | Session beenden → BLE-Advertising stoppt | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F2 | GATT-Server wird sauber geschlossen | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F3 | Listener erhält Session-Ende-Benachrichtigung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| BLE-Discovery Zuverlässigkeit | |
| Verbindungsaufbau-Geschwindigkeit | |
| Übertragungsqualität | |
| Reichweite | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-11 Ende — Geschätzte Dauer: 15 Minuten_
