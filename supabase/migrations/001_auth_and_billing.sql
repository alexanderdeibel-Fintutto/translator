-- GuideTranslator: Auth, Billing & Usage Schema
-- Run this migration in the Supabase SQL editor

-- ============================================================================
-- 1. USER PROFILES (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  tier_id TEXT NOT NULL DEFAULT 'free',
  organization_id UUID,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active', -- active, past_due, canceled, trialing
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Users can read their own profile
ALTER TABLE gt_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON gt_users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON gt_users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 2. ORGANIZATIONS (for agency/enterprise multi-user)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier_id TEXT NOT NULL DEFAULT 'agency_standard',
  owner_id UUID REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  max_seats INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gt_organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members read" ON gt_organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM gt_users WHERE id = auth.uid())
  );

-- Link gt_users.organization_id
ALTER TABLE gt_users
  ADD CONSTRAINT fk_organization
  FOREIGN KEY (organization_id) REFERENCES gt_organizations(id);

-- ============================================================================
-- 3. USAGE TRACKING (server-side billing authority)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES gt_organizations(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  session_minutes_used NUMERIC DEFAULT 0,
  translation_chars_used BIGINT DEFAULT 0,
  translations_count INTEGER DEFAULT 0,
  tts_chars_used BIGINT DEFAULT 0,
  stt_minutes_used NUMERIC DEFAULT 0,
  peak_listeners INTEGER DEFAULT 0,
  languages_used TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_start)
);

ALTER TABLE gt_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own usage" ON gt_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own usage" ON gt_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own usage" ON gt_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for billing queries
CREATE INDEX idx_usage_user_period ON gt_usage(user_id, period_start);

-- ============================================================================
-- 4. SESSION LOG (for analytics & billing audit)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_code TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_languages TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes NUMERIC,
  peak_listeners INTEGER DEFAULT 0,
  translation_count INTEGER DEFAULT 0,
  connection_mode TEXT DEFAULT 'cloud', -- cloud, local, ble, hotspot
  tier_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gt_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own sessions" ON gt_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert sessions" ON gt_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON gt_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_sessions_user ON gt_sessions(user_id, started_at);

-- ============================================================================
-- 5. STRIPE WEBHOOK EVENTS (idempotency + audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_stripe_events (
  id TEXT PRIMARY KEY, -- Stripe event ID (evt_xxx)
  type TEXT NOT NULL,
  data JSONB,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gt_users_updated_at
  BEFORE UPDATE ON gt_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER gt_usage_updated_at
  BEFORE UPDATE ON gt_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 7. HELPER: Upsert usage for current billing period
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_usage(
  p_user_id UUID,
  p_session_minutes NUMERIC DEFAULT 0,
  p_translation_chars BIGINT DEFAULT 0,
  p_translations INTEGER DEFAULT 0,
  p_tts_chars BIGINT DEFAULT 0,
  p_stt_minutes NUMERIC DEFAULT 0,
  p_peak_listeners INTEGER DEFAULT 0,
  p_languages TEXT[] DEFAULT '{}'
) RETURNS void AS $$
DECLARE
  v_period_start DATE := date_trunc('month', CURRENT_DATE)::DATE;
  v_period_end DATE := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
BEGIN
  INSERT INTO gt_usage (
    user_id, period_start, period_end,
    session_minutes_used, translation_chars_used, translations_count,
    tts_chars_used, stt_minutes_used, peak_listeners, languages_used
  ) VALUES (
    p_user_id, v_period_start, v_period_end,
    p_session_minutes, p_translation_chars, p_translations,
    p_tts_chars, p_stt_minutes, p_peak_listeners, p_languages
  )
  ON CONFLICT (user_id, period_start) DO UPDATE SET
    session_minutes_used = gt_usage.session_minutes_used + p_session_minutes,
    translation_chars_used = gt_usage.translation_chars_used + p_translation_chars,
    translations_count = gt_usage.translations_count + p_translations,
    tts_chars_used = gt_usage.tts_chars_used + p_tts_chars,
    stt_minutes_used = gt_usage.stt_minutes_used + p_stt_minutes,
    peak_listeners = GREATEST(gt_usage.peak_listeners, p_peak_listeners),
    languages_used = (
      SELECT ARRAY(SELECT DISTINCT unnest(gt_usage.languages_used || p_languages))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
