# Copy-Audit: guidetranslator.com Website-Copy vs. Realitaet
## Kritische Diskrepanzen, Empfehlungen & Priorisierung

**Stand: Februar 2026**

---

## Executive Summary

Die Website-Copy beschreibt ein **deutlich ambitionierteres Produkt** als das, was aktuell existiert. Das ist fuer eine Marketing-Website normal ("sell the vision"), aber einige Behauptungen sind **gefaehrlich**, weil sie konkrete technische Fakten vortaeuschen, die ein Kunde sofort ueberpruefen kann. Andere sind **korrekt positioniert** und muessen nur mit der Produkt-Roadmap synchronisiert werden.

### Ampel-System:

- **ROT**: Falschaussage -- Kunde merkt es sofort, Vertrauensverlust
- **GELB**: Uebertreibung -- vertretbar wenn bald geloest, aber riskant
- **GRUEN**: Korrekt oder Vision, die zeitnah umsetzbar ist

---

## 1. KRITISCHE DISKREPANZEN (ROT -- sofort korrigieren)

### 1.1 "130+ Sprachen" vs. tatsaechlich 22

| Copy behauptet | Realitaet | Risiko |
|---|---|---|
| "Ueber 130 Sprachen und Dialekte" | **22 Sprachen** in `languages.ts` | **HOCH** -- sofort ueberpruefbar |
| "130+ Sprachen in Echtzeit" (Hero) | Google Cloud API unterstuetzt ~130, aber die App bietet nur 22 an | Technisch koennte man 130 zeigen, aber Offline nur fuer ~20 |
| "Darunter Katalanisch, Baskisch, Tagalog" | Keine dieser Sprachen in der App | Kunde versucht Katalanisch -> existiert nicht |

**Empfehlung**:
- **Option A (ehrlich)**: "22+ Sprachen, mit Offline-Unterstuetzung" -- und dann schrittweise erweitern
- **Option B (technisch korrekt)**: Google Translate API auf 130+ Sprachen oeffnen (Online-only), aber klar kennzeichnen welche offline verfuegbar sind. Das erfordert nur eine Erweiterung von `languages.ts` -- die API kann es bereits.
- **Empfohlen: Option B** -- languages.ts um die Google-unterstuetzten Sprachen erweitern, in der UI als "Online" vs "Offline verfuegbar" kennzeichnen.

### 1.2 "Fuer weniger als 1 Cent pro Teilnehmer" -- irreführend

| Copy | Realitaet | Problem |
|---|---|---|
| "<1¢ pro Teilnehmer pro Fuehrung" | API-Kosten allein sind ~1-3 Cent/Passagier (Neural2: ~1.6 Cent) | Copy rechnet nur WaveNet ($0.004) und ignoriert Translation-Kosten |
| "~€0,004/Passagier/Ausflug (WaveNet)" | Korrekt fuer TTS allein, aber Translation kommt dazu | TTS + Translation zusammen = ~1-3 Cent |

**Empfehlung**:
- "Ab 1 Cent pro Teilnehmer" statt "<1 Cent" -- immer noch beeindruckend guenstig
- Oder: "Ab 0,4 Cent pro Teilnehmer (WaveNet)" mit Fussnote zu Translation-Kosten

### 1.3 "FinTuttO GmbH" vs. "ai tour ug (haftungsbeschraenkt)"

| Copy | Realitaet |
|---|---|
| "Ein Produkt von FinTuttO GmbH" | Firma ist **ai tour ug (haftungsbeschraenkt)** |
| "FinTuttO ist ein deutsches Software-Unternehmen" | fintutto.cloud existiert als Oekosystem-Brand, aber die Rechtsform ist UG nicht GmbH |
| "Ueber-uns"-Seite: "FinTuttO GmbH mit Sitz in [Stadt]" | Sitz ist Kolonie 2, 18317 Saal, DE |

**Empfehlung**:
- Impressum/Ueber-uns MUSS die korrekte Rechtsform nennen: "ai tour ug (haftungsbeschraenkt)"
- Marketing-Texte koennen "FinTuttO" als Dachmarke verwenden, solange Impressum korrekt ist
- **Rechtliches Risiko**: Falsche Rechtsform im Impressum kann abgemahnt werden (§ 5 TMG)

### 1.4 Enterprise-Preise ohne existierendes Backend

| Copy | Realitaet |
|---|---|
| "Pilot ab €2.990/Monat" | **Kein Zahlungssystem, kein Backend, kein Auth** |
| "Fleet ab €9.990/Monat" | Kein Account-System, kein Team-Management |
| "Stripe fuer Zahlungsabwicklung" | **Stripe ist nicht integriert** |
| "Dashboard fuer Shore Excursion Manager" | Existiert nicht |
| "SLA: 99,9% Uptime" | Kein Monitoring, kein SLA-Framework |

**Empfehlung**:
- Enterprise-Preise NUR auf sales.guidetranslator.com zeigen (kann als "Kontaktieren Sie uns"-Formular starten)
- Auf guidetranslator.com: "Preise auf Anfrage" fuer Enterprise
- Free/Pro/Premium Plaene koennen stehen, aber mit "Coming soon" oder "Aktuell: Kostenlose Beta"
- **Empfohlen**: Launch als "Open Beta -- kostenlos" -> dann Paid Plans einfuehren

### 1.5 "2-4 Sekunden Latenz"

| Copy | Realitaet |
|---|---|
| "2-4 Sekunden Latenz" | Speech Recognition (variable) + Translation API (~0.5-1s) + TTS Generation (~0.5-1s) + Supabase Broadcast (~0.2s) = **realistisch 3-8 Sekunden End-to-End** |
| "Bei vorbereiteten Texten: 0 Sekunden Latenz" | Pre-translated scripts nicht implementiert |

**Empfehlung**: "3-6 Sekunden" oder "wenige Sekunden" -- ehrlicher und immer noch beeindruckend

### 1.6 app.guidetranslator.com existiert nicht

| Copy | Realitaet |
|---|---|
| Alle CTAs linken zu `app.guidetranslator.com/register` | **Subdomain existiert nicht** |
| "Registrieren Sie sich kostenlos" | **Kein Auth-System vorhanden** |
| Login, Dashboard, Team-Management | Nichts davon existiert |

**Empfehlung**:
- Kurzfristig: Alle CTAs auf `guidetranslator.com/live` linken (die existierende Live-Session)
- Mittelfristig: app.guidetranslator.com als separates Next.js/Remix-Projekt mit Supabase Auth

---

## 2. UEBERTREIBUNGEN (GELB -- korrigieren oder bald implementieren)

### 2.1 "93% Kostenersparnis vs. mehrsprachige Guides"

| Behauptung | Analyse |
|---|---|
| "8 Guides × €300/Tag = €2.400" | Realistisch, aber nicht alle Exkursionen brauchen 8 Guides |
| "~€32.500/Schiff/Jahr" mit GT | Lizenz + API korrekt kalkuliert, aber setzt voraus dass ALLE Exkursionen umgestellt werden |
| "93% Ersparnis" | Best-Case, nicht typisch. Realistischer: 50-80% Ersparnis (weil einige Guides weiterhin gebraucht werden) |

**Empfehlung**: "Bis zu 80% Ersparnis" -- glaubwuerdiger und immer noch attraktiv

### 2.2 "Keine App, kein Download noetig" -- korrekt aber mit Vorbehalt

| Behauptung | Realitaet |
|---|---|
| "Kein App-Download noetig (laeuft im Browser)" | **Korrekt** -- PWA im Browser, QR-Code-Zugang |
| Impliziert: Funktioniert sofort | Audio-Autoplay wird von Browsern geblockt -- User muss einmal tippen |

**Empfehlung**: Korrekt. Kleiner Hinweis hinzufuegen: "Einmal tippen um Audio zu aktivieren"

### 2.3 "Google Neural2 / Chirp 3 HD Stimmen"

| Behauptung | Realitaet |
|---|---|
| "WaveNet, Neural2, Chirp 3 HD verfuegbar" | App nutzt Google TTS, aber nur eine Stimme-Klasse (konfigurierbar in tts.ts) |
| "220+ Stimmen in 40+ Sprachen" | Google-seitig korrekt, aber die App bietet keine Stimm-Auswahl |
| Plan-Differenzierung nach Stimmqualitaet | Nicht implementiert -- alle Nutzer bekommen dieselbe Stimme |

**Empfehlung**:
- Technisch machbar: TTS-Stimmqualitaet ist ein API-Parameter
- Implement: Plan-basierte Stimmqualitaet ist ein gutes Differenzierungsmerkmal und einfach umzusetzen

### 2.4 "Offline-Modus fuer vorbereitete Touren (Premium)"

| Behauptung | Realitaet |
|---|---|
| "Offline-Audio-Dateien fuer jeden Tourpunkt" | **Nicht implementiert** -- Offline = Opus-MT On-Device-Uebersetzung |
| "Vorbereitete Skripte: 0 Sekunden Latenz" | Kein Skript-System vorhanden |

**Empfehlung**:
- Kurzfristig: Entfernen oder als "Roadmap" kennzeichnen
- Mittelfristig: Pre-translated + Pre-synthesized Tour-Skripte als Feature bauen (hoher Wert!)

### 2.5 Feature-Claims die teilweise existieren

| Feature in Copy | Status im Code | Gap |
|---|---|---|
| "QR-Code scannen" | **Existiert** (SessionQRCode.tsx) | Kein Gap |
| "Sprache waehlen" | **Existiert** (LanguageChips.tsx) | Kein Gap |
| "Live-Uebersetzung" | **Existiert** (useLiveSession.ts) | Kein Gap |
| "Spracherkennung" | **Existiert** (Web Speech API + Whisper) | Kein Gap |
| "Offline-Modus" | **Existiert** (Opus-MT, Service Worker) | Kein Gap |
| "Statistiken: Teilnehmer, Sprachen" | **Teilweise** (Presence zeigt Listener, aber kein Dashboard) | Mittel |
| "Tour-Skripte erstellen" | **Existiert nicht** | Gross |
| "Team-Verwaltung" | **Existiert nicht** | Gross |
| "White-Label" | **Existiert nicht** | Gross |
| "API-Zugang" | **Existiert nicht** (kein REST API) | Gross |
| "SSO" | **Existiert nicht** | Gross |
| "Rollenbasierte Zugriffskontrolle" | **Existiert nicht** | Gross |

---

## 3. KORREKT POSITIONIERT (GRUEN)

Diese Aussagen stimmen oder sind als Vision vertretbar:

| Behauptung | Status |
|---|---|
| "KI-gestuetzte Echtzeit-Uebersetzung" | **Korrekt** |
| "QR-Code scannen, Sprache waehlen, hoeren" | **Korrekt** |
| "Kein App-Download noetig" | **Korrekt** (PWA) |
| "DSGVO-konform, EU-Server" | **Korrekt** (Supabase EU, Google EU) |
| "Funktioniert auf jedem Smartphone (iOS + Android)" | **Korrekt** |
| "Google Cloud Translation / TTS" | **Korrekt** |
| "Sprachbarrieren kosten Kunden und Geld" | **Korrekt** (belegt in Competitive Analysis) |
| "Sprachgruppen-Stornierungen bei Kreuzfahrten" | **Korrekt** (belegt in Competitive Analysis) |
| "Teilnehmer-Daten werden nicht erfasst" | **Korrekt** (keine PII gespeichert) |
| Problem-Section (Startseite) | **Exzellent formuliert** -- alle 4 Pain Points real |
| "So funktioniert's" (3 Schritte) | **Korrekt** -- genau so funktioniert die Live-Session |

---

## 4. COPY-QUALITAET: Was gut ist

### 4.1 Hervorragend

- **Problem-Formulierung** auf der Startseite -- alle 4 Karten treffen echte Pain Points
- **"So funktioniert's"** -- 3 Schritte sind exakt der aktuelle Flow
- **Kreuzfahrt-Seite** -- extrem gut recherchiert und argumentiert
- **Preisstruktur** -- logisch aufgebaut, klare Zielgruppen-Differenzierung
- **FAQ** -- beantworten die richtigen Fragen
- **SEO-Keywords** -- gut recherchiert, Long-Tail-Keywords sinnvoll
- **URL-Struktur** -- sauber, hierarchisch, UTM-Parameter fuer Ulrich vorbereitet
- **Enterprise-Kalkulator-Idee** (sales.guidetranslator.com) -- hervorragend fuer B2B-Vertrieb
- **"Ihr Guide spricht eine Sprache. Ihre Gaeste hoeren alle."** -- perfekter H1

### 4.2 Verbesserungsvorschlaege (Copy)

| Stelle | Aktuell | Vorschlag |
|---|---|---|
| Hero-Badge | "KI-gestuetzte Echtzeit-Uebersetzung" | **"Jetzt in der Beta -- kostenlos testen"** (ehrlicher, erzeugt Dringlichkeit) |
| Kennzahlen-Leiste | "130+ Sprachen" | **"22+ Sprachen (130+ in Planung)"** oder erst umsetzen, dann behaupten |
| Kennzahlen-Leiste | "<1¢ pro Teilnehmer" | **"Ab 1¢ pro Teilnehmer"** |
| Kennzahlen-Leiste | "2-4 Sekunden Latenz" | **"Wenige Sekunden Latenz"** |
| Kennzahlen-Leiste | "93% Kostenersparnis" | **"Bis zu 80% Ersparnis"** |
| Vergleich-Section | "€480.000/Schiff/Jahr" | Behalten -- sehr effektiv, aber als "Beispiel" kennzeichnen |
| Enterprise-Preise | Feste Preise ab €2.990/Monat | **"Preise auf Anfrage"** bis Backend existiert |
| Testimonials | Platzhalter | **Entfernen** bis echte Testimonials vorhanden -- leere Platzhalter wirken unserioes |
| "Powered by" Logos | "Google Cloud AI • Google TTS • Google Cloud Translation" | **Korrekt** -- Google erlaubt "Powered by Google Cloud" Badge |

---

## 5. SEITEN-PRIORISIERUNG: Was zuerst bauen?

### Tier 1: Sofort (vor dem ersten Pitch)

| Seite | Aufwand | Warum zuerst |
|---|---|---|
| **Startseite (/)** | 2-3 Tage | Erste Impression. Hero + Problem + "So funktioniert's" + CTA zu /live |
| **Kreuzfahrt-Seite (/loesungen/kreuzfahrt)** | 1-2 Tage | Ulrichs primaere Vertriebsseite. Link fuer E-Mails an MSC/Costa/Shoretime |
| **Impressum + Datenschutz** | 0.5 Tage | Rechtlich zwingend. Korrekte Rechtsform! |

### Tier 2: Vor dem Pilot (4-6 Wochen)

| Seite | Aufwand | Warum |
|---|---|---|
| **Preise (/preise)** | 1 Tag | Kunden fragen nach Preisen. Kann als "Beta -- kostenlos" starten |
| **Funktionen (/funktionen)** | 1 Tag | Feature-Uebersicht fuer technische Entscheider |
| **sales.guidetranslator.com** | 3-5 Tage | Enterprise-Kalkulator -- Ulrichs wichtigstes Vertriebstool |

### Tier 3: Nach dem Pilot

| Seite | Aufwand | Warum |
|---|---|---|
| Stadtfuehrer (/loesungen/stadtfuehrer) | 1 Tag | Breiterer Markt, aber nicht Primaerfokus |
| Agenturen (/loesungen/agenturen) | 1 Tag | Wichtig, aber nach Cruise-Fokus |
| Enterprise (/loesungen/enterprise) | 1 Tag | Museen, Events -- spaeter |
| Ueber uns (/ueber-uns) | 0.5 Tag | Nice-to-have, aber nicht kritisch |
| app.guidetranslator.com | 2-4 Wochen | SaaS-Dashboard -- groesstes Projekt |

---

## 6. ARCHITEKTUR-EMPFEHLUNG: Wie die Website implementieren

### Option A: Alles in der bestehenden React-App (NICHT empfohlen)

Marketing-Seiten und App in einem Repo vermischen = schlechte SEO (React SPA), langsame Ladezeit, schwer wartbar.

### Option B: Separates Marketing-Repo (EMPFOHLEN)

```
guidetranslator.com          → Next.js / Astro (statische Marketing-Website, SSR/SSG fuer SEO)
app.guidetranslator.com      → Bestehende React-App (PWA, Live-Sessions, Offline)
sales.guidetranslator.com    → Separates Tool (React oder Next.js, Kalkulator)
```

**Vorteile:**
- Marketing-Seiten sind **SEO-optimiert** (SSR/SSG, kein Client-Side-Rendering)
- App bleibt **schnell und leicht** (kein Marketing-Ballast)
- Unabhaengige Deployments (Marketing kann sich aendern ohne App-Release)
- sales.guidetranslator.com kann **Ulrich-spezifisch** gestaltet werden

**Tech-Empfehlung fuer Marketing-Site:**
- **Astro** (statisch, schnell, SEO-perfekt, Tailwind-kompatibel) ODER
- **Next.js** (wenn spaeter Blog/dynamische Inhalte geplant)
- Hosting: Vercel (wie die App)

### Option C: Hybrid (PRAGMATISCH)

```
guidetranslator.com/          → Neue Landingpage (in bestehender App als neue Route)
guidetranslator.com/app/      → Bestehende App-Features (Translator, Live, Settings)
sales.guidetranslator.com     → Separates Kalkulator-Tool
```

In der bestehenden App: Marketing-Seiten als normale React-Seiten hinzufuegen, aber mit Pre-Rendering (z.B. vite-plugin-ssr oder react-snap).

---

## 7. DOMAIN-STRATEGIE

### Aktuelle Situation:
- `guidetranslator.com` -- zeigt die bestehende App (PWA)
- `guidetranslator.de` -- vermutlich Redirect auf .com
- `translator.fintutto.cloud` -- Legacy-Backend/Alt-Domain
- `sales.guidetranslator.com` -- existiert noch nicht

### Empfehlung:

| Domain | Inhalt | Prioritaet |
|---|---|---|
| `guidetranslator.com` | Marketing-Website (Startseite, Loesungen, Preise, etc.) | HOCH |
| `app.guidetranslator.com` | Die PWA/App (Live-Sessions, Uebersetzer, Offline) | HOCH |
| `sales.guidetranslator.com` | Enterprise-Kalkulator (Ulrichs Vertriebstool) | HOCH |
| `guidetranslator.de` | Redirect auf guidetranslator.com | NIEDRIG |
| `api.guidetranslator.com` | REST API (wenn gebaut) | SPAETER |

### Uebergangs-Strategie (sofort machbar):

Bis die Trennung implementiert ist:
1. `guidetranslator.com/` -> neue Landingpage (in bestehender App)
2. `guidetranslator.com/translate` -> bisheriger Textuebersetzer
3. `guidetranslator.com/live` -> bisherige Live-Session (unveraendert)
4. `guidetranslator.com/loesungen/kreuzfahrt` -> statische Seite (in App)

---

## 8. HANDLUNGSEMPFEHLUNGEN NACH PRIORITAET

### SOFORT (diese Woche):

1. **Rechtsform korrigieren**: "ai tour ug (haftungsbeschraenkt)" statt "FinTuttO GmbH" im Impressum/Copy
2. **"130+ Sprachen" korrigieren**: Entweder auf "22+" aendern ODER `languages.ts` um Google-API-Sprachen erweitern (Online-only)
3. **Testimonial-Platzhalter entfernen** -- leere Zitate wirken unserioes
4. **"<1 Cent" korrigieren** auf "Ab 1 Cent" oder "Ab 0,4 Cent (WaveNet)"

### KURZFRISTIG (2 Wochen):

5. **Landingpage implementieren** -- Hero + Problem + "So funktioniert's" + CTA
6. **Kreuzfahrt-Seite implementieren** -- Ulrichs Vertriebsseite
7. **Meta-Tags aktualisieren** -- SEO-optimiert wie in der Copy beschrieben
8. **CTAs anpassen**: Statt `app.guidetranslator.com/register` -> `guidetranslator.com/live` (existiert)

### MITTELFRISTIG (4-8 Wochen):

9. **sales.guidetranslator.com** bauen -- Enterprise-Kalkulator
10. **Preisseite** implementieren -- mit "Beta: Aktuell kostenlos" Hinweis
11. **i18n** -- Website-Copy in EN + DE mindestens
12. **languages.ts erweitern** -- 130+ Sprachen (Online-only) mit klarer Kennzeichnung

### LANGFRISTIG (3+ Monate):

13. **app.guidetranslator.com** als separates SaaS-Dashboard
14. **Stripe-Integration** fuer Paid Plans
15. **Team-Management, White-Label, API** -- wie in Copy beschrieben

---

## 9. COPY-AENDERUNGEN IM DETAIL

### Startseite: Was aendern

```
VORHER (Copy):
"130+ Sprachen in Echtzeit"
"<1¢ pro Teilnehmer pro Fuehrung"
"2-4 Sekunden Latenz"
"93% Kostenersparnis vs. mehrsprachige Guides"

NACHHER (empfohlen):
"22+ Sprachen in Echtzeit (130+ in Planung)"    -- oder 130+ wenn languages.ts erweitert
"Ab 1¢ pro Teilnehmer pro Fuehrung"             -- ehrlicher
"Wenige Sekunden Latenz"                         -- flexibler
"Bis zu 80% Kostenersparnis"                     -- glaubwuerdiger
```

### Kreuzfahrt-Seite: Was aendern

```
VORHER:
"€480.000 pro Schiff pro Jahr. Fuer 6 Sprachen."

NACHHER:
"Bis zu €480.000 pro Schiff pro Jahr. Fuer nur 6 Sprachen."
(Kleines "Bis zu" macht die Aussage verteidigbar)
```

```
VORHER:
"93% Ersparnis"

NACHHER:
"Bis zu 93% Ersparnis bei Voll-Umstellung"
(Qualifier hinzufuegen)
```

### Ueber uns: Was aendern

```
VORHER:
"FinTuttO ist ein deutsches Software-Unternehmen mit Sitz in [Stadt]."
"GuideTranslator ist ein Produkt von FinTuttO GmbH"

NACHHER:
"GuideTranslator ist ein Produkt der ai tour ug (haftungsbeschraenkt),
 Teil des FinTuttO-Oekosystems. Sitz in Saal, Mecklenburg-Vorpommern."
```

### Preise: Was aendern

```
VORHER:
Alle Plaene mit festen Preisen und "Jetzt buchen" CTAs

NACHHER:
"BETA-PHASE: Alle Features derzeit kostenlos verfuegbar.
 Preismodelle werden in Q2 2026 eingefuehrt."

 [Jetzt kostenlos testen] → guidetranslator.com/live

Enterprise: "Preise und Konditionen auf Anfrage"
 [Kontakt aufnehmen] → sales.guidetranslator.com
```

---

## 10. ZUSAMMENFASSUNG

| Kategorie | Anzahl Issues |
|---|---|
| **ROT** (sofort korrigieren) | 6 |
| **GELB** (bald korrigieren) | 5 |
| **GRUEN** (korrekt) | 11 |

**Die Copy ist qualitativ hochwertig** -- das Problem ist nicht die Qualitaet, sondern die **Diskrepanz zum aktuellen Produktstand**. Die Loesung ist nicht die Copy umzuschreiben, sondern:

1. **Sofort**: Die 6 ROT-Issues korrigieren (Rechtsform, Sprachanzahl, Preis-Claims)
2. **Kurzfristig**: Die wichtigsten Seiten implementieren (Landing, Kreuzfahrt, Preise)
3. **Mittelfristig**: Das Produkt zur Copy aufholen lassen (130+ Sprachen, SaaS-Dashboard)

**Die Copy ist die Roadmap. Das Produkt muss jetzt zur Copy aufholen.**
