# Gruendungsstipendium Mecklenburg-Vorpommern — Antrag Fintutto

**Programm:** Gruendungsstipendium MV (ESF+ kofinanziert)
**Antragsteller:** Alexander Deibel
**Beantragte Foerderung:** 1.200 EUR/Monat x 18 Monate = 21.600 EUR (nicht rueckzahlbar)
**Bewilligungsbehoerde:** GSA — Gesellschaft fuer Struktur- und Arbeitsmarktentwicklung mbH, Schwerin
**Kontakt:** 0385 55775-0 | Schulstrasse 1-3, 19055 Schwerin
**Quelle:** https://www.gsa-schwerin.de/foerderung/gruendungsstipendien

> **VERFAHREN:** Das Antragsverfahren ist zweistufig:
>
> 1. **Projektskizze** bei der GSA einreichen
> 2. **Fachjury** bewertet und votiert die Skizze
> 3. Bei positivem Votum: **Foermlicher Antrag** bei der GSA (XML-Formular)
>
> **VORAUSSETZUNGEN:**
> - Natuerliche Person, mind. 18 Jahre alt
> - Unternehmensgruendung nicht laenger als 12 Monate zurueckliegend
> - Hauptwohnsitz + zukuenftiger Betriebssitz in Mecklenburg-Vorpommern
> - Fachliche und kaufmaennische Eignung nachweisen
> - Wesentlich als Kompetenztraeger am Produkt mitgewirkt
> - Innovationscharakter durch Hochschule/Forschungseinrichtung bestaetigen lassen
> - Vollstaendiges Unternehmenskonzept vorlegen
> - Max. 5h/Woche Nebentaetigkeit waehrend Stipendium
> - Kein Insolvenzverfahren, keine eidesstattliche Versicherung

---

## STUFE 1: PROJEKTSKIZZE

### 1.1 Titel des Gruendungsvorhabens

**"Fintutto Translator — Offlinefaehige KI-Echtzeituebersetzungsplattform mit 16 App-Varianten fuer 7 Marktsegmente"**

### 1.2 Zusammenfassung der Gruendungsidee

Alexander Deibel gruendet die **Fintutto UG** in Mecklenburg-Vorpommern zur Entwicklung und Vermarktung des **Fintutto Translator** — einer modularen Plattform fuer Echtzeit-Sprachuebersetzung in 45 Sprachen, die auch **vollstaendig ohne Internetverbindung** funktioniert.

**Das Problem:**
- 7,5 Mio. Nicht-Muttersprachler in Deutschland kaempfen taeglich mit Sprachbarrieren
- Bestehende Loesungen (Google Translate, DeepL) versagen ohne Internet
- Genau dort, wo Uebersetzung am dringendsten gebraucht wird — Behoerden, Krankenhaeuser, Schulen, Fluechtlingsunterkuenfte — gibt es oft kein freies WLAN/Mobilfunknetz
- Kein Wettbewerber bietet eine vollstaendige Offline-Loesung mit Gruppen-Broadcast

**Die Loesung:**
Eine weltweit einzigartige **4-Tier-Transportarchitektur** (Cloud → WiFi-Hotspot → Bluetooth Low Energy → On-Device ML), die automatisch zwischen Netzwerkstufen wechselt. Dazu eine **Multi-Market-Architektur** mit 16 spezialisierten App-Varianten fuer 7 Marktsegmente:

| Marktsegment | Speaker-App | Listener-App | Zielgruppe |
|-------------|------------|-------------|------------|
| General | Fintutto Translator | Fintutto Listener | Allgemein, Tourismus |
| Schools | ClassTranslate | ClassTranslate Listener | Schulen, Elternabende |
| Authorities | AmtsTranslate | AmtsTranslate Listener | Behoerden, Jobcenter |
| NGO | AidTranslate | AidTranslate Listener | Fluechtlingshilfe, Tafeln |
| Hospitality | LobbyTranslate | LobbyTranslate Listener | Hotels, Rezeptionen |
| Medical | MedTranslate | MedTranslate Listener | Krankenhaeuser, Arztpraxen |
| Events | EventTranslate | EventTranslate Listener | Konferenzen, Messen |

### 1.3 Innovationsgehalt

| Innovation | Neuheitsgrad | Bedeutung |
|-----------|-------------|-----------|
| **BLE GATT Translation Protocol** | Weltneuheit | Bluetooth-basierte Gruppen-Uebersetzung ohne Internet/WiFi — kein Wettbewerber weltweit bietet dies |
| **4-Tier Auto-Fallback Transport** | Weltneuheit | Automatische Netzwerk-Degradierung: Cloud → WiFi → BLE → Offline ML |
| **On-Device ML Pipeline** | Neuartig | Opus-MT + Whisper via WebAssembly, komplett im Browser |
| **Multi-Market-Architecture** | Neuartig | Eine Codebasis, 16 Apps fuer 7 Maerkte via dynamischer Konfiguration |
| **1→N Broadcast + Offline** | Weltneuheit | Ein Sprecher uebersetzt simultan fuer N Zuhoerer, auch offline |

**Kein Wettbewerber weltweit bietet alle fuenf Alleinstellungsmerkmale gleichzeitig.**

### 1.4 Aktueller Entwicklungsstand

- **Version 5.2** — funktionsfaehige Plattform, marktreif
- **41.436 Zeilen** TypeScript/React Production Code
- **295 Dateien** in Monorepo-Architektur (pnpm + Turborepo)
- **16 App-Varianten** fuer 7 Marktsegmente
- **87+ automatisierte Tests**, 100% pass rate
- **Build-Zeit:** 12 Sekunden (Vite 6 + Turborepo)
- **Google Play Store Launch** vorbereitet (Capacitor 8)
- **7 Kernprodukte:** Text-Uebersetzer, Live-Session, Gespraechsmodus, Kamera-OCR, Phrasebook, Offline-Engine, BLE-Transport

### 1.5 Technologie-Stack

```
Frontend:     React 18 + TypeScript + Vite 6
Mobile:       Capacitor 8 (Android/iOS)
Echtzeit:     Supabase Realtime (WebSocket)
Offline ML:   Opus-MT + Whisper via WebAssembly (WASM)
BLE:          Web Bluetooth API + GATT Services
Build:        pnpm-workspace + Turborepo (parallele Builds)
Testing:      Vitest + Playwright
```

### 1.6 Marktpotenzial

| Kennzahl | Wert |
|----------|------|
| TAM (weltweiter Sprachdienstleistungsmarkt) | $73,6 Mrd. (2028) |
| SAM (adressierbare Segmente) | ~$6,7 Mrd. |
| SOM (realistisches Ziel Jahr 3) | $2-5 Mio. ARR |
| Nicht-Muttersprachler in Deutschland | 7,5 Mio. |
| Schulen in Deutschland | 40.000+ |
| Krankenhaeuser in Deutschland | 1.900+ |
| Hotels in MV allein | 2.500+ |

### 1.7 Geschaeftsmodell

**B2B SaaS — monatliche Lizenzen nach Marktsegment:**

| Marktsegment | Starter | Professional | Enterprise |
|-------------|---------|-------------|------------|
| General | 9 EUR/Mon | 19 EUR/Mon | 49 EUR/Mon |
| Schools | 29 EUR/Mon | 79 EUR/Mon | 199 EUR/Mon |
| Authorities | 49 EUR/Mon | 149 EUR/Mon | 399 EUR/Mon |
| Medical | 79 EUR/Mon | 149 EUR/Mon | 249 EUR/Mon |
| Hospitality | 49 EUR/Mon | 79 EUR/Mon | 99 EUR/Mon |
| Events | 99 EUR/Tag | 199 EUR/Tag | 499 EUR/Tag |

**Umsatzprognose:**
- M6: 2.100 EUR MRR
- M12: 18.500 EUR MRR
- M18: 55.000 EUR MRR
- M24: 153.622 EUR MRR

---

## STUFE 2: FOERMLICHER ANTRAG — ANGABEN ZUM ANTRAGSTELLER

### 2.1 Persoenliche Angaben

| Feld | Angabe |
|------|--------|
| **Name:** | Alexander Deibel |
| **Wohnsitz:** | Mecklenburg-Vorpommern |
| **Betriebssitz:** | Mecklenburg-Vorpommern |
| **Firma (i.G.):** | Fintutto UG (haftungsbeschraenkt) |
| **Branche:** | Software / KI / Sprachuebersetzung |
| **Gruendungsdatum:** | [einzusetzen — max. 12 Monate vor Antragstellung] |
| **E-Mail:** | alexander.deibel@itour.guide |

### 2.2 Fachliche Eignung

- **Software-Entwickler** mit jahrelanger Erfahrung in Full-Stack-Entwicklung
- **CTO und Mitgruender** der AI Tour Guide UG (seit 2024, Tourismus-Tech in MV)
- **Alleiniger Entwickler** von 41.436 Zeilen Production Code fuer Fintutto Translator
- **Kompetenztraeger:** Saemtliche technische Innovationen (4-Tier-Transport, BLE-Protokoll, ML-Pipeline) eigenstaendig konzipiert und implementiert
- Erfahrung in: React, TypeScript, KI/ML, WebAssembly, Bluetooth Low Energy, Cloud-Architektur, Mobile App-Entwicklung

### 2.3 Kaufmaennische Eignung

- Bestehende Geschaeftsfuehrungs-Erfahrung durch AI Tour Guide UG
- Detaillierter 24-Monate-Cashflow-Plan erstellt (Break-even Monat 21)
- B2B-Vertriebserfahrung im Tourismus-Sektor
- Businessplan mit 7 Marktsegmenten und konkreter Preisstruktur
- Kenntnisse in Foerdermittelakquise, Buchhaltung, Vertragsrecht

### 2.4 Innovationsbestaetigung (erforderlich)

> **AKTION ERFORDERLICH:**
> Fachliche Stellungnahme einer Hochschule oder Forschungseinrichtung zum
> Innovationscharakter einholen. Moegliche Ansprechpartner:
>
> - **Universitaet Rostock** — Fakultaet fuer Informatik und Elektrotechnik
>   (Prof. fuer Kuenstliche Intelligenz oder Sprachverarbeitung)
> - **Hochschule Wismar** — Fakultaet fuer Ingenieurwissenschaften
> - **Fraunhofer IGD Rostock** — Visual Computing / Interactive Systems
>
> Die Stellungnahme sollte bestaetigen:
> 1. Neuartigkeit der 4-Tier-Transportarchitektur
> 2. Innovationsgehalt des BLE GATT Translation Protocol
> 3. Technologische Reife der On-Device ML Pipeline
> 4. Marktrelevanz der Multi-Market-Architektur

---

## 3. UNTERNEHMENSKONZEPT (KURZFASSUNG)

### 3.1 Vision

Fintutto Translator wird die fuehrende Plattform fuer Echtzeituebersetzung in Umgebungen ohne zuverlaessige Internetverbindung — von Schulen ueber Behoerden bis zu Krankenhaeusern.

### 3.2 Wettbewerbsanalyse

| Wettbewerber | Offline | 1→N Broadcast | BLE | Multi-Market | Preis |
|-------------|---------|--------------|-----|-------------|-------|
| Google Translate | Begrenzt | Nein | Nein | Nein | Kostenlos |
| DeepL | Nein | Nein | Nein | Nein | 8-50 EUR/Mon |
| Microsoft Translator | Begrenzt | 10 Sprachen | Nein | Nein | ab 10 USD/Mon |
| Wordly.ai | Nein | Ja | Nein | Nein | ab 99 USD/Event |
| KUDO | Nein | Ja | Nein | Nein | Enterprise-Preis |
| **Fintutto** | **Ja (4 Tiers)** | **Ja (45 Spr.)** | **Ja** | **Ja (16 Apps)** | **9-499 EUR** |

### 3.3 Go-to-Market-Strategie (MV zuerst)

**Phase 1 (M1-6) — Pilotierung in MV:**
- 5 Schulen in Rostock/Schwerin (ClassTranslate)
- 3 Behoerden/Jobcenter (AmtsTranslate)
- 2 Krankenhaeuser (MedTranslate)
- 3 Hotels an der Ostseekueste (LobbyTranslate)

**Phase 2 (M7-12) — Norddeutschland:**
- Expansion nach Hamburg, Schleswig-Holstein, Berlin
- Event-Markt: Konferenzen, Messen

**Phase 3 (M13-18) — DACH + EU:**
- Deutschlandweiter Vertrieb
- Oesterreich, Schweiz
- EU-Piloten (Skandinavien, Benelux)

### 3.4 Finanzierungsstrategie

| Quelle | Betrag | Status |
|--------|--------|--------|
| **Gruenderstipendium MV** | 21.600 EUR | Dieser Antrag |
| **ZIM Einzelprojekt** | 225.000 EUR | Antrag in Vorbereitung |
| **EFRE MV** (alternativ zu ZIM) | 171.870 EUR | Antrag vorbereitet |
| **Forschungszulage** | ~29.400 EUR/Jahr | Beantragung geplant |
| **ACCELERATE:MV** | Sachleistungen | Bewerbung laeuft |
| **Seed-Investment** | 150.000-250.000 EUR | Gespraeche ab M6 |
| **Umsatz B2B** | ab M3 | Pilotprojekte |

**Gesamtfinanzierung Phase 1:** ~500.000-700.000 EUR

### 3.5 Arbeitsplatzeffekt in MV

| Zeitraum | Stelle | Standort |
|----------|--------|----------|
| M3 | Senior Frontend Developer | Remote/MV |
| M6 | Sales Manager Norddeutschland | Rostock |
| M9 | AI/ML Engineer | Remote/MV |
| M12 | UX Designer | Remote/MV |

**Bis zu 4 neue Arbeitsplaetze** in MV innerhalb von 12 Monaten.

---

## 4. BEZUG ZU MECKLENBURG-VORPOMMERN

### 4.1 Warum MV?

- **Wohnsitz und Betriebssitz** des Gruenders in MV
- **AI Tour Guide UG** (bestehendes Unternehmen) bereits in MV registriert
- **Tourismus-Hotspot:** MV hat 2.500+ Hotels, 7 Mio. Touristen/Jahr — idealer Erstmarkt fuer LobbyTranslate
- **Pilotpartner vor Ort:** Schulen, Behoerden, Kliniken in Rostock und Schwerin
- **ACCELERATE:MV** und regionale Netzwerke (Baltic Incubate, IHK Schwerin)
- **Strukturschwaeche:** Digitale Innovationen aus MV staerken den Standort

### 4.2 Regionale Wertschoepfung

- Steuerberatung und Rechtsberatung ueber lokale Dienstleister
- Coworking-Space in Rostock/Schwerin
- Vertriebspartner fuer Tourismus-Segment in MV
- Mitarbeitende bevorzugt aus MV / Norddeutschland

---

## 5. MEILENSTEINE (18-MONATS-PLAN)

| Monat | Meilenstein | Ergebnis |
|-------|-----------|----------|
| M1 | Google Play Store Launch | 16 Apps live, erste Downloads |
| M2 | Erste B2B-Pilotvertraege (Schulen MV) | 3-5 Pilotschulen |
| M3 | BLE-Transport produktionsreif | Offline-Gruppen-Uebersetzung funktional |
| M4 | Medical-Zertifizierung starten | DSGVO-Audit fuer Gesundheitsdaten |
| M6 | 2.100 EUR MRR | Erste wiederkehrende Einnahmen |
| M9 | 30+ zahlende B2B-Kunden | Product-Market-Fit bestaetigt |
| M12 | 18.500 EUR MRR | Expansion Norddeutschland |
| M15 | 40.000 EUR MRR | DACH-Expansion gestartet |
| M18 | 55.000 EUR MRR | Break-even in Sichtweite |

---

## 6. ANLAGEN-CHECKLISTE

- [ ] Projektskizze (dieses Dokument — Stufe 1)
- [ ] Lebenslauf Alexander Deibel (→ siehe `docs/11-lebenslauf-gruender.md`)
- [ ] Unternehmenskonzept / Businessplan (→ basiert auf docs/03 + docs/04)
- [ ] Fachliche Stellungnahme Hochschule/Forschungseinrichtung (→ einzuholen)
- [ ] Nachweis Wohnsitz MV (Meldebescheinigung)
- [ ] Nachweis fachliche Eignung (Zeugnisse, Referenzen, Portfolio)
- [ ] Nachweis kaufmaennische Eignung (AI Tour Guide UG Handelsregisterauszug)
- [ ] Fuehrungszeugnis (falls erforderlich)
- [ ] DSGVO-Konzept (→ siehe `docs/12-dsgvo-konzept.md`)

---

## 7. KOMBINIERBARKEIT MIT ANDEREN FOERDERPROGRAMMEN

| Programm | Kombinierbar? | Hinweis |
|----------|--------------|---------|
| ZIM | **Ja** | Gruenderstipendium = Lebensunterhalt, ZIM = Projektkosten (getrennte Kostenbasis) |
| EFRE MV | **Ja** | Gleiche Logik: Stipendium finanziert Person, EFRE finanziert Projekt |
| Forschungszulage | **Ja** | Steuerlicher Hebel, keine Doppelfoerderung |
| ACCELERATE:MV | **Ja** | Sachleistungen, kein finanzieller Zuschuss |
| Gruendungszuschuss AfA | **Nein** | Entweder Stipendium oder Gruendungszuschuss, nicht beides |

> **WICHTIG:** Das Gruenderstipendium ist **steuerfrei** und zaehlt nicht als
> Einkommen fuer die GmbH/UG. Es ist eine persoenliche Beihilfe zum
> Lebensunterhalt (vgl. `docs/09-verguetungsstruktur-steuerberater.md`).

---

**Unterschrift:**

_______________________________
Alexander Deibel
Ort, Datum: [einzusetzen]

*Stand: 16.03.2026 | Fintutto Translator v5.2 | Vertraulich*
