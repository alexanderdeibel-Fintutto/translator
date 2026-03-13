-- =============================================================================
-- Migration 011: Invoices & Billing Events
-- Tracks Stripe invoices, payments, and refunds for customer billing history.
-- =============================================================================

-- Rechnungen (synced from Stripe webhooks)
CREATE TABLE IF NOT EXISTS gt_invoices (
  id TEXT PRIMARY KEY,                      -- Stripe Invoice ID (in_xxx)
  user_id UUID REFERENCES gt_users(id) ON DELETE SET NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,                     -- draft, open, paid, void, uncollectible
  currency TEXT NOT NULL DEFAULT 'eur',
  amount_due INTEGER NOT NULL DEFAULT 0,    -- in cents
  amount_paid INTEGER NOT NULL DEFAULT 0,   -- in cents
  amount_remaining INTEGER NOT NULL DEFAULT 0,
  invoice_pdf TEXT,                         -- URL to PDF
  hosted_invoice_url TEXT,                  -- URL to hosted invoice page
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalized_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

-- Erstattungen (synced from charge.refunded)
CREATE TABLE IF NOT EXISTS gt_refunds (
  id TEXT PRIMARY KEY,                      -- Stripe Refund ID (re_xxx)
  charge_id TEXT NOT NULL,                  -- Stripe Charge ID (ch_xxx)
  user_id UUID REFERENCES gt_users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,                  -- in cents
  currency TEXT NOT NULL DEFAULT 'eur',
  reason TEXT,                              -- duplicate, fraudulent, requested_by_customer
  status TEXT NOT NULL,                     -- succeeded, pending, failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gt_invoices_user_id ON gt_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_gt_invoices_stripe_customer ON gt_invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_gt_invoices_status ON gt_invoices(status);
CREATE INDEX IF NOT EXISTS idx_gt_refunds_user_id ON gt_refunds(user_id);

-- RLS
ALTER TABLE gt_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE gt_refunds ENABLE ROW LEVEL SECURITY;

-- Users can see their own invoices
CREATE POLICY "Users can view own invoices"
  ON gt_invoices FOR SELECT
  USING (user_id = auth.uid());

-- Users can see their own refunds
CREATE POLICY "Users can view own refunds"
  ON gt_refunds FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert/update (from webhook)
CREATE POLICY "Service role manages invoices"
  ON gt_invoices FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages refunds"
  ON gt_refunds FOR ALL
  USING (auth.role() = 'service_role');
