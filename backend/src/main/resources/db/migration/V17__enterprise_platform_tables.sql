-- =============================================
-- V17: Enterprise platform tables
-- Feature flags, knowledge base, releases,
-- onboarding tours, workforce planning
-- =============================================

-- Feature Flags
CREATE TABLE feature_flags (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flag_key            VARCHAR(100) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    is_enabled          BOOLEAN DEFAULT FALSE NOT NULL,
    rollout_percentage  INTEGER DEFAULT 100 CHECK (rollout_percentage BETWEEN 0 AND 100),
    environment         VARCHAR(50) DEFAULT 'production',
    flag_type           VARCHAR(20) DEFAULT 'BOOLEAN',
    allowed_roles       TEXT[],
    allowed_tenants     TEXT[],
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at          TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

-- Knowledge Base Articles
CREATE TABLE knowledge_articles (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    slug            VARCHAR(500) NOT NULL UNIQUE,
    content         TEXT NOT NULL,
    category        VARCHAR(100) NOT NULL,
    tags            TEXT[],
    author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    status          VARCHAR(20) DEFAULT 'PUBLISHED',
    views           INTEGER DEFAULT 0,
    helpful_count   INTEGER DEFAULT 0,
    unhelpful_count INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_article_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);

CREATE INDEX idx_knowledge_articles_category ON knowledge_articles(category);
CREATE INDEX idx_knowledge_articles_status ON knowledge_articles(status);
CREATE INDEX idx_knowledge_articles_slug ON knowledge_articles(slug);
CREATE INDEX idx_knowledge_articles_search ON knowledge_articles USING gin(to_tsvector('english', title || ' ' || coalesce(content, '')));

-- Release Notes
CREATE TABLE release_notes (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version         VARCHAR(50) NOT NULL,
    title           VARCHAR(500) NOT NULL,
    release_type    VARCHAR(20) NOT NULL,
    description     TEXT,
    changes         JSONB DEFAULT '[]',
    published_at    TIMESTAMP WITH TIME ZONE,
    is_published    BOOLEAN DEFAULT FALSE,
    author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_release_type CHECK (release_type IN ('MAJOR', 'MINOR', 'PATCH', 'HOTFIX', 'SECURITY'))
);

CREATE INDEX idx_release_notes_version ON release_notes(version);
CREATE INDEX idx_release_notes_published ON release_notes(is_published, published_at DESC);

-- Onboarding Tours
CREATE TABLE onboarding_tours (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    target_roles    TEXT[] DEFAULT '{}',
    steps           JSONB DEFAULT '[]',
    is_active       BOOLEAN DEFAULT TRUE,
    completion_count INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Track which users completed which tours
CREATE TABLE onboarding_tour_completions (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id     UUID NOT NULL REFERENCES onboarding_tours(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(tour_id, user_id)
);

-- Workforce Scenarios
CREATE TABLE workforce_scenarios (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    org_chart       JSONB DEFAULT '{}',
    headcount_delta INTEGER DEFAULT 0,
    budget_delta    NUMERIC(15,2) DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'DRAFT',
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_scenario_status CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'ARCHIVED'))
);

CREATE INDEX idx_scenarios_status ON workforce_scenarios(status);
CREATE INDEX idx_scenarios_created_by ON workforce_scenarios(created_by);

-- Succession Planning
CREATE TABLE succession_roles (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    incumbent_id    UUID REFERENCES employees(id) ON DELETE SET NULL,
    incumbent_risk  VARCHAR(10) DEFAULT 'LOW',
    is_critical     BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_incumbent_risk CHECK (incumbent_risk IN ('LOW', 'MEDIUM', 'HIGH'))
);

CREATE TABLE succession_bench (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id         UUID NOT NULL REFERENCES succession_roles(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    readiness       VARCHAR(20) NOT NULL DEFAULT 'READY_3_YEARS',
    flight_risk     VARCHAR(10) DEFAULT 'LOW',
    rank            INTEGER DEFAULT 1,
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    UNIQUE(role_id, employee_id),
    CONSTRAINT chk_readiness CHECK (readiness IN ('READY_NOW', 'READY_1_YEAR', 'READY_3_YEARS')),
    CONSTRAINT chk_flight_risk CHECK (flight_risk IN ('LOW', 'MEDIUM', 'HIGH'))
);

CREATE INDEX idx_succession_bench_role ON succession_bench(role_id);
CREATE INDEX idx_succession_bench_employee ON succession_bench(employee_id);

-- Compensation Planning
CREATE TABLE compensation_cycles (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    fiscal_year     INTEGER NOT NULL,
    total_budget    NUMERIC(15,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'DRAFT',
    submitted_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    CONSTRAINT chk_cycle_status CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'COMPLETED'))
);

CREATE TABLE compensation_proposals (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cycle_id            UUID NOT NULL REFERENCES compensation_cycles(id) ON DELETE CASCADE,
    employee_id         UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    current_salary      NUMERIC(15,2) NOT NULL,
    proposed_increase   NUMERIC(5,2) DEFAULT 0, -- Percentage
    proposed_bonus      NUMERIC(15,2) DEFAULT 0,
    performance_score   NUMERIC(3,1),
    compa_ratio         NUMERIC(5,3),
    band_min            NUMERIC(15,2),
    band_max            NUMERIC(15,2),
    justification       TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    UNIQUE(cycle_id, employee_id)
);

CREATE INDEX idx_comp_proposals_cycle ON compensation_proposals(cycle_id);
CREATE INDEX idx_comp_proposals_employee ON compensation_proposals(employee_id);

-- Seed default feature flags
INSERT INTO feature_flags (flag_key, name, description, is_enabled, rollout_percentage, environment) VALUES
('ai_insights', 'AI Insights Panel', 'Enable AI-powered workforce insights on dashboards', TRUE, 100, 'production'),
('advanced_analytics', 'Advanced Analytics', 'Enable advanced analytics charts and reports', TRUE, 100, 'production'),
('realtime_notifications', 'Real-time Notifications', 'WebSocket-based live notifications', TRUE, 100, 'production'),
('workforce_forecasting', 'Workforce Forecasting', 'AI-driven headcount forecasting engine', TRUE, 80, 'production'),
('succession_planning', 'Succession Planning Module', 'Enable succession bench management', TRUE, 100, 'production'),
('compensation_planning', 'Compensation Planning', 'Merit cycle and comp band management', FALSE, 0, 'production'),
('beta_org_chart', 'Interactive Org Chart', 'New drag-and-drop org chart (beta)', FALSE, 10, 'production'),
('dark_mode_v2', 'Dark Mode V2', 'Updated dark theme with improved contrast', TRUE, 100, 'production');
