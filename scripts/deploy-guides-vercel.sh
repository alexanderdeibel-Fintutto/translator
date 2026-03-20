#!/bin/bash
# =============================================================================
# Fintutto — Deploy Guide-Apps to Vercel (nur die neuen, noch nicht deployten)
# =============================================================================
# Usage:
#   chmod +x scripts/deploy-guides-vercel.sh
#   ./scripts/deploy-guides-vercel.sh
#
# Deployt folgende 3 Apps als separate Vercel-Projekte:
#   - translator-artguide-visitor   (Vite SPA)
#   - translator-artguide-whitelabel (Vite SPA)
#   - translator-artguide-portal    (Next.js)
#
# Prerequisites:
#   - npm i -g vercel
#   - vercel login (einmalig, muss zum Fintutto-Account eingeloggt sein)
# =============================================================================

set -e

SCOPE="fintutto"
PREFIX="translator"

# Nur die neuen Guide-Apps (Vite)
VITE_GUIDE_APPS=(
  "artguide-visitor"
  "artguide-whitelabel"
)

# Farben fuer Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "============================================="
echo "  Fintutto Guide-Apps — Vercel Deployment"
echo "  2 Vite Apps + 1 Next.js App"
echo "============================================="
echo ""

# Check ob vercel CLI installiert ist
if ! command -v vercel &> /dev/null; then
  echo -e "${RED}Fehler: Vercel CLI nicht gefunden. Bitte installieren:${NC}"
  echo "  npm i -g vercel"
  exit 1
fi

# Check ob eingeloggt
echo "Pruefe Vercel Login..."
if ! vercel whoami --scope "$SCOPE" 2>/dev/null; then
  echo -e "${RED}Bitte zuerst einloggen: vercel login${NC}"
  exit 1
fi
echo ""

SUCCEEDED=()
FAILED=()

# --- Deploy Vite Guide-Apps ---
for APP in "${VITE_GUIDE_APPS[@]}"; do
  PROJECT_NAME="${PREFIX}-${APP}"
  echo -e "${YELLOW}▶ [1/3] Deploying: ${PROJECT_NAME} (Vite)${NC}"

  if vercel deploy --yes --prod \
    --scope "$SCOPE" \
    --name "$PROJECT_NAME" \
    --build-command "cd ../.. && npx vite build --config apps/${APP}/vite.config.ts" \
    --output-directory "dist" \
    2>&1; then
    echo -e "${GREEN}✓ ${PROJECT_NAME} deployed!${NC}"
    SUCCEEDED+=("$PROJECT_NAME")
  else
    echo -e "${RED}✗ ${PROJECT_NAME} failed!${NC}"
    FAILED+=("$PROJECT_NAME")
  fi
  echo ""
done

# --- Deploy Next.js App (artguide-portal) ---
PROJECT_NAME="${PREFIX}-artguide-portal"
echo -e "${YELLOW}▶ [3/3] Deploying: ${PROJECT_NAME} (Next.js)${NC}"

if (cd apps/artguide-portal && vercel deploy --yes --prod \
  --scope "$SCOPE" \
  --name "$PROJECT_NAME" \
  2>&1); then
  echo -e "${GREEN}✓ ${PROJECT_NAME} deployed!${NC}"
  SUCCEEDED+=("$PROJECT_NAME")
else
  echo -e "${RED}✗ ${PROJECT_NAME} failed!${NC}"
  FAILED+=("$PROJECT_NAME")
fi

# --- Summary ---
echo ""
echo "============================================="
echo "  Deployment Summary"
echo "============================================="
echo -e "${GREEN}Erfolgreich: ${#SUCCEEDED[@]} / 3${NC}"
for s in "${SUCCEEDED[@]}"; do
  echo -e "  ${GREEN}✓ ${s}${NC}"
done

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}Fehlgeschlagen: ${#FAILED[@]}${NC}"
  for f in "${FAILED[@]}"; do
    echo -e "  ${RED}✗ ${f}${NC}"
  done
  echo ""
  echo "Tipp: Einzelne App nochmal deployen mit:"
  echo "  vercel deploy --yes --prod --scope $SCOPE --name <project-name>"
fi

echo ""
echo -e "${BLUE}Projekte unter: https://vercel.com/${SCOPE}${NC}"
echo ""
echo "Naechste Schritte:"
echo "  1. Environment Variables in Vercel setzen (Supabase Keys etc.)"
echo "  2. Optional: Custom Domains zuweisen"
echo "  3. Optional: GitHub-Integration fuer Auto-Deploy aktivieren"
echo "============================================="
