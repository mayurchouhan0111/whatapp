-- ============================================================
-- 029: Enable Realtime for broadcasts table
-- Required for the LoopX mobile app to receive live updates
-- when broadcast status/counts change.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'broadcasts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE broadcasts;
  END IF;
END $$;
