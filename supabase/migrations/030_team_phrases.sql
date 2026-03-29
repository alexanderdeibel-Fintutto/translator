-- Migration 030: Team-Phrasen
-- Admins legen Phrasen an die für alle Mitarbeiter des Teams sichtbar sind

CREATE TABLE IF NOT EXISTS team_phrases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     TEXT NOT NULL,
  text        TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'Allgemein',
  emoji       TEXT,
  use_count   INTEGER NOT NULL DEFAULT 0,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index für schnelle Team-Abfragen
CREATE INDEX IF NOT EXISTS team_phrases_team_id_idx ON team_phrases(team_id);
CREATE INDEX IF NOT EXISTS team_phrases_use_count_idx ON team_phrases(team_id, use_count DESC);

-- RLS aktivieren
ALTER TABLE team_phrases ENABLE ROW LEVEL SECURITY;

-- Alle authentifizierten Nutzer können Team-Phrasen lesen
CREATE POLICY "team_phrases_read" ON team_phrases
  FOR SELECT TO authenticated
  USING (true);

-- Nur Admins können Team-Phrasen anlegen/bearbeiten/löschen
-- (Admin-Check über user_metadata.role = 'admin')
CREATE POLICY "team_phrases_admin_insert" ON team_phrases
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "team_phrases_admin_update" ON team_phrases
  FOR UPDATE TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "team_phrases_admin_delete" ON team_phrases
  FOR DELETE TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_team_phrases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_phrases_updated_at
  BEFORE UPDATE ON team_phrases
  FOR EACH ROW EXECUTE FUNCTION update_team_phrases_updated_at();

-- Beispiel-Daten für Hotel-Team
INSERT INTO team_phrases (team_id, text, category, emoji) VALUES
  ('hotel-demo', 'Herzlich willkommen! Wie kann ich Ihnen helfen?', 'Begrüßung', '👋'),
  ('hotel-demo', 'Das Frühstück wird von 7:00 bis 10:30 Uhr serviert.', 'Hotel-Info', '🍳'),
  ('hotel-demo', 'Der Check-out ist bis 12:00 Uhr mittags.', 'Hotel-Info', '🕛'),
  ('hotel-demo', 'WLAN-Passwort: Hotel2024', 'Hotel-Info', '📶'),
  ('hotel-demo', 'Der Aufzug befindet sich auf der rechten Seite.', 'Orientierung', '🛗'),
  ('hotel-demo', 'Das Restaurant ist bis 22:00 Uhr geöffnet.', 'Hotel-Info', '🍽️'),
  ('hotel-demo', 'Ich rufe sofort den Techniker.', 'Service', '🔧'),
  ('hotel-demo', 'Wir entschuldigen uns für die Unannehmlichkeiten.', 'Service', '🙏')
ON CONFLICT DO NOTHING;
