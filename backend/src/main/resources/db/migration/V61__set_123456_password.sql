-- =============================================
-- V61: Set universal correct password hash
-- =============================================

-- Ensure ALL passwords are exactly 123456 with a confirmed Java BCrypt $2a$ format
UPDATE users 
SET password = '$2a$10$Agaf73jpieYnC7.uXZWULuLVxmlyfZbmfgsOXAcmcRIvjmOxbPBeq';
