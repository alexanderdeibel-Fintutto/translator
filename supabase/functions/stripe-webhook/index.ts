// Supabase Edge Function: Stripe Webhook Handler
// Deploy with: supabase functions deploy stripe-webhook
// Required secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
// Set up webhook in Stripe Dashboard → Developers → Webhooks
// Events to listen for:
//   - checkout.session.completed
//   - customer.subscription.updated
//   - customer.subscription.deleted
//   - customer.subscription.trial_will_end
//   - invoice.created
//   - invoice.paid
//   - invoice.finalized
//   - invoice.payment_failed
//   - charge.refunded

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

/** Find user ID by stripe_customer_id */
async function findUserByCustomer(stripeCustomerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('gt_users')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()
  return data?.id ?? null
}

/** Find user ID by stripe_subscription_id */
async function findUserBySubscription(subscriptionId: string): Promise<string | null> {
  const { data } = await supabase
    .from('gt_users')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()
  return data?.id ?? null
}

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
    // ── Checkout ──────────────────────────────────────────────────────
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

    // ── Subscription lifecycle ────────────────────────────────────────
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

    case 'customer.subscription.trial_will_end': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.supabase_user_id
      if (userId) {
        // Mark that trial is ending — app can show warning banner
        await supabase.from('gt_users').update({
          subscription_status: 'trial_ending',
        }).eq('id', userId)
        console.log(`[Webhook] Trial ending soon for ${userId}`)
      }
      break
    }

    // ── Invoices (Rechnungen) ─────────────────────────────────────────
    case 'invoice.created': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const userId = await findUserByCustomer(customerId)
      await supabase.from('gt_invoices').upsert({
        id: invoice.id,
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: invoice.subscription as string | null,
        status: invoice.status ?? 'draft',
        currency: invoice.currency,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        amount_remaining: invoice.amount_remaining,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
      })
      console.log(`[Webhook] Invoice created: ${invoice.id} for customer ${customerId}`)
      break
    }

    case 'invoice.finalized': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase.from('gt_invoices').upsert({
        id: invoice.id,
        user_id: await findUserByCustomer(invoice.customer as string),
        stripe_customer_id: invoice.customer as string,
        stripe_subscription_id: invoice.subscription as string | null,
        status: invoice.status ?? 'open',
        currency: invoice.currency,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        amount_remaining: invoice.amount_remaining,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
        finalized_at: new Date().toISOString(),
      })
      console.log(`[Webhook] Invoice finalized: ${invoice.id}`)
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase.from('gt_invoices').upsert({
        id: invoice.id,
        user_id: await findUserByCustomer(invoice.customer as string),
        stripe_customer_id: invoice.customer as string,
        stripe_subscription_id: invoice.subscription as string | null,
        status: 'paid',
        currency: invoice.currency,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        amount_remaining: 0,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
        paid_at: new Date().toISOString(),
      })
      console.log(`[Webhook] Invoice paid: ${invoice.id} (${invoice.amount_paid} ${invoice.currency})`)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string
      // Update invoice status
      await supabase.from('gt_invoices').upsert({
        id: invoice.id,
        user_id: await findUserByCustomer(invoice.customer as string),
        stripe_customer_id: invoice.customer as string,
        stripe_subscription_id: subscriptionId,
        status: 'open',
        currency: invoice.currency,
        amount_due: invoice.amount_due,
        amount_paid: invoice.amount_paid,
        amount_remaining: invoice.amount_remaining,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
      })
      // Mark user as past_due — user still has access but gets a warning
      if (subscriptionId) {
        await supabase.from('gt_users').update({
          subscription_status: 'past_due',
        }).eq('stripe_subscription_id', subscriptionId)
        console.log(`[Webhook] Payment failed for subscription ${subscriptionId}`)
      }
      break
    }

    // ── Refunds (Erstattungen) ────────────────────────────────────────
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const customerId = charge.customer as string
      const userId = customerId ? await findUserByCustomer(customerId) : null
      // Process each refund on the charge
      if (charge.refunds?.data) {
        for (const refund of charge.refunds.data) {
          await supabase.from('gt_refunds').upsert({
            id: refund.id,
            charge_id: charge.id,
            user_id: userId,
            amount: refund.amount,
            currency: refund.currency,
            reason: refund.reason,
            status: refund.status,
          })
        }
      }
      console.log(`[Webhook] Charge refunded: ${charge.id} for customer ${customerId}`)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
