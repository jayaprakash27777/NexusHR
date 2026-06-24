-- =============================================
-- V49: Force Reset Super Admin Password
-- =============================================

UPDATE users 
SET password = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a' 
WHERE email = 'barbara.williams0@nexushr.com';
