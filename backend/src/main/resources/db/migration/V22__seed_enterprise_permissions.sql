-- Generate granular permissions for 15 categories x 8 actions
WITH categories AS (
    SELECT unnest(ARRAY['EMPLOYEE', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'PAYMENT', 'PERFORMANCE', 'ANALYTICS', 'DOCUMENTS', 'NOTIFICATIONS', 'AUDIT', 'USERS', 'ROLES', 'SETTINGS', 'SECURITY', 'INTEGRATIONS']) AS category
),
actions AS (
    SELECT unnest(ARRAY['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'CONFIGURE']) AS action
)
INSERT INTO permissions (category, action, description)
SELECT c.category, a.action, a.action || ' permission for ' || c.category
FROM categories c CROSS JOIN actions a;

-- Map basic READ permissions to ROLE_EMPLOYEE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'ROLE_EMPLOYEE' 
AND p.action = 'READ' 
AND p.category IN ('EMPLOYEE', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'PERFORMANCE', 'NOTIFICATIONS');

-- Map elevated permissions to ROLE_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'ROLE_MANAGER' 
AND (
    (p.action IN ('READ', 'APPROVE', 'REJECT') AND p.category IN ('ATTENDANCE', 'LEAVE', 'PERFORMANCE')) OR
    (p.action IN ('READ', 'UPDATE') AND p.category = 'EMPLOYEE') OR
    (p.action = 'READ' AND p.category IN ('PAYROLL', 'NOTIFICATIONS', 'ANALYTICS'))
);

-- Map ALL permissions to ROLE_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.name = 'ROLE_ADMIN';
