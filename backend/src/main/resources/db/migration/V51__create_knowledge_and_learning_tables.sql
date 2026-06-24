-- V50__create_knowledge_and_learning_tables.sql
-- Phase 3: Knowledge & Learning Module

-- Learning Center Tables
CREATE TABLE courses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(255) NOT NULL,
    category        VARCHAR(100) NOT NULL,
    duration        VARCHAR(50),
    total_modules   INTEGER DEFAULT 0,
    thumbnail       VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_enrollments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    status          VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED
    progress        INTEGER DEFAULT 0,
    due_date        TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, employee_id)
);

CREATE INDEX idx_course_enrollments_employee ON course_enrollments(employee_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);

-- Onboarding Manager Tables
CREATE TABLE product_tours (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tour_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id         UUID NOT NULL REFERENCES product_tours(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    target_selector VARCHAR(255) NOT NULL,
    step_order      INTEGER NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tour_steps_tour ON tour_steps(tour_id);

-- Seed Initial Data for Courses
INSERT INTO courses (title, category, duration, total_modules, thumbnail) VALUES
('Information Security Fundamentals', 'Mandatory Compliance', '45 mins', 5, 'bg-gradient-to-br from-blue-900 to-indigo-900'),
('Anti-Harassment Training 2026', 'Mandatory Compliance', '60 mins', 4, 'bg-gradient-to-br from-emerald-900 to-teal-900'),
('Advanced Leadership Principles', 'Professional Development', '3 hours', 12, 'bg-gradient-to-br from-purple-900 to-fuchsia-900');

-- Seed Initial Data for Product Tours
INSERT INTO product_tours (name, description, is_active) VALUES
('New Employee Welcome Tour', 'Guides new hires through their dashboard and immediate tasks.', TRUE),
('How to Submit an Expense', 'A quick 3-step guide on creating and submitting an expense report.', FALSE);

-- Seed Initial Data for Tour Steps
WITH welcome_tour AS (SELECT id FROM product_tours WHERE name = 'New Employee Welcome Tour')
INSERT INTO tour_steps (tour_id, title, content, target_selector, step_order)
SELECT id, 'Welcome to NexusHR', 'This is your central hub for everything work-related.', '#dashboard-header', 1 FROM welcome_tour
UNION ALL
SELECT id, 'Pending Tasks', 'Here you will find items requiring your attention, like signing documents.', '#pending-tasks', 2 FROM welcome_tour;
