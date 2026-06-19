-- 1. Augment Existing Roles Table
ALTER TABLE roles ADD COLUMN parent_role_id BIGINT;
ALTER TABLE roles ADD CONSTRAINT fk_parent_role FOREIGN KEY (parent_role_id) REFERENCES roles(id) ON DELETE SET NULL;

ALTER TABLE roles ADD COLUMN tenant_id UUID NULL;
ALTER TABLE roles ADD COLUMN is_system BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE roles ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

UPDATE roles SET is_system = true WHERE name IN ('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE');

-- 2. Create Permissions Table
CREATE TABLE permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(category, action)
);

-- 3. Create Role-Permissions Mapping
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Create Delegations Table
CREATE TABLE delegations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delegator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delegatee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_dates CHECK (end_date > start_date)
);

-- 5. Create Approval Matrix Rules
CREATE TABLE approval_matrix_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NULL,
    category VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    required_role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    approval_level INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Apply Performance Indexes
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_roles_parent_id ON roles(parent_role_id);
CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_delegations_delegatee ON delegations(delegatee_id, status);
CREATE INDEX idx_delegations_active_dates ON delegations(start_date, end_date);
CREATE INDEX idx_approval_matrix_category ON approval_matrix_rules(category, action);
