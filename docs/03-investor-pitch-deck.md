# Fintutto Translator — Investor Pitch Deck

---

## SLIDE 1: Vision

### "Sprache darf keine Mauer sein."

Fintutto Translator ist die weltweit erste Uebersetzungsplattform, die **auch ohne Internet funktioniert** — per Bluetooth, WiFi-Hotspot oder lokale ML-Modelle. Live, in Echtzeit, fuer Gruppen bis 500 Personen, in 45 Sprachen gleichzeitig. **16 App-Varianten fuer 7 Marktsegmente** — von Schulen ueber Behoerden bis zu Kliniken und Hotels.

**Wir bauen die Infrastruktur fuer eine Welt, in der jeder jeden versteht — ueberall.**

---

## SLIDE 2: Das Problem

### 1,2 Milliarden Menschen reisen jaehrlich international. 68% sprechen die Landessprache nicht.

| Problem | Betroffene | Heutige Loesung | Mangel |
|---------|-----------|-----------------|--------|
| Tourist versteht Guide nicht | 600 Mio Touristen/Jahr | Audio-Guide (3-5 Sprachen) | Teuer, starr, keine Live-Interaktion |
| Fluechtling versteht Sachbearbeiter nicht | 110 Mio Gefluechtete weltweit | Dolmetscher (80-120 EUR/h) | Nicht verfuegbar, teuer, nicht skalierbar |
| Konferenz hat nur 3 Sprachen | 30.000 int. Konferenzen/Jahr | Simultan-Dolmetscher | 10.000+ EUR/Tag, nur 3-4 Sprachen |
| Schulkind versteht Lehrer nicht | 1.4 Mio Willkommensschueler (DE) | Aeltere Geschwister | Unzuverlaessig, ethisch fragwuerdig |
| Patient versteht Arzt nicht | Krankenhaeuser weltweit | Telefondolmetscher 80-120 EUR/h | Nicht sofort verfuegbar, teuer |
| Hotel-Gast versteht Rezeption nicht | 1.4 Mrd int. Hotelgaeste | Englisch-only | Viele Gaeste sprechen kein Englisch |
| Kein Internet an touristischem Ort | Millionen Orte weltweit | Nichts | Bisherige Translator-Apps versagen |

### Der blinde Fleck aller Wettbewerber:

> **Google Translate, DeepL, Microsoft Translator — sie alle setzen Internet voraus. An den Orten, wo Uebersetzung am meisten gebraucht wird, gibt es keins.**

Ruinen. Berge. Fluechtlingscamps. Boote. Busse. Schulen in laendlichen Gebieten. Behoerden mit gesperrten Netzwerken.

---

## SLIDE 3: Die Loesung

### Fintutto Translator: 4-Tier Architektur

```
┌────────────────────────────────────────────────────┐
│                                                     │
│  TIER 1: CLOUD                                      │
│  Supabase Realtime → Global, <1s Latenz             │
│  ✓ Internet verfuegbar                              │
│                                                     │
│  TIER 2: HOTSPOT                                    │
│  Speaker erstellt eigenes WiFi + Relay-Server        │
│  ✓ Kein Internet, aber WiFi-faehige Geraete         │
│                                                     │
│  TIER 3: BLE (Bluetooth Low Energy)                 │
│  Direkter GATT-Transport, Speaker → Listeners       │
│  ✓ Kein WiFi, kein Internet, nur Bluetooth          │
│                                                     │
│  TIER 4: OFFLINE (On-Device ML)                     │
│  Opus-MT + Whisper WASM, alles lokal                │
│  ✓ Kein Netzwerk jeglicher Art                      │
│                                                     │
│  JEDES TIER DEGRADIERT AUTOMATISCH ZUM NAECHSTEN    │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Was uns einzigartig macht:

1. **1→N Broadcast**: Ein Sprecher, N Zuhoerer, jeder in seiner Sprache
2. **Null Infrastruktur**: BLE-Modus braucht weder Internet noch Router noch Strom
3. **45 Sprachen**: Inkl. 10 Migrationssprachen (Dari, Tigrinya, Paschtu...)
4. **Kein App-Download**: PWA — Zuhoerer scannen QR-Code und sind dabei
5. **E2E-Verschluesselung**: AES-256-GCM, auch im Offline-Modus

---

## SLIDE 4: Produkt-Demo (Screenshots)

### 16 App-Varianten fuer 7 Maerkte

| Marktsegment | App-Varianten | Beschreibung |
|-------------|---------------|-------------|
| **General** | consumer, listener, enterprise, landing | Kernprodukt: Text, Live-Session, Gespraech, Kamera-OCR, Phrasebook, Offline, BLE |
| **Schools** | teacher, student | Willkommensklassen, Sprachfoerderung, Elternkommunikation |
| **Authorities** | clerk, visitor | Behoerden-Gespraeche, Migrationssprachen, Datenschutz |
| **NGO** | helper, client | Fluechtlingshilfe, Beratung, Camps |
| **Hospitality** | counter-staff, counter-guest | Hotel-Rezeption, Messe-Info, Gaestekommunikation |
| **Medical** | medical-staff, medical-patient | Arzt-Patient, Klinik-Aufnahme, Notaufnahme |
| **Events** | conference-speaker, conference-listener | Konferenzen, Messen, 1→N Broadcast, Untertitel |

---

## SLIDE 5: Marktgroesse

### TAM / SAM / SOM

```
TAM (Total Addressable Market):
├── Globaler Uebersetzungsmarkt:           $65 Mrd (2025)
├── Davon maschinelle Uebersetzung:        $8 Mrd (2025)
└── Wachstum: 15% CAGR bis 2030

SAM (Serviceable Addressable Market):
├── Live-Uebersetzung (Events/Tours/Edu):  $2.4 Mrd
├── Behoerden/NGO (Migrationssprachen):    $1.2 Mrd
├── Tourismus (Guided Tours):              $0.8 Mrd
├── Medical (Kliniken/Praxen):             $1.5 Mrd
├── Hospitality (Hotels/Messen):           $0.8 Mrd
└── TOTAL SAM:                            ~$6.7 Mrd

SOM (Serviceable Obtainable Market):
├── DACH-Region zuerst:                    $180 Mio
├── Erreichbar in 3 Jahren:               $12 Mio ARR
└── Bei 5.000 zahlenden Kunden
```

### Markttreiber

1. **Migration**: 110 Mio Gefluechtete weltweit (UNHCR 2025), steigend
2. **Tourismus-Rebound**: +15% internationaler Tourismus post-COVID
3. **Remote Work**: Internationale Teams brauchen Echtzeit-Uebersetzung
4. **Regulierung**: EU-Aufnahmerichtlinie verlangt Kommunikation in Muttersprache
5. **KI-Disruption**: ML-Modelle werden kleiner, schneller, besser — on-device wird moeglich

---

## SLIDE 6: Geschaeftsmodell

### Freemium + B2B SaaS + Enterprise Licensing

```
┌──────────────────────────────────────────────────────────┐
│                     REVENUE STREAMS                       │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  FREE     │  │  PRO (B2C)   │  │  ENTERPRISE (B2B) │ │
│  │           │  │              │  │                    │ │
│  │  PWA      │  │  19-49 EUR   │  │  149-2.999 EUR    │ │
│  │  5 Listen.│  │  /Monat      │  │  /Monat           │ │
│  │  Cloud    │  │  HD-TTS      │  │  White-Label      │ │
│  │  Standard │  │  Hotspot     │  │  API Access       │ │
│  │  TTS      │  │  BLE         │  │  SLA              │ │
│  │           │  │  Branding    │  │  MDM              │ │
│  │  → Leads  │  │  → MRR       │  │  → ARR            │ │
│  └──────────┘  └──────────────┘  └────────────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌───────────────────────────────────┐ │
│  │  EVENTS       │  │  PLATFORM (Future)                │ │
│  │               │  │                                   │ │
│  │  299-799 EUR  │  │  API Marketplace                  │ │
│  │  /Tag         │  │  Translation-as-a-Service         │ │
│  │  Konferenzen  │  │  White-Label SDK                  │ │
│  │  Messen       │  │  IoT-Integration                  │ │
│  │               │  │                                   │ │
│  │  → Upsell     │  │  → Platform Revenue               │ │
│  └──────────────┘  └───────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## SLIDE 7: Preismodell (Detail)

### B2C (Endverbraucher)

| Tier | Preis | Features | Zielgruppe |
|------|-------|----------|-----------|
| **Free** | 0 EUR | 5 Listener, Cloud, Standard-TTS, 45 Sprachen | Gelegenheitsnutzer |
| **Plus** | 9,99 EUR/Monat | 20 Listener, HD-TTS (Neural2), Offline-Modelle, Favoriten-Sync | Vielreisende |
| **Pro** | 19,99 EUR/Monat | 50 Listener, Chirp 3 HD, Hotspot, BLE, Kamera-OCR, Session-Export | Reiseleiter, Lehrer |

### B2B (Organisationen)

| Tier | Preis | Features | Zielgruppe |
|------|-------|----------|-----------|
| **Starter** | 49 EUR/Monat | 3 Geraete, Gespraechsmodus, Phrasebook, Offline | Kleine Praxen, Vereine |
| **Business** | 149 EUR/Monat | 10 Geraete, Priority Support, White-Label, Training | Behoerden, Schulen |
| **Enterprise** | 499 EUR/Monat | 50 Geraete, API, SSO, SLA 99.9%, dedizierter Account Manager | Grosse Organisationen |
| **Unlimited** | 2.999 EUR/Monat | Unbegrenzt, Custom Development, On-Premise Option | Konzerne, Laender |

### Events (Pay-per-Use)

| Tier | Preis | Features |
|------|-------|----------|
| **Tagesevent** | 299 EUR/Tag | 100 Listener, Cloud, HD-TTS |
| **Konferenz** | 799 EUR/Tag | 500 Listener, Priority Server, Protokoll |
| **Grossevent** | Auf Anfrage | 1000+ Listener, dedizierter Server, Branding |

### Projektion: Blended ARPU

```
Free-Nutzer:        0 EUR/Monat   (80% der Nutzer)
B2C Pro:           15 EUR/Monat   (12% der Nutzer)
B2B Business:     149 EUR/Monat   (6% der Nutzer)
B2B Enterprise:   499 EUR/Monat   (1.5% der Nutzer)
Events:           500 EUR/Event   (0.5% der Nutzer)

Blended ARPU:     ~22 EUR/Monat (ueber alle zahlenden Nutzer)
Free-to-Paid Conversion: 20% (Ziel Jahr 2)
```

---

## SLIDE 8: Wettbewerbsanalyse

### Feature-Matrix

| Feature | Fintutto | Google Translate | DeepL | Microsoft Translator | iTranslate |
|---------|----------|-----------------|-------|---------------------|------------|
| Offline-Uebersetzung | ✓ (WASM) | ✓ (begrenzt) | ✗ | ✓ (begrenzt) | ✗ |
| 1→N Live Broadcast | ✓ (45 Spr.) | ✗ | ✗ | ✓ (nur 10 Spr.) | ✗ |
| BLE-Transport | ✓ | ✗ | ✗ | ✗ | ✗ |
| WiFi-Hotspot-Modus | ✓ | ✗ | ✗ | ✗ | ✗ |
| E2E-Verschluesselung | ✓ (AES-256) | ✗ | ✗ | ✗ | ✗ |
| Migrationssprachen | ✓ (10) | Teilweise | ✗ | Teilweise | ✗ |
| PWA (kein Download) | ✓ | ✗ | ✗ | ✗ | ✗ |
| Gespraechsmodus | ✓ | ✓ | ✗ | ✓ | ✓ |
| Kamera-OCR | ✓ | ✓ | ✗ | ✓ | ✓ |
| Phrasebook | ✓ (18 Kat.) | ✓ (begrenzt) | ✗ | ✗ | ✓ |
| Kontextmodi | ✓ (6 Modi) | ✗ | ✗ | ✗ | ✗ |
| Open Source | ✓ | ✗ | ✗ | ✗ | ✗ |
| Kostenlos (Basis) | ✓ | ✓ | Freemium | ✓ | Freemium |

### Unsere Moats

```
TECHNISCHER MOAT:
  1. BLE GATT Protocol (proprietaer, patentfaehig)
  2. 4-Tier Transport mit Auto-Fallback
  3. Embedded Relay Server (Java/Swift)
  4. On-Device ML Pipeline (Opus-MT + Whisper)

NETZWERK-MOAT:
  1. PWA: Kein Download → virale Verbreitung via QR
  2. Jeder Listener wird potentieller Speaker
  3. Phrasebook-Community (Translation Memory)

MARKT-MOAT:
  1. Erste Loesung fuer Offline-Gruppen-Uebersetzung
  2. Migrationssprachen-Fokus (unterversorgter Markt)
  3. B2B-Beziehungen zu Behoerden und Schulen
  4. 16 App-Varianten fuer 7 Marktsegmente aus einer Codebase
```

---

## SLIDE 9: Go-to-Market Strategie

### Phase 1: DACH (Monat 1-12)

```
┌──────────────────────────────────────────────────┐
│  BOTTOM-UP: PWA + Google Play                     │
│  ├── SEO: "Offline Uebersetzer" / "Guided Tour    │
│  │   Translation" / "Fluechtling Uebersetzer"     │
│  ├── Google Play Store (Android)                  │
│  ├── Content Marketing (Use Cases, Blog)          │
│  └── Ziel: 10.000 Free-Nutzer, 500 Pro            │
│                                                    │
│  TOP-DOWN: B2B Vertrieb                           │
│  ├── 50 Behoerden-Piloten (Auslaenderbehoerden)   │
│  ├── 30 Schulen (Willkommensklassen)              │
│  ├── 20 Tourismus-Unternehmen                     │
│  ├── 20 Arztpraxen/Kliniken                       │
│  ├── 15 Hotels/Messen                             │
│  └── Ziel: 135 B2B-Kunden, 150K EUR ARR           │
└──────────────────────────────────────────────────┘
```

### Phase 2: Europa (Monat 12-24)

```
┌──────────────────────────────────────────────────┐
│  ├── Lokalisierung: EN, FR, ES, IT (UI fertig)   │
│  ├── EU-Foerderprogramme (Horizon, Erasmus+)     │
│  ├── Partnerschaften: Reiseveranstalter, NGOs    │
│  ├── Event-Markt: Konferenzen, Messen            │
│  └── Ziel: 50.000 Nutzer, 2.000 Pro, 500 B2B     │
│      = 2.5 Mio EUR ARR                           │
└──────────────────────────────────────────────────┘
```

### Phase 3: Global (Monat 24-36)

```
┌──────────────────────────────────────────────────┐
│  ├── iOS App Store (wenn ROI stimmt)             │
│  ├── API / SDK fuer Drittanbieter                │
│  ├── IoT-Integration (Hotelzimmer, Info-Kiosk)   │
│  ├── White-Label fuer Grossunternehmen           │
│  └── Ziel: 200.000 Nutzer, 10.000 Pro, 2.000 B2B │
│      = 12 Mio EUR ARR                            │
└──────────────────────────────────────────────────┘
```

---

## SLIDE 10: Technologie-Status

### Was bereits gebaut ist (v5.2, Maerz 2026)

| Komponente | Status | Codebase |
|-----------|--------|----------|
| PWA Frontend (React/TypeScript) | Production | 41.436 Zeilen, 295 TypeScript-Dateien |
| 16 App-Varianten fuer 7 Maerkte | Production | Monorepo mit Turborepo |
| 45 Sprachen + RTL | Production | Vollstaendig |
| 4-Provider Translation Cascade | Production | Getestet (87+ Tests) |
| Live-Session (Cloud) | Production | Supabase Realtime |
| Gespraechsmodus | Production | Split-Screen, Auto-Speak |
| Kamera-OCR | Production | Google Vision |
| Phrasebook (18 Kategorien) | Production | 16 Zielsprachen |
| E2E-Verschluesselung | Production | AES-256-GCM |
| Offline Translation (Opus-MT) | Production | 54 Sprachpaare |
| Offline STT (Whisper) | Production | WASM |
| HD-TTS (Neural2 + Chirp 3 HD) | Production | 45 Sprachen |
| Service Worker / PWA | Production | Workbox, Precache |
| 9 UI-Sprachen | Production | DE, EN, FR, ES, RU, UK, AR, FA, TR |
| 28 Pages | Production | Alle Marktsegmente abgedeckt |
| BLE Discovery | Production | Capacitor Plugin |
| BLE GATT Transport | Production | Native Java + Swift |
| Hotspot Relay Server | Production | Native + Node.js |
| Android App | Beta | Google Play Ready (v5.2) |
| iOS App | Alpha | Capacitor Shell, Permissions |

### Technologie-Highlights

- **41.436 Zeilen Code**, 295 TypeScript-Dateien, 16 App-Varianten
- **87+ automatisierte Tests**, 100% pass rate
- **Monorepo mit Turborepo** fuer 7 Marktsegmente
- **Build: 12 Sekunden** (Vite 6)
- **Bundle: 407 KB** gzipped (ohne WASM-Modelle)
- **Latenz: 400-800ms** End-to-End (Sprache → Uebersetzung → Ausgabe)
- **0 externe Abhaengigkeiten** fuer Offline-Modus

---

## SLIDE 11: Finanzprojektion

### 3-Jahres-Plan

```
                    Jahr 1         Jahr 2         Jahr 3
                    ──────         ──────         ──────
Free-Nutzer         10.000         50.000        200.000
Pro-Nutzer (B2C)       500          2.000         10.000
B2B-Kunden             100            500          2.000
Events                  20            100            400

MRR (Ende)          12.5K EUR      210K EUR       1.0M EUR
ARR                 150K EUR       2.5M EUR      12.0M EUR

ARPU (Paid)         22 EUR         25 EUR         28 EUR
Churn (monatlich)   5%             3%             2%
Free→Paid           5%             8%             12%

Revenue Split:
  B2C Pro           30%            25%            20%
  B2B SaaS          50%            55%            55%
  Events            15%            15%            15%
  API/SDK            5%             5%            10%
```

### Unit Economics (Ziel Jahr 2)

```
Customer Acquisition Cost (CAC):
  B2C:    15 EUR (SEO + Store + Virality)
  B2B:    800 EUR (Sales + Pilot + Onboarding)

Lifetime Value (LTV):
  B2C Pro:    180 EUR (15 EUR x 12 Monate)
  B2B:      3.576 EUR (149 EUR x 24 Monate)

LTV/CAC:
  B2C:    12x ✓
  B2B:    4.5x ✓

Payback Period:
  B2C:    1.5 Monate
  B2B:    5.4 Monate

Gross Margin:         85% (SaaS-typisch)
  ├── API-Kosten:     8% (Google Cloud)
  ├── Infrastruktur:  4% (Supabase, Hosting)
  └── Support:        3%
```

---

## SLIDE 12: Wettbewerbsvorteil & IP

### Patentfaehige Innovationen

1. **4-Tier Auto-Fallback Transport**
   Automatische Degradierung von Cloud → Hotspot → BLE → Offline
   mit transparentem Transport-Interface

2. **BLE GATT Translation Protocol**
   Custom Bluetooth-Protokoll fuer Echtzeit-Uebersetzungs-Broadcast
   mit Chunking, Presence und Session-Management

3. **Embedded Relay Server**
   WebSocket-Server als native App-Komponente, der ein lokales
   Netzwerk fuer Gruppen-Uebersetzung erstellt

4. **Hybrid ML Pipeline**
   Nahtloser Wechsel zwischen Cloud-APIs und On-Device WASM-Modellen
   mit gemeinsamer Cache-Schicht

5. **Multi-Market-Architecture**
   16 App-Varianten fuer 7 Marktsegmente aus einer einzigen Codebase
   mit marktspezifischen Konfigurationen und UI-Anpassungen

### Technische Barrieren fuer Wettbewerber

| Barriere | Nachahmungsaufwand |
|----------|-------------------|
| BLE GATT Protocol (Android + iOS) | 6-12 Monate |
| Embedded Relay Server | 3-6 Monate |
| 4-Tier Transport mit Auto-Select | 3-4 Monate |
| Offline ML Pipeline (Transformers.js) | 2-3 Monate |
| 45 Sprachen + 10 Migrationssprachen | 1-2 Monate |
| **Gesamt-Nachahmung** | **12-18 Monate** |

---

## SLIDE 13: Team

### Kernteam

| Rolle | Person | Hintergrund |
|-------|--------|-------------|
| **CEO / Product** | Alexander Deibel | Fintutto UG, Product Strategy, Solo-Development v5.2 |
| **CTO / Lead Dev** | [zu besetzen, Monat 3] | Full-Stack, Native Mobile, ML/AI |
| **Sales / BD** | [zu besetzen, Monat 4] | B2B SaaS, Behoerden, Tourismus |

### Advisor

| Rolle | Person | Hintergrund |
|-------|--------|-------------|
| **Tourism Industry Advisor** | Ulrich [Nachname] | Mitgruender AI Tour Guide UG, Branchenexpertise Tourismus |

### Aktuelle Teamgroesse
- 1 Gruender + KI-unterstuetzte Entwicklung
- Komplette v5.2 Codebase (41.436 Zeilen, 295 TypeScript-Dateien) in weniger als 6 Monaten gebaut
- AI Tour Guide UG (Rostock, seit 2024) als Referenz und erster Pilot-Partner

### Einstellungsplan (mit Finanzierung)

| Rolle | Zeitpunkt | Jahresgehalt (brutto) | AG-Kosten (23%) | Gesamt/Jahr |
|-------|-----------|----------------------|-----------------|-------------|
| CTO / Lead Developer | Monat 3 | 96.000 EUR | 22.080 EUR | 118.080 EUR |
| Sales & BD Manager | Monat 4 | 78.000 EUR | 17.940 EUR | 95.940 EUR |
| AI/ML Engineer (NLP) | Monat 6 | 84.000 EUR | 19.320 EUR | 103.320 EUR |
| Mobile Developer (iOS) | Monat 7 | 78.000 EUR | 17.940 EUR | 95.940 EUR |
| UX/UI Designer | Monat 9 | 66.000 EUR | 15.180 EUR | 81.180 EUR |
| Marketing Manager | Monat 10 | 66.000 EUR | 15.180 EUR | 81.180 EUR |
| Customer Success Manager | Monat 12 | 54.000 EUR | 12.420 EUR | 66.420 EUR |
| DevOps / Cloud Engineer | Monat 14 | 78.000 EUR | 17.940 EUR | 95.940 EUR |

> Gehaelter am oberen Marktniveau fuer Startups in MV/Remote (Quellen: Stepstone, Glassdoor, 2025/2026)

---

## SLIDE 14: Finanzierungsbedarf

### Finanzierungsstrategie: Foerdermittel + Seed-Investment

```
MODULARER FINANZIERUNGSPLAN (24 Monate):

┌─────────────────────────────────────────────────────────┐
│  PHASE 1: FOERDERMITTEL (Monat 1-6)         300.000 EUR │
│  ├── EFRE MV (FuE-Zuschuss, 60%)           150.000 EUR │
│  ├── ACCELERATE:MV (ESF+)                        0 EUR │
│  │   (Coaching, Mentoring -- kein Cash)                 │
│  ├── FFplus Generative AI (100% EU)         100.000 EUR │
│  └── Gruenderstipendium MV (18 Mon.)         21.600 EUR │
│      + Beratungsfoerderung BAFA               2.800 EUR │
│      + SME Fund IP-Schutz                     1.000 EUR │
│      + Forschungszulage (35% FuE-Kosten)     24.600 EUR │
│                                                         │
│  PHASE 2: WACHSTUMSFOERDERUNG (Monat 6-12) 200.000 EUR │
│  ├── ZIM Einzelprojekt (bis 690k, 25-60%)  200.000 EUR │
│  └── (oder EIC Accelerator Grant)                       │
│                                                         │
│  PHASE 3: SEED-INVESTMENT (Monat 6-12)      250.000 EUR │
│  ├── Business Angels (BAIN, BAND)           150.000 EUR │
│  ├── MBMV innoPRO / Genius VC              100.000 EUR │
│  └── (INVEST-Zuschuss macht Angels                      │
│       attraktiver: 15% Erwerbszuschuss)                 │
│                                                         │
│  TOTAL FINANZIERUNG:                        750.000 EUR │
│                                                         │
│  + EIGENE UMSAETZE (M1-M24):              ~680.000 EUR │
│  = TOTAL VERFUEGBAR:                     ~1.430.000 EUR │
└─────────────────────────────────────────────────────────┘
```

### Use of Funds (750.000 EUR, 24 Monate)

```
Team (64%):                           480.000 EUR
  ├── Gruender/CEO (24 Monate)        130.680 EUR
  ├── CTO (22 Monate, ab M3)          213.000 EUR
  ├── Sales Manager (20 Mon., ab M4)  159.900 EUR
  ├── AI/ML Engineer (anteilig)        50.000 EUR
  ├── Externe Dienstleister            50.000 EUR
  │   (Patentanwalt, Rechtsberatung,
  │    Steuerberatung, PR-Agentur)
  └── Inkl. AG-Nebenkosten (23%)      (enthalten)

Produkt & Infrastruktur (16%):       120.000 EUR
  ├── Cloud APIs (Google, Azure)       40.000 EUR
  ├── Hosting (Supabase, Vercel)       15.000 EUR
  ├── Hardware (Laptops, Testgeraete)  27.000 EUR
  ├── Software-Lizenzen & Tools        15.000 EUR
  ├── HPC-Zugang (ML-Training)        10.000 EUR
  └── Sonstige Infrastruktur          13.000 EUR

Go-to-Market (15%):                   112.500 EUR
  ├── Google Ads / ASO                 35.000 EUR
  ├── Content Marketing & SEO          20.000 EUR
  ├── Messen & Konferenzen             20.000 EUR
  ├── PR & Branding                    20.000 EUR
  └── Pilot-Programme & Demos          17.500 EUR

Reserve (5%):                          37.500 EUR

TOTAL:                                750.000 EUR
```

### Meilensteine

| Meilenstein | Zeitpunkt | KPI |
|-------------|-----------|-----|
| UG-Gruendung + Google Play Launch | Monat 1 | Handelsregister, App im Store |
| 500 Free-Nutzer, CTO eingestellt | Monat 3 | Organic Growth, Team = 2 |
| 20 B2B-Piloten, EFRE bewilligt | Monat 6 | Pipeline, Foerderzusage |
| 8K EUR MRR, 3.000 Nutzer | Monat 9 | Revenue Traction |
| 23K EUR MRR, 100 B2B-Kunden | Monat 12 | Product-Market Fit |
| 65K EUR MRR, Break-even in Sicht | Monat 18 | Unit Economics bewiesen |
| 148K EUR MRR, profitabel | Monat 24 | Series A Readiness |

### Naechste Runde: Series A (~3M EUR, Monat 18-24)
Voraussetzung: 100K+ EUR MRR, 500+ B2B-Kunden, <3% monatliche Churn, Profitabilitaet bewiesen

---

## SLIDE 15: Warum jetzt?

### 5 Gruende, warum dieses Timing perfekt ist

1. **On-Device ML ist reif**
   Opus-MT und Whisper laufen im Browser via WebAssembly.
   Vor 2 Jahren unmoeglich, heute Production-ready.

2. **BLE 5.0 ist Standard**
   Jedes Smartphone seit 2018 hat BLE 5.0.
   Ausreichend Bandbreite fuer Text-Transport.

3. **Migration steigt**
   110 Mio Gefluechtete (UNHCR), Tendenz steigend.
   EU-Aufnahmerichtlinie fordert Kommunikation in Muttersprache.

4. **Tourismus-Boom**
   Internationaler Tourismus uebertrifft Vor-COVID-Niveau.
   Asiatische Maerkte (China, Japan, Korea) wachsen am schnellsten.

5. **PWA-Akzeptanz**
   Progressive Web Apps sind etabliert.
   Kein App-Store-Download noetig = niedrigste Einstiegshuerde.

---

## SLIDE 16: Ask

### Wir suchen 250.000 EUR Seed-Investment (ergaenzend zu 500.000 EUR Foerdermitteln)

**Bewertung**: 3 Mio EUR Pre-Money (verhandelbar)

**Was wir bieten**:
- Funktionierendes Produkt mit 41.436 Zeilen Production Code, 295 TypeScript-Dateien
- 87+ automatisierte Tests, 100% pass rate
- 16 App-Varianten fuer 7 Marktsegmente
- Google Play Ready (v5.2)
- Einzigartiges 4-Tier-Transport-System (patentfaehig)
- Erster im Markt fuer Offline-Gruppen-Uebersetzung
- 500.000 EUR Foerderung bereits in Pipeline (EFRE/ZIM, Gruenderstipendium, Forschungszulage)
- 24-Monats-Cashflow-Planung mit Break-even in Monat 21

**Was wir brauchen**:
- 250.000 EUR Seed-Investment fuer Team-Aufbau und Go-to-Market
- Team: CTO (M3), Sales (M4), AI Engineer (M6), Mobile Dev (M7)
- 100 B2B-Pilotkunden in DACH gewinnen
- 148K EUR MRR in 24 Monaten
- Series A Readiness in 18-24 Monaten

**Warum jetzt investieren?**
- INVEST-Zuschuss: Business Angels erhalten 15% Erwerbszuschuss (steuerfrei)
- Foerdermittel hebeln das Investment: 250K EUR privat + 500K EUR Foerderung = 750K EUR Gesamt
- Fruehe Phase = niedrige Bewertung = hoeherer Return

---

## KONTAKT

**Fintutto UG (i.G.)**
Alexander Deibel
[E-Mail einfuegen]
[Telefon einfuegen]

**Produkt**: translator.fintutto.cloud
**Code**: github.com/alexanderdeibel-Fintutto/translator

---

*Stand: 16.03.2026 | Fintutto Translator v5.2.0 | Vertraulich*
