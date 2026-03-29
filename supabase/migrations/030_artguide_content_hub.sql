-- ============================================================================
-- 030 – Art Guide Content Hub
-- Digitales Notizbuch für Museen: Ideen, Links, Dateien, Notizen
-- ============================================================================

CREATE TABLE IF NOT EXISTS ag_content_hub (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  museum_id UUID NOT NULL REFERENCES ag_museums(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'url', 'file', 'image', 'contact', 'idea')),
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'processing', 'ready', 'exported')),
  target_type TEXT DEFAULT 'artwork' CHECK (target_type IN ('artwork', 'tour', 'poi', 'partner', 'event')),
  ai_summary TEXT,
  file_url TEXT,
  invite_email TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ag_content_hub_museum ON ag_content_hub(museum_id);
CREATE INDEX IF NOT EXISTS idx_ag_content_hub_status ON ag_content_hub(status);

ALTER TABLE ag_content_hub ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Museum members can manage content hub"
  ON ag_content_hub FOR ALL
  USING (
    museum_id IN (
      SELECT museum_id FROM ag_cms_members
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR museum_id IN (
      SELECT id FROM ag_museums WHERE created_by = auth.uid()
    )
  );

-- Add invite_email column to ag_cms_members if not exists
ALTER TABLE ag_cms_members ADD COLUMN IF NOT EXISTS invite_email TEXT;
