-- GuideTranslator: Organization Invites
-- Adds invite system for organizations and org-owner access policies.

-- ============================================================================
-- 1. ORG INVITES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_org_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES gt_organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);

ALTER TABLE gt_org_invites ENABLE ROW LEVEL SECURITY;

-- Org owners can manage invites
CREATE POLICY "Org owner manage invites" ON gt_org_invites
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM gt_organizations WHERE owner_id = auth.uid()
    )
  );

-- Admin can manage all invites
CREATE POLICY "Admin manage invites" ON gt_org_invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

-- ============================================================================
-- 2. ADDITIONAL RLS: Org owner read member usage
-- ============================================================================

CREATE POLICY "Org owner read member usage" ON gt_usage
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM gt_organizations WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

CREATE INDEX idx_org_invites_org ON gt_org_invites(organization_id);
CREATE INDEX idx_org_invites_email ON gt_org_invites(email);
