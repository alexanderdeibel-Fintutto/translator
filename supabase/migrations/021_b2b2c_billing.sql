-- Fintutto World: B2B2C Billing System
-- Subscriptions, invoices, usage metering, and Stripe webhook event log

-- ============================================================================
-- 1. fw_subscriptions — tracks which entity has which tier
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('museum', 'city', 'region', 'partner', 'cruise', 'event')),
  entity_id UUID NOT NULL,
  tier_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  billing_email TEXT,
  billing_name TEXT,
  billing_address JSONB DEFAULT '{}',
  tax_id TEXT,
  currency TEXT DEFAULT 'EUR',
  monthly_amount_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);

-- ============================================================================
-- 2. fw_invoices — invoice history
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES fw_subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  invoice_number TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  amount_cents INTEGER NOT NULL,
  tax_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  pdf_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. fw_usage_records — metered usage for pay-per-use features
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES fw_subscriptions(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('ai_conversations', 'translations_chars', 'notifications_sent', 'api_calls', 'content_items')),
  quantity BIGINT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  reported_to_stripe BOOLEAN DEFAULT false,
  stripe_usage_record_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (subscription_id, usage_type, period_start)
);

-- ============================================================================
-- 4. fw_payment_events — Stripe webhook event log
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. Indexes
-- ============================================================================

-- fw_subscriptions
CREATE INDEX idx_fw_subscriptions_entity ON fw_subscriptions (entity_type, entity_id);
CREATE INDEX idx_fw_subscriptions_status ON fw_subscriptions (status);
CREATE INDEX idx_fw_subscriptions_stripe_customer ON fw_subscriptions (stripe_customer_id);
CREATE INDEX idx_fw_subscriptions_stripe_subscription ON fw_subscriptions (stripe_subscription_id);
CREATE INDEX idx_fw_subscriptions_tier ON fw_subscriptions (tier_id);

-- fw_invoices
CREATE INDEX idx_fw_invoices_subscription ON fw_invoices (subscription_id);
CREATE INDEX idx_fw_invoices_status ON fw_invoices (status);
CREATE INDEX idx_fw_invoices_stripe_invoice ON fw_invoices (stripe_invoice_id);

-- fw_usage_records
CREATE INDEX idx_fw_usage_records_subscription ON fw_usage_records (subscription_id);
CREATE INDEX idx_fw_usage_records_type ON fw_usage_records (usage_type);
CREATE INDEX idx_fw_usage_records_period ON fw_usage_records (period_start, period_end);

-- fw_payment_events
CREATE INDEX idx_fw_payment_events_stripe_event ON fw_payment_events (stripe_event_id);
CREATE INDEX idx_fw_payment_events_type ON fw_payment_events (event_type);
CREATE INDEX idx_fw_payment_events_processed ON fw_payment_events (processed);

-- ============================================================================
-- 6. Row Level Security
-- ============================================================================

ALTER TABLE fw_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_payment_events ENABLE ROW LEVEL SECURITY;

-- ----- fw_subscriptions policies -----

-- Entity owners can read their own subscriptions.
-- Ownership is resolved by matching entity_id against the user's related entities
-- (museum owner, city admin, region admin, partner owner, etc.).
CREATE POLICY "Entity owners read own subscriptions" ON fw_subscriptions
  FOR SELECT USING (
    entity_id IN (
      SELECT id FROM fw_museums WHERE owner_id = auth.uid()
      UNION ALL
      SELECT id FROM fw_cities WHERE admin_id = auth.uid()
      UNION ALL
      SELECT id FROM fw_regions WHERE admin_id = auth.uid()
      UNION ALL
      SELECT id FROM fw_partners WHERE owner_id = auth.uid()
    )
  );

-- Admins can do everything
CREATE POLICY "Admins full access on subscriptions" ON fw_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gt_users
      WHERE gt_users.id = auth.uid()
        AND gt_users.tier_id = 'internal_admin'
    )
  );

-- Service role bypasses RLS automatically (used for Stripe webhooks)

-- ----- fw_invoices policies -----

CREATE POLICY "Entity owners read own invoices" ON fw_invoices
  FOR SELECT USING (
    subscription_id IN (
      SELECT s.id FROM fw_subscriptions s
      WHERE s.entity_id IN (
        SELECT id FROM fw_museums WHERE owner_id = auth.uid()
        UNION ALL
        SELECT id FROM fw_cities WHERE admin_id = auth.uid()
        UNION ALL
        SELECT id FROM fw_regions WHERE admin_id = auth.uid()
        UNION ALL
        SELECT id FROM fw_partners WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins full access on invoices" ON fw_invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gt_users
      WHERE gt_users.id = auth.uid()
        AND gt_users.tier_id = 'internal_admin'
    )
  );

-- ----- fw_usage_records policies -----

CREATE POLICY "Entity owners read own usage" ON fw_usage_records
  FOR SELECT USING (
    subscription_id IN (
      SELECT s.id FROM fw_subscriptions s
      WHERE s.entity_id IN (
        SELECT id FROM fw_museums WHERE owner_id = auth.uid()
        UNION ALL
        SELECT id FROM fw_cities WHERE admin_id = auth.uid()
        UNION ALL
        SELECT id FROM fw_regions WHERE admin_id = auth.uid()
        UNION ALL
        SELECT id FROM fw_partners WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins full access on usage_records" ON fw_usage_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gt_users
      WHERE gt_users.id = auth.uid()
        AND gt_users.tier_id = 'internal_admin'
    )
  );

-- ----- fw_payment_events policies -----

-- Payment events are internal — only admins and service role
CREATE POLICY "Admins full access on payment_events" ON fw_payment_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gt_users
      WHERE gt_users.id = auth.uid()
        AND gt_users.tier_id = 'internal_admin'
    )
  );

-- ============================================================================
-- 7. updated_at trigger for fw_subscriptions
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fw_subscriptions_updated_at
  BEFORE UPDATE ON fw_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION fw_set_updated_at();

-- ============================================================================
-- 8. Helper RPC: fw_get_subscription_status
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_get_subscription_status(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'subscription', json_build_object(
      'id', s.id,
      'entity_type', s.entity_type,
      'entity_id', s.entity_id,
      'tier_id', s.tier_id,
      'status', s.status,
      'current_period_start', s.current_period_start,
      'current_period_end', s.current_period_end,
      'cancel_at_period_end', s.cancel_at_period_end,
      'trial_ends_at', s.trial_ends_at,
      'monthly_amount_cents', s.monthly_amount_cents,
      'currency', s.currency,
      'billing_email', s.billing_email,
      'created_at', s.created_at,
      'updated_at', s.updated_at
    ),
    'usage', (
      SELECT COALESCE(json_agg(json_build_object(
        'usage_type', u.usage_type,
        'total_quantity', u.total_qty,
        'current_period_quantity', u.current_qty
      )), '[]'::json)
      FROM (
        SELECT
          ur.usage_type,
          SUM(ur.quantity) AS total_qty,
          SUM(CASE
            WHEN ur.period_start >= s.current_period_start
             AND ur.period_start < s.current_period_end
            THEN ur.quantity ELSE 0
          END) AS current_qty
        FROM fw_usage_records ur
        WHERE ur.subscription_id = s.id
        GROUP BY ur.usage_type
      ) u
    )
  ) INTO v_result
  FROM fw_subscriptions s
  WHERE s.entity_type = p_entity_type
    AND s.entity_id = p_entity_id;

  RETURN v_result;
END;
$$;
