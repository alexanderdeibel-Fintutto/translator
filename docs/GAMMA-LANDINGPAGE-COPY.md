# Gamma Landingpage Copy — Fintutto World

**Erstellt:** 2026-03-22
**Zweck:** Copy fuer Gamma-Website/Praesentation — oeffentliche Landingpage fuer das Fintutto-Oekosystem
**Format:** Jede Sektion = 1 Gamma-Slide/Block

---

## SLIDE 1: HERO

### Fintutto World

**Headline:**
# Sprache darf keine Mauer sein.

**Subheadline:**
Wir bauen die Infrastruktur fuer eine Welt, in der jeder jeden versteht — ueberall. Von Echtzeit-Uebersetzung ueber KI-Audioguides bis zu interaktiven City Guides. Alles aus Deutschland. Alles live.

**Stats-Leiste:**

| 50+ | 1.700+ | 45 | 25+ |
|:---:|:---:|:---:|:---:|
| Repositories | Commits | Sprachen | Live Apps |

**CTA-Buttons:**
- [Produkte entdecken] → #produkte
- [Fuer Investoren] → #investoren

---

## SLIDE 2: DAS PROBLEM

### 1,2 Milliarden Menschen reisen jaehrlich international. 68% sprechen die Landessprache nicht.

**3 Problem-Karten:**

**Karte 1: Tourismus**
🎧 Audio-Guides kosten 3-5 EUR, bieten nur 3-5 Sprachen und keine Live-Interaktion. Stadtfuehrer verlieren 70% der internationalen Nachfrage.

**Karte 2: Behoerden & Soziales**
🏛 110 Mio Gefluechtete weltweit. Dolmetscher kosten 80-120 EUR/Stunde und sind nicht verfuegbar, wenn man sie braucht. 1,4 Mio Willkommensschueler in Deutschland warten.

**Karte 3: Events & Business**
🎤 Simultandolmetscher kosten 10.000+ EUR pro Tag — fuer nur 3-4 Sprachen. 30.000 internationale Konferenzen pro Jahr suchen bessere Loesungen.

**Pull-Quote:**
> Google Translate, DeepL, Microsoft Translator — sie alle brauchen Internet. An den Orten, wo Uebersetzung am meisten gebraucht wird, gibt es keins. Ruinen. Berge. Camps. Boote.

---

## SLIDE 3: DIE LOESUNG — 4-TIER ARCHITEKTUR

### Die weltweit erste Uebersetzungsplattform, die auch ohne Internet funktioniert.

**4 Stufen — visuell als Fallback-Kaskade:**

**Tier 1: Cloud**
Supabase Realtime — globale Reichweite, unter 1 Sekunde Latenz.
→ Wenn Internet verfuegbar

**Tier 2: WiFi-Hotspot**
Speaker erstellt eigenes lokales Netzwerk mit Relay-Server. Kein Internet noetig.
→ Wenn kein Internet, aber WiFi-faehige Geraete

**Tier 3: Bluetooth LE**
Direkter GATT-Transport zwischen Geraeten. Keine Infrastruktur noetig.
→ Wenn kein WiFi, nur Bluetooth

**Tier 4: On-Device KI**
Opus-MT + Whisper — alles lokal auf dem Geraet. Komplett offline.
→ Wenn gar kein Netzwerk

**Highlight-Box:**
Jede Stufe degradiert automatisch zur naechsten. Nahtlos. Verschluesselt (AES-256-GCM). In 45 Sprachen. Patentfaehig.

---

## SLIDE 4: PRODUKT 1 — GUIDETRANSLATOR (Flaggschiff)

### GuideTranslator — Echtzeit-Uebersetzung fuer Tourismus, Events & mehr

**Badge:** Flaggschiff-Produkt | 16 App-Varianten | 7 Marktsegmente

**Feature-Grid (6 Karten):**

**Live-Broadcasting**
1 Sprecher → bis zu 500 Zuhoerer, jeder in seiner Sprache. Per QR-Code beitreten — kein App-Download noetig (PWA).

**Gespraechsmodus**
Face-to-Face mit 180-Grad-Split-Screen. Ideal beim Arzt, auf der Behoerde, am Schalter. Beide Seiten sprechen — beide verstehen.

**Kamera-Uebersetzer**
Speisekarten, Schilder, Dokumente fotografieren — Uebersetzung erscheint sofort. Powered by Google Cloud Vision OCR.

**Offline-Engine**
54 Sprachpaare offline verfuegbar. Opus-MT fuer Text, Whisper fuer Sprache. Funktioniert komplett ohne Internet.

**45 Sprachen**
Inkl. 10 Migrationssprachen: Dari, Tigrinya, Paschtu, Somali, Amharisch. Vollstaendige RTL-Unterstuetzung.

**E2E-Verschluesselung**
AES-256-GCM in allen Tiers. DSGVO-konform. Keine Daten auf fremden Servern.

---

## SLIDE 5: MARKTSEGMENTE — 7 BRANCHEN, 16 APPS

### Ein Produkt. Sieben Maerkte. Sechzehn App-Varianten.

**Segment-Grid:**

| Segment | Apps | Einsatz |
|---------|------|---------|
| **Tourismus** | Consumer + Listener + Enterprise + Landing | Stadtfuehrungen, Agenturen, Kreuzfahrt |
| **Schulen** | Teacher + Student | Willkommensklassen, Elternkommunikation |
| **Behoerden** | Clerk + Visitor | Buergeramt, Auslaenderbehoerde, Jobcenter |
| **NGO/Soziales** | Helper + Client | Fluechtlingshilfe, Beratung, Camps |
| **Hospitality** | Counter-Staff + Counter-Guest | Hotel-Rezeption, Messe-Info |
| **Medizin** | Medical-Staff + Medical-Patient | Arzt-Patient, Klinik-Aufnahme, Notaufnahme |
| **Events** | Conference-Speaker + Conference-Listener | Konferenzen, Messen, Werksfuehrungen |

**Highlight:**
Jede Variante ist auf die Beduerfnisse der Zielgruppe zugeschnitten — eigenes UI, eigene Phrasen, eigene Workflows. Aber alle teilen die gleiche patentfaehige 4-Tier-Architektur.

---

## SLIDE 6: PRODUKT 2 — FINTUTTO ART GUIDE

### Der KI-Audioguide, der jedes Museum in die Zukunft bringt.

**Badge:** Neu | KI-gestuetzt | Unbegrenzte Sprachen

**3 Saeulen:**

**Fuer Besucher**
- KI-generierte Audioguides in jeder Sprache
- Interaktiver KI-Chat zu jedem Kunstwerk ("Wer hat das gemalt?", "Warum ist das wichtig?")
- Indoor-Positionierung: QR, BLE, GPS, NFC
- Offline-Modus fuer Orte ohne Empfang
- Personalisierte Beschreibungen (Kinder, Jugend, Experten, Barrierefrei)

**Fuer Museen (Portal/CMS)**
- Kunstwerke verwalten, Touren erstellen, Audio generieren
- Analytics: Besucherstroeme, Heatmaps, beliebte Werke
- Content Hub: Uebersetzungen, Beschreibungen auf 5 Levels
- Team-Verwaltung, Rollen, Workflows
- Bulk-Import fuer grosse Sammlungen

**White-Label**
- Eigene App im eigenen Branding: [museum].artguide.fintutto.world
- Custom Domain moeglich
- Volle Anpassung: Farben, Logo, Schriftarten

**Pricing-Teaser:**

| Starter | Professional | Enterprise |
|:---:|:---:|:---:|
| 49 EUR/Mo | 199 EUR/Mo | 599 EUR/Mo |
| 50 Werke, 2 Sprachen | 500 Werke, 10 Sprachen | Unbegrenzt |
| QR-Positionierung | BLE + GPS, Heatmaps | White-Label, API, Dedicated Support |

---

## SLIDE 7: PRODUKT 3 — FINTUTTO CITY GUIDE

### Jede Stadt. Jede Sprache. Ein Guide.

**Badge:** Coming Soon

**Was es kann:**
- Interaktive Stadtfuehrungen mit KI-Audio in jeder Sprache
- POIs (Points of Interest) entdecken, Touren folgen, Angebote nutzen
- Regionale Partner und Empfehlungen
- Buchungssystem fuer Touren und Erlebnisse
- Offline-Karten fuer Touristen ohne Roaming
- White-Label fuer Staedte: [stadt].cityguide.fintutto.world

**Fuer wen:**
- Tourismusverbaende und DMOs (Destination Management Organizations)
- Staedte und Gemeinden
- Lokale Partner (Restaurants, Shops, Museen)

**Vision:**
Vom Art Guide zum City Guide zum Region Guide — ein modulares System, das vom einzelnen Museum bis zur ganzen Region skaliert.

---

## SLIDE 8: PRODUKT 4 — FINTUTTO REGION GUIDE

### Von der Stadt zur Region. Vom Museum zur Landschaft.

**Badge:** In Planung

**Features:**
- Regionen mit allen Staedten, POIs, Naturerlebnissen
- Ausfluege und Wanderungen mit KI-Audio
- Regionale Partner und saisonale Angebote
- Vollbild-Karte mit allen Highlights
- White-Label fuer Regionen: [region].regionguide.fintutto.world

**Das Guide-Oekosystem im Ueberblick:**

```
Art Guide → Museum-Ebene (Kunstwerke, Touren, Audio)
    ↓
City Guide → Stadt-Ebene (POIs, Stadtfuehrungen, Partner)
    ↓
Region Guide → Regions-Ebene (Staedte, Natur, Ausfluege)
```

Alles vernetzt. Alles mehrsprachig. Alles KI-gestuetzt.

---

## SLIDE 9: TECHNOLOGIE

### Der Tech Stack hinter dem Oekosystem

**Stack-Visualisierung:**

**Frontend:**
React 18 | TypeScript | Vite | Tailwind CSS | shadcn/ui

**Backend:**
Supabase (Postgres + Realtime + Auth + Edge Functions) | Stripe

**KI & ML:**
Google Cloud Translation | Google Cloud TTS (Neural2 + Chirp 3 HD) | Google Cloud STT | Google Cloud Vision OCR | Opus-MT (Offline) | Whisper WASM (Offline)

**Transport:**
Supabase Realtime (Cloud) | WiFi Relay Server (Hotspot) | Bluetooth LE GATT (Offline) | On-Device ML (Komplett offline)

**Mobile:**
Capacitor (Android + iOS) | PWA | Offline-First

**Infrastruktur:**
Vercel | Google Cloud Platform | Supabase Cloud

**Highlight-Box:**
Alles TypeScript. Alles Open Architecture. Alles von einem Gruender in 41 Tagen gebaut — mit KI-Unterstuetzung (Claude, Lovable, GPT-Engineer) und ohne vorherige Programmiererfahrung.

---

## SLIDE 10: DAS GESCHAEFTSMODELL

### Drei Revenue-Streams

**Stream 1: SaaS-Abonnements (B2C + B2B)**

| Tier | Preis | Zielgruppe |
|------|-------|------------|
| Free | 0 EUR | Privatpersonen, Tester |
| Personal Pro | 4,99 EUR/Mo | Reisende, Expats |
| Guide Basic | 29 EUR/Mo | Freiberufliche Stadtfuehrer |
| Guide Pro | 69 EUR/Mo | Professionelle Guides |
| Agency | 99-199 EUR/Mo | Agenturen |
| Enterprise | 499-2.999 EUR/Mo | Hotels, Kliniken, Behoerden |
| Fleet (Kreuzfahrt) | 4.990-19.990 EUR/Mo | Reedereien |

**Stream 2: Art/City/Region Guide SaaS (B2B)**

| Tier | Preis | Zielgruppe |
|------|-------|------------|
| Starter | 49 EUR/Mo | Kleine Museen, Galerien |
| Professional | 199 EUR/Mo | Mittelgrosse Museen, Staedte |
| Enterprise | 599 EUR/Mo | Grosse Museen, Regionen |

**Stream 3: Transaktionsgebuehren**
- Buchungen ueber City/Region Guide: 5-10% Provision
- Partner-Vermittlung: CPA (Cost per Acquisition)

---

## SLIDE 11: WETTBEWERB

### Was kein Wettbewerber kann: Offline-Gruppen-Broadcast

**Vergleichstabelle:**

| Feature | Google Translate | DeepL | Microsoft Translator | iTranslate | **GuideTranslator** |
|---------|:---:|:---:|:---:|:---:|:---:|
| Offline-Uebersetzung | Teilweise | Nein | Teilweise | Teilweise | **Ja (54 Paare)** |
| Live 1→N Broadcast | Nein | Nein | Ja (100) | Nein | **Ja (500+)** |
| BLE-Transport | Nein | Nein | Nein | Nein | **Ja** |
| WiFi-Hotspot-Modus | Nein | Nein | Nein | Nein | **Ja** |
| Kein App-Download noetig | Nein | Nein | Nein | Nein | **Ja (PWA)** |
| Branchenspezifische Apps | Nein | Nein | Nein | Nein | **16 Varianten** |
| KI-Audioguide-System | Nein | Nein | Nein | Nein | **Ja (Art Guide)** |
| E2E-Verschluesselung | Nein | Nein | Nein | Nein | **AES-256-GCM** |

**Der Burggraben:**
Offline-Gruppen-Uebersetzung per Bluetooth + WiFi-Hotspot ist patentfaehig und von keinem Wettbewerber replizierbar ohne grundlegende Architektur-Aenderung.

---

## SLIDE 12: MARKTGROESSE

### TAM / SAM / SOM

**Visuell als konzentrische Kreise:**

**TAM (Total Addressable Market): 65 Mrd USD**
Globaler Uebersetzungsmarkt (2025), davon 8 Mrd maschinelle Uebersetzung. 15% CAGR bis 2030.

**SAM (Serviceable Addressable Market): 4,4 Mrd USD**
Tourismus-Uebersetzung + Event-Interpretation + Behoerden-Kommunikation + Museum-Audioguides

**SOM (Serviceable Obtainable Market): 44 Mio USD**
1% des SAM in 3 Jahren — erreichbar durch:
- DACH-Fokus im ersten Jahr
- Europaeische Expansion im zweiten Jahr
- Globaler Rollout ab Jahr 3

---

## SLIDE 13: DIE ROADMAP

### Von heute bis zur Marktfuehrerschaft

**Q1/2026 (abgeschlossen):**
- 50 Repositories, 1.700+ Commits
- GuideTranslator: 16 App-Varianten, 45 Sprachen, 4-Tier-Architektur
- Art Guide: Visitor App + Portal/CMS
- UG-Gruendung (Maerz 2026)

**Q2/2026:**
- Stripe-Aktivierung → Erste zahlende Kunden
- Product Hunt + Hacker News Launch
- 3 Foerderantraege eingereicht
- Erste Pilotprojekte: Stadtfuehrer Muenchen, Museum-Kooperation

**Q3/2026:**
- City Guide als eigenstaendiges Produkt
- 6 neue Sales Pages fuer Marktsegmente
- Erste Enterprise-Kunden (Behoerden, Kliniken)
- Team-Aufbau: 1-2 Entwickler

**Q4/2026:**
- Region Guide Launch
- White-Label-System fuer Museen und Staedte
- 100+ zahlende Kunden
- Seed-Runde vorbereiten

**2027:**
- Europaeische Expansion
- API-Partner-Programm
- Social Guide (Dating, Networking)
- Seed-Finanzierung

---

## SLIDE 14: DAS TEAM

### Ein Gruender. Null Programmiererfahrung. 41 Tage. 50 Repositories.

**Alexander Deibel**
Gruender & CEO — fintutto UG (haftungsbeschraenkt)

Von der Idee zum Oekosystem in 41 Tagen. Ohne technische Ausbildung. Mit KI-Tools (Claude, Lovable, GPT-Engineer) und dem Willen, ein Problem zu loesen, das Milliarden Menschen betrifft.

**Die Lernkurve:**
- Tag 1: Erstes Repository. JavaScript. Copy-Paste.
- Tag 5: Migration zu TypeScript. 12 Apps an einem Tag.
- Tag 10: Konsolidierung. Architektur-Plan. Monorepo.
- Tag 20: GuideTranslator. BLE-Protokolle. WebAssembly. WASM-ML-Modelle.
- Tag 41: 50 Repos. 25+ deployed Domains. Patentfaehige Technologie.

**Zitat:**
> "Die meisten Startups planen ein Jahr, bevor sie eine App launchen. Wir haben in 41 Tagen 25 gelauncht."

---

## SLIDE 15: FUER INVESTOREN

### Was hier passiert, ist ungewoehnlich.

**Die Fakten:**
- 50 Repositories, 1.719 Commits, 225 MB Code
- 25+ deployed Applikationen auf eigenen Domains
- Patentfaehige 4-Tier-Offline-Architektur
- 16 App-Varianten fuer 7 Marktsegmente
- KI-Audioguide-System mit CMS und White-Label
- Alles in 41 Tagen. Von einem Gruender.

**Was wir suchen:**
- Pre-Seed: 100.000-250.000 EUR
- Verwendung: Team (2 Entwickler), Marketing, Infrastruktur, Patent-Anmeldung
- Timeline: 12 Monate bis Seed-Runde

**Was Investoren bekommen:**
- Ein validiertes Produkt (nicht nur ein Pitch Deck)
- Patentfaehige Technologie als Burggraben
- 7 Marktsegmente = diversifiziertes Risiko
- Ein Gruender, der in 41 Tagen mehr deployed hat als die meisten Startups in einem Jahr

**CTA-Buttons:**
- [Pitch Deck herunterladen]
- [Kontakt aufnehmen: alexander@fintutto.world]

---

## SLIDE 16: CTA / FOOTER

### Bereit, die Sprachbarriere zu durchbrechen?

**3 Optionen:**

**Fuer Privatpersonen:**
Kostenlos starten — 45 Sprachen, Offline-Modus, kein Account noetig.
→ [App oeffnen: translate.fintutto.world]

**Fuer Unternehmen:**
Demo anfragen — Enterprise-Loesungen fuer Hotels, Kliniken, Behoerden, Events.
→ [Demo anfragen: enterprise@fintutto.world]

**Fuer Museen & Staedte:**
Art Guide testen — KI-Audioguides, CMS, White-Label.
→ [Art Guide Portal: portal.artguide.fintutto.world]

---

**fintutto UG (haftungsbeschraenkt)**
Alexander Deibel — Gruender & CEO
Deutschland

[Impressum] [Datenschutz] [Kontakt] [GitHub]

---

## DESIGN-HINWEISE FUER GAMMA

### Farben
- **Primaer:** #0369a1 (Sky-700) bis #0ea5e9 (Sky-500) — Gradient
- **Akzent:** #10b981 (Emerald-500) fuer CTAs
- **Hintergrund:** Dunkel (#0f172a bis #1e293b) oder Weiss
- **Text:** Weiss auf dunklem Hintergrund, #1e293b auf hellem

### Schriften
- Headlines: Inter Bold / Semi-Bold
- Body: Inter Regular
- Monospace (fuer Architektur-Diagramme): JetBrains Mono

### Bildsprache
- Fintutto-Logo als Hintergrund-Wasserzeichen (65% Opacity)
- Screenshots der Apps (Consumer, Listener, Art Guide Portal)
- Architektur-Diagramme (4-Tier-Kaskade)
- Vergleichstabellen (vs. Wettbewerb)
- Konzentrische Kreise fuer TAM/SAM/SOM

### Gamma-spezifisch
- Jeder Slide = 1 Gamma-Card
- Hero-Slide mit voller Breite und grossem Hintergrundbild
- Feature-Grids als Gamma-Card-Layouts (2x3 oder 3x2)
- Pricing-Tabellen als Gamma-Columns
- Stats als grosse Zahlen mit Labels darunter
- Pull-Quotes in eigenen Highlight-Boxen
