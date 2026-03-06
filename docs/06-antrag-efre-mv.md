# EFRE Mecklenburg-Vorpommern — Foerderantrag FuE-/KMU-Innovation

**Programm:** EFRE MV 2021-2027, Prioritaet 1: Innovation und intelligenter Wandel
**Antragsteller:** Fintutto UG (i.G.) / Alexander Deibel
**Beantragter Zuschuss:** 150.000 EUR (bei 60% Foerderquote = 250.000 EUR Gesamtkosten)
**Bewilligungsbehoerde:** TBI Technologie-Beratungs-Institut GmbH, Schwerin
**Beratung:** TBI GmbH (www.tbi-mv.de) + LFI MV (www.lfi-mv.de)

> **HINWEIS:** TBI ist die Bewilligungsbehoerde (nicht LFI). LFI ist uebergeordnet.
> TBI hat Geschaeftsstellen in Schwerin, Rostock und Neubrandenburg.
> Antragsformulare: Download auf www.tbi-mv.de
>
> **ZIM hat Vorrang:** Die EFRE-Richtlinie legt fest, dass das Zentrale
> Innovationsprogramm Mittelstand (ZIM) vorrangig genutzt werden soll.
> ZIM foerdert bis 690.000 EUR bei 25-60% Foerderquote.
> TBI wird bei Antragstellung pruefen, ob ZIM in Frage kommt.
> → Empfehlung: **Parallel ZIM-Antrag pruefen** (www.zim.de)

---

## 1. VORHABENSBESCHREIBUNG

### 1.1 Titel des Vorhabens

**"Entwicklung einer offlinefaehigen KI-Echtzeituebersetzungsplattform mit 4-Tier-Transportarchitektur fuer den europaeischen Tourismus- und Integrationsmarkt"**

### 1.2 Kurzfassung

Das Vorhaben zielt auf die Weiterentwicklung und Marktreife des **Fintutto Translator** — einer Progressive Web App (PWA), die Echtzeit-Sprachuebersetzung in 45 Sprachen ermoeglicht, auch **vollstaendig ohne Internetverbindung**. Die Innovation liegt in einer weltweit einzigartigen 4-Tier-Transportarchitektur (Cloud → WiFi-Hotspot → Bluetooth Low Energy → On-Device Machine Learning), die automatisch zwischen Netzwerkstufen wechselt.

Das Produkt adressiert eine erhebliche Marktluecke: Bestehende Uebersetzungsloesungen (Google Translate, DeepL, Microsoft) versagen an genau den Orten, wo Uebersetzung am meisten gebraucht wird — touristische Sehenswuerdigkeiten ohne Mobilfunknetz, Behoerden mit gesperrten Netzwerken, Fluechtlingsunterkuenfte.

### 1.3 Ausgangssituation

- Funktionsfaehiger Prototyp (MVP) in Version 3.1, 13.296 Zeilen Production Code
- 87 automatisierte Tests, 100% pass rate
- Google Play Store Launch vorbereitet
- 7 Kernprodukte: Text-Uebersetzer, Live-Session, Gespraechsmodus, Kamera-OCR, Phrasebook, Offline-Engine, BLE-Transport
- Gruender: Alexander Deibel, Sitz in Mecklenburg-Vorpommern
- Bestehende Branchenexpertise durch AI Tour Guide UG (Mitgruender, Tourismus-Tech seit 2024)

### 1.4 Innovationsgehalt

| Innovation | Neuheitsgrad | Stand der Technik |
|-----------|-------------|-------------------|
| BLE GATT Translation Protocol | **Weltneuheit** | Kein Wettbewerber bietet Bluetooth-basierte Gruppen-Uebersetzung |
| 4-Tier Auto-Fallback | **Weltneuheit** | Automatische Netzwerk-Degradierung existiert nicht im Uebersetzungsmarkt |
| Embedded Relay Server | **Neuartig** | WebSocket-Server als native App-Komponente fuer lokale Netze |
| Hybrid ML Pipeline | **Neuartig** | Nahtloser Wechsel Cloud ↔ On-Device WASM-Modelle |
| 1→N Broadcast + Offline | **Weltneuheit** | Kein Produkt kombiniert Broadcasting mit vollstaendigem Offline-Modus |

### 1.5 Bezug zu MV

- **Firmensitz:** Mecklenburg-Vorpommern (Coworking-Space in Rostock/Schwerin)
- **Arbeitsplaetze:** Bis zu 5 neue Arbeitsplaetze in MV innerhalb von 12 Monaten (CTO, Sales, AI Engineer, Mobile Dev, UX Designer — teils remote mit MV-Anbindung)
- **Regionale Wertschoepfung:** Nutzung regionaler Dienstleister (Steuerberatung, Rechtsberatung, TBI-Beratung)
- **Tourismus-Bezug:** MV als Tourismusland profitiert direkt — Guide-Translation fuer Ruegen, Usedom, Wismar, Stralsund (UNESCO-Welterbe)
- **Pilotprojekte:** Geplante B2B-Piloten mit Tourismus-Unternehmen in MV
- **AI Tour Guide UG** (Rostock) als erster Pilot-Partner und Referenzkunde

---

## 2. ARBEITSPLAN

### 2.1 Arbeitspakete

**AP 1: KI-Modelloptimierung (Monat 1-6)**
- Finetuning der Offline-Uebersetzungsmodelle (Opus-MT) fuer tourismus- und behoerdenspezifische Fachsprache
- Integration zusaetzlicher Migrationssprachen (Somali, Amharisch, Bengalisch)
- Optimierung der Whisper-STT-Modelle fuer Akzenterkennung
- **Ergebnis:** Verbesserte Uebersetzungsqualitaet, 10+ neue Sprachpaare offline

**AP 2: BLE-Transport-Protokoll Erweiterung (Monat 2-8)**
- Erweiterung des BLE GATT Protocols auf 10+ gleichzeitige Verbindungen
- iOS-Optimierung (CoreBluetooth Framework)
- Reichweiten- und Zuverlaessigkeitstests unter realen Bedingungen
- **Ergebnis:** Produktionsreifes BLE-Protokoll, patentfaehige Dokumentation

**AP 3: Enterprise-Funktionen (Monat 4-10)**
- White-Label-Modul fuer B2B-Kunden
- Admin-Dashboard (Multi-Guide-Management, Analytics)
- API-Schnittstelle fuer Drittanbieter-Integration
- SSO/SAML-Integration fuer Enterprise-Kunden
- **Ergebnis:** Enterprise-ready Produkt mit API

**AP 4: Pilotprojekte & Validierung (Monat 6-12)**
- 10 Pilotprojekte mit Tourismus-Unternehmen in MV
- 5 Pilotprojekte mit Behoerden (Auslaenderbehoerden)
- Nutzerfeedback-Zyklen und iterative Verbesserung
- **Ergebnis:** Validierter Product-Market Fit, 50+ B2B-Kunden

**AP 5: Patentanmeldung & IP-Schutz (Monat 3-8)**
- Patentrecherche und -anmeldung fuer BLE GATT Translation Protocol
- EU-Markenanmeldung "Fintutto Translator"
- DSGVO-Compliance-Audit
- **Ergebnis:** IP geschuetzt, Marke eingetragen

### 2.2 Zeitplan (Gantt)

```
                    M1  M2  M3  M4  M5  M6  M7  M8  M9  M10 M11 M12
AP 1: KI-Modelle    ████████████████████████
AP 2: BLE-Protokoll     ██████████████████████████████
AP 3: Enterprise                ████████████████████████████
AP 4: Pilotprojekte                         ████████████████████████
AP 5: IP-Schutz              ██████████████████████████
```

---

## 3. KOSTENPLAN (Zuwendungsfaehige Kosten)

### 3.1 Uebersicht

| Kostenart | Betrag | Foerderquote | Zuschuss |
|-----------|--------|-------------|---------|
| **Personalkosten** | 150.000 EUR | 60%* | 90.000 EUR |
| **Sachkosten** | 50.000 EUR | 60%* | 30.000 EUR |
| **Fremdleistungen** | 37.500 EUR | 60%* | 22.500 EUR |
| **Gemeinkosten (15% auf Personal)** | 12.500 EUR | 60%* | 7.500 EUR |
| **TOTAL** | **250.000 EUR** | **60%*** | **150.000 EUR** |

> *Foerderquote: Kleine Unternehmen erhalten bis 60% bei experimenteller
> Entwicklung, bis 80% bei industrieller Forschung. In Verbundprojekten
> mit Forschungseinrichtungen kommen zusaetzlich +15% Verbundbonus.
> Forschungseinrichtungen koennen bis zu 100% erhalten.
> Max. Stundensaetze: 143 produktive Stunden/Monat bei Vollzeit.

### 3.2 Personalkosten (Detail)

| Position | Monate | Brutto/Monat | AG-Kosten (23%) | Gesamt |
|----------|--------|-------------|-----------------|--------|
| Gruender/Projektleiter (50% FuE-Anteil) | 12 | 2.250 | 518 | 33.216 EUR |
| CTO / Lead Developer (80% FuE) | 10 | 6.400 | 1.472 | 78.720 EUR |
| AI/ML Engineer (100% FuE) | 5 | 7.000 | 1.610 | 43.050 EUR |
| **SUMME Personal** | | | | **~150.000 EUR** |

> **Hinweis:** Personalkosten beziehen sich ausschliesslich auf den FuE-Anteil der Taetigkeit. Nicht-FuE-Taetigkeiten (Vertrieb, Marketing, Administration) sind nicht enthalten.

### 3.3 Sachkosten (Detail)

| Position | Betrag | Erlaeuterung |
|----------|--------|-------------|
| Google Cloud APIs (Translation, TTS, STT, Vision) | 15.000 EUR | Variable API-Kosten fuer Entwicklung und Tests |
| Cloud-Infrastruktur (Supabase, Vercel) | 5.000 EUR | Hosting, Datenbank, Realtime-Services |
| Testgeraete (Smartphones, Tablets, BLE-Hardware) | 12.000 EUR | iPhone, Android-Geraete, iPads, GL.iNet Router |
| Entwickler-Hardware (MacBooks) | 10.500 EUR | 3x MacBook Pro M4 fuer Dev-Team |
| Software-Lizenzen (Entwicklung) | 4.500 EUR | GitHub, Sentry, Figma, Testinfrastruktur |
| HPC-Zugang (ML-Training) | 3.000 EUR | GPU-Instanzen fuer Modell-Finetuning |
| **SUMME Sachkosten** | **50.000 EUR** | |

### 3.4 Fremdleistungen (Detail)

| Position | Betrag | Erlaeuterung |
|----------|--------|-------------|
| Patentanwalt (BLE Protocol) | 15.000 EUR | Recherche + Anmeldung + Verfolgung |
| Rechtsberatung (DSGVO, AGB, IP) | 7.500 EUR | Datenschutz-Audit, Nutzungsbedingungen |
| UX-Research & Usability-Tests | 10.000 EUR | Externe Nutzertests, Barrierefreiheitspruefung |
| Lektoren/Uebersetzer (App-Lokalisierung) | 5.000 EUR | Professionelle Uebersetzung UI-Texte |
| **SUMME Fremdleistungen** | **37.500 EUR** | |

---

## 4. FINANZIERUNG (Gesamtvorhaben)

| Finanzierungsquelle | Betrag | Anteil |
|--------------------|--------|--------|
| **EFRE-Zuschuss (beantragt)** | 150.000 EUR | 60% |
| **Eigenmittel / Eigenleistung** | 50.000 EUR | 20% |
| **Weitere Foerderung (FFplus, EIT Digital)** | 50.000 EUR | 20% |
| **TOTAL** | **250.000 EUR** | **100%** |

> **Hinweis:** Der Eigenanteil wird durch Eigenleistung des Gruenders und geplante weitere Foerdermittel (FFplus Generative AI, EIT Digital SPIN:Rise) abgedeckt. Eine Doppelfoerderung gleicher Kostenpositionen wird ausgeschlossen.

---

## 5. MARKTPOTENZIAL UND VERWERTUNG

### 5.1 Zielmaerkte

| Segment | Marktgroesse (DACH) | Erreichbare Kunden (3 Jahre) |
|---------|--------------------|-----------------------------|
| Tour-Guides & Reiseagenturen | 15.000 Anbieter | 500-1.000 |
| Behoerden (Auslaender-/Sozialbehoerden) | 5.000+ Standorte | 200-500 |
| Konferenzen & Events | 30.000/Jahr (int.) | 100-400 |
| Bildungseinrichtungen | 40.000 Schulen (DE) | 200-500 |
| Kreuzfahrt & Hotels | 2.000 Schiffe (EU) | 10-50 |
| **TOTAL** | | **1.000-2.500 B2B-Kunden** |

### 5.2 Umsatzprognose

| Jahr | B2C (Abo) | B2B (SaaS) | Events | Enterprise | **Total ARR** |
|------|-----------|-----------|--------|-----------|-------------|
| 1 | 20K EUR | 100K EUR | 20K EUR | 10K EUR | **150K EUR** |
| 2 | 200K EUR | 1.200K EUR | 500K EUR | 600K EUR | **2.500K EUR** |
| 3 | 700K EUR | 4.200K EUR | 1.800K EUR | 5.300K EUR | **12.000K EUR** |

### 5.3 Arbeitsplatzeffekte in MV

| Zeitpunkt | Neue Arbeitsplaetze in MV | Rollen |
|----------|--------------------------|--------|
| Monat 3 | +1 | CTO (Remote mit MV-Anbindung) |
| Monat 4 | +1 | Sales Manager |
| Monat 6 | +1 | AI/ML Engineer |
| Monat 9 | +1 | UX/UI Designer |
| Monat 12 | +1 | Customer Success |
| **TOTAL nach 12 Monaten** | **+5** | |

---

## 6. RISIKEN UND GEGENMASSNAHMEN

| Risiko | Eintrittswahrscheinlichkeit | Auswirkung | Gegenmassnahme |
|--------|---------------------------|-----------|---------------|
| Fachkraefte nicht verfuegbar | Mittel | Hoch | Remote-Stellen, Freelancer-Alternative, MV-Gehaltsbonus |
| Technologie-Risiko BLE | Niedrig | Mittel | Prototyp bereits funktionsfaehig, iterative Verbesserung |
| Marktakzeptanz langsam | Mittel | Mittel | Freemium-Modell senkt Einstiegshuerde, B2B-Piloten validieren |
| Wettbewerber (Google etc.) | Niedrig | Hoch | 12-18 Monate Vorsprung, Offline+BLE als Moat |
| DSGVO-Compliance | Niedrig | Hoch | Externer Datenschutzbeauftragter, EU-Hosting |

---

## 7. ANLAGEN (bei Einreichung beizufuegen)

- [ ] Handelsregisterauszug (nach Gruendung)
- [ ] Businessplan mit Finanzprojektion
- [ ] Lebenslauf Gruender
- [ ] Technische Dokumentation (Architektur, Codebase-Metriken)
- [ ] Letter of Intent: AI Tour Guide UG (Pilot-Partner)
- [ ] Kostenvoranschlaege (Patentanwalt, Hardware)
- [ ] DSGVO-Konzept
- [ ] De-minimis-Erklaerung

---

## 8. ERKLAERUNGEN

Der Antragsteller erklaert:

1. Das Vorhaben wurde noch nicht begonnen (Vorhabensbeginn erst nach Bewilligung oder Unbedenklichkeitsbescheinigung).
2. Die im Kostenplan aufgefuehrten Kosten sind zuwendungsfaehig und werden nicht anderweitig gefoerdert.
3. Der Antragsteller erfuellt die KMU-Definition der EU (< 250 Mitarbeiter, < 50 Mio. EUR Umsatz).
4. Der Antragsteller hat seinen Sitz in Mecklenburg-Vorpommern.

---

**Antragsteller:**
Alexander Deibel
Fintutto UG (i.G.)
Mecklenburg-Vorpommern

**Datum:** [einzusetzen]
**Unterschrift:** [einzusetzen]

---

*Stand: 06.03.2026 | Vertraulich*
