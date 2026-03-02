# GuideTranslator — Vollständige Preisübersicht

**Stand:** 01.03.2026 | **Version:** 2.0 (Revidiert)
**Basis:** Kostenanalyse-und-Preismodell-Revision.md

---

## GESAMTÜBERSICHT: Alle 11 Pläne auf einen Blick

| # | Plan | Preis/Monat | Preis/Jahr | Max. Hörer | Sprachen | Session-Min inkl. | TTS-Qualität | Overage/Min |
|---|------|------------|-----------|-----------|---------|-------------------|-------------|------------|
| 1 | **Free** | **€0** | €0 | 1 | 22 (Offline) | — | Browser | — |
| 2 | **Personal Pro** | **€4,99** | €49,90 | 3 | 30 | Unbegrenzt | Standard | — |
| 3 | **Guide Basic** | **€19,90** | €199 | 10 | 5 (+Zukauf) | 300 (~5h) | Standard | €0,15 |
| 4 | **Guide Pro** | **€39,90** | €399 | 25 | 10 (+Zukauf) | 600 (~10h) | Neural2 | €0,12 |
| 5 | **Agentur Standard** | **€99** | €990 | 30 (×3 Guides) | 15 (+Zukauf) | 1.500 (~25h) | Neural2 | €0,10 |
| 6 | **Agentur Premium** | **€249** | €2.490 | 50 (×10 Guides) | Unbegrenzt | 5.000 (~83h) | Neural2 + Chirp HD | €0,08 |
| 7 | **Event Basic** | **€199** | €1.990 | 100 (×3 Sessions) | 20 (+Zukauf) | 2.000 (~33h) | Neural2 | €0,08 |
| 8 | **Event Pro** | **€499** | €4.990 | 500 (×10 Sessions) | Unbegrenzt | 8.000 (~133h) | Chirp 3 HD | €0,06 |
| 9 | **Cruise Starter** | **€1.990** | €19.900 | Unbegrenzt (1 Schiff) | 8 (+Zukauf) | 1.500 (~25h) | Neural2 | €0,80 |
| 10 | **Cruise Fleet** | **€6.990** | €69.900 | Unbegrenzt (5-10 Schiffe) | 12 (+Zukauf) | 8.000 (~133h) | Chirp 3 HD | €0,60 |
| 11 | **Cruise Armada** | **€19.990** | €199.900 | Unbegrenzt (10+ Schiffe) | Alle 130+ | 30.000 (~500h) | Chirp 3 HD | €0,40 |

> **Jahrespreise = 10 Monate** (2 Monate gespart)

---

## DETAILÜBERSICHT PRO PLAN

---

### 1. FREE (FinTuttO / Privat-Einstieg)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€0 — für immer kostenlos** |
| **Zielgruppe** | FinTuttO-Mieter/Vermieter, Privatpersonen, Tester |
| **Translation-Engine** | MyMemory → LibreTranslate → Opus-MT Offline |
| **Sprachausgabe (TTS)** | Browser-nativ (speechSynthesis API) |
| **Spracheingabe (STT)** | Web Speech API (Browser-nativ) |
| **Kamera-OCR** | Ja (Google Vision, 1.000 Req/Monat kostenlos) |
| **Sprachen** | 22 Sprachen (+ 100+ Offline-Paare via Opus-MT) |
| **Max. Hörer** | 1 |
| **Live-Session** | Nein |
| **Offline-Modus** | Ja (Opus-MT + Browser-TTS) |
| **Limits** | 500 Übersetzungen/Tag, max. 5.000 Zeichen/Anfrage |
| **Branding** | FinTuttO-Branding + Cross-Sell-Banner |
| **Support** | Community / Self-Service |
| | |
| **Unsere Kosten/User** | **~€0/Monat** |
| **Marge** | **100%** |
| **Wettbewerber** | Google Translate (€0), Apple Translate (€0) |

---

### 2. PERSONAL PRO (Einzelpersonen mit Qualitätsanspruch)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€4,99/Monat** · €49,90/Jahr |
| **Zielgruppe** | Reisende, Arztbesuche, Behördengänge, Expats |
| **Translation-Engine** | Azure NMT (professionelle Qualität, 130+ Sprachen) |
| **Sprachausgabe (TTS)** | Google Standard Voices |
| **Spracheingabe (STT)** | Web Speech API |
| **Kamera-OCR** | Ja (erweitert) |
| **Sprachen** | 30 |
| **Max. Hörer** | **3** |
| **Session-Minuten** | **Unbegrenzt** |
| **Live-Session** | Ja (Konversationsmodus: 2 Personen sprechen abwechselnd) |
| **Offline-Modus** | Ja + Offline-Cache häufiger Phrasen |
| **Übersetzungsverlauf** | 90 Tage Cloud-Sync |
| **Limits** | Unbegrenzte Übersetzungen, max. 10.000 Zeichen/Anfrage |
| **Branding** | Kein Werbebanner |
| **Support** | E-Mail (48h) |
| | |
| **Unsere Kosten/User** | **~€0,50/Monat** |
| **Marge** | **~90%** |
| **Wettbewerber** | iTranslate: €5,99/Mon · DeepL: €8,74/Mon · Reverso: €6,49/Mon |
| **Unser Vorteil** | Günstiger + Offline + Konversationsmodus + Kamera-OCR |

---

### 3. GUIDE BASIC (Einzelne Stadtführer / Freelancer)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€19,90/Monat** · €199/Jahr |
| **Zielgruppe** | Freiberufliche Tour-Guides, kleine Touren |
| **Translation-Engine** | Azure NMT |
| **Sprachausgabe (TTS)** | Google Standard Voices |
| **Spracheingabe (STT)** | Web Speech + Google Cloud Fallback |
| **Sprachen inkl.** | **5** |
| **Zusätzliche Sprache** | **+€2,99/Sprache/Monat** |
| **Max. Hörer** | **10** |
| **Session-Minuten inkl.** | **300/Monat** (~5 Stunden) |
| **Overage** | **€0,15/Session-Minute** |
| **Live-Session** | Ja (1 Speaker → 10 Listener Broadcasting) |
| **QR-Code** | Ja (Gäste scannen → hören in ihrer Sprache) |
| **Offline-Modus** | Ja (Opus-MT + WiFi-Relay mit GL.iNet Router) |
| **Glossare** | 3 Custom-Glossare |
| **Favoriten/Vorlagen** | Ja (wiederkehrende Tour-Phrasen speichern) |
| **Pre-Translation** | — |
| **Analytics** | Basis (Sprach-Verteilung pro Tour) |
| **Support** | E-Mail (24h) |
| | |
| **Unsere Kosten/User** | **~€3/Monat** |
| **Marge** | **~85%** |
| **Wettbewerber** | Vox Hardware: 10 Geräte × €3,50/Tag = **€700/Monat bei 20 Touren** |
| **Unser Vorteil** | **97% günstiger** als Vox · Kein Hardware-Kauf · Gäste nutzen eigenes Handy |

---

### 4. GUIDE PRO (Professionelle Guides / Wachsende Gruppen)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€39,90/Monat** · €399/Jahr |
| **Zielgruppe** | Professionelle Guides mit größeren Gruppen |
| **Translation-Engine** | Azure NMT |
| **Sprachausgabe (TTS)** | **Google Neural2** (natürlich klingende Stimmen) |
| **Spracheingabe (STT)** | Google Cloud STT |
| **Sprachen inkl.** | **10** |
| **Zusätzliche Sprache** | **+€1,99/Sprache/Monat** |
| **Max. Hörer** | **25** |
| **Session-Minuten inkl.** | **600/Monat** (~10 Stunden) |
| **Overage** | **€0,12/Session-Minute** |
| **Live-Session** | Ja (1 Speaker → 25 Listener Broadcasting) |
| **QR-Code** | Ja |
| **Offline-Modus** | Ja (WiFi-Relay + BLE Direct) |
| **Glossare** | 10 Custom-Glossare |
| **Favoriten/Vorlagen** | Ja (erweitert) |
| **Pre-Translation** | 5 Tour-Skripte/Monat |
| **Analytics** | Erweitert (Sprachen, Dauer, Hörer-Statistik) |
| **Support** | E-Mail (12h) + Chat |
| | |
| **Unsere Kosten/User** | **~€8/Monat** |
| **Marge** | **~80%** |
| **Wettbewerber** | Wordly: 10h × $75 = **€690/Monat** |
| **Unser Vorteil** | **94% günstiger** als Wordly · Neural2-Stimmen · Offline-Fähigkeit |

---

### 5. AGENTUR STANDARD (Reisebüros / Guide-Pool)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€99/Monat** · €990/Jahr |
| **Zielgruppe** | Reiseagenturen mit mehreren Guides |
| **Guides gleichzeitig** | **3** |
| **Translation-Engine** | Azure NMT |
| **Sprachausgabe (TTS)** | Google Neural2 |
| **Spracheingabe (STT)** | Google Cloud STT |
| **Sprachen inkl.** | **15** |
| **Zusätzliche Sprache** | **+€1,49/Sprache/Monat** |
| **Max. Hörer/Guide** | **30** |
| **Session-Minuten inkl.** | **1.500/Monat** (~25 Stunden) |
| **Overage** | **€0,10/Session-Minute** |
| **Live-Session** | Ja (3 parallele Sessions) |
| **Glossare** | 5 Custom-Glossare pro Guide |
| **Pre-Translation** | 15 Tour-Skripte/Monat |
| **Guide-Management** | Einladen, Verwalten, Statistiken pro Guide |
| **Analytics** | Dashboard (alle Guides, alle Touren) |
| **White-Label** | — |
| **Support** | E-Mail (12h) + Chat |
| | |
| **Unsere Kosten** | **~€20/Monat** |
| **Marge** | **~80%** |
| **Wettbewerber** | 30 Vox-Geräte × €3,50/Tag × 20 Tage = **€2.100/Monat** |
| **Unser Vorteil** | **95% günstiger** · Kein Geräte-Management · Skalierbar |

---

### 6. AGENTUR PREMIUM (Große Agenturen / Multi-Guide)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€249/Monat** · €2.490/Jahr |
| **Zielgruppe** | Große Reiseagenturen, Tour-Operatoren |
| **Guides gleichzeitig** | **10** |
| **Translation-Engine** | Azure NMT |
| **Sprachausgabe (TTS)** | Neural2 + **Chirp 3 HD** (Premium-Option) |
| **Spracheingabe (STT)** | Google Cloud STT |
| **Sprachen inkl.** | **Unbegrenzt** (130+) |
| **Zusätzliche Sprache** | Inkludiert |
| **Max. Hörer/Guide** | **50** |
| **Session-Minuten inkl.** | **5.000/Monat** (~83 Stunden) |
| **Overage** | **€0,08/Session-Minute** |
| **Live-Session** | Ja (10 parallele Sessions) |
| **Glossare** | Unbegrenzt |
| **Pre-Translation** | Unbegrenzte Tour-Skripte |
| **Guide-Management** | Vollständig (Einladen, Rollen, Rechte) |
| **Analytics** | Vollständiges Dashboard + Export |
| **White-Label** | **Ja** (eigenes Logo, Farben) |
| **API-Zugang** | Read-Only (Analytics-Daten) |
| **Support** | Priority E-Mail (4h) + Chat + Onboarding-Call |
| | |
| **Unsere Kosten** | **~€55/Monat** |
| **Marge** | **~78%** |
| **Wettbewerber** | 50 Vox × €3,50 × 20 Tage = **€3.500/Monat** |
| **Unser Vorteil** | **93% günstiger** · White-Label · Keine Hardware |

---

### 7. EVENT BASIC (Konferenzen / Messen / Workshops)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€199/Monat** · €1.990/Jahr |
| **Zielgruppe** | Event-Organisatoren, Konferenzveranstalter, Workshops |
| **Sessions gleichzeitig** | **3** (z.B. 3 Vorträge parallel) |
| **Translation-Engine** | Azure NMT |
| **Sprachausgabe (TTS)** | Google Neural2 |
| **Spracheingabe (STT)** | Google Cloud STT |
| **Sprachen inkl.** | **20** |
| **Zusätzliche Sprache** | **+€0,99/Sprache/Monat** |
| **Max. Hörer/Session** | **100** |
| **Session-Minuten inkl.** | **2.000/Monat** (~33 Stunden) |
| **Overage** | **€0,08/Session-Minute** |
| **Live-Untertitel** | **Ja** (Text-Overlay für Teilnehmer) |
| **Glossare** | 10 (Fach-/Branchenbegriffe) |
| **Pre-Translation** | 20 Skripte/Monat (Vorträge vorab übersetzen) |
| **Teilnehmer-Management** | QR-Code-Einladung, Sprach-Statistik |
| **Analytics** | Dashboard (Sprachen, Teilnehmer, Dauer) |
| **Support** | E-Mail (12h) + Chat |
| | |
| **Unsere Kosten** | **~€35/Monat** |
| **Marge** | **~82%** |
| **Wettbewerber** | Wordly: 33h × $75/h = **€2.275/Monat** · KUDO: €500-2.000/Event |
| **Unser Vorteil** | **91% günstiger** als Wordly · Einfacher Setup (QR-Code) |

---

### 8. EVENT PRO (Große Events / Multi-Track-Konferenzen)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€499/Monat** · €4.990/Jahr |
| **Zielgruppe** | Große Konferenzen, Messen, Multi-Track-Events |
| **Sessions gleichzeitig** | **10** (z.B. 10 Vorträge parallel) |
| **Translation-Engine** | Azure NMT |
| **Sprachausgabe (TTS)** | **Chirp 3 HD** (beste Qualität) |
| **Spracheingabe (STT)** | Google Cloud STT (Enhanced) |
| **Sprachen inkl.** | **Unbegrenzt** (130+) |
| **Zusätzliche Sprache** | Inkludiert |
| **Max. Hörer/Session** | **500** |
| **Session-Minuten inkl.** | **8.000/Monat** (~133 Stunden) |
| **Overage** | **€0,06/Session-Minute** |
| **Live-Untertitel** | **Ja + Export** (Transkript als PDF/SRT) |
| **Glossare** | Unbegrenzt |
| **Pre-Translation** | Unbegrenzt |
| **Teilnehmer-Management** | Vollständig + Branding |
| **Analytics** | Vollständig + Export + API |
| **White-Label** | **Ja** |
| **API-Zugang** | Read-Only |
| **Support** | Priority (4h) + Dedicated Onboarding |
| | |
| **Unsere Kosten** | **~€95/Monat** |
| **Marge** | **~81%** |
| **Wettbewerber** | KUDO: €500-2.000/Event · Interprefy: €800+/Event |
| **Unser Vorteil** | Vergleichbar im Preis, einfacher im Setup, keine Installation |

---

### 9. CRUISE STARTER (1 Schiff / 1 Standort)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€1.990/Monat** · €19.900/Jahr |
| **Zielgruppe** | Einzelne Kreuzfahrtschiffe, große Museen, Einzelstandorte |
| **Schiffe/Standorte** | **1** |
| **Translation-Engine** | Azure NMT |
| **Sprachausgabe (TTS)** | Google Neural2 |
| **Spracheingabe (STT)** | Google Cloud STT |
| **Sprachen inkl.** | **8** |
| **Zusätzliche Sprache** | **+€49/Sprache/Monat** |
| **Max. Hörer/Session** | **Unbegrenzt** |
| **Session-Minuten inkl.** | **1.500/Monat** (~25 Stunden) |
| **Overage** | **€0,80/Session-Minute** |
| **Live-Broadcasting** | **Ja** (1 Guide → Tausende Hörer, Echtzeit) |
| **Pre-Translation** | **10 Tour-Skripte/Monat** (Batch-Übersetzung, kostet dann €0 live) |
| **Offline-Modus** | **WiFi-Relay** (GL.iNet Router) + **BLE Direct** |
| **Custom Glossare** | 20 (pro Destination) |
| **Passagier-App** | QR/NFC-Aktivierung |
| **Dashboard** | Analytics (Sprachen, Nutzung, beliebte Touren) |
| **API-Zugang** | — |
| **SLA** | Standard |
| **Support** | E-Mail (12h) + Chat + Onboarding |
| **DSGVO** | Konform, Hosting in EU möglich |
| | |
| **Unsere Kosten** | **~€170/Monat** |
| **Marge** | **~91%** |
| **Wettbewerber** | 8 Dolmetscher × €350/Tag = **€2.800 pro Ausflug** |
| **Unser Vorteil** | **€1.990/Monat vs. €2.800/Ausflug** · Unbegrenzte Hörer · Offline |

**Beispiel-Rechnung Reederei:**
- 15 Ausflüge/Monat × 90 Min = 1.350 Session-Min (350 Overage)
- Rechnung: €1.990 + 350 × €0,80 = **€2.270/Monat**
- Bisherige Kosten: 15 × €2.800 = **€42.000/Monat** (Dolmetscher)
- **Ersparnis: €39.730/Monat = 95%**

---

### 10. CRUISE FLEET (5-10 Schiffe)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€6.990/Monat** · €69.900/Jahr |
| **Zielgruppe** | Mittlere Reedereien, Flusskreuzfahrten, Hotelketten |
| **Schiffe/Standorte** | **5-10** |
| **Translation-Engine** | Azure NMT |
| **Sprachausgabe (TTS)** | **Chirp 3 HD** (beste Qualität) |
| **Spracheingabe (STT)** | Google Cloud STT |
| **Sprachen inkl.** | **12** |
| **Zusätzliche Sprache** | **+€39/Sprache/Monat** |
| **Max. Hörer/Session** | **Unbegrenzt** |
| **Session-Minuten inkl.** | **8.000/Monat** (~133 Stunden) |
| **Overage** | **€0,60/Session-Minute** |
| **Pre-Translation** | **50 Tour-Skripte/Monat** |
| **Offline-Modus** | WiFi-Relay + BLE + Custom-Hardware-Support |
| **Custom Glossare** | Unbegrenzt |
| **Dashboard** | Multi-Schiff-Analytics + Export |
| **API-Zugang** | **Read-Only** (Integration in bestehende Cruise-Apps) |
| **White-Label** | **Ja** (Passagier-App mit Reederei-Branding) |
| **SLA** | **99,5% Uptime** |
| **Support** | Priority (4h) + Dedicated Account Manager |
| | |
| **Unsere Kosten** | **~€1.100/Monat** |
| **Marge** | **~84%** |
| **Wettbewerber** | **Kein direkter Wettbewerber** |

**Beispiel-Rechnung 8 Schiffe:**
- 8 × 15 Ausflüge × 90 Min = 10.800 Session-Min (2.800 Overage)
- Rechnung: €6.990 + 2.800 × €0,60 = **€8.670/Monat**
- Bisherige Kosten: 120 Ausflüge × €2.800 = **€336.000/Monat**
- **Ersparnis: €327.330/Monat = 97%**

---

### 11. CRUISE ARMADA (10+ Schiffe / Enterprise)

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **€19.990/Monat** · €199.900/Jahr |
| **Zielgruppe** | Große Reedereien (MSC, Costa, Royal Caribbean), Konzerne |
| **Schiffe/Standorte** | **10+** (unbegrenzt) |
| **Translation-Engine** | Azure NMT + Custom-Training möglich |
| **Sprachausgabe (TTS)** | **Chirp 3 HD** + Custom Voice Option |
| **Spracheingabe (STT)** | Google Cloud STT (Enhanced) |
| **Sprachen inkl.** | **Alle 130+** |
| **Zusätzliche Sprache** | Inkludiert |
| **Max. Hörer/Session** | **Unbegrenzt** |
| **Session-Minuten inkl.** | **30.000/Monat** (~500 Stunden) |
| **Overage** | **€0,40/Session-Minute** |
| **Pre-Translation** | **Unbegrenzt** (alle Tour-Skripte aller Destinationen) |
| **Offline-Modus** | WiFi-Relay + BLE + Custom-Hardware + Dedicated Server |
| **Custom Glossare** | Unbegrenzt + AI-gestütztes Glossar-Management |
| **Dashboard** | Enterprise-Analytics, Flotten-Übersicht, Echtzeit-Monitoring |
| **API-Zugang** | **Full API** (bidirektionale Integration) |
| **White-Label** | **Vollständig** (App, E-Mails, Dashboard) |
| **Onboard-Nutzung** | Safety Briefings, Menü-Translation, Entertainment-Untertitel |
| **SLA** | **99,9% Uptime** |
| **Support** | **Dedicated Support-Team** + 24/7 Notfall-Hotline |
| **DSGVO** | Konform + Dedicated EU-Hosting + DPA |
| | |
| **Unsere Kosten** | **~€4.500/Monat** |
| **Marge** | **~77%** |
| **Wettbewerber** | **Kein Wettbewerber weltweit** |

---

## CUSTOM ENTERPRISE

| Eigenschaft | Details |
|------------|---------|
| **Preis** | **Individuelle Verhandlung** · ab €149.990/Jahr |
| **Für** | Globale Reedereien, Airline-Gruppen, Regierungen |
| **Umfang** | Alles aus Armada + dedizierte Infrastruktur + Custom-Entwicklung |
| **Vertragslaufzeit** | 12-36 Monate |

---

## SPRACH-PAKETE (Add-On für alle Pläne ab Guide)

| Plan | Sprachen inkl. | Preis pro zusätzliche Sprache/Monat |
|------|---------------|-------------------------------------|
| Guide Basic | 5 | **€2,99** |
| Guide Pro | 10 | **€1,99** |
| Agentur Standard | 15 | **€1,49** |
| Agentur Premium | Alle | Inkludiert |
| Event Basic | 20 | **€0,99** |
| Event Pro | Alle | Inkludiert |
| Cruise Starter | 8 | **€49** |
| Cruise Fleet | 12 | **€39** |
| Cruise Armada | Alle 130+ | Inkludiert |

---

## SESSION-MINUTEN: Erklärung

**1 Session-Minute** = 1 Minute, in der ein Guide/Speaker spricht (unabhängig von Hörerzahl).

| Was zählt | Was NICHT zählt |
|-----------|----------------|
| Guide spricht 1 Minute | Pausen zwischen Sprechen |
| = 1 Session-Minute | Hörer-Anzahl (egal ob 1 oder 3.000) |
| (egal in wie viele Sprachen) | Stille / Wartezeit |

**Beispiel:** Ein 90-Minuten-Ausflug mit ~60% aktiver Sprechzeit = ~54 Session-Minuten.

---

## OVERAGE-PREISE (bei Überschreitung der inkl. Session-Minuten)

| Plan | Overage pro Session-Minute | Beispiel: 100 Min Overage |
|------|---------------------------|--------------------------|
| Guide Basic | €0,15 | +€15 |
| Guide Pro | €0,12 | +€12 |
| Agentur Standard | €0,10 | +€10 |
| Agentur Premium | €0,08 | +€8 |
| Event Basic | €0,08 | +€8 |
| Event Pro | €0,06 | +€6 |
| **Cruise Starter** | **€0,80** | **+€80** |
| **Cruise Fleet** | **€0,60** | **+€60** |
| **Cruise Armada** | **€0,40** | **+€40** |

---

## JAHRESABONNEMENT-RABATTE

| Zahlungsweise | Rabatt | Effekt |
|---------------|--------|--------|
| **Monatlich** | Kein Rabatt | Voller Preis |
| **Jährlich** | **~17% Rabatt** | 10 statt 12 Monate zahlen |
| **2 Jahre (Enterprise)** | **~25% Rabatt** | Individuelle Verhandlung |

---

## FEATURE-MATRIX: Alle Features über alle Pläne

| Feature | Free | Personal | Guide B | Guide P | Agentur S | Agentur P | Event B | Event P | Cruise S | Cruise F | Cruise A |
|---------|:----:|:--------:|:-------:|:-------:|:---------:|:---------:|:-------:|:-------:|:--------:|:--------:|:--------:|
| **Translation** | Offline | Azure | Azure | Azure | Azure | Azure | Azure | Azure | Azure | Azure | Azure |
| **TTS-Qualität** | Browser | Standard | Standard | Neural2 | Neural2 | Neural2+HD | Neural2 | Chirp HD | Neural2 | Chirp HD | Chirp HD |
| **STT** | Browser | Browser | Browser+G | Google | Google | Google | Google | Google+ | Google | Google | Google+ |
| **Max. Hörer** | 1 | 3 | 10 | 25 | 30 | 50 | 100 | 500 | ∞ | ∞ | ∞ |
| **Sprachen** | 22 | 30 | 5+ | 10+ | 15+ | Alle | 20+ | Alle | 8+ | 12+ | Alle |
| **Live-Session** | — | Konvers. | Broadcast | Broadcast | Multi | Multi | Multi | Multi | Broadcast | Broadcast | Broadcast |
| **Offline** | Opus-MT | +Cache | +WiFi | +WiFi+BLE | +WiFi+BLE | +WiFi+BLE | — | — | +WiFi+BLE | +Custom | +Dedicated |
| **QR-Code** | — | — | Ja | Ja | Ja | Ja | Ja | Ja | Ja | Ja | Ja |
| **Pre-Translation** | — | — | — | 5/Mon | 15/Mon | Unbegr. | 20/Mon | Unbegr. | 10/Mon | 50/Mon | Unbegr. |
| **Glossare** | — | — | 3 | 10 | 5/Guide | Unbegr. | 10 | Unbegr. | 20 | Unbegr. | Unbegr. |
| **Analytics** | — | — | Basis | Erweitert | Dashboard | Dashboard+ | Dashboard | Full+API | Dashboard | Multi-Ship | Enterprise |
| **White-Label** | — | — | — | — | — | Ja | — | Ja | — | Ja | Vollständig |
| **API-Zugang** | — | — | — | — | — | Read | — | Read | — | Read | Full |
| **SLA** | — | — | — | — | — | — | — | — | Standard | 99,5% | 99,9% |
| **Support** | Self | 48h | 24h | 12h+Chat | 12h+Chat | 4h+Chat | 12h+Chat | 4h+Onb. | 12h+Chat | AM | Dedicated |

---

## MARGEN-ÜBERSICHT (Intern)

| Plan | Preis/Mon | Ø API-Kosten/Mon | Anteil Infrastruktur | Marge | Marge € |
|------|----------|-----------------|---------------------|-------|---------|
| Free | €0 | €0 | ~€0,01 | 100% | €0 |
| Personal Pro | €4,99 | €0,50 | €0,05 | **~90%** | €4,44 |
| Guide Basic | €19,90 | €3 | €0,20 | **~85%** | €16,70 |
| Guide Pro | €39,90 | €8 | €0,40 | **~80%** | €31,50 |
| Agentur Standard | €99 | €20 | €1 | **~80%** | €78 |
| Agentur Premium | €249 | €55 | €2,50 | **~78%** | €191,50 |
| Event Basic | €199 | €35 | €2 | **~82%** | €162 |
| Event Pro | €499 | €95 | €5 | **~81%** | €399 |
| Cruise Starter | €1.990 | €170 | €10 | **~91%** | €1.810 |
| Cruise Fleet | €6.990 | €1.100 | €35 | **~84%** | €5.855 |
| Cruise Armada | €19.990 | €4.500 | €100 | **~77%** | €15.390 |

---

## WETTBEWERBER-VERGLEICH (Quick Reference)

| Wettbewerber | Preis | Was sie bieten | Was uns unterscheidet |
|-------------|-------|---------------|---------------------|
| **Google Translate** | €0 | 1:1 Text/Sprache | Kein Broadcasting, kein Offline-Gruppen |
| **Apple Translate** | €0 | 1:1 Gespräch | Nur Apple-Geräte, max. 2 Personen |
| **iTranslate** | €5,99/Mon | 1:1 mit Kopfhörern | Kein Broadcasting, kein Offline |
| **DeepL** | €8,74/Mon | Beste Text-Qualität | Kein Audio, kein Broadcasting |
| **Reverso** | €6,49/Mon | Text + Kontext | Kein Live-Audio, kein Broadcasting |
| **AirTranslator** | ~€5-10/Mon | 1:1 mit AirPods | Max. 2 Personen, kein Broadcasting |
| **Wordly.ai** | $75/Std | Meeting-Translation | Kein Offline, kein Tour-Feature, teurer |
| **KUDO** | €500+/Event | Konferenz-Dolmetscher | Nur Events, sehr teuer |
| **Interprefy** | €800+/Event | Remote-Dolmetscher | Nur Events, keine Touren |
| **Vox Hardware** | €3,50/Gerät/Tag | Physische Geräte | Teuer bei Gruppen, Logistik, kein Übersetzen |
| **Orpheo** | €2-4/Gerät/Tag | Audio-Guide Museen | Nur voraufgenommen, kein Live |
| **Menschl. Dolmetscher** | €350-500/Tag/Sprache | Perfekte Qualität | €2.800/Tag für 8 Sprachen |
| | | | |
| **GuideTranslator** | **€0 – €19.990** | **1→∞ Broadcasting, Offline, 130+ Sprachen** | **Einzige Software-Lösung für Guide→Gruppe** |

---

*Erstellt am 01.03.2026 · Basierend auf verifizierten API-Preisen und Wettbewerbsrecherche*
*Vollständige Kosten-Herleitung: siehe KOSTENANALYSE-UND-PREISMODELL-REVISION.md*
