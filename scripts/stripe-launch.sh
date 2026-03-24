#!/usr/bin/env bash
# =============================================================================
# GuideTranslator — Stripe Launch Script
# =============================================================================
#
# Fuehrt alle Schritte aus, um Stripe live zu schalten:
#   1. Stripe-Produkte und Preise anlegen (oder existierende finden)
#   2. Price IDs automatisch in src/lib/tiers.ts eintragen
#   3. Zusammenfassung der verbleibenden manuellen Schritte ausgeben
#
# Usage (TEST):
#   STRIPE_SECRET_KEY=sk_test_xxx ./scripts/stripe-launch.sh
#
# Usage (LIVE):
#   STRIPE_SECRET_KEY=sk_live_xxx ./scripts/stripe-launch.sh
#
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Validate key
if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "Fehler: STRIPE_SECRET_KEY nicht gesetzt."
  echo ""
  echo "Usage:"
  echo "  STRIPE_SECRET_KEY=sk_test_xxx ./scripts/stripe-launch.sh   # Testmodus"
  echo "  STRIPE_SECRET_KEY=sk_live_xxx ./scripts/stripe-launch.sh   # Live-Modus"
  exit 1
fi

# Detect mode
if [[ "$STRIPE_SECRET_KEY" == sk_live_* ]]; then
  MODE="LIVE"
  echo "========================================"
  echo "  ACHTUNG: LIVE-MODUS!"
  echo "  Produkte werden im Live-Account erstellt."
  echo "========================================"
  echo ""
  read -p "Fortfahren? (j/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[jJyY]$ ]]; then
    echo "Abgebrochen."
    exit 0
  fi
else
  MODE="TEST"
  echo "Modus: TEST"
fi

echo ""

# Ensure stripe package is installed
if ! node -e "require('stripe')" 2>/dev/null; then
  echo "Installiere stripe-Paket ..."
  npm install --no-save stripe
  echo ""
fi

# Run setup script
echo "Starte Stripe-Setup ..."
echo ""
npx tsx scripts/stripe-setup.ts

echo ""
echo "========================================"
echo "  Stripe-Setup abgeschlossen ($MODE)"
echo "========================================"
