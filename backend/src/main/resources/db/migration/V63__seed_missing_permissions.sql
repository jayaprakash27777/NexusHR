-- =============================================
-- V63: Seed missing permissions and map to Super Admin
-- =============================================

-- Generate missing permissions for DASHBOARD, AI_INSIGHTS, KNOWLEDGE, PLANNING
WITH missing_categories AS (
    SELECT unnest(ARRAY['DASHBOARD', 'AI_INSIGHTS', 'KNOWLEDGE', 'PLANNING']) AS category
),
actions AS (
    SELECT unnest(ARRAY['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'CONFIGURE']) AS action
)
INSERT INTO permissions (category, action, description)
SELECT c.category, a.action, a.action || ' permission for ' || c.category
FROM missing_categories c CROSS JOIN actions a
ON CONFLICT (category, action) DO NOTHING;

-- Grant ALL missing permissions to SUPER ADMIN
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ROLE_SUPER_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Grant DASHBOARD, AI_INSIGHTS, KNOWLEDGE, PLANNING to HR DIRECTOR
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ROLE_HR_DIRECTOR'
  AND p.category IN ('DASHBOARD', 'AI_INSIGHTS', 'KNOWLEDGE', 'PLANNING')
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id
);
