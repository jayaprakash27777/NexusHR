-- =============================================
-- V58: Add Planning and Config Tables
-- =============================================

CREATE TABLE system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id VARCHAR(50) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    description TEXT,
    color_class VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE career_role_nodes (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    role_level VARCHAR(20) NOT NULL,
    track_type VARCHAR(20) NOT NULL, -- 'ic' or 'management'
    base_min NUMERIC(10, 2) NOT NULL,
    base_max NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'current', 'next', 'future'
    description TEXT,
    requirements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed System Configurations
INSERT INTO system_configurations (id, module_id, module_name, icon_name, description, color_class) VALUES
(gen_random_uuid(), 'leave_policies', 'Leave Policies', 'CalendarDays', 'Configure accrual rules, public holidays, and leave types.', 'text-accent-indigo'),
(gen_random_uuid(), 'payroll_rules', 'Payroll Rules', 'Wallet', 'Manage tax brackets, compliance logic, and pay cycles.', 'text-success'),
(gen_random_uuid(), 'workflows', 'Workflow Triggers', 'Workflow', 'Global triggers and webhooks for the automation engine.', 'text-accent-cyan'),
(gen_random_uuid(), 'security', 'Security Settings', 'Lock', 'MFA enforcement, session timeouts, and IP whitelisting.', 'text-warning'),
(gen_random_uuid(), 'policies', 'Company Policies', 'BookOpen', 'Upload handbooks and configure required acknowledgments.', 'text-accent-violet');

-- Seed Career Role Nodes
INSERT INTO career_role_nodes (id, title, role_level, track_type, base_min, base_max, status, description, requirements) VALUES
('1', 'Software Engineer', 'L3', 'ic', 120000, 160000, 'current', 'Develops features and fixes bugs under guidance.', '["Proficiency in React/Node", "Basic system design", "Consistently delivers on sprint goals"]'),
('2', 'Senior Software Eng', 'L4', 'ic', 160000, 210000, 'next', 'Leads complex projects and mentors junior engineers.', '["Advanced system architecture", "Cross-team collaboration", "Mentorship experience"]'),
('3', 'Staff Engineer', 'L5', 'ic', 210000, 280000, 'future', 'Drives technical strategy across multiple teams.', '["Domain expertise", "Architectural leadership", "Business impact alignment"]'),
('4', 'Engineering Manager', 'M1', 'management', 170000, 220000, 'future', 'Manages a team of 5-8 engineers, focusing on delivery and growth.', '["People management skills", "Project delivery", "Performance management"]'),
('5', 'Senior Eng Manager', 'M2', 'management', 220000, 290000, 'future', 'Manages multiple teams or complex domains.', '["Strategic planning", "Organizational design", "Budget management"]');
