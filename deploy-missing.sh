#!/bin/bash
# Deploy-Script fuer fehlende/veraltete Vercel-Deployments
# Ausfuehren: chmod +x deploy-missing.sh && ./deploy-missing.sh

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "========================================="
echo "  Fehlende/veraltete Apps deployen"
echo "========================================="
echo ""

# --- 1. Nicht deployed: cityguide-visitor ---
echo "[1/4] Deploying cityguide-visitor (NEU - fehlt komplett)..."
cd "$REPO_ROOT/apps/cityguide-visitor"
vercel link --yes
vercel deploy --prod --yes
echo "  -> cityguide-visitor deployed!"
echo ""

# --- 2. Nicht deployed: conference-listener ---
echo "[2/4] Deploying conference-listener (NEU - fehlt komplett)..."
cd "$REPO_ROOT/apps/conference-listener"
vercel link --yes
vercel deploy --prod --yes
echo "  -> conference-listener deployed!"
echo ""

# --- 3. Veraltet: artguide-whitelabel (guide-museum-whitelabel) ---
echo "[3/4] Redeploying artguide-whitelabel (veraltet - PR #88 statt #93)..."
cd "$REPO_ROOT/apps/artguide-whitelabel"
vercel deploy --prod --yes
echo "  -> artguide-whitelabel redeployed!"
echo ""

# --- 4. Veraltet: guidetranslatorapp (Haupt-App) ---
echo "[4/4] Redeploying guidetranslatorapp (veraltet - Mar 20)..."
# Falls die Haupt-App im Root oder einem speziellen Pfad liegt, hier anpassen:
# Option A: Falls es eine eigene App im Root ist
cd "$REPO_ROOT"
vercel deploy --prod --yes
# Option B: Falls es eine bestimmte App ist, diese Zeile stattdessen nutzen:
# cd "$REPO_ROOT/apps/<app-name>" && vercel deploy --prod --yes
echo "  -> guidetranslatorapp redeployed!"
echo ""

echo "========================================="
echo "  Fertig! Alle 4 Deployments ausgefuehrt."
echo "========================================="
echo ""
echo "Pruefen mit: vercel ls"
