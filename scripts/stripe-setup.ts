#!/usr/bin/env npx tsx
// =============================================================================
// GuideTranslator — Stripe Product & Price Setup
// =============================================================================
//
// Creates all Stripe products and prices for the 10 public paid tiers,
// then automatically patches src/lib/tiers.ts with the generated Price IDs.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/stripe-setup.ts
//
// Prerequisites:
//   npm install stripe (dev dependency)
//
// This script is IDEMPOTENT — it checks for existing products by metadata
// before creating new ones. Safe to run multiple times.
// =============================================================================

import Stripe from 'stripe'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TIERS_FILE = resolve(__dirname, '../src/lib/tiers.ts')

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  console.error('Fehler: STRIPE_SECRET_KEY nicht gesetzt.')
  console.error('Usage: STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/stripe-setup.ts')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

// All public paid tiers with their pricing (amounts in cents)
const PAID_TIERS = [
  { id: 'personal_pro', name: 'Personal Pro', monthly: 499, yearly: 4990 },
  { id: 'guide_basic', name: 'Guide Basic', monthly: 1990, yearly: 19900 },
  { id: 'guide_pro', name: 'Guide Pro', monthly: 3990, yearly: 39900 },
  { id: 'agency_standard', name: 'Agentur Standard', monthly: 9900, yearly: 99000 },
  { id: 'agency_premium', name: 'Agentur Premium', monthly: 24900, yearly: 249000 },
  { id: 'event_basic', name: 'Event Basic', monthly: 19900, yearly: 199000 },
  { id: 'event_pro', name: 'Event Pro', monthly: 49900, yearly: 499000 },
  { id: 'cruise_starter', name: 'Cruise Starter', monthly: 199000, yearly: 1990000 },
  { id: 'cruise_fleet', name: 'Cruise Fleet', monthly: 699000, yearly: 6990000 },
  { id: 'cruise_armada', name: 'Cruise Armada', monthly: 1999000, yearly: 19990000 },
]

interface TierResult {
  tierId: string
  productId: string
  monthlyPriceId: string
  yearlyPriceId: string
}

async function findExistingProduct(tierId: string): Promise<Stripe.Product | null> {
  const products = await stripe.products.search({
    query: `metadata["tier_id"]:"${tierId}"`,
  })
  return products.data[0] ?? null
}

async function findExistingPrice(productId: string, interval: 'month' | 'year'): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({
    product: productId,
    type: 'recurring',
    active: true,
  })
  return prices.data.find(p => p.recurring?.interval === interval) ?? null
}

async function setupTier(tier: typeof PAID_TIERS[0]): Promise<TierResult> {
  // Find or create product
  let product = await findExistingProduct(tier.id)
  if (product) {
    console.log(`  Produkt existiert: ${tier.name} (${product.id})`)
  } else {
    product = await stripe.products.create({
      name: `GuideTranslator — ${tier.name}`,
      metadata: { tier_id: tier.id },
    })
    console.log(`  Produkt erstellt: ${tier.name} (${product.id})`)
  }

  // Find or create monthly price
  let monthlyPrice = await findExistingPrice(product.id, 'month')
  if (monthlyPrice) {
    console.log(`  Monatspreis existiert: ${(monthlyPrice.unit_amount! / 100).toFixed(2)} EUR (${monthlyPrice.id})`)
  } else {
    monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.monthly,
      currency: 'eur',
      recurring: { interval: 'month' },
      metadata: { tier_id: tier.id, billing_cycle: 'monthly' },
    })
    console.log(`  Monatspreis erstellt: ${(tier.monthly / 100).toFixed(2)} EUR (${monthlyPrice.id})`)
  }

  // Find or create yearly price
  let yearlyPrice = await findExistingPrice(product.id, 'year')
  if (yearlyPrice) {
    console.log(`  Jahrespreis existiert: ${(yearlyPrice.unit_amount! / 100).toFixed(2)} EUR (${yearlyPrice.id})`)
  } else {
    yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.yearly,
      currency: 'eur',
      recurring: { interval: 'year' },
      metadata: { tier_id: tier.id, billing_cycle: 'yearly' },
    })
    console.log(`  Jahrespreis erstellt: ${(tier.yearly / 100).toFixed(2)} EUR (${yearlyPrice.id})`)
  }

  return {
    tierId: tier.id,
    productId: product.id,
    monthlyPriceId: monthlyPrice.id,
    yearlyPriceId: yearlyPrice.id,
  }
}

/**
 * Patch tiers.ts — replaces commented-out placeholder Price IDs with real ones.
 * For each tier, finds the pricing block and replaces the placeholder comments
 * with actual stripePriceIdMonthly / stripePriceIdYearly values.
 */
function patchTiersFile(results: TierResult[]): void {
  let content = readFileSync(TIERS_FILE, 'utf-8')
  let patchCount = 0

  for (const r of results) {
    // Pattern: replace commented-out price ID placeholders with real values
    // Matches both "// stripePriceIdMonthly: 'price_...'," and
    // "// TODO: Set after Stripe product creation" + the two commented lines
    const commentedPattern = new RegExp(
      `([ \\t]*)(?:\\/\\/ TODO: Set after Stripe product creation\\n\\s*)?` +
      `\\/\\/ stripePriceIdMonthly: '[^']*',\\n\\s*` +
      `\\/\\/ stripePriceIdYearly: '[^']*',`,
    )

    // Also handle already-set values (for re-running the script)
    const activePattern = new RegExp(
      `([ \\t]*)stripePriceIdMonthly: '[^']*',\\n\\s*` +
      `stripePriceIdYearly: '[^']*',`,
    )

    const replacement = (indent: string) =>
      `${indent}stripePriceIdMonthly: '${r.monthlyPriceId}',\n` +
      `${indent}stripePriceIdYearly: '${r.yearlyPriceId}',`

    // Find the tier block first by looking for the tier id
    // We need to find the right pricing section for each tier
    const tierBlockStart = content.indexOf(`id: '${r.tierId}'`)
    if (tierBlockStart === -1) {
      console.warn(`  WARNUNG: Tier '${r.tierId}' nicht in tiers.ts gefunden`)
      continue
    }

    // Find the next tier block (or end of TIERS object) to limit our search
    const nextTierIdx = content.indexOf(`\n  },\n`, tierBlockStart)
    const tierBlock = content.substring(tierBlockStart, nextTierIdx !== -1 ? nextTierIdx : undefined)

    // Try commented pattern first
    const commentedMatch = tierBlock.match(commentedPattern)
    if (commentedMatch) {
      const indent = commentedMatch[1] || '      '
      const fullMatch = commentedMatch[0]
      content = content.replace(fullMatch, replacement(indent))
      patchCount++
      continue
    }

    // Try active pattern (already set from previous run)
    const activeMatch = tierBlock.match(activePattern)
    if (activeMatch) {
      const indent = activeMatch[1] || '      '
      const fullMatch = activeMatch[0]
      content = content.replace(fullMatch, replacement(indent))
      patchCount++
      continue
    }

    console.warn(`  WARNUNG: Keine Price-ID-Platzhalter fuer '${r.tierId}' gefunden`)
  }

  if (patchCount > 0) {
    writeFileSync(TIERS_FILE, content, 'utf-8')
    console.log(`\n${patchCount} Tier(s) in tiers.ts aktualisiert.`)
  } else {
    console.log('\nKeine Aenderungen an tiers.ts noetig.')
  }
}

async function main() {
  console.log('='.repeat(70))
  console.log('GuideTranslator — Stripe Setup')
  console.log('='.repeat(70))
  console.log()

  // Check connection
  const account = await stripe.accounts.retrieve()
  console.log(`Stripe Account: ${account.settings?.dashboard?.display_name || account.id}`)
  console.log(`Modus: ${STRIPE_SECRET_KEY!.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`)
  console.log()

  const results: TierResult[] = []

  for (const tier of PAID_TIERS) {
    console.log(`[${tier.id}] ${tier.name}`)
    const result = await setupTier(tier)
    results.push(result)
    console.log()
  }

  // Auto-patch tiers.ts with generated Price IDs
  console.log('='.repeat(70))
  console.log('Patche src/lib/tiers.ts mit Price IDs ...')
  console.log('='.repeat(70))
  patchTiersFile(results)

  // Summary
  console.log()
  console.log('='.repeat(70))
  console.log('FERTIG! Price IDs wurden automatisch in tiers.ts eingetragen.')
  console.log('='.repeat(70))
  console.log()

  for (const r of results) {
    console.log(`  ${r.tierId}: monthly=${r.monthlyPriceId} yearly=${r.yearlyPriceId}`)
  }

  // Remaining manual steps
  console.log()
  console.log('='.repeat(70))
  console.log('Naechste Schritte:')
  console.log('='.repeat(70))
  console.log()
  console.log('1. Publishable Key in .env setzen:')
  console.log('   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...')
  console.log()
  console.log('2. Supabase Secrets setzen:')
  console.log(`   supabase secrets set STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}`)
  console.log('   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...')
  console.log()
  console.log('3. Edge Functions deployen:')
  console.log('   supabase functions deploy stripe-checkout stripe-portal stripe-webhook')
  console.log()
  console.log('4. Webhook-Endpunkt in Stripe Dashboard konfigurieren:')
  console.log('   URL: https://<project-ref>.supabase.co/functions/v1/stripe-webhook')
  console.log('   Events: checkout.session.completed, customer.subscription.updated,')
  console.log('           customer.subscription.deleted, invoice.payment_failed')
  console.log()
  console.log('5. Webhook-Secret aus Stripe Dashboard kopieren und als Supabase Secret setzen')
}

main().catch((err) => {
  console.error('Fehler:', err.message)
  process.exit(1)
})
