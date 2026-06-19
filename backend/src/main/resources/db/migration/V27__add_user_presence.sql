-- Add presence tracking fields to users table
ALTER TABLE users ADD COLUMN presence_status VARCHAR(20) DEFAULT 'OFFLINE' NOT NULL;
ALTER TABLE users ADD COLUMN last_seen_at TIMESTAMP;
