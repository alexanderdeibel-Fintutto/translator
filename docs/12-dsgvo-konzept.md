# DSGVO-Konzept — Fintutto Translator

**Stand:** 16.03.2026 | **Version:** 1.0 | **Vertraulich**
**Verantwortlicher:** Alexander Deibel, Fintutto UG (i.G.)
**Datenschutzbeauftragter:** Nicht erforderlich (< 20 Mitarbeitende, Art. 37 DSGVO / § 38 BDSG)
**Kontakt:** datenschutz@guidetranslator.com
**Zweck:** Anlage zu Foerderantraegen (ZIM, EFRE, Gruenderstipendium) + interne Compliance-Dokumentation

> **DIESES DOKUMENT** beschreibt das Datenschutzkonzept fuer die Fintutto
> Translator-Plattform (16 App-Varianten, 7 Marktsegmente). Es dient als
> Nachweis der DSGVO-Konformitaet gegenueber Foerdergebern, Pilotpartnern
> (Behoerden, Schulen, Krankenhaeuser) und Endkunden.

---

## 1. UEBERBLICK: DATENSCHUTZ ALS KERNARCHITEKTUR

Fintutto Translator wurde von Grund auf mit **Privacy-by-Design** und **Privacy-by-Default** (Art. 25 DSGVO) entwickelt. Die zentrale Architekturentscheidung — eine 4-Tier-Transportarchitektur mit Offline-First-Ansatz — minimiert die Datenverarbeitung auf ein Minimum:

```
Tier 1: Cloud (Supabase)     → Verschluesselte Uebertragung, keine persistente Speicherung
Tier 2: WiFi-Hotspot          → Lokales Netzwerk, Daten verlassen nicht den Raum
Tier 3: BLE (Bluetooth)       → Punkt-zu-Punkt, max. 10m Reichweite
Tier 4: Offline ML (On-Device) → KEINE Daten verlassen das Geraet
```

**Kernprinzip:** Je niedriger der Tier, desto weniger Daten verlassen das Geraet. Im Offline-Modus (Tier 3+4) werden **keinerlei personenbezogene Daten** an externe Server uebermittelt.

---

## 2. VERARBEITUNGSVERZEICHNIS (ART. 30 DSGVO)

### 2.1 Uebersetzungseingaben (Text)

| Feld | Beschreibung |
|------|-------------|
| **Datenkategorie:** | Freitexteingaben zur Uebersetzung |
| **Betroffene:** | Nutzer der App (Sprecher + Zuhoerer) |
| **Zweck:** | Maschinelle Uebersetzung in Zielsprache |
| **Rechtsgrundlage:** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfuellung) |
| **Empfaenger:** | Tier 1: Google Cloud Translation API (Auftragsverarbeitung); Tier 2-4: Keine externen Empfaenger |
| **Speicherdauer:** | Nicht persistent — Texte werden nur fuer die Dauer der Sitzung verarbeitet. Lokaler Cache (IndexedDB) kann vom Nutzer jederzeit geloescht werden |
| **Drittlandtransfer:** | Tier 1: USA (Google Cloud) — Standardvertragsklauseln; Tier 2-4: Keiner |
| **TOM:** | TLS 1.3 (Tier 1), WPA2/3 (Tier 2), BLE-Verschluesselung (Tier 3), lokale Verarbeitung (Tier 4) |

### 2.2 Spracheingabe (STT — Speech-to-Text)

| Feld | Beschreibung |
|------|-------------|
| **Datenkategorie:** | Audiodaten (Sprachaufnahmen) |
| **Betroffene:** | Sprecher in Uebersetzungssitzungen |
| **Zweck:** | Umwandlung gesprochener Sprache in Text |
| **Rechtsgrundlage:** | Art. 6 Abs. 1 lit. a DSGVO (Einwilligung — Mikrofon-Berechtigung) |
| **Empfaenger:** | Web Speech API: Browser-Hersteller (Google/Apple); Whisper WASM: Keine (lokal) |
| **Speicherdauer:** | Audiodaten werden NICHT gespeichert — sofortige Verarbeitung und Verwerfung |
| **Drittlandtransfer:** | Web Speech API: moeglich (abhaengig vom Browser); Whisper: Keiner |
| **TOM:** | Lokale Verarbeitung bevorzugt (Whisper WASM), Nutzer kann Web Speech API deaktivieren |

### 2.3 Sprachausgabe (TTS — Text-to-Speech)

| Feld | Beschreibung |
|------|-------------|
| **Datenkategorie:** | Uebersetzter Text zur Sprachausgabe |
| **Betroffene:** | Zuhoerer in Uebersetzungssitzungen |
| **Zweck:** | Vorsprechen der Uebersetzung |
| **Rechtsgrundlage:** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfuellung) |
| **Empfaenger:** | Tier 1: Google Cloud TTS (Auftragsverarbeitung); Offline: Browser-eigene Synthese |
| **Speicherdauer:** | Audio-Clips werden lokal gecacht (IndexedDB), loeschbar durch Nutzer |
| **Drittlandtransfer:** | Tier 1: USA (Google Cloud) — Standardvertragsklauseln; Offline: Keiner |

### 2.4 Live-Uebersetzungssitzungen

| Feld | Beschreibung |
|------|-------------|
| **Datenkategorie:** | Session-IDs, uebersetzter Text, Spracheinstellungen |
| **Betroffene:** | Teilnehmer einer Live-Session (Sprecher + Zuhoerer) |
| **Zweck:** | Echtzeit-Verteilung von Uebersetzungen an Sitzungsteilnehmer |
| **Rechtsgrundlage:** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfuellung) |
| **Empfaenger:** | Supabase (Auftragsverarbeitung, EU-Region Frankfurt) |
| **Speicherdauer:** | Nur waehrend der Sitzung — nach Ende werden alle Daten verworfen |
| **Drittlandtransfer:** | Keiner (Supabase EU-Region: Frankfurt am Main) |
| **TOM:** | WebSocket ueber TLS 1.3, Row-Level-Security, Session-basierte Zugriffskontrolle |

### 2.5 Kontaktformular

| Feld | Beschreibung |
|------|-------------|
| **Datenkategorie:** | Name, E-Mail, Nachrichtentext |
| **Betroffene:** | Website-Besucher, die das Kontaktformular nutzen |
| **Zweck:** | Beantwortung von Anfragen |
| **Rechtsgrundlage:** | Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) |
| **Speicherdauer:** | 6 Monate nach Abschluss der Anfrage |

### 2.6 Lokale Datenspeicherung (Offline-Modus)

| Feld | Beschreibung |
|------|-------------|
| **Datenkategorie:** | Heruntergeladene Sprachmodelle, Uebersetzungscache, TTS-Audio-Clips |
| **Betroffene:** | App-Nutzer |
| **Zweck:** | Offline-Funktionalitaet |
| **Rechtsgrundlage:** | Art. 6 Abs. 1 lit. b DSGVO (Vertragserfuellung) |
| **Speicherort:** | Ausschliesslich lokal im Browser des Nutzers (IndexedDB, localStorage) |
| **Empfaenger:** | Keine — Daten verlassen NICHT das Geraet |
| **Loeschung:** | Jederzeit durch Nutzer (App-Einstellungen oder Browser-Daten loeschen) |

---

## 3. TECHNISCHE UND ORGANISATORISCHE MASSNAHMEN (ART. 32 DSGVO)

### 3.1 Verschluesselung

| Ebene | Massnahme |
|-------|----------|
| **Transport (in transit)** | TLS 1.3 fuer alle Cloud-Verbindungen (Supabase, Google APIs) |
| **Lokales Netz (Tier 2)** | WPA2/WPA3 fuer WiFi-Hotspot-Kommunikation |
| **Bluetooth (Tier 3)** | BLE GATT Verschluesselung (AES-CCM), 10m Reichweite begrenzt physischen Zugriff |
| **Speicherung (at rest)** | IndexedDB-Daten sind browserseitig geschuetzt; keine serverseitige persistente Speicherung |
| **Datenbank** | Supabase: AES-256 at rest (AWS Frankfurt) |

### 3.2 Zugriffskontrolle

| Massnahme | Beschreibung |
|----------|-------------|
| **Supabase Row-Level-Security (RLS)** | Datenbankzugriff nur fuer authentifizierte Sessions auf eigene Daten |
| **Session-basierte Isolation** | Jede Live-Session hat eindeutige ID; Zugriff nur mit Session-Code |
| **API-Key-Management** | Supabase anon-key im Client; service-role-key nur serverseitig (Edge Functions) |
| **Kein Admin-Login ohne Auth** | Admin-Dashboard erfordert Supabase Auth (E-Mail + Passwort) |

### 3.3 Datensparsamkeit (Minimierung)

| Prinzip | Umsetzung |
|---------|----------|
| **Keine Nutzerkonten erforderlich** | App funktioniert ohne Registrierung/Login |
| **Keine Audiodaten gespeichert** | STT verarbeitet Audio in Echtzeit und verwirft es sofort |
| **Keine Uebersetzungshistorie serverseitig** | Gesamter Verlauf nur lokal im Browser |
| **Keine Tracking-Cookies** | Weder eigene noch Drittanbieter-Cookies |
| **Keine Analytics** | Kein Google Analytics, kein Facebook Pixel, keine Tracker |
| **Keine Werbung** | Keine Werbe-SDKs oder Ad-Tracking |
| **Offline-First** | Standard-Modus bevorzugt lokale Verarbeitung |

### 3.4 Verfuegbarkeit und Belastbarkeit

| Massnahme | Beschreibung |
|----------|-------------|
| **4-Tier-Fallback** | Bei Ausfall eines Tiers automatischer Wechsel zum naechsten (Cloud → WiFi → BLE → Offline) |
| **Progressive Web App** | Funktioniert offline dank Service Worker |
| **Supabase Cloud** | AWS Frankfurt, Multi-AZ, automatische Backups |
| **Keine Single-Point-of-Failure** | App funktioniert auch bei komplettem Cloud-Ausfall |

---

## 4. AUFTRAGSVERARBEITUNG (ART. 28 DSGVO)

### 4.1 Auftragsverarbeiter

| Dienstleister | Zweck | Standort | AVV-Status |
|--------------|-------|----------|------------|
| **Supabase Inc.** | Datenbank, Auth, Realtime | EU (Frankfurt) | AVV via DPA (https://supabase.com/dpa) |
| **Google Cloud** | Translation API, TTS | USA/EU | AVV via Google Cloud DPA + SCCs |
| **Cloudflare** | CDN, DNS, DDoS-Schutz | Global/EU | AVV via Cloudflare DPA |

### 4.2 Drittlandtransfer

| Dienst | Land | Garantie |
|--------|------|---------|
| Google Cloud Translation API | USA | EU-US Data Privacy Framework + SCCs |
| Google Cloud TTS | USA | EU-US Data Privacy Framework + SCCs |
| Supabase | **EU (Frankfurt)** | Kein Drittlandtransfer |
| Cloudflare | EU-Routing | EU-Processing per Konfiguration |

> **HINWEIS:** Bei Nutzung von Tier 2 (WiFi), Tier 3 (BLE) oder Tier 4 (Offline)
> findet **kein Drittlandtransfer** statt. Daten verbleiben lokal.

---

## 5. BETROFFENENRECHTE (ART. 12-22 DSGVO)

| Recht | Umsetzung |
|-------|----------|
| **Auskunft (Art. 15)** | Anfrage an datenschutz@guidetranslator.com; da keine persistenten Nutzerdaten gespeichert werden, ist der Umfang minimal |
| **Berichtigung (Art. 16)** | Kontaktdaten koennen per E-Mail korrigiert werden |
| **Loeschung (Art. 17)** | Lokale Daten: Browser-Daten loeschen; Kontaktdaten: per E-Mail beantragen; Live-Sessions: automatische Loeschung nach Sitzungsende |
| **Einschraenkung (Art. 18)** | Per E-Mail beantragbar |
| **Datenuebertragbarkeit (Art. 20)** | Lokale Daten sind bereits im Besitz des Nutzers (Browser); Export auf Anfrage |
| **Widerspruch (Art. 21)** | Per E-Mail an datenschutz@guidetranslator.com |
| **Widerruf Einwilligung (Art. 7 Abs. 3)** | Mikrofon-Berechtigung kann jederzeit im Browser/Geraet entzogen werden |
| **Beschwerde (Art. 77)** | Landesbeauftragter fuer Datenschutz MV, Schloss Schwerin, 19053 Schwerin |

---

## 6. BESONDERE KATEGORIEN: MEDICAL-SEGMENT (ART. 9 DSGVO)

### 6.1 Gesundheitsdaten — Besonderer Schutzbedarf

Das Marktsegment **Medical** (MedTranslate / MedTranslate Listener) wird in Krankenhaeusern und Arztpraxen eingesetzt. Hierbei koennen Uebersetzungsinhalte **Gesundheitsdaten** enthalten (besondere Kategorien personenbezogener Daten, Art. 9 DSGVO).

### 6.2 Zusaetzliche Schutzmassnahmen Medical

| Massnahme | Beschreibung |
|----------|-------------|
| **Offline-First verpflichtend** | MedTranslate ist standardmaessig auf Tier 3/4 (BLE/Offline) konfiguriert — Gesundheitsdaten verlassen nicht das Geraet |
| **Kein Cloud-Upload von Gesundheitsdaten** | Tier 1 (Cloud) ist fuer medizinische Gespraeche deaktivierbar |
| **Keine persistente Speicherung** | Uebersetzungen werden nicht gespeichert, auch nicht lokal |
| **Zugriffsbeschraenkung** | Nur autorisiertes Klinikpersonal erhaelt MedTranslate-Lizenz |
| **Einwilligung (Art. 9 Abs. 2 lit. a)** | Patient muss vor Nutzung ausdruecklich einwilligen (In-App-Dialog) |
| **DSFA geplant (Art. 35)** | Datenschutz-Folgenabschaetzung fuer Medical-Segment (→ Meilenstein M4) |

### 6.3 Rechtsgrundlage Medical

- **Art. 9 Abs. 2 lit. a DSGVO:** Ausdrueckliche Einwilligung des Patienten
- **Art. 9 Abs. 2 lit. h DSGVO:** Gesundheitsversorgung (bei Integration in Klinik-Workflow)
- **§ 22 Abs. 1 Nr. 1 lit. b BDSG:** Verarbeitung zu Zwecken der Gesundheitsvorsorge

---

## 7. BESONDERE KATEGORIEN: SCHOOLS-SEGMENT (MINDERJAEHRIGE)

### 7.1 Schutz von Kindern

Das Segment **Schools** (ClassTranslate) wird an Schulen mit minderjaehrigen Schuelern eingesetzt.

| Massnahme | Beschreibung |
|----------|-------------|
| **Keine Registrierung** | Schueler benoetigen kein Konto, keinen Login |
| **Keine persistente Datenspeicherung** | Uebersetzungen werden nach Sitzungsende verworfen |
| **Einwilligung Erziehungsberechtigte** | Bei unter 16-Jaehrigen: Einwilligung der Erziehungsberechtigten erforderlich (Art. 8 DSGVO). Schule holt diese ein. |
| **Offline bevorzugt** | Schulen koennen Tier 2/3/4 nutzen — keine Daten verlassen das Schulnetzwerk |
| **Kein Profiling** | Keine Nutzerprofile, kein Tracking, keine Lernstandsanalyse |

---

## 8. BESONDERE KATEGORIEN: AUTHORITIES-SEGMENT (BEHOERDEN)

### 8.1 Behoerdliche Anforderungen

Das Segment **Authorities** (AmtsTranslate) wird in Behoerden mit gesperrten Netzwerken eingesetzt.

| Massnahme | Beschreibung |
|----------|-------------|
| **Offline-Modus** | Behoerden nutzen primaer Tier 3/4 — Daten verlassen nicht das Behoerdennetzwerk |
| **Kein Internet erforderlich** | Funktioniert in Netzwerken ohne Internetzugang |
| **BSI-Grundschutz-kompatibel** | Keine externen Verbindungen im Offline-Modus |
| **Keine Cloud-Abhaengigkeit** | Volle Funktionalitaet ohne Supabase/Google |

---

## 9. DATENSCHUTZ-FOLGENABSCHAETZUNG (DSFA, ART. 35 DSGVO)

### 9.1 Erforderlichkeit

Eine DSFA ist erforderlich fuer:
- **Medical-Segment:** Verarbeitung von Gesundheitsdaten (Art. 9)
- **Schools-Segment:** Systematische Verarbeitung von Daten Minderjaehriger

### 9.2 Geplanter Zeitrahmen

| Segment | DSFA-Status | Geplant |
|---------|------------|---------|
| Medical | Ausstehend | M4 (ca. Juli 2026) |
| Schools | Ausstehend | M5 (ca. August 2026) |
| General/Events/Hospitality | Nicht erforderlich | — |
| Authorities | Pruefung ausstehend | M6 |

### 9.3 DSFA-Inhalte (Vorab)

Fuer Medical und Schools wird die DSFA mindestens umfassen:
1. Systematische Beschreibung der Verarbeitungsvorgaenge
2. Bewertung der Notwendigkeit und Verhaeltnismaessigkeit
3. Bewertung der Risiken fuer die Rechte und Freiheiten der Betroffenen
4. Geplante Abhilfemassnahmen und Sicherheitsvorkehrungen
5. Stellungnahme des Datenschutzbeauftragten (falls bestellt) oder externer Berater

---

## 10. COOKIES UND TRACKING

| Kategorie | Einsatz | Details |
|-----------|---------|---------|
| **Tracking-Cookies** | **NEIN** | Keine Tracking-Cookies jeglicher Art |
| **Analytics** | **NEIN** | Kein Google Analytics, Matomo, Plausible oder Aehnliches |
| **Werbe-Tracker** | **NEIN** | Kein Facebook Pixel, Google Ads, etc. |
| **Social Media** | **NEIN** | Keine Social-Media-Einbindungen |
| **localStorage** | **JA** | Nur fuer App-Funktionalitaet (Spracheinstellungen, Cache) |
| **IndexedDB** | **JA** | Nur fuer Offline-Funktionalitaet (Sprachmodelle, TTS-Cache) |
| **Service Worker** | **JA** | Nur fuer PWA-Offline-Funktionalitaet |

> **Ergebnis:** Kein Cookie-Banner erforderlich, da keine einwilligungspflichtigen
> Cookies oder Tracker eingesetzt werden.

---

## 11. MASSNAHMENPLAN UND MEILENSTEINE

| Zeitraum | Massnahme | Status |
|----------|----------|--------|
| M1 | Datenschutzerklaerung live (→ /datenschutz in App) | **Erledigt** |
| M1 | Impressum live (→ /impressum in App) | **Erledigt** |
| M1 | DSGVO-Konzept erstellt (dieses Dokument) | **Erledigt** |
| M2 | AVV mit Supabase pruefen/unterzeichnen | Offen |
| M2 | AVV mit Google Cloud pruefen/unterzeichnen | Offen |
| M3 | Einwilligungs-Dialog fuer Medical-Segment implementieren | Offen |
| M4 | DSFA Medical durchfuehren | Offen |
| M5 | DSFA Schools durchfuehren | Offen |
| M6 | Externer DSGVO-Audit durch Berater | Offen |
| M9 | Zertifizierung / Pruefsiegel pruefen | Offen |

---

## 12. VERANTWORTLICHKEITEN

| Rolle | Person | Aufgabe |
|-------|--------|---------|
| **Verantwortlicher (Art. 4 Nr. 7)** | Alexander Deibel | Gesamtverantwortung DSGVO-Compliance |
| **Technische Umsetzung** | Alexander Deibel (CTO) | Privacy-by-Design, Verschluesselung, Zugriffskontrolle |
| **Datenschutzbeauftragter** | Nicht erforderlich | < 20 Mitarbeitende; bei Wachstum: externen DSB bestellen |
| **Externer Berater** | [zu benennen] | DSFA-Durchfuehrung, jaehrliches Audit |

---

## 13. ZUSAMMENFASSUNG: DSGVO-KONFORMITAET

| Anforderung | Status | Nachweis |
|------------|--------|---------|
| Privacy-by-Design (Art. 25) | **Erfuellt** | 4-Tier-Architektur mit Offline-First |
| Privacy-by-Default (Art. 25) | **Erfuellt** | Keine Registrierung, kein Tracking, minimale Datenerhebung |
| Verarbeitungsverzeichnis (Art. 30) | **Erfuellt** | Abschnitt 2 dieses Dokuments |
| Technische Massnahmen (Art. 32) | **Erfuellt** | Abschnitt 3 dieses Dokuments |
| Auftragsverarbeitung (Art. 28) | **Teilweise** | AVVs mit Supabase/Google noch formal zu unterzeichnen |
| Betroffenenrechte (Art. 12-22) | **Erfuellt** | Abschnitt 5 + Datenschutzerklaerung in App |
| DSFA (Art. 35) | **Geplant** | M4/M5 fuer Medical/Schools |
| Datenschutzerklaerung | **Erfuellt** | /datenschutz in der App (DatenschutzPage.tsx) |

> **FAZIT:** Die Fintutto Translator-Plattform ist architekturbedingt
> ueberdurchschnittlich datenschutzfreundlich. Durch den Offline-First-Ansatz
> und die 4-Tier-Architektur werden in den meisten Nutzungsszenarien
> **keinerlei personenbezogene Daten** an externe Server uebermittelt.
> Die verbleibenden offenen Punkte (AVV-Formalisierung, DSFA Medical/Schools)
> sind im Massnahmenplan terminiert.

---

**Unterschrift Verantwortlicher:**

_______________________________
Alexander Deibel, Geschaeftsfuehrer Fintutto UG (i.G.)
Ort, Datum: [einzusetzen]

*Stand: 16.03.2026 | Fintutto Translator v5.2 | Vertraulich*
