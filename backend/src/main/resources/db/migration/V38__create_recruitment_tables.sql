-- =============================================
-- V38: Create Recruitment Tables
-- =============================================

CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id),
    location VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    description TEXT,
    requirements TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    resume_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    CONSTRAINT uk_application_candidate_job UNIQUE (candidate_id, job_posting_id)
);

CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES job_applications(id),
    interviewer_id UUID REFERENCES employees(id),
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Initial seed data for Recruitment Dashboard demo
INSERT INTO job_postings (id, title, department_id, location, status, description)
SELECT '11111111-1111-1111-1111-111111111111', 'Senior Full Stack Engineer', id, 'Remote', 'OPEN', 'Looking for an experienced engineer to join our team.'
FROM departments WHERE code = 'ENG' LIMIT 1;

INSERT INTO job_postings (id, title, department_id, location, status, description)
SELECT '22222222-2222-2222-2222-222222222222', 'Product Manager', id, 'New York, NY', 'OPEN', 'Looking for a product manager to lead our new initiative.'
FROM departments WHERE code = 'PRD' LIMIT 1;

-- Seed Candidates
INSERT INTO candidates (id, first_name, last_name, email, phone) VALUES
    ('33333333-3333-3333-3333-333333333333', 'John', 'Doe', 'john.doe@example.com', '555-0100'),
    ('44444444-4444-4444-4444-444444444444', 'Jane', 'Smith', 'jane.smith@example.com', '555-0101'),
    ('55555555-5555-5555-5555-555555555555', 'Mike', 'Johnson', 'mike.j@example.com', '555-0102'),
    ('66666666-6666-6666-6666-666666666666', 'Sarah', 'Williams', 'sarah.w@example.com', '555-0103');

-- Seed Applications
INSERT INTO job_applications (id, candidate_id, job_posting_id, status) VALUES
    ('77777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'NEW'),
    ('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'SCREENING'),
    ('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'INTERVIEW'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'OFFERED');

-- Seed Permissions for Recruitment
INSERT INTO permissions (id, category, action, description) VALUES
    (gen_random_uuid(), 'RECRUITMENT', 'READ', 'View recruitment dashboard and pipelines'),
    (gen_random_uuid(), 'RECRUITMENT', 'CREATE', 'Create job postings'),
    (gen_random_uuid(), 'RECRUITMENT', 'UPDATE', 'Update applications and pipelines'),
    (gen_random_uuid(), 'RECRUITMENT', 'DELETE', 'Delete candidates or postings');

-- Map Recruitment to Super Admin and HR Director
INSERT INTO role_permissions (role_id, permission_id, assigned_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP FROM roles r, permissions p
WHERE r.name IN ('ROLE_SUPER_ADMIN', 'ROLE_HR_DIRECTOR')
AND p.category = 'RECRUITMENT';
