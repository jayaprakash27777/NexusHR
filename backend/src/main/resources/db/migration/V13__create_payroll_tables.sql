-- =============================================
-- V13: Create payroll management tables
-- =============================================

-- Tax slabs (for Indian income tax as reference)
CREATE TABLE tax_slabs (
    id              BIGSERIAL PRIMARY KEY,
    min_income      DECIMAL(15, 2) NOT NULL,
    max_income      DECIMAL(15, 2),
    rate            DECIMAL(5, 2) NOT NULL,
    description     VARCHAR(255),
    active          BOOLEAN DEFAULT TRUE NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Payroll records
CREATE TABLE payroll (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id         UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month               INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year                INT NOT NULL,
    basic_salary        DECIMAL(15, 2) NOT NULL DEFAULT 0,
    hra                 DECIMAL(15, 2) NOT NULL DEFAULT 0,
    da                  DECIMAL(15, 2) NOT NULL DEFAULT 0,
    other_allowances    DECIMAL(15, 2) NOT NULL DEFAULT 0,
    gross_salary        DECIMAL(15, 2) NOT NULL DEFAULT 0,
    pf_deduction        DECIMAL(15, 2) NOT NULL DEFAULT 0,
    professional_tax    DECIMAL(15, 2) NOT NULL DEFAULT 0,
    income_tax          DECIMAL(15, 2) NOT NULL DEFAULT 0,
    other_deductions    DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_deductions    DECIMAL(15, 2) NOT NULL DEFAULT 0,
    bonus               DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_salary          DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status              VARCHAR(20) DEFAULT 'DRAFT' NOT NULL,
    processed_at        TIMESTAMP WITH TIME ZONE,
    paid_at             TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_payroll_status CHECK (status IN ('DRAFT', 'PROCESSED', 'PAID')),
    CONSTRAINT uq_payroll_employee_month UNIQUE (employee_id, month, year)
);

CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_month_year ON payroll(month, year);
CREATE INDEX idx_payroll_status ON payroll(status);

-- Payslips (generated PDF metadata)
CREATE TABLE payslips (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payroll_id      UUID NOT NULL REFERENCES payroll(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month           INT NOT NULL,
    year            INT NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    generated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT uq_payslip_payroll UNIQUE (payroll_id)
);

CREATE INDEX idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX idx_payslips_month_year ON payslips(month, year);

-- Seed tax slabs (simplified Indian new tax regime 2024-25)
INSERT INTO tax_slabs (min_income, max_income, rate, description) VALUES
    (0,       300000,   0,    'No tax up to 3 Lakh'),
    (300001,  700000,   5,    '5% for 3L - 7L'),
    (700001,  1000000,  10,   '10% for 7L - 10L'),
    (1000001, 1200000,  15,   '15% for 10L - 12L'),
    (1200001, 1500000,  20,   '20% for 12L - 15L'),
    (1500001, NULL,     30,   '30% above 15L');
