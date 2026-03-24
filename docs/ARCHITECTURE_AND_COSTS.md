# Fintutto World — Architektur & Kostenstruktur

> Stand: Maerz 2026 | Version 1.0

---

## 1. Plattform-Uebersicht

**Fintutto World** ist eine universelle, KI-personalisierte Besucher-Erlebnis-Plattform.
Sie bietet Audioguides, KI-Dialoge, mehrsprachige Inhalte und Besucheranalysen fuer:

- Museen (klein, mittel, gross)
- Staedte (Stadtfuehrer, Tourismusportale)
- Regionen (Tourismusverbaende)
- Hotels & Resorts
- Kreuzfahrtschiffe
- Events & Messen
- Kultur (Theater, Oper, Konzerthaeuser)
- Natur (Parks, Zoos, Botanische Gaerten)
- Freizeit (Freizeitparks, Erlebniswelten)
- Retail (Shopping-Center)
- Transport (Flughaefen, Bahnhoefe)
- Gastronomie (Weingueter, Food-Touren)
- Sakralbauten (Kirchen, Kloester)
- Campus (Firmencampus, Werksbesichtigungen)
- Sport (Stadien, Sportstaetten)

---

## 2. System-Architektur

```
                    ┌──────────────────────────────┐
                    │     Besucher / Browser        │
                    │   (SvelteKit PWA + Offline)   │
                    └─────────────┬────────────────┘
                                  │ HTTPS
                    ┌─────────────▼────────────────┐
                    │      Supabase Platform        │
                    │  ┌────────────────────────┐   │
                    │  │  Edge Functions (Deno)  │   │
                    │  │  ├─ fintutto-world-ai   │   │──→ Anthropic Claude API
                    │  │  ├─ fintutto-world-     │   │──→ DeepL / Azure / Google
                    │  │  │  translate            │   │
                    │  │  ├─ fintutto-world-crm  │   │
                    │  │  ├─ content-api          │   │
                    │  │  ├─ stripe-webhook       │   │──→ Stripe
                    │  │  └─ send-email           │   │
                    │  ├────────────────────────┤   │
                    │  │  PostgreSQL (RLS)       │   │
                    │  │  40+ Tabellen           │   │
                    │  ├────────────────────────┤   │
                    │  │  Auth (Supabase Auth)   │   │
                    │  ├────────────────────────┤   │
                    │  │  Storage (Bilder/Audio) │   │
                    │  └────────────────────────┘   │
                    └──────────────────────────────┘
                                  │
                    ┌─────────────▼────────────────┐
                    │       Externe APIs            │
                    │  ├─ DeepL (Uebersetzung)     │
                    │  ├─ Azure Translator          │
                    │  ├─ Google Cloud TTS/STT      │
                    │  ├─ Anthropic Claude           │
                    │  └─ Stripe (Payments)         │
                    └──────────────────────────────┘
```

### Tech-Stack

| Schicht | Technologie |
|---|---|
| Frontend | SvelteKit + TypeScript, TailwindCSS, PWA |
| Backend | Supabase (PostgreSQL, Edge Functions, Auth, Storage) |
| KI-Dialog | Anthropic Claude (Haiku + Sonnet, Smart Routing) |
| Uebersetzung | DeepL (primaer) → Azure → Google → MyMemory |
| Sprachausgabe | Google Cloud TTS (Neural2 / Chirp3HD) |
| Spracherkennung | Web Speech API (kostenlos) / Google Cloud STT |
| Zahlung | Stripe (Abos + Transaktionen) |
| Caching | IndexedDB (Audio), Service Worker (Offline) |

---

## 3. API-Kostenstruktur (Detailliert)

### 3.1 Uebersetzung

| Anbieter | Rolle | Preis/1M Zeichen | Free Tier | Sprachen |
|---|---|---|---|---|
| **DeepL API** | Primaer (EU-Sprachen) | EUR 5,49 | 500K/Monat (Free Plan) | 30 |
| **Azure Translator** | Fallback (exotische Sprachen) | EUR 10,00 | 2M/Monat | 130+ |
| **Google Translate** | Sekundaer-Fallback | EUR 20,00 | keiner | 130+ |
| **MyMemory** | Notfall (kostenlos) | EUR 0 | unbegrenzt | 50+ |

**Kaskade:** DeepL → Azure → Google → MyMemory
**Ersparnis durch DeepL:** ~45% gegenueber Azure fuer EU-Sprachen

### 3.2 KI-Dialog (Claude)

| Modell | Rolle | Input/1M Tokens | Output/1M Tokens | Anteil Requests |
|---|---|---|---|---|
| **Claude Haiku 4.5** | Standard (80%) | EUR 0,25 | EUR 1,25 | POI-Erklaerungen, Empfehlungen, Onboarding, kurze Dialoge, Profil-Extraktion |
| **Claude Sonnet 4.6** | Premium (20%) | EUR 3,00 | EUR 15,00 | Tour-Narration, Deep-Dialoge (5+ Nachrichten), Barrierefreiheit, Experten-Modus |

**Smart Routing Regeln:**
- Haiku: `explain_poi`, `recommend`, `onboarding`, Dialog < 5 Nachrichten, Profil-Extraktion
- Sonnet: `narrate_tour`, Dialog >= 5 Nachrichten, Kind-Modus, Experten-Level, Barrierefreiheit

**Blended Cost:** ~EUR 0,50/1.000 Requests statt EUR 3,00 (nur Sonnet)

### 3.3 Sprachausgabe (TTS)

| Qualitaet | Preis/1M Zeichen | Free Tier | Verfuegbar in Tiers |
|---|---|---|---|
| **Browser TTS** | EUR 0 | unbegrenzt | Free |
| **Google Neural2** | EUR 16,00 | 1M/Monat | Personal Pro, Basic-Tiers |
| **Google Chirp3HD** | EUR 16,00 | 1M/Monat | Professional, Enterprise |

### 3.4 Spracherkennung (STT)

| Methode | Preis | Verfuegbar in Tiers |
|---|---|---|
| **Web Speech API** | EUR 0 (Browser) | Alle |
| **Google Cloud STT** | EUR 1,44/Stunde | Professional+ |

### 3.5 Infrastruktur

| Service | Preis | Skalierung |
|---|---|---|
| **Supabase Pro** | EUR 25/Monat | Bis 500K Rows inkl. |
| **Supabase Storage** | EUR 0,05/GB | Ab 1GB |
| **Edge Functions** | EUR 0,50/1M Aufrufe | Inklusive in Pro |
| **Stripe** | 1,5% + EUR 0,25 (EU) | Pro Transaktion |

---

## 4. Smart Model Routing — Kostenoptimierung

### Vorher (nur Sonnet)
```
1.000 KI-Anfragen × EUR 3/1.000 = EUR 3,00
```

### Nachher (Haiku/Sonnet Mix)
```
800 Haiku-Anfragen × EUR 0,15/1.000 = EUR 0,12
200 Sonnet-Anfragen × EUR 3,00/1.000 = EUR 0,60
Gesamt: EUR 0,72 (statt EUR 3,00 = 76% Ersparnis)
```

### Routing-Logik (implementiert in `fintutto-world-ai/index.ts`)

| Aktion | Bedingung | Modell |
|---|---|---|
| `explain_poi` | Standard | Haiku |
| `explain_poi` | Kind-Modus / Barrierefreiheit / Experte | Sonnet |
| `recommend` | Immer | Haiku |
| `onboarding` | Immer | Haiku |
| `dialog` | < 5 Nachrichten | Haiku |
| `dialog` | >= 5 Nachrichten | Sonnet |
| `dialog` | Komplexe Personalisierung | Sonnet |
| `narrate_tour` | Immer (kreativ, hochwertig) | Sonnet |
| Profil-Extraktion | Immer (strukturiert) | Haiku |

---

## 5. Uebersetzungs-Kaskade — Kostenoptimierung

### Vorher (nur Azure)
```
10M Zeichen/Monat × EUR 10/1M = EUR 100
```

### Nachher (DeepL primaer)
```
8M Zeichen DeepL (EU) × EUR 5,49/1M = EUR 43,92
2M Zeichen Azure (exotisch) × EUR 10/1M = EUR 20,00
Gesamt: EUR 63,92 (statt EUR 100 = 36% Ersparnis)
```

---

## 6. Szenario-Kostenrechnung

### 6.1 Beta-Phase (7 Kunden)

**Kunden:** 2 grosse Museen + 5 kleine Museen

| Position | Berechnung | Monatlich |
|---|---|---|
| **Einnahmen** | 2 × EUR 1.990 + 5 × EUR 99 | **EUR 4.475** |
| Uebersetzung | 2 × 20M + 5 × 288K Zeichen | EUR 135 |
| TTS | 2 × 15M + 5 × 180K Zeichen | EUR 495 |
| KI-Dialog | 2 × 10M + 5 × 60K Tokens | EUR 200 |
| Supabase | Pro-Plan | EUR 25 |
| Stripe | ~2% | EUR 90 |
| **Kosten gesamt** | | **EUR 945** |
| **Gewinn** | | **EUR 3.530** |
| **Marge** | | **79%** |

### 6.2 Ausbau-Phase (128 Kunden)

| Segment | Anzahl | Ø Preis | Einnahmen |
|---|---|---|---|
| Museum gross | 10 | EUR 1.990 | EUR 19.900 |
| Museum mittel | 30 | EUR 349 | EUR 10.470 |
| Museum klein | 50 | EUR 99 | EUR 4.950 |
| Stadt gross | 3 | EUR 4.990 | EUR 14.970 |
| Stadt mittel | 2 | EUR 499 | EUR 998 |
| Region | 3 | EUR 2.990 | EUR 8.970 |
| Hotel | 20 | EUR 99 | EUR 1.980 |
| Sonstige | 10 | EUR 249 | EUR 2.490 |
| **Gesamt** | **128** | | **EUR 64.728** |

| Kostenposition | Monatlich | Jaehrlich |
|---|---|---|
| API-Kosten (~18%) | EUR 11.650 | EUR 139.800 |
| Infrastruktur | EUR 200 | EUR 2.400 |
| Stripe (~2%) | EUR 1.295 | EUR 15.540 |
| Personal (3) | EUR 15.000 | EUR 180.000 |
| Marketing | EUR 3.000 | EUR 36.000 |
| **Gewinn** | **EUR 33.583** | **EUR 403.000** |

### 6.3 Expansions-Phase (775 Kunden)

| Segment | Anzahl | Ø Preis | Einnahmen |
|---|---|---|---|
| Museum (alle) | 500 | EUR 350 | EUR 175.000 |
| Staedte | 20 | EUR 2.500 | EUR 50.000 |
| Regionen | 15 | EUR 2.990 | EUR 44.850 |
| Hotels | 100 | EUR 99 | EUR 9.900 |
| Events | 30 | EUR 499 | EUR 14.970 |
| Kreuzfahrt | 10 | EUR 14.990 | EUR 149.900 |
| Sonstige | 100 | EUR 300 | EUR 30.000 |
| Marketplace | 200 | EUR 75 | EUR 15.000 |
| Premium Content | — | — | EUR 10.000 |
| Transaktionen | — | — | EUR 25.000 |
| **Gesamt** | | | **EUR 524.620** |

| Kostenposition | Monatlich | Jaehrlich |
|---|---|---|
| API-Kosten (~12%) | EUR 62.950 | EUR 755.400 |
| Infrastruktur | EUR 2.000 | EUR 24.000 |
| Stripe (~1,8%) | EUR 9.443 | EUR 113.316 |
| Personal (11) | EUR 55.000 | EUR 660.000 |
| Marketing | EUR 15.000 | EUR 180.000 |
| Sonstiges | EUR 10.000 | EUR 120.000 |
| **Gewinn** | **EUR 370.227** | **EUR 4.442.724** |

---

## 7. Einnahmemodell (7 Ebenen)

| Ebene | Beschreibung | Anteil (Ziel) |
|---|---|---|
| **1. SaaS-Abos** | Monatliche/jaehrliche Tier-Abonnements | 55% |
| **2. Transaktionsgebuehren** | 5-15% Provision auf Buchungen, Tickets, In-App-Kaeufe | 15% |
| **3. Marketplace** | Lokale Anbieter zahlen fuer Premium-Listings | 10% |
| **4. Premium Content** | Freiberufler erstellen bezahlte Touren (70/30 Split) | 7% |
| **5. Datenprodukte** | Anonymisierte Besucherstrom-Analysen | 5% |
| **6. White-Label** | Custom-App fuer grosse Kunden (Setup + Monatlich) | 5% |
| **7. Affiliate** | Provisionen auf externe Buchungen (Hotels etc.) | 3% |

### Revenue-Kreislauf (Win-Win-Spirale)

```
Besucher nutzt App gratis
  → bucht Restaurant (5% Provision an uns)
    → Restaurant zahlt Premium-Listing (EUR 49/Mo)
      → Stadt sieht mehr Tourismus (zahlt EUR 4.990/Mo)
        → Region sieht Erfolg (zahlt EUR 2.990/Mo)
          → Mehr Besucher → Kreislauf verstaerkt sich
```

---

## 8. Infrastruktur-Skalierung

| Phase | DB | Edge Functions | CDN | Kosten/Monat |
|---|---|---|---|---|
| Beta (7 Kunden) | Supabase Pro | Inkl. | Cloudflare Free | EUR 25 |
| Ausbau (128 Kunden) | Supabase Pro | Inkl. | Cloudflare Pro | EUR 100 |
| Expansion (775 Kunden) | Supabase Team/Enterprise | Skaliert | Cloudflare Business | EUR 500-2.000 |
| Enterprise (2.000+) | Self-hosted Postgres + Supabase Realtime | Deno Deploy | Cloudflare Enterprise | EUR 3.000-5.000 |

---

## 9. Datenbank-Uebersicht

### Tabellen nach Domaene

| Domaene | Tabellen | Beschreibung |
|---|---|---|
| Auth & Billing | gt_users, gt_organizations, gt_stripe_* | Benutzer, Stripe-Anbindung |
| CRM | fw_crm_leads, fw_crm_activities, fw_crm_tasks, fw_crm_campaigns, fw_crm_invite_codes, fw_crm_pipeline_stages, fw_crm_email_templates | Sales Pipeline |
| Revenue | fw_marketplace_listings, fw_transactions, fw_commissions, fw_premium_content, fw_premium_purchases, fw_affiliate_links, fw_data_reports | Einnahme-Diversifizierung |
| Fintutto World | fw_cities, fw_regions, fw_museums, fw_partners, fw_pois, fw_universal_visitor_profiles, fw_ai_dialogs, fw_notifications | Kern-Plattform |
| Billing | fw_subscriptions, fw_invoices, fw_usage_records, fw_payment_events | Abrechnung |
| Content | fw_unified_content, fw_content_translations, fw_translation_queue | Mehrsprachige Inhalte |
| Art Guide | ag_museums, ag_artworks, ag_exhibitions, ag_tours, ag_visitor_profiles | Museums-Modul |

### Sicherheit

- **RLS (Row Level Security)** auf allen Tabellen
- **Rollen:** admin, sales_agent, partner, creator, authenticated
- **API-Keys** nur in Supabase Secrets (nicht im Code)
- **DSGVO-konform:** Anonymisierung in Analytics, Loeschfunktionen
- **Stripe PCI Compliance** fuer Zahlungen

---

## 10. Edge Functions

| Funktion | Aufgabe | Externe APIs |
|---|---|---|
| `fintutto-world-ai` | KI-Dialog, POI-Erklaerungen, Empfehlungen | Claude Haiku/Sonnet |
| `fintutto-world-translate` | Uebersetzungs-Queue | DeepL, Azure, Google, MyMemory |
| `fintutto-world-crm` | CRM-Operationen | — |
| `fintutto-world-content-api` | Content-Ingestion | — |
| `artguide-ai` | Kunst-Erklaerungen | Claude Sonnet |
| `stripe-checkout` | Checkout-Session | Stripe |
| `stripe-portal` | Kunden-Portal | Stripe |
| `stripe-webhook` | Webhook-Handler | Stripe |
| `send-email` | E-Mail-Versand | (Konfigurierbar) |
| `admin-create-user` | Admin-Benutzererstellung | — |

---

## 11. Umgebungsvariablen

```bash
# Frontend (.env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_...
VITE_GOOGLE_TTS_API_KEY=AIza...
VITE_AZURE_TRANSLATE_KEY=...
VITE_AZURE_TRANSLATE_REGION=westeurope

# Supabase Secrets
ANTHROPIC_API_KEY=sk-ant-...
DEEPL_API_KEY=...
AZURE_TRANSLATE_KEY=...
AZURE_TRANSLATE_REGION=westeurope
GOOGLE_TRANSLATE_KEY=AIza...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 12. Kosten-Optimierungs-Massnahmen (Implementiert)

| Massnahme | Ersparnis | Status |
|---|---|---|
| Haiku/Sonnet Smart Routing | ~76% auf KI-Kosten | Implementiert |
| DeepL als Primaer-Uebersetzer | ~36% auf Uebersetzung | Implementiert |
| Audio-Caching (IndexedDB) | ~60% auf TTS | Implementiert |
| Browser TTS fuer Free Tier | 100% TTS-Kostenersparnis | Implementiert |
| Web Speech API fuer STT | 100% STT-Kostenersparnis | Implementiert |
| Uebersetzungs-Queue (Batch) | Vermeidet Live-Kosten | Implementiert |
| Pre-Translation Scripts | Reduziert Live-Anfragen | Implementiert |
| Circuit Breaker Pattern | Verhindert Kosten-Kaskaden | Implementiert |

---

*Dokument erstellt: Maerz 2026 | Naechstes Update geplant: Quartal Q2/2026*
