-- =============================================
-- V56: Revert Barbara and add separate Super Admin
-- =============================================

-- 1. Revert Barbara Williams' email back
UPDATE users SET email = 'barbara.williams0@nexushr.com' WHERE email = 'superadmin@nexushr.com';
UPDATE employees SET email = 'barbara.williams0@nexushr.com' WHERE email = 'superadmin@nexushr.com';

-- 2. Insert the new Super Admin user
INSERT INTO users (id, first_name, last_name, email, password, active, email_verified, created_at, updated_at) 
VALUES (
    '99999999-9999-9999-9999-999999999999', 
    'System', 
    'SuperAdmin', 
    'superadmin@nexushr.com', 
    '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', 
    TRUE, 
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 3. Insert the employee record for the new Super Admin
INSERT INTO employees (id, employee_id, user_id, first_name, last_name, email, status, joining_date, created_at, updated_at)
VALUES (
    '88888888-8888-8888-8888-888888888888',
    'EMP-SA-001',
    '99999999-9999-9999-9999-999999999999',
    'System',
    'SuperAdmin',
    'superadmin@nexushr.com',
    'ACTIVE',
    CURRENT_DATE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 4. Assign ROLE_SUPER_ADMIN to the new user
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT '99999999-9999-9999-9999-999999999999', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_SUPER_ADMIN';

-- 5. Assign ROLE_EMPLOYEE to the new user (as all users get this)
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT '99999999-9999-9999-9999-999999999999', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';
