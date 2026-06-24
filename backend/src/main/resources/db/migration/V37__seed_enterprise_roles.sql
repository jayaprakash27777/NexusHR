-- =============================================
-- V37: Seed Enterprise Roles & Permissions
-- =============================================

-- 1. Insert Missing Enterprise Roles
INSERT INTO roles (name, description, is_system, role_type) VALUES
    ('ROLE_SUPER_ADMIN',        'Global System Override Administrator', true, 'SYSTEM_ADMIN'),
    ('ROLE_HR_DIRECTOR',        'HR Director with strategic and reporting access', true, 'MANAGER'),
    ('ROLE_HR_EXECUTIVE',       'HR Executive for operational HR tasks', true, 'MANAGER'),
    ('ROLE_FINANCE_MANAGER',    'Finance Manager for payroll and compensation', true, 'MANAGER'),
    ('ROLE_DEPARTMENT_MANAGER', 'Department Head with department-wide oversight', true, 'MANAGER'),
    ('ROLE_TEAM_LEAD',          'Team Leader with direct report management', true, 'MANAGER'),
    ('ROLE_AUDITOR',            'Global Read-Only Auditor', true, 'CUSTOM');

-- 2. Map Permissions to Roles

-- Helper block to map permissions dynamically based on categories

-- ROLE_HR_DIRECTOR: All HR, Dashboard, Employee, Attendance, Leave, Performance
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ROLE_HR_DIRECTOR'
  AND p.category IN ('EMPLOYEE', 'ATTENDANCE', 'LEAVE', 'PERFORMANCE', 'DASHBOARD', 'AI_INSIGHTS', 'KNOWLEDGE', 'PLANNING');

-- ROLE_HR_EXECUTIVE: Operational read/write but less strategic planning
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ROLE_HR_EXECUTIVE'
  AND p.category IN ('EMPLOYEE', 'ATTENDANCE', 'LEAVE', 'DASHBOARD')
  AND p.action IN ('READ', 'CREATE', 'UPDATE');

-- ROLE_FINANCE_MANAGER: Payroll, Compensation, Dashboards
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ROLE_FINANCE_MANAGER'
  AND p.category IN ('PAYROLL', 'COMPENSATION', 'DASHBOARD', 'EMPLOYEE');

-- ROLE_DEPARTMENT_MANAGER: Read on Dept, Leave Approvals, Performance
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ROLE_DEPARTMENT_MANAGER'
  AND p.category IN ('EMPLOYEE', 'ATTENDANCE', 'LEAVE', 'PERFORMANCE', 'DASHBOARD')
  AND p.action IN ('READ', 'APPROVE', 'UPDATE');

-- ROLE_TEAM_LEAD: Read on Team, Leave Approvals
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ROLE_TEAM_LEAD'
  AND p.category IN ('EMPLOYEE', 'ATTENDANCE', 'LEAVE', 'DASHBOARD')
  AND p.action IN ('READ', 'APPROVE');

-- ROLE_AUDITOR: Global READ on everything including Security & Audit Logs
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ROLE_AUDITOR'
  AND p.action = 'READ';

-- ROLE_SUPER_ADMIN: ALL Permissions
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r, permissions p
WHERE r.name = 'ROLE_SUPER_ADMIN';
