# TP-18: PWA-Installation & Offline-Modus

| Feld | Wert |
|------|------|
| **Protokoll-ID** | TP-18 |
| **Testbereich** | Progressive Web App — Installation, Service Worker, Offline-Nutzung |
| **Geschätzte Dauer** | ~15 Minuten |
| **Vorbedingungen** | Smartphone mit Chrome oder Safari, App NICHT bereits als PWA installiert |
| **Benötigte Geräte** | Smartphone (Android oder iOS) |

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

### A. PWA-Installationsbanner

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| A1 | App im Browser öffnen → **Installationsbanner** erscheint (unten oder oben) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A2 | Banner zeigt **"App installieren"** mit Vorteilen (Offline, Geschwindigkeit) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A3 | Banner kann **geschlossen/weggeklickt** werden | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| A4 | Nach Schließen: Banner erscheint **nicht erneut** in der gleichen Session | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### B. PWA installieren

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| B1 | **"Installieren"** klicken (oder "Zum Homescreen") | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B2 | Browser zeigt nativen **Installations-Dialog** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B3 | Installation bestätigen → App erscheint auf dem **Homescreen** | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B4 | App-Icon sieht **korrekt** aus | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| B5 | App über Homescreen öffnen → startet im **Standalone-Modus** (keine Browser-Leiste) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### C. Standalone-Modus prüfen

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| C1 | App läuft **ohne Browser-Chrome** (Adressleiste, Tabs) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C2 | **Status-Bar** hat korrekte Farbe (#0369a1 Blau) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C3 | Navigation innerhalb der App funktioniert normal | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| C4 | Alle Seiten laden korrekt (Übersetzer, Live, Phrasebook, etc.) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### D. PWA-Shortcuts (Homescreen)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| D1 | Lang auf App-Icon drücken → **Shortcuts** erscheinen (Android) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D2 | Shortcut **"Live Session"** → öffnet /live | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D3 | Shortcut **"Konversation"** → öffnet /conversation | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| D4 | Shortcut **"Kamera"** → öffnet /camera | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### E. Offline-Modus (ohne Sprachpakete)

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| E1 | **Flugmodus** aktivieren (oder Netzwerk trennen) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E2 | PWA öffnen → App **lädt trotzdem** (aus Service Worker Cache) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E3 | Alle Seiten sind **navigierbar** (UI, Layout, Bilder) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E4 | Übersetzer: Text eingeben → sinnvolle Fehlermeldung (keine Verbindung + kein Offline-Modell) | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| E5 | Status zeigt **"Offline"** an | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

### F. Service Worker Update

| Nr. | Aufgabe | Status | Bemerkung |
|-----|---------|--------|-----------|
| F1 | Netzwerk wieder einschalten → App aktualisiert sich im Hintergrund | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |
| F2 | Keine Fehlermeldung beim Wechsel Online → Offline → Online | ☐ OK  ☐ FEHLER  ☐ TEILWEISE | |

---

## Gesamtbewertung

| Kriterium | Bewertung (1-5) |
|-----------|----------------|
| Installationserlebnis | |
| Standalone-Darstellung | |
| Offline-Verfügbarkeit | |
| Service Worker Zuverlässigkeit | |
| Gesamteindruck | |

**Freitextkommentar:**

---

_TP-18 Ende — Geschätzte Dauer: 15 Minuten_
