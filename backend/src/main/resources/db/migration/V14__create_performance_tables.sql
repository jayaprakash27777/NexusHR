-- =============================================
-- V14: Create performance management tables
-- =============================================

-- Performance review cycles
CREATE TABLE performance_reviews (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id         UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id         UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_period       VARCHAR(50) NOT NULL,
    year                INT NOT NULL,
    overall_rating      DECIMAL(3, 1),
    self_rating         DECIMAL(3, 1),
    manager_rating      DECIMAL(3, 1),
    strengths           TEXT,
    improvements        TEXT,
    manager_comments    TEXT,
    employee_comments   TEXT,
    status              VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    due_date            DATE,
    completed_at        TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_review_status CHECK (status IN ('PENDING', 'SELF_REVIEW', 'MANAGER_REVIEW', 'COMPLETED', 'ACKNOWLEDGED')),
    CONSTRAINT chk_review_period CHECK (review_period IN ('Q1', 'Q2', 'Q3', 'Q4', 'HALF_YEARLY', 'ANNUAL')),
    CONSTRAINT chk_rating_range CHECK (overall_rating IS NULL OR (overall_rating >= 1.0 AND overall_rating <= 5.0)),
    CONSTRAINT uq_review_employee_period UNIQUE (employee_id, review_period, year)
);

CREATE INDEX idx_perf_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX idx_perf_reviews_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_perf_reviews_status ON performance_reviews(status);
CREATE INDEX idx_perf_reviews_year ON performance_reviews(year);

-- Performance goals / KPIs
CREATE TABLE performance_goals (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_id       UUID REFERENCES performance_reviews(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) DEFAULT 'GENERAL' NOT NULL,
    target_value    VARCHAR(100),
    achieved_value  VARCHAR(100),
    weight          DECIMAL(5, 2) DEFAULT 0 NOT NULL,
    self_score      DECIMAL(3, 1),
    manager_score   DECIMAL(3, 1),
    status          VARCHAR(20) DEFAULT 'NOT_STARTED' NOT NULL,
    due_date        DATE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_goal_status CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_goal_category CHECK (category IN ('GENERAL', 'TECHNICAL', 'LEADERSHIP', 'COMMUNICATION', 'TEAMWORK', 'INNOVATION')),
    CONSTRAINT chk_goal_weight CHECK (weight >= 0 AND weight <= 100),
    CONSTRAINT chk_self_score CHECK (self_score IS NULL OR (self_score >= 1.0 AND self_score <= 5.0)),
    CONSTRAINT chk_manager_score CHECK (manager_score IS NULL OR (manager_score >= 1.0 AND manager_score <= 5.0))
);

CREATE INDEX idx_perf_goals_employee ON performance_goals(employee_id);
CREATE INDEX idx_perf_goals_review ON performance_goals(review_id);
CREATE INDEX idx_perf_goals_status ON performance_goals(status);
CREATE INDEX idx_perf_goals_category ON performance_goals(category);
