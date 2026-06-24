-- =============================================
-- V39: Create Documents and Organization Settings
-- =============================================

-- Organization Settings
CREATE TABLE organization_settings (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE,
    setting_value   TEXT NOT NULL,
    setting_type    VARCHAR(50) DEFAULT 'STRING',
    description     TEXT,
    is_public       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_org_settings_key ON organization_settings(setting_key);

-- Insert default settings
INSERT INTO organization_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('company_name', 'NexusHR Inc.', 'STRING', 'The name of the organization', true),
('company_logo', '/images/logo.png', 'STRING', 'URL to the company logo', true),
('default_timezone', 'UTC', 'STRING', 'Default timezone for the organization', false),
('theme_color', '#3B82F6', 'STRING', 'Primary brand color', true),
('max_upload_size_mb', '25', 'INTEGER', 'Maximum file upload size in MB', false);

-- Documents Management
CREATE TABLE documents (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    file_url        VARCHAR(1000) NOT NULL,
    file_type       VARCHAR(100) NOT NULL,
    file_size       BIGINT NOT NULL,
    category        VARCHAR(50) NOT NULL,
    owner_id        UUID REFERENCES employees(id) ON DELETE CASCADE,
    uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_category ON documents(category);
