// Supabase Edge Function: Stripe Webhook Handler
// Deploy with: supabase functions deploy stripe-webhook
// Required secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
// Set up webhook in Stripe Dashboard → Developers → Webhooks
// Events to listen for:
//   - checkout.session.completed
//   - customer.subscription.updated
//   - customer.subscription.deleted
//   - invoice.payment_failed

import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

// Use service role for webhook (no user auth)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 })
  }

  // Idempotency: check if we already processed this event
  const { data: existing } = await supabase
    .from('gt_stripe_events')
    .select('id')
    .eq('id', event.id)
    .single()

  if (existing) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Store event for audit trail
  await supabase.from('gt_stripe_events').insert({
    id: event.id,
    type: event.type,
    data: event.data.object,
  })

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      const tierId = session.metadata?.tier_id
      if (userId && tierId) {
        await supabase.from('gt_users').update({
          tier_id: tierId,
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active',
          billing_period_start: new Date().toISOString(),
          billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq('id', userId)
        console.log(`[Webhook] User ${userId} upgraded to ${tierId}`)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.supabase_user_id
      if (userId) {
        await supabase.from('gt_users').update({
          subscription_status: subscription.status,
          billing_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          billing_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq('id', userId)
        console.log(`[Webhook] Subscription updated for ${userId}: ${subscription.status}`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.supabase_user_id
      if (userId) {
        await supabase.from('gt_users').update({
          tier_id: 'free',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
        }).eq('id', userId)
        console.log(`[Webhook] Subscription canceled for ${userId} — downgraded to free`)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string
      if (subscriptionId) {
        // Mark as past_due — user still has access but gets a warning
        const { data: users } = await supabase
          .from('gt_users')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
        if (users?.length) {
          await supabase.from('gt_users').update({
            subscription_status: 'past_due',
          }).eq('stripe_subscription_id', subscriptionId)
          console.log(`[Webhook] Payment failed for subscription ${subscriptionId}`)
        }
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
