#!/bin/bash
# =============================================================================
# Fintutto Platform — Vercel Deployment für alle neuen Apps
# =============================================================================
# Voraussetzung: vercel CLI installiert und eingeloggt (vercel login)
# Ausführen: chmod +x deploy-new-apps.sh && ./deploy-new-apps.sh
#
# Neue Apps die deployed werden:
# - hotel-staff      → hotel-staff.fintutto.world
# - hotel-guest      → hotel-guest.fintutto.world
# - cruise-staff     → cruise-staff.fintutto.world
# - cruise-guest     → cruise-guest.fintutto.world
# - event-speaker    → event-speaker.fintutto.world
# - event-attendee   → event-attendee.fintutto.world
# - service-staff    → service-staff.fintutto.world
# - service-guest    → service-guest.fintutto.world
# - sales            → sales.fintutto.world
# - ams              → ams.fintutto.world
# - cms              → cms.fintutto.world
# =============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
VERCEL_ORG="alexanderdeibel-fintutto"  # Vercel Team/Org-Name (anpassen falls nötig)

echo "=============================================="
echo "  Fintutto Platform — Neue Apps deployen"
echo "=============================================="
echo ""

# Funktion: App deployen
deploy_app() {
  local APP_NAME="$1"
  local SUBDOMAIN="$2"
  local APP_DIR="$REPO_ROOT/apps/$APP_NAME"

  echo "--- Deploying $APP_NAME → $SUBDOMAIN.fintutto.world ---"

  if [ ! -d "$APP_DIR" ]; then
    echo "  ❌ Verzeichnis nicht gefunden: $APP_DIR"
    return 1
  fi

  cd "$APP_DIR"

  # Vercel-Projekt verknüpfen (erstellt neues Projekt falls nicht vorhanden)
  vercel link --yes --project "fintutto-$APP_NAME" 2>/dev/null || true

  # Production-Deployment
  vercel deploy --prod --yes

  echo "  ✅ $APP_NAME deployed!"
  echo ""
}

# ─── Translator Apps ──────────────────────────────────────────────────────────
deploy_app "hotel-staff"    "hotel-staff"
deploy_app "hotel-guest"    "hotel-guest"
deploy_app "cruise-staff"   "cruise-staff"
deploy_app "cruise-guest"   "cruise-guest"
deploy_app "event-speaker"  "event-speaker"
deploy_app "event-attendee" "event-attendee"
deploy_app "service-staff"  "service-staff"
deploy_app "service-guest"  "service-guest"

# ─── Platform Apps ────────────────────────────────────────────────────────────
deploy_app "sales" "sales"
deploy_app "ams"   "ams"
deploy_app "cms"   "cms"

echo "=============================================="
echo "  Alle Apps deployed!"
echo ""
echo "  Nächste Schritte:"
echo "  1. In Vercel Dashboard für jede App unter Settings → Domains"
echo "     die Custom Domain hinzufügen:"
echo ""
echo "     hotel-staff.fintutto.world"
echo "     hotel-guest.fintutto.world"
echo "     cruise-staff.fintutto.world"
echo "     cruise-guest.fintutto.world"
echo "     event-speaker.fintutto.world"
echo "     event-attendee.fintutto.world"
echo "     service-staff.fintutto.world"
echo "     service-guest.fintutto.world"
echo "     sales.fintutto.world"
echo "     ams.fintutto.world"
echo "     cms.fintutto.world"
echo ""
echo "  2. Umgebungsvariablen in Vercel Dashboard setzen:"
echo "     VITE_GOOGLE_MAPS_API_KEY"
echo "     VITE_GA_MEASUREMENT_ID"
echo "     VITE_SUPABASE_URL"
echo "     VITE_SUPABASE_ANON_KEY"
echo "     GOOGLE_API_KEY"
echo "     AZURE_TRANSLATE_KEY"
echo "=============================================="
