# TP-27: Netzwerk-Szenarien & Fehlerbehandlung

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-27 |
| **Testbereich** | Robustheit — Online/Offline-Wechsel, Fehlerbehandlung, Degraded Mode |
| **Geschätzte Dauer** | ~15 Minuten |
| **Vorbedingungen** | App geöffnet, Möglichkeit WLAN/Mobilfunk zu trennen |
| **Benötigte Geräte** | Smartphone (WLAN + Mobilfunk steuerbar) |

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

### A. Netzwerkstatus-Erkennung

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | Mit Internet: Status zeigt **"Online"** (grün) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | **Flugmodus** aktivieren → Status wechselt auf **"Offline"** (rot) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | Flugmodus deaktivieren → Status wechselt zurück auf **"Online"** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | Statuswechsel erfolgt **innerhalb von 5 Sekunden** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. Übersetzung bei Netzwerkwechsel

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | Online: Text übersetzen → funktioniert normal (Provider: Google/MyMemory) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | **Flugmodus ein** → Text übersetzen → Fehlermeldung ODER Offline-Modell | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | Fehlermeldung ist **verständlich** (nicht technischer Jargon) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | **Flugmodus aus** → Nächste Übersetzung funktioniert wieder online | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | Kein dauerhafter Fehlerzustand nach Wiederherstellung der Verbindung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Provider-Kaskade & Circuit Breaker

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | Ohne API-Key: Provider springt auf **MyMemory** (Fallback) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | Provider-Badge zeigt den aktuell verwendeten Provider | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Bei wiederholten Fehlern: **Circuit Breaker** greift (Provider wird temporär übersprungen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. Live Session bei Verbindungsverlust

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | Live Session starten (Cloud) → verbunden | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | **WLAN kurz trennen** (5 Sek.) und wieder verbinden → Auto-Reconnect | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | Reconnect-Hinweis: "Verbindung unterbrochen — wird automatisch wiederhergestellt..." | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | Nach Reconnect: Session funktioniert normal weiter | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D5 | **WLAN länger trennen** (30+ Sek.) → sinnvoller Endzustand (Timeout, Fehlermeldung) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Cache-Nutzung bei Offline

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | Gleichen Text wie vorher übersetzen (gecached) → **Cache-Hit** auch offline | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | Provider-Badge zeigt **"Cache"** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Neuen, unbekannten Text offline übersetzen → Offline-Modell oder Fehlermeldung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### F. Degraded-Modus (schlechte Verbindung)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| F1 | Sehr langsame Verbindung simulieren (z.B. 2G in DevTools) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F2 | Übersetzung dauert länger, aber **kommt an** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F3 | Ladeindikator zeigt an, dass gearbeitet wird | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F4 | Kein Timeout-Absturz bei langsamer Verbindung | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Netzwerkstatus-Erkennung | |
| Fehlermeldungen (Verständlichkeit) | |
| Auto-Reconnect | |
| Offline-Fallback | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-27 Ende — Geschätzte Dauer: 15 Minuten_
