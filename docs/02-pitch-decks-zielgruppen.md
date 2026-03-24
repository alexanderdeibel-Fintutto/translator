# Fintutto Translator — Pitch Decks nach Zielgruppe

---

# PITCH 1: Guided Tours & Museen

## Das Problem

Ein Stadtfuehrer spricht Deutsch. In seiner Gruppe: 3 Spanier, 2 Japaner, 4 Araber, 1 Ukrainerin.

**Heute**: Er spricht — 80% verstehen nichts. Oder er bucht 4 Dolmetscher (a 200 EUR/Tag). Oder er nutzt Fluesterkoffersets (Investition: 3.000-8.000 EUR, nur 1 Sprache).

**Mit Fintutto Translator**: Er spricht ins Mikrofon seines Handys. 10 Gaeste scannen einen QR-Code. Jeder liest und hoert die Uebersetzung in seiner Sprache — in Echtzeit. Ohne App-Installation. Ohne Internet.

## Die Loesung

```
Speaker spricht Deutsch
        │
        ▼
   ┌─────────┐     QR-Code scannen
   │ Fintutto │ ──────────────────► Gast 1: Spanisch
   │ auf dem  │ ──────────────────► Gast 2: Japanisch
   │ Speaker- │ ──────────────────► Gast 3: Arabisch
   │ Handy    │ ──────────────────► Gast 4: Ukrainisch
   └─────────┘
   Kein Internet noetig (BLE/Hotspot)
```

## Key Features fuer diese Zielgruppe

| Feature | Nutzen |
|---------|--------|
| **QR-Code Join** | Gaeste oeffnen nur den Browser — keine App noetig |
| **45 Sprachen gleichzeitig** | Eine Gruppe, beliebig viele Sprachen |
| **Untertitel-Modus** | Grossschrift-Anzeige (6xl), ideal draussen |
| **BLE-Modus (Offline)** | Funktioniert im Museum, in Ruinen, im Wald |
| **Hotspot-Modus** | Speaker erstellt eigenes WiFi — kein Router noetig |
| **HD-Sprachausgabe** | Google Neural2/Chirp: Gaeste koennen zuhoeren statt lesen |
| **Session-Protokoll** | Komplette Tour als TXT/MD exportierbar |
| **Kostenlos** | Kein Abo, keine Lizenzgebuehren fuer Basisnutzung |

## Technische Differenzierung

**Warum nicht Google Translate?**
- Google: 1:1, kein Broadcast, kein QR-Join, kein Offline
- Fintutto: 1→N Broadcast, QR-Code, BLE/Hotspot, Untertitel-Modus

**Warum nicht Fluesterkofferset?**
- Koffer: 3.000-8.000 EUR, nur 1 Sprache, sperrig, Batterien
- Fintutto: Kostenlos, 45 Sprachen, laeuft auf vorhandenen Handys

**Warum nicht Zoom/Teams?**
- Zoom: Braucht Internet, jeder braucht Account, 1 Sprache gleichzeitig
- Fintutto: Kein Internet, kein Account, jeder waehlt seine Sprache

## Einsatzszenarien

1. **Stadtfuehrung**: Guide spricht, 20 Touristen lesen mit
2. **Museum**: Fuehrung durch Ausstellung ohne Audio-Guide-Geraete
3. **Architektur-Tour**: Draussen, kein WiFi → BLE-Modus
4. **Weinverkostung**: Winzer erklaert, internationale Gaeste verstehen
5. **Historische Staette**: Kein Mobilfunk → Hotspot-Modus

## Preismodell fuer Guided Tours

| Tier | Preis | Leistung |
|------|-------|----------|
| **Kostenlos** | 0 EUR | Bis 5 Listener, Cloud-Modus, Standard-TTS |
| **Guide Pro** | 19 EUR/Monat | Bis 50 Listener, HD-TTS, Hotspot, BLE, Branding |
| **Enterprise** | Auf Anfrage | Unbegrenzt, White-Label, API, Priority Support |

## Call to Action

> **Testen Sie es jetzt**: Oeffnen Sie translator.fintutto.cloud auf Ihrem Handy, starten Sie eine Live-Session, und lassen Sie einen Kollegen den QR-Code scannen. In 30 Sekunden erleben Sie den Unterschied.

---

# PITCH 2: Behoerden & Aemter

## Das Problem

Auslaenderbehoerde, Montag 8:00 Uhr. 47 Wartende aus 12 Laendern. 2 Sachbearbeiter, die Deutsch und vielleicht Englisch sprechen.

**Heute**: Haende-und-Fuesse-Kommunikation. Familienangehoerige als Dolmetscher (problematisch bei Asylverfahren). Teure Dolmetscher-Pools (80-120 EUR/Stunde, oft nicht verfuegbar). Falsche Auskuenfte wegen Missverstaendnissen.

**Kosten**: Pro fehlgeschlagenem Termin: 45 Minuten Arbeitszeit + Folge-Termin = ~120 EUR Verwaltungskosten. Bei 5 Faellen/Tag: 600 EUR Verlust.

## Die Loesung

```
┌─────────────────────────────────────────────────┐
│  SACHBEARBEITER                                  │
│                                                  │
│  ┌──────────────────────────────────────┐        │
│  │         GESPRAECHSMODUS              │        │
│  │                                      │        │
│  │  ┌────────────────────────────────┐  │        │
│  │  │    Hallo, was kann ich         │  │        │
│  │  │    fuer Sie tun?               │  │        │
│  │  │    🔊 Auto-Speak               │  │        │
│  │  └────────────────────────────────┘  │        │
│  │  ──────── 180 Grad gedreht ────────  │        │
│  │  ┌────────────────────────────────┐  │        │
│  │  │   مرحبا، بماذا أستطيع أن       │  │        │
│  │  │   أساعدك؟                      │  │        │
│  │  │    🔊 Auto-Speak               │  │        │
│  │  └────────────────────────────────┘  │        │
│  │                                      │        │
│  │  KLIENT (Arabisch)                   │        │
│  └──────────────────────────────────────┘        │
└─────────────────────────────────────────────────┘
```

## Key Features fuer diese Zielgruppe

| Feature | Nutzen fuer die Behoerde |
|---------|--------------------------|
| **Gespraechsmodus** | Tablet zwischen beide Personen — simultanes Gespraech |
| **10 Migrationssprachen** | Farsi, Dari, Paschtu, Kurdisch, Tigrinya, Amharisch, Somali, Urdu, Bengali, Albanisch |
| **Phrasebook** | 18 Kategorien: Behoerde, Medizin, Unterkunft, Formulare, Notfall |
| **RTL-Unterstuetzung** | Arabisch, Farsi, Urdu — korrekte Textrichtung |
| **Sie/Du-Umschaltung** | Formelle Anrede fuer amtliche Kommunikation |
| **Offline-Modus** | Funktioniert ohne Internet (WASM-Modelle) |
| **Kein Account** | DSGVO-konform, keine Nutzerregistrierung |
| **Datenschutz** | Keine Speicherung von Gespraechen auf Servern |

## Migrationssprachen im Detail

| Sprache | Herkunft | Sprecher weltweit |
|---------|----------|-------------------|
| Arabisch (AR) | Syrien, Irak | 310 Mio |
| Farsi/Dari (FA) | Iran, Afghanistan | 110 Mio |
| Paschtu (PS) | Afghanistan | 60 Mio |
| Kurdisch (KU) | Irak, Tuerkei, Syrien | 30 Mio |
| Tigrinya (TI) | Eritrea | 7 Mio |
| Amharisch (AM) | Aethiopien | 32 Mio |
| Somali (SO) | Somalia | 22 Mio |
| Urdu (UR) | Pakistan | 230 Mio |
| Bengali (BN) | Bangladesch | 230 Mio |
| Albanisch (SQ) | Albanien, Kosovo | 7 Mio |

## ROI-Berechnung

```
OHNE Fintutto:
  5 gescheiterte Termine/Tag x 120 EUR = 600 EUR/Tag
  + 3 Dolmetscher-Einsaetze/Woche x 100 EUR = 300 EUR/Woche
  = ~3.900 EUR/Monat Mehrkosten

MIT Fintutto:
  Lizenz: 49 EUR/Monat (Behoerden-Tarif)
  Tablet: einmalig 300 EUR (schon vorhanden)
  = 49 EUR/Monat

ERSPARNIS: ~3.850 EUR/Monat = ~46.000 EUR/Jahr
ROI: 7.800%
```

## Datenschutz & Compliance

- **DSGVO**: Keine personenbezogenen Daten werden gespeichert
- **Offline-Modus**: Daten verlassen das Geraet nicht
- **BSI-konform**: AES-256-GCM Verschluesselung fuer Live-Sessions
- **Kein Cloud-Zwang**: Offline + lokaler Hotspot = 100% on-premise
- **Export**: Gespraeche koennen als Protokoll exportiert werden (wenn gewuenscht)

## Preismodell fuer Behoerden

| Tier | Preis | Leistung |
|------|-------|----------|
| **Starter** | 49 EUR/Monat | 3 Geraete, Gespraechsmodus, Phrasebook, Offline |
| **Amt** | 149 EUR/Monat | 10 Geraete, Priority Support, White-Label, Training |
| **Landesweite Lizenz** | Auf Anfrage | Unbegrenzt, MDM-Integration, SLA, Vor-Ort-Schulung |

## Call to Action

> **Pilotprojekt starten**: 30 Tage kostenlos testen. Wir kommen zu Ihnen, richten 2 Tablets ein, und schulen Ihre Mitarbeiter in 60 Minuten. Kein Risiko, keine Vertragsbindung.

---

# PITCH 3: Grossveranstaltungen & Konferenzen

## Das Problem

Eine internationale Konferenz mit 500 Teilnehmern aus 20 Laendern. Simultanuebersetzung fuer 3 Hauptsprachen kostet 4.000-8.000 EUR pro Tag (2 Dolmetscher pro Sprache, Kabine, Technik). Und trotzdem: Wer Thai spricht, Bulgarisch oder Vietnamesisch — geht leer aus.

**Heute**: Konferenzen investieren 50.000-100.000 EUR in Dolmetscher fuer 3-4 Sprachen. Die restlichen 15 Sprachen werden ignoriert.

## Die Loesung

```
                    KEYNOTE-SPEAKER
                         │
                    ┌────┴────┐
                    │ Fintutto│
                    │ Speaker │
                    └────┬────┘
                         │
           ┌─────────────┼─────────────────┐
           │             │                 │
     ┌─────┴────┐  ┌────┴─────┐   ┌──────┴─────┐
     │ Saal A   │  │ Saal B   │   │ Remote     │
     │ 200 Pers │  │ 200 Pers │   │ Stream     │
     │ je eigene│  │ je eigene│   │ je eigene  │
     │ Sprache  │  │ Sprache  │   │ Sprache    │
     └──────────┘  └──────────┘   └────────────┘

     QR-Code auf Leinwand → Jeder waehlt seine Sprache
```

## Key Features fuer Konferenzen

| Feature | Nutzen |
|---------|--------|
| **QR-Code auf Beamer** | 500 Teilnehmer joinen in 30 Sekunden |
| **45 Sprachen gleichzeitig** | Kein Teilnehmer wird ausgeschlossen |
| **Untertitel-Modus** | Grosse Schrift auf dem eigenen Handy |
| **HD-Sprachausgabe** | Chirp 3 HD fuer Premium-Qualitaet |
| **Cloud-Transport** | Supabase Realtime — skaliert auf 500+ |
| **Latenz <1 Sekunde** | Echtzeit-Feeling, kein merkbares Delay |
| **Session-Protokoll** | Gesamte Konferenz als Transkript exportierbar |
| **Kein Hardware-Kauf** | Laeuft auf vorhandenen Smartphones der Teilnehmer |

## Kostenvergleich

```
TRADITIONELL (3 Sprachen):
  6 Dolmetscher x 800 EUR/Tag              = 4.800 EUR
  3 Dolmetschkabinen (Miete)               = 2.400 EUR
  Empfaengergeraete (500 Stueck, Miete)    = 3.000 EUR
  Techniker                                 = 1.200 EUR
  ─────────────────────────────────────────
  TOTAL PRO TAG:                            11.400 EUR

MIT FINTUTTO (45 Sprachen):
  Event-Lizenz (1 Tag)                     = 299 EUR
  ─────────────────────────────────────────
  TOTAL PRO TAG:                            299 EUR

  ERSPARNIS: 97% (11.100 EUR pro Tag)
  + 42 zusaetzliche Sprachen inklusive
```

## Einsatzszenarien

1. **Konferenzen/Kongresse**: Keynotes, Panels, Workshops
2. **Firmenmeetings**: Internationale Teams, Board Meetings
3. **Messen**: Standpraesentationen, Produkt-Demos
4. **Hotels**: Gaeste-Kommunikation, Concierge
5. **Kreuzfahrtschiffe**: Entertainment-Programm, Sicherheitsbriefing

## Preismodell fuer Events

| Tier | Preis | Leistung |
|------|-------|----------|
| **Tagesevent** | 299 EUR/Tag | Bis 100 Listener, Cloud, HD-TTS |
| **Konferenz** | 799 EUR/Tag | Bis 500 Listener, Priority, Protokoll |
| **Enterprise Event** | Auf Anfrage | Unbegrenzt, dedizierter Server, Branding |
| **Jahresabo** | 2.999 EUR/Jahr | Unbegrenzte Events, alle Features |

## Call to Action

> **Naechste Konferenz gratis testen**: Registrieren Sie Ihr Event, erhalten Sie einen kostenlosen Testlauf mit bis zu 50 Teilnehmern. Erleben Sie, wie 45 Sprachen gleichzeitig funktionieren.

---

# PITCH 4: NGOs & Fluechtlingshilfe

## Das Problem

Eine Erstaufnahmeeinrichtung. 200 Menschen aus 15 Laendern. 3 Sozialarbeiter, die Deutsch und Englisch sprechen.

**Heute**: Google Translate auf dem Handy — Satz fuer Satz, hin und her reichen. Fuer ein 10-Minuten-Gespraech: 30 Minuten. Fuer wichtige Informationen (Asylverfahren, Gesundheit, Unterbringung): Missverstaendnisse mit schwerwiegenden Folgen.

## Die Loesung

**Fintutto ist fuer NGOs komplett kostenlos nutzbar.**

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  WILLKOMMENS-BRIEFING                           │
│                                                  │
│  Sozialarbeiter spricht:                        │
│  "Willkommen. Ihr Zimmer ist Nr. 42.            │
│   Fruehstueck ist von 7 bis 9 Uhr.              │
│   Bitte melden Sie sich morgen um 10 Uhr         │
│   bei der Registrierung."                        │
│                                                  │
│  → 40 Personen lesen gleichzeitig:              │
│     🇸🇾 Arabisch    🇦🇫 Dari     🇪🇷 Tigrinya    │
│     🇸🇴 Somali      🇵🇰 Urdu     🇧🇩 Bengali    │
│     🇺🇦 Ukrainisch  🇦🇱 Albanisch               │
│                                                  │
│  Kein Internet noetig → Hotspot/BLE              │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Warum Fintutto fuer NGOs?

| Feature | Warum es hier zaehlt |
|---------|---------------------|
| **Kostenlos** | NGOs haben kein Budget fuer teure Tools |
| **10 Migrationssprachen** | Farsi, Dari, Paschtu, Kurdisch, Tigrinya, Amharisch, Somali, Urdu, Bengali, Albanisch |
| **Offline-Modus** | Erstaufnahmen haben oft kein stabiles Internet |
| **Phrasebook** | 18 Kategorien: Notfall, Medizin, Unterkunft, Behoerde, Essen |
| **Gespraechsmodus** | Persoenliche Gespraeche 1:1 auf einem Geraet |
| **Live-Broadcast** | Informationsveranstaltungen 1→N |
| **Kein Account** | Keine Registrierung, kein Datenschutz-Risiko |
| **QR-Code** | Gaeste brauchen nur ein Handy mit Browser |
| **RTL-Sprachen** | Arabisch, Farsi, Urdu — korrekt dargestellt |
| **Romanisierung** | Arabische/persische Texte auch in Lateinschrift |

## Phrasebook-Kategorien

```
Alltag & Grundlagen       Behoerde & Dokumente
Begruessungen              Asylverfahren
Essen & Trinken            Formulare
Einkaufen                  Termine
Weg & Orientierung         Aufenthaltstitel

Gesundheit & Notfall      Unterkunft
Arztbesuch                 Zimmer & Einrichtung
Apotheke                   Regeln & Zeiten
Krankenhaus                Probleme melden
Notfall / Polizei          Kueche / Waschraum

Arbeit & Bildung          Kommunikation
Jobsuche                   Telefon & Internet
Sprachkurs                 Brief & Post
Schule & Kinder            Bankgeschaefte
```

## Realer Impact

```
VORHER (pro Briefing):
  1 Sozialarbeiter x 40 Personen x 6 Sprachen
  = 6 separate Briefings a 20 Min = 2 Stunden Arbeitszeit
  + 3 Faelle von Missverstaendnissen pro Woche

NACHHER (mit Fintutto):
  1 Briefing x 20 Min = alle verstehen gleichzeitig
  Zeitersparnis: 80% pro Briefing
  Missverstaendnisse: drastisch reduziert
```

## Call to Action

> **Sofort einsetzbar**: Oeffnen Sie translator.fintutto.cloud auf einem beliebigen Geraet. Keine Installation, keine Registrierung, keine Kosten. Fuer institutionelle Nutzung bieten wir kostenlose Schulungen an — kontaktieren Sie uns.

---

# PITCH 5: Bildungseinrichtungen

## Das Problem

Eine Willkommensklasse: 18 Schueler aus 9 Laendern. Eine Lehrerin, die Deutsch spricht. Wie erklaert man Mathematik, wenn die Haelfte der Klasse kein Wort Deutsch versteht?

**Heute**: Schueler sitzen stumm da. Aeltere Geschwister werden als Dolmetscher aus dem eigenen Unterricht geholt. Integration verzoegert sich um Monate.

## Die Loesung

```
┌─────────────────────────────────────────────┐
│         WILLKOMMENSKLASSE                    │
│                                              │
│  LEHRERIN spricht:                          │
│  "Oeffnet bitte Seite 34.                    │
│   Wir rechnen heute Brueche."                │
│                                              │
│  Tablet 1 (Ukrainisch):                     │
│  "Відкрийте, будь ласка, сторінку 34."       │
│                                              │
│  Tablet 2 (Arabisch):                       │
│  "افتحوا الصفحة 34 من فضلكم."               │
│                                              │
│  Tablet 3 (Dari):                           │
│  "لطفاً صفحه ۳۴ را باز کنید."               │
│                                              │
│  🔊 Auto-Speak: Jedes Tablet liest vor      │
└─────────────────────────────────────────────┘
```

## Key Features fuer Bildung

| Feature | Nutzen im Unterricht |
|---------|---------------------|
| **Live-Broadcast** | Lehrer spricht, alle Schueler lesen in ihrer Sprache |
| **Auto-Speak** | Uebersetzung wird automatisch vorgelesen |
| **Untertitel-Modus** | Grosse Schrift auf Tablet/Beamer |
| **Gespraechsmodus** | 1:1 Elterngespraech mit nicht-deutschsprachigen Eltern |
| **Phrasebook** | Schul-relevante Phrasen vorbereitet |
| **Kontextmodus** | "Bildung": Fachbegriffe korrekt uebersetzt |
| **Favoriten** | Haeufige Erklaerungen speichern und wiederverwenden |
| **Kamera-OCR** | Arbeitsblatt fotografieren → sofort uebersetzt |
| **Offline** | Funktioniert auch in Schulen mit schlechtem WiFi |

## Einsatzszenarien

1. **Willkommensklassen**: Unterricht in Echtzeit uebersetzen
2. **Elterngespraeche**: Gespraechsmodus mit RTL-Unterstuetzung
3. **Elternabende**: Live-Session fuer alle Eltern gleichzeitig
4. **Sprachfoerderung**: Schueler hoeren korrekte Aussprache via HD-TTS
5. **Pruefungsvorbereitung**: Aufgabenstellungen in Muttersprache verstehen
6. **VHS/Sprachkurse**: Erklaerungen in der Muttersprache der Lernenden

## Preismodell fuer Bildung

| Tier | Preis | Leistung |
|------|-------|----------|
| **Lehrer (Einzeln)** | Kostenlos | Basis-Features, Cloud, 5 Listener |
| **Schule** | 79 EUR/Monat | 30 Geraete, Offline, HD-TTS, Support |
| **Schultraeger** | Auf Anfrage | Unbegrenzt, MDM, LDAP, Fortbildung |

## Call to Action

> **Pilotschule werden**: Wir statten 1 Willkommensklasse kostenlos fuer 3 Monate aus — inklusive Tablets, Einrichtung und Lehrerfortbildung. Bewerben Sie sich jetzt.

---

# PITCH 6: Tourismus-Unternehmen

## Das Problem

Ein Reisebusunternehmen faehrt 48 Touristen durch die Alpen. 6 Nationalitaeten. Der Reiseleiter spricht Deutsch und Englisch. Die Haelfte der Gruppe versteht ihn nicht — und beschwert sich in der Bewertung.

**Heute**: Reiseleiter wiederholen alles 2-3x in verschiedenen Sprachen. Oder sie beschraenken sich auf Englisch und verlieren die anderen Gaeste. Bewertungen sinken. Buchungen gehen zurueck.

## Die Loesung

```
┌─────────────────────────────────────────────────────┐
│                   REISEBUS                           │
│                                                      │
│  ┌──────────┐                                        │
│  │Reiseleiter│  "Rechts sehen Sie das Schloss        │
│  │🎤 Spricht │   Neuschwanstein, erbaut 1869..."     │
│  └─────┬────┘                                        │
│        │                                             │
│  ┌─────┴────────────────────────────────────────┐    │
│  │            HOTSPOT-MODUS                      │    │
│  │  (Kein Internet im Bus noetig!)               │    │
│  └─────┬────────────────────────────────────────┘    │
│        │                                             │
│  Reihe 1:  🇪🇸 Spanisch  🇪🇸 Spanisch              │
│  Reihe 2:  🇯🇵 Japanisch  🇰🇷 Koreanisch            │
│  Reihe 3:  🇨🇳 Chinesisch  🇹🇭 Thailaendisch        │
│  Reihe 4:  🇻🇳 Vietnamesisch  🇮🇩 Indonesisch       │
│  ...                                                 │
│  Jeder liest + hoert auf dem eigenen Handy           │
└─────────────────────────────────────────────────────┘
```

## Key Features fuer Tourismus

| Feature | Nutzen |
|---------|--------|
| **Hotspot-Modus** | Bus, Schiff, Berge — funktioniert ohne Mobilfunk |
| **45 Sprachen** | Asiatische Tourismus-Maerkte: ZH, JA, KO, TH, VI, ID, MS, FIL |
| **QR-Code WiFi** | Gaeste verbinden sich automatisch mit dem Hotspot |
| **HD-Sprachausgabe** | Chirp 3 HD: klingt wie ein echter Reiseleiter |
| **Untertitel-Modus** | Grosse Schrift — lesbar auch im fahrenden Bus |
| **Session-Protokoll** | Tour als Erinnerung per E-Mail an Gaeste |
| **BLE-Modus** | Kein WiFi, kein Hotspot — reines Bluetooth genuegt |
| **Kamera-Uebersetzer** | Speisekarte, Schild, Inschrift → sofort uebersetzt |

## Tourismus-Sprachen

| Markt | Sprachen | Touristenzahlen (DE, 2024) |
|-------|----------|---------------------------|
| Ostasien | ZH, JA, KO | ~3 Mio Uebernachtungen |
| Suedostasien | TH, VI, ID, MS, FIL | ~1.5 Mio |
| Naher Osten | AR, FA, HE, TR | ~2 Mio |
| Osteuropa | PL, CZ, RU, UK, HU, RO, BG, HR, SR, SK | ~8 Mio |
| Skandinavien | SV, DA, NO, FI | ~3 Mio |

## Kostenvergleich

```
AUDIO-GUIDE-SYSTEM (pro Bus):
  48 Geraete x 50 EUR (Kauf)           = 2.400 EUR
  + Wartung, Laden, Hygiene             = 200 EUR/Monat
  + Nur 3-5 Sprachen verfuegbar
  + Content-Erstellung pro Sprache      = 500 EUR/Sprache

MIT FINTUTTO:
  Lizenz                                = 49 EUR/Monat
  Hardware                              = 0 EUR (Gaeste nutzen eigene Handys)
  Sprachen                              = 45 (sofort, ohne Content-Erstellung)

  ERSPARNIS: 98% im ersten Jahr
  + Live statt voraufgezeichnet = authentischer
```

## Einsatzszenarien

1. **Bustouren**: Stadtrundfahrten, Alpenpaesse, Weinregionen
2. **Kreuzfahrtschiffe**: Ausfluege, Sicherheitsbriefing, Entertainment
3. **Bootstouren**: Hafenrundfahrten, Fjord-Touren
4. **Wandertouren**: BLE-Modus im Gebirge ohne Mobilfunk
5. **Hop-on-Hop-off**: QR-Code im Bus, Gaeste steigen ein und sind verbunden
6. **Hotels**: Concierge, Wellness-Erklaerungen, Cooking Classes

## Preismodell fuer Tourismus

| Tier | Preis | Leistung |
|------|-------|----------|
| **Solo Guide** | 29 EUR/Monat | 1 Guide, 20 Listener, Cloud + Hotspot |
| **Unternehmen** | 99 EUR/Monat | 5 Guides, 50 Listener, HD-TTS, BLE |
| **Flotte** | 249 EUR/Monat | 20 Guides, unbegrenzt Listener, White-Label |
| **Kreuzfahrt** | Auf Anfrage | Enterprise, Multi-Deck, API-Integration |

## Call to Action

> **Naechste Tour testen**: Starten Sie eine Live-Session auf Ihrer naechsten Tour. Kein Vertrag, kein Risiko. Wenn Ihre Gaeste begeistert sind — und das werden sie — sprechen wir ueber die Lizenz.

---

# PITCH 7: Medical / Gesundheitswesen

## Das Problem

Patient spricht kein Deutsch, Arzt braucht Anamnese, Notaufnahme hat keine Dolmetscher. Missverstaendnisse koennen lebensgefaehrlich sein. Telefondolmetscher: 80-120 EUR/h, oft nicht sofort verfuegbar.

## Die Loesung

**Medical Translator App** (medical-staff + medical-patient). Gespraechsmodus am Tablet, med. Phrasebook (Schmerzskala, Symptome, Medikamente, Notfall-Phrasen), RTL-Sprachen, Offline-Modus.

## Key Features fuer Gesundheitswesen

| Feature | Nutzen |
|---------|--------|
| **Med. Phrasebook** | Anamnese, Schmerzskala 1-10, Symptome, Medikamente, Allergien, OP-Aufklaerung |
| **Datenschutz-Modus** | Keine Speicherung von Patientengespraechen |
| **Offline-Modus** | Funktioniert in der Notaufnahme ohne Internet |
| **10 Migrationssprachen** | Farsi, Dari, Paschtu, Kurdisch, Tigrinya, Amharisch, Somali, Urdu, Bengali, Albanisch |
| **Gespraechsmodus** | Bidirektionale Kommunikation am Tablet |
| **Formelle Anrede** | Professionelle Kommunikation mit Patienten |

## ROI-Berechnung

```
OHNE Fintutto:
  5 gescheiterte Arzt-Patient-Gespraeche/Tag x 150 EUR = 750 EUR/Tag

MIT Fintutto:
  Lizenz: 79 EUR/Monat

ERSPARNIS: ~17.000 EUR/Jahr
```

## Einsatzszenarien

1. **Notaufnahme**: Schnelle Kommunikation in Akutsituationen
2. **Arztpraxis**: Anamnese und Behandlungserklaerung
3. **Apotheke**: Medikamentenausgabe und Dosierungshinweise
4. **Pflegeheim**: Taegliche Kommunikation mit Bewohnern
5. **Geburtshilfe**: Begleitung waehrend Schwangerschaft und Geburt
6. **Psychiatrie/Psychotherapie**: Therapeutische Gespraeche

## Preismodell fuer Medical

| Tier | Preis | Leistung |
|------|-------|----------|
| **Praxis** | 79 EUR/Monat | 3 Geraete, Gespraechsmodus, Med. Phrasebook |
| **Klinik** | 249 EUR/Monat | 10 Geraete, Offline, Priority Support |
| **Krankenhaus** | Auf Anfrage | Unbegrenzt, MDM, LDAP-Integration |

## Call to Action

> **Jetzt testen**: Starten Sie einen 30-Tage-Piloten in Ihrer Praxis oder Klinik. Wir richten alles ein und schulen Ihr Team. Kein Risiko, keine Vertragsbindung.

---

# PITCH 8: Hospitality / Empfang / Counter

## Das Problem

Rezeptionist spricht Englisch, Gast spricht nur Mandarin. Haende-und-Fuesse-Kommunikation. Negative Bewertungen. Messestand mit internationalen Besuchern — Produkterklaerungen scheitern.

## Die Loesung

**Counter Translator App** (counter-staff + counter-guest). Bidirektionale Echtzeit-Uebersetzung am Counter, Empfang, Schalter. Tourismussprachen + asiatische Maerkte.

## Key Features fuer Hospitality

| Feature | Nutzen |
|---------|--------|
| **Bidirektionaler Gespraechsmodus** | Echtzeit-Kommunikation am Schalter |
| **45 Sprachen** | Inkl. ZH, JA, KO, TH, VI, ID |
| **Counter-Modus** | Optimiert fuer Schalter/Empfang |
| **Kamera-OCR** | Reisepass, Formulare scannen und uebersetzen |
| **Phrasebook** | Hotel, Restaurant, Shopping — vorgefertigte Phrasen |

## ROI-Berechnung

```
OHNE Fintutto:
  3 verlorene Buchungen/Woche x 200 EUR = 2.400 EUR/Monat

MIT Fintutto:
  Lizenz: 99 EUR/Monat

ERSPARNIS: ~2.300 EUR/Monat
```

## Einsatzszenarien

1. **Hotel-Rezeption**: Check-in, Concierge, Beschwerdemanagement
2. **Restaurant**: Bestellungen, Allergien, Empfehlungen
3. **Messestand**: Produkterklaerungen fuer internationale Besucher
4. **Einzelhandel (Luxus/Tax-Free)**: Beratung und Verkauf
5. **Tourist-Info**: Auskuenfte und Empfehlungen
6. **Flughafen-Counter**: Boarding, Umbuchungen, Gepaeck

## Preismodell fuer Hospitality

| Tier | Preis | Leistung |
|------|-------|----------|
| **Einzelplatz** | 49 EUR/Monat | 1 Geraet, Gespraechsmodus, Phrasebook |
| **Business** | 99 EUR/Monat | 3 Schalter, Counter-Modus, OCR |
| **Enterprise** | Auf Anfrage | Multi-Standort, White-Label, API |

## Call to Action

> **Testen Sie es an Ihrem Empfang**: Starten Sie eine Live-Session am Tablet. Kein Vertrag, kein Risiko. Ihre Gaeste werden den Unterschied sofort bemerken.

---

*Alle Preise sind Vorschlaege und koennen angepasst werden. 8 Pitch Decks fuer verschiedene Zielgruppen. Stand: 16.03.2026 | Fintutto Translator v5.2*
