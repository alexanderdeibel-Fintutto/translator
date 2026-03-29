# Vercel Setup — Neue Fintutto Apps

## Übersicht

Alle neuen Apps sind im Monorepo unter `/apps/` vorhanden und haben bereits:
- `vercel.json` mit Build-Konfiguration
- Build-Scripts in `package.json`

## Schritt 1: Vercel-Projekte erstellen

Für jede App ein neues Vercel-Projekt anlegen:

### Option A: Vercel CLI (empfohlen)

```bash
# Einmalig einloggen
vercel login

# Deployment-Skript ausführen
chmod +x deploy-new-apps.sh
./deploy-new-apps.sh
```

### Option B: Vercel Dashboard (manuell)

Für jede App unter https://vercel.com/new:

1. **Import Git Repository** → `alexanderdeibel-Fintutto/translator`
2. **Root Directory** auf `apps/[APP-NAME]` setzen
3. **Framework Preset**: Vite (für Translator-Apps) oder Next.js (für artguide-portal)
4. **Build Command**: Aus `vercel.json` übernehmen (z.B. `cd ../.. && npm run build:hotel-staff`)
5. **Output Directory**: `dist` (für Vite-Apps)

## Schritt 2: Custom Domains verbinden

In jedem Vercel-Projekt unter **Settings → Domains**:

| App | Domain |
|-----|--------|
| hotel-staff | `hotel-staff.fintutto.world` |
| hotel-guest | `hotel-guest.fintutto.world` |
| cruise-staff | `cruise-staff.fintutto.world` |
| cruise-guest | `cruise-guest.fintutto.world` |
| event-speaker | `event-speaker.fintutto.world` |
| event-attendee | `event-attendee.fintutto.world` |
| service-staff | `service-staff.fintutto.world` |
| service-guest | `service-guest.fintutto.world` |
| sales | `sales.fintutto.world` |
| ams | `ams.fintutto.world` |
| cms | `cms.fintutto.world` |

> **DNS**: Alle Subdomains zeigen bereits per CNAME auf `cname.vercel-dns.com`

## Schritt 3: Umgebungsvariablen setzen

In **jedem** Vercel-Projekt unter **Settings → Environment Variables**:

### Pflicht-Variablen (alle Apps)

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `VITE_SUPABASE_URL` | `https://aaefocdqgdgexkcrjhks.supabase.co` | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `[aus Supabase Dashboard]` | Supabase Anon Key |
| `GOOGLE_API_KEY` | `[Google Cloud API Key]` | Server-seitiger Google API Key |
| `AZURE_TRANSLATE_KEY` | `[Azure Cognitive Services]` | Azure Translator Key |
| `AZURE_TRANSLATE_REGION` | `westeurope` | Azure Region |

### Optionale Variablen (empfohlen)

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics 4 |
| `VITE_GOOGLE_TTS_API_KEY` | `[Google Cloud API Key]` | Google TTS (client-side) |
| `VITE_SENTRY_DSN` | `[Sentry DSN]` | Error Tracking |

### Nur für artguide-portal und artguide-visitor

| Variable | Wert | Beschreibung |
|----------|------|--------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `[Google Maps API Key]` | Google Maps (portal) |
| `VITE_GOOGLE_MAPS_API_KEY` | `[Google Maps API Key]` | Google Maps (visitor) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | GA4 für artguide-portal |

## Schritt 4: Google Cloud APIs aktivieren

Unter https://console.cloud.google.com/apis/library im Projekt "FinTuttO":

- ✅ Cloud Translation API (bereits aktiv)
- ✅ Cloud Text-to-Speech API (bereits aktiv)
- ✅ Cloud Speech-to-Text API (bereits aktiv)
- ⬜ **Maps JavaScript API** → für artguide-portal und artguide-visitor
- ⬜ **Places API** → für POI-Suche und Autocomplete
- ⬜ **Geocoding API** → für Adress-zu-Koordinaten Umwandlung

### API-Key für Maps erstellen

1. https://console.cloud.google.com/apis/credentials
2. **+ Create Credentials** → **API Key**
3. **Restrict Key** → HTTP referrers: `*.fintutto.world/*`
4. APIs einschränken: Maps JavaScript API, Places API, Geocoding API
5. Key in Vercel-Umgebungsvariablen eintragen

## Schritt 5: Google Analytics 4 einrichten

1. https://analytics.google.com → **Admin** → **Property erstellen**
2. Property Name: "Fintutto Platform"
3. **Data Stream** → **Web** → URL: `fintutto.world`
4. **Measurement ID** (Format: `G-XXXXXXXXXX`) kopieren
5. In Vercel als `VITE_GA_MEASUREMENT_ID` und `NEXT_PUBLIC_GA_MEASUREMENT_ID` setzen

### Cross-Domain Tracking (optional)

Für einheitliches Tracking über alle Subdomains:
- In GA4: Admin → Data Streams → Configure tag settings → Configure your domains
- Domain: `fintutto.world` hinzufügen

## Status-Übersicht

| App | Code | Vercel-Projekt | Domain | Env-Vars |
|-----|------|----------------|--------|----------|
| hotel-staff | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| hotel-guest | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| cruise-staff | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| cruise-guest | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| event-speaker | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| event-attendee | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| service-staff | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| service-guest | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| sales | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| ams | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| cms | ✅ | ⬜ erstellen | ⬜ verbinden | ⬜ setzen |
| artguide-portal | ✅ | ✅ vorhanden | ✅ verbunden | ⬜ Maps-Key |
| artguide-visitor | ✅ | ✅ vorhanden | ✅ verbunden | ⬜ Maps-Key |
