-- =============================================
-- V40: Improve payroll module (Statutory compliance, bank details, multi-currency, reversal)
-- =============================================

-- 1. Add bank details and currency to employees
ALTER TABLE employees 
ADD COLUMN bank_name VARCHAR(100),
ADD COLUMN bank_account_number VARCHAR(50),
ADD COLUMN ifsc_code VARCHAR(20),
ADD COLUMN currency VARCHAR(10) DEFAULT 'INR' NOT NULL;

-- 2. Add ESI and currency to payroll
ALTER TABLE payroll 
ADD COLUMN esi_deduction DECIMAL(15,2) DEFAULT 0 NOT NULL,
ADD COLUMN currency VARCHAR(10) DEFAULT 'INR' NOT NULL;

-- 3. Create salary structures table
CREATE TABLE salary_structures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    basic_salary DECIMAL(15, 2) DEFAULT 0 NOT NULL,
    hra_percentage DECIMAL(5, 2) DEFAULT 0 NOT NULL,
    da_percentage DECIMAL(5, 2) DEFAULT 0 NOT NULL,
    pf_percentage DECIMAL(5, 2) DEFAULT 0 NOT NULL,
    esi_percentage DECIMAL(5, 2) DEFAULT 0 NOT NULL,
    other_allowances DECIMAL(15, 2) DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Update chk_payroll_status to include REVERSED (and ensure APPROVED, LOCKED are present if missing)
ALTER TABLE payroll DROP CONSTRAINT IF EXISTS chk_payroll_status;
ALTER TABLE payroll ADD CONSTRAINT chk_payroll_status CHECK (status IN ('DRAFT', 'PROCESSED', 'APPROVED', 'LOCKED', 'PAID', 'REVERSED', 'FAILED'));

-- 5. Create payroll_audit_logs table
CREATE TABLE payroll_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    action VARCHAR(255) NOT NULL,
    action_by VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Add created_at and updated_at to payslips table
ALTER TABLE payslips 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
