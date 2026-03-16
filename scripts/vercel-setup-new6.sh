#!/usr/bin/env bash
#
# Setup ONLY the 6 new market apps in Vercel
# (Hotel/Counter, Medical, Conference/Events)
#
# Usage: ./scripts/vercel-setup-new6.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_DOMAIN="fintutto.world"
VERCEL_SCOPE="${VERCEL_SCOPE:-}"
SCOPE_FLAG=""
if [[ -n "$VERCEL_SCOPE" ]]; then
  SCOPE_FLAG="--scope $VERCEL_SCOPE"
fi

log() { echo -e "\033[1;34m[setup]\033[0m $1"; }
ok()  { echo -e "\033[1;32m  [ok]\033[0m $1"; }
err() { echo -e "\033[1;31m [err]\033[0m $1"; }

# The 6 new apps: "directory|vercel-project-name|subdomain"
NEW_APPS=(
  "apps/counter-staff|fintutto-hotel-staff|hotel-staff"
  "apps/counter-guest|fintutto-hotel-guest|hotel-guest"
  "apps/medical-staff|fintutto-medical-staff|medical-staff"
  "apps/medical-patient|fintutto-medical-patient|medical-patient"
  "apps/conference-speaker|fintutto-event-speaker|event-speaker"
  "apps/conference-listener|fintutto-event-attendee|event-attendee"
)

echo ""
echo "========================================="
echo "  Setup 6 New Market Apps in Vercel"
echo "========================================="
echo ""

for app in "${NEW_APPS[@]}"; do
  IFS='|' read -r dir name subdomain <<< "$app"
  echo "  - $name -> ${subdomain}.${BASE_DOMAIN}"
done
echo ""

# Check vercel CLI
if ! command -v vercel &> /dev/null; then
  err "Vercel CLI not found. Run: npm i -g vercel && vercel login"
  exit 1
fi

user=$(vercel whoami $SCOPE_FLAG 2>/dev/null)
ok "Logged in as: $user"

echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi
echo ""

for app in "${NEW_APPS[@]}"; do
  IFS='|' read -r dir name subdomain <<< "$app"
  full_domain="${subdomain}.${BASE_DOMAIN}"
  full_path="$ROOT_DIR/$dir"

  log "Setting up: $name ($dir)"
  echo "  Domain: $full_domain"

  # Link as Vercel project
  if [[ -d "$full_path/.vercel" ]]; then
    log "  Already linked, re-linking..."
    rm -rf "$full_path/.vercel"
  fi

  log "  Linking $dir as Vercel project '$name'..."
  cd "$full_path"
  vercel link --yes --project "$name" $SCOPE_FLAG 2>/dev/null || {
    log "  Creating new project: $name"
    vercel --yes $SCOPE_FLAG 2>/dev/null || true
  }
  cd "$ROOT_DIR"

  # Add domain
  log "  Adding domain: $full_domain"
  vercel domains add "$full_domain" $SCOPE_FLAG 2>/dev/null || \
    echo "  (Domain may need manual setup in Vercel dashboard)"

  ok "Done: $name -> $full_domain"
  echo ""
done

echo "========================================="
echo "  All 6 new apps created!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Set environment variables in Vercel dashboard for each project"
echo "  2. Add CNAME records in DNS for:"
for app in "${NEW_APPS[@]}"; do
  IFS='|' read -r dir name subdomain <<< "$app"
  echo "     ${subdomain}.${BASE_DOMAIN} -> cname.vercel-dns.com"
done
echo "  3. Push code to trigger first deployment: git push"
echo ""
