-- =============================================================================
-- Migration 012: Account Suspension & Tier Change Audit
-- Adds suspension columns to gt_users, tier change audit log, and billing RPCs.
-- =============================================================================

-- ============================================================================
-- 1. Add suspension columns to gt_users
-- ============================================================================

ALTER TABLE gt_users
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE gt_users
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- ============================================================================
-- 2. Tier change audit log
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_tier_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES gt_users(id),
  old_tier_id TEXT,
  new_tier_id TEXT NOT NULL,
  changed_by UUID REFERENCES gt_users(id),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gt_tier_change_log_user_id
  ON gt_tier_change_log(user_id);

-- ============================================================================
-- 3. RLS on gt_tier_change_log
-- ============================================================================

ALTER TABLE gt_tier_change_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own tier change history
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'gt_tier_change_log'
      AND policyname = 'Users can view own tier changes'
  ) THEN
    CREATE POLICY "Users can view own tier changes"
      ON gt_tier_change_log FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Service role can manage all tier change records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'gt_tier_change_log'
      AND policyname = 'Service role manages tier changes'
  ) THEN
    CREATE POLICY "Service role manages tier changes"
      ON gt_tier_change_log FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ============================================================================
-- 4. RPC: get_my_billing_profile()
-- ============================================================================

CREATE OR REPLACE FUNCTION get_my_billing_profile()
RETURNS TABLE (
  tier_id TEXT,
  display_name TEXT,
  email TEXT,
  role TEXT,
  organization_id UUID,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  is_suspended BOOLEAN,
  suspension_reason TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    u.tier_id,
    u.display_name,
    u.email,
    u.role,
    u.organization_id,
    u.stripe_customer_id,
    u.stripe_subscription_id,
    u.subscription_status,
    u.billing_period_start,
    u.billing_period_end,
    u.is_suspended,
    u.suspension_reason
  FROM gt_users u
  WHERE u.id = auth.uid();
$$;

-- ============================================================================
-- 5. RPC: get_my_invoices()
-- ============================================================================

CREATE OR REPLACE FUNCTION get_my_invoices()
RETURNS SETOF gt_invoices
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT *
  FROM gt_invoices
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
$$;
