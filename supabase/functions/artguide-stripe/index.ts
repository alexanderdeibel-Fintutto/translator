// Fintutto Art Guide — Stripe Subscription Edge Function
// Handles checkout, portal, webhooks, usage tracking

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Stripe Price IDs (set in Stripe Dashboard)
const PRICE_MAP: Record<string, Record<string, string>> = {
  artguide_starter: {
    monthly: Deno.env.get('STRIPE_PRICE_STARTER_MONTHLY') || 'price_starter_monthly',
    yearly: Deno.env.get('STRIPE_PRICE_STARTER_YEARLY') || 'price_starter_yearly',
  },
  artguide_professional: {
    monthly: Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') || 'price_pro_monthly',
    yearly: Deno.env.get('STRIPE_PRICE_PRO_YEARLY') || 'price_pro_yearly',
  },
  artguide_enterprise: {
    monthly: Deno.env.get('STRIPE_PRICE_ENTERPRISE_MONTHLY') || 'price_enterprise_monthly',
    yearly: Deno.env.get('STRIPE_PRICE_ENTERPRISE_YEARLY') || 'price_enterprise_yearly',
  },
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Webhook handler (no auth needed, verified by signature)
    if (req.headers.get('stripe-signature')) {
      return await handleWebhook(req)
    }

    // Authenticated actions
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { action, museumId } = body

    // Verify user has admin access to this museum
    const { data: membership } = await supabase
      .from('ag_museum_users')
      .select('role_id, ag_museum_roles(slug)')
      .eq('museum_id', museumId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return new Response(JSON.stringify({ error: 'No access to this museum' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    switch (action) {
      case 'create_checkout':
        return await handleCreateCheckout(supabase, body, user.email!)

      case 'create_portal':
        return await handleCreatePortal(supabase, body)

      case 'get_status':
        return await handleGetStatus(supabase, museumId)

      case 'get_usage':
        return await handleGetUsage(supabase, museumId)

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Stripe function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// ============================================================================
// Checkout
// ============================================================================

async function handleCreateCheckout(
  supabase: any,
  body: any,
  email: string,
): Promise<Response> {
  const { museumId, tierId, billingPeriod, successUrl, cancelUrl } = body

  const priceId = PRICE_MAP[tierId]?.[billingPeriod]
  if (!priceId) {
    return new Response(JSON.stringify({ error: 'Invalid tier or billing period' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Get or create Stripe customer
  const { data: museum } = await supabase
    .from('ag_museums')
    .select('stripe_customer_id, name')
    .eq('id', museumId)
    .single()

  let customerId = museum?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      name: museum?.name || 'Museum',
      metadata: { museumId },
    })
    customerId = customer.id

    await supabase
      .from('ag_museums')
      .update({ stripe_customer_id: customerId })
      .eq('id', museumId)
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { museumId, tierId },
    subscription_data: {
      metadata: { museumId, tierId },
    },
    allow_promotion_codes: true,
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ============================================================================
// Customer Portal
// ============================================================================

async function handleCreatePortal(supabase: any, body: any): Promise<Response> {
  const { museumId, returnUrl } = body

  const { data: museum } = await supabase
    .from('ag_museums')
    .select('stripe_customer_id')
    .eq('id', museumId)
    .single()

  if (!museum?.stripe_customer_id) {
    return new Response(JSON.stringify({ error: 'No Stripe customer found' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: museum.stripe_customer_id,
    return_url: returnUrl,
  })

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ============================================================================
// Status
// ============================================================================

async function handleGetStatus(supabase: any, museumId: string): Promise<Response> {
  const { data: museum } = await supabase
    .from('ag_museums')
    .select('tier_id, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_period_start, subscription_period_end, subscription_cancel_at_period_end, billing_period')
    .eq('id', museumId)
    .single()

  if (!museum) {
    return new Response(JSON.stringify({ error: 'Museum not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const status = {
    museumId,
    tierId: museum.tier_id || 'artguide_starter',
    stripeCustomerId: museum.stripe_customer_id,
    stripeSubscriptionId: museum.stripe_subscription_id,
    status: museum.subscription_status || 'active',
    currentPeriodStart: museum.subscription_period_start,
    currentPeriodEnd: museum.subscription_period_end,
    cancelAtPeriodEnd: museum.subscription_cancel_at_period_end || false,
    billingPeriod: museum.billing_period || 'monthly',
  }

  return new Response(JSON.stringify(status), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ============================================================================
// Usage
// ============================================================================

async function handleGetUsage(supabase: any, museumId: string): Promise<Response> {
  const { data: museum } = await supabase
    .from('ag_museums')
    .select('tier_id')
    .eq('id', museumId)
    .single()

  const tierId = museum?.tier_id || 'artguide_starter'

  // Count artworks
  const { count: artworkCount } = await supabase
    .from('ag_artworks')
    .select('*', { count: 'exact', head: true })
    .eq('museum_id', museumId)

  // Count staff
  const { count: staffCount } = await supabase
    .from('ag_museum_users')
    .select('*', { count: 'exact', head: true })
    .eq('museum_id', museumId)

  // Get monthly AI usage (current month)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data: aiUsage } = await supabase
    .from('ag_audit_log')
    .select('id', { count: 'exact', head: true })
    .eq('museum_id', museumId)
    .eq('action', 'ai_generation')
    .gte('created_at', monthStart.toISOString())

  // Get monthly TTS usage
  const { data: ttsUsage } = await supabase
    .from('ag_analytics_daily')
    .select('audio_plays')
    .eq('museum_id', museumId)
    .gte('date', monthStart.toISOString().split('T')[0])

  const totalTtsMinutes = (ttsUsage || []).reduce((sum: number, r: any) => sum + (r.audio_plays || 0), 0)

  // Import tier limits dynamically
  const tiers: Record<string, any> = {
    artguide_starter: { maxArtworks: 50, maxStaffUsers: 3, maxMonthlyAiGenerations: 100, maxMonthlyTtsMinutes: 500, maxMediaStorageGb: 5 },
    artguide_professional: { maxArtworks: 500, maxStaffUsers: 10, maxMonthlyAiGenerations: 2000, maxMonthlyTtsMinutes: 5000, maxMediaStorageGb: 50 },
    artguide_enterprise: { maxArtworks: 0, maxStaffUsers: 0, maxMonthlyAiGenerations: 0, maxMonthlyTtsMinutes: 0, maxMediaStorageGb: 500 },
  }

  const limits = tiers[tierId] || tiers.artguide_starter

  const metrics = [
    buildUsageRecord(museumId, 'artworks', artworkCount || 0, limits.maxArtworks),
    buildUsageRecord(museumId, 'staff_users', staffCount || 0, limits.maxStaffUsers),
    buildUsageRecord(museumId, 'ai_generations', aiUsage?.length || 0, limits.maxMonthlyAiGenerations),
    buildUsageRecord(museumId, 'tts_minutes', totalTtsMinutes, limits.maxMonthlyTtsMinutes),
    buildUsageRecord(museumId, 'storage_gb', await calculateStorageGb(supabase, museumId), limits.maxMediaStorageGb),
  ]

  return new Response(JSON.stringify(metrics), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function calculateStorageGb(supabase: any, museumId: string): Promise<number> {
  try {
    // Count media files from artwork gallery and covers
    const { data: artworks } = await supabase
      .from('ag_artworks')
      .select('cover_image_url, gallery')
      .eq('museum_id', museumId)

    let fileCount = 0
    for (const artwork of artworks || []) {
      if (artwork.cover_image_url) fileCount++
      const gallery = artwork.gallery as unknown[] | null
      if (gallery) fileCount += gallery.length
    }

    // Count audio files from content items
    const { data: contentItems } = await supabase
      .from('fw_content_items')
      .select('audio_url, cover_image_url, gallery')
      .eq('parent_id', museumId)

    for (const item of contentItems || []) {
      if (item.cover_image_url) fileCount++
      const audioUrls = item.audio_url as Record<string, string> | null
      if (audioUrls) fileCount += Object.keys(audioUrls).length
      const gallery = item.gallery as unknown[] | null
      if (gallery) fileCount += gallery.length
    }

    // Estimate: average 2MB per image, 1MB per audio file
    const estimatedGb = (fileCount * 2) / 1024
    return Math.round(estimatedGb * 100) / 100
  } catch {
    return 0
  }
}

function buildUsageRecord(museumId: string, metric: string, used: number, limit: number): any {
  return {
    museumId,
    metric,
    used,
    limit,
    percentage: limit === 0 ? 0 : Math.round((used / limit) * 100),
    isExceeded: limit > 0 && used > limit,
  }
}

// ============================================================================
// Webhook Handler
// ============================================================================

async function handleWebhook(req: Request): Promise<Response> {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const museumId = session.metadata?.museumId
      const tierId = session.metadata?.tierId

      if (museumId && tierId) {
        await supabase.from('ag_museums').update({
          tier_id: tierId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active',
        }).eq('id', museumId)

        console.log(`Museum ${museumId} upgraded to ${tierId}`)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const museumId = subscription.metadata?.museumId

      if (museumId) {
        await supabase.from('ag_museums').update({
          subscription_status: subscription.status,
          subscription_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          subscription_cancel_at_period_end: subscription.cancel_at_period_end,
        }).eq('id', museumId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const museumId = subscription.metadata?.museumId

      if (museumId) {
        await supabase.from('ag_museums').update({
          subscription_status: 'canceled',
          tier_id: 'artguide_starter', // downgrade to free tier
        }).eq('id', museumId)

        console.log(`Museum ${museumId} subscription canceled — downgraded to Starter`)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      // Find museum by Stripe customer ID
      const { data: museum } = await supabase
        .from('ag_museums')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (museum) {
        await supabase.from('ag_museums').update({
          subscription_status: 'past_due',
        }).eq('id', museum.id)

        console.log(`Museum ${museum.id} payment failed — marked as past_due`)
      }
      break
    }

    default:
      console.log(`Unhandled webhook event: ${event.type}`)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
