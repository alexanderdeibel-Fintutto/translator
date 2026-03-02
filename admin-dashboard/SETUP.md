# Fintutto Admin Dashboard — Setup-Anleitung

## Architektur-Ueberblick

```
guidetranslator (Vite/React)
  ├── GA4 ──────────────► Google Analytics (G-4586TEBW50)
  ├── Sentry ───────────► sentry.io (Error Tracking)
  ├── Web Vitals ───────► GA4 + Admin API
  └── Admin Reporter ──► fintutto-admin API ──► Supabase DB
                              │
                              ▼
                    Admin Dashboard UI
                    (Next.js auf Vercel)
```

## Schritt 1: Supabase Schema erstellen

1. Gehe zu https://supabase.com/dashboard
2. Waehle das Projekt `aaefocdqgdgexkcrjhks`
3. Gehe zu **SQL Editor**
4. Fuege den Inhalt von `supabase/001_analytics_schema.sql` ein und klicke **Run**
5. Pruefe unter **Table Editor**, dass folgende Tabellen existieren:
   - `analytics_events`
   - `analytics_daily`
   - `analytics_errors`
   - `analytics_web_vitals`
   - `api_keys`

## Schritt 2: API Key erstellen

Fuehre im Supabase SQL Editor aus:

```sql
-- Generiere einen API Key (ersetze 'dein-geheimer-key' mit einem zufaelligen String)
INSERT INTO api_keys (key_hash, name, source)
VALUES (
  encode(sha256('dein-geheimer-key'::bytea), 'hex'),
  'Translator Production',
  'translator'
);
```

Besser: Generiere den Key mit Node.js:
```bash
node -e "console.log('fta_' + require('crypto').randomUUID().replace(/-/g, ''))"
```

Speichere diesen Key — du brauchst ihn als `VITE_ADMIN_API_KEY` im Translator.

## Schritt 3: Admin-Repo aufsetzen

```bash
cd alexanderdeibel-Fintutto/admin
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false
```

Dann kopiere die Dateien aus `admin-dashboard/` hierher:
- `lib/supabase-admin.ts`
- `lib/auth.ts`
- `app/api/events/route.ts`
- `app/api/metrics/route.ts`
- `app/dashboard/page.tsx`
- `components/MetricCard.tsx`
- `components/VitalsChart.tsx`
- `components/ErrorList.tsx`
- `components/TranslationStats.tsx`

## Schritt 4: Vercel Deployment (Admin)

1. Gehe zu https://vercel.com/new
2. Importiere `alexanderdeibel-Fintutto/admin`
3. Framework: Next.js (automatisch erkannt)
4. Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://aaefocdqgdgexkcrjhks.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (aus Supabase Dashboard → Settings → API)
5. Deploy!

Notiere die URL (z.B. `https://admin-fintutto.vercel.app`)

## Schritt 5: Translator mit Admin verbinden

Setze in den Vercel Environment Variables des **Translators**:
- `VITE_ADMIN_API_URL` = `https://admin-fintutto.vercel.app` (die URL aus Schritt 4)
- `VITE_ADMIN_API_KEY` = der Key aus Schritt 2
- `VITE_GA_MEASUREMENT_ID` = `G-4586TEBW50`
- `VITE_SENTRY_DSN` = (dein Sentry DSN)

## Schritt 6: Vercel Translator Setup

1. Gehe zu https://vercel.com/new
2. Importiere `alexanderdeibel-Fintutto/translator`
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Setze alle Environment Variables aus Schritt 5
7. Gehe zum Projekt → **Analytics** Tab → Aktiviere Web Analytics
8. Gehe zum Projekt → **Speed Insights** Tab → Aktiviere Speed Insights

## Schritt 7: GA4 Custom Dimensions

Gehe zu https://analytics.google.com → Admin → Custom Definitions:

**Custom Dimensions (Event-Scope):**
| Name | Event parameter |
|------|----------------|
| Source Language | `source_lang` |
| Target Language | `target_lang` |
| Translation Mode | `mode` |
| Provider | `provider` |
| Connection Mode | `connection_mode` |
| Error Type | `error_type` |
| Feature | `feature` |
| Web Vital Metric | `metric` |
| Rating | `rating` |

**Custom Metrics (Event-Scope):**
| Name | Event parameter | Unit |
|------|----------------|------|
| Latency | `latency_ms` | Milliseconds |
| Duration | `duration_ms` | Milliseconds |
| Text Length | `text_length` | Standard |

## Schritt 8: Sentry Setup

1. Gehe zu https://sentry.io → Create Project
2. Platform: Browser → JavaScript → React
3. Kopiere den DSN
4. Setze `VITE_SENTRY_DSN` in Vercel (Translator)
5. Erstelle Alerts:
   - **High Error Rate**: When events > 10 per hour
   - **LCP Regression**: When LCP p75 > 4000ms

## Schritt 9: GitHub Security

Fuer beide Repos (`translator` und `admin`):

1. **Settings → Branches → Add rule** fuer `main`:
   - ✅ Require pull request reviews (1)
   - ✅ Require status checks to pass: `build-and-test`
   - ✅ Require branches to be up to date
2. **Settings → Secrets → Actions**:
   - `VITE_GA_MEASUREMENT_ID`
   - `VITE_SENTRY_DSN`
3. **Settings → Code security**:
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Code scanning (CodeQL — JavaScript)

## Schritt 10: Supabase Cron-Jobs aktivieren

Im SQL Editor:
```sql
-- Aktiviere pg_cron Extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Taegliche Aggregation (05:00 UTC)
SELECT cron.schedule('aggregate-daily', '5 0 * * *',
  $$ SELECT aggregate_daily_stats(CURRENT_DATE - INTERVAL '1 day') $$
);

-- Woechentliche Bereinigung alter Events (Sonntag 03:00 UTC)
SELECT cron.schedule('cleanup-old-events', '0 3 * * 0',
  $$ DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days' $$
);
```

## Verifizierung

1. Oeffne den Translator → Pruefe GA4 Realtime (translation events)
2. Loesche absichtlich einen Fehler aus → Pruefe Sentry Dashboard
3. Oeffne Admin Dashboard `/dashboard` → Pruefe KPI-Karten
4. Pruefe Security Headers: https://securityheaders.com/?q=deine-url
5. Pruefe Web Vitals: https://pagespeed.web.dev/?url=deine-url
