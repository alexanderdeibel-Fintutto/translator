# EIT Digital SPIN:Rise 2026 — Bewerbung Fintutto Translator

> **HINWEIS (06.03.2026):** SPIN:Rise richtet sich primaer an **Forscher
> (PhD, Postdocs, MSc)** an Universitaeten, die ihre Forschung kommerzialisieren
> wollen. Die Deadline 17.03.2026 betrifft den Call for Proposals fuer
> **Organisationen**, die das Programm durchfuehren. Fuer Fintutto als Startup
> mit fertigem MVP ist dieses Programm **nicht optimal geeignet**.
>
> **Alternative:** EIT Digital **Venture Incubation Program 2026** oder
> **28DIGITAL Champions** waeren passender. Oder: Kontakt zu einer Hochschule
> in MV (Uni Rostock, HS Wismar) fuer eine gemeinsame SPIN:Rise-Bewerbung
> als Forscher mit Kommerzialisierungs-Vorhaben.
>
> Dieses Dokument bleibt als Vorlage erhalten -- die Inhalte koennen fuer
> andere Bewerbungen (EIT Digital, EIC, Investoren) wiederverwendet werden.

**Programm:** EIT Digital SPIN:Rise 2026
**Antragsteller:** Fintutto UG (i.G.) / Alexander Deibel
**Beantragter Betrag:** bis 400.000 EUR
**Deadline Call for Proposals (Programmtraeger):** 17. Maerz 2026
**Teilnehmer-Bewerbung (Forscher):** Rolling, Ergebnis in 2-3 Wochen
**Themenbereich:** Digital Tech / Digital Industry

---

## 1. EXECUTIVE SUMMARY

**Fintutto Translator** ist die weltweit erste Echtzeit-Uebersetzungsplattform mit 4-Tier-Transportarchitektur (Cloud → WiFi-Hotspot → Bluetooth Low Energy → Offline-ML). Die App ermoeglicht Live-Broadcasting von Uebersetzungen in 45 Sprachen -- auch ohne Internetverbindung.

**Problem:** 1,2 Milliarden internationale Reisende jaehrlich, 110 Millionen Gefluechtete weltweit -- bestehende Uebersetzungs-Apps versagen ohne Internet. An genau den Orten, wo Uebersetzung am meisten gebraucht wird (Ruinen, Berge, Fluechtlingscamps, Behoerden), gibt es kein Netz.

**Loesung:** Eine Progressive Web App (PWA) mit proprietaerem BLE-GATT-Transportprotokoll, die automatisch zwischen vier Netzwerkstufen degradiert. Ein Sprecher, unbegrenzt Zuhoerer, jeder in seiner Sprache -- offline, verschluesselt, ohne App-Download.

**Status:** Production-ready MVP (v3.1), 13.296 Zeilen Code, 87 automatisierte Tests (100% pass rate), Google Play Ready.

**Markt:** SAM 4,4 Mrd. USD (Live-Uebersetzung + Behoerden/NGO + Tourismus). Ziel: 12 Mio. EUR ARR in 3 Jahren.

---

## 2. PROBLEM STATEMENT

### 2.1 Marktluecke

| Zielgruppe | Groesse | Heutiges Problem | Bisherige Loesung | Kosten |
|-----------|---------|-----------------|-------------------|--------|
| Touristen mit Sprachbarriere | 600 Mio/Jahr | Guide spricht nur 1-2 Sprachen | Audio-Guide (3-5 Sprachen, starr) | 3-5 EUR/Geraet/Tag |
| Gefluechtete bei Behoerden | 110 Mio weltweit | Kein Dolmetscher verfuegbar | Telefondolmetscher (80-120 EUR/h) | Nicht skalierbar |
| Internationale Konferenzen | 30.000/Jahr | Nur 3-4 Sprachen moeglich | Simultandolmetscher | 10.000+ EUR/Tag |
| Willkommensschueler | 1,4 Mio (DE) | Lehrer kann nicht kommunizieren | Aeltere Geschwister | Unzuverlaessig |
| Kreuzfahrt-Passagiere | 30 Mio/Jahr | Landausfluege nur in 2-3 Sprachen | 8 Dolmetscher pro Ausflug | 2.800 EUR/Ausflug |

### 2.2 Der blinde Fleck aller Wettbewerber

Google Translate, DeepL, Microsoft Translator -- **sie alle setzen Internet voraus.** Kein einziger Wettbewerber bietet:
- 1→N Live-Broadcasting (ein Sprecher, viele Hoerer)
- Offline-Gruppen-Uebersetzung via Bluetooth
- Automatisches Fallback zwischen Netzwerkstufen
- PWA ohne App-Download (QR-Code scannen genuegt)

---

## 3. SOLUTION: FINTUTTO TRANSLATOR

### 3.1 Einzigartige 4-Tier-Architektur

```
TIER 1: CLOUD (Supabase Realtime)
├── Volle Funktionalitaet, <1s Latenz
├── 45 Sprachen, Neural2 + Chirp 3 HD TTS
└── Unbegrenzte Hoerer weltweit

TIER 2: WIFI-HOTSPOT (Embedded Relay Server)
├── Speaker erstellt lokales WiFi-Netzwerk
├── WebSocket-basierter Relay Server
└── Funktioniert ohne Internet

TIER 3: BLE (Bluetooth Low Energy)
├── Proprietaeres GATT-Transportprotokoll
├── 2-5 Geraete direkt verbunden
└── Kein WiFi, kein Internet noetig

TIER 4: OFFLINE (On-Device ML)
├── Opus-MT Translation (54 Sprachpaare, WASM)
├── Whisper STT (Spracherkennung, lokal)
└── 100% ohne jedes Netzwerk
```

**Automatisches Fallback:** Die App erkennt die Netzwerkbedingungen und degradiert nahtlos von Tier 1 → 2 → 3 → 4.

### 3.2 Produkte

| # | Produkt | Status |
|---|---------|--------|
| 1 | Text-Uebersetzer (45 Sprachen, 4-Provider-Cascade) | Production |
| 2 | Live-Session (1→N Broadcast, QR-Join) | Production |
| 3 | Gespraechsmodus (Split-Screen, 2 Personen) | Production |
| 4 | Kamera-OCR (Foto → Text → Uebersetzung) | Production |
| 5 | Phrasebook (18 Kategorien, 16 Sprachen) | Production |
| 6 | Offline-Engine (Opus-MT + Whisper WASM) | Production |
| 7 | BLE-Transport (Custom GATT Protocol) | Production |

### 3.3 Technische Metriken

- **13.296 Zeilen** Production Code (React/TypeScript)
- **87 automatisierte Tests**, 100% pass rate
- **Build-Zeit:** 12 Sekunden (Vite 6)
- **Bundle:** 407 KB gzipped (ohne WASM-Modelle)
- **End-to-End Latenz:** 400-800ms (Sprache → Uebersetzung → Ausgabe)
- **Verschluesselung:** AES-256-GCM, auch offline
- **PWA:** Installierbar, Service Worker, Precaching

---

## 4. DEEP-TECH INNOVATION

### 4.1 Patentfaehige Technologien

| Innovation | Beschreibung | Nachahmungsaufwand |
|-----------|-------------|-------------------|
| **BLE GATT Translation Protocol** | Proprietaeres Bluetooth-Protokoll fuer Text-Broadcasting mit Chunking, Presence und Session-Management | 6-12 Monate |
| **4-Tier Auto-Fallback Transport** | Automatische Netzwerk-Degradierung mit transparentem Interface | 3-4 Monate |
| **Embedded Relay Server** | WebSocket-Server als native App-Komponente fuer lokale Netzwerke | 3-6 Monate |
| **Hybrid ML Pipeline** | Nahtloser Wechsel Cloud-APIs ↔ On-Device WASM-Modelle | 2-3 Monate |
| **Gesamt-Nachahmungsaufwand** | | **12-18 Monate** |

### 4.2 Technologie-Stack

- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Realtime, Auth, Edge Functions)
- **ML/AI:** Opus-MT (WASM), Whisper (WASM), Google Cloud NMT, Azure NMT
- **Native:** Capacitor (Android + iOS), BLE Plugin (Java + Swift)
- **TTS:** Google Neural2, Chirp 3 HD, Browser SpeechSynthesis
- **Hosting:** Vercel (CDN, Edge Functions)
- **Verschluesselung:** AES-256-GCM (SubtleCrypto API)

---

## 5. BUSINESS MODEL

### 5.1 Revenue Streams

```
Freemium (B2C)          → Lead Generation
├── Free: 0 EUR         (Offline, 22 Sprachen, 1 Hoerer)
├── Personal Pro: 4,99  (30 Sprachen, 3 Hoerer, Unbegrenzt)
└── Konversion: 5-12%

SaaS (B2B)              → Recurring Revenue (MRR)
├── Guide: 19,90-39,90  (Tour-Guides, 10-25 Hoerer)
├── Agentur: 99-249     (Multi-Guide, White-Label)
├── Event: 199-499      (Konferenzen, 100-500 Hoerer)
└── Cruise: 1.990-19.990 (Kreuzfahrt, Unbegrenzte Hoerer)

Enterprise              → Annual Revenue (ARR)
└── Custom: ab 149.990/Jahr (Konzerne, dedizierte Infrastruktur)
```

### 5.2 Unit Economics (Ziel Jahr 2)

| Metrik | B2C | B2B |
|--------|-----|-----|
| CAC | 15 EUR | 800 EUR |
| LTV | 180 EUR | 3.576 EUR |
| LTV/CAC | 12x | 4,5x |
| Payback | 1,5 Monate | 5,4 Monate |
| Gross Margin | 85-90% | 77-91% |

### 5.3 3-Jahres-Projektion

| | Jahr 1 | Jahr 2 | Jahr 3 |
|--|--------|--------|--------|
| Free User | 5.000 | 25.000 | 100.000 |
| Zahlende Kunden | 400 | 2.500 | 12.000 |
| MRR (Ende) | 23K EUR | 100K EUR | 500K+ EUR |
| ARR | 150K EUR | 2,5M EUR | 12M EUR |

---

## 6. MARKET ANALYSIS

### 6.1 TAM / SAM / SOM

| Ebene | Markt | Groesse |
|-------|-------|---------|
| **TAM** | Globaler maschineller Uebersetzungsmarkt | 8 Mrd. USD (2025), 15% CAGR |
| **SAM** | Live-Uebersetzung + Behoerden/NGO + Tourismus | 4,4 Mrd. USD |
| **SOM** | DACH-Region, 3 Jahre | 180 Mio. USD (12 Mio. EUR ARR) |

### 6.2 Markttreiber

1. **Migration:** 110 Mio. Gefluechtete, EU-Aufnahmerichtlinie fordert Muttersprache-Kommunikation
2. **Tourismus-Boom:** +15% international post-COVID, asiatische Maerkte wachsen am schnellsten
3. **On-Device ML:** Opus-MT und Whisper laufen im Browser -- vor 2 Jahren unmoeglich
4. **BLE 5.0 Standard:** Jedes Smartphone seit 2018, ausreichend Bandbreite fuer Text
5. **PWA-Akzeptanz:** Kein App-Download noetig = niedrigste Einstiegshuerde

### 6.3 Wettbewerb

| Wettbewerber | Preis | Offline | 1→N Broadcast | BLE | PWA |
|-------------|-------|---------|--------------|-----|-----|
| Google Translate | 0 EUR | Begrenzt | Nein | Nein | Nein |
| DeepL | 8,74/Mon | Nein | Nein | Nein | Nein |
| Microsoft Translator | 0 EUR | Begrenzt | 10 Sprachen | Nein | Nein |
| Wordly.ai | 75 USD/h | Nein | Ja | Nein | Nein |
| KUDO | 500+/Event | Nein | Ja | Nein | Nein |
| **Fintutto Translator** | **0-19.990** | **Ja (4 Tiers)** | **Ja (45 Spr.)** | **Ja** | **Ja** |

**Kein Wettbewerber bietet alle vier Alleinstellungsmerkmale gleichzeitig.**

---

## 7. GO-TO-MARKET STRATEGY

### Phase 1: DACH (Monat 1-12)

**Bottom-Up (B2C):**
- Google Play Launch (Android, v3.1 ready)
- SEO: "Offline Uebersetzer", "Tour Translation", "Fluechtling Uebersetzer"
- Ziel: 5.000 Free-Nutzer, 300 Pro

**Top-Down (B2B):**
- 50 Behoerden-Piloten (Auslaenderbehoerden MV, Schleswig-Holstein, Hamburg)
- 30 Schulen (Willkommensklassen)
- 20 Tourismus-Unternehmen (Partner: AI Tour Guide UG)
- Ziel: 100 B2B-Kunden, 23K MRR

### Phase 2: Europa (Monat 12-24)

- Lokalisierung (UI bereits in 9 Sprachen)
- EU-Partnerschaften (Reiseveranstalter, NGOs, Reedereien)
- Event-Markt: Konferenzen, Messen
- Ziel: 650 B2B-Kunden, 148K MRR

---

## 8. TEAM

### Gruender

**Alexander Deibel** — CEO / Product
- Gruender Fintutto UG (i.G.), Sitz Mecklenburg-Vorpommern
- Bisherige Leistung: Komplette v3.1 Codebase (13.296 Zeilen) als Solo-Founder mit KI-Unterstuetzung in <6 Monaten gebaut
- Mitgruender AI Tour Guide UG (seit 2024), Tourismus-Tech, Branchenkenntnis

### Advisor

**Ulrich [Nachname]** — Tourism Industry Advisor
- Mitgruender AI Tour Guide UG
- Branchenexpertise Tourismus, Stadtfuehrungen, Reiseveranstalter

### Einstellungsplan (mit Foerderung)

| Rolle | Eintritt | Jahresgehalt (brutto) |
|-------|----------|----------------------|
| CTO / Lead Developer | Monat 3 | 96.000 EUR |
| Sales & BD Manager | Monat 4 | 78.000 EUR |
| AI/ML Engineer (NLP) | Monat 6 | 84.000 EUR |
| Mobile Developer (iOS) | Monat 7 | 78.000 EUR |
| UX/UI Designer | Monat 9 | 66.000 EUR |

---

## 9. USE OF FUNDS (400.000 EUR)

| Kategorie | Betrag | Anteil | Details |
|-----------|--------|--------|---------|
| **Produktentwicklung** | 180.000 EUR | 45% | CTO (12 Mon.), AI Engineer (6 Mon.), Mobile Dev (6 Mon.), Cloud-Infrastruktur |
| **Go-to-Market** | 100.000 EUR | 25% | Sales Manager (8 Mon.), Google Ads, ASO, Content Marketing, Messen |
| **Business Development** | 60.000 EUR | 15% | B2B-Piloten, Demo-Hardware, Kundenbesuche, Reisekosten |
| **IP-Schutz & Recht** | 30.000 EUR | 7,5% | Patentanmeldung BLE Protocol, Markenanmeldung, Datenschutz/DSGVO |
| **Operations** | 30.000 EUR | 7,5% | Coworking MV, Versicherungen, Buchfuehrung, Geraete |
| **TOTAL** | **400.000 EUR** | **100%** | |

---

## 10. MILESTONES (12 Monate)

| Meilenstein | Zeitpunkt | KPI | Abhaengigkeit |
|------------|-----------|-----|--------------|
| Fintutto UG Gruendung | M1 | Handelsregistereintrag | Notar |
| Google Play Launch | M1 | App im Store | Bereits ready |
| CTO eingestellt | M3 | Team = 2 | Recruiting |
| 1.000 Free-Nutzer | M3 | Organic Growth | Marketing |
| iOS Beta Launch | M5 | TestFlight | Mobile Dev |
| 50 B2B-Piloten gestartet | M6 | Pipeline | Sales |
| BLE-Patent eingereicht | M6 | Patentanmeldung | Patentanwalt |
| AI/ML Engine v2 (Custom NLP) | M8 | Qualitaetsverbesserung | AI Engineer |
| 5.000 Free-Nutzer, 100 B2B | M10 | Traction | Team |
| 23K EUR MRR | M12 | Revenue | Product-Market Fit |
| Series A Readiness | M12 | Metriken | Alle |

---

## 11. EUROPEAN DIMENSION

### Warum Europa profitiert

1. **Digital Sovereignty:** On-Device ML-Modelle (Made in Europe) reduzieren Abhaengigkeit von US-Cloud-Anbietern
2. **Migration:** EU-weites Problem -- Loesung skaliert ueber alle Mitgliedstaaten
3. **Tourismus:** Europa ist Top-Tourismusdestination weltweit (700+ Mio. Ankuenfte/Jahr)
4. **Datenschutz:** DSGVO-konform by Design (E2E-Verschluesselung, EU-Hosting-Option)
5. **Inklusion:** Migrationssprachen (Dari, Tigrinya, Paschtu) sind typischerweise unterversorgt

### Skalierungspotenzial in Europa

| Land/Region | Marktzugang | Besonderheit |
|------------|------------|-------------|
| **DACH** (DE/AT/CH) | Direkt (Phase 1) | Groesster Markt, meiste Gefluechtete |
| **Skandinavien** | Phase 2 | Hohe Tech-Akzeptanz, viele Touristen |
| **Suedeuropa** (ES/IT/GR) | Phase 2 | Tourismus-Hotspot, Migrantenrouten |
| **Osteuropa** (PL/CZ/RO) | Phase 3 | Wachsender Markt, EU-Strukturfoerderung |

---

## 12. KONTAKT

**Fintutto UG (i.G.)**
Alexander Deibel
Mecklenburg-Vorpommern, Deutschland

**Produkt:** translator.fintutto.cloud
**Repository:** github.com/alexanderdeibel-Fintutto/translator
**E-Mail:** [einzusetzen]
**Telefon:** [einzusetzen]

---

*Stand: 06.03.2026 | Fintutto Translator v3.1.0 | Vertraulich*
