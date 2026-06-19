-- =============================================
-- V9: Seed departments and demo employees
-- =============================================

-- Insert departments
INSERT INTO departments (id, name, code, description) VALUES
    ('d1000001-0000-0000-0000-000000000001', 'Engineering',      'ENG',  'Software Engineering and Development'),
    ('d1000001-0000-0000-0000-000000000002', 'Human Resources',  'HR',   'People Operations and HR Management'),
    ('d1000001-0000-0000-0000-000000000003', 'Finance',          'FIN',  'Financial Planning and Accounting'),
    ('d1000001-0000-0000-0000-000000000004', 'Marketing',        'MKT',  'Marketing and Brand Management'),
    ('d1000001-0000-0000-0000-000000000005', 'Sales',            'SAL',  'Sales and Business Development'),
    ('d1000001-0000-0000-0000-000000000006', 'Operations',       'OPS',  'Operations and Infrastructure'),
    ('d1000001-0000-0000-0000-000000000007', 'Product',          'PRD',  'Product Management and Strategy'),
    ('d1000001-0000-0000-0000-000000000008', 'Design',           'DSN',  'UI/UX Design and Creative');

-- Insert demo manager user accounts
INSERT INTO users (id, first_name, last_name, email, password, active, email_verified) VALUES
    ('b0eebc99-0001-4ef8-bb6d-6bb9bd380a01', 'Rajesh',  'Kumar',    'rajesh.kumar@nexushr.com',    '$2b$10$xooUCvSPxg.vSV5b13nwROgZvTqZnsad84me46jl98Nx0cD6O56RK', TRUE, TRUE),
    ('b0eebc99-0002-4ef8-bb6d-6bb9bd380a02', 'Priya',   'Sharma',   'priya.sharma@nexushr.com',    '$2b$10$xooUCvSPxg.vSV5b13nwROgZvTqZnsad84me46jl98Nx0cD6O56RK', TRUE, TRUE),
    ('b0eebc99-0003-4ef8-bb6d-6bb9bd380a03', 'Amit',    'Patel',    'amit.patel@nexushr.com',      '$2b$10$xooUCvSPxg.vSV5b13nwROgZvTqZnsad84me46jl98Nx0cD6O56RK', TRUE, TRUE);

-- Assign MANAGER role
INSERT INTO user_roles (user_id, role_id)
SELECT 'b0eebc99-0001-4ef8-bb6d-6bb9bd380a01', id FROM roles WHERE name = 'ROLE_MANAGER';
INSERT INTO user_roles (user_id, role_id)
SELECT 'b0eebc99-0002-4ef8-bb6d-6bb9bd380a02', id FROM roles WHERE name = 'ROLE_MANAGER';
INSERT INTO user_roles (user_id, role_id)
SELECT 'b0eebc99-0003-4ef8-bb6d-6bb9bd380a03', id FROM roles WHERE name = 'ROLE_MANAGER';

-- Insert demo employees (managers)
INSERT INTO employees (id, employee_id, user_id, first_name, last_name, email, phone, date_of_birth, gender, department_id, designation, salary, joining_date, status) VALUES
    ('e1000001-0000-0000-0000-000000000001', 'NHR-1001', 'b0eebc99-0001-4ef8-bb6d-6bb9bd380a01', 'Rajesh',  'Kumar',   'rajesh.kumar@nexushr.com',   '+91-9876543210', '1985-06-15', 'MALE',   'd1000001-0000-0000-0000-000000000001', 'Engineering Manager',  150000.00, '2020-01-15', 'ACTIVE'),
    ('e1000001-0000-0000-0000-000000000002', 'NHR-1002', 'b0eebc99-0002-4ef8-bb6d-6bb9bd380a02', 'Priya',   'Sharma',  'priya.sharma@nexushr.com',   '+91-9876543211', '1988-03-22', 'FEMALE', 'd1000001-0000-0000-0000-000000000002', 'HR Manager',           130000.00, '2019-05-01', 'ACTIVE'),
    ('e1000001-0000-0000-0000-000000000003', 'NHR-1003', 'b0eebc99-0003-4ef8-bb6d-6bb9bd380a03', 'Amit',    'Patel',   'amit.patel@nexushr.com',     '+91-9876543212', '1990-11-10', 'MALE',   'd1000001-0000-0000-0000-000000000003', 'Finance Manager',      140000.00, '2020-08-20', 'ACTIVE');

-- Assign department managers
UPDATE departments SET manager_id = 'e1000001-0000-0000-0000-000000000001' WHERE code = 'ENG';
UPDATE departments SET manager_id = 'e1000001-0000-0000-0000-000000000002' WHERE code = 'HR';
UPDATE departments SET manager_id = 'e1000001-0000-0000-0000-000000000003' WHERE code = 'FIN';

-- Insert demo employee user accounts
INSERT INTO users (id, first_name, last_name, email, password, active, email_verified) VALUES
    ('b0eebc99-0004-4ef8-bb6d-6bb9bd380a04', 'Sneha',   'Reddy',    'sneha.reddy@nexushr.com',     '$2b$10$H3/awTROlL8ZOVt4W8I1s.DV4UIO7HNcWsOg8zddvhqxK6cj6ouRK', TRUE, TRUE),
    ('b0eebc99-0005-4ef8-bb6d-6bb9bd380a05', 'Vikram',  'Singh',    'vikram.singh@nexushr.com',    '$2b$10$H3/awTROlL8ZOVt4W8I1s.DV4UIO7HNcWsOg8zddvhqxK6cj6ouRK', TRUE, TRUE),
    ('b0eebc99-0006-4ef8-bb6d-6bb9bd380a06', 'Ananya',  'Gupta',    'ananya.gupta@nexushr.com',    '$2b$10$H3/awTROlL8ZOVt4W8I1s.DV4UIO7HNcWsOg8zddvhqxK6cj6ouRK', TRUE, TRUE),
    ('b0eebc99-0007-4ef8-bb6d-6bb9bd380a07', 'Rohit',   'Verma',    'rohit.verma@nexushr.com',     '$2b$10$H3/awTROlL8ZOVt4W8I1s.DV4UIO7HNcWsOg8zddvhqxK6cj6ouRK', TRUE, TRUE),
    ('b0eebc99-0008-4ef8-bb6d-6bb9bd380a08', 'Kavita',  'Nair',     'kavita.nair@nexushr.com',     '$2b$10$H3/awTROlL8ZOVt4W8I1s.DV4UIO7HNcWsOg8zddvhqxK6cj6ouRK', TRUE, TRUE);

-- Assign EMPLOYEE role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r
WHERE u.email IN ('sneha.reddy@nexushr.com','vikram.singh@nexushr.com','ananya.gupta@nexushr.com','rohit.verma@nexushr.com','kavita.nair@nexushr.com')
AND r.name = 'ROLE_EMPLOYEE';

-- Insert demo employees (regular)
INSERT INTO employees (id, employee_id, user_id, first_name, last_name, email, phone, date_of_birth, gender, department_id, designation, salary, joining_date, manager_id, status) VALUES
    ('e1000001-0000-0000-0000-000000000004', 'NHR-1004', 'b0eebc99-0004-4ef8-bb6d-6bb9bd380a04', 'Sneha',  'Reddy',  'sneha.reddy@nexushr.com',    '+91-9876543213', '1993-07-08', 'FEMALE', 'd1000001-0000-0000-0000-000000000001', 'Senior Software Engineer', 110000.00, '2021-03-10', 'e1000001-0000-0000-0000-000000000001', 'ACTIVE'),
    ('e1000001-0000-0000-0000-000000000005', 'NHR-1005', 'b0eebc99-0005-4ef8-bb6d-6bb9bd380a05', 'Vikram', 'Singh',  'vikram.singh@nexushr.com',   '+91-9876543214', '1992-01-25', 'MALE',   'd1000001-0000-0000-0000-000000000001', 'Software Engineer',        90000.00, '2022-06-15', 'e1000001-0000-0000-0000-000000000001', 'ACTIVE'),
    ('e1000001-0000-0000-0000-000000000006', 'NHR-1006', 'b0eebc99-0006-4ef8-bb6d-6bb9bd380a06', 'Ananya', 'Gupta',  'ananya.gupta@nexushr.com',   '+91-9876543215', '1995-09-14', 'FEMALE', 'd1000001-0000-0000-0000-000000000002', 'HR Executive',             75000.00, '2022-01-05', 'e1000001-0000-0000-0000-000000000002', 'ACTIVE'),
    ('e1000001-0000-0000-0000-000000000007', 'NHR-1007', 'b0eebc99-0007-4ef8-bb6d-6bb9bd380a07', 'Rohit',  'Verma',  'rohit.verma@nexushr.com',    '+91-9876543216', '1991-12-03', 'MALE',   'd1000001-0000-0000-0000-000000000003', 'Financial Analyst',        95000.00, '2021-09-20', 'e1000001-0000-0000-0000-000000000003', 'ACTIVE'),
    ('e1000001-0000-0000-0000-000000000008', 'NHR-1008', 'b0eebc99-0008-4ef8-bb6d-6bb9bd380a08', 'Kavita', 'Nair',   'kavita.nair@nexushr.com',    '+91-9876543217', '1994-04-18', 'FEMALE', 'd1000001-0000-0000-0000-000000000001', 'QA Engineer',              80000.00, '2023-02-14', 'e1000001-0000-0000-0000-000000000001', 'ACTIVE');

-- Update sequence to start after seeded IDs
SELECT setval('employee_id_seq', 1008);
