-- Fintutto World: CRM & Sales Pipeline
-- Target-group-specific sales flows, personalized invite codes,
-- full pipeline from lead to closed_won/closed_lost

-- ============================================================================
-- 1. fw_crm_campaigns — Sales/marketing campaigns
--    (created first because invite_codes references it)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN (
    'email', 'event', 'referral', 'cold_outreach', 'content', 'webinar', 'partnership'
  )),
  target_segments TEXT[] NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'paused', 'completed', 'cancelled'
  )),

  -- Content
  email_subject TEXT,
  email_template JSONB DEFAULT '{}',
  landing_page_config JSONB DEFAULT '{}',

  -- Stats
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_registered INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,

  -- Schedule
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Meta
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. fw_crm_leads — Sales leads / prospects
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id TEXT NOT NULL CHECK (segment_id IN (
    'museum_small', 'museum_medium', 'museum_large',
    'city_small', 'city_medium', 'city_large',
    'region', 'hotel', 'resort', 'cruise', 'event',
    'partner', 'enterprise', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'demo_scheduled', 'demo_done',
    'proposal_sent', 'negotiation', 'closed_won', 'closed_lost',
    'churned', 'reactivated'
  )),
  source TEXT CHECK (source IS NULL OR source IN (
    'website', 'referral', 'event', 'cold_outreach', 'partner',
    'inbound', 'import', 'linkedin'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN (
    'low', 'normal', 'high', 'urgent'
  )),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),

  -- Contact info
  company_name TEXT,
  company_website TEXT,
  company_size TEXT CHECK (company_size IS NULL OR company_size IN (
    'micro', 'small', 'medium', 'large', 'enterprise'
  )),
  industry TEXT,
  contact_first_name TEXT,
  contact_last_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_title TEXT,
  contact_linkedin TEXT,

  -- Address
  address JSONB DEFAULT '{}',
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'DE',

  -- Qualification
  estimated_poi_count INTEGER,
  estimated_languages INTEGER DEFAULT 2,
  estimated_monthly_visitors INTEGER,
  current_solution TEXT,
  budget_confirmed BOOLEAN DEFAULT false,
  decision_timeline TEXT CHECK (decision_timeline IS NULL OR decision_timeline IN (
    'immediate', '1_month', '3_months', '6_months', 'next_year'
  )),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,

  -- Tier / pricing
  target_tier_id TEXT,
  proposed_monthly_eur NUMERIC(10,2),
  discount_percent NUMERIC(5,2) DEFAULT 0,

  -- Conversion
  converted_entity_type TEXT,
  converted_entity_id UUID,
  converted_at TIMESTAMPTZ,

  -- Invite
  invite_code TEXT UNIQUE,
  invite_landing_url TEXT,
  invite_sent_at TIMESTAMPTZ,
  invite_opened_at TIMESTAMPTZ,
  invite_clicked_at TIMESTAMPTZ,
  invite_registered_at TIMESTAMPTZ,

  -- Tags / notes
  tags TEXT[] DEFAULT '{}',
  internal_notes TEXT,

  -- Meta
  last_contacted_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. fw_crm_activities — Activity log per lead
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES fw_crm_leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'email_sent', 'email_opened', 'email_clicked',
    'call_made', 'call_received',
    'meeting_scheduled', 'meeting_held',
    'demo_given', 'proposal_sent',
    'contract_sent', 'contract_signed',
    'note_added', 'status_changed',
    'invite_sent', 'invite_opened', 'landing_page_visited',
    'registered',
    'task_created', 'task_completed'
  )),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. fw_crm_invite_codes — Personalized invite codes for sales
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_crm_invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES fw_crm_leads(id) ON DELETE SET NULL,
  segment_id TEXT NOT NULL,
  tier_id TEXT,

  -- Campaign
  campaign_id UUID REFERENCES fw_crm_campaigns(id) ON DELETE SET NULL,

  -- Personalization
  landing_config JSONB DEFAULT '{}',
  custom_message TEXT,
  custom_offer JSONB DEFAULT '{}',

  -- Tracking
  visits INTEGER DEFAULT 0,
  registrations INTEGER DEFAULT 0,
  first_visited_at TIMESTAMPTZ,
  last_visited_at TIMESTAMPTZ,
  registered_user_id UUID REFERENCES auth.users(id),

  -- Validity
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. fw_crm_tasks — Follow-up tasks for the sales team
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES fw_crm_leads(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'follow_up' CHECK (task_type IN (
    'follow_up', 'call', 'email', 'meeting', 'demo',
    'proposal', 'contract', 'onboarding', 'other'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN (
    'low', 'normal', 'high', 'urgent'
  )),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'cancelled', 'overdue'
  )),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. fw_crm_pipeline_stages — Configurable pipeline stages per segment
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_crm_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  description TEXT,
  auto_actions JSONB DEFAULT '{}',
  expected_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (segment_id, stage_order)
);

-- ============================================================================
-- 7. fw_crm_email_templates — Reusable email templates per segment
-- ============================================================================

CREATE TABLE IF NOT EXISTS fw_crm_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  segment_id TEXT,
  language TEXT DEFAULT 'de',
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_fw_crm_leads_status ON fw_crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_fw_crm_leads_segment ON fw_crm_leads(segment_id);
CREATE INDEX IF NOT EXISTS idx_fw_crm_leads_assigned ON fw_crm_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_fw_crm_leads_invite_code ON fw_crm_leads(invite_code);
CREATE INDEX IF NOT EXISTS idx_fw_crm_leads_next_followup ON fw_crm_leads(next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_fw_crm_leads_segment_status ON fw_crm_leads(segment_id, status);
CREATE INDEX IF NOT EXISTS idx_fw_crm_leads_score ON fw_crm_leads(score DESC);

CREATE INDEX IF NOT EXISTS idx_fw_crm_activities_lead ON fw_crm_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_fw_crm_activities_type ON fw_crm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_fw_crm_activities_created ON fw_crm_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fw_crm_invite_codes_code ON fw_crm_invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_fw_crm_invite_codes_lead ON fw_crm_invite_codes(lead_id);
CREATE INDEX IF NOT EXISTS idx_fw_crm_invite_codes_campaign ON fw_crm_invite_codes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_fw_crm_invite_codes_active ON fw_crm_invite_codes(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_fw_crm_tasks_lead ON fw_crm_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_fw_crm_tasks_assigned ON fw_crm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_fw_crm_tasks_due ON fw_crm_tasks(due_at) WHERE status IN ('pending', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_fw_crm_tasks_status ON fw_crm_tasks(status);

CREATE INDEX IF NOT EXISTS idx_fw_crm_campaigns_status ON fw_crm_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_fw_crm_pipeline_stages_segment ON fw_crm_pipeline_stages(segment_id);

-- ============================================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION fw_crm_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_fw_crm_leads_updated_at
  BEFORE UPDATE ON fw_crm_leads
  FOR EACH ROW EXECUTE FUNCTION fw_crm_set_updated_at();

CREATE TRIGGER trg_fw_crm_campaigns_updated_at
  BEFORE UPDATE ON fw_crm_campaigns
  FOR EACH ROW EXECUTE FUNCTION fw_crm_set_updated_at();

CREATE TRIGGER trg_fw_crm_email_templates_updated_at
  BEFORE UPDATE ON fw_crm_email_templates
  FOR EACH ROW EXECUTE FUNCTION fw_crm_set_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- 1. Generate unique 8-char uppercase alphanumeric invite code
CREATE OR REPLACE FUNCTION fw_generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
  attempts INTEGER := 0;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;

    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM fw_crm_invite_codes WHERE code = result) THEN
      RETURN result;
    END IF;

    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique invite code after 100 attempts';
    END IF;
  END LOOP;
END;
$$;

-- 2. Create lead with auto-generated invite code
CREATE OR REPLACE FUNCTION fw_create_lead_with_invite(
  p_segment TEXT,
  p_company TEXT,
  p_contact_email TEXT,
  p_contact_name TEXT,
  p_campaign_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lead_id UUID;
  v_invite_code TEXT;
  v_invite_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_name_parts TEXT[];
BEGIN
  -- Split contact name into first/last
  v_name_parts := string_to_array(trim(p_contact_name), ' ');
  v_first_name := v_name_parts[1];
  IF array_length(v_name_parts, 1) > 1 THEN
    v_last_name := array_to_string(v_name_parts[2:], ' ');
  END IF;

  -- Generate invite code
  v_invite_code := fw_generate_invite_code();

  -- Create lead
  INSERT INTO fw_crm_leads (
    segment_id, company_name, contact_email,
    contact_first_name, contact_last_name,
    invite_code, source
  ) VALUES (
    p_segment, p_company, p_contact_email,
    v_first_name, v_last_name,
    v_invite_code,
    CASE WHEN p_campaign_id IS NOT NULL THEN 'cold_outreach' ELSE 'inbound' END
  )
  RETURNING id INTO v_lead_id;

  -- Create invite code record
  INSERT INTO fw_crm_invite_codes (
    code, lead_id, segment_id, campaign_id,
    landing_config
  ) VALUES (
    v_invite_code, v_lead_id, p_segment, p_campaign_id,
    jsonb_build_object(
      'segment', p_segment,
      'company', p_company,
      'contact_name', p_contact_name
    )
  )
  RETURNING id INTO v_invite_id;

  -- Log activity
  INSERT INTO fw_crm_activities (lead_id, activity_type, title, metadata)
  VALUES (
    v_lead_id,
    'note_added',
    'Lead created with invite code',
    jsonb_build_object(
      'invite_code', v_invite_code,
      'campaign_id', p_campaign_id
    )
  );

  RETURN jsonb_build_object(
    'lead_id', v_lead_id,
    'invite_code', v_invite_code,
    'invite_id', v_invite_id
  );
END;
$$;

-- 3. Update lead status with activity logging
CREATE OR REPLACE FUNCTION fw_update_lead_status(
  p_lead_id UUID,
  p_new_status TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  -- Get current status
  SELECT status INTO v_old_status
  FROM fw_crm_leads
  WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead % not found', p_lead_id;
  END IF;

  IF v_old_status = p_new_status THEN
    RETURN;
  END IF;

  -- Update lead
  UPDATE fw_crm_leads
  SET status = p_new_status,
      converted_at = CASE WHEN p_new_status = 'closed_won' THEN now() ELSE converted_at END,
      last_contacted_at = now()
  WHERE id = p_lead_id;

  -- Log status change
  INSERT INTO fw_crm_activities (lead_id, activity_type, title, description, metadata)
  VALUES (
    p_lead_id,
    'status_changed',
    'Status: ' || v_old_status || ' -> ' || p_new_status,
    p_note,
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_new_status
    )
  );
END;
$$;

-- 4. Pipeline stats per segment
CREATE OR REPLACE FUNCTION fw_get_pipeline_stats(p_segment_id TEXT DEFAULT NULL)
RETURNS TABLE (
  segment TEXT,
  status TEXT,
  lead_count BIGINT,
  total_pipeline_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.segment_id AS segment,
    l.status,
    count(*)::BIGINT AS lead_count,
    coalesce(sum(l.proposed_monthly_eur), 0) AS total_pipeline_value
  FROM fw_crm_leads l
  WHERE (p_segment_id IS NULL OR l.segment_id = p_segment_id)
  GROUP BY l.segment_id, l.status
  ORDER BY l.segment_id, l.status;
END;
$$;

-- 5. Sales dashboard aggregate stats
CREATE OR REPLACE FUNCTION fw_get_sales_dashboard()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH totals AS (
    SELECT
      count(*) AS total_leads,
      count(*) FILTER (WHERE status = 'closed_won') AS total_won,
      count(*) FILTER (WHERE status = 'closed_lost') AS total_lost,
      count(*) FILTER (WHERE status NOT IN ('closed_won', 'closed_lost', 'churned')) AS active_leads,
      coalesce(avg(proposed_monthly_eur) FILTER (WHERE status = 'closed_won'), 0) AS avg_deal_value,
      coalesce(sum(proposed_monthly_eur) FILTER (WHERE status NOT IN ('closed_won', 'closed_lost', 'churned')), 0) AS pipeline_value,
      coalesce(sum(proposed_monthly_eur) FILTER (WHERE status = 'closed_won'), 0) AS won_value
    FROM fw_crm_leads
  ),
  by_segment AS (
    SELECT jsonb_object_agg(
      segment_id,
      jsonb_build_object(
        'total', cnt,
        'won', won,
        'lost', lost,
        'active', active,
        'pipeline_value', pv
      )
    ) AS segments
    FROM (
      SELECT
        segment_id,
        count(*) AS cnt,
        count(*) FILTER (WHERE status = 'closed_won') AS won,
        count(*) FILTER (WHERE status = 'closed_lost') AS lost,
        count(*) FILTER (WHERE status NOT IN ('closed_won', 'closed_lost', 'churned')) AS active,
        coalesce(sum(proposed_monthly_eur) FILTER (WHERE status NOT IN ('closed_won', 'closed_lost', 'churned')), 0) AS pv
      FROM fw_crm_leads
      GROUP BY segment_id
    ) sub
  ),
  overdue_tasks AS (
    SELECT count(*) AS overdue_count
    FROM fw_crm_tasks
    WHERE status IN ('pending', 'in_progress')
      AND due_at < now()
  )
  SELECT jsonb_build_object(
    'total_leads', t.total_leads,
    'active_leads', t.active_leads,
    'total_won', t.total_won,
    'total_lost', t.total_lost,
    'conversion_rate', CASE
      WHEN (t.total_won + t.total_lost) > 0
      THEN round((t.total_won::NUMERIC / (t.total_won + t.total_lost)) * 100, 1)
      ELSE 0
    END,
    'avg_deal_value', round(t.avg_deal_value, 2),
    'pipeline_value', t.pipeline_value,
    'won_value', t.won_value,
    'overdue_tasks', ot.overdue_count,
    'by_segment', coalesce(bs.segments, '{}'::JSONB)
  )
  INTO v_result
  FROM totals t, by_segment bs, overdue_tasks ot;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE fw_crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_crm_invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_crm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fw_crm_email_templates ENABLE ROW LEVEL SECURITY;

-- Leads: admin and sales_agent see all, others see only assigned leads
CREATE POLICY fw_crm_leads_admin_full ON fw_crm_leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  );

CREATE POLICY fw_crm_leads_assigned_read ON fw_crm_leads
  FOR SELECT
  USING (assigned_to = auth.uid());

-- Activities: admin and sales_agent see all, others see activities on their leads
CREATE POLICY fw_crm_activities_admin_full ON fw_crm_activities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  );

CREATE POLICY fw_crm_activities_assigned_read ON fw_crm_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM fw_crm_leads l
      WHERE l.id = fw_crm_activities.lead_id
        AND l.assigned_to = auth.uid()
    )
  );

-- Invite codes: admin and sales_agent full access
CREATE POLICY fw_crm_invite_codes_admin_full ON fw_crm_invite_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  );

-- Campaigns: admin and sales_agent full access
CREATE POLICY fw_crm_campaigns_admin_full ON fw_crm_campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  );

-- Tasks: admin and sales_agent see all, others see only their own tasks
CREATE POLICY fw_crm_tasks_admin_full ON fw_crm_tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  );

CREATE POLICY fw_crm_tasks_assigned_read ON fw_crm_tasks
  FOR SELECT
  USING (assigned_to = auth.uid());

-- Pipeline stages: admin and sales_agent full access, read for all authenticated
CREATE POLICY fw_crm_pipeline_stages_admin_full ON fw_crm_pipeline_stages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  );

CREATE POLICY fw_crm_pipeline_stages_read ON fw_crm_pipeline_stages
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Email templates: admin and sales_agent full access, read for all authenticated
CREATE POLICY fw_crm_email_templates_admin_full ON fw_crm_email_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_user_meta_data->>'role' IN ('admin', 'sales_agent'))
    )
  );

CREATE POLICY fw_crm_email_templates_read ON fw_crm_email_templates
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SEED: Default pipeline stages for common segments
-- ============================================================================

INSERT INTO fw_crm_pipeline_stages (segment_id, stage_name, stage_order, description, expected_days) VALUES
  ('museum_small',  'Erstkontakt',          1, 'Erster Kontakt hergestellt', 3),
  ('museum_small',  'Qualifizierung',       2, 'Bedarf und Budget geklaert', 5),
  ('museum_small',  'Demo',                 3, 'Live-Demo durchgefuehrt', 7),
  ('museum_small',  'Angebot',              4, 'Angebot versendet', 5),
  ('museum_small',  'Verhandlung',          5, 'Vertragsbedingungen verhandeln', 7),
  ('museum_small',  'Abschluss',            6, 'Vertrag unterzeichnet', 3),

  ('city_large',    'Erstkontakt',          1, 'Erster Kontakt mit Stadtverwaltung', 5),
  ('city_large',    'Bedarfsanalyse',       2, 'Anforderungen und Umfang analysiert', 10),
  ('city_large',    'Stakeholder-Runde',    3, 'Alle Entscheider eingebunden', 14),
  ('city_large',    'Demo & Workshop',      4, 'Demo und Workshop durchgefuehrt', 7),
  ('city_large',    'Angebot & Ausschreibung', 5, 'Angebot im Vergabeprozess', 21),
  ('city_large',    'Verhandlung',          6, 'Vertragsverhandlungen', 14),
  ('city_large',    'Abschluss',            7, 'Vertrag unterzeichnet', 5),

  ('region',        'Erstkontakt',          1, 'Kontakt mit Regionsvertretung', 5),
  ('region',        'Bedarfsanalyse',       2, 'Sub-Entitaeten und Umfang ermittelt', 14),
  ('region',        'Stakeholder-Runde',    3, 'Gemeinden und Partner eingebunden', 21),
  ('region',        'Pilotprojekt',         4, 'Pilotprojekt mit einer Gemeinde', 30),
  ('region',        'Angebot',              5, 'Angebot fuer gesamte Region', 14),
  ('region',        'Verhandlung',          6, 'Vertragsverhandlungen', 14),
  ('region',        'Abschluss',            7, 'Vertrag unterzeichnet', 5),

  ('hotel',         'Erstkontakt',          1, 'Erster Kontakt hergestellt', 3),
  ('hotel',         'Qualifizierung',       2, 'Bedarf und Budget geklaert', 5),
  ('hotel',         'Demo',                 3, 'Live-Demo durchgefuehrt', 5),
  ('hotel',         'Angebot',              4, 'Angebot versendet', 3),
  ('hotel',         'Abschluss',            5, 'Vertrag unterzeichnet', 3)
ON CONFLICT DO NOTHING;
