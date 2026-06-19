-- Prepare for multi-tenancy
ALTER TABLE users ADD COLUMN tenant_id UUID NULL;
ALTER TABLE delegations ADD COLUMN tenant_id UUID NULL;

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_delegations_tenant_id ON delegations(tenant_id);
