-- =============================================
-- V64: Grant ROLE_ADMIN to Super Admin
-- =============================================

-- The Super Admin user only had ROLE_SUPER_ADMIN.
-- This grants ROLE_ADMIN explicitly in the database so that endpoints
-- hardcoded with @PreAuthorize("hasRole('ADMIN')") work correctly.

INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT '99999999-9999-9999-9999-999999999999', id, CURRENT_TIMESTAMP
FROM roles
WHERE name = 'ROLE_ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;
