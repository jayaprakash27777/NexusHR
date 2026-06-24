-- =============================================
-- V42: Complete Recruitment Module
-- =============================================

-- Add foreign key to candidate if it is to be linked to an internal employee later (optional, but good for internal mobility)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS internal_employee_id UUID REFERENCES employees(id);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id),
    salary NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, ACCEPTED, REJECTED, WITHDRAWN
    file_url VARCHAR(500),
    notes TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Create recruitment_audit_logs table
CREATE TABLE IF NOT EXISTS recruitment_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'CANDIDATE', 'JOB_POSTING', 'APPLICATION', 'INTERVIEW', 'OFFER'
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'CREATED', 'STATUS_CHANGED', 'SCHEDULED'
    action_by VARCHAR(255) NOT NULL, -- Username or 'System'
    details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
