-- =============================================
-- V41: Phase 2 Core HR Features
-- =============================================

-- 1. Shifts Table
CREATE TABLE shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default shifts
INSERT INTO shifts (name, start_time, end_time, description) VALUES
('General Shift', '09:00:00', '18:00:00', 'Standard working hours'),
('Morning Shift', '06:00:00', '15:00:00', 'Early morning shift'),
('Evening Shift', '14:00:00', '23:00:00', 'Evening to night shift'),
('Night Shift', '22:00:00', '07:00:00', 'Overnight shift');

-- 2. Update Employees Table
ALTER TABLE employees 
ADD COLUMN avatar_url VARCHAR(255),
ADD COLUMN shift_id UUID;

-- Set default shift for existing employees
UPDATE employees 
SET shift_id = (SELECT id FROM shifts WHERE name = 'General Shift')
WHERE shift_id IS NULL;

-- Add foreign key for shift_id
ALTER TABLE employees
ADD CONSTRAINT fk_employee_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL;
