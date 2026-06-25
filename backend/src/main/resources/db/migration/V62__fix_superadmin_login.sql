-- =============================================
-- V62: Definitive fix for Super Admin password
-- =============================================

-- Ensure superadmin@nexushr.com exists and has the correct BCrypt password (123456)
UPDATE users 
SET password = '$2a$10$CHBeolrkq4M3nYk3rayhbegWeQtFMOzwqWkhqcnoblUjN8cA/OWrK'
WHERE email = 'superadmin@nexushr.com';
