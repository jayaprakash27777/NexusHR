-- Add missing columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_type VARCHAR(255);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pan_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS pf_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS esi_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS uan_number VARCHAR(50);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS permanent_address TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100);
