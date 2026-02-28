# GuideTranslator — Testprotokolle (Gesamtübersicht)

**Version**: 1.0
**Erstellt**: 2026-02-28
**App-URL**: https://app.guidetranslator.com

---

## Übersicht aller Testprotokolle

| Nr. | Testprotokoll | Bereich | Dauer | Geräte |
|-----|--------------|---------|-------|--------|
| **TP-01** | Basis-Übersetzung (Texteingabe) | Übersetzer | ~12 Min | Smartphone/Desktop |
| **TP-02** | Spracheingabe (STT) | Übersetzer | ~12 Min | Smartphone/Desktop |
| **TP-03** | Sprachausgabe (TTS) | Übersetzer | ~12 Min | Smartphone/Desktop |
| **TP-04** | Formality, Quick Phrases & History | Übersetzer | ~12 Min | Smartphone/Desktop |
| **TP-05** | Satz- vs. Absatzmodus | Übersetzer | ~10 Min | Smartphone/Desktop |
| **TP-06** | Live Session — Speaker (Cloud) | Live | ~15 Min | 2 Geräte |
| **TP-07** | Live Session — Listener (Cloud) | Live | ~12 Min | 2 Geräte |
| **TP-08** | Live Session — Mehre Listener, Multi-Sprache | Live | ~15 Min | 3+ Geräte |
| **TP-09** | Live Session — Lokales WiFi (Router) | Live | ~15 Min | Router + 2 Geräte |
| **TP-10** | Live Session — Hotspot-Modus | Live | ~15 Min | 2 Smartphones |
| **TP-11** | Live Session — BLE (Bluetooth) | Live | ~15 Min | 2 Smartphones (nativ) |
| **TP-12** | Live Session — Protokoll-Export | Live | ~10 Min | 2 Geräte |
| **TP-13** | Konversationsmodus (Face-to-Face) | Konversation | ~12 Min | Smartphone |
| **TP-14** | Kamera-Übersetzer (OCR) | Kamera | ~12 Min | Smartphone |
| **TP-15** | Phrasebook | Phrasebook | ~12 Min | Smartphone/Desktop |
| **TP-16** | Einstellungen & API-Key | Settings | ~12 Min | Smartphone/Desktop |
| **TP-17** | Offline-Sprachpakete & Whisper | Offline | ~15 Min | Smartphone/Desktop |
| **TP-18** | PWA-Installation & Offline-Modus | PWA | ~15 Min | Smartphone |
| **TP-19** | Dark Mode & Theming | UI | ~10 Min | Smartphone/Desktop |
| **TP-20** | UI-Sprachen (9 Sprachen) | i18n | ~12 Min | Smartphone/Desktop |
| **TP-21** | RTL-Sprachen (Arabisch, Farsi) | i18n/RTL | ~12 Min | Smartphone/Desktop |
| **TP-22** | Responsive Design — Mobile | Layout | ~12 Min | Smartphone |
| **TP-23** | Responsive Design — Tablet & Desktop | Layout | ~10 Min | Tablet/Desktop |
| **TP-24** | Browser: Chrome (Desktop + Mobile) | Kompatibilität | ~12 Min | Chrome |
| **TP-25** | Browser: Safari (macOS + iOS) | Kompatibilität | ~12 Min | Safari |
| **TP-26** | Browser: Firefox & Edge | Kompatibilität | ~12 Min | Firefox/Edge |
| **TP-27** | Netzwerk-Szenarien & Fehlerbehandlung | Robustheit | ~15 Min | Smartphone |
| **TP-28** | Barrierefreiheit (Accessibility) | A11y | ~12 Min | Desktop + Screenreader |
| **TP-29** | Datenschutz, Impressum & Rechtliches | Legal | ~10 Min | Desktop |
| **TP-30** | Langzeittest (Stabilität & Speicher) | Stabilität | ~60 Min | Smartphone |

---

## Hinweise für Tester

- **Jedes Protokoll** hat Felder für: Tester-Name, Datum, Gerät, Browser, OS
- **Jede Aufgabe** hat ein Häkchen-Feld (OK / FEHLER / TEILWEISE) und ein Bemerkungsfeld
- **Screenshots** bei Fehlern bitte machen und als Anhang beifügen
- **Bewertungsskala**: 1 (nicht nutzbar) — 5 (einwandfrei)
- **Zeitlimit**: 10-15 Min pro Protokoll (außer TP-30: 60 Min)

## Benötigte Geräte & Voraussetzungen

| Gerät | Für Protokolle |
|-------|---------------|
| Smartphone (Android) | TP-01 bis TP-30 |
| Smartphone (iOS/iPhone) | TP-10, TP-11, TP-18, TP-25, TP-30 |
| Tablet (iPad oder Android) | TP-23 |
| Desktop/Laptop (Chrome) | TP-01 bis TP-05, TP-16 bis TP-29 |
| Desktop (Safari/macOS) | TP-25 |
| Desktop (Firefox) | TP-26 |
| Desktop (Edge) | TP-26 |
| Portabler WiFi-Router (z.B. GL.iNet) | TP-09 |
| 2. Smartphone (für Live-Tests) | TP-06 bis TP-12 |
| 3. Smartphone (für Multi-Listener) | TP-08 |
| Screenreader (VoiceOver/NVDA) | TP-28 |
| Google Cloud API Key | TP-14, TP-16 |
