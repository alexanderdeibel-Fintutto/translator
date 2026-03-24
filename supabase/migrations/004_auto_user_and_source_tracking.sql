-- GuideTranslator: Auto-create gt_users profile on signup + source tracking
-- Ensures every auth.users entry automatically gets a gt_users profile row.

-- ============================================================================
-- 1. AUTO-CREATE gt_users ON AUTH SIGNUP (database trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO gt_users (id, email, display_name, tier_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'tier_id', 'free'),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- 2. ADD SOURCE TRACKING COLUMNS
-- ============================================================================

-- Track where leads/contacts came from (Google Form ID, UTM, etc.)
ALTER TABLE gt_leads
  ADD COLUMN IF NOT EXISTS source TEXT;

ALTER TABLE gt_contact_requests
  ADD COLUMN IF NOT EXISTS source TEXT;

-- Index for source filtering
CREATE INDEX IF NOT EXISTS idx_leads_source ON gt_leads(source);
