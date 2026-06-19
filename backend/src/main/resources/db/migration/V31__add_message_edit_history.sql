ALTER TABLE chat_messages
ADD COLUMN is_edited BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN edited_at TIMESTAMP;

CREATE TABLE chat_message_edits (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL,
    old_content TEXT,
    new_content TEXT,
    edited_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_message_edit_message FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
);
