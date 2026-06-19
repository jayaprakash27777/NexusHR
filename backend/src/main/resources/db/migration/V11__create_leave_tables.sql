-- =============================================
-- V11: Create leave management tables
-- =============================================

-- Leave requests
CREATE TABLE leave_requests (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type      VARCHAR(30) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    total_days      DECIMAL(4, 1) NOT NULL,
    reason          TEXT NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    approved_by     UUID REFERENCES employees(id) ON DELETE SET NULL,
    reviewer_remarks TEXT,
    applied_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reviewed_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_leave_type CHECK (leave_type IN ('CASUAL_LEAVE', 'SICK_LEAVE', 'EARNED_LEAVE', 'WORK_FROM_HOME')),
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_leave_type ON leave_requests(leave_type);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_approved_by ON leave_requests(approved_by);

-- Leave balances
CREATE TABLE leave_balances (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type      VARCHAR(30) NOT NULL,
    year            INT NOT NULL,
    total_days      DECIMAL(4, 1) NOT NULL DEFAULT 0,
    used_days       DECIMAL(4, 1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_balance_leave_type CHECK (leave_type IN ('CASUAL_LEAVE', 'SICK_LEAVE', 'EARNED_LEAVE', 'WORK_FROM_HOME')),
    CONSTRAINT uq_leave_balance UNIQUE (employee_id, leave_type, year),
    CONSTRAINT chk_used_days CHECK (used_days >= 0)
);

CREATE INDEX idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
