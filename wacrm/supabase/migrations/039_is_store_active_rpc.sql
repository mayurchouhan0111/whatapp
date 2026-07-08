-- ============================================================
-- 039_is_store_active_rpc.sql
--
-- RPC to safely check if the store module is active for an account
-- without exposing internal billing tables to the public via RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_store_active(p_account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM saas_account_modules sam
    JOIN saas_modules sm ON sm.id = sam.module_id
    WHERE sam.account_id = p_account_id
      AND sm.key = 'store'
      AND sam.is_active = true
  );
$$;

ALTER FUNCTION public.is_store_active(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_store_active(UUID) TO public, authenticated, anon;
