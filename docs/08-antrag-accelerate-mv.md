# ACCELERATE:MV — Bewerbung Fintutto Translator

**Programm:** ACCELERATE:MV (ESF+ gefoerdert)
**Betreiber:** Zentrum fuer Entrepreneurship (ZfE), Universitaet Rostock
**Antragsteller:** Alexander Deibel / Fintutto UG (i.G.)
**Standort:** Mecklenburg-Vorpommern
**Programmlaenge:** Flirt-Phase (12 Wochen) + Accelerator-Phase (5-6 Monate)

**Kontakt:**
- **Paul Westphal** (Koordinator ACCELERATE:MV)
- E-Mail: paul.westphal@uni-rostock.de
- Tel.: +49 (0) 381 498 11 63
- ZfE: Albert-Einstein-Strasse 21, 18059 Rostock
- Bewerbung: https://www.zfe.uni-rostock.de/accelerator/anmeldeformular-batches/

> **Bewerbungen sind jederzeit willkommen** (kein fester Deadline-Druck).
> Pro Jahr: 2 Accelerator-Phasen + 2 Flirt-Phasen.
> Keine Beteiligung (0% Equity) -- rein Coaching/Mentoring/Netzwerk.

---

## 1. DAS STARTUP

### 1.1 Unternehmen

| | |
|---|---|
| **Name** | Fintutto UG (i.G.) |
| **Gruender** | Alexander Deibel |
| **Sitz** | Mecklenburg-Vorpommern |
| **Gruendungsdatum** | 2026 (in Gruendung) |
| **Branche** | AI / Translation Technology / SaaS |
| **Produkt** | Fintutto Translator — Echtzeit-Uebersetzungsplattform |
| **Website** | translator.fintutto.cloud |

### 1.2 Gruender-Profil

**Alexander Deibel**
- Solo-Entwicklung einer Production-ready Uebersetzungsplattform (41.436 Zeilen Code, 295 TypeScript-Dateien, 16 App-Varianten, 87 Tests, 100% pass rate)
- Mitgruender AI Tour Guide UG (seit 2024) — Tourismus-Tech, Branchenexpertise
- Technologieverstaendnis: React/TypeScript, ML/AI, Mobile (Capacitor), BLE-Protokolle
- Standort: Mecklenburg-Vorpommern

---

## 2. DAS PROBLEM

### Kommunikationsbarrieren sind ueberall — Loesungen funktionieren nur mit Internet

**600 Millionen Touristen** verstehen ihren Guide nicht. **110 Millionen Gefluechtete** koennen nicht mit Behoerden kommunizieren. **1,4 Millionen Willkommensschueler** in Deutschland verstehen ihren Lehrer nicht.

Die existierenden Uebersetzungs-Apps (Google Translate, DeepL, Microsoft) haben einen blinden Fleck: **Sie brauchen alle Internet.** An den Orten, wo Uebersetzung am meisten gebraucht wird — Ruinen, Berge, Fluechtlingsunterkuenfte, Behoerden mit gesperrten Netzwerken — gibt es keins.

Ausserdem bieten sie nur 1:1-Uebersetzung. **Niemand bietet eine Loesung fuer: Ein Sprecher, 50 Zuhoerer, jeder in seiner Sprache, ohne Internet.**

---

## 3. DIE LOESUNG

### Fintutto Translator: Die weltweit erste Offline-Gruppen-Uebersetzung

Eine Progressive Web App mit **4-Tier-Transportarchitektur**:

1. **Cloud:** Volle Funktionalitaet mit Internet (45 Sprachen, <1s Latenz)
2. **WiFi-Hotspot:** Speaker erstellt eigenes lokales Netzwerk (kein Internet noetig)
3. **Bluetooth (BLE):** Direkter Transfer zwischen Geraeten (kein WiFi noetig)
4. **Offline ML:** Alles lokal auf dem Geraet (kein Netzwerk jeglicher Art)

**Die App wechselt automatisch zwischen den Stufen** — der Nutzer merkt es kaum.

### Was es kann

- **1→N Broadcasting:** Ein Sprecher, unbegrenzt Zuhoerer, jeder in seiner Sprache
- **45 Sprachen** inkl. 10 Migrationssprachen (Dari, Tigrinya, Paschtu, Kurdisch, Somali...)
- **Kein App-Download:** PWA — QR-Code scannen und zuhoeren
- **Ende-zu-Ende-Verschluesselung** (AES-256-GCM)
- **7 Produkte in einer App:** Text-Uebersetzer, Live-Session, Gespraechsmodus, Kamera-OCR, Phrasebook, Offline-Engine, BLE-Transport

### Status

| Metrik | Wert |
|--------|------|
| Code | 41.436 Zeilen (React/TypeScript), 295 Dateien |
| App-Varianten | 16 (7 Marktsegmente) |
| Tests | 87 automatisierte Tests, 100% pass rate |
| Build | 12 Sekunden |
| Latenz | 400-800ms End-to-End |
| Google Play | Ready (v5.2) |

---

## 4. DER MARKT

### Marktgroesse

| Ebene | Markt | Groesse |
|-------|-------|---------|
| TAM | Maschinelle Uebersetzung global | 8 Mrd. USD |
| SAM | Live-Uebersetzung + Behoerden + Tourismus | 4,4 Mrd. USD |
| SOM | DACH-Region, 3 Jahre | 180 Mio. USD |

### Zielkunden

1. **Tour-Guides & Reiseagenturen** — Ersetzen teure Hardware-Audioguides (97% guenstiger)
2. **Behoerden** (Auslaender-/Sozialbehoerden) — Dolmetscherkosten senken
3. **Konferenzen & Events** — 45 Sprachen statt 3-4
4. **Schulen** (Willkommensklassen) — Lehrer-Schueler-Kommunikation
5. **Kreuzfahrt-Reedereien** — Landausfluege in 8+ Sprachen statt 2
6. **Medical** (Krankenhaeuser, Arztpraxen, Apotheken) — Patientenkommunikation ohne Telefondolmetscher
7. **Hospitality** (Hotels, Empfang, Messen, Einzelhandel) — Gaestekommunikation an Rezeption und Counter

### Wettbewerbsvorteil

Kein einziger Wettbewerber bietet **alle vier** zusammen:
- ✓ Offline-Gruppen-Uebersetzung
- ✓ 1→N Live-Broadcasting
- ✓ BLE-Transport ohne Internet
- ✓ PWA ohne App-Download

---

## 5. GESCHAEFTSMODELL

### SaaS + Freemium + Enterprise

| Segment | Preis | Zielgruppe |
|---------|-------|-----------|
| **Free** | 0 EUR | Gelegenheitsnutzer, Tester |
| **Personal Pro** | 4,99 EUR/Mon | Reisende, Expats |
| **Guide** | 19,90-39,90 EUR/Mon | Tour-Guides |
| **Agentur** | 99-249 EUR/Mon | Reiseagenturen |
| **Event** | 199-499 EUR/Mon | Konferenzen, Messen |
| **Cruise** | 1.990-19.990 EUR/Mon | Kreuzfahrt-Reedereien |
| **Medical** | 79-249 EUR/Mon | Krankenhaeuser/Praxen |
| **Hospitality** | 49-99 EUR/Mon | Hotels/Counter |

**Gross Margin:** 77-91% (SaaS-typisch, variable API-Kosten gering)

### 3-Jahres-Projektion

| | Jahr 1 | Jahr 2 | Jahr 3 |
|--|--------|--------|--------|
| Zahlende Kunden | 400 | 2.500 | 12.000 |
| ARR | 150K EUR | 2,5M EUR | 12M EUR |

---

## 6. MV-BEZUG

### Warum Mecklenburg-Vorpommern?

1. **Tourismus-Land:** MV ist Deutschlands beliebtestes Reiseziel (30+ Mio. Uebernachtungen/Jahr). Ruegen, Usedom, Wismar, Stralsund — ueberall Bedarf an mehrsprachiger Kommunikation.

2. **Pilotprojekte vor Ort:**
   - Tour-Guides auf Ruegen und Usedom (Pilot mit AI Tour Guide UG, Rostock)
   - Auslaenderbehoerden in Rostock und Schwerin
   - Willkommensklassen an MV-Schulen
   - Hotels und Kreuzfahrt-Terminals in Warnemuende
   - Kliniken und Arztpraxen in MV (Universitaetsmedizin Rostock)
   - Hotels in MV-Tourismusregionen

3. **Arbeitsplaetze:** 5 neue Stellen in 12 Monaten (Coworking-Space in MV)

4. **Netzwerk:** TBI MV als Technologieberater, IHK Rostock/Schwerin

5. **Strukturfoerderung:** Innovation und digitale Wertschoepfung in einer strukturschwachen Region

---

## 7. WAS WIR VON ACCELERATE:MV ERWARTEN

### 7.1 Coaching-Bedarf

| Thema | Bedarf | Prioritaet |
|-------|--------|-----------|
| **Go-to-Market DACH** | B2B-Vertriebsstrategie fuer Behoerden und Tourismus | Hoch |
| **Pricing-Validierung** | Pricing ueber 7 Marktsegmente pruefen, vereinfachen? | Hoch |
| **Finanzplanung** | Cashflow-Optimierung, Foerdermittel-Kombination | Mittel |
| **Team-Aufbau** | CTO- und Sales-Recruiting in MV/Remote | Mittel |
| **Investoren-Pitch** | Pitch-Training, Investor-Matching | Mittel |
| **IP-Strategie** | Patentanmeldung BLE-Protokoll | Niedrig |

### 7.2 Mentoring-Bedarf

- **Branchenexperten:** Tourismus (Reedereien, Reiseveranstalter), oeffentlicher Sektor (Behoerden)
- **Technologie:** ML/AI-Skalierung, Mobile-App-Distribution
- **Vertrieb:** B2B-SaaS-Vertrieb, Enterprise-Sales

### 7.3 Netzwerk-Bedarf

- Kontakte zu **Behoerden in MV** (Pilotprojekte)
- Kontakte zu **Tourismus-Unternehmen** in MV
- **Investoren-Netzwerk** (Baltic Incubate, BAIN)
- **Andere Startups** in MV fuer Erfahrungsaustausch

---

## 8. MEILENSTEINE WAEHREND DES PROGRAMMS (5 Monate)

| Monat | Meilenstein | KPI |
|-------|-----------|-----|
| 1 | Fintutto UG gegruendet, Google Play Launch | Handelsregister, App im Store |
| 2 | Erste 500 Free-Nutzer, Pitch-Deck finalisiert | Analytics, Investor-Ready |
| 3 | 3 B2B-Piloten in MV gestartet | Letters of Intent |
| 4 | CTO eingestellt, 1.000 Nutzer | Arbeitsvertrag, Growth |
| 5 | 5 B2B-Piloten, 2K MRR, Demo-Day Ready | Revenue, Pipeline |

---

## 9. KONTAKT

**Alexander Deibel**
Fintutto UG (i.G.)
Mecklenburg-Vorpommern

**Produkt:** translator.fintutto.cloud
**E-Mail:** [einzusetzen]
**Telefon:** [einzusetzen]

---

*Stand: 16.03.2026 | Fintutto Translator v5.2 | Vertraulich*
