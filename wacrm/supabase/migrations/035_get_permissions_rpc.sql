-- ============================================================
-- 035_get_permissions_rpc.sql
--
-- Exposes the Effective Permissions for a user on a given account,
-- so the frontend Navigation Engine can render the correct sidebar.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_permissions(p_account_id UUID)
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY(
    SELECT p.key 
    FROM saas_permissions p
    WHERE public.has_permission(p_account_id, p.key) = true
  );
$$;

ALTER FUNCTION public.get_user_permissions(UUID) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(UUID) TO authenticated;
