-- Add status to chat_messages
ALTER TABLE chat_messages ADD COLUMN status VARCHAR(50) DEFAULT 'SENT' NOT NULL;
