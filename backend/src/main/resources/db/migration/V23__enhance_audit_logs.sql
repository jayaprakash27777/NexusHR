-- Add compliance fields to audit_logs

ALTER TABLE audit_logs
ADD COLUMN before_state TEXT,
ADD COLUMN after_state TEXT,
ADD COLUMN user_agent VARCHAR(512),
ADD COLUMN session_id VARCHAR(255),
ADD COLUMN source_module VARCHAR(100),
ADD COLUMN tenant_id UUID,
ADD COLUMN severity VARCHAR(50) DEFAULT 'INFO';

CREATE INDEX idx_audit_logs_source_module ON audit_logs(source_module);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
