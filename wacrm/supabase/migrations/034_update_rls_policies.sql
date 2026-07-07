-- ============================================================
-- 034_update_rls_policies.sql
--
-- Replaces the legacy `is_account_member()` RLS checks with the
-- highly granular `has_permission()` engine for core CRM tables.
-- This ties the Database directly to the Subscription & Module engines.
-- ============================================================

-- Make sure we drop existing policies from 017
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (ARRAY[
        'contacts', 'pipelines', 'deals', 'broadcasts', 'conversations', 'messages'
      ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ============================================================
-- CRM MODULE: Contacts
-- ============================================================
CREATE POLICY contacts_select ON contacts FOR SELECT USING (has_permission(account_id, 'contacts.view'));
CREATE POLICY contacts_insert ON contacts FOR INSERT WITH CHECK (has_permission(account_id, 'contacts.create'));
CREATE POLICY contacts_update ON contacts FOR UPDATE USING (has_permission(account_id, 'contacts.edit'));
CREATE POLICY contacts_delete ON contacts FOR DELETE USING (has_permission(account_id, 'contacts.delete'));

-- ============================================================
-- CRM MODULE: Pipelines & Deals
-- ============================================================
CREATE POLICY pipelines_select ON pipelines FOR SELECT USING (has_permission(account_id, 'pipelines.view'));
CREATE POLICY pipelines_modify ON pipelines FOR ALL USING (has_permission(account_id, 'pipelines.manage'));

CREATE POLICY deals_select ON deals FOR SELECT USING (has_permission(account_id, 'pipelines.view'));
CREATE POLICY deals_modify ON deals FOR ALL USING (has_permission(account_id, 'pipelines.manage'));

-- ============================================================
-- INBOX MODULE: Conversations & Messages
-- ============================================================
CREATE POLICY conversations_select ON conversations FOR SELECT USING (has_permission(account_id, 'inbox.view'));
CREATE POLICY conversations_modify ON conversations FOR ALL USING (has_permission(account_id, 'inbox.reply'));

-- ============================================================
-- MARKETING MODULE: Broadcasts
-- ============================================================
CREATE POLICY broadcasts_select ON broadcasts FOR SELECT USING (has_permission(account_id, 'broadcasts.view'));
CREATE POLICY broadcasts_modify ON broadcasts FOR ALL USING (has_permission(account_id, 'broadcasts.send'));
