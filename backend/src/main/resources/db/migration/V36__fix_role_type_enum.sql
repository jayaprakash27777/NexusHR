-- =============================================
-- V36: Fix role_type enum mismatch
-- =============================================

UPDATE roles SET role_type = 'SYSTEM_ADMIN' WHERE role_type = 'SYSTEM';
