-- =============================================
-- V6: Seed initial roles and admin user
-- =============================================

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('ROLE_ADMIN',    'System Administrator with full access'),
    ('ROLE_MANAGER',  'Department Manager with team management access'),
    ('ROLE_EMPLOYEE', 'Regular Employee with self-service access');

-- Insert default admin user
-- Password: Admin@123 (BCrypt encoded)
INSERT INTO users (id, first_name, last_name, email, password, active, email_verified)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'System',
    'Administrator',
    'admin@nexushr.com',
    '$2b$10$ZOzD4VQPsuPbcjCVNETtaunmw4/VcgCsOPtEL.aEq0pdr9O.T/lRi',
    TRUE,
    TRUE
);

-- Assign ADMIN role to the admin user
INSERT INTO user_roles (user_id, role_id)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', id
FROM roles
WHERE name = 'ROLE_ADMIN';
