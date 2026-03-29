-- Migration 029: Persönliches Phrasenbuch
-- Jeder Mitarbeiter kann eigene Phrasen anlegen die er häufig braucht.
-- Phrasen werden nach Nutzungshäufigkeit sortiert (use_count).

-- ── Tabelle: user_phrases ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_phrases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text          TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'Allgemein',
  emoji         TEXT,
  use_count     INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index für schnellen Zugriff nach Nutzer
CREATE INDEX IF NOT EXISTS idx_user_phrases_user_id ON public.user_phrases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_phrases_use_count ON public.user_phrases(user_id, use_count DESC);

-- Updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION update_user_phrases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_phrases_updated_at ON public.user_phrases;
CREATE TRIGGER trg_user_phrases_updated_at
  BEFORE UPDATE ON public.user_phrases
  FOR EACH ROW EXECUTE FUNCTION update_user_phrases_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────

ALTER TABLE public.user_phrases ENABLE ROW LEVEL SECURITY;

-- Nutzer kann nur eigene Phrasen sehen
CREATE POLICY "user_phrases_select_own"
  ON public.user_phrases FOR SELECT
  USING (auth.uid() = user_id);

-- Nutzer kann eigene Phrasen anlegen
CREATE POLICY "user_phrases_insert_own"
  ON public.user_phrases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Nutzer kann eigene Phrasen aktualisieren (use_count erhöhen)
CREATE POLICY "user_phrases_update_own"
  ON public.user_phrases FOR UPDATE
  USING (auth.uid() = user_id);

-- Nutzer kann eigene Phrasen löschen
CREATE POLICY "user_phrases_delete_own"
  ON public.user_phrases FOR DELETE
  USING (auth.uid() = user_id);

-- ── Kommentar ─────────────────────────────────────────────────────────────

COMMENT ON TABLE public.user_phrases IS
  'Persönliches Phrasenbuch: Mitarbeiter-eigene Sätze für häufige Situationen.
   Sortierung nach use_count (häufig genutzte Phrasen erscheinen oben).
   Offline-fähig: Frontend cached in localStorage.';
