-- =============================================
-- V60: Fix password hashes and set role dashboards
-- =============================================

-- 1. Fix all passwords to use $2a$ prefix (Java BCryptPasswordEncoder native format)
--    Password: 123456
--    Generated with: new BCryptPasswordEncoder(10).encode("123456")
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

-- 2. Add default_dashboard column if it doesn't exist (idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'default_dashboard') THEN
        ALTER TABLE roles ADD COLUMN default_dashboard VARCHAR(255) DEFAULT '/dashboard/employee';
    END IF;
END $$;

-- 3. Set the correct default dashboard for each role
UPDATE roles SET default_dashboard = '/executive' WHERE name = 'ROLE_SUPER_ADMIN';
UPDATE roles SET default_dashboard = '/dashboard' WHERE name = 'ROLE_ADMIN';
UPDATE roles SET default_dashboard = '/dashboard/hr' WHERE name = 'ROLE_HR_DIRECTOR';
UPDATE roles SET default_dashboard = '/dashboard/hr-exec' WHERE name = 'ROLE_HR_EXECUTIVE';
UPDATE roles SET default_dashboard = '/dashboard/finance' WHERE name = 'ROLE_FINANCE_MANAGER';
UPDATE roles SET default_dashboard = '/dashboard/dept-manager' WHERE name = 'ROLE_DEPARTMENT_MANAGER';
UPDATE roles SET default_dashboard = '/dashboard/manager' WHERE name = 'ROLE_MANAGER';
UPDATE roles SET default_dashboard = '/dashboard/team-lead' WHERE name = 'ROLE_TEAM_LEAD';
UPDATE roles SET default_dashboard = '/dashboard/auditor' WHERE name = 'ROLE_AUDITOR';
UPDATE roles SET default_dashboard = '/dashboard/employee' WHERE name = 'ROLE_EMPLOYEE';
