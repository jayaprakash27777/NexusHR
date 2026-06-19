-- =============================================
-- V35: Add missing columns added by Hibernate
-- =============================================

-- 1. Add assigned_at to user_roles
ALTER TABLE user_roles ADD COLUMN assigned_at TIMESTAMP(6);
UPDATE user_roles SET assigned_at = CURRENT_TIMESTAMP WHERE assigned_at IS NULL;
ALTER TABLE user_roles ALTER COLUMN assigned_at SET NOT NULL;

-- 2. Add role_type to roles
ALTER TABLE roles ADD COLUMN role_type VARCHAR(255);
UPDATE roles SET role_type = 'SYSTEM' WHERE role_type IS NULL;
ALTER TABLE roles ALTER COLUMN role_type SET NOT NULL;

-- 3. Add assigned_at to role_permissions
ALTER TABLE role_permissions ADD COLUMN assigned_at TIMESTAMP(6);
UPDATE role_permissions SET assigned_at = CURRENT_TIMESTAMP WHERE assigned_at IS NULL;
ALTER TABLE role_permissions ALTER COLUMN assigned_at SET NOT NULL;
