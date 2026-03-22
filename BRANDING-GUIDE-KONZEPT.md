# Fintutto Marken- und URL-Strategie

**Datum:** 2026-03-22
**Status:** Konzept / Diskussionsgrundlage
**Aufbauend auf:** NAMING-RECHERCHE.md (2026-03-16)

---

## 1. Markenhierarchie

```
Fintutto (Firma / absolute Dachmarke)
  |
  +-- Fintutto World (Dachmarke fuer alle Produkte)
        |
        +-- TRANSLATOR (Echtzeit-Uebersetzung)
        |     |
        |     +-- GuideTranslator      (Tourismus)
        |     +-- School Translator     (Bildung)
        |     +-- Medical Translator    (Gesundheit)
        |     +-- Conference Translator (Events/Kongresse)
        |     +-- Amt Translator        (Behoerden)
        |     +-- Counter Translator    (Hospitality/Retail)
        |     +-- Refugee Translator    (NGO/Soziales)
        |
        +-- GUIDE (Standort-basierte Fuehrer)
              |
              +-- Art Guide     (Museen & Ausstellungen)
              +-- City Guide    (Staedte & Stadtfuehrungen)
              +-- Region Guide  (Regionen & Landschaften)
              +-- Dating Guide  (Social/Dating-Situationen)
              +-- ... (weitere moeglich)
```

---

## 2. Produktnamen-Strategie

### Kernprinzip: **"Fintutto [Produkt]" + eigenstaendige Kurznamen**

Jedes Produkt bekommt zwei Namen:
1. **Vollname** (mit Dachmarke): "Fintutto Art Guide"
2. **Kurzname** (eigenstaendig nutzbar): "Art Guide"

Der Kurzname wird im Alltag, in der App, im App Store etc. verwendet.
Der Vollname erscheint im rechtlichen Kontext und auf der fintutto.world Plattform.

### Translator-Produkte

| Kurzname | Vollname | Zielgruppe |
|----------|----------|------------|
| **GuideTranslator** | Fintutto GuideTranslator | Tourismus (Stadtfuehrer, Agenturen, Kreuzfahrt) |
| **School Translator** | Fintutto School Translator | Schulen, Bildungseinrichtungen |
| **Medical Translator** | Fintutto Medical Translator | Aerzte, Kliniken, Apotheken |
| **Conference Translator** | Fintutto Conference Translator | Events, Kongresse, Messen |
| **Amt Translator** | Fintutto Amt Translator | Behoerden, Buergerbueros |
| **Counter Translator** | Fintutto Counter Translator | Hotels, Retail, Empfang |
| **Refugee Translator** | Fintutto Refugee Translator | NGOs, Beratungsstellen |

### Guide-Produkte

| Kurzname | Vollname | Zielgruppe | Einsatz |
|----------|----------|------------|---------|
| **Art Guide** | Fintutto Art Guide | Museen, Galerien, Ausstellungen | Audioguide + Uebersetzung fuer Kunstwerke |
| **City Guide** | Fintutto City Guide | Staedte, Tourismusbueros | Stadtfuehrer mit POIs, Routen, Uebersetzung |
| **Region Guide** | Fintutto Region Guide | Regionen, Naturparks, Landkreise | Regionale Erkundung, Wanderwege, Sehenswuerdigkeiten |
| **Dating Guide** | Fintutto Dating Guide | Social Events, internationales Dating | Echtzeit-Uebersetzung in sozialen Situationen |

### Bewertung der Guide-Produktnamen

**Art Guide** - EMPFOHLEN
- International sofort verstaendlich
- Kurz, griffig, beschreibend
- "Art" deckt Museen, Galerien, Skulpturenparks ab
- Passt perfekt als App-Name im Store

**City Guide** - EMPFOHLEN
- Etablierter Begriff im Tourismus
- Jeder versteht sofort, was es ist
- Funktioniert international

**Region Guide** - GUT, aber Alternativen pruefen
- Klar und beschreibend
- Moegl. Alternative: **"Explore Guide"** (klingt aktiver/spannender)
- Moegl. Alternative: **"Nature Guide"** (falls Fokus auf Natur/Outdoor)
- Empfehlung: "Region Guide" beibehalten - es ist am praezisesten

**Dating Guide** - PROBLEMATISCH
- Koennte mit Dating-Apps (Tinder etc.) verwechselt werden
- Moegl. Alternative: **"Social Guide"** (breiter, weniger Verwechslungsgefahr)
- Moegl. Alternative: **"Meet Guide"** (persoenlicher, weniger Dating-App-Assoziation)
- Empfehlung: **"Social Guide"** verwenden - deckt Dating UND allgemeine soziale Situationen ab

---

## 3. URL-Strategie

### Grundsatzentscheidung: Hybrid-Ansatz

**fintutto.world** als zentrales Portal + **eigene Domains fuer Flaggschiff-Produkte**

### Warum hybrid und nicht nur Subdomains?

| Aspekt | Nur Subdomains | Hybrid (empfohlen) |
|--------|---------------|-------------------|
| SEO | Alles unter einer Domain, geteilte Authority | Eigene Domains bauen eigene Authority auf |
| Branding | "artguide.fintutto.world" - lang | "guidetranslator.com" - einpraegsam |
| Flexibilitaet | Begrenzt auf fintutto.world | Produkte koennen eigenstaendig wachsen |
| Verwaltung | Einfacher (eine Domain) | Mehr Domains, aber ueberschaubar |
| Kosten | Minimal | Moderat (5-15 EUR/Domain/Jahr) |
| Skalierung | Subdomains werden uebersichtlich | Klare Trennung der Produktlinien |

### Empfohlene URL-Struktur

#### Ebene 1: Portal / Dachmarke

```
fintutto.world                    → Zentrales Portal / Ecosystem-Uebersicht
www.fintutto.world                → Redirect zu fintutto.world
fintutto.cloud                    → Backend / interne Services (besteht bereits)
```

#### Ebene 2: Translator-Produkte

```
guidetranslator.com               → GuideTranslator Hauptseite (besteht bereits)
guidetranslator.de                → Deutsche Version (besteht bereits)

translate.fintutto.world          → Allgemeiner Fintutto Translator (Consumer App)
```

**Market-spezifische Translator-Apps unter fintutto.world:**

```
school-teacher.fintutto.world     → School Translator (Lehrer)
school-student.fintutto.world     → School Translator (Schueler)
medical-staff.fintutto.world      → Medical Translator (Personal)
medical-patient.fintutto.world    → Medical Translator (Patient)
conference-speaker.fintutto.world → Conference Translator (Speaker)
conference-listener.fintutto.world → Conference Translator (Listener)
authority-clerk.fintutto.world    → Amt Translator (Sachbearbeiter)
authority-visitor.fintutto.world  → Amt Translator (Besucher)
counter-staff.fintutto.world      → Counter Translator (Mitarbeiter)
counter-guest.fintutto.world      → Counter Translator (Gast)
ngo-helper.fintutto.world         → Refugee Translator (Helfer)
ngo-client.fintutto.world         → Refugee Translator (Klient)
```

#### Ebene 3: Guide-Produkte

**Option A: Alles unter fintutto.world (EMPFOHLEN fuer den Start)**

```
artguide.fintutto.world           → Art Guide Portal & Visitor App
cityguide.fintutto.world          → City Guide Portal
regionguide.fintutto.world        → Region Guide Portal
socialguide.fintutto.world        → Social Guide Portal
```

**Plus White-Label-Subdomains fuer einzelne Kunden:**

```
[museum-name].artguide.fintutto.world     → z.B. kunsthalle.artguide.fintutto.world
[stadt-name].cityguide.fintutto.world     → z.B. hamburg.cityguide.fintutto.world
[region-name].regionguide.fintutto.world  → z.B. schwarzwald.regionguide.fintutto.world
```

**Option B: Eigene Domains (EMPFOHLEN bei Wachstum)**

Sobald ein Guide-Produkt signifikante Traktion hat, eigene Domain registrieren:

```
fintutto-artguide.com    → oder artguide.app / artguide.guide
fintutto-cityguide.com   → oder cityguide.app
fintutto-regionguide.com → oder regionguide.app
```

**Wichtig:** Die fintutto.world-Subdomains bleiben als permanente Aliase bestehen!

#### Empfehlung: Starte mit Option A, wechsle zu B bei Bedarf

Gruende:
1. Keine zusaetzlichen Domain-Kosten am Anfang
2. Alle Produkte profitieren von der fintutto.world SEO-Authority
3. Einheitliches SSL/DNS-Management
4. Bei Erfolg eines Produkts: eigene Domain dazukaufen und als primary setzen

---

## 4. Domain-Registrierungsplan

### Sofort sichern (falls noch nicht vorhanden)

| Domain | Zweck | Prio |
|--------|-------|------|
| `fintutto.world` | Zentral-Portal | HOCH (evtl. bereits vorhanden?) |
| `fintutto-artguide.com` | Reservierung fuer Art Guide | MITTEL |
| `fintutto-cityguide.com` | Reservierung fuer City Guide | MITTEL |

### Spaeter bei Bedarf

| Domain | Zweck | Wann |
|--------|-------|------|
| `artguide.guide` | Premium-Domain fuer Art Guide | Bei Markterfolg |
| `artguide.app` | App-fokussierte Domain | Bei App Store Launch |
| `cityguide.guide` | Premium-Domain fuer City Guide | Bei Markterfolg |
| `regionguide.guide` | Premium-Domain fuer Region Guide | Bei Markterfolg |

---

## 5. Branding-Regeln

### Logo-Systematik

```
Fintutto World Logo    = Dachmarke (auf Portal, Investoren-Material)
GuideTranslator Logo   = Translator-Produkt (besteht bereits)
Art Guide Logo         = Guide-Produkt (mit "powered by Fintutto" Badge)
City Guide Logo        = Guide-Produkt (mit "powered by Fintutto" Badge)
Region Guide Logo      = Guide-Produkt (mit "powered by Fintutto" Badge)
```

### Farbsystem nach Produktfamilie

```
Fintutto World:       #0369a1 (Sky Blue - Dachmarke, besteht bereits)
GuideTranslator:      #0369a1 (Sky Blue - Translator, besteht bereits)

Art Guide:            #8b5cf6 (Violet - Kunst & Kultur)
City Guide:           #f59e0b (Amber - Urban & Lebendig)
Region Guide:         #22c55e (Green - Natur & Region)
Social Guide:         #ec4899 (Pink - Sozial & Persoenlich)
```

### Naming-Konventionen in Code und Config

| Kontext | Muster | Beispiel |
|---------|--------|----------|
| App-ID | `world.fintutto.{produkt}` | `world.fintutto.artguide` |
| Subdomain | `{produkt}.fintutto.world` | `artguide.fintutto.world` |
| npm Package | `@fintutto/{produkt}` | `@fintutto/artguide-visitor` |
| Vercel-Projekt | `fw-{produkt}` | `fw-artguide` |
| Build-Script | `build:{produkt}` | `build:artguide-visitor` |
| Icon-Verzeichnis | `public/icons/{produkt}/` | `public/icons/artguide/` |

---

## 6. Zukunftsplanung: Weitere Guide-Produkte

### Potenzielle Erweiterungen (Phase 2+)

| Kurzname | Vollname | Einsatzbereich |
|----------|----------|---------------|
| **Campus Guide** | Fintutto Campus Guide | Universitaeten, Bildungscampus |
| **Event Guide** | Fintutto Event Guide | Messen, Festivals, Konferenzen |
| **Nature Guide** | Fintutto Nature Guide | Nationalparks, Wanderwege |
| **Cruise Guide** | Fintutto Cruise Guide | Kreuzfahrtschiffe |
| **Gastro Guide** | Fintutto Gastro Guide | Restaurants, Food Tours |
| **Sport Guide** | Fintutto Sport Guide | Stadien, Sportevents |
| **Sacred Guide** | Fintutto Sacred Guide | Kirchen, Tempel, religiose Staetten |
| **Shopping Guide** | Fintutto Shopping Guide | Einkaufszentren, Outlets |

Alle folgen dem gleichen Muster:
- URL: `{name}guide.fintutto.world`
- App-ID: `world.fintutto.{name}guide`
- Eigenstaendige Domain bei Bedarf

---

## 7. Zusammenfassung der Empfehlungen

### Sofort umsetzen

1. **Produktnamen bestaetigen:** Art Guide, City Guide, Region Guide, Social Guide
2. **fintutto.world als Portal einrichten** (falls Domain vorhanden)
3. **Subdomain-Struktur unter fintutto.world aufbauen** fuer alle Guide-Produkte
4. **GuideTranslator.com beibehalten** als eigenstaendige Translator-Marke
5. **"powered by Fintutto World"** Badge auf allen Produkten

### Mittelfristig

6. **Eigene Domains reservieren** fuer Guide-Produkte (fintutto-artguide.com etc.)
7. **App Store Listings** mit Kurznamen ("Art Guide" nicht "Fintutto Art Guide")
8. **Farbsystem** konsequent in allen Apps umsetzen

### Langfristig

9. **Bei Markterfolg:** Premium-Domains (.guide, .app) fuer Top-Produkte
10. **White-Label-Partner:** Eigene Subdomains unter dem jeweiligen Guide
11. **Internationalisierung:** Laenderspezifische Domains (.de, .ch, .at) bei Bedarf

---

## 8. Visualisierung: So sieht der Nutzer die Marken

### Im App Store
```
App-Name:     Art Guide
Untertitel:   Mehrsprachiger Museumsfuehrer
Entwickler:   Fintutto / ai tour UG
```

### In der App (Header)
```
[Art Guide Logo]  Art Guide
                  powered by fintutto.world
```

### Auf fintutto.world (Portal)
```
Fintutto World
  |
  +-- Translator
  |     "Echtzeit-Uebersetzung fuer jede Situation"
  |     → guidetranslator.com
  |
  +-- Art Guide
  |     "Dein mehrsprachiger Museumsfuehrer"
  |     → artguide.fintutto.world
  |
  +-- City Guide
  |     "Entdecke Staedte in deiner Sprache"
  |     → cityguide.fintutto.world
  |
  +-- Region Guide
  |     "Regionen erleben - in jeder Sprache"
  |     → regionguide.fintutto.world
  |
  +-- Social Guide
        "Sprachbarrieren ueberwinden - persoenlich"
        → socialguide.fintutto.world
```

### Auf visitenkarten / in Pitches
```
Fintutto World
"Wir machen die Welt verstaendlich."

Produkte:
  GuideTranslator  |  Art Guide  |  City Guide  |  Region Guide
```
