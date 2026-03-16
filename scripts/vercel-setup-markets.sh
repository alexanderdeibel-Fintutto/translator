#!/usr/bin/env bash
#
# Vercel Market Apps Setup Script
# ================================
# Creates Vercel projects for all market-specific app flavors.
#
# Prerequisites:
#   npm i -g vercel   (or: npx vercel login)
#   vercel login      (authenticate first)
#
# Usage:
#   ./scripts/vercel-setup-markets.sh
#
# What it does:
#   1. Links each app directory as a new Vercel project
#   2. Copies environment variables from .env
#   3. Assigns custom domains (subdomains under fintutto.world)
#
# NOTE: Run this from the repository root directory.

set -euo pipefail

# ── Configuration ────────────────────────────────────────────

# Vercel team/scope (leave empty for personal account)
VERCEL_SCOPE="${VERCEL_SCOPE:-}"

# Base domain
BASE_DOMAIN="fintutto.world"

# Define ALL apps: "directory|project-name|subdomain"
# Format: subdomain.fintutto.world
#
# Core apps:
#   www          -> landing
#   app          -> consumer
#   guide        -> enterprise
#   live         -> listener
#
# Market apps:
#   Schools:      school-teacher, school-student
#   Authorities:  amt-clerk, amt-visitor
#   NGO:          ngo-helper, ngo-client
#   Hospitality:  hotel-staff, hotel-guest
#   Medical:      medical-staff, medical-patient
#   Conference:   event-speaker, event-attendee
ALL_APPS=(
  # ── Core Apps ──
  "apps/landing|fintutto-landing|www"
  "apps/consumer|fintutto-consumer|app"
  "apps/enterprise|fintutto-enterprise|guide"
  "apps/listener|fintutto-listener|live"
  # ── Schools ──
  "apps/school-teacher|fintutto-school-teacher|school-teacher"
  "apps/school-student|fintutto-school-student|school-student"
  # ── Authorities ──
  "apps/authority-clerk|fintutto-authority-clerk|amt-clerk"
  "apps/authority-visitor|fintutto-authority-visitor|amt-visitor"
  # ── NGO / Refugee ──
  "apps/ngo-helper|fintutto-ngo-helper|ngo-helper"
  "apps/ngo-client|fintutto-ngo-client|ngo-client"
  # ── Hospitality / Hotel ──
  "apps/counter-staff|fintutto-hotel-staff|hotel-staff"
  "apps/counter-guest|fintutto-hotel-guest|hotel-guest"
  # ── Medical ──
  "apps/medical-staff|fintutto-medical-staff|medical-staff"
  "apps/medical-patient|fintutto-medical-patient|medical-patient"
  # ── Conference / Events ──
  "apps/conference-speaker|fintutto-event-speaker|event-speaker"
  "apps/conference-listener|fintutto-event-attendee|event-attendee"
)

# Environment variables to copy (add your actual values here)
# These are the VITE_ prefixed vars needed at build time.
# The script will try to read them from .env if it exists.
ENV_VARS=(
  "VITE_GOOGLE_TTS_API_KEY"
  "VITE_GOOGLE_TRANSLATE_API_KEY"
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
  "VITE_SENTRY_DSN"
  "VITE_GA_MEASUREMENT_ID"
  "VITE_STRIPE_PUBLISHABLE_KEY"
)

# ── Helper Functions ─────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCOPE_FLAG=""
if [[ -n "$VERCEL_SCOPE" ]]; then
  SCOPE_FLAG="--scope $VERCEL_SCOPE"
fi

log() { echo -e "\033[1;34m[setup]\033[0m $1"; }
ok()  { echo -e "\033[1;32m  [ok]\033[0m $1"; }
err() { echo -e "\033[1;31m [err]\033[0m $1"; }
warn() { echo -e "\033[1;33m[warn]\033[0m $1"; }

check_vercel() {
  if ! command -v vercel &> /dev/null; then
    err "Vercel CLI not found. Install it first:"
    echo "  npm i -g vercel"
    echo "  vercel login"
    exit 1
  fi

  # Check if logged in
  if ! vercel whoami $SCOPE_FLAG &> /dev/null 2>&1; then
    err "Not logged in to Vercel. Run: vercel login"
    exit 1
  fi

  local user
  user=$(vercel whoami $SCOPE_FLAG 2>/dev/null)
  ok "Logged in as: $user"
}

load_env() {
  if [[ -f "$ROOT_DIR/.env" ]]; then
    log "Loading environment variables from .env"
    set -a
    source "$ROOT_DIR/.env"
    set +a
    ok "Loaded .env"
  elif [[ -f "$ROOT_DIR/.env.local" ]]; then
    log "Loading environment variables from .env.local"
    set -a
    source "$ROOT_DIR/.env.local"
    set +a
    ok "Loaded .env.local"
  else
    warn "No .env file found. Environment variables will need to be set manually in Vercel."
  fi
}

setup_project() {
  local app_dir="$1"
  local project_name="$2"
  local subdomain="$3"
  local full_domain="${subdomain}.${BASE_DOMAIN}"
  local full_path="$ROOT_DIR/$app_dir"

  log "Setting up: $project_name ($app_dir)"
  echo "  Domain: $full_domain"

  # Step 1: Link the directory as a Vercel project
  if [[ -d "$full_path/.vercel" ]]; then
    warn "Already linked. Skipping link step."
  else
    log "  Linking $app_dir as Vercel project..."
    cd "$full_path"
    vercel link --yes --project "$project_name" $SCOPE_FLAG 2>/dev/null || \
    vercel link --yes $SCOPE_FLAG 2>/dev/null || {
      # If project doesn't exist yet, create it
      log "  Creating new project: $project_name"
      vercel --yes $SCOPE_FLAG 2>/dev/null || true
    }
    cd "$ROOT_DIR"
    ok "Linked: $project_name"
  fi

  # Step 2: Set environment variables
  log "  Setting environment variables..."
  for var_name in "${ENV_VARS[@]}"; do
    local var_value="${!var_name:-}"
    if [[ -n "$var_value" ]]; then
      echo "$var_value" | vercel env add "$var_name" production --yes $SCOPE_FLAG 2>/dev/null || true
      echo "$var_value" | vercel env add "$var_name" preview --yes $SCOPE_FLAG 2>/dev/null || true
    fi
  done
  ok "Environment variables set"

  # Step 3: Add custom domain to the Vercel project
  log "  Adding domain: $full_domain"
  vercel domains add "$full_domain" $SCOPE_FLAG 2>/dev/null || \
    warn "Could not add domain $full_domain (may need manual setup in Vercel dashboard)"

  ok "Done: $project_name -> $full_domain"
  echo ""
}

# ── Main ─────────────────────────────────────────────────────

main() {
  echo ""
  echo "========================================="
  echo "  Vercel Market Apps Setup"
  echo "========================================="
  echo ""
  echo "This will create ${#ALL_APPS[@]} Vercel projects:"
  for app in "${ALL_APPS[@]}"; do
    IFS='|' read -r dir name subdomain <<< "$app"
    echo "  - $name -> ${subdomain}.${BASE_DOMAIN}"
  done
  echo ""

  # Preflight checks
  check_vercel
  load_env

  echo ""
  read -p "Continue? (y/N) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi

  echo ""

  # Setup each project
  for app in "${ALL_APPS[@]}"; do
    IFS='|' read -r dir name subdomain <<< "$app"
    setup_project "$dir" "$name" "$subdomain"
  done

  echo "========================================="
  echo "  Setup Complete!"
  echo "========================================="
  echo ""
  echo "DNS Setup:"
  echo "  Each subdomain needs a CNAME record pointing to"
  echo "  cname.vercel-dns.com (or the project-specific alias)."
  echo ""
  echo "Trigger first deployment:"
  echo "  git push (or: vercel --prod in each app dir)"
  echo ""
  echo "Verify all apps are live:"
  for app in "${ALL_APPS[@]}"; do
    IFS='|' read -r dir name subdomain <<< "$app"
    echo "  https://${subdomain}.${BASE_DOMAIN}"
  done
  echo ""
}

main "$@"
