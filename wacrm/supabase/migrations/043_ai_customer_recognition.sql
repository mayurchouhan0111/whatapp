-- ============================================================
-- 043_ai_customer_recognition.sql — AI Face Recognition Module
--
-- Adds:
--   1. `recognition_configs` table for thresholds and settings
--   2. `contact_faces` table for biometric profiles & signatures
--   3. `visitor_logs` table for tracking customer entrances
--   4. Row Level Security (RLS) policies for new tables
--
-- Safe to run multiple times.
-- ============================================================

-- ============================================================
-- 1. AI Recognition Configs Table
-- ============================================================
CREATE TABLE IF NOT EXISTS recognition_configs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id            uuid NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  premium_threshold     numeric(10, 2) NOT NULL DEFAULT 10000.00,
  good_threshold        numeric(10, 2) NOT NULL DEFAULT 5000.00,
  regular_threshold     numeric(10, 2) NOT NULL DEFAULT 1000.00,
  is_enabled            boolean NOT NULL DEFAULT true,
  notifications_enabled boolean NOT NULL DEFAULT true,
  confidence_threshold  numeric(3, 2) NOT NULL DEFAULT 0.75,
  camera_entrance_id    text,
  camera_billing_id     text,
  data_retention_days   integer NOT NULL DEFAULT 365,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recognition_configs_account_id_idx ON recognition_configs(account_id);

-- ============================================================
-- 2. Contact Faces (Embeddings & Biometrics) Table
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_faces (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id       uuid NOT NULL UNIQUE REFERENCES contacts(id) ON DELETE CASCADE,
  face_photo_url   text,
  face_embedding   double precision[], -- 128-dimensional array
  consent_given    boolean NOT NULL DEFAULT false,
  consent_date     timestamptz DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_faces_account_id_idx ON contact_faces(account_id);
CREATE INDEX IF NOT EXISTS contact_faces_contact_id_idx ON contact_faces(contact_id);

-- ============================================================
-- 3. Visitor Logs Table
-- ============================================================
CREATE TABLE IF NOT EXISTS visitor_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id       uuid REFERENCES contacts(id) ON DELETE SET NULL, -- Null if new/unrecognized visitor
  face_photo_url   text,
  recognized       boolean NOT NULL DEFAULT false,
  confidence       numeric(3, 2),
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitor_logs_account_id_idx ON visitor_logs(account_id);
CREATE INDEX IF NOT EXISTS visitor_logs_contact_id_idx ON visitor_logs(contact_id);

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================
ALTER TABLE recognition_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- recognition_configs policies
DROP POLICY IF EXISTS recognition_configs_select ON recognition_configs;
CREATE POLICY recognition_configs_select ON recognition_configs FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS recognition_configs_all_admin ON recognition_configs;
CREATE POLICY recognition_configs_all_admin ON recognition_configs FOR ALL
  USING (is_account_member(account_id, 'admin'));

-- contact_faces policies
DROP POLICY IF EXISTS contact_faces_select ON contact_faces;
CREATE POLICY contact_faces_select ON contact_faces FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS contact_faces_all_member ON contact_faces;
CREATE POLICY contact_faces_all_member ON contact_faces FOR ALL
  USING (is_account_member(account_id));

-- visitor_logs policies
DROP POLICY IF EXISTS visitor_logs_select ON visitor_logs;
CREATE POLICY visitor_logs_select ON visitor_logs FOR SELECT
  USING (is_account_member(account_id));

DROP POLICY IF EXISTS visitor_logs_all_member ON visitor_logs;
CREATE POLICY visitor_logs_all_member ON visitor_logs FOR ALL
  USING (is_account_member(account_id));
