ALTER TABLE conversation_participants
ADD COLUMN role VARCHAR(20) DEFAULT 'MEMBER' NOT NULL;

ALTER TABLE conversations
ADD COLUMN department_id UUID;

UPDATE conversations 
SET type = 'PUBLIC_CHANNEL' 
WHERE type = 'TEAM';
