-- =============================================
-- V15: Create AI insights table
-- =============================================

CREATE TABLE ai_insights (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insight_type    VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    priority        VARCHAR(20) DEFAULT 'MEDIUM' NOT NULL,
    category        VARCHAR(50),
    data_json       TEXT,
    employee_id     UUID REFERENCES employees(id) ON DELETE CASCADE,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_actionable   BOOLEAN DEFAULT FALSE,
    is_dismissed    BOOLEAN DEFAULT FALSE,
    generated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at      TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_insight_type CHECK (insight_type IN (
        'ATTRITION_RISK', 'PERFORMANCE_TREND', 'SALARY_BENCHMARK',
        'WORKFORCE_SUMMARY', 'DEPARTMENT_INSIGHT', 'RECOMMENDATION',
        'ATTENDANCE_ALERT', 'LEAVE_PATTERN'
    )),
    CONSTRAINT chk_insight_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);

CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX idx_ai_insights_employee ON ai_insights(employee_id);
CREATE INDEX idx_ai_insights_department ON ai_insights(department_id);
CREATE INDEX idx_ai_insights_dismissed ON ai_insights(is_dismissed);
