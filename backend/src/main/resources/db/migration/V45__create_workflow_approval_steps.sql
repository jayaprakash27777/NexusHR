-- =============================================
-- V45: Create workflow approval steps table
-- =============================================

CREATE TABLE workflow_approval_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    step_number INTEGER NOT NULL,
    approver_id UUID NOT NULL REFERENCES users(id),
    original_approver_id UUID REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_workflow_approval_steps_entity ON workflow_approval_steps(entity_id, entity_type);
CREATE INDEX idx_workflow_approval_steps_approver ON workflow_approval_steps(approver_id);
