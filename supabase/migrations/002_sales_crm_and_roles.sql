-- GuideTranslator: Sales CRM & Role System
-- Adds admin/sales roles, leads, calculations, contact requests, notes

-- ============================================================================
-- 1. ADD ROLE COLUMN TO GT_USERS
-- ============================================================================

ALTER TABLE gt_users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Check constraint (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gt_users_role_check'
  ) THEN
    ALTER TABLE gt_users
      ADD CONSTRAINT gt_users_role_check
      CHECK (role IN ('user', 'admin', 'sales_agent'));
  END IF;
END $$;

-- ============================================================================
-- 2. LEADS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  phone TEXT,
  fleet_size INTEGER,
  segment TEXT NOT NULL DEFAULT 'cruise',
  pipeline_stage TEXT NOT NULL DEFAULT 'neu',
  tags TEXT[] DEFAULT '{}',
  invite_token TEXT UNIQUE,
  assigned_to UUID REFERENCES auth.users(id),
  converted_user_id UUID REFERENCES auth.users(id),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. CALCULATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES gt_leads(id) ON DELETE CASCADE,
  segment TEXT NOT NULL,
  params JSONB NOT NULL,
  result JSONB NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. CONTACT REQUESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES gt_leads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  type TEXT DEFAULT 'contact',
  segment TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. LEAD NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES gt_leads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE gt_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE gt_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gt_contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gt_lead_notes ENABLE ROW LEVEL SECURITY;

-- Admin/sales_agent full access on CRM tables
CREATE POLICY "Admin full access on gt_leads" ON gt_leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

CREATE POLICY "Admin full access on gt_lead_notes" ON gt_lead_notes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

CREATE POLICY "Admin full access on gt_contact_requests" ON gt_contact_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

CREATE POLICY "Admin full access on gt_calculations" ON gt_calculations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

-- Public insert for contact requests (lead capture forms)
CREATE POLICY "Public insert contact requests" ON gt_contact_requests
  FOR INSERT WITH CHECK (true);

-- Admin can read all user profiles
CREATE POLICY "Admin read all users" ON gt_users
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM gt_users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'sales_agent'))
  );

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

CREATE TRIGGER gt_leads_updated_at
  BEFORE UPDATE ON gt_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 8. INDEXES
-- ============================================================================

CREATE INDEX idx_leads_segment ON gt_leads(segment);
CREATE INDEX idx_leads_pipeline ON gt_leads(pipeline_stage);
CREATE INDEX idx_leads_email ON gt_leads(email);
CREATE INDEX idx_leads_invite ON gt_leads(invite_token);
CREATE INDEX idx_lead_notes_lead ON gt_lead_notes(lead_id);
CREATE INDEX idx_calculations_lead ON gt_calculations(lead_id);
