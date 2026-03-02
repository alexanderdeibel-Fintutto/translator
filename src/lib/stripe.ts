// Stripe Checkout integration for GuideTranslator
// Uses Stripe Checkout (hosted) for simple, secure payment flow.
// The actual Stripe Price IDs must be set in the tier config after Stripe product setup.
// The Edge Functions handle session creation server-side; the client just redirects.

import { TIERS, type TierId } from './tiers'
import { supabase } from './supabase'

export function isStripeConfigured(): boolean {
  return !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
}

export interface CheckoutOptions {
  tierId: TierId
  billingCycle: 'monthly' | 'yearly'
  successUrl?: string
  cancelUrl?: string
}

/**
 * Redirect to Stripe Checkout for a given tier.
 * Calls a Supabase Edge Function which creates the Checkout Session
 * and returns the URL to redirect to.
 */
export async function redirectToCheckout(options: CheckoutOptions): Promise<void> {
  const tier = TIERS[options.tierId]
  if (!tier) throw new Error(`Unknown tier: ${options.tierId}`)

  const priceId = options.billingCycle === 'yearly'
    ? tier.pricing.stripePriceIdYearly
    : tier.pricing.stripePriceIdMonthly

  if (!priceId) {
    // No Stripe price configured yet — show contact form for enterprise tiers
    if (tier.pricing.monthlyEur >= 199) {
      window.open('mailto:sales@guidetranslator.com?subject=Enterprise%20Anfrage%20-%20' + encodeURIComponent(tier.displayName), '_blank')
      return
    }
    throw new Error(`Stripe Price ID not configured for ${tier.displayName}. Please contact support.`)
  }

  // Get current user
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error('Not authenticated')
  }

  // Create checkout session via Edge Function
  const { data, error } = await supabase.functions.invoke('stripe-checkout', {
    body: {
      priceId,
      tierId: options.tierId,
      billingCycle: options.billingCycle,
      successUrl: options.successUrl || `${window.location.origin}/account?checkout=success`,
      cancelUrl: options.cancelUrl || `${window.location.origin}/pricing?checkout=canceled`,
    },
  })

  if (error) throw new Error(`Checkout error: ${error.message}`)

  const { url } = data as { url: string }
  if (!url) throw new Error('No checkout URL received')
  window.location.href = url
}

/**
 * Open the Stripe Customer Portal for managing subscriptions.
 */
export async function openCustomerPortal(): Promise<void> {
  const { data, error } = await supabase.functions.invoke('stripe-portal', {
    body: {
      returnUrl: `${window.location.origin}/account`,
    },
  })

  if (error) throw new Error(`Portal error: ${error.message}`)

  const { url } = data as { url: string }
  window.location.href = url
}
