-- ============================================================
-- 015_message_templates_account_unique.sql
-- ------------------------------------------------------------
-- Adjust the unique index for message_templates from (user_id, name, language)
-- to (account_id, name, language) to support true multi‑tenant isolation.
--
-- Steps:
--   1. Ensure no duplicate rows exist for the new key. If they do, abort
--      with a helpful error so the operator can clean up.
--   2. Drop the legacy unique index (if present).
--   3. Create the new unique index.
--   4. Update any dependent fk constraints – none exist currently.
--   5. Mark migration as idempotent.
-- ============================================================

DO $$
DECLARE
  dupe_count INT;
  sample TEXT;
BEGIN
  -- 1. Detect duplicates on the new key.
  SELECT count(*) INTO dupe_count
  FROM (
    SELECT account_id, name, language
    FROM message_templates
    GROUP BY account_id, name, language
    HAVING count(*) > 1
  ) dupes;

  IF dupe_count > 0 THEN
    SELECT string_agg(
      account_id::text || ' / ' || name || ' / ' || COALESCE(language, '(null)') ||
        ' (' || cnt || ' rows)',
      E'\n  '
    )
    INTO sample
    FROM (
      SELECT account_id, name, language, count(*) AS cnt
      FROM message_templates
      GROUP BY account_id, name, language
      HAVING count(*) > 1
    ) dup_detail;

    RAISE EXCEPTION
      E'Cannot add UNIQUE(account_id, name, language) on message_templates — % duplicate combination(s):\n  %\nDelete the rows you do not want to keep, then re-run migrations.',
      dupe_count, sample;
  END IF;
END $$;

-- 2. Drop the old unique index if it exists.
DROP INDEX IF EXISTS message_templates_user_name_language_key;

-- 3. Create the new unique index.
CREATE UNIQUE INDEX IF NOT EXISTS message_templates_account_name_language_key
  ON message_templates (account_id, name, language);
