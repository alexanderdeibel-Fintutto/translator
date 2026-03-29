-- Migration 031: Gesprächs-Protokoll (DSGVO-konform)
--
-- Speichert Gesprächs-Metadaten für Qualitätssicherung und Übergaben.
-- KEIN Gesprächsinhalt wird gespeichert (nur Metadaten + optionale Notiz).
-- Automatische Löschung nach 90 Tagen (konfigurierbar).
--
-- DSGVO-Konformität:
-- - Kein Gesprächsinhalt gespeichert (nur Metadaten)
-- - Automatische Löschung nach retention_days
-- - Nutzer kann eigene Protokolle jederzeit löschen
-- - Opt-in: Protokollierung nur wenn staff_consent = true

CREATE TABLE IF NOT EXISTS conversation_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Wer hat das Gespräch geführt
  staff_user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id          TEXT,
  location         TEXT,

  -- Wann und wie lange
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at         TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Sprachen
  staff_language   TEXT NOT NULL DEFAULT 'de',
  guest_language   TEXT,

  -- Kontext (keine Inhalte)
  context_template TEXT,  -- z.B. 'hotel-checkin', 'authority-application'
  message_count    INTEGER NOT NULL DEFAULT 0,

  -- Optionale Übergabe-Notiz (vom Mitarbeiter manuell hinzugefügt)
  handover_note    TEXT,

  -- Folgeaufgaben (strukturiert, kein freier Text)
  follow_up_tasks  JSONB DEFAULT '[]'::jsonb,

  -- Qualitäts-Metadaten
  smart_replies_used  INTEGER NOT NULL DEFAULT 0,
  phrases_used        INTEGER NOT NULL DEFAULT 0,
  emergency_triggered BOOLEAN NOT NULL DEFAULT false,

  -- DSGVO
  staff_consent    BOOLEAN NOT NULL DEFAULT false,
  retention_days   INTEGER NOT NULL DEFAULT 90,
  delete_after     TIMESTAMPTZ,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indizes
CREATE INDEX IF NOT EXISTS conv_logs_staff_idx    ON conversation_logs(staff_user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS conv_logs_team_idx     ON conversation_logs(team_id, started_at DESC);
CREATE INDEX IF NOT EXISTS conv_logs_delete_idx   ON conversation_logs(delete_after);

-- RLS
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;

-- Mitarbeiter sehen nur ihre eigenen Protokolle
CREATE POLICY "conv_logs_own_read" ON conversation_logs
  FOR SELECT TO authenticated
  USING (staff_user_id = auth.uid());

-- Mitarbeiter können eigene Protokolle anlegen
CREATE POLICY "conv_logs_own_insert" ON conversation_logs
  FOR INSERT TO authenticated
  WITH CHECK (staff_user_id = auth.uid() AND staff_consent = true);

-- Mitarbeiter können eigene Protokolle aktualisieren (z.B. Notiz hinzufügen)
CREATE POLICY "conv_logs_own_update" ON conversation_logs
  FOR UPDATE TO authenticated
  USING (staff_user_id = auth.uid());

-- Mitarbeiter können eigene Protokolle löschen (DSGVO-Recht auf Löschung)
CREATE POLICY "conv_logs_own_delete" ON conversation_logs
  FOR DELETE TO authenticated
  USING (staff_user_id = auth.uid());

-- Admins sehen alle Protokolle ihres Teams
CREATE POLICY "conv_logs_admin_read" ON conversation_logs
  FOR SELECT TO authenticated
  USING (
    team_id IS NOT NULL AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' AND
    (auth.jwt() -> 'user_metadata' ->> 'team_id') = team_id
  );

-- Automatische Bereinigung abgelaufener Protokolle (via pg_cron oder manuell)
-- Kann als Supabase Edge Function geplant werden:
-- DELETE FROM conversation_logs WHERE delete_after < now();

-- Trigger: delete_after automatisch berechnen
CREATE OR REPLACE FUNCTION set_conv_log_delete_after()
RETURNS TRIGGER AS $$
BEGIN
  NEW.delete_after = NEW.started_at + (NEW.retention_days || ' days')::interval;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conv_log_delete_after
  BEFORE INSERT OR UPDATE ON conversation_logs
  FOR EACH ROW EXECUTE FUNCTION set_conv_log_delete_after();

-- Kommentar für Datenschutz-Dokumentation
COMMENT ON TABLE conversation_logs IS
  'Gesprächs-Metadaten für Qualitätssicherung. Kein Gesprächsinhalt gespeichert. '
  'Automatische Löschung nach retention_days (Standard: 90 Tage). '
  'Nur mit expliziter Einwilligung des Mitarbeiters (staff_consent = true).';
