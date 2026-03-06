#!/usr/bin/env npx tsx
// =============================================================================
// GuideTranslator — Stripe Product & Price Setup
// =============================================================================
//
// Creates all Stripe products and prices for the 11 public tiers.
// Run once to set up, then paste the output Price IDs into src/lib/tiers.ts.
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

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_SECRET_KEY) {
  console.error('Fehler: STRIPE_SECRET_KEY nicht gesetzt.')
  console.error('Usage: STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/stripe-setup.ts')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

// All public paid tiers with their pricing
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

  // Output the config block to paste into tiers.ts
  console.log('='.repeat(70))
  console.log('FERTIG! Kopiere die folgenden Price IDs in src/lib/tiers.ts:')
  console.log('='.repeat(70))
  console.log()

  for (const r of results) {
    console.log(`// ${r.tierId}`)
    console.log(`stripePriceIdMonthly: '${r.monthlyPriceId}',`)
    console.log(`stripePriceIdYearly: '${r.yearlyPriceId}',`)
    console.log()
  }

  // Output env line
  console.log('='.repeat(70))
  console.log('.env Eintrag (Publishable Key manuell aus Stripe Dashboard kopieren):')
  console.log('='.repeat(70))
  console.log()
  console.log('VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...')
  console.log()
  console.log('Supabase Secrets setzen:')
  console.log(`supabase secrets set STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}`)
  console.log('supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...')
}

main().catch((err) => {
  console.error('Fehler:', err.message)
  process.exit(1)
})
