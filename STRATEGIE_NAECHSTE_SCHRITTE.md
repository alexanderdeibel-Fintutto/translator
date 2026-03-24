# FINTUTTO - Strategische Roadmap: Wie geht es weiter?

*Stand: 11. Maerz 2026 | Ausgangslage: 1 Gruender, 0 EUR Budget, 1 Tester (Ulrich), Notar morgen*

---

## TEIL 1: DIE BRUTALE EHRLICHKEIT ZUERST

### Was du hast
- 50 Repos, 1.719 Commits, 25+ deployed Apps
- GuideTranslator: 80-90% fertig, patentfaehige Architektur
- Immobilien-Oekosystem: 30-40% fertig (viel UI, wenig Backend-Logik)
- Ulrich testet langsam Listener/Enterprise
- Morgen: UG-Gruendung
- 3 Foerderantraege gehen raus
- Gruenderzuschuss MV (1.800 EUR/Monat) kommt sicher

### Was du NICHT hast
- Geld (0 EUR bis Foerderung kommt → mind. 4-8 Wochen)
- Team (1 Tester, kein Entwickler, kein Marketing)
- Zahlende Kunden (Stripe nicht mal aktiviert!)
- Validierte Nachfrage (niemand hat noch bezahlt)
- Zeit (du kannst nicht 50 Apps gleichzeitig fertig machen)

### Die haerteste Wahrheit
Du hast 50 Baustellen und 0 fertige Produkte, die Geld verdienen. Das muss sich SOFORT aendern. Nicht naechste Woche. Heute.

---

## TEIL 2: DIE PRIORISIERUNG - WAS ZUERST?

### Bewertungsmatrix: Welche App bringt am schnellsten Geld?

| App | Fertiggrad | Time-to-Revenue | Marktgroesse | Wettbewerb | **SCORE** |
|-----|-----------|-----------------|-------------|------------|-----------|
| **GuideTranslator** | 85% | 1-2 Tage (!) | $4.4 Mrd | Gering (Offline USP) | **10/10** |
| **BescheidBoxer** | 30% | 2-4 Wochen | Riesig (DE) | Mittel | 7/10 |
| **Portal (Rechner)** | 60% | 2-3 Wochen | Gross (SEO) | Hoch | 6/10 |
| **Vermietify** | 3% | 3-6 Monate | Gross | Sehr hoch | 3/10 |
| **HausmeisterPro** | 40% | 2-3 Monate | Nische | Gering | 4/10 |
| **Ablesung** | 50% | 1-2 Monate | Mittel | Mittel | 5/10 |
| **Finance Coach** | 30% | 3-6 Monate | Riesig | Sehr hoch | 2/10 |
| **Zimmerpflanze** | 20% | Hobby | Klein | Hoch | 1/10 |
| **LuggageX** | 20% | Hobby | Klein | Hoch | 1/10 |
| **Personaltrainer** | 10% | Hobby | Mittel | Sehr hoch | 1/10 |
| **LernApp** | 5% | Monate | Gross | Sehr hoch | 1/10 |

### Die klare Antwort: GUIDETRANSLATOR ZUERST. ALLES ANDERE WARTEN.

**Warum?**
1. **Stripe-Setup = 1 Tag Arbeit.** Danach koennen Leute bezahlen. Literally: ein Script ausfuehren + Price IDs eintragen.
2. **Die App funktioniert bereits.** 45 Sprachen, alle 4 Transport-Tiers, Live-Sessions, Offline. Das ist kein MVP - das ist ein Produkt.
3. **Kein Wettbewerber hat Offline-Gruppen-Broadcast.** Das ist dein Burggraben.
4. **B2C UND B2B moeglich.** Free Tier fuer Nutzer-Wachstum, Enterprise fuer Revenue.
5. **Skaliert ohne dich.** Einmal deployed, laeuft es. Keine manuelle Arbeit pro Kunde.

---

## TEIL 3: DER 90-TAGE-PLAN

### PHASE 1: "GELD VERDIENEN" (Tag 1-14, also JETZT bis 25. Maerz)

**Ziel: Erster zahlender Kunde fuer GuideTranslator**

| Tag | Aktion | Aufwand |
|-----|--------|---------|
| **1** (morgen nach Notar) | Stripe-Account einrichten (geht mit UG sofort) | 2h |
| **1** | `npx tsx scripts/stripe-setup.ts` ausfuehren → 11 Produkte in Stripe erstellen | 30 min |
| **1** | Price IDs in `src/lib/tiers.ts` eintragen (11 TODOs) | 1h |
| **1** | Stripe Webhook Secret in Supabase Edge Functions setzen | 30 min |
| **1** | Testen: Free → Checkout → Payment → Upgrade-Flow | 2h |
| **2** | Landing Page finalisieren (apps/landing): Pricing-Tabelle, CTA-Buttons | 4h |
| **2** | Impressum + Datenschutz (Pflicht fuer DE!) auf Landing Page | 2h |
| **3** | Product Hunt Launch vorbereiten (Screenshots, GIF, Beschreibung) | 4h |
| **4** | Product Hunt Launch ("GuideTranslator - Translation that works without internet") | 1h |
| **4** | Hacker News "Show HN" Post | 30 min |
| **5-7** | Reddit Posts: r/digitalnomad, r/travel, r/tourguides, r/languagelearning, r/startups | 2h |
| **5-7** | Twitter/X: Demo-Video (Bildschirmaufnahme, 60 Sekunden, Offline-Demo) | 3h |
| **8-14** | Auf Feedback reagieren, Bugs fixen, erste Nutzer onboarden | ongoing |

**Budget: 0 EUR. Nur deine Zeit.**

**Ulrich-Aufgabe waehrend Phase 1:**
- Enterprise App komplett durchtesten (alle Features, alle Tiers)
- Bug-Liste fuehren (einfaches Google Doc reicht)
- 5 Reiseleiter in seinem Umfeld fragen, ob sie testen wollen

### PHASE 2: "TRAKTION ZEIGEN" (Tag 15-45, bis Ende April)

**Ziel: 100 Free-Nutzer, 5-10 zahlende Kunden, Foerderung eingereicht**

| Woche | Aktion | Ziel |
|-------|--------|------|
| **3** | Kaltakquise: 20 Stadtfuehrung-Anbieter in DE anschreiben (GetYourGuide-Guides) | 3-5 Antworten |
| **3** | App Store Listing vorbereiten (Google Play zuerst, kostet 25 USD einmalig) | Android-App live |
| **4** | SEO-Landingpages: "Uebersetzer fuer Reiseleiter", "Offline-Uebersetzer Gruppe" | Organischer Traffic |
| **4** | Foerderantraege nachfassen, Gruenderzuschuss MV einreichen | Geld in Pipeline |
| **5** | Partnership-Anfragen: 3 Tourismusbueros in MV anschreiben | Lokale Referenz |
| **5** | Erste Case Study schreiben (auch wenn es Ulrich ist) | Social Proof |
| **6** | iOS App einreichen (Apple Developer Account: 99 EUR/Jahr) | iOS live |

**Budget: ~125 EUR (25 USD Google Play + 99 EUR Apple Developer)**

**Was du NICHT tun solltest in Phase 2:**
- Keine neuen Features bauen (ausser Kunden es explizit brauchen)
- Keine anderen Apps anfassen (kein Vermietify, kein BescheidBoxer)
- Nicht an der Architektur rumbasteln
- Kein Perfektionismus (die App ist gut genug!)

### PHASE 3: "SKALIERUNG VORBEREITEN" (Tag 46-90, Mai-Juni)

**Ziel: Recurring Revenue > 500 EUR/Monat, zweite App starten**

| Woche | Aktion | Ziel |
|-------|--------|------|
| **7-8** | GuideTranslator: White-Label Feature fuer Agenturen | Upsell-Moeglichkeit |
| **7-8** | Erste Messe/Event besuchen (ITB nachfolger, Tourismus-Messen in MV) | Kontakte |
| **9-10** | **ZWEITE APP STARTEN: BescheidBoxer** (siehe unten warum) | MVP in 2 Wochen |
| **9-10** | BescheidBoxer: Stripe-Integration (copy von Translator) | Zweite Einnahmequelle |
| **11-12** | Foerdergelder nutzen: Ersten Freelancer fuer 2 Wochen engagieren | Testing + QA |
| **11-12** | GuideTranslator: API-Zugang fuer Enterprise-Kunden | Hoeherer ARPU |

**Budget: Gruenderzuschuss sollte da sein (~1.800 EUR/Monat)**

---

## TEIL 4: WARUM BESCHEIDBOXER ALS ZWEITES?

1. **Viralpotenzial ist enorm.** Jeder in DE bekommt Behoerdenbriefe. Jeder hasst sie. "Mach ein Foto vom Brief → bekommst einfache Erklaerung" ist ein Produkt, das sich selbst erklaert.
2. **Kein Enterprise-Sales noetig.** Direkt B2C. Download → Nutzen → Zahlen.
3. **Politisch relevant.** Buergergeld, Migration, Digitalisierung - das Thema ist heiss. Presse wird das aufgreifen.
4. **Technisch simpel.** OCR + LLM-API + nettes UI. Kannst du in 2 Wochen zum MVP bringen.
5. **Synergie mit Translator.** Gleiche Zielgruppe (Menschen mit Sprachbarriere), gleiche Infrastruktur (Supabase, Stripe).

---

## TEIL 5: FOERDERUNGEN, PREISE & PUBLICITY

### A) Foerderungen (nach Beurkundung sofort beantragen)

| Foerderung | Betrag | Zeitraum | Chance | Aktion |
|------------|--------|----------|--------|--------|
| **Gruenderzuschuss MV** | 1.800 EUR/Monat | 6 Monate (+6) | 95% | Sofort nach Beurkundung beim Jobcenter/Agentur |
| **EXIST-Gruenderstipendium** | bis 3.000 EUR/Monat + Sachkosten | 12 Monate | 40% | Ueber Uni/Hochschule in MV beantragen, braucht Mentor |
| **Innovationsgutschein MV** | bis 15.000 EUR | Einmalig | 60% | Fuer externe Dienstleistungen (Design, Testing) |
| **BMWK INVEST** | 20% Zuschuss fuer Business Angels | Bei Investment | 70% | Erst relevant wenn Angel-Investor kommt |
| **go-digital** | bis 16.500 EUR | Fuer Digitalisierung | 50% | Autorisiertes Beratungsunternehmen noetig |
| **KfW-Gruenderkredit** | bis 125.000 EUR | Kredit | 60% | Ueber Hausbank, nach 3 Monaten Betrieb |
| **Mikromezzaninfonds MV** | bis 50.000 EUR | Beteiligung | 50% | Ueber MBMV (Mittelstaendische Beteiligungsgesellschaft) |

### B) Preise & Wettbewerbe (kostenlos, hohe Publicity)

| Preis/Wettbewerb | Preisgeld | Deadline | Relevanz | Warum bewerben? |
|------------------|-----------|----------|----------|-----------------|
| **Gruender.de Award** | Publicity | Laufend | Hoch | Kostenlos, grosse Reichweite |
| **German Startup Awards** | Titel + Netzwerk | Jaehrlich (Herbst) | Hoch | Kategorie "Newcomer" |
| **Digitale Innovationen (BMWK)** | bis 10.000 EUR | Jaehrlich | Sehr hoch | GuideTranslator = digitale Innovation |
| **PropTech Innovation Award** | Publicity + Netzwerk | Jaehrlich | Mittel | Fuer Vermietify (spaeter) |
| **AI Startup Award (appliedAI)** | Netzwerk + Mentoring | Jaehrlich | Hoch | Offline-KI ist beeindruckend |
| **Gruenderwettbewerb MV** | bis 10.000 EUR | Regional, jaehrlich | Sehr hoch | Lokaler Vorteil, weniger Konkurrenz! |
| **CEBIT Innovation Award** | (Nachfolger) Digital X | Jaehrlich | Mittel | Grosse Buehne |
| **European Startup Prize** | bis 100.000 EUR | EU-weit | 20% | Long shot, aber worth it |
| **Google for Startups** | Cloud Credits + Mentoring | Laufend | Hoch | Bis zu 100.000 USD Cloud Credits! |
| **Microsoft for Startups** | Azure Credits | Laufend | Hoch | Bis zu 150.000 USD Azure Credits |
| **AWS Activate** | AWS Credits | Laufend | Hoch | Bis zu 100.000 USD AWS Credits |
| **Supabase Startup Program** | Credits + Support | Laufend | Sehr hoch | Du nutzt schon Supabase! |
| **Vercel Startup Program** | Credits | Laufend | Hoch | Du deployst schon auf Vercel! |
| **Stripe Atlas / Startup** | Stripe Credits | Laufend | Hoch | Du nutzt schon Stripe! |

### C) Publicity-Aktionen (0 EUR Budget)

| Aktion | Aufwand | Erwarteter Effekt | Wann |
|--------|---------|-------------------|------|
| **Product Hunt Launch** | 1 Tag Vorbereitung | 500-2.000 Besucher an Tag 1 | Woche 1 |
| **Hacker News "Show HN"** | 30 Min | 200-5.000 Besucher (wenn es ankommt) | Woche 1 |
| **LinkedIn-Post "41 Tage, 50 Repos"** | 2h | Viral-Potenzial in Tech-Community | Woche 1 |
| **YouTube Demo-Video** | 4h | Langfristiger SEO-Traffic | Woche 2 |
| **Lokale Presse MV** | 1h (Email an Redaktionen) | Lokale Bekanntheit, gut fuer Foerderung | Woche 2 |
| **Podcast-Pitches** | 2h (10 Podcasts anschreiben) | 1-2 Einladungen | Woche 3 |
| **GitHub "Awesome" Listen** | 1h | Dauerhafter Backlink + Traffic | Woche 3 |
| **Dev.to / Medium Artikel** | 4h ("Wie ich in 41 Tagen 25 Apps gebaut habe") | Tech-Community Reichweite | Woche 2 |
| **Twitter/X Thread** | 1h | Potentiell viral | Woche 1 |

**Der beste Publicity-Angle:** "Solo-Gruender ohne Tech-Hintergrund baut in 41 Tagen 25 Apps mit KI-Tools" - das ist eine Geschichte, die Medien LIEBEN.

---

## TEIL 6: WAS MIT DEN ANDEREN APPS PASSIEREN SOLL

### JETZT NICHT ANFASSEN (Parking Lot)

| App | Grund | Wann wieder anfassen? |
|-----|-------|-----------------------|
| **Vermietify** | 3% fertig, riesiger Scope, starke Konkurrenz (Vermietet.de, Immoware24) | Fruehestens Q3 2026, wenn Team + Geld da |
| **HausmeisterPro** | Nischenprodukt, braucht Vermietify als Plattform | Nach Vermietify |
| **Mieter-App** | Braucht Vermietify als Gegenstueck | Nach Vermietify |
| **Finance Coach** | Gigantischer Markt, aber auch gigantische Konkurrenz (Lexoffice, sevDesk) | Nicht in den naechsten 12 Monaten |
| **LuggageX** | Hobby-Projekt, kein klarer Markt | Archivieren |
| **Personaltrainer** | Uebervoller Markt (MyFitnessPal, Freeletics) | Archivieren |
| **Zimmerpflanze** | Nett, aber kein Business | Archivieren |
| **LernApp** | Duolingo dominiert, kein Differenzierungsmerkmal | Archivieren |
| **Commander** | Asana, Notion, Monday.com - keine Chance als Solo-Gruender | Archivieren |

### AKTIV HALTEN (aber nicht priorisieren)

| App | Grund | Minimaler Aufwand |
|-----|-------|-------------------|
| **Portal (Rechner)** | SEO-Traffic-Maschine, Rechner funktionieren | 1x/Monat: SEO-Texte schreiben |
| **Ablesung** | Funktioniert, nischig, wenig Konkurrenz | Ulrich kann testen wenn GT fertig |
| **Admin** | Brauchst du selbst fuer User-Management | Nur wenn noetig erweitern |
| **Cloud/Hub** | Zentrale Uebersicht, Visitenkarte | 1x aktualisieren, dann lassen |

---

## TEIL 7: BUDGET-PLAN (realistisch)

### Maerz-April (0 EUR bis Gruenderzuschuss kommt)

| Posten | Kosten | Notwendig? |
|--------|--------|------------|
| UG-Gruendung (Notar) | ~300-500 EUR | JA (morgen) |
| Handelsregister | ~150 EUR | JA (automatisch) |
| Google Play Developer | 25 USD (~23 EUR) | JA (Android-App) |
| Stripe Account | 0 EUR | JA (Zahlungen empfangen) |
| Domains (fintutto.cloud etc.) | Bereits bezahlt? | - |
| **TOTAL** | **~475-675 EUR** | |

### Mai-Juni (mit Gruenderzuschuss ~1.800 EUR/Monat)

| Posten | Kosten/Monat | Prioritaet |
|--------|-------------|------------|
| Apple Developer Account | 99 EUR/Jahr = 8 EUR/Monat | Hoch |
| Supabase Pro (wenn Free Tier nicht reicht) | 25 USD/Monat | Mittel |
| Vercel Pro (wenn noetig) | 20 USD/Monat | Niedrig |
| Google Cloud (Translation API) | Pay-per-use, ~5-20 EUR/Monat | Hoch |
| Domain-Verlaengerungen | ~10-20 EUR/Monat | Hoch |
| Freelancer fuer Testing (Fiverr) | 200-400 EUR einmalig | Mittel |
| Facebook/Instagram Ads (Test) | 100 EUR/Monat | Ab Monat 2 |
| **TOTAL** | **~200-500 EUR/Monat** | |

**Verbleibend fuer dich: ~1.300-1.600 EUR/Monat**

---

## TEIL 8: DAS TEAM-PROBLEM LOESEN (OHNE GELD)

### Option 1: Equity-basierte Mitgruender suchen
- **Wo:** Gründerplattformen (founderio.com, co-founder.de)
- **Wen:** Einen technischen Co-Founder der GuideTranslator weiterentwickelt
- **Angebot:** 10-20% Equity fuer 6 Monate Vollzeit
- **Risiko:** Schwer zu finden, Equity verwässert

### Option 2: Studentische Hilfskraefte
- **Wo:** Uni Rostock, Hochschule Wismar, Uni Greifswald
- **Wen:** Informatik-/BWL-Studenten
- **Angebot:** Werkstudent (12-15 EUR/Stunde, 10h/Woche = 480-600 EUR/Monat)
- **Wann:** Sobald Gruenderzuschuss laeuft
- **Aufgabe:** Testing, Social Media, Kundensupport

### Option 3: Freelancer fuer spezifische Tasks
- **Wo:** Fiverr, Upwork
- **Was:** UI-Review (50-100 EUR), App Store Screenshots (50 EUR), Uebersetzungen (30 EUR)
- **Vorteil:** Kein langfristiges Commitment

### Option 4: Open Source Community
- **GuideTranslator** teilweise Open Source machen (z.B. die Offline-Engine)
- Zieht Contributor an, baut Reputation, und der proprietaere Teil bleibt dein Business
- Risiko: Kontrollverlust, aber Upside ist riesig

### Option 5: Ulrich effektiver einsetzen
- Klare Test-Checklisten erstellen (nicht "teste mal", sondern "oeffne App, klicke X, erwarte Y")
- Wochenziel definieren: "Diese Woche: 20 Testfaelle Consumer App"
- Ergebnisse in Google Sheet dokumentieren

---

## TEIL 9: ZUSAMMENFASSUNG - DEIN FAHRPLAN

### Diese Woche (11.-17. Maerz)
- [ ] Morgen: Notar-Termin (UG gruenden)
- [ ] Morgen Nachmittag: Stripe-Account einrichten
- [ ] Morgen Abend: Stripe-Produkte erstellen + Price IDs eintragen
- [ ] Mittwoch: Payment-Flow testen (Free → Paid → Upgrade)
- [ ] Donnerstag: Impressum + Datenschutz auf Landing Page
- [ ] Freitag: Product Hunt + Hacker News Launch vorbereiten
- [ ] Wochenende: Launch!

### Naechste Woche (18.-24. Maerz)
- [ ] Product Hunt Launch (Dienstag oder Mittwoch, beste Tage)
- [ ] Hacker News "Show HN" Post
- [ ] LinkedIn + Twitter/X Posts ("41 Tage, 50 Repos")
- [ ] Dev.to / Medium Artikel schreiben
- [ ] 10 Stadtfuehrung-Anbieter kalt anschreiben
- [ ] Foerderantraege versenden (3 Stueck)
- [ ] Gruenderzuschuss MV beantragen

### Maerz/April
- [ ] Google Play Store: Android App veroeffentlichen
- [ ] Lokale Presse in MV kontaktieren
- [ ] Tourismusbueros in MV anschreiben
- [ ] Erste Nutzer-Feedbacks einarbeiten
- [ ] Apple Developer Account + iOS App einreichen

### Mai/Juni
- [ ] BescheidBoxer MVP bauen (2 Wochen)
- [ ] Erste Messe/Event besuchen
- [ ] Werkstudent einstellen (wenn Gruenderzuschuss laeuft)
- [ ] Startup-Wettbewerbe einreichen (mind. 3)
- [ ] Google/Microsoft/AWS Startup Programs beantragen

---

## TEIL 10: DAS EINE, WAS DU DIR MERKEN MUSST

**FOKUS.**

Du hast bewiesen, dass du unglaublich schnell bauen kannst. Das ist deine Staerke. Aber jetzt ist die Phase, wo Bauen allein nicht mehr reicht. Jetzt musst du VERKAUFEN.

Ein Produkt, das Geld verdient, ist mehr wert als 50, die es nicht tun.

GuideTranslator ist dein Ticket. Es funktioniert. Es ist einzigartig. Es braucht nur noch einen Stripe-Account und einen Launch.

**Alles andere kann warten. Dieses eine Ding nicht.**

---

*Dokument erstellt am 11. Maerz 2026 | Wird fortlaufend aktualisiert*
