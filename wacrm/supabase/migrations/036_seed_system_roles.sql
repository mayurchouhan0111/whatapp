-- ============================================================
-- 036_seed_system_roles.sql
--
-- Creates the default system roles (Admin, Agent, Viewer) globally.
-- System roles have account_id = NULL.
-- Maps specific saas_permissions to these roles.
-- ============================================================

DO $$
DECLARE
  v_role_admin UUID;
  v_role_agent UUID;
  v_role_viewer UUID;
BEGIN
  -- 1. Create System Roles
  INSERT INTO saas_roles (account_id, name, description, is_system) 
  VALUES (NULL, 'Admin', 'Full administrative access excluding billing.', true)
  RETURNING id INTO v_role_admin;

  INSERT INTO saas_roles (account_id, name, description, is_system) 
  VALUES (NULL, 'Agent', 'Standard operational access. Can read and write.', true)
  RETURNING id INTO v_role_agent;

  INSERT INTO saas_roles (account_id, name, description, is_system) 
  VALUES (NULL, 'Viewer', 'Read-only access across the platform.', true)
  RETURNING id INTO v_role_viewer;

  -- 2. Map Permissions: Admin gets everything
  INSERT INTO saas_role_permissions (role_id, permission_id)
  SELECT v_role_admin, id FROM saas_permissions;

  -- 3. Map Permissions: Agent gets view, create, edit, manage, reply, send (NO delete)
  INSERT INTO saas_role_permissions (role_id, permission_id)
  SELECT v_role_agent, id 
  FROM saas_permissions
  WHERE key IN (
    'contacts.view', 'contacts.create', 'contacts.edit',
    'pipelines.view', 'pipelines.manage',
    'inbox.view', 'inbox.reply',
    'broadcasts.view', 'broadcasts.send',
    'automations.view', 'automations.manage',
    'store.view', 'store.manage'
  );

  -- 4. Map Permissions: Viewer gets view only
  INSERT INTO saas_role_permissions (role_id, permission_id)
  SELECT v_role_viewer, id 
  FROM saas_permissions
  WHERE key LIKE '%.view%';

END $$;
