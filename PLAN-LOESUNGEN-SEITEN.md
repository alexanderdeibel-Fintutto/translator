# Plan: Loesungen-Seiten fuer die Landing Page

## Ueberblick

4 neue Loesungs-Seiten basierend auf der alten Website-Copy, aber **aktualisiert und praezisiert** mit:
- Aktuelle App-URLs (consumer/listener/enterprise.fintutto.world)
- Verlinkung zu den bestehenden App-Detail-Seiten (/apps/translator, /apps/live, /apps/enterprise)
- Aktuelle Preise aus dem bestehenden Code (nicht aus der alten Copy)
- Einheitliches dunkles Glasmorphism-Design (bg-black/30, backdrop-blur-sm, text-white)

## Neue Routen

```
/loesungen/stadtfuehrer   → StadtfuehrerPage.tsx
/loesungen/agenturen      → AgenturenPage.tsx
/loesungen/kreuzfahrt     → KreuzfahrtPage.tsx
/loesungen/enterprise     → EnterpriseSolutionPage.tsx
```

## Aenderungen an bestehenden Dateien

### 1. App.tsx — 4 neue lazy Routes hinzufuegen
```
/loesungen/stadtfuehrer
/loesungen/agenturen
/loesungen/kreuzfahrt
/loesungen/enterprise
```

### 2. LandingLayout.tsx — Navigation erweitern
- **Header-Nav**: "Loesungen" Dropdown/Link mit Unterseiten hinzufuegen
- **Footer**: Neue Spalte "Loesungen" mit Links zu allen 4 Seiten
- Position in Nav: zwischen "Produkte" und "Features"

### 3. LandingHomePage.tsx — Zielgruppen-Teaser verlinken
- Die bestehende SEGMENTS-Sektion mit Links zu den Loesungs-Seiten versehen
- "Mehr erfahren" Buttons je Segment → /loesungen/...

---

## Neue Seiten — Inhalt & Struktur

Alle Seiten folgen dem gleichen Layout-Muster:
- Hintergrund-Logo (65% Opacity)
- Hero mit Badge + H1 + Sub + CTAs
- Problem-Sektion (Pain Points)
- Loesung (Wie GuideTranslator hilft)
- Features/Vorteile
- Preis-Teaser (Verweis auf aktuelle App-Preise)
- CTA-Sektion
- Links zu den relevanten Apps

### Seite 1: Stadtfuehrer (/loesungen/stadtfuehrer)

**Zielgruppe**: Selbststaendige Stadtfuehrer & Freelancer

**Sektionen**:
1. **Hero**: "Ihre Stadtfuehrung. Jede Sprache. Kein Aufwand."
   - Badge: "Fuer selbststaendige Stadtfuehrer & Freelancer"
   - CTA → consumer.fintutto.world (Kostenlos starten)

2. **Problem**: Internationale Gaeste, aber nur eine Sprache
   - 70% der internationalen Nachfrage geht verloren
   - Mehrsprachige Guides teuer und ausgebucht
   - Marketing erreicht nur deutschsprachige Touristen

3. **So funktioniert's**: 4 Schritte
   - Registrieren → Tourskript hochladen → QR-Code drucken → Gaeste scannen
   - Verlinkung: "Kostenlos registrieren" → consumer.fintutto.world
   - Verlinkung: "Live-Modus nutzen" → /apps/live (Listener App erklaert)

4. **ROI-Rechnung**: Mehrumsatz-Beispiel
   - Stadtfuehrer Muenchen, 3 Touren/Woche
   - Vorher: 2.340 EUR/Mo → Nachher: 3.900 EUR/Mo
   - Investition: 29 EUR → ROI: >5.000%

5. **Relevante Apps**:
   - Consumer App → fuer Guide-Vorbereitung (/apps/translator)
   - Listener App → fuer Gaeste (/apps/live)
   - Enterprise App → fuer Session-Management (/apps/enterprise)

6. **CTA**: Kostenlos starten

### Seite 2: Agenturen (/loesungen/agenturen)

**Zielgruppe**: Reise- & Stadtfuehrungsagenturen

**Sektionen**:
1. **Hero**: "Eine Agentur. Hunderte Touren. Jede Sprache."
   - Badge: "Fuer Agenturen & Reiseveranstalter"
   - CTA → sales.fintutto.world (Demo anfragen)

2. **Pain Points**: Guide-Recruiting, Qualitaetskontrolle, Ausfaelle, Saisonschwankungen, Margendruck

3. **Agentur-Features** (6 Karten):
   - Zentrales Tour-Management
   - Team-Verwaltung (Guide-Accounts)
   - Qualitaetskontrolle (standardisierte Skripte)
   - Statistiken & Analytics
   - White-Label
   - API-Integration
   - Jedes Feature verlinkt zur passenden App-Seite

4. **Preis-Teaser**: Verweis auf bestehende Preisstruktur
   - Ab 99 EUR/Mo (aus SEGMENTS auf LandingHomePage)
   - "Enterprise-Kalkulator" → sales.fintutto.world

5. **CTA**: Demo anfragen / Enterprise-Kalkulator

### Seite 3: Kreuzfahrt-Reedereien (/loesungen/kreuzfahrt)

**Zielgruppe**: Reedereien, Shore Excursion Manager

**Sektionen**:
1. **Hero**: "Shore Excursions in jeder Sprache. Fuer jedes Schiff."
   - Badge: "Enterprise Solution fuer Kreuzfahrt-Reedereien"
   - CTA → sales.fintutto.world (Ersparnis berechnen)

2. **Das Problem**: 480.000 EUR/Schiff/Jahr fuer 6 Sprachen
   - Detaillierte Kostenrechnung (8 Guides x 300 EUR/Tag)
   - Exotische Haefen: Kein Guide fuer Japanisch, Koreanisch, Hindi
   - Logistik: Guide-Koordination in 50+ Haefen weltweit

3. **Die Loesung**: 1 Guide + KI = 130+ Sprachen
   - 4-Schritt-Prozess
   - Verlinkung: Listener App erklaert (/apps/live)
   - Verlinkung: Enterprise Dashboard (/apps/enterprise)

4. **Ersparnis-Rechnung** (Highlight-Karte):
   - Traditionell: 4.800.000 EUR/Jahr (10 Schiffe)
   - Mit GuideTranslator: ~325.000 EUR/Jahr
   - Ersparnis: 93%

5. **Enterprise-Tiers**: Pilot / Fleet / Armada / Custom
   - Verweis auf sales.fintutto.world fuer Kalkulator

6. **CTA**: Ersparnis berechnen / Demo vereinbaren
   - Kontakt: enterprise@fintutto.world

### Seite 4: Grossveranstalter (/loesungen/enterprise)

**Zielgruppe**: Museen, Konferenzen, Messen, Events

**Sektionen**:
1. **Hero**: "Events ohne Sprachbarrieren."
   - Badge: "Fuer Museen, Konferenzen, Messen & Events"
   - CTA → sales.fintutto.world

2. **Anwendungsfaelle** (4 Karten):
   - Museen & Ausstellungen (QR-Code statt Audio-Guide-Geraete)
   - Konferenzen & Kongresse (Echtzeit statt Simultandolmetscher)
   - Messen (Standpraesentationen mehrsprachig)
   - Werksfuehrungen & Schulungen (Onboarding internationaler Mitarbeiter)

3. **Wie es funktioniert**: App-Verlinkungen
   - Enterprise App fuer Session-Management → /apps/enterprise
   - Listener App fuer Teilnehmer → /apps/live
   - Consumer App fuer Vorbereitung → /apps/translator

4. **Preis-Verweis**: Ab 99 EUR/Mo, Enterprise individuell
   - CTA → sales.fintutto.world

---

## Design-Richtlinien

- **Hintergrund**: Fintutto-Logo mit `opacity-[0.65]`
- **Karten**: `bg-black/30 backdrop-blur-sm border-white/10`
- **Text**: `text-white`, Muted: `text-white/70`, Akzent: `text-sky-300`
- **Ueberschriften**: `drop-shadow-lg`
- **CTAs**: `bg-emerald-600 hover:bg-emerald-700` (primaer), `bg-sky-600` (sekundaer)
- **Hero-Logos**: `opacity-95` (wie bestehende Seiten)
- **Icons**: Lucide-React (konsistent mit allen anderen Seiten)

## Reihenfolge der Implementierung

1. Zuerst: `StadtfuehrerPage.tsx` (kleinste Zielgruppe, einfachstes Template)
2. Dann: `AgenturenPage.tsx` (mittlere Komplexitaet)
3. Dann: `KreuzfahrtPage.tsx` (groesste Seite, Enterprise-Fokus)
4. Dann: `EnterpriseSolutionPage.tsx` (Events/Museen)
5. Zuletzt: Router, Nav und Footer aktualisieren + LandingHomePage verlinken

## Geschaetzter Umfang

- 4 neue Page-Komponenten (je ~150-250 Zeilen)
- 3 bestehende Dateien anpassen (App.tsx, LandingLayout.tsx, LandingHomePage.tsx)
- Gesamt: ~7 Dateien, ~1.000-1.200 Zeilen neuer Code
