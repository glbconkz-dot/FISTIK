-- Manager iPhone app push tokens (Expo Push)
CREATE TABLE IF NOT EXISTS admin_device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expo_push_token text NOT NULL UNIQUE,
  device_name text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT 'ios',
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_device_tokens_active_idx
  ON admin_device_tokens(is_active)
  WHERE is_active = true;

ALTER TABLE admin_device_tokens ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE admin_device_tokens TO service_role;

DROP POLICY IF EXISTS admin_device_tokens_service ON admin_device_tokens;
CREATE POLICY admin_device_tokens_service
  ON admin_device_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
