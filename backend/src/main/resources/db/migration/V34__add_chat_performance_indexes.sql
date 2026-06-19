-- Add composite index for paginated message retrieval
CREATE INDEX idx_chat_messages_conv_id_created_at ON chat_messages(conversation_id, created_at DESC);
