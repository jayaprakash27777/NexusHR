-- =============================================
-- V57: Revert original emails and create separate demo accounts
-- =============================================

-- 1. Revert original users' emails back to their V44 state
UPDATE users SET email = 'david.moore1@nexushr.com' WHERE email = 'admin@nexushr.com';
UPDATE employees SET email = 'david.moore1@nexushr.com' WHERE email = 'admin@nexushr.com';

UPDATE users SET email = 'joseph.thomas2@nexushr.com' WHERE email = 'hrdirector@nexushr.com';
UPDATE employees SET email = 'joseph.thomas2@nexushr.com' WHERE email = 'hrdirector@nexushr.com';

UPDATE users SET email = 'patricia.anderson3@nexushr.com' WHERE email = 'financemanager@nexushr.com';
UPDATE employees SET email = 'patricia.anderson3@nexushr.com' WHERE email = 'financemanager@nexushr.com';

UPDATE users SET email = 'patricia.perez4@nexushr.com' WHERE email = 'deptmanager@nexushr.com';
UPDATE employees SET email = 'patricia.perez4@nexushr.com' WHERE email = 'deptmanager@nexushr.com';

UPDATE users SET email = 'michael.taylor5@nexushr.com' WHERE email = 'teamlead@nexushr.com';
UPDATE employees SET email = 'michael.taylor5@nexushr.com' WHERE email = 'teamlead@nexushr.com';

UPDATE users SET email = 'linda.moore6@nexushr.com' WHERE email = 'employee1@nexushr.com';
UPDATE employees SET email = 'linda.moore6@nexushr.com' WHERE email = 'employee1@nexushr.com';

UPDATE users SET email = 'robert.martinez7@nexushr.com' WHERE email = 'employee2@nexushr.com';
UPDATE employees SET email = 'robert.martinez7@nexushr.com' WHERE email = 'employee2@nexushr.com';

UPDATE users SET email = 'john.brown8@nexushr.com' WHERE email = 'hrexecutive@nexushr.com';
UPDATE employees SET email = 'john.brown8@nexushr.com' WHERE email = 'hrexecutive@nexushr.com';

UPDATE users SET email = 'mary.miller9@nexushr.com' WHERE email = 'auditor@nexushr.com';
UPDATE employees SET email = 'mary.miller9@nexushr.com' WHERE email = 'auditor@nexushr.com';

-- 2. Insert the new Demo users into `users` table
INSERT INTO users (id, first_name, last_name, email, password, active, email_verified, created_at, updated_at) VALUES 
('11111111-1111-1111-1111-111111111111', 'System', 'Admin', 'admin@nexushr.com', '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222222', 'System', 'HRDirector', 'hrdirector@nexushr.com', '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333333', 'System', 'HRExecutive', 'hrexecutive@nexushr.com', '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444444', 'System', 'FinanceManager', 'financemanager@nexushr.com', '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555555', 'System', 'DeptManager', 'deptmanager@nexushr.com', '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('66666666-6666-6666-6666-666666666666', 'System', 'TeamLead', 'teamlead@nexushr.com', '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777777', 'System', 'Auditor', 'auditor@nexushr.com', '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'System', 'Employee1', 'employee1@nexushr.com', '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aaaaa222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'System', 'Employee2', 'employee2@nexushr.com', '$2b$10$W6Z6C87CCfPXvP7wxBnqreWvzH4IRo4fmy8xq5FES.LlncW6gsCfq', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Insert the new Demo users into `employees` table
INSERT INTO employees (id, employee_id, user_id, first_name, last_name, email, status, joining_date, created_at, updated_at) VALUES 
('11111111-1111-1111-1111-11111111111e', 'EMP-D-01', '11111111-1111-1111-1111-111111111111', 'System', 'Admin', 'admin@nexushr.com', 'ACTIVE', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-22222222222e', 'EMP-D-02', '22222222-2222-2222-2222-222222222222', 'System', 'HRDirector', 'hrdirector@nexushr.com', 'ACTIVE', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-33333333333e', 'EMP-D-03', '33333333-3333-3333-3333-333333333333', 'System', 'HRExecutive', 'hrexecutive@nexushr.com', 'ACTIVE', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-44444444444e', 'EMP-D-04', '44444444-4444-4444-4444-444444444444', 'System', 'FinanceManager', 'financemanager@nexushr.com', 'ACTIVE', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-55555555555e', 'EMP-D-05', '55555555-5555-5555-5555-555555555555', 'System', 'DeptManager', 'deptmanager@nexushr.com', 'ACTIVE', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('66666666-6666-6666-6666-66666666666e', 'EMP-D-06', '66666666-6666-6666-6666-666666666666', 'System', 'TeamLead', 'teamlead@nexushr.com', 'ACTIVE', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-77777777777e', 'EMP-D-07', '77777777-7777-7777-7777-777777777777', 'System', 'Auditor', 'auditor@nexushr.com', 'ACTIVE', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'EMP-D-08', 'aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'System', 'Employee1', 'employee1@nexushr.com', 'ACTIVE', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aaaaa222-aaaa-aaaa-aaaa-aaaaaaaaaaae', 'EMP-D-09', 'aaaaa222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'System', 'Employee2', 'employee2@nexushr.com', 'ACTIVE', CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Assign Primary Roles
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '11111111-1111-1111-1111-111111111111', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_ADMIN';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '22222222-2222-2222-2222-222222222222', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_HR_DIRECTOR';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '33333333-3333-3333-3333-333333333333', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_HR_EXECUTIVE';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '44444444-4444-4444-4444-444444444444', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_FINANCE_MANAGER';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '55555555-5555-5555-5555-555555555555', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_DEPARTMENT_MANAGER';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '66666666-6666-6666-6666-666666666666', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_TEAM_LEAD';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '77777777-7777-7777-7777-777777777777', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_AUDITOR';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT 'aaaaa111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT 'aaaaa222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';

-- 5. Assign Employee Role to everyone (except those who only have Employee role)
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '11111111-1111-1111-1111-111111111111', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '22222222-2222-2222-2222-222222222222', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '33333333-3333-3333-3333-333333333333', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '44444444-4444-4444-4444-444444444444', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '55555555-5555-5555-5555-555555555555', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '66666666-6666-6666-6666-666666666666', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';
INSERT INTO user_roles (user_id, role_id, assigned_at) SELECT '77777777-7777-7777-7777-777777777777', id, CURRENT_TIMESTAMP FROM roles WHERE name = 'ROLE_EMPLOYEE';
