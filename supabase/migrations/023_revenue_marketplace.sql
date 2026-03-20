-- Fintutto World: Diversified Revenue Model & Marketplace
-- Marketplace listings, transactions, commissions, premium content,
-- affiliate tracking, data reports, and revenue dashboard

-- ============================================================================
-- 1. fw_marketplace_listings — Local businesses pay for visibility
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'restaurant', 'shop', 'hotel', 'attraction', 'tour_provider', 'transport', 'service'
  )),
  entity_name TEXT NOT NULL,
  entity_description TEXT,
  listing_type TEXT DEFAULT 'basic' CHECK (listing_type IN (
    'basic', 'premium', 'featured', 'sponsored'
  )),
  context_type TEXT,
  context_id UUID,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  address JSONB DEFAULT '{}',
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  radius_meters INTEGER DEFAULT 500,
  monthly_price_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_percent NUMERIC(5,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  opening_hours JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. fw_transactions — All bookings/purchases through the platform
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'booking', 'ticket', 'in_app_purchase', 'premium_tour',
    'affiliate', 'listing_fee', 'subscription'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'completed', 'cancelled', 'refunded'
  )),
  buyer_id UUID REFERENCES auth.users(id),
  seller_entity_type TEXT,
  seller_entity_id UUID,
  listing_id UUID REFERENCES fw_marketplace_listings(id) ON DELETE SET NULL,
  description TEXT,
  gross_amount_eur NUMERIC(10,2) NOT NULL,
  platform_fee_eur NUMERIC(10,2) DEFAULT 0,
  platform_fee_percent NUMERIC(5,2) DEFAULT 0,
  seller_payout_eur NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. fw_commissions — Revenue sharing with partners, sales agents, guides
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES fw_transactions(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN (
    'sales_agent', 'partner', 'guide', 'content_creator', 'affiliate', 'referrer'
  )),
  commission_percent NUMERIC(5,2) NOT NULL,
  commission_amount_eur NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'paid', 'cancelled'
  )),
  paid_at TIMESTAMPTZ,
  payout_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. fw_premium_content — Paid tours, special content by guides/artists
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_premium_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'premium_tour', 'special_guide', 'audio_story',
    'expert_commentary', 'masterclass', 'virtual_tour'
  )),
  title TEXT NOT NULL,
  description TEXT,
  language TEXT DEFAULT 'de',
  creator_id UUID REFERENCES auth.users(id),
  creator_name TEXT,
  context_type TEXT,
  context_id UUID,
  price_eur NUMERIC(10,2) NOT NULL,
  creator_share_percent NUMERIC(5,2) DEFAULT 70,
  purchase_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  preview_content JSONB DEFAULT '{}',
  full_content JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. fw_premium_purchases — Track who bought what
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_premium_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id),
  content_id UUID REFERENCES fw_premium_content(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES fw_transactions(id) ON DELETE SET NULL,
  price_paid_eur NUMERIC(10,2) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(buyer_id, content_id)
);

-- ============================================================================
-- 6. fw_affiliate_links — Track affiliate referrals
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES auth.users(id),
  target_url TEXT NOT NULL,
  target_type TEXT CHECK (target_type IN (
    'hotel', 'restaurant', 'tour', 'product', 'service', 'external'
  )),
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  total_revenue_eur NUMERIC(10,2) DEFAULT 0,
  total_commission_eur NUMERIC(10,2) DEFAULT 0,
  commission_percent NUMERIC(5,2) DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. fw_data_reports — Anonymized data products for cities/regions
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_data_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN (
    'visitor_flow', 'trend_analysis', 'benchmark', 'seasonal', 'custom'
  )),
  title TEXT NOT NULL,
  description TEXT,
  context_type TEXT,
  context_id UUID,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  price_eur NUMERIC(10,2) DEFAULT 0,
  data_payload JSONB DEFAULT '{}',
  is_anonymized BOOLEAN DEFAULT true,
  buyer_id UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- fw_marketplace_listings
CREATE INDEX idx_fw_mktplace_entity_type ON fw_marketplace_listings(entity_type);
CREATE INDEX idx_fw_mktplace_listing_type ON fw_marketplace_listings(listing_type);
CREATE INDEX idx_fw_mktplace_context ON fw_marketplace_listings(context_type, context_id);
CREATE INDEX idx_fw_mktplace_active ON fw_marketplace_listings(is_active) WHERE is_active = true;
CREATE INDEX idx_fw_mktplace_created_by ON fw_marketplace_listings(created_by);
CREATE INDEX idx_fw_mktplace_geo ON fw_marketplace_listings(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX idx_fw_mktplace_expires ON fw_marketplace_listings(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_fw_mktplace_tags ON fw_marketplace_listings USING GIN(tags);

-- fw_transactions
CREATE INDEX idx_fw_tx_type ON fw_transactions(transaction_type);
CREATE INDEX idx_fw_tx_status ON fw_transactions(status);
CREATE INDEX idx_fw_tx_buyer ON fw_transactions(buyer_id);
CREATE INDEX idx_fw_tx_listing ON fw_transactions(listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX idx_fw_tx_stripe ON fw_transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_fw_tx_created ON fw_transactions(created_at);
CREATE INDEX idx_fw_tx_completed ON fw_transactions(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_fw_tx_seller ON fw_transactions(seller_entity_type, seller_entity_id);

-- fw_commissions
CREATE INDEX idx_fw_comm_tx ON fw_commissions(transaction_id);
CREATE INDEX idx_fw_comm_recipient ON fw_commissions(recipient_id);
CREATE INDEX idx_fw_comm_role ON fw_commissions(recipient_role);
CREATE INDEX idx_fw_comm_status ON fw_commissions(status);
CREATE INDEX idx_fw_comm_paid ON fw_commissions(paid_at) WHERE paid_at IS NOT NULL;

-- fw_premium_content
CREATE INDEX idx_fw_premium_type ON fw_premium_content(content_type);
CREATE INDEX idx_fw_premium_creator ON fw_premium_content(creator_id);
CREATE INDEX idx_fw_premium_context ON fw_premium_content(context_type, context_id);
CREATE INDEX idx_fw_premium_active ON fw_premium_content(is_active) WHERE is_active = true;
CREATE INDEX idx_fw_premium_lang ON fw_premium_content(language);
CREATE INDEX idx_fw_premium_tags ON fw_premium_content USING GIN(tags);
CREATE INDEX idx_fw_premium_rating ON fw_premium_content(rating_avg DESC) WHERE is_active = true;

-- fw_premium_purchases
CREATE INDEX idx_fw_purchases_buyer ON fw_premium_purchases(buyer_id);
CREATE INDEX idx_fw_purchases_content ON fw_premium_purchases(content_id);
CREATE INDEX idx_fw_purchases_tx ON fw_premium_purchases(transaction_id) WHERE transaction_id IS NOT NULL;

-- fw_affiliate_links
CREATE INDEX idx_fw_affiliate_partner ON fw_affiliate_links(partner_id);
CREATE INDEX idx_fw_affiliate_type ON fw_affiliate_links(target_type);
CREATE INDEX idx_fw_affiliate_active ON fw_affiliate_links(is_active) WHERE is_active = true;

-- fw_data_reports
CREATE INDEX idx_fw_reports_type ON fw_data_reports(report_type);
CREATE INDEX idx_fw_reports_context ON fw_data_reports(context_type, context_id);
CREATE INDEX idx_fw_reports_period ON fw_data_reports(period_start, period_end);
CREATE INDEX idx_fw_reports_buyer ON fw_data_reports(buyer_id) WHERE buyer_id IS NOT NULL;

-- ============================================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_revenue_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fw_marketplace_listings_updated_at
  BEFORE UPDATE ON fw_marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION fw_revenue_set_updated_at();

CREATE TRIGGER trg_fw_premium_content_updated_at
  BEFORE UPDATE ON fw_premium_content
  FOR EACH ROW EXECUTE FUNCTION fw_revenue_set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE fw_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_premium_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_premium_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_data_reports ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- Helper: check if user is admin
-- --------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fw_revenue_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
      AND (u.raw_user_meta_data->>'role' = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- --------------------------------------------------------------------------
-- fw_marketplace_listings: admin full, sellers see own
-- --------------------------------------------------------------------------

CREATE POLICY fw_mktplace_admin_full ON fw_marketplace_listings
  FOR ALL
  USING (fw_revenue_is_admin())
  WITH CHECK (fw_revenue_is_admin());

CREATE POLICY fw_mktplace_seller_select ON fw_marketplace_listings
  FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY fw_mktplace_seller_insert ON fw_marketplace_listings
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY fw_mktplace_seller_update ON fw_marketplace_listings
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Active listings visible to everyone (for discovery)
CREATE POLICY fw_mktplace_public_read ON fw_marketplace_listings
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- --------------------------------------------------------------------------
-- fw_transactions: admin full, buyers see own
-- --------------------------------------------------------------------------

CREATE POLICY fw_tx_admin_full ON fw_transactions
  FOR ALL
  USING (fw_revenue_is_admin())
  WITH CHECK (fw_revenue_is_admin());

CREATE POLICY fw_tx_buyer_select ON fw_transactions
  FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY fw_tx_buyer_insert ON fw_transactions
  FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- --------------------------------------------------------------------------
-- fw_commissions: admin full, recipients see own
-- --------------------------------------------------------------------------

CREATE POLICY fw_comm_admin_full ON fw_commissions
  FOR ALL
  USING (fw_revenue_is_admin())
  WITH CHECK (fw_revenue_is_admin());

CREATE POLICY fw_comm_recipient_select ON fw_commissions
  FOR SELECT
  USING (recipient_id = auth.uid());

-- --------------------------------------------------------------------------
-- fw_premium_content: admin full, creators see/edit own, public reads active
-- --------------------------------------------------------------------------

CREATE POLICY fw_premium_admin_full ON fw_premium_content
  FOR ALL
  USING (fw_revenue_is_admin())
  WITH CHECK (fw_revenue_is_admin());

CREATE POLICY fw_premium_creator_select ON fw_premium_content
  FOR SELECT
  USING (creator_id = auth.uid());

CREATE POLICY fw_premium_creator_insert ON fw_premium_content
  FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY fw_premium_creator_update ON fw_premium_content
  FOR UPDATE
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY fw_premium_public_read ON fw_premium_content
  FOR SELECT
  USING (is_active = true);

-- --------------------------------------------------------------------------
-- fw_premium_purchases: admin full, buyers see own
-- --------------------------------------------------------------------------

CREATE POLICY fw_purchases_admin_full ON fw_premium_purchases
  FOR ALL
  USING (fw_revenue_is_admin())
  WITH CHECK (fw_revenue_is_admin());

CREATE POLICY fw_purchases_buyer_select ON fw_premium_purchases
  FOR SELECT
  USING (buyer_id = auth.uid());

CREATE POLICY fw_purchases_buyer_insert ON fw_premium_purchases
  FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- --------------------------------------------------------------------------
-- fw_affiliate_links: admin full, partners see own
-- --------------------------------------------------------------------------

CREATE POLICY fw_affiliate_admin_full ON fw_affiliate_links
  FOR ALL
  USING (fw_revenue_is_admin())
  WITH CHECK (fw_revenue_is_admin());

CREATE POLICY fw_affiliate_partner_select ON fw_affiliate_links
  FOR SELECT
  USING (partner_id = auth.uid());

CREATE POLICY fw_affiliate_partner_insert ON fw_affiliate_links
  FOR INSERT
  WITH CHECK (partner_id = auth.uid());

CREATE POLICY fw_affiliate_partner_update ON fw_affiliate_links
  FOR UPDATE
  USING (partner_id = auth.uid())
  WITH CHECK (partner_id = auth.uid());

-- --------------------------------------------------------------------------
-- fw_data_reports: admin full, buyers see own purchased reports
-- --------------------------------------------------------------------------

CREATE POLICY fw_reports_admin_full ON fw_data_reports
  FOR ALL
  USING (fw_revenue_is_admin())
  WITH CHECK (fw_revenue_is_admin());

CREATE POLICY fw_reports_buyer_select ON fw_data_reports
  FOR SELECT
  USING (buyer_id = auth.uid());

-- ============================================================================
-- 8. fw_get_revenue_dashboard — Revenue stats function
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_get_revenue_dashboard(
  p_period_start DATE DEFAULT NULL,
  p_period_end DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_result JSONB;
  v_total_revenue NUMERIC(12,2) := 0;
  v_subscription_revenue NUMERIC(12,2) := 0;
  v_marketplace_revenue NUMERIC(12,2) := 0;
  v_transaction_revenue NUMERIC(12,2) := 0;
  v_premium_content_revenue NUMERIC(12,2) := 0;
  v_affiliate_revenue NUMERIC(12,2) := 0;
  v_data_report_revenue NUMERIC(12,2) := 0;
  v_platform_fees_total NUMERIC(12,2) := 0;
  v_commissions_paid NUMERIC(12,2) := 0;
  v_net_revenue NUMERIC(12,2) := 0;
  v_by_month JSONB;
BEGIN
  -- Check admin access
  IF NOT fw_revenue_is_admin() THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  -- Default to last 12 months if no period given
  v_start := COALESCE(p_period_start::timestamptz, now() - INTERVAL '12 months');
  v_end := COALESCE(p_period_end::timestamptz + INTERVAL '1 day', now());

  -- Revenue by transaction type
  SELECT
    COALESCE(SUM(gross_amount_eur), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'subscription' THEN gross_amount_eur ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'listing_fee' THEN gross_amount_eur ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type IN ('booking', 'ticket', 'in_app_purchase') THEN gross_amount_eur ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'premium_tour' THEN gross_amount_eur ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'affiliate' THEN gross_amount_eur ELSE 0 END), 0),
    COALESCE(SUM(platform_fee_eur), 0)
  INTO
    v_total_revenue,
    v_subscription_revenue,
    v_marketplace_revenue,
    v_transaction_revenue,
    v_premium_content_revenue,
    v_affiliate_revenue,
    v_platform_fees_total
  FROM fw_transactions
  WHERE status IN ('completed', 'confirmed')
    AND created_at >= v_start
    AND created_at < v_end;

  -- Data report revenue (sold separately, not always via fw_transactions)
  SELECT COALESCE(SUM(price_eur), 0)
  INTO v_data_report_revenue
  FROM fw_data_reports
  WHERE buyer_id IS NOT NULL
    AND generated_at >= v_start
    AND generated_at < v_end;

  -- Total including data reports
  v_total_revenue := v_total_revenue + v_data_report_revenue;

  -- Commissions paid
  SELECT COALESCE(SUM(commission_amount_eur), 0)
  INTO v_commissions_paid
  FROM fw_commissions
  WHERE status = 'paid'
    AND paid_at >= v_start
    AND paid_at < v_end;

  -- Net revenue
  v_net_revenue := v_total_revenue - v_commissions_paid;

  -- Monthly breakdown
  SELECT COALESCE(jsonb_agg(month_row ORDER BY month_row->>'month'), '[]'::jsonb)
  INTO v_by_month
  FROM (
    SELECT jsonb_build_object(
      'month', to_char(date_trunc('month', created_at), 'YYYY-MM'),
      'total_revenue', SUM(gross_amount_eur),
      'platform_fees', SUM(platform_fee_eur),
      'transaction_count', COUNT(*)
    ) AS month_row
    FROM fw_transactions
    WHERE status IN ('completed', 'confirmed')
      AND created_at >= v_start
      AND created_at < v_end
    GROUP BY date_trunc('month', created_at)
  ) sub;

  -- Build result
  v_result := jsonb_build_object(
    'period_start', v_start,
    'period_end', v_end,
    'total_revenue', v_total_revenue,
    'subscription_revenue', v_subscription_revenue,
    'marketplace_revenue', v_marketplace_revenue,
    'transaction_revenue', v_transaction_revenue,
    'premium_content_revenue', v_premium_content_revenue,
    'affiliate_revenue', v_affiliate_revenue,
    'data_report_revenue', v_data_report_revenue,
    'platform_fees_total', v_platform_fees_total,
    'commissions_paid', v_commissions_paid,
    'net_revenue', v_net_revenue,
    'by_month', v_by_month
  );

  RETURN v_result;
END;
$$;
