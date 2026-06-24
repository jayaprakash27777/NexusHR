-- =============================================
-- V59: Fix all user passwords to 123456
-- =============================================

-- The previous migrations used an incorrect BCrypt hash.
-- This migration updates ALL users to have the password '123456'
-- using a verified BCrypt hash.

UPDATE users 
SET password = '$2b$10$WyHE95zxrGQcMu5g1RsLdOcxB/WFGPHX1.EskmeFHYNnRewV/IsYm';
