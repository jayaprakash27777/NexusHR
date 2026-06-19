ALTER TABLE chat_messages
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN deleted_at TIMESTAMP;

CREATE TABLE chat_message_deletions (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL,
    deleted_by UUID NOT NULL,
    deleted_at TIMESTAMP NOT NULL,
    reason VARCHAR(255),
    CONSTRAINT fk_message_deletion_message FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_deletion_user FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE CASCADE
);
