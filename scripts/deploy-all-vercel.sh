#!/bin/bash
# =============================================================================
# Fintutto Translator — Deploy all apps to Vercel as separate projects
# =============================================================================
# Usage:
#   chmod +x scripts/deploy-all-vercel.sh
#   ./scripts/deploy-all-vercel.sh
#
# Prerequisites:
#   - npm i -g vercel
#   - vercel login (einmalig, muss zum Fintutto-Account eingeloggt sein)
# =============================================================================

set -e

SCOPE="fintutto"
PREFIX="translator"

# Alle Vite-Apps (18 Stueck)
VITE_APPS=(
  "consumer"
  "listener"
  "enterprise"
  "landing"
  "school-teacher"
  "school-student"
  "authority-clerk"
  "authority-visitor"
  "ngo-helper"
  "ngo-client"
  "counter-staff"
  "counter-guest"
  "medical-staff"
  "medical-patient"
  "conference-speaker"
  "conference-listener"
  "artguide-visitor"
  "artguide-whitelabel"
)

# Farben fuer Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================="
echo "  Fintutto Translator — Vercel Deployment"
echo "  ${#VITE_APPS[@]} Vite Apps + 1 Next.js App"
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

# --- Deploy Vite Apps ---
for APP in "${VITE_APPS[@]}"; do
  PROJECT_NAME="${PREFIX}-${APP}"
  echo -e "${YELLOW}▶ Deploying: ${PROJECT_NAME}${NC}"

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
echo -e "${YELLOW}▶ Deploying: ${PREFIX}-artguide-portal (Next.js)${NC}"

if (cd apps/artguide-portal && vercel deploy --yes --prod \
  --scope "$SCOPE" \
  --name "${PREFIX}-artguide-portal" \
  2>&1); then
  echo -e "${GREEN}✓ ${PREFIX}-artguide-portal deployed!${NC}"
  SUCCEEDED+=("${PREFIX}-artguide-portal")
else
  echo -e "${RED}✗ ${PREFIX}-artguide-portal failed!${NC}"
  FAILED+=("${PREFIX}-artguide-portal")
fi

# --- Summary ---
echo ""
echo "============================================="
echo "  Deployment Summary"
echo "============================================="
echo -e "${GREEN}Erfolgreich: ${#SUCCEEDED[@]}${NC}"
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
  echo "Tipp: Einzelne Apps nochmal deployen mit:"
  echo "  vercel deploy --yes --prod --scope $SCOPE --name <project-name>"
fi

echo ""
echo "Alle Projekte findbar unter: https://vercel.com/${SCOPE}"
echo "============================================="
