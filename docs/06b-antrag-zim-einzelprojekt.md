# ZIM Einzelprojekt — Foerderantrag Fintutto Translator

**Programm:** Zentrales Innovationsprogramm Mittelstand (ZIM), Einzelprojekt
**Antragsteller:** Fintutto UG (i.G.) / Alexander Deibel
**Beantragter Zuschuss:** 225.000 EUR (bei 45% Foerderquote = 500.000 EUR Gesamtkosten)
**Bewilligungsbehoerde:** VDI/VDE Innovation + Technik GmbH (Projekttraeger des BMWK)
**Antragstellung:** https://www.zim.de / foerderportal.bund.de
**Max. Foerderung:** Bis 690.000 EUR pro Einzelprojekt

> **WARUM ZIM STATT EFRE?**
>
> 1. **Vorrang:** Die EFRE-Richtlinie MV schreibt vor, dass ZIM vorrangig
>    genutzt werden soll. TBI wird bei EFRE-Antragstellung pruefen, ob ZIM
>    in Frage kommt.
> 2. **Hoehere Foerderung:** ZIM bis 690.000 EUR vs. EFRE ca. 172.000 EUR
> 3. **Kein Stundensatz-Deckel:** ZIM hat keine Begrenzung auf 143h/Monat
>    wie EFRE/TBI. Das hoehere GF+CTO-Gehalt (7.000 EUR) ist leichter
>    darstellbar.
> 4. **Bundesweit:** Kein MV-Sitz erforderlich (aber hilfreich fuer
>    Strukturschwaeche-Bonus → hoehere Quote)
> 5. **Kein Eigenanteil-Problem:** 45% Zuschuss + 55% Eigenanteil ist
>    bei gleichzeitiger Seed-Finanzierung gut darstellbar
>
> **ACHTUNG:** EFRE und ZIM schliessen sich gegenseitig aus fuer die
> gleichen Kostenpositionen. Entscheidung: Entweder EFRE oder ZIM,
> nicht beides fuer dasselbe Vorhaben.

---

## 1. VORHABENSBESCHREIBUNG

### 1.1 Titel des Vorhabens

**"Entwicklung einer offlinefaehigen KI-Echtzeituebersetzungsplattform mit 4-Tier-Transportarchitektur und marktspezifischer Multi-App-Architektur fuer 7 europaeische Zielsegmente"**

### 1.2 Kurzfassung

Das Vorhaben zielt auf die Weiterentwicklung und Marktreife des **Fintutto Translator** — einer modularen Plattform mit **16 spezialisierten App-Varianten fuer 7 Marktsegmente** (General, Schools, Authorities, NGO, Hospitality, Medical, Events). Die Plattform ermoeglicht Echtzeit-Sprachuebersetzung in 45 Sprachen, auch **vollstaendig ohne Internetverbindung**, mittels einer weltweit einzigartigen 4-Tier-Transportarchitektur (Cloud → WiFi-Hotspot → Bluetooth Low Energy → On-Device Machine Learning).

Die zentrale Innovation ist die Kombination aus:
1. **4-Tier-Transport mit automatischem Fallback** — kein Wettbewerber bietet dies
2. **BLE GATT Translation Protocol** — proprietaeres Bluetooth-Protokoll fuer Gruppen-Uebersetzung (patentfaehig)
3. **On-Device ML Pipeline** — Opus-MT und Whisper via WebAssembly, komplett offline
4. **Multi-Market-Architecture** — eine Codebasis, 16 spezialisierte App-Varianten fuer 7 Maerkte

Das Produkt adressiert eine erhebliche Marktluecke: Bestehende Uebersetzungsloesungen (Google Translate, DeepL, Microsoft) versagen an genau den Orten, wo Uebersetzung am meisten gebraucht wird — touristische Sehenswuerdigkeiten ohne Mobilfunknetz, Behoerden mit gesperrten Netzwerken, Krankenhaeuser, Fluechtlingsunterkuenfte.

### 1.3 Ausgangssituation und Stand der Technik

**Eigener Stand:**
- Funktionsfaehige Plattform in Version 5.2
- **41.436 Zeilen** Production Code (React/TypeScript), **295 Dateien**
- **16 App-Varianten** fuer 7 Marktsegmente in Monorepo-Architektur
- 87+ automatisierte Tests, 100% pass rate
- Build-Zeit: 12 Sekunden (Vite 6 + Turborepo)
- Google Play Store Launch vorbereitet
- Gruender: Alexander Deibel, Sitz in Mecklenburg-Vorpommern
- Bestehende Branchenexpertise durch AI Tour Guide UG (Mitgruender, seit 2024)

**Stand der Technik bei Wettbewerbern:**

| Wettbewerber | Offline | 1→N Broadcast | BLE | PWA | Multi-Market |
|-------------|---------|--------------|-----|-----|-------------|
| Google Translate | Begrenzt | Nein | Nein | Nein | Nein |
| DeepL | Nein | Nein | Nein | Nein | Nein |
| Microsoft Translator | Begrenzt | 10 Sprachen | Nein | Nein | Nein |
| Wordly.ai | Nein | Ja | Nein | Nein | Nein |
| KUDO | Nein | Ja | Nein | Nein | Nein |
| **Fintutto Translator** | **Ja (4 Tiers)** | **Ja (45 Spr.)** | **Ja** | **Ja** | **Ja (16 Apps)** |

**Kein Wettbewerber bietet alle fuenf Alleinstellungsmerkmale gleichzeitig.**

### 1.4 Innovationsgehalt

| Innovation | Neuheitsgrad | Stand der Technik | Nachahmungsaufwand |
|-----------|-------------|-------------------|--------------------|
| BLE GATT Translation Protocol | **Weltneuheit** | Kein Wettbewerber bietet Bluetooth-basierte Gruppen-Uebersetzung | 6-12 Monate |
| 4-Tier Auto-Fallback Transport | **Weltneuheit** | Automatische Netzwerk-Degradierung existiert nicht im Uebersetzungsmarkt | 3-4 Monate |
| Embedded Relay Server | **Neuartig** | WebSocket-Server als native App-Komponente fuer lokale Netze | 3-6 Monate |
| Hybrid ML Pipeline | **Neuartig** | Nahtloser Wechsel Cloud ↔ On-Device WASM-Modelle | 2-3 Monate |
| 1→N Broadcast + Offline | **Weltneuheit** | Kein Produkt kombiniert Broadcasting mit vollstaendigem Offline-Modus | 4-6 Monate |
| Multi-Market Architecture | **Neuartig** | 16 marktspezifische Apps aus einer Codebasis mit geteiltem Kern | 3-6 Monate |
| **Gesamt-Nachahmungsaufwand** | | | **12-24 Monate** |

### 1.5 FuE-Risiken

| Risiko | Eintrittswahrsch. | Auswirkung | Gegenmassnahme |
|--------|-------------------|-----------|---------------|
| BLE-Reichweite unter realen Bedingungen unzureichend | Mittel | Mittel | Prototyp funktionsfaehig, iterative Optimierung, Hotspot als Fallback |
| On-Device ML-Qualitaet fuer Migrationssprachen unzureichend | Mittel | Hoch | Finetuning auf EuroHPC, Cascading-Fallback auf Cloud-Provider |
| WASM-Performance auf aelteren Geraeten zu langsam | Niedrig | Mittel | Modell-Quantisierung, Knowledge Distillation, progressive Model Loading |
| Skalierung auf 500+ gleichzeitige Listener | Niedrig | Mittel | Supabase Cluster, CDN-basierter Broadcast, lastabhaengiges Routing |
| iOS-BLE-Einschraenkungen (Background-Mode) | Mittel | Mittel | CoreBluetooth-Optimierung, Foreground-Service-Fallback |

---

## 2. ARBEITSPLAN

### 2.1 Arbeitspakete

**AP 1: KI-Modelloptimierung fuer 7 Marktsegmente (Monat 1-8)**
- Finetuning der Opus-MT Offline-Modelle fuer marktsegment-spezifische Fachsprache:
  - **Medical:** Medizinische Terminologie, Anamnese, Medikamentennamen, ICD-Codes
  - **Legal/Authority:** Behoerensprache, Aufenthaltsrecht, Asylverfahren
  - **Tourism:** Gastronomie, Sehenswuerdigkeiten, Hotellerie
  - **Education:** Unterrichtssprache, paedagogische Begriffe
- Integration zusaetzlicher Migrationssprachen (Ziel: 15 statt 10)
- Optimierung der Whisper-STT-Modelle fuer Akzenterkennung
- Modell-Quantisierung fuer <100 MB pro Sprachpaar
- **Ergebnis:** 60+ Offline-Sprachpaare mit >85% BLEU-Score, marktspezifische Fachsprache

**AP 2: BLE-Transport-Protokoll Erweiterung (Monat 2-10)**
- Erweiterung des BLE GATT Protocols auf 10+ gleichzeitige Verbindungen
- iOS-Optimierung (CoreBluetooth Framework, Background-Mode)
- Android 14/15 Bluetooth-Permission-Handling
- Reichweiten- und Zuverlaessigkeitstests unter realen Bedingungen
- Patentfaehige Protokoll-Dokumentation
- **Ergebnis:** Produktionsreifes BLE-Protokoll fuer Android + iOS, Patentanmeldung

**AP 3: Multi-Market Enterprise-Plattform (Monat 3-12)**
- White-Label-Modul fuer alle 7 Marktsegmente
- Admin-Dashboard Erweiterung (Multi-Guide-Management, Analytics pro Markt)
- API-Schnittstelle fuer Drittanbieter-Integration (REST + WebSocket)
- SSO/SAML-Integration fuer Enterprise-Kunden (Krankenhaeuser, Hotelketten)
- Marktspezifische Phrasebooks (Medical, Authority, Hospitality)
- **Ergebnis:** Enterprise-ready Plattform mit API fuer alle 7 Maerkte

**AP 4: Medical-Spezialisierung (Monat 4-10)**
- Medizinisches Phrasebook (Anamnese, Schmerzskala, Symptome, Medikamente, Allergien, OP-Aufklaerung)
- Datenschutz-Modus (keine Speicherung von Patientengespraechen)
- Notfall-Modus (schnellster Zugang zu kritischen Phrasen)
- DSGVO-Compliance speziell fuer Gesundheitsdaten (Art. 9 DSGVO)
- Pilotprojekte mit Kliniken und Arztpraxen
- **Ergebnis:** Zertifizierungsfaehige Medical-App, 10+ Pilotprojekte

**AP 5: Pilotprojekte & Marktvalidierung (Monat 6-14)**
- 15 Pilotprojekte Tourismus (MV + DACH)
- 10 Pilotprojekte Behoerden (Auslaenderbehoerden)
- 10 Pilotprojekte Medical (Kliniken, Arztpraxen)
- 10 Pilotprojekte Hospitality (Hotels, Messen)
- 5 Pilotprojekte Bildung (Willkommensklassen)
- Nutzerfeedback-Zyklen und iterative Verbesserung
- **Ergebnis:** Validierter Product-Market Fit in 5 Maerkten, 100+ B2B-Kunden

**AP 6: IP-Schutz & Zertifizierung (Monat 3-10)**
- Patentrecherche und -anmeldung fuer BLE GATT Translation Protocol
- EU-Markenanmeldung "Fintutto Translator" + marktspezifische Marken
- DSGVO-Compliance-Audit (insbesondere Medical/Health Data)
- Barrierefreiheits-Pruefung (WCAG 2.1 AA)
- **Ergebnis:** IP geschuetzt, Marken eingetragen, DSGVO-Audit bestanden

### 2.2 Zeitplan (Gantt)

```
                    M1  M2  M3  M4  M5  M6  M7  M8  M9  M10 M11 M12 M13 M14
AP 1: KI-Modelle    ████████████████████████████████
AP 2: BLE-Protokoll     ██████████████████████████████████████
AP 3: Multi-Market          ████████████████████████████████████████████
AP 4: Medical                   ████████████████████████████
AP 5: Pilotprojekte                         ████████████████████████████████████
AP 6: IP-Schutz              ██████████████████████████████████
```

---

## 3. KOSTENPLAN (Zuwendungsfaehige Kosten)

### 3.1 Uebersicht

| Kostenart | Betrag | Foerderquote | Zuschuss |
|-----------|--------|-------------|---------|
| **Personalkosten (FuE)** | 280.000 EUR | 45%* | 126.000 EUR |
| **Fremdleistungen (FuE-Dienstleister)** | 80.000 EUR | 45%* | 36.000 EUR |
| **Sachkosten (Cloud, HPC, Hardware)** | 90.000 EUR | 45%* | 40.500 EUR |
| **Gemeinkosten (Pauschale)** | 50.000 EUR | 45%* | 22.500 EUR |
| **TOTAL** | **500.000 EUR** | **45%*** | **225.000 EUR** |

> *Foerderquote fuer kleine Unternehmen (KMU <50 MA) bei Einzelprojekten: **45%**.
> Bei Kooperationsprojekten (mit Forschungseinrichtung): **55%**.
> Standort in strukturschwacher Region (MV): Ggf. Aufschlag moeglich.
>
> **Vorteil gegenueber EFRE:**
> - ZIM hat keinen Stundensatz-Deckel wie TBI/EFRE
> - Hoehere Gesamtfoerderung moeglich (bis 690.000 EUR)
> - Kein 143h/Monat-Limit bei Personalkosten
> - GF+CTO-Gehalt von 7.000 EUR/Mon ist bei ZIM unproblematisch

### 3.2 Personalkosten (Detail)

| Position | Monate | Brutto/Monat | AG-Kosten (23%) | FuE-Anteil | Foerderfaehig/Mon | Gesamt |
|----------|--------|-------------|-----------------|------------|-------------------|--------|
| **GF + CTO** (Alexander Deibel) | 14 | 7.000 | 1.610 | 70% | 6.027 | 84.378 EUR |
| Senior Developer (ab M3) | 12 | 7.500 | 1.725 | 90% | 8.303 | 99.630 EUR |
| AI/ML Engineer (ab M6) | 9 | 7.000 | 1.610 | 100% | 8.610 | 77.490 EUR |
| UX/UI Designer (ab M9, Teilzeit) | 6 | 3.500 | 805 | 80% | 3.444 | 20.664 EUR |
| **SUMME Personal (foerderfaehig)** | | | | | | **~282.000 EUR** |

> **Hinweis:** Der Gruender/GF uebernimmt gleichzeitig die CTO-Rolle.
> FuE-Anteil (70%) wird durch detaillierten Stundennachweis belegt.
> Das Gehalt von 7.000 EUR/Mon ist marktkonform fuer eine kombinierte
> GF+CTO-Rolle (Quelle: Stepstone/Glassdoor 2025/2026).

### 3.3 Fremdleistungen (Detail)

| Position | Betrag | Erlaeuterung |
|----------|--------|-------------|
| Patentanwalt (BLE Protocol + Multi-Market) | 20.000 EUR | Recherche + Anmeldung DE + EU |
| Rechtsberatung (DSGVO, AGB, Medical Compliance) | 15.000 EUR | Datenschutz-Audit inkl. Gesundheitsdaten |
| UX-Research & Usability-Tests (5 Maerkte) | 20.000 EUR | Externe Tests pro Marktsegment |
| Lektoren/Uebersetzer (App-Lokalisierung 16 Apps) | 10.000 EUR | Professionelle Uebersetzung, 9 UI-Sprachen |
| Fachgutachten Medical (med. Terminologie) | 8.000 EUR | Arzt/Uebersetzer-Kombination fuer Phrasebook |
| Barrierefreiheits-Pruefung (WCAG 2.1) | 7.000 EUR | Externe Zertifizierung |
| **SUMME Fremdleistungen** | **80.000 EUR** | |

### 3.4 Sachkosten (Detail)

| Position | Betrag | Erlaeuterung |
|----------|--------|-------------|
| Google Cloud APIs (Translation, TTS, STT, Vision) | 20.000 EUR | Variable API-Kosten, 16 App-Varianten |
| Cloud-Infrastruktur (Supabase, Vercel) | 8.000 EUR | Hosting, DB, Realtime fuer alle Maerkte |
| HPC-Zugang (ML-Finetuning, EuroHPC) | 15.000 EUR | GPU-Instanzen, marktspezifisches Training |
| Testgeraete (Smartphones, Tablets, BLE-Hardware) | 15.000 EUR | iPhone, Android (diverse), iPads, GL.iNet Router |
| Entwickler-Hardware (MacBooks, 4 Stueck) | 14.000 EUR | MacBook Pro M4 fuer Dev-Team |
| Software-Lizenzen (Entwicklung) | 8.000 EUR | GitHub, Sentry, Figma, CI/CD, Testinfrastruktur |
| Demo-Hardware (Pilotprojekte, 20 Tablets) | 10.000 EUR | iPads/Android-Tablets fuer B2B-Piloten |
| **SUMME Sachkosten** | **90.000 EUR** | |

### 3.5 Gemeinkosten

Pauschale von **20% auf Personalkosten** = 56.400 EUR (angesetzt: 50.000 EUR)

Enthaltene Positionen:
- Coworking-Space MV (Rostock/Schwerin)
- Bueromaterial, Internet, Telefon
- Reisekosten (Kundenbesuche, Pilotprojekte)
- Versicherungen (Betriebshaftpflicht, D&O, Cyber)
- Buchfuehrung, Lohnabrechnung

---

## 4. FINANZIERUNG (Gesamtvorhaben)

| Finanzierungsquelle | Betrag | Anteil |
|--------------------|--------|--------|
| **ZIM-Zuschuss (beantragt)** | 225.000 EUR | 45% |
| **Eigenmittel / Seed-Investment** | 175.000 EUR | 35% |
| **Weitere Foerderung (Forschungszulage, Gruenderstipendium)** | 100.000 EUR | 20% |
| **TOTAL** | **500.000 EUR** | **100%** |

> **Eigenanteil-Darstellung:**
> - Seed-Investment (Business Angels): 150.000 EUR (in Verhandlung)
> - INVEST-Zuschuss macht Angels attraktiver (15% Erwerbszuschuss)
> - Gruender-Eigenleistung: 25.000 EUR
> - Forschungszulage (35% FuE-Personal): ~70.000 EUR (Erstattung via BSFZ)
> - Gruenderstipendium MV (18 Mon. x bis 1.800 EUR): bis 32.400 EUR
>
> **Keine Doppelfoerderung:** ZIM-Kostenpositionen werden NICHT bei
> EFRE, FFplus oder anderen Programmen angesetzt. Die Abgrenzung wird
> dokumentiert.

---

## 5. MARKTPOTENZIAL UND VERWERTUNG

### 5.1 Zielmaerkte (7 Segmente)

| Segment | Marktgroesse (DACH) | Erreichbare Kunden (3 Jahre) | App-Varianten |
|---------|--------------------|-----------------------------|---------------|
| Tour-Guides & Reiseagenturen | 15.000 Anbieter | 500-1.000 | consumer, listener |
| Behoerden (Auslaender-/Sozial-) | 5.000+ Standorte | 200-500 | authority-clerk, authority-visitor |
| Konferenzen & Events | 30.000/Jahr (int.) | 100-400 | conference-speaker, conference-listener |
| Bildungseinrichtungen | 40.000 Schulen (DE) | 200-500 | school-teacher, school-student |
| Kreuzfahrt & Tourismus | 2.000 Schiffe (EU) | 10-50 | enterprise, listener |
| Krankenhaeuser & Arztpraxen | 20.000+ (DE) | 100-300 | medical-staff, medical-patient |
| Hotels & Gastronomie | 50.000+ (DE) | 100-300 | counter-staff, counter-guest |
| NGO & Fluechtlingshilfe | 3.000+ Einrichtungen | 50-200 | ngo-helper, ngo-client |
| **TOTAL** | | **1.260-3.250 B2B-Kunden** | **16 App-Varianten** |

### 5.2 Marktgroesse

| Ebene | Markt | Groesse |
|-------|-------|---------|
| **TAM** | Globaler maschineller Uebersetzungsmarkt | 8 Mrd. USD (2025), 15% CAGR |
| **SAM** | Live-Uebersetzung + Behoerden/NGO + Tourismus + Medical + Hospitality | ~6,7 Mrd. USD |
| **SOM** | DACH-Region, 3 Jahre | 180 Mio. USD (12 Mio. EUR ARR) |

### 5.3 Umsatzprognose

| Jahr | B2C (Abo) | B2B (SaaS) | Events | Medical | Hospitality | Enterprise | **Total ARR** |
|------|-----------|-----------|--------|---------|-------------|-----------|-------------|
| 1 | 20K | 80K | 20K | 15K | 10K | 10K | **155K EUR** |
| 2 | 200K | 800K | 500K | 200K | 150K | 600K | **2.450K EUR** |
| 3 | 700K | 3.000K | 1.800K | 800K | 500K | 5.300K | **12.100K EUR** |

### 5.4 Arbeitsplatzeffekte

| Zeitpunkt | Neue Arbeitsplaetze | Rollen | Standort |
|----------|--------------------|---------|---------|
| Monat 3 | +1 | Senior Developer | MV/Remote |
| Monat 4 | +1 | Sales & BD Manager | MV |
| Monat 6 | +1 | AI/ML Engineer (NLP) | MV/Remote |
| Monat 9 | +1 | UX/UI Designer | MV/Remote |
| Monat 12 | +1 | Customer Success Manager | MV |
| Monat 14 | +1 | Mobile Developer (iOS) | MV/Remote |
| **TOTAL nach 14 Monaten** | **+6** | | |

---

## 6. RISIKEN UND GEGENMASSNAHMEN

| Risiko | Eintrittswahrsch. | Auswirkung | Gegenmassnahme |
|--------|-------------------|-----------|---------------|
| Fachkraefte nicht verfuegbar | Mittel | Hoch | Remote-Stellen, Freelancer-Alternative, MV-Gehaltsbonus |
| BLE-Technologie-Risiko | Niedrig | Mittel | Prototyp funktionsfaehig, Hotspot als Fallback |
| Medical-Compliance komplex | Mittel | Hoch | Externe Rechtsberatung, kein Medizinprodukt (nur Kommunikation) |
| Marktakzeptanz langsam | Mittel | Mittel | Freemium senkt Einstiegshuerde, 50 B2B-Piloten validieren |
| Wettbewerber (Google etc.) | Niedrig | Hoch | 12-24 Monate Vorsprung, Offline+BLE+Multi-Market als Moat |
| DSGVO (insb. Gesundheitsdaten) | Niedrig | Hoch | Datenschutz-by-Design, EU-Hosting, externer DSB |
| Skalierung auf 500+ Listener | Niedrig | Mittel | Supabase Cluster, CDN, lastabhaengiges Routing |

---

## 7. ABGRENZUNG ZU EFRE

| Kriterium | EFRE MV | ZIM Einzelprojekt |
|-----------|---------|-------------------|
| **Traeger** | TBI GmbH, Schwerin (Land MV) | VDI/VDE-IT (Bund, BMWK) |
| **Max. Foerderung** | ~172.000 EUR (60% von 286k) | **225.000 EUR** (45% von 500k) |
| **Foerderquote KMU** | 60% (exp. Entwicklung) | 45% Einzel / 55% Kooperation |
| **Stundensatz-Deckel** | Ja (143h/Mon, TBI-Vorgabe) | **Nein** |
| **GF-Gehalt akzeptiert?** | Eng geprueft | **Flexibler** |
| **Regionalbindung** | Muss in MV sitzen | Bundesweit (MV = Bonus) |
| **Laufzeit** | 12 Monate typisch | **Bis 36 Monate** |
| **Vorrang** | ZIM hat Vorrang laut Richtlinie | — |
| **Verbundprojekt moegl.?** | Ja (+15% Bonus) | Ja (55% Quote + Partner) |

**Empfehlung:** ZIM als Hauptantrag, EFRE nur als Alternative falls ZIM abgelehnt.
Oder: EFRE fuer andere Kostenpositionen (z.B. Marketing/Vertrieb die bei ZIM nicht foerderfaehig sind).

---

## 8. ZIM-SPEZIFISCHE ANFORDERUNGEN

### 8.1 Begutachtungskriterien

ZIM-Projekte werden nach folgenden Kriterien bewertet:

| Kriterium | Gewichtung | Unsere Staerke |
|-----------|-----------|---------------|
| **Technischer Innovationsgehalt** | Hoch | 3 Weltneuheiten (BLE GATT, 4-Tier, Offline-Broadcast) |
| **Technische Risiken** | Mittel | Prototyp funktioniert, Risiken beherrschbar |
| **Marktpotenzial** | Hoch | SAM $6.7B, 7 Marktsegmente, DACH + EU |
| **Verwertungsaussichten** | Hoch | SaaS-Modell, B2C + B2B, erste Pilotkunden |
| **Qualifikation des Antragstellers** | Mittel | Solo-Entwickler, 41.436 Zeilen Code, AI Tour Guide UG |
| **Angemessenheit der Kosten** | Mittel | Marktkonform, detailliert aufgeschluesselt |

### 8.2 Formale Voraussetzungen

- [x] KMU-Eigenschaft (< 250 MA, < 50 Mio EUR Umsatz)
- [x] Sitz in Deutschland (MV)
- [x] FuE-Vorhaben mit technischem Risiko
- [x] Marktnaehe des Ergebnisses
- [ ] Vorhabensbeginn erst nach Bewilligung (oder Unbedenklichkeit)
- [ ] Keine Vorfinanzierung der beantragten Kosten

### 8.3 Kooperationsprojekt-Option (55% statt 45%)

Bei Kooperation mit einer Forschungseinrichtung (z.B. Uni Rostock, HS Wismar):
- Foerderquote steigt von 45% auf **55%** fuer KMU-Anteil
- Forschungseinrichtung erhaelt bis zu **100%** auf ihren Anteil
- Themen fuer Kooperation:
  - NLP/Computerlinguistik (Uni Rostock, Institut fuer Informatik)
  - Medizinische Kommunikationsforschung (Uni Rostock, Medizinische Fakultaet)
  - Barrierefreiheit / Usability (HS Wismar, Fakultaet Gestaltung)

**Bei 55% Foerderquote:**
- 500.000 EUR Kosten x 55% = **275.000 EUR Zuschuss** (+50.000 EUR mehr)

---

## 9. MEILENSTEINE

| # | Meilenstein | Zeitpunkt | KPI | ZIM-Nachweis |
|---|-----------|-----------|-----|-------------|
| M1 | UG-Gruendung, Google Play Launch | Monat 1 | Handelsregister, App im Store | Gruendungsdokumente |
| M2 | Senior Developer eingestellt | Monat 3 | Arbeitsvertrag, Team = 2 | Personalnachweis |
| M3 | BLE-Protokoll v2 (10+ Verbindungen) | Monat 6 | Funktionstest-Protokoll | Technischer Bericht |
| M4 | Medical-App Beta (Phrasebook, Datenschutz) | Monat 8 | Beta-Release, 3 Piloten | Release Notes + LoIs |
| M5 | 50 B2B-Piloten gestartet (5 Maerkte) | Monat 10 | Vertraege/LoIs | Pilotberichte |
| M6 | Patentanmeldung eingereicht | Monat 10 | Aktenzeichen | Patent-Nachweis |
| M7 | 60+ Offline-Sprachpaare, BLEU >85% | Monat 12 | Benchmark-Report | Evaluierungsbericht |
| M8 | 100 B2B-Kunden, 23K EUR MRR | Monat 14 | CRM-Daten, Umsatz | Abschlussbericht |

---

## 10. ANLAGEN (bei Einreichung beizufuegen)

- [ ] ZIM-Antragsformular (foerderportal.bund.de)
- [ ] Handelsregisterauszug (nach Gruendung)
- [ ] Businessplan mit Finanzprojektion (24 Monate)
- [ ] Lebenslauf Gruender (Alexander Deibel)
- [ ] Technische Dokumentation (01-technical-architecture-v5.2.md)
- [ ] Letter of Intent: AI Tour Guide UG (Pilot-Partner)
- [ ] Letter of Intent: 3+ weitere Pilotkunden
- [ ] Kostenvoranschlaege (Patentanwalt, Hardware, Testgeraete)
- [ ] DSGVO-Konzept
- [ ] De-minimis-Erklaerung
- [ ] Bonitaetsnachweis / Finanzierungsplan
- [ ] Ggf.: Kooperationsvertrag mit Forschungseinrichtung (fuer 55% Quote)

---

## 11. ERKLAERUNGEN

Der Antragsteller erklaert:

1. Das Vorhaben wurde noch nicht begonnen (Vorhabensbeginn erst nach Bewilligung oder vorzeitigem Massnahmebeginn).
2. Die im Kostenplan aufgefuehrten Kosten sind zuwendungsfaehig und werden nicht anderweitig gefoerdert (keine Doppelfoerderung mit EFRE).
3. Der Antragsteller erfuellt die KMU-Definition der EU (< 250 Mitarbeiter, < 50 Mio. EUR Umsatz).
4. Verbundene Unternehmen: AI Tour Guide UG, Rostock (Mitgruender Alexander Deibel).
5. Der Antragsteller verpflichtet sich zur ordnungsgemaessen Verwendung und zum Verwendungsnachweis.

---

**Antragsteller:**
Alexander Deibel
Fintutto UG (i.G.)
Mecklenburg-Vorpommern

**Datum:** [einzusetzen]
**Unterschrift:** [einzusetzen]

---

*Stand: 16.03.2026 | Fintutto Translator v5.2 | Vertraulich*
