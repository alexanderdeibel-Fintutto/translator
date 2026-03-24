-- Migration 012: Commission Tracking & Sales Performance
--
-- Adds:
-- 1. gt_commission_rates — configurable commission rates per tier/segment
-- 2. gt_commissions — tracks individual commission records per converted lead
-- 3. sales_agent_id on gt_users — links customer back to the sales agent
-- 4. RPC: admin_get_sales_performance() — aggregated sales dashboard data
-- 5. RPC: calculate_commissions() — monthly commission batch calculation

-- ============================================================================
-- 1. COMMISSION RATE CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_commission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment TEXT NOT NULL,               -- cruise, event, agency, guide, personal
  tier_id TEXT,                        -- optional: specific tier override
  commission_pct NUMERIC NOT NULL DEFAULT 10, -- percentage of MRR
  recurring_months INTEGER DEFAULT 12, -- how many months commission is earned (0 = forever)
  clawback_days INTEGER DEFAULT 90,    -- cancel within N days = lose commission
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gt_commission_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on gt_commission_rates" ON gt_commission_rates
  FOR ALL USING (public.is_admin());

-- Seed default rates per segment
INSERT INTO gt_commission_rates (segment, tier_id, commission_pct, recurring_months, clawback_days)
VALUES
  ('personal', NULL, 5, 6, 30),
  ('guide', NULL, 10, 12, 60),
  ('agency', NULL, 10, 12, 90),
  ('event', NULL, 8, 12, 60),
  ('cruise', NULL, 12, 24, 90)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. COMMISSION RECORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES gt_leads(id) ON DELETE SET NULL,
  sales_agent_id UUID NOT NULL REFERENCES auth.users(id),
  customer_user_id UUID REFERENCES auth.users(id),
  tier_id TEXT NOT NULL,
  segment TEXT NOT NULL,
  commission_pct NUMERIC NOT NULL,
  monthly_revenue_eur NUMERIC NOT NULL DEFAULT 0,
  commission_eur NUMERIC NOT NULL DEFAULT 0,
  period_month DATE NOT NULL,          -- first day of the commission month
  status TEXT NOT NULL DEFAULT 'earned',  -- earned, approved, paid, clawed_back
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lead_id, period_month)
);

ALTER TABLE gt_commissions ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "Admin full access on gt_commissions" ON gt_commissions
  FOR ALL USING (public.is_admin());

-- Sales agent: read own commissions
CREATE POLICY "Sales agent read own commissions" ON gt_commissions
  FOR SELECT USING (
    sales_agent_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'sales_agent'
    )
  );

CREATE INDEX idx_commissions_agent ON gt_commissions(sales_agent_id, period_month);
CREATE INDEX idx_commissions_lead ON gt_commissions(lead_id);
CREATE INDEX idx_commissions_period ON gt_commissions(period_month, status);

-- ============================================================================
-- 3. LINK CUSTOMERS TO SALES AGENTS
-- ============================================================================

ALTER TABLE gt_users
  ADD COLUMN IF NOT EXISTS sales_agent_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_users_sales_agent ON gt_users(sales_agent_id);

-- Backfill: link existing converted leads to their creator as sales agent
UPDATE gt_users u
SET sales_agent_id = l.created_by
FROM gt_leads l
WHERE l.converted_user_id = u.id
  AND l.created_by IS NOT NULL
  AND u.sales_agent_id IS NULL;

-- ============================================================================
-- 4. AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE TRIGGER gt_commission_rates_updated_at
  BEFORE UPDATE ON gt_commission_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER gt_commissions_updated_at
  BEFORE UPDATE ON gt_commissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 5. RPC: Sales Performance Dashboard
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_get_sales_performance(
  p_sales_agent_id UUID DEFAULT NULL
)
RETURNS TABLE (
  sales_agent_id UUID,
  agent_email TEXT,
  agent_name TEXT,
  leads_created BIGINT,
  leads_converted BIGINT,
  conversion_rate NUMERIC,
  active_customers BIGINT,
  total_mrr_eur NUMERIC,
  total_commissions_earned_eur NUMERIC,
  total_commissions_paid_eur NUMERIC,
  current_month_commission_eur NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    u.id AS sales_agent_id,
    u.email AS agent_email,
    u.display_name AS agent_name,
    COALESCE(lc.leads_created, 0) AS leads_created,
    COALESCE(lc.leads_converted, 0) AS leads_converted,
    CASE
      WHEN COALESCE(lc.leads_created, 0) = 0 THEN 0
      ELSE ROUND(COALESCE(lc.leads_converted, 0)::NUMERIC / lc.leads_created * 100, 1)
    END AS conversion_rate,
    COALESCE(cust.active_customers, 0) AS active_customers,
    COALESCE(cust.total_mrr, 0) AS total_mrr_eur,
    COALESCE(comm.earned, 0) AS total_commissions_earned_eur,
    COALESCE(comm.paid, 0) AS total_commissions_paid_eur,
    COALESCE(comm.current_month, 0) AS current_month_commission_eur
  FROM gt_users u
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS leads_created,
      COUNT(*) FILTER (WHERE converted_user_id IS NOT NULL) AS leads_converted
    FROM gt_leads
    WHERE gt_leads.created_by = u.id
  ) lc ON true
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*) AS active_customers,
      SUM(
        CASE
          WHEN cu.tier_id IS NOT NULL THEN (
            SELECT COALESCE(t.pricing_monthly_eur, 0)
            FROM (VALUES
              ('free', 0), ('personal_pro', 4.99),
              ('guide_basic', 19.90), ('guide_pro', 39.90),
              ('agency_standard', 99), ('agency_premium', 249),
              ('event_basic', 199), ('event_pro', 499),
              ('cruise_starter', 1990), ('cruise_fleet', 6990), ('cruise_armada', 19990)
            ) AS t(tier_name, pricing_monthly_eur)
            WHERE t.tier_name = cu.tier_id
          )
          ELSE 0
        END
      ) AS total_mrr
    FROM gt_users cu
    WHERE cu.sales_agent_id = u.id
      AND cu.subscription_status = 'active'
  ) cust ON true
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(SUM(commission_eur), 0) AS earned,
      COALESCE(SUM(commission_eur) FILTER (WHERE status = 'paid'), 0) AS paid,
      COALESCE(SUM(commission_eur) FILTER (
        WHERE period_month = date_trunc('month', CURRENT_DATE)::DATE
      ), 0) AS current_month
    FROM gt_commissions
    WHERE gt_commissions.sales_agent_id = u.id
      AND status != 'clawed_back'
  ) comm ON true
  WHERE
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin')
    AND u.role IN ('sales_agent', 'admin')
    AND (p_sales_agent_id IS NULL OR u.id = p_sales_agent_id)
  ORDER BY COALESCE(comm.earned, 0) DESC, COALESCE(lc.leads_created, 0) DESC;
$$;

-- ============================================================================
-- 6. RPC: Calculate commissions for a given month
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_calculate_commissions(
  p_month DATE DEFAULT date_trunc('month', CURRENT_DATE)::DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_lead RECORD;
  v_rate RECORD;
  v_mrr NUMERIC;
BEGIN
  -- Only admins
  IF NOT EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- For each converted lead with an active customer
  FOR v_lead IN
    SELECT
      l.id AS lead_id,
      l.created_by AS sales_agent_id,
      l.segment,
      cu.id AS customer_user_id,
      cu.tier_id,
      cu.subscription_status,
      l.converted_at
    FROM gt_leads l
    JOIN gt_users cu ON cu.id = l.converted_user_id
    WHERE l.converted_user_id IS NOT NULL
      AND l.created_by IS NOT NULL
      AND cu.subscription_status = 'active'
  LOOP
    -- Find best matching commission rate
    SELECT * INTO v_rate
    FROM gt_commission_rates
    WHERE segment = v_lead.segment
      AND (tier_id IS NULL OR tier_id = v_lead.tier_id)
    ORDER BY tier_id NULLS LAST  -- specific tier match first
    LIMIT 1;

    IF v_rate IS NULL THEN CONTINUE; END IF;

    -- Check if within recurring window
    IF v_rate.recurring_months > 0 THEN
      IF p_month >= (v_lead.converted_at + (v_rate.recurring_months || ' months')::INTERVAL)::DATE THEN
        CONTINUE;
      END IF;
    END IF;

    -- Look up MRR from tier pricing
    SELECT pricing_monthly_eur INTO v_mrr
    FROM (VALUES
      ('free', 0::NUMERIC), ('personal_pro', 4.99),
      ('guide_basic', 19.90), ('guide_pro', 39.90),
      ('agency_standard', 99), ('agency_premium', 249),
      ('event_basic', 199), ('event_pro', 499),
      ('cruise_starter', 1990), ('cruise_fleet', 6990), ('cruise_armada', 19990)
    ) AS t(tier_name, pricing_monthly_eur)
    WHERE t.tier_name = v_lead.tier_id;

    IF v_mrr IS NULL OR v_mrr = 0 THEN CONTINUE; END IF;

    -- Insert or skip if already exists
    INSERT INTO gt_commissions (
      lead_id, sales_agent_id, customer_user_id,
      tier_id, segment, commission_pct,
      monthly_revenue_eur, commission_eur, period_month
    ) VALUES (
      v_lead.lead_id, v_lead.sales_agent_id, v_lead.customer_user_id,
      v_lead.tier_id, v_lead.segment, v_rate.commission_pct,
      v_mrr, ROUND(v_mrr * v_rate.commission_pct / 100, 2), p_month
    )
    ON CONFLICT (lead_id, period_month) DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ============================================================================
-- 7. Update admin-create-user to set sales_agent_id on conversion
-- ============================================================================
-- Note: The edge function admin-create-user should be updated to also set
-- sales_agent_id = lead.created_by when converting a lead to a user.
-- This is handled in the application code, not in this migration.
