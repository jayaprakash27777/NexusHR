CREATE TABLE report_history (
    id UUID PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL,
    generated_by UUID REFERENCES users(id),
    file_url VARCHAR(255),
    format VARCHAR(20) NOT NULL,
    filters_json TEXT,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_schedules (
    id UUID PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    cron_expression VARCHAR(100) NOT NULL,
    format VARCHAR(20) NOT NULL,
    filters_json TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_report_history_type ON report_history(report_type);
CREATE INDEX idx_report_history_generated_by ON report_history(generated_by);
CREATE INDEX idx_report_schedules_user_id ON report_schedules(user_id);
