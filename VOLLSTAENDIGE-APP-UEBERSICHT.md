# Fintutto World - Vollstaendige App- und URL-Uebersicht

**Datum:** 2026-03-22
**Status:** IST-Stand + SOLL-Planung

---

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Existiert (Code vorhanden) |
| ⚠️ | Teilweise vorhanden (angelegt, aber unvollstaendig) |
| ❌ | Fehlt noch (muss erstellt werden) |

---

## 1. PORTAL / DACHMARKE

| # | Name | URL (SOLL) | URL (IST) | App-Verzeichnis | Status |
|---|------|-----------|-----------|-----------------|--------|
| 1 | **Fintutto World Portal** | `fintutto.world` | — | ❌ Neue App noetig | ❌ Fehlt |

**Beschreibung:** Zentrale Einstiegsseite fuer das gesamte Fintutto-Ecosystem. Zeigt alle Produkte (Translator + Guides), verlinkt zu den einzelnen Produkten, Investoren-Info, Unternehmensprofil.

**Benoetigte Pages:**

| # | Page | Route | Beschreibung | Status |
|---|------|-------|-------------|--------|
| 1.1 | World Home | `/` | Ecosystem-Uebersicht, alle Produkte | ❌ |
| 1.2 | Ueber Fintutto | `/about` | Firma, Team, Geschichte | ⚠️ (existiert als AboutPage im Translator) |
| 1.3 | Investoren | `/investors` | Pitch, Zahlen, Kontakt | ⚠️ (existiert als InvestorPage im Translator) |
| 1.4 | Kontakt | `/contact` | Kontaktformular, Impressum | ⚠️ (existiert im Translator) |
| 1.5 | Impressum | `/impressum` | Rechtliches | ⚠️ (existiert im Translator) |
| 1.6 | Datenschutz | `/datenschutz` | DSGVO | ⚠️ (existiert im Translator) |

---

## 2. TRANSLATOR - Core Apps

### 2.1 Consumer-facing Apps

| # | Name | URL (SOLL) | URL (IST) | Variant | Port | Status |
|---|------|-----------|-----------|---------|------|--------|
| 2 | **Fintutto Translator** (Consumer) | `translate.fintutto.world` | `app.fintutto.cloud` | `consumer` | 5180 | ✅ |
| 3 | **Fintutto Live** (Listener) | `live.fintutto.world` | `live.fintutto.cloud` | `listener` | 5181 | ✅ |
| 4 | **Fintutto Enterprise** | `enterprise.fintutto.world` | `enterprise.fintutto.cloud` | `enterprise` | 5182 | ✅ |
| 5 | **GuideTranslator Landing** | `fintutto.world` | `fintutto.world` | `landing` | 5183 | ✅ |

**Consumer App Pages (alle ✅ vorhanden):**

| # | Page | Route | Beschreibung |
|---|------|-------|-------------|
| 2.1 | Translator | `/` | Haupt-Uebersetzer |
| 2.2 | Live Session | `/live` | Live-Uebersetzung senden |
| 2.3 | Conversation | `/conversation` | Gespraechsmodus |
| 2.4 | Camera Translate | `/camera` | Kamera-OCR |
| 2.5 | Phrasebook | `/phrasebook` | Redewendungen |
| 2.6 | Favorites | `/favorites` | Gespeicherte Uebersetzungen |
| 2.7 | History | `/history` | Verlauf |
| 2.8 | Settings | `/settings` | Einstellungen |
| 2.9 | Account | `/account` | Konto & Abo |
| 2.10 | Auth | `/auth` | Login/Register |
| 2.11 | Info | `/info` | App-Info |
| 2.12 | Admin | `/admin/*` | Admin-Dashboard |

**Landing Page Pages (alle ✅ vorhanden):**

| # | Page | Route | Beschreibung |
|---|------|-------|-------------|
| 5.1 | Home / Hero | `/` | Landing Page |
| 5.2 | Features | `/features` | Feature-Uebersicht |
| 5.3 | Technology | `/technology` | Technische Details |
| 5.4 | Solutions | `/solutions` | Loesungsuebersicht |
| 5.5 | Sales Personal | `/sales/personal` | Privatkunden |
| 5.6 | Sales Guide | `/sales/guide` | Stadtfuehrer |
| 5.7 | Sales Agency | `/sales/agency` | Agenturen |
| 5.8 | Sales Event | `/sales/event` | Events |
| 5.9 | Sales Cruise | `/sales/cruise` | Kreuzfahrt |
| 5.10 | Pricing | `/pricing` | Preise |
| 5.11 | Competitors | `/competitors` | Vergleich |
| 5.12 | Investors | `/investors` | Investoren |
| 5.13 | About | `/about` | Ueber uns |
| 5.14 | Contact | `/contact` | Kontakt |
| 5.15 | Impressum | `/impressum` | Impressum |
| 5.16 | Datenschutz | `/datenschutz` | Datenschutz |
| 5.17 | Live Landing | `/live` | Live-Feature Erklaerung |

---

## 3. TRANSLATOR - Market-spezifische Apps

### 3.1 School Translator

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 6 | School Translator - Lehrer | `school-teacher.fintutto.world` | `school-teacher` | 5190 | ✅ |
| 7 | School Translator - Schueler | `school-student.fintutto.world` | `school-student` | 5191 | ✅ |

### 3.2 Amt Translator

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 8 | Amt Translator - Sachbearbeiter | `authority-clerk.fintutto.world` | `authority-clerk` | 5192 | ✅ |
| 9 | Amt Translator - Besucher | `authority-visitor.fintutto.world` | `authority-visitor` | 5193 | ✅ |

### 3.3 Refugee Translator

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 10 | Refugee Translator - Helfer | `ngo-helper.fintutto.world` | `ngo-helper` | 5194 | ✅ |
| 11 | Refugee Translator - Klient | `ngo-client.fintutto.world` | `ngo-client` | 5195 | ✅ |

### 3.4 Counter Translator

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 12 | Counter Translator - Mitarbeiter | `counter-staff.fintutto.world` | `counter-staff` | 5196 | ✅ |
| 13 | Counter Translator - Gast | `counter-guest.fintutto.world` | `counter-guest` | 5197 | ✅ |

### 3.5 Medical Translator

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 14 | Medical Translator - Personal | `medical-staff.fintutto.world` | `medical-staff` | 5198 | ✅ |
| 15 | Medical Translator - Patient | `medical-patient.fintutto.world` | `medical-patient` | 5199 | ✅ |

### 3.6 Conference Translator

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 16 | Conference Translator - Speaker | `conference-speaker.fintutto.world` | `conference-speaker` | 5200 | ✅ |
| 17 | Conference Translator - Listener | `conference-listener.fintutto.world` | `conference-listener` | 5201 | ✅ |

**Fehlende Sales-/Landing Pages fuer Market-Apps:**

| # | Page | URL (SOLL) | Beschreibung | Status |
|---|------|-----------|-------------|--------|
| S1 | School Sales | `/sales/school` auf Landing | Schulen-spezifische Verkaufsseite | ❌ |
| S2 | Authority Sales | `/sales/authority` auf Landing | Behoerden-spezifische Verkaufsseite | ❌ |
| S3 | NGO Sales | `/sales/ngo` auf Landing | NGO-spezifische Verkaufsseite | ❌ |
| S4 | Counter Sales | `/sales/counter` auf Landing | Hospitality-spezifische Verkaufsseite | ❌ |
| S5 | Medical Sales | `/sales/medical` auf Landing | Medizin-spezifische Verkaufsseite | ❌ |
| S6 | Conference Sales | `/sales/conference` auf Landing | Events-spezifische Verkaufsseite | ❌ |

---

## 4. GUIDE - Art Guide

### 4.1 Art Guide Visitor App

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 18 | **Fintutto Art Guide** (Visitor) | `artguide.fintutto.world` | `artguide-visitor` | 5210 | ✅ |
| 19 | **Museum Guide** (White-Label) | `[museum].artguide.fintutto.world` | `artguide-whitelabel` | 5211 | ✅ |

**Visitor App Pages (✅ vorhanden):**

| # | Page | Route | Beschreibung |
|---|------|-------|-------------|
| 18.1 | Home / Explore | `/` | Uebersicht, Museum-Suche |
| 18.2 | Museum Detail | `/museum/:museumSlug` | Museum mit Raeumen, Werken |
| 18.3 | Artwork Detail | `/artwork/:artworkId` | Einzelnes Kunstwerk + KI-Dialog |
| 18.4 | City Guide | `/city/:citySlug` | Stadt mit POIs, Kategorien |
| 18.5 | City Tours | `/city/:citySlug/tours` | Stadtfuehrungen |
| 18.6 | City Partners | `/city/:citySlug/partners` | Partner in der Stadt |
| 18.7 | City Offers | `/city/:citySlug/offers` | Angebote in der Stadt |
| 18.8 | Region Guide | `/region/:regionSlug` | Region mit Staedten, Touren |
| 18.9 | Region Partners | `/region/:regionSlug/partners` | Regionale Partner |
| 18.10 | Region Offers | `/region/:regionSlug/offers` | Regionale Angebote |
| 18.11 | Partner Detail | `/partner/:partnerId` | Einzelner Partner |
| 18.12 | Offer Detail | `/offer/:offerId` | Einzelnes Angebot |
| 18.13 | Booking | `/booking/:offerId` | Buchungsseite |
| 18.14 | Profil | `/profile` | Besucherprofil |
| 18.15 | Favorites | `/favorites` | Gespeicherte Orte/Werke |
| 18.16 | Settings | `/settings` | Einstellungen |

### 4.2 Art Guide Portal (CMS / Backend)

| # | Name | URL (SOLL) | Verzeichnis | Port | Status |
|---|------|-----------|-------------|------|--------|
| 20 | **Art Guide Portal** (CMS) | `portal.artguide.fintutto.world` | `apps/artguide-portal` | 3001 | ✅ |

**Portal Dashboard Pages (✅ vorhanden):**

| # | Page | Route | Beschreibung |
|---|------|-------|-------------|
| 20.1 | Dashboard Home | `/dashboard` | Uebersicht, KPIs |
| 20.2 | Analytics | `/dashboard/analytics` | Besucherstatistiken |
| 20.3 | Artworks | `/dashboard/artworks` | Kunstwerke verwalten |
| 20.4 | Artwork Edit | `/dashboard/artworks/[id]` | Einzelnes Werk bearbeiten |
| 20.5 | Audio | `/dashboard/audio` | Audio-Guides generieren |
| 20.6 | Billing | `/dashboard/billing` | Abo & Zahlung |
| 20.7 | Bookings | `/dashboard/bookings` | Reservierungen |
| 20.8 | City Tours | `/dashboard/city-tours` | Stadtfuehrungen verwalten |
| 20.9 | Content Hub | `/dashboard/content-hub` | Inhalte verwalten |
| 20.10 | Import Museum | `/dashboard/import/museum` | Museum-Daten importieren |
| 20.11 | Import City | `/dashboard/import/city` | Stadt-Daten importieren |
| 20.12 | Import Conference | `/dashboard/import/conference` | Konferenz-Daten importieren |
| 20.13 | Import Fair | `/dashboard/import/fair` | Messe-Daten importieren |
| 20.14 | Invite Campaigns | `/dashboard/invite-campaigns` | Einladungskampagnen |
| 20.15 | Offers | `/dashboard/offers` | Angebote verwalten |
| 20.16 | Partner CRM | `/dashboard/partner-crm/[id]` | Partner-Beziehungen |
| 20.17 | Partners | `/dashboard/partners/[id]` | Partner-Details |
| 20.18 | POIs | `/dashboard/pois` | Points of Interest |
| 20.19 | Region | `/dashboard/region` | Region-Einstellungen |
| 20.20 | Settings | `/dashboard/settings` | Konto-Einstellungen |
| 20.21 | Team | `/dashboard/team` | Teammitglieder |
| 20.22 | Tours | `/dashboard/tours` | Touren verwalten |
| 20.23 | Venue | `/dashboard/venue` | Veranstaltungsort |
| 20.24 | Workflow | `/dashboard/workflow` | Workflows |

---

## 5. GUIDE - City Guide (EIGENSTAENDIG)

**Aktuell:** City Guide ist als Sub-Route in artguide-visitor eingebettet (`/city/:slug`).
**SOLL:** Eigenstaendige App mit eigener URL und eigenem Branding.

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 21 | **Fintutto City Guide** (Visitor) | `cityguide.fintutto.world` | `cityguide-visitor` | 5212 | ❌ Neue App |
| 22 | **City Guide White-Label** | `[stadt].cityguide.fintutto.world` | `cityguide-whitelabel` | 5213 | ❌ Neue App |
| 23 | **City Guide Portal** (CMS) | `portal.cityguide.fintutto.world` | `cityguide-portal` | 3002 | ❌ Neues Portal |

**Benoetigte Visitor Pages:**

| # | Page | Route | Beschreibung | Status |
|---|------|-------|-------------|--------|
| 21.1 | Home / Explore | `/` | Staedte-Uebersicht, Suche | ❌ |
| 21.2 | City Detail | `/city/:citySlug` | Stadt mit Kategorien, POIs | ⚠️ (in artguide eingebettet) |
| 21.3 | POI Detail | `/poi/:poiId` | Einzelner Point of Interest | ❌ |
| 21.4 | Tours | `/city/:citySlug/tours` | Stadtfuehrungen | ⚠️ (in artguide eingebettet) |
| 21.5 | Tour Detail | `/tour/:tourId` | Einzelne Tour | ❌ |
| 21.6 | Partners | `/city/:citySlug/partners` | Partner & Empfehlungen | ⚠️ (in artguide eingebettet) |
| 21.7 | Partner Detail | `/partner/:partnerId` | Einzelner Partner | ⚠️ (in artguide vorhanden) |
| 21.8 | Offers | `/city/:citySlug/offers` | Angebote & Deals | ⚠️ (in artguide eingebettet) |
| 21.9 | Offer Detail | `/offer/:offerId` | Einzelnes Angebot | ⚠️ (in artguide vorhanden) |
| 21.10 | Booking | `/booking/:offerId` | Buchungsseite | ⚠️ (in artguide vorhanden) |
| 21.11 | Map | `/map` | Vollbild-Karte | ❌ |
| 21.12 | Profile | `/profile` | Besucherprofil | ❌ |
| 21.13 | Favorites | `/favorites` | Gespeicherte Orte | ❌ |
| 21.14 | Settings | `/settings` | Einstellungen | ❌ |

**Benoetigte Portal Pages:**

| # | Page | Route | Beschreibung | Status |
|---|------|-------|-------------|--------|
| 23.1 | Dashboard | `/dashboard` | Uebersicht, KPIs | ❌ |
| 23.2 | POIs | `/dashboard/pois` | POIs verwalten | ❌ |
| 23.3 | Tours | `/dashboard/tours` | Touren verwalten | ❌ |
| 23.4 | Partners | `/dashboard/partners` | Partner verwalten | ❌ |
| 23.5 | Offers | `/dashboard/offers` | Angebote verwalten | ❌ |
| 23.6 | Analytics | `/dashboard/analytics` | Besucherstatistiken | ❌ |
| 23.7 | Content Hub | `/dashboard/content-hub` | Inhalte, Uebersetzungen | ❌ |
| 23.8 | Settings | `/dashboard/settings` | Stadt-Konfiguration | ❌ |
| 23.9 | Billing | `/dashboard/billing` | Abo & Zahlung | ❌ |
| 23.10 | Team | `/dashboard/team` | Teammitglieder | ❌ |

---

## 6. GUIDE - Region Guide (EIGENSTAENDIG)

**Aktuell:** Region Guide ist als Sub-Route in artguide-visitor eingebettet (`/region/:slug`).
**SOLL:** Eigenstaendige App mit eigener URL und eigenem Branding.

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 24 | **Fintutto Region Guide** (Visitor) | `regionguide.fintutto.world` | `regionguide-visitor` | 5214 | ❌ Neue App |
| 25 | **Region Guide White-Label** | `[region].regionguide.fintutto.world` | `regionguide-whitelabel` | 5215 | ❌ Neue App |
| 26 | **Region Guide Portal** (CMS) | `portal.regionguide.fintutto.world` | `regionguide-portal` | 3003 | ❌ Neues Portal |

**Benoetigte Visitor Pages:**

| # | Page | Route | Beschreibung | Status |
|---|------|-------|-------------|--------|
| 24.1 | Home / Explore | `/` | Regionen-Uebersicht | ❌ |
| 24.2 | Region Detail | `/region/:regionSlug` | Region mit Staedten, Natur | ⚠️ (in artguide eingebettet) |
| 24.3 | City in Region | `/region/:regionSlug/city/:citySlug` | Stadt innerhalb Region | ❌ |
| 24.4 | POI Detail | `/poi/:poiId` | Einzelner POI | ❌ |
| 24.5 | Excursions | `/region/:regionSlug/excursions` | Ausfluege & Wanderungen | ❌ |
| 24.6 | Excursion Detail | `/excursion/:excursionId` | Einzelne Tour/Wanderung | ❌ |
| 24.7 | Partners | `/region/:regionSlug/partners` | Regionale Partner | ⚠️ (in artguide eingebettet) |
| 24.8 | Offers | `/region/:regionSlug/offers` | Regionale Angebote | ⚠️ (in artguide eingebettet) |
| 24.9 | Map | `/map` | Regionale Vollbild-Karte | ❌ |
| 24.10 | Profile | `/profile` | Besucherprofil | ❌ |
| 24.11 | Favorites | `/favorites` | Gespeicherte Orte | ❌ |
| 24.12 | Settings | `/settings` | Einstellungen | ❌ |

**Benoetigte Portal Pages:** (analog City Guide Portal, 23.1-23.10)

---

## 7. GUIDE - Social Guide (NEU)

| # | Name | URL (SOLL) | Variant | Port | Status |
|---|------|-----------|---------|------|--------|
| 27 | **Fintutto Social Guide** (App) | `socialguide.fintutto.world` | `socialguide` | 5216 | ❌ Komplett neu |

**Benoetigte Pages:**

| # | Page | Route | Beschreibung | Status |
|---|------|-------|-------------|--------|
| 27.1 | Home | `/` | Situationsauswahl (Dating, Networking, etc.) | ❌ |
| 27.2 | Conversation | `/conversation` | Echtzeit-Gespraechsuebersetzung | ❌ |
| 27.3 | Phrasebook | `/phrases` | Situationsbasierte Phrasen | ❌ |
| 27.4 | Ice Breakers | `/icebreakers` | Gespraechsstarter in Zielsprache | ❌ |
| 27.5 | Profile | `/profile` | Sprachprofil | ❌ |
| 27.6 | Settings | `/settings` | Einstellungen | ❌ |

---

## 8. SALES & MARKETING PAGES

### 8.1 Bestehende Sales Pages (auf GuideTranslator Landing)

| # | Route | Segment | Status |
|---|-------|---------|--------|
| S.1 | `/sales/personal` | Privatkunden | ✅ |
| S.2 | `/sales/guide` | Stadtfuehrer/Tourismus | ✅ |
| S.3 | `/sales/agency` | Reiseagenturen | ✅ |
| S.4 | `/sales/event` | Events/Konferenzen | ✅ |
| S.5 | `/sales/cruise` | Kreuzfahrt | ✅ |

### 8.2 Fehlende Sales Pages

| # | Route (SOLL) | Segment | Beschreibung | Status |
|---|-------------|---------|-------------|--------|
| S.6 | `/sales/school` | Schulen | School Translator Verkaufsseite | ❌ |
| S.7 | `/sales/authority` | Behoerden | Amt Translator Verkaufsseite | ❌ |
| S.8 | `/sales/ngo` | NGO/Soziales | Refugee Translator Verkaufsseite | ❌ |
| S.9 | `/sales/counter` | Hospitality | Counter Translator Verkaufsseite | ❌ |
| S.10 | `/sales/medical` | Medizin | Medical Translator Verkaufsseite | ❌ |
| S.11 | `/sales/conference` | Events/Kongresse | Conference Translator Verkaufsseite | ❌ |
| S.12 | `/sales/artguide` | Museen | Art Guide Verkaufsseite | ❌ |
| S.13 | `/sales/cityguide` | Staedte | City Guide Verkaufsseite | ❌ |
| S.14 | `/sales/regionguide` | Regionen | Region Guide Verkaufsseite | ❌ |

### 8.3 Fehlende Guide-spezifische Landing Pages

| # | URL (SOLL) | Beschreibung | Status |
|---|-----------|-------------|--------|
| L.1 | `www.artguide.fintutto.world` | Art Guide Produktseite / Landing | ❌ |
| L.2 | `www.cityguide.fintutto.world` | City Guide Produktseite / Landing | ❌ |
| L.3 | `www.regionguide.fintutto.world` | Region Guide Produktseite / Landing | ❌ |
| L.4 | `www.socialguide.fintutto.world` | Social Guide Produktseite / Landing | ❌ |

---

## 9. INFRASTRUKTUR & ADMIN

| # | Name | URL (SOLL) | Beschreibung | Status |
|---|------|-----------|-------------|--------|
| A.1 | Admin Dashboard | `admin.fintutto.world` | Zentrales Admin fuer alles | ⚠️ (existiert als `/admin` im Consumer) |
| A.2 | CRM | `crm.fintutto.world` | Partner-CRM | ⚠️ (CRM-Login Page existiert) |
| A.3 | API | `api.fintutto.world` | REST API | ⚠️ (existiert unter `/api`) |
| A.4 | Relay Server | intern | WiFi Hotspot Relay | ✅ |

---

## 10. ZUSAMMENFASSUNG: ZAHLEN

### Gesamt-Inventar

| Kategorie | Existiert ✅ | Teilweise ⚠️ | Fehlt ❌ | Gesamt |
|-----------|-------------|-------------|---------|--------|
| **Apps / Deployments** | 20 | 0 | 7 | **27** |
| **Visitor Pages** | 44 | 10 | 26 | **80** |
| **Portal/CMS Pages** | 24 | 0 | 20 | **44** |
| **Sales/Landing Pages** | 5 | 0 | 13 | **18** |
| **Infrastruktur** | 2 | 2 | 0 | **4** |
| **TOTAL** | **95** | **12** | **66** | **173** |

### Fehlende Apps (7 neue Deployments)

| # | App | Variant | URL | Prio |
|---|-----|---------|-----|------|
| 1 | Fintutto World Portal | `world-portal` | `fintutto.world` | HOCH |
| 2 | City Guide Visitor | `cityguide-visitor` | `cityguide.fintutto.world` | HOCH |
| 3 | City Guide White-Label | `cityguide-whitelabel` | `[x].cityguide.fintutto.world` | MITTEL |
| 4 | City Guide Portal (CMS) | `cityguide-portal` | `portal.cityguide.fintutto.world` | MITTEL |
| 5 | Region Guide Visitor | `regionguide-visitor` | `regionguide.fintutto.world` | MITTEL |
| 6 | Region Guide White-Label | `regionguide-whitelabel` | `[x].regionguide.fintutto.world` | NIEDRIG |
| 7 | Region Guide Portal (CMS) | `regionguide-portal` | `portal.regionguide.fintutto.world` | NIEDRIG |

**Hinweis:** Social Guide (App #27) ist als Zukunftsplanung markiert und hat keine eigene Prioritaet.

### Empfohlene Umsetzungsreihenfolge

**Phase 1 (Sofort):**
1. Fintutto World Portal - zentrale Einstiegsseite
2. City Guide als eigenstaendige App extrahieren (Code aus artguide-visitor)
3. Sales Pages fuer die 6 Market-Translator (S.6-S.11)

**Phase 2 (Kurzfristig):**
4. Region Guide als eigenstaendige App extrahieren
5. City Guide Portal (CMS)
6. Sales Pages fuer Guide-Produkte (S.12-S.14)
7. Guide Landing Pages (L.1-L.3)

**Phase 3 (Mittelfristig):**
8. City Guide White-Label System
9. Region Guide Portal (CMS)
10. Region Guide White-Label System

**Phase 4 (Langfristig):**
11. Social Guide App
12. Weitere Guide-Produkte nach Bedarf

---

## 11. DNS / SUBDOMAIN UEBERSICHT (KOMPLETT)

### fintutto.world - Alle Subdomains

```
# Portal
fintutto.world                          → World Portal
www.fintutto.world                      → Redirect zu fintutto.world

# Translator Core
translate.fintutto.world                → Consumer Translator App
live.fintutto.world                     → Listener App
enterprise.fintutto.world               → Enterprise Console

# Translator Markets
school-teacher.fintutto.world           → School Translator (Lehrer)
school-student.fintutto.world           → School Translator (Schueler)
authority-clerk.fintutto.world          → Amt Translator (Sachbearbeiter)
authority-visitor.fintutto.world        → Amt Translator (Besucher)
ngo-helper.fintutto.world              → Refugee Translator (Helfer)
ngo-client.fintutto.world              → Refugee Translator (Klient)
counter-staff.fintutto.world           → Counter Translator (Mitarbeiter)
counter-guest.fintutto.world           → Counter Translator (Gast)
medical-staff.fintutto.world           → Medical Translator (Personal)
medical-patient.fintutto.world         → Medical Translator (Patient)
conference-speaker.fintutto.world      → Conference Translator (Speaker)
conference-listener.fintutto.world     → Conference Translator (Listener)

# Art Guide
artguide.fintutto.world                → Art Guide Visitor App
portal.artguide.fintutto.world         → Art Guide CMS
[museum].artguide.fintutto.world       → White-Label Museums

# City Guide
cityguide.fintutto.world               → City Guide Visitor App
portal.cityguide.fintutto.world        → City Guide CMS
[stadt].cityguide.fintutto.world       → White-Label Staedte

# Region Guide
regionguide.fintutto.world             → Region Guide Visitor App
portal.regionguide.fintutto.world      → Region Guide CMS
[region].regionguide.fintutto.world    → White-Label Regionen

# Social Guide (Zukunft)
socialguide.fintutto.world             → Social Guide App

# Infrastruktur
admin.fintutto.world                   → Admin Dashboard
crm.fintutto.world                     → Partner CRM
api.fintutto.world                     → API Gateway
```

### Externe Domains (Redirects/Aliase)

```
fintutto.world        → GuideTranslator Landing (bleibt eigenstaendig)
fintutto.world         → Deutsche Version
fintutto.cloud             → Backend/Legacy (besteht)
itour.de                   → Partner-Redirect
iguide.ch                  → Partner-Redirect
```

**Gesamt: 30+ Subdomains unter fintutto.world + 5 externe Domains**
