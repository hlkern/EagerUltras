-- Adds read_at column to user_messages for unread message tracking.
-- Run after create_user_chat_tables.sql

ALTER TABLE user_messages
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_user_messages_read_at ON user_messages(read_at) WHERE read_at IS NULL;
