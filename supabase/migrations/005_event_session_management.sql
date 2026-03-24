-- GuideTranslator: Event Session Management
-- Adds event sessions, panels, participants, pre-translation documents,
-- and session manager roles for the expanded admin dashboard.

-- ============================================================================
-- 1. EXTEND USER ROLES
-- ============================================================================

-- Drop old check constraint and recreate with new roles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gt_users_role_check'
  ) THEN
    ALTER TABLE gt_users DROP CONSTRAINT gt_users_role_check;
  END IF;

  ALTER TABLE gt_users
    ADD CONSTRAINT gt_users_role_check
    CHECK (role IN ('user', 'admin', 'sales_agent', 'session_manager'));
END $$;

-- ============================================================================
-- 2. EVENT SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_event_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES gt_organizations(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'session',
  -- type: 'session' | 'panel' | 'tour' | 'conference' | 'workshop'
  status TEXT NOT NULL DEFAULT 'draft',
  -- status: 'draft' | 'prepared' | 'active' | 'completed' | 'archived'
  session_code TEXT UNIQUE,
  source_language TEXT NOT NULL DEFAULT 'de',
  target_languages TEXT[] DEFAULT '{}',
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  venue TEXT,
  notes TEXT,
  settings JSONB DEFAULT '{}',
  -- settings may include: max_listeners, auto_record, glossary terms, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Check constraint for type and status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gt_event_sessions_type_check'
  ) THEN
    ALTER TABLE gt_event_sessions
      ADD CONSTRAINT gt_event_sessions_type_check
      CHECK (type IN ('session', 'panel', 'tour', 'conference', 'workshop'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gt_event_sessions_status_check'
  ) THEN
    ALTER TABLE gt_event_sessions
      ADD CONSTRAINT gt_event_sessions_status_check
      CHECK (status IN ('draft', 'prepared', 'active', 'completed', 'archived'));
  END IF;
END $$;

-- ============================================================================
-- 3. SESSION PARTICIPANTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES gt_event_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'speaker',
  -- role: 'speaker' | 'moderator' | 'panelist' | 'interpreter' | 'guest'
  biography TEXT,
  organization TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gt_session_participants_role_check'
  ) THEN
    ALTER TABLE gt_session_participants
      ADD CONSTRAINT gt_session_participants_role_check
      CHECK (role IN ('speaker', 'moderator', 'panelist', 'interpreter', 'guest'));
  END IF;
END $$;

-- ============================================================================
-- 4. PRE-TRANSLATION DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_pre_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES gt_event_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES gt_session_participants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'speech',
  -- type: 'speech' | 'questions' | 'biography' | 'glossary' | 'agenda' | 'notes'
  content TEXT NOT NULL,
  source_language TEXT NOT NULL DEFAULT 'de',
  translations JSONB DEFAULT '{}',
  -- { "en": "translated text...", "fr": "texte traduit..." }
  translation_status TEXT NOT NULL DEFAULT 'pending',
  -- status: 'pending' | 'translating' | 'completed' | 'error'
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gt_pre_translations_type_check'
  ) THEN
    ALTER TABLE gt_pre_translations
      ADD CONSTRAINT gt_pre_translations_type_check
      CHECK (type IN ('speech', 'questions', 'biography', 'glossary', 'agenda', 'notes'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gt_pre_translations_status_check'
  ) THEN
    ALTER TABLE gt_pre_translations
      ADD CONSTRAINT gt_pre_translations_status_check
      CHECK (translation_status IN ('pending', 'translating', 'completed', 'error'));
  END IF;
END $$;

-- ============================================================================
-- 5. SESSION MANAGER ASSIGNMENTS (which users can manage which sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gt_session_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES gt_event_sessions(id) ON DELETE CASCADE,
  can_edit BOOLEAN DEFAULT true,
  can_invite BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE gt_event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gt_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE gt_pre_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gt_session_managers ENABLE ROW LEVEL SECURITY;

-- Admin/sales_agent full access on all session tables
CREATE POLICY "Admin full access on gt_event_sessions" ON gt_event_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

CREATE POLICY "Admin full access on gt_session_participants" ON gt_session_participants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

CREATE POLICY "Admin full access on gt_pre_translations" ON gt_pre_translations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

CREATE POLICY "Admin full access on gt_session_managers" ON gt_session_managers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM gt_users WHERE id = auth.uid() AND role IN ('admin', 'sales_agent'))
  );

-- Session creators can manage their own sessions
CREATE POLICY "Creators manage own sessions" ON gt_event_sessions
  FOR ALL USING (auth.uid() = created_by);

-- Session managers can access assigned sessions
CREATE POLICY "Managers access assigned sessions" ON gt_event_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gt_session_managers
      WHERE session_id = gt_event_sessions.id AND user_id = auth.uid()
    )
  );

-- Session managers can access participants of their sessions
CREATE POLICY "Managers access session participants" ON gt_session_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gt_session_managers sm
      WHERE sm.session_id = gt_session_participants.session_id AND sm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM gt_event_sessions es
      WHERE es.id = gt_session_participants.session_id AND es.created_by = auth.uid()
    )
  );

-- Session managers can access pre-translations of their sessions
CREATE POLICY "Managers access pre-translations" ON gt_pre_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gt_session_managers sm
      WHERE sm.session_id = gt_pre_translations.session_id AND sm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM gt_event_sessions es
      WHERE es.id = gt_pre_translations.session_id AND es.created_by = auth.uid()
    )
  );

-- Users can see their own manager assignments
CREATE POLICY "Users see own assignments" ON gt_session_managers
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 7. TRIGGERS
-- ============================================================================

CREATE TRIGGER gt_event_sessions_updated_at
  BEFORE UPDATE ON gt_event_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER gt_pre_translations_updated_at
  BEFORE UPDATE ON gt_pre_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 8. INDEXES
-- ============================================================================

CREATE INDEX idx_event_sessions_created_by ON gt_event_sessions(created_by);
CREATE INDEX idx_event_sessions_org ON gt_event_sessions(organization_id);
CREATE INDEX idx_event_sessions_status ON gt_event_sessions(status);
CREATE INDEX idx_event_sessions_code ON gt_event_sessions(session_code);
CREATE INDEX idx_event_sessions_scheduled ON gt_event_sessions(scheduled_start);
CREATE INDEX idx_session_participants_session ON gt_session_participants(session_id);
CREATE INDEX idx_pre_translations_session ON gt_pre_translations(session_id);
CREATE INDEX idx_session_managers_user ON gt_session_managers(user_id);
CREATE INDEX idx_session_managers_session ON gt_session_managers(session_id);
